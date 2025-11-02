/**
 * Web Scraping Service
 * 
 * Purpose: Fetch live course data from multiple platforms without authentication
 * Platforms:
 * - NPTEL (SWAYAM API - public JSON)
 * - Coursera (RSS feeds)
 * - AWS Educate (public course catalog)
 * - Google Cloud Skills Boost (public catalog)
 * - YouTube educational channels
 * 
 * Features:
 * - No authentication required (uses public APIs/feeds)
 * - Intelligent rate limiting
 * - Error handling with retries
 * - Structured data extraction
 * - Firestore caching (24h TTL)
 */

import { getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

// ===== INTERFACES =====

export interface ScrapedCourse {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: 'NPTEL' | 'Coursera' | 'AWS' | 'GCP' | 'YouTube';
  instructor?: string;
  duration?: string; // e.g., "8 weeks", "40 hours"
  level?: 'beginner' | 'intermediate' | 'advanced';
  skillTags?: string[];
  isFree: boolean;
  rating?: number;
  enrollmentCount?: number;
  thumbnail?: string;
  startDate?: Date;
  endDate?: Date;
  language?: string;
  category?: string;
  addedAt: Date;
}

export interface ScrapeResult {
  platform: string;
  courses: ScrapedCourse[];
  scrapedAt: Date;
  success: boolean;
  error?: string;
}

// ===== CONSTANTS =====

const SCRAPED_COURSES_COLLECTION = 'scrapedCourses';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;

// Platform URLs
const PLATFORM_URLS = {
  NPTEL: 'https://swayam.gov.in/api/courses',
  COURSERA_RSS: 'https://www.coursera.org/sitemap~www~courses.xml',
  AWS_EDUCATE: 'https://www.awseducate.com/api/courses', // Placeholder - needs actual endpoint
  GCP_SKILLS: 'https://www.cloudskillsboost.google/catalog.json', // Public catalog
  YOUTUBE_API: 'https://www.googleapis.com/youtube/v3/search'
};

// ===== HELPER FUNCTIONS =====

/**
 * Delay execution (rate limiting)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper for fetch operations
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) return response;
      
      if (response.status === 429) {
        // Rate limited - wait longer
        console.log(`[Scraper] Rate limited, retry ${i + 1}/${retries}`);
        await delay(RATE_LIMIT_DELAY * (i + 1));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`[Scraper] Fetch failed, retry ${i + 1}/${retries}:`, error);
      await delay(RATE_LIMIT_DELAY);
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Check if cache is stale
 */
async function isCacheStale(platform: string, maxAge = CACHE_TTL_MS): Promise<boolean> {
  try {
    const db = getFirestore(getApp());
    const cacheDocRef = doc(db, 'cache', `scraper_${platform.toLowerCase()}`);
    const cacheDoc = await getDoc(cacheDocRef);

    if (!cacheDoc.exists()) return true;

    const lastUpdated = cacheDoc.data().lastUpdated?.toDate();
    if (!lastUpdated) return true;

    return Date.now() - lastUpdated.getTime() > maxAge;
  } catch (error) {
    console.error('[Scraper] Error checking cache:', error);
    return true;
  }
}

/**
 * Update cache timestamp
 */
async function updateCacheTimestamp(platform: string): Promise<void> {
  try {
    const db = getFirestore(getApp());
    await setDoc(doc(db, 'cache', `scraper_${platform.toLowerCase()}`), {
      lastUpdated: Timestamp.now(),
      platform
    }, { merge: true });
  } catch (error) {
    console.error('[Scraper] Error updating cache timestamp:', error);
  }
}

// ===== PLATFORM-SPECIFIC SCRAPERS =====

/**
 * Scrape NPTEL courses from SWAYAM API
 */
export async function scrapeNPTELCourses(): Promise<ScrapedCourse[]> {
  try {
    console.log('[NPTEL] Starting scrape...');
    
    // SWAYAM API endpoint (public, no auth needed)
    const response = await fetchWithRetry('https://swayam.gov.in/api/v1/courses?category=NPTEL');
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.log('[NPTEL] No courses found');
      return [];
    }

    const courses: ScrapedCourse[] = data.results.map((course: any) => ({
      id: `nptel_${course.id || Date.now()}`,
      title: course.title || 'Untitled Course',
      description: course.description || course.excerpt || '',
      url: course.url || `https://swayam.gov.in/nd1_noc23_${course.id}`,
      platform: 'NPTEL' as const,
      instructor: course.instructor || course.coordinator,
      duration: course.duration || `${course.weeks || 12} weeks`,
      level: mapLevel(course.level),
      skillTags: course.tags || course.keywords?.split(',') || [],
      isFree: true, // NPTEL courses are free
      rating: course.rating,
      enrollmentCount: course.enrolled,
      thumbnail: course.thumbnail || course.image,
      startDate: course.start_date ? new Date(course.start_date) : undefined,
      endDate: course.end_date ? new Date(course.end_date) : undefined,
      language: course.language || 'English',
      category: course.category || 'Engineering',
      addedAt: new Date()
    }));

    console.log(`[NPTEL] Scraped ${courses.length} courses`);
    return courses;

  } catch (error) {
    console.error('[NPTEL] Scraping error:', error);
    return [];
  }
}

/**
 * Scrape Coursera courses from RSS feed
 */
export async function scrapeCoursera(): Promise<ScrapedCourse[]> {
  try {
    console.log('[Coursera] Starting scrape...');
    
    // Use Coursera's public sitemap (XML feed)
    const response = await fetchWithRetry('https://www.coursera.org/sitemap~www~courses.xml');
    const xmlText = await response.text();

    // Parse XML manually (simple regex since we just need URLs)
    const urlMatches = xmlText.matchAll(/<loc>(.*?)<\/loc>/g);
    const courseUrls = Array.from(urlMatches).map(match => match[1]).slice(0, 50); // Limit to 50

    if (courseUrls.length === 0) {
      console.log('[Coursera] No courses found');
      return [];
    }

    // For demo, create basic course objects from URLs
    // In production, you'd fetch each course page and parse details
    const courses: ScrapedCourse[] = courseUrls.map((url, index) => {
      const slug = url.split('/').pop() || 'untitled';
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      return {
        id: `coursera_${Date.now()}_${index}`,
        title,
        description: `Coursera course: ${title}`,
        url,
        platform: 'Coursera' as const,
        isFree: false, // Most Coursera courses require payment
        skillTags: [slug],
        language: 'English',
        addedAt: new Date()
      };
    });

    console.log(`[Coursera] Scraped ${courses.length} courses`);
    return courses;

  } catch (error) {
    console.error('[Coursera] Scraping error:', error);
    return [];
  }
}

/**
 * Scrape AWS Educate courses
 */
export async function scrapeAWSEducate(): Promise<ScrapedCourse[]> {
  try {
    console.log('[AWS] Starting scrape...');
    
    // AWS Skill Builder public catalog
    // Note: AWS doesn't have a simple public API, so we use their RSS feed
    const response = await fetchWithRetry('https://aws.amazon.com/training/rss/');
    const xmlText = await response.text();

    // Parse RSS feed
    // Note: Using separate regex without 's' flag for broader compatibility
    const items: string[] = [];
    let startIndex = 0;
    
    while (true) {
      const startTag = xmlText.indexOf('<item>', startIndex);
      if (startTag === -1) break;
      
      const endTag = xmlText.indexOf('</item>', startTag);
      if (endTag === -1) break;
      
      items.push(xmlText.substring(startTag, endTag + 7));
      startIndex = endTag + 7;
    }
    
    const courses: ScrapedCourse[] = [];

    for (const itemMatch of items) {
      const title = itemMatch.match(/<title>(.*?)<\/title>/)?.[1] || 'Untitled';
      const link = itemMatch.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = itemMatch.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const pubDate = itemMatch.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

      courses.push({
        id: `aws_${Date.now()}_${courses.length}`,
        title,
        description: description.replace(/<[^>]*>/g, ''), // Strip HTML
        url: link,
        platform: 'AWS' as const,
        isFree: title.toLowerCase().includes('free'),
        skillTags: extractSkillTags(title + ' ' + description),
        language: 'English',
        startDate: pubDate ? new Date(pubDate) : undefined,
        addedAt: new Date()
      });

      if (courses.length >= 30) break; // Limit to 30 courses
    }

    console.log(`[AWS] Scraped ${courses.length} courses`);
    return courses;

  } catch (error) {
    console.error('[AWS] Scraping error:', error);
    return [];
  }
}

/**
 * Scrape Google Cloud Skills Boost
 */
export async function scrapeGCPSkills(): Promise<ScrapedCourse[]> {
  try {
    console.log('[GCP] Starting scrape...');
    
    // Google Cloud Skills Boost has a public catalog page
    // We'll fetch the page and parse course cards
    const response = await fetchWithRetry('https://www.cloudskillsboost.google/catalog');
    const html = await response.text();

    // Simple regex to extract course titles and links
    // In production, use a proper HTML parser like Cheerio
    const courseRegex = /href="(\/[^"]*?quests\/[^"]+)"[^>]*>([^<]+)</g;
    const matches = html.match(courseRegex) || [];
    const courses: ScrapedCourse[] = [];

    for (const matchString of matches) {
      const pathMatch = matchString.match(/href="([^"]+)"/);
      const titleMatch = matchString.match(/>([^<]+)</);
      
      if (!pathMatch || !titleMatch) continue;
      
      const path = pathMatch[1];
      const title = titleMatch[1].trim();

      courses.push({
        id: `gcp_${Date.now()}_${courses.length}`,
        title,
        description: `Google Cloud Skills Boost: ${title}`,
        url: `https://www.cloudskillsboost.google${path}`,
        platform: 'GCP' as const,
        isFree: true, // Many GCP quests have free tier
        skillTags: extractSkillTags(title),
        language: 'English',
        addedAt: new Date()
      });

      if (courses.length >= 30) break;
    }

    console.log(`[GCP] Scraped ${courses.length} courses`);
    return courses;

  } catch (error) {
    console.error('[GCP] Scraping error:', error);
    return [];
  }
}

/**
 * Search YouTube for educational content
 */
export async function scrapeYouTubeEducational(topic: string): Promise<ScrapedCourse[]> {
  try {
    console.log('[YouTube] Starting scrape for topic:', topic);
    
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.log('[YouTube] No API key configured, skipping');
      return [];
    }

    const url = `https://www.googleapis.com/youtube/v3/search?` + new URLSearchParams({
      part: 'snippet',
      q: `${topic} tutorial free course`,
      type: 'video',
      videoDuration: 'long', // Only long videos (courses)
      maxResults: '20',
      key: apiKey
    });

    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('[YouTube] No videos found');
      return [];
    }

    const courses: ScrapedCourse[] = data.items.map((item: any) => ({
      id: `youtube_${item.id.videoId}`,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      platform: 'YouTube' as const,
      instructor: item.snippet.channelTitle,
      isFree: true,
      thumbnail: item.snippet.thumbnails?.high?.url,
      skillTags: extractSkillTags(item.snippet.title + ' ' + item.snippet.description),
      language: 'English',
      addedAt: new Date()
    }));

    console.log(`[YouTube] Scraped ${courses.length} videos`);
    return courses;

  } catch (error) {
    console.error('[YouTube] Scraping error:', error);
    return [];
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Map various level strings to standardized levels
 */
function mapLevel(level?: string): 'beginner' | 'intermediate' | 'advanced' | undefined {
  if (!level) return undefined;
  const lower = level.toLowerCase();
  if (lower.includes('begin') || lower.includes('intro')) return 'beginner';
  if (lower.includes('adv') || lower.includes('expert')) return 'advanced';
  if (lower.includes('inter') || lower.includes('medium')) return 'intermediate';
  return undefined;
}

/**
 * Extract skill tags from text
 */
function extractSkillTags(text: string): string[] {
  const keywords = [
    'python', 'java', 'javascript', 'react', 'nodejs', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'machine learning', 'ai', 'data science', 'sql', 'mongodb', 'cloud',
    'devops', 'web development', 'mobile', 'android', 'ios', 'cybersecurity'
  ];

  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword));
}

// ===== CACHING FUNCTIONS =====

/**
 * Cache scraped courses to Firestore
 */
export async function cacheScrapedCourses(courses: ScrapedCourse[], platform: string): Promise<void> {
  if (!courses || courses.length === 0) {
    console.log(`[${platform}] No courses to cache`);
    return;
  }

  try {
    const db = getFirestore(getApp());
    const coursesCollection = collection(db, SCRAPED_COURSES_COLLECTION);

    // Check for duplicates
    const existingQuery = query(
      coursesCollection,
      where('url', 'in', courses.map(c => c.url))
    );
    const existingDocs = await getDocs(existingQuery);
    const existingUrls = new Set(existingDocs.docs.map(doc => doc.data().url));

    const newCourses = courses.filter(c => !existingUrls.has(c.url));

    if (newCourses.length === 0) {
      console.log(`[${platform}] All courses already cached`);
      return;
    }

    // Store new courses
    const promises = newCourses.map(course =>
      addDoc(coursesCollection, {
        ...course,
        addedAt: Timestamp.fromDate(course.addedAt),
        startDate: course.startDate ? Timestamp.fromDate(course.startDate) : null,
        endDate: course.endDate ? Timestamp.fromDate(course.endDate) : null
      })
    );

    await Promise.all(promises);
    await updateCacheTimestamp(platform);

    console.log(`[${platform}] Cached ${newCourses.length} new courses`);

  } catch (error) {
    console.error(`[${platform}] Error caching courses:`, error);
  }
}

/**
 * Get cached courses from Firestore
 */
export async function getCachedCourses(
  platform?: string,
  maxAge = CACHE_TTL_MS
): Promise<ScrapedCourse[]> {
  try {
    if (platform && await isCacheStale(platform, maxAge)) {
      console.log(`[${platform}] Cache is stale`);
      return [];
    }

    const db = getFirestore(getApp());
    const coursesCollection = collection(db, SCRAPED_COURSES_COLLECTION);

    const q = platform
      ? query(coursesCollection, where('platform', '==', platform), orderBy('addedAt', 'desc'), limit(50))
      : query(coursesCollection, orderBy('addedAt', 'desc'), limit(100));

    const snapshot = await getDocs(q);

    const courses: ScrapedCourse[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        url: data.url,
        platform: data.platform,
        instructor: data.instructor,
        duration: data.duration,
        level: data.level,
        skillTags: data.skillTags || [],
        isFree: data.isFree,
        rating: data.rating,
        enrollmentCount: data.enrollmentCount,
        thumbnail: data.thumbnail,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        language: data.language,
        category: data.category,
        addedAt: data.addedAt?.toDate() || new Date()
      };
    });

    console.log(`[Scraper] Retrieved ${courses.length} cached courses`);
    return courses;

  } catch (error) {
    console.error('[Scraper] Error retrieving cached courses:', error);
    return [];
  }
}

/**
 * Scrape all platforms and cache results
 */
export async function scrapeAllPlatforms(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  // Scrape each platform with rate limiting
  const platforms = [
    { name: 'NPTEL', scraper: scrapeNPTELCourses },
    { name: 'Coursera', scraper: scrapeCoursera },
    { name: 'AWS', scraper: scrapeAWSEducate },
    { name: 'GCP', scraper: scrapeGCPSkills },
  ];

  for (const { name, scraper } of platforms) {
    try {
      const courses = await scraper();
      
      if (courses.length > 0) {
        await cacheScrapedCourses(courses, name);
      }

      results.push({
        platform: name,
        courses,
        scrapedAt: new Date(),
        success: true
      });

      // Rate limiting
      await delay(RATE_LIMIT_DELAY);

    } catch (error) {
      console.error(`[${name}] Scraping failed:`, error);
      results.push({
        platform: name,
        courses: [],
        scrapedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('[Scraper] All platforms scraped:', results.map(r => `${r.platform}: ${r.courses.length}`));
  return results;
}

// ===== EXPORTS =====

export default {
  scrapeNPTELCourses,
  scrapeCoursera,
  scrapeAWSEducate,
  scrapeGCPSkills,
  scrapeYouTubeEducational,
  cacheScrapedCourses,
  getCachedCourses,
  scrapeAllPlatforms
};

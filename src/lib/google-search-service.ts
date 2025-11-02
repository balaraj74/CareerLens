/**
 * Google Custom Search API Service
 * 
 * Purpose: Enhanced discovery of reviews, courses, and mentor profiles from the web
 * Features:
 * - College review discovery (additional sources beyond Reddit)
 * - Course search across multiple platforms
 * - Mentor profile discovery (LinkedIn, blogs, YouTube educators)
 * - Intelligent result ranking with AI
 * - Caching with Firestore (24h TTL)
 * - Rate limiting and error handling
 * 
 * Setup:
 * 1. Get API key from: https://developers.google.com/custom-search/v1/introduction
 * 2. Create Custom Search Engine at: https://cse.google.com/cse/
 * 3. Add to .env.local:
 *    NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_api_key
 *    NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
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

export interface GoogleSearchResult {
  id: string;
  title: string;
  snippet: string;
  link: string;
  source: string;
  category: 'review' | 'course' | 'mentor';
  relevanceScore?: number;
  publishDate?: Date;
  metadata?: {
    author?: string;
    platform?: string;
    rating?: number;
    tags?: string[];
  };
  addedAt: Date;
}

export interface SearchParams {
  query: string;
  category: 'review' | 'course' | 'mentor';
  numResults?: number; // Default: 10
  dateRestrict?: string; // e.g., 'd7' (last 7 days), 'm1' (last month), 'y1' (last year)
  exactTerms?: string;
  excludeTerms?: string;
  fileType?: string;
  siteSearch?: string; // Restrict to specific domain
}

export interface CourseSearchParams extends SearchParams {
  level?: 'beginner' | 'intermediate' | 'advanced';
  free?: boolean;
  platforms?: string[]; // ['coursera', 'udemy', 'nptel', 'youtube']
}

export interface MentorSearchParams extends SearchParams {
  role?: string; // e.g., 'software engineer', 'data scientist'
  company?: string;
  location?: string;
}

// ===== CONSTANTS =====

const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';
const CACHE_COLLECTION = 'googleSearchCache';
const RESULTS_COLLECTION = 'googleSearchResults';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_DELAY = 1000; // 1 second between requests (free tier: 100 queries/day)

// API Keys (from environment variables)
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  }
  return process.env.GOOGLE_SEARCH_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
};

const getEngineId = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;
  }
  return process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;
};

// ===== HELPER FUNCTIONS =====

/**
 * Build query parameters for Google Custom Search API
 */
function buildSearchQuery(params: SearchParams): URLSearchParams {
  const apiKey = getApiKey();
  const engineId = getEngineId();

  if (!apiKey || !engineId) {
    throw new Error('Google Search API credentials not configured. Add NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY and NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID to .env.local');
  }

  const queryParams = new URLSearchParams({
    key: apiKey,
    cx: engineId,
    q: params.query,
    num: String(params.numResults || 10),
  });

  if (params.dateRestrict) queryParams.append('dateRestrict', params.dateRestrict);
  if (params.exactTerms) queryParams.append('exactTerms', params.exactTerms);
  if (params.excludeTerms) queryParams.append('excludeTerms', params.excludeTerms);
  if (params.fileType) queryParams.append('fileType', params.fileType);
  if (params.siteSearch) queryParams.append('siteSearch', params.siteSearch);

  return queryParams;
}

/**
 * Generate cache key for search query
 */
function generateCacheKey(params: SearchParams): string {
  return `${params.category}_${params.query}_${params.numResults || 10}_${params.dateRestrict || 'all'}`;
}

/**
 * Check if cache is stale
 */
async function isCacheStale(cacheKey: string, maxAge: number = CACHE_TTL_MS): Promise<boolean> {
  try {
    const db = getFirestore(getApp());
    const cacheDocRef = doc(db, 'cache', cacheKey);
    const cacheDoc = await getDoc(cacheDocRef);

    if (!cacheDoc.exists()) {
      return true; // No cache = stale
    }

    const lastUpdated = cacheDoc.data().lastUpdated?.toDate();
    if (!lastUpdated) return true;

    const age = Date.now() - lastUpdated.getTime();
    return age > maxAge;
  } catch (error) {
    console.error('Error checking cache staleness:', error);
    return true; // Assume stale on error
  }
}

/**
 * Update cache timestamp
 */
async function updateCacheTimestamp(cacheKey: string): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const cacheDocRef = doc(db, 'cache', cacheKey);
    await setDoc(cacheDocRef, {
      lastUpdated: Timestamp.now(),
      key: cacheKey
    }, { merge: true });
  } catch (error) {
    console.error('Error updating cache timestamp:', error);
  }
}

// ===== CORE FUNCTIONS =====

/**
 * Fetch search results from Google Custom Search API
 */
export async function fetchGoogleSearchResults(params: SearchParams): Promise<GoogleSearchResult[]> {
  try {
    const queryParams = buildSearchQuery(params);
    const url = `${GOOGLE_SEARCH_API_URL}?${queryParams.toString()}`;

    console.log(`[Google Search] Fetching results for query: "${params.query}" (category: ${params.category})`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Google Search] API Error:', response.status, errorText);
      throw new Error(`Google Search API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('[Google Search] No results found');
      return [];
    }

    // Transform API response to GoogleSearchResult format
    const results: GoogleSearchResult[] = data.items.map((item: any) => ({
      id: `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Untitled',
      snippet: item.snippet || '',
      link: item.link || '',
      source: 'Google Search',
      category: params.category,
      relevanceScore: 0, // Will be calculated by AI later
      publishDate: item.pagemap?.metatags?.[0]?.['article:published_time'] 
        ? new Date(item.pagemap.metatags[0]['article:published_time']) 
        : undefined,
      metadata: {
        author: item.pagemap?.metatags?.[0]?.author,
        platform: new URL(item.link).hostname.replace('www.', ''),
        tags: []
      },
      addedAt: new Date()
    }));

    console.log(`[Google Search] Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error('[Google Search] Error fetching results:', error);
    throw error;
  }
}

/**
 * Search for college reviews from various sources
 */
export async function searchCollegeReviews(
  collegeName: string,
  examType?: 'KCET' | 'NEET' | 'JEE' | 'COMEDK' | 'GATE',
  options?: { numResults?: number; dateRestrict?: string }
): Promise<GoogleSearchResult[]> {
  const query = examType 
    ? `${collegeName} college review ${examType} student experience`
    : `${collegeName} college review student experience`;

  const params: SearchParams = {
    query,
    category: 'review',
    numResults: options?.numResults || 10,
    dateRestrict: options?.dateRestrict || 'y1', // Last year
    excludeTerms: 'ads promotional sponsored'
  };

  return fetchGoogleSearchResults(params);
}

/**
 * Search for free courses across multiple platforms
 */
export async function searchFreeCourses(
  topic: string,
  options?: {
    level?: 'beginner' | 'intermediate' | 'advanced';
    platforms?: string[];
    numResults?: number;
  }
): Promise<GoogleSearchResult[]> {
  let query = `${topic} free course online`;
  
  if (options?.level) {
    query += ` ${options.level}`;
  }

  const params: SearchParams = {
    query,
    category: 'course',
    numResults: options?.numResults || 10,
    exactTerms: 'free',
    excludeTerms: 'paid premium subscription'
  };

  // If specific platforms requested, add site search
  if (options?.platforms && options.platforms.length > 0) {
    // Note: siteSearch only accepts one domain, so we'll search for all and filter later
    params.query += ` site:${options.platforms.join(' OR site:')}`;
  }

  return fetchGoogleSearchResults(params);
}

/**
 * Search for mentors and educators
 */
export async function searchMentors(
  role: string,
  options?: {
    company?: string;
    location?: string;
    numResults?: number;
  }
): Promise<GoogleSearchResult[]> {
  let query = `${role} mentor educator LinkedIn`;
  
  if (options?.company) {
    query += ` ${options.company}`;
  }
  
  if (options?.location) {
    query += ` ${options.location}`;
  }

  const params: SearchParams = {
    query,
    category: 'mentor',
    numResults: options?.numResults || 10,
    siteSearch: 'linkedin.com', // Focus on LinkedIn profiles
  };

  return fetchGoogleSearchResults(params);
}

/**
 * Cache search results to Firestore
 */
export async function cacheSearchResults(results: GoogleSearchResult[], cacheKey: string): Promise<void> {
  if (!results || results.length === 0) {
    console.log('[Google Search] No results to cache');
    return;
  }

  try {
    const db = getFirestore(getApp());
    const resultsCollection = collection(db, RESULTS_COLLECTION);

    // Prevent duplicates: check if result already exists
    const existingQuery = query(
      resultsCollection,
      where('link', 'in', results.map(r => r.link))
    );
    const existingDocs = await getDocs(existingQuery);
    const existingLinks = new Set(existingDocs.docs.map(doc => doc.data().link));

    // Filter out duplicates
    const newResults = results.filter(r => !existingLinks.has(r.link));

    if (newResults.length === 0) {
      console.log('[Google Search] All results already cached');
      return;
    }

    // Store new results
    const promises = newResults.map(result => 
      addDoc(resultsCollection, {
        ...result,
        cacheKey,
        addedAt: Timestamp.fromDate(result.addedAt),
        publishDate: result.publishDate ? Timestamp.fromDate(result.publishDate) : null
      })
    );

    await Promise.all(promises);

    // Update cache timestamp
    await updateCacheTimestamp(cacheKey);

    console.log(`[Google Search] Cached ${newResults.length} new results (${results.length - newResults.length} duplicates skipped)`);

  } catch (error) {
    console.error('[Google Search] Error caching results:', error);
    throw error;
  }
}

/**
 * Get cached search results from Firestore
 */
export async function getCachedSearchResults(
  cacheKey: string,
  maxAge: number = CACHE_TTL_MS
): Promise<GoogleSearchResult[]> {
  try {
    // Check if cache is stale
    if (await isCacheStale(cacheKey, maxAge)) {
      console.log('[Google Search] Cache is stale');
      return [];
    }

    const db = getFirestore(getApp());
    const resultsCollection = collection(db, RESULTS_COLLECTION);

    const q = query(
      resultsCollection,
      where('cacheKey', '==', cacheKey),
      orderBy('addedAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);

    const results: GoogleSearchResult[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        snippet: data.snippet,
        link: data.link,
        source: data.source,
        category: data.category,
        relevanceScore: data.relevanceScore,
        publishDate: data.publishDate?.toDate(),
        metadata: data.metadata,
        addedAt: data.addedAt?.toDate() || new Date()
      };
    });

    console.log(`[Google Search] Retrieved ${results.length} cached results`);
    return results;

  } catch (error) {
    console.error('[Google Search] Error retrieving cached results:', error);
    return [];
  }
}

/**
 * Search with caching - checks cache first, fetches if stale
 */
export async function searchWithCache(params: SearchParams): Promise<GoogleSearchResult[]> {
  const cacheKey = generateCacheKey(params);

  // Try cache first
  const cached = await getCachedSearchResults(cacheKey);
  if (cached.length > 0) {
    console.log('[Google Search] Using cached results');
    return cached;
  }

  // Fetch fresh results
  console.log('[Google Search] Fetching fresh results');
  const results = await fetchGoogleSearchResults(params);

  // Cache results
  if (results.length > 0) {
    await cacheSearchResults(results, cacheKey);
  }

  return results;
}

/**
 * Refresh all search categories with rate limiting
 */
export async function refreshAllSearches(
  queries: { collegeName?: string; topic?: string; role?: string }
): Promise<{
  reviews: GoogleSearchResult[];
  courses: GoogleSearchResult[];
  mentors: GoogleSearchResult[];
}> {
  const results = {
    reviews: [] as GoogleSearchResult[],
    courses: [] as GoogleSearchResult[],
    mentors: [] as GoogleSearchResult[]
  };

  try {
    // 1. Fetch college reviews
    if (queries.collegeName) {
      console.log('[Google Search] Fetching college reviews...');
      results.reviews = await searchCollegeReviews(queries.collegeName);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    // 2. Fetch courses
    if (queries.topic) {
      console.log('[Google Search] Fetching courses...');
      results.courses = await searchFreeCourses(queries.topic);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    // 3. Fetch mentors
    if (queries.role) {
      console.log('[Google Search] Fetching mentors...');
      results.mentors = await searchMentors(queries.role);
    }

    console.log('[Google Search] Refresh complete:', {
      reviews: results.reviews.length,
      courses: results.courses.length,
      mentors: results.mentors.length
    });

    return results;

  } catch (error) {
    console.error('[Google Search] Error refreshing searches:', error);
    return results;
  }
}

// ===== EXPORT ALL FUNCTIONS =====

export default {
  fetchGoogleSearchResults,
  searchCollegeReviews,
  searchFreeCourses,
  searchMentors,
  cacheSearchResults,
  getCachedSearchResults,
  searchWithCache,
  refreshAllSearches,
  generateCacheKey,
  isCacheStale
};

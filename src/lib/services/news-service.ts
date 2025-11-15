/**
 * News Service - Fetches REAL latest news from NewsAPI.org
 * Live news from multiple sources worldwide
 */

export interface NewsArticle {
  id: string;
  headline: string;
  snippet: string;
  image?: string;
  source: string;
  publishTime?: string;
  link: string;
  category: 'politics' | 'sports' | 'technology' | 'entertainment' | 'business' | 'general' | 'health' | 'science';
  author?: string;
}

export interface NewsSource {
  name: string;
  url: string;
  rssUrl?: string;
  category?: string;
}

// NewsAPI configuration
const NEWS_API_KEY = '649784e50c964c6d80cd7e75ddb0d94f';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Indian News Sources
export const INDIAN_NEWS_SOURCES: NewsSource[] = [
  { name: 'The Times of India', url: 'timesofindia.indiatimes.com' },
  { name: 'The Hindu', url: 'thehindu.com' },
  { name: 'NDTV', url: 'ndtv.com' },
  { name: 'Indian Express', url: 'indianexpress.com' },
  { name: 'Hindustan Times', url: 'hindustantimes.com' },
];

// Global News Sources
export const GLOBAL_NEWS_SOURCES: NewsSource[] = [
  { name: 'BBC News', url: 'bbc.com' },
  { name: 'CNN', url: 'cnn.com' },
  { name: 'Reuters', url: 'reuters.com' },
  { name: 'Al Jazeera English', url: 'aljazeera.com' },
  { name: 'The Guardian', url: 'theguardian.com' },
];

// Available news categories
export const NEWS_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'politics', label: 'Politics' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'science', label: 'Science' },
] as const;

/**
 * Fetch news articles via our API route (server-side proxy to NewsAPI)
 */
export async function fetchNews(
  region: 'indian' | 'global',
  category?: string,
  limit: number = 20
): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams({
      region,
      limit: limit.toString(),
    });

    if (category && category !== 'all') {
      params.append('category', category);
    }

    const response = await fetch(`/api/news?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch news');
    }

    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

/**
 * Search news articles by keyword via our API route
 */
export async function searchNewsArticles(
  keyword: string,
  region: 'indian' | 'global',
  limit: number = 20
): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams({
      region,
      limit: limit.toString(),
      query: keyword,
    });

    const response = await fetch(`/api/news?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to search news: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to search news');
    }

    return data.articles;
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
}

// Mock news data for fallback when API fails
const MOCK_INDIAN_NEWS: NewsArticle[] = [
  {
    id: '1',
    headline: 'India\'s GDP Growth Reaches 7.8% in Q3, Highest Among Major Economies',
    snippet: 'The Indian economy continues its strong recovery with GDP growth touching 7.8% in the third quarter, driven by robust manufacturing and services sectors.',
    image: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800',
    source: 'Times of India',
    publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: 'https://timesofindia.indiatimes.com/',
    category: 'business',
  },
  {
    id: '2',
    headline: 'ISRO Successfully Launches Chandrayaan-4 Mission to Moon',
    snippet: 'Indian Space Research Organisation achieves another milestone with the successful launch of Chandrayaan-4, aiming to establish a permanent lunar base.',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    source: 'The Hindu',
    publishTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.thehindu.com/',
    category: 'technology',
  },
  {
    id: '3',
    headline: 'Indian Cricket Team Wins Test Series Against Australia 3-1',
    snippet: 'Team India clinches a remarkable victory in the Border-Gavaskar Trophy with stellar performances from young players.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    source: 'NDTV Sports',
    publishTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    link: 'https://sports.ndtv.com/',
    category: 'sports',
  },
  {
    id: '4',
    headline: 'New Education Policy Shows Significant Improvement in Student Outcomes',
    snippet: 'The National Education Policy 2020 implementation shows positive results with improved literacy rates and skill development across the country.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    source: 'Indian Express',
    publishTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    link: 'https://indianexpress.com/',
    category: 'general',
  },
  {
    id: '5',
    headline: 'Bollywood Star Announces New Film Based on Indian Freedom Fighters',
    snippet: 'Major Bollywood production house announces ambitious project celebrating unsung heroes of India\'s independence movement.',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    source: 'Times of India',
    publishTime: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    link: 'https://timesofindia.indiatimes.com/',
    category: 'entertainment',
  },
  {
    id: '11',
    headline: 'Startup India Initiative Crosses 1 Lakh Registered Companies Milestone',
    snippet: 'Government\'s flagship startup program achieves major milestone with over 100,000 registered startups creating millions of jobs.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
    source: 'The Hindu',
    publishTime: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.thehindu.com/',
    category: 'business',
  },
  {
    id: '12',
    headline: 'Indian Railways Unveils New High-Speed Bullet Train Routes',
    snippet: 'Railway Ministry announces expansion of bullet train network connecting major metro cities across India.',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800',
    source: 'NDTV',
    publishTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.ndtv.com/',
    category: 'general',
  },
];

const MOCK_GLOBAL_NEWS: NewsArticle[] = [
  {
    id: '6',
    headline: 'UN Climate Summit Reaches Historic Agreement on Carbon Emissions',
    snippet: 'World leaders at COP30 agree to accelerate carbon neutrality goals with binding commitments from all major economies.',
    image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
    source: 'BBC News',
    publishTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.bbc.com/news',
    category: 'politics',
  },
  {
    id: '7',
    headline: 'Breakthrough in Quantum Computing: 1000-Qubit Processor Unveiled',
    snippet: 'Tech giant announces revolutionary quantum computer capable of solving complex problems exponentially faster than classical computers.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    source: 'Reuters',
    publishTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.reuters.com/',
    category: 'technology',
  },
  {
    id: '8',
    headline: 'Global Markets Rally as Economic Indicators Show Strong Recovery',
    snippet: 'Stock markets worldwide surge as manufacturing data and employment figures exceed expectations across major economies.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    source: 'Al Jazeera',
    publishTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.aljazeera.com/',
    category: 'business',
  },
  {
    id: '9',
    headline: 'FIFA World Cup 2026 Host Cities Announce Infrastructure Upgrades',
    snippet: 'Preparations intensify for the next FIFA World Cup with major stadium renovations and transportation improvements.',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    source: 'BBC News',
    publishTime: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.bbc.com/sport',
    category: 'sports',
  },
  {
    id: '10',
    headline: 'Oscar-Nominated Director Announces Streaming-Exclusive Documentary',
    snippet: 'Acclaimed filmmaker partners with major streaming platform for groundbreaking documentary exploring climate change impacts.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    source: 'Reuters',
    publishTime: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.reuters.com/',
    category: 'entertainment',
  },
  {
    id: '13',
    headline: 'SpaceX Announces First Commercial Mission to Mars in 2028',
    snippet: 'Space exploration company reveals ambitious plans for crewed mission to Red Planet with civilian astronauts.',
    image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800',
    source: 'Reuters',
    publishTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.reuters.com/',
    category: 'technology',
  },
  {
    id: '14',
    headline: 'G20 Summit Concludes with New Trade Agreements',
    snippet: 'Leaders from world\'s largest economies sign comprehensive trade pact aimed at boosting economic cooperation.',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    source: 'Al Jazeera',
    publishTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    link: 'https://www.aljazeera.com/',
    category: 'politics',
  },
];

/**
 * Format publish time to relative time (e.g., "2 hours ago")
 */
export function formatPublishTime(publishTime?: string): string {
  if (!publishTime) return 'Unknown';
  
  const now = Date.now();
  const published = new Date(publishTime).getTime();
  const diffMs = now - published;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return new Date(publishTime).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get source logo/icon
 */
export function getSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    'Times of India': '🇮🇳',
    'The Times of India': '🇮🇳',
    'The Hindu': '📰',
    'NDTV': '📺',
    'Indian Express': '📄',
    'Hindustan Times': '🗞️',
    'BBC News': '🌍',
    'Reuters': '📡',
    'Al Jazeera': '🌐',
    'Al Jazeera English': '🌐',
    'CNN': '📹',
    'The Guardian': '📰',
  };
  
  return icons[source] || '📰';
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    business: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    technology: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    sports: 'bg-green-500/20 text-green-300 border-green-500/50',
    entertainment: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    health: 'bg-red-500/20 text-red-300 border-red-500/50',
    science: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    general: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    politics: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  };
  
  return colors[category] || colors.general;
}

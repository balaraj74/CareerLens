/**
 * Reddit API Service - Real-Time Student Review Fetcher
 * Fetches live reviews from Reddit using Reddit JSON API
 */

import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export interface RedditPost {
  id: string;
  title: string;
  text: string;
  author: string;
  subreddit: string;
  url: string;
  score: number;
  numComments: number;
  created: number;
  category?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  summary?: string;
}

export interface RedditSearchParams {
  query: string;
  subreddits?: string[];
  limit?: number;
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
}

/**
 * Fetch posts from Reddit via our API route (avoids CORS issues)
 */
export async function fetchRedditPosts(params: RedditSearchParams): Promise<RedditPost[]> {
  const {
    query,
    subreddits = [],
    limit = 25,
  } = params;

  try {
    console.log('Fetching Reddit posts via API route:', query);

    // Use our server-side API route to avoid CORS issues
    const response = await fetch('/api/reddit-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collegeName: query,
        subreddits: subreddits.length > 0 ? subreddits : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch Reddit posts');
    }

    // Convert API response to RedditPost format
    const posts: RedditPost[] = (data.reviews || []).map((review: any) => ({
      id: review.id,
      title: review.post_title,
      text: review.content,
      author: review.author,
      subreddit: review.subreddit,
      url: review.post_url,
      score: review.score,
      numComments: review.num_comments,
      created: review.created_utc * 1000, // Convert to milliseconds
      sentiment: review.sentiment,
      category: review.topics?.[0] || 'General',
    }));

    console.log(`✅ Fetched ${posts.length} Reddit posts`);
    return posts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
}

/**
 * Fetch college/exam reviews from specific subreddits
 */
export async function fetchCollegeReviews(
  examType: 'KCET' | 'NEET' | 'JEE' | 'COMEDK' | 'GATE' | 'General',
  limit: number = 25
): Promise<RedditPost[]> {
  const subreddits = [
    'Indian_Academia',
    'Indian_Engg',
    'Indian_Academians',
    'IndianTeenagers',
    'JEENEETards',
    'CBSE',
    'india',
  ];

  const queries: Record<string, string> = {
    KCET: 'KCET college admission experience review',
    NEET: 'NEET medical college experience review',
    JEE: 'JEE IIT NIT college experience review',
    COMEDK: 'COMEDK college admission experience review',
    GATE: 'GATE preparation experience review strategy',
    General: 'college review experience India engineering medical',
  };

  return await fetchRedditPosts({
    query: queries[examType],
    subreddits,
    limit,
    timeFilter: 'year',
    sortBy: 'relevance',
  });
}

/**
 * Cache Reddit posts to Firestore
 */
export async function cacheRedditPosts(posts: RedditPost[], category: string): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const reviewsRef = collection(db, 'redditReviews');

    for (const post of posts) {
      // Check if post already exists
      const q = query(reviewsRef, where('redditId', '==', post.id));
      const existing = await getDocs(q);

      if (existing.empty) {
        await addDoc(reviewsRef, {
          redditId: post.id,
          title: post.title,
          text: post.text,
          author: post.author,
          subreddit: post.subreddit,
          url: post.url,
          score: post.score,
          numComments: post.numComments,
          created: new Date(post.created),
          category,
          sentiment: post.sentiment || 'neutral',
          summary: post.summary || '',
          fetchedAt: Timestamp.now(),
        });
      }
    }

    console.log(`Cached ${posts.length} Reddit posts for category: ${category}`);
  } catch (error) {
    console.error('Error caching Reddit posts:', error);
    throw error;
  }
}

/**
 * Get cached Reddit posts from Firestore
 */
export async function getCachedRedditPosts(
  category?: string,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
): Promise<RedditPost[]> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const reviewsRef = collection(db, 'redditReviews');

    // Calculate cutoff time
    const cutoff = new Date(Date.now() - maxAge);

    let q = query(
      reviewsRef,
      where('fetchedAt', '>', Timestamp.fromDate(cutoff)),
      orderBy('fetchedAt', 'desc'),
      firestoreLimit(50)
    );

    if (category) {
      q = query(
        reviewsRef,
        where('category', '==', category),
        where('fetchedAt', '>', Timestamp.fromDate(cutoff)),
        orderBy('fetchedAt', 'desc'),
        firestoreLimit(50)
      );
    }

    const snapshot = await getDocs(q);
    const posts: RedditPost[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: data.redditId,
        title: data.title,
        text: data.text,
        author: data.author,
        subreddit: data.subreddit,
        url: data.url,
        score: data.score,
        numComments: data.numComments,
        created: data.created.toDate().getTime(),
        category: data.category,
        sentiment: data.sentiment,
        summary: data.summary,
      });
    });

    return posts;
  } catch (error) {
    console.error('Error getting cached Reddit posts:', error);
    return [];
  }
}

/**
 * Check if cache is stale and needs refresh
 */
export async function isCacheStale(
  category: string,
  maxAge: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const cacheRef = collection(db, 'cache');

    const q = query(cacheRef, where('type', '==', `reddit_${category}`));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return true; // No cache exists
    }

    const cacheDoc = snapshot.docs[0].data();
    const lastUpdated = cacheDoc.lastUpdated.toDate().getTime();
    const now = Date.now();

    return (now - lastUpdated) > maxAge;
  } catch (error) {
    console.error('Error checking cache:', error);
    return true; // Assume stale on error
  }
}

/**
 * Update cache timestamp
 */
export async function updateCacheTimestamp(category: string): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const cacheRef = collection(db, 'cache');

    await addDoc(cacheRef, {
      type: `reddit_${category}`,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating cache timestamp:', error);
  }
}

/**
 * Fetch and cache Reddit reviews for all categories
 */
export async function refreshAllRedditReviews(): Promise<void> {
  const categories: Array<'KCET' | 'NEET' | 'JEE' | 'COMEDK' | 'GATE' | 'General'> = [
    'KCET',
    'NEET',
    'JEE',
    'COMEDK',
    'GATE',
    'General',
  ];

  for (const category of categories) {
    try {
      console.log(`Fetching Reddit reviews for: ${category}`);
      
      // Check if cache is stale
      const stale = await isCacheStale(category);
      
      if (stale) {
        const posts = await fetchCollegeReviews(category, 25);
        await cacheRedditPosts(posts, category);
        await updateCacheTimestamp(category);
        
        console.log(`✅ Refreshed ${posts.length} posts for ${category}`);
      } else {
        console.log(`ℹ️ Cache is fresh for ${category}, skipping fetch`);
      }
      
      // Rate limiting: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error refreshing ${category}:`, error);
    }
  }
}

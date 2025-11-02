/**
 * Cloud Function: Fetch Reviews from Reddit
 * Runs daily at midnight to fetch new college reviews
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  url: string;
  permalink: string;
}

/**
 * Fetch reviews from Reddit API
 */
async function fetchRedditReviews(
  subreddit: string,
  query: string,
  limit: number = 50
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json`;
    const params = {
      q: query,
      restrict_sr: 'true',
      sort: 'new',
      limit: limit.toString(),
      t: 'all'
    };

    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'CareerLens/1.0.0 (Firebase Cloud Function)'
      }
    });

    if (response.data?.data?.children) {
      return response.data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext,
        author: child.data.author,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        subreddit: child.data.subreddit,
        url: `https://reddit.com${child.data.permalink}`,
        permalink: child.data.permalink
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching Reddit reviews:', error);
    return [];
  }
}

/**
 * Store reviews in Firestore
 */
async function storeReviews(reviews: RedditPost[], category: string): Promise<number> {
  let stored = 0;
  const batch = db.batch();
  const collectionRef = db.collection('reddit_reviews');

  for (const review of reviews) {
    // Check if review already exists
    const existingDoc = await collectionRef.doc(review.id).get();
    
    if (!existingDoc.exists) {
      const docRef = collectionRef.doc(review.id);
      batch.set(docRef, {
        ...review,
        category,
        fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
        processed: false
      });
      stored++;
    }
  }

  if (stored > 0) {
    await batch.commit();
  }

  return stored;
}

/**
 * Scheduled function - runs daily at midnight IST
 */
export const fetchReviewsScheduled = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Starting scheduled Reddit review fetch...');

    const categories = [
      { name: 'KCET', query: 'KCET college review experience' },
      { name: 'NEET', query: 'NEET medical college review' },
      { name: 'JEE', query: 'JEE IIT NIT college review' },
      { name: 'COMEDK', query: 'COMEDK engineering college review' },
      { name: 'GATE', query: 'GATE admission college review' }
    ];

    const subreddit = 'JEENEETards';
    let totalStored = 0;

    for (const category of categories) {
      console.log(`Fetching ${category.name} reviews...`);
      const reviews = await fetchRedditReviews(subreddit, category.query, 20);
      const stored = await storeReviews(reviews, category.name);
      totalStored += stored;
      console.log(`Stored ${stored} new ${category.name} reviews`);
    }

    // Update metadata
    await db.collection('_metadata').doc('reddit_reviews').set({
      lastFetch: admin.firestore.FieldValue.serverTimestamp(),
      totalFetched: totalStored,
      categories: categories.map(c => c.name)
    }, { merge: true });

    console.log(`Completed! Stored ${totalStored} new reviews total`);
    return { success: true, stored: totalStored };
  });

/**
 * Manual trigger function for testing
 */
export const fetchReviewsManual = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Manual Reddit review fetch triggered...');

    const category = req.query.category as string || 'KCET';
    const query = `${category} college review experience`;
    const subreddit = 'JEENEETards';

    const reviews = await fetchRedditReviews(subreddit, query, 20);
    const stored = await storeReviews(reviews, category);

    res.json({
      success: true,
      category,
      fetched: reviews.length,
      stored,
      reviews: reviews.slice(0, 5) // Return first 5 for preview
    });
  } catch (error: any) {
    console.error('Manual fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

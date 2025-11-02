/**
 * Cloud Function: AI Summarization & Analysis
 * Processes fetched data with AI for insights and sentiment analysis
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  keywords: string[];
}

interface ReviewSummary {
  id: string;
  summary: string;
  sentiment: SentimentResult;
  keyPoints: string[];
  category: string;
}

/**
 * Quick sentiment analysis using keyword matching
 * (In production, use Gemini API for better accuracy)
 */
function analyzeSentiment(text: string): SentimentResult {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'best', 'love', 'helpful', 'recommended', 'useful', 'awesome'];
  const negativeWords = ['bad', 'worst', 'terrible', 'hate', 'useless', 'waste', 'poor', 'disappointing', 'avoid', 'scam'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  const keywords: string[] = [];

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      positiveCount++;
      keywords.push(word);
    }
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      negativeCount++;
      keywords.push(word);
    }
  });

  const totalWords = positiveCount + negativeCount || 1;
  const score = (positiveCount - negativeCount) / totalWords;

  let sentiment: 'positive' | 'neutral' | 'negative';
  if (score > 0.3) sentiment = 'positive';
  else if (score < -0.3) sentiment = 'negative';
  else sentiment = 'neutral';

  return { sentiment, score, keywords };
}

/**
 * Generate simple summary (first 150 chars + ending)
 * (In production, use Gemini API for better summaries)
 */
function generateSummary(text: string): string {
  if (!text || text.length < 150) return text;
  
  // Find the last complete sentence within 150 chars
  const truncated = text.substring(0, 150);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const endIndex = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (endIndex > 50) {
    return text.substring(0, endIndex + 1);
  }
  
  return truncated + '...';
}

/**
 * Extract key points from text
 */
function extractKeyPoints(text: string): string[] {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);
  
  // Return top 3 sentences
  return sentences.slice(0, 3);
}

/**
 * Process unprocessed Reddit reviews
 */
async function processRedditReviews(): Promise<number> {
  const reviewsRef = db.collection('reddit_reviews');
  const unprocessedQuery = reviewsRef.where('processed', '==', false).limit(50);
  const snapshot = await unprocessedQuery.get();

  if (snapshot.empty) {
    console.log('No unprocessed reviews found');
    return 0;
  }

  const batch = db.batch();
  const summariesRef = db.collection('review_summaries');
  let processed = 0;

  for (const doc of snapshot.docs) {
    const review = doc.data();
    const text = `${review.title} ${review.selftext}`;

    // Analyze sentiment
    const sentiment = analyzeSentiment(text);

    // Generate summary
    const summary = generateSummary(review.selftext || review.title);

    // Extract key points
    const keyPoints = extractKeyPoints(review.selftext || review.title);

    // Store summary
    const summaryDoc: ReviewSummary = {
      id: doc.id,
      summary,
      sentiment,
      keyPoints,
      category: review.category || 'General'
    };

    batch.set(summariesRef.doc(doc.id), {
      ...summaryDoc,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'reddit',
      originalUrl: review.url
    });

    // Mark as processed
    batch.update(doc.ref, { 
      processed: true, 
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score
    });

    processed++;
  }

  await batch.commit();
  return processed;
}

/**
 * Process unprocessed courses
 */
async function processScrapedCourses(): Promise<number> {
  const coursesRef = db.collection('scraped_courses');
  const unprocessedQuery = coursesRef.where('processed', '==', false).limit(50);
  const snapshot = await unprocessedQuery.get();

  if (snapshot.empty) {
    console.log('No unprocessed courses found');
    return 0;
  }

  const batch = db.batch();
  let processed = 0;

  for (const doc of snapshot.docs) {
    const course = doc.data();

    // Analyze course description sentiment
    const sentiment = analyzeSentiment(course.description || '');

    // Generate summary
    const summary = generateSummary(course.description || course.title);

    // Update course with analysis
    batch.update(doc.ref, {
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      summary,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
      keywords: sentiment.keywords
    });

    processed++;
  }

  await batch.commit();
  return processed;
}

/**
 * Firestore trigger - runs when new reviews are added
 */
export const summarizeDataTrigger = functions.firestore
  .document('reddit_reviews/{reviewId}')
  .onCreate(async (snapshot, context) => {
    const review = snapshot.data();
    const text = `${review.title} ${review.selftext}`;

    console.log(`Processing new review: ${context.params.reviewId}`);

    // Analyze sentiment
    const sentiment = analyzeSentiment(text);

    // Generate summary
    const summary = generateSummary(review.selftext || review.title);

    // Extract key points
    const keyPoints = extractKeyPoints(review.selftext || review.title);

    // Store summary
    const summaryDoc: ReviewSummary = {
      id: snapshot.id,
      summary,
      sentiment,
      keyPoints,
      category: review.category || 'General'
    };

    await db.collection('review_summaries').doc(snapshot.id).set({
      ...summaryDoc,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'reddit',
      originalUrl: review.url
    });

    // Update original document
    await snapshot.ref.update({
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score
    });

    console.log(`Completed processing review: ${context.params.reviewId}`);
    return { success: true };
  });

/**
 * Scheduled batch processing - runs every 6 hours
 */
export const summarizeDataScheduled = functions.pubsub
  .schedule('0 */6 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Starting scheduled data summarization...');

    // Process reviews
    const reviewsProcessed = await processRedditReviews();
    console.log(`Processed ${reviewsProcessed} reviews`);

    // Process courses
    const coursesProcessed = await processScrapedCourses();
    console.log(`Processed ${coursesProcessed} courses`);

    // Update metadata
    await db.collection('_metadata').doc('ai_processing').set({
      lastRun: admin.firestore.FieldValue.serverTimestamp(),
      reviewsProcessed,
      coursesProcessed
    }, { merge: true });

    console.log('Completed scheduled summarization');
    return { 
      success: true, 
      reviewsProcessed, 
      coursesProcessed 
    };
  });

/**
 * Manual trigger for testing
 */
export const summarizeDataManual = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Manual summarization triggered...');

    const reviewsProcessed = await processRedditReviews();
    const coursesProcessed = await processScrapedCourses();

    res.json({
      success: true,
      reviewsProcessed,
      coursesProcessed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Summarization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

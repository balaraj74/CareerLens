"use strict";
/**
 * Cloud Function: AI Summarization & Analysis
 * Processes fetched data with AI for insights and sentiment analysis
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeDataManual = exports.summarizeDataScheduled = exports.summarizeDataTrigger = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Quick sentiment analysis using keyword matching
 * (In production, use Gemini API for better accuracy)
 */
function analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'best', 'love', 'helpful', 'recommended', 'useful', 'awesome'];
    const negativeWords = ['bad', 'worst', 'terrible', 'hate', 'useless', 'waste', 'poor', 'disappointing', 'avoid', 'scam'];
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    const keywords = [];
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
    let sentiment;
    if (score > 0.3)
        sentiment = 'positive';
    else if (score < -0.3)
        sentiment = 'negative';
    else
        sentiment = 'neutral';
    return { sentiment, score, keywords };
}
/**
 * Generate simple summary (first 150 chars + ending)
 * (In production, use Gemini API for better summaries)
 */
function generateSummary(text) {
    if (!text || text.length < 150)
        return text;
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
function extractKeyPoints(text) {
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
async function processRedditReviews() {
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
        const summaryDoc = {
            id: doc.id,
            summary,
            sentiment,
            keyPoints,
            category: review.category || 'General'
        };
        batch.set(summariesRef.doc(doc.id), Object.assign(Object.assign({}, summaryDoc), { createdAt: admin.firestore.FieldValue.serverTimestamp(), source: 'reddit', originalUrl: review.url }));
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
async function processScrapedCourses() {
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
exports.summarizeDataTrigger = functions.firestore
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
    const summaryDoc = {
        id: snapshot.id,
        summary,
        sentiment,
        keyPoints,
        category: review.category || 'General'
    };
    await db.collection('review_summaries').doc(snapshot.id).set(Object.assign(Object.assign({}, summaryDoc), { createdAt: admin.firestore.FieldValue.serverTimestamp(), source: 'reddit', originalUrl: review.url }));
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
exports.summarizeDataScheduled = functions.pubsub
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
exports.summarizeDataManual = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        console.error('Summarization error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
//# sourceMappingURL=summarizeData.js.map
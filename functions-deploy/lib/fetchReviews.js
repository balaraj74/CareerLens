"use strict";
/**
 * Cloud Function: Fetch Reviews from Reddit
 * Runs daily at midnight to fetch new college reviews
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchReviewsManual = exports.fetchReviewsScheduled = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
/**
 * Fetch reviews from Reddit API
 */
async function fetchRedditReviews(subreddit, query, limit = 50) {
    var _a, _b;
    try {
        const url = `https://www.reddit.com/r/${subreddit}/search.json`;
        const params = {
            q: query,
            restrict_sr: 'true',
            sort: 'new',
            limit: limit.toString(),
            t: 'all'
        };
        const response = await axios_1.default.get(url, {
            params,
            headers: {
                'User-Agent': 'CareerLens/1.0.0 (Firebase Cloud Function)'
            }
        });
        if ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.children) {
            return response.data.data.children.map((child) => ({
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
    }
    catch (error) {
        console.error('Error fetching Reddit reviews:', error);
        return [];
    }
}
/**
 * Store reviews in Firestore
 */
async function storeReviews(reviews, category) {
    let stored = 0;
    const batch = db.batch();
    const collectionRef = db.collection('reddit_reviews');
    for (const review of reviews) {
        // Check if review already exists
        const existingDoc = await collectionRef.doc(review.id).get();
        if (!existingDoc.exists) {
            const docRef = collectionRef.doc(review.id);
            batch.set(docRef, Object.assign(Object.assign({}, review), { category, fetchedAt: admin.firestore.FieldValue.serverTimestamp(), processed: false }));
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
exports.fetchReviewsScheduled = functions.pubsub
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
exports.fetchReviewsManual = functions.https.onRequest(async (req, res) => {
    try {
        console.log('Manual Reddit review fetch triggered...');
        const category = req.query.category || 'KCET';
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
    }
    catch (error) {
        console.error('Manual fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
//# sourceMappingURL=fetchReviews.js.map
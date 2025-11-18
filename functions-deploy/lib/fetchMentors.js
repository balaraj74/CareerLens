"use strict";
/**
 * Cloud Function: Fetch Mentors from Google Search
 * Runs daily to find career mentors online
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
exports.fetchMentorsManual = exports.fetchMentorsScheduled = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
/**
 * Search Google Custom Search API
 */
async function searchGoogle(query, apiKey, searchEngineId) {
    var _a;
    try {
        const url = 'https://www.googleapis.com/customsearch/v1';
        const params = {
            key: apiKey,
            cx: searchEngineId,
            q: query,
            num: 10
        };
        const response = await axios_1.default.get(url, { params });
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.items) {
            return response.data.items.map((item) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                displayLink: item.displayLink
            }));
        }
        return [];
    }
    catch (error) {
        console.error('Google Search API error:', error);
        return [];
    }
}
/**
 * Parse mentor profiles from search results
 */
function parseMentorProfiles(results, category) {
    return results.map(result => {
        var _a, _b;
        // Extract name from title (usually "Name - Title" or "Name | Title")
        const titleParts = result.title.split(/[-|]/);
        const name = ((_a = titleParts[0]) === null || _a === void 0 ? void 0 : _a.trim()) || result.title;
        const title = ((_b = titleParts[1]) === null || _b === void 0 ? void 0 : _b.trim()) || 'Career Mentor';
        // Determine platform
        let platform = 'Web';
        if (result.link.includes('linkedin.com'))
            platform = 'LinkedIn';
        else if (result.link.includes('github.com'))
            platform = 'GitHub';
        else if (result.link.includes('twitter.com') || result.link.includes('x.com'))
            platform = 'Twitter/X';
        else if (result.link.includes('medium.com'))
            platform = 'Medium';
        return {
            name,
            title,
            link: result.link,
            platform,
            snippet: result.snippet,
            category
        };
    });
}
/**
 * Store mentor profiles in Firestore
 */
async function storeMentors(mentors) {
    let stored = 0;
    const batch = db.batch();
    const collectionRef = db.collection('online_mentors');
    for (const mentor of mentors) {
        // Create unique ID from name and link
        const mentorId = `${mentor.name}_${mentor.platform}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 100);
        const existingDoc = await collectionRef.doc(mentorId).get();
        if (!existingDoc.exists) {
            const docRef = collectionRef.doc(mentorId);
            batch.set(docRef, Object.assign(Object.assign({}, mentor), { fetchedAt: admin.firestore.FieldValue.serverTimestamp(), verified: false, rating: 0, reviews: 0 }));
            stored++;
        }
        else {
            // Update existing mentor
            const docRef = collectionRef.doc(mentorId);
            batch.update(docRef, Object.assign(Object.assign({}, mentor), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        }
    }
    await batch.commit();
    return stored;
}
/**
 * Scheduled function - runs daily at 2 AM IST
 */
exports.fetchMentorsScheduled = functions.pubsub
    .schedule('0 2 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
    var _a, _b;
    console.log('Starting scheduled mentor search...');
    // Get API credentials from environment
    const apiKey = (_a = functions.config().google) === null || _a === void 0 ? void 0 : _a.search_api_key;
    const searchEngineId = (_b = functions.config().google) === null || _b === void 0 ? void 0 : _b.search_engine_id;
    if (!apiKey || !searchEngineId) {
        console.error('Missing Google Search API credentials');
        return { success: false, error: 'Missing credentials' };
    }
    const categories = [
        { name: 'Software Engineering', query: 'senior software engineer mentor LinkedIn' },
        { name: 'Data Science', query: 'data science mentor LinkedIn' },
        { name: 'Product Management', query: 'product manager mentor LinkedIn' },
        { name: 'Career Guidance', query: 'career counselor mentor India LinkedIn' },
        { name: 'Startup', query: 'startup founder mentor LinkedIn' }
    ];
    let totalStored = 0;
    for (const category of categories) {
        console.log(`Searching for ${category.name} mentors...`);
        const results = await searchGoogle(category.query, apiKey, searchEngineId);
        const mentors = parseMentorProfiles(results, category.name);
        const stored = await storeMentors(mentors);
        totalStored += stored;
        console.log(`Stored ${stored} new ${category.name} mentors`);
        // Rate limit: wait 1 second between searches
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Update metadata
    await db.collection('_metadata').doc('online_mentors').set({
        lastFetch: admin.firestore.FieldValue.serverTimestamp(),
        totalFetched: totalStored,
        categories: categories.map(c => c.name)
    }, { merge: true });
    console.log(`Completed! Stored ${totalStored} new mentors total`);
    return { success: true, stored: totalStored };
});
/**
 * Manual trigger function for testing
 */
exports.fetchMentorsManual = functions.https.onRequest(async (req, res) => {
    var _a, _b;
    try {
        console.log('Manual mentor search triggered...');
        const apiKey = ((_a = functions.config().google) === null || _a === void 0 ? void 0 : _a.search_api_key) || req.query.apiKey;
        const searchEngineId = ((_b = functions.config().google) === null || _b === void 0 ? void 0 : _b.search_engine_id) || req.query.engineId;
        const category = req.query.category || 'Software Engineering';
        const query = req.query.query || `${category} mentor LinkedIn`;
        if (!apiKey || !searchEngineId) {
            res.status(400).json({
                success: false,
                error: 'Missing API credentials. Provide as query params: apiKey, engineId'
            });
            return;
        }
        const results = await searchGoogle(query, apiKey, searchEngineId);
        const mentors = parseMentorProfiles(results, category);
        const stored = await storeMentors(mentors);
        res.json({
            success: true,
            category,
            query,
            fetched: mentors.length,
            stored,
            mentors: mentors.slice(0, 5) // Return first 5 for preview
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
//# sourceMappingURL=fetchMentors.js.map
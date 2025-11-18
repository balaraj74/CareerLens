"use strict";
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
exports.fetchCareerUpdates = void 0;
const pubsub_1 = require("firebase-functions/v2/pubsub");
const admin = __importStar(require("firebase-admin"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firestore_1 = require("firebase-admin/firestore");
const vertexai_1 = require("@google-cloud/vertexai");
const secret_manager_1 = require("@google-cloud/secret-manager");
const app_1 = require("firebase-admin/app");
const logger = __importStar(require("firebase-functions/logger"));
// Initialize Firebase Admin SDK if not already initialized
if (!process.env.FIREBASE_CONFIG) {
    (0, app_1.initializeApp)({
        credential: (0, app_1.applicationDefault)(),
        projectId: 'careerlens-1',
    });
}
const db = (0, firestore_1.getFirestore)();
const secretClient = new secret_manager_1.SecretManagerServiceClient();
const vertex = new vertexai_1.VertexAI({ project: "careerlens-1", location: "us-central1" });
// Helper to get secrets
async function getSecret(name) {
    var _a, _b;
    try {
        const [version] = await secretClient.accessSecretVersion({
            name: `projects/${process.env.GCP_PROJECT || 'careerlens-1'}/secrets/${name}/versions/latest`,
        });
        return ((_b = (_a = version.payload) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.toString()) || '';
    }
    catch (error) {
        logger.warn(`Could not access secret ${name}, using fallback/mock mode.`);
        return '';
    }
}
async function fetchNews(apiKey, query) {
    if (!apiKey)
        return { articles: [] };
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&apiKey=${apiKey}`;
    try {
        const r = await (0, node_fetch_1.default)(url);
        return await r.json();
    }
    catch (e) {
        logger.error("Error fetching news", e);
        return { articles: [] };
    }
}
async function fetchReddit(subreddit) {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;
    try {
        const r = await (0, node_fetch_1.default)(url, { headers: { 'User-Agent': 'CareerLens/1.0' } });
        return await r.json();
    }
    catch (e) {
        logger.error(`Error fetching reddit ${subreddit}`, e);
        return {};
    }
}
async function summarizeWithVertexAI(text) {
    var _a;
    const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    You are an expert career analyst. Given the raw news and forum data below, output only valid JSON with these fields:
    {
      "trendingSkills": [{"skill":"AI","changePct":23,"evidence":["..."]}],
      "jobs":[{"title":"ML Engineer","city":"Bengaluru","count":1200,"exampleLinks":["..."]}],
      "certifications":[{"name":"Generative AI Developer","platform":"Coursera","url":"..."}],
      "opportunities":[{"title": "...", "summary": "..."}],
      "insights":"one-line highlight",
      "metrics": { "aiMlGrowthPct": 0, "reactOpenings": 0, "topCity": "..." }
    }
    
    Analyze the following raw data and extract real trends. If data is sparse, infer reasonable trends based on the content.
    
    RAW DATA:
    ${text.substring(0, 30000)} 
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = ((_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content.parts[0].text) || "{}";
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    }
    catch (e) {
        logger.error("Vertex AI summarization failed", e);
        return {
            trendingSkills: [],
            jobs: [],
            certifications: [],
            opportunities: [],
            insights: "Data analysis unavailable at the moment.",
            metrics: {}
        };
    }
}
exports.fetchCareerUpdates = (0, pubsub_1.onMessagePublished)({
    topic: "career-updates-trigger",
    timeoutSeconds: 540,
    memory: "1GiB"
}, async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        logger.info("Starting career updates fetch...");
        // 1. Load secrets
        const newsApiKey = await getSecret("NEWS_API_KEY");
        // 2. Fetch from multiple sources (parallel)
        const [news, redditCs, redditWebDev] = await Promise.all([
            fetchNews(newsApiKey, "AI careers OR data scientist OR machine learning"),
            fetchReddit("cscareerquestions"),
            fetchReddit("webdev")
        ]);
        // 3. Save raw payloads
        const rawBatch = db.batch();
        const rawRef = db.collection('rawFetches').doc();
        rawBatch.set(rawRef, {
            source: 'combined',
            payload: {
                newsCount: (_a = news === null || news === void 0 ? void 0 : news.articles) === null || _a === void 0 ? void 0 : _a.length,
                redditCsCount: (_c = (_b = redditCs === null || redditCs === void 0 ? void 0 : redditCs.data) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.length
            },
            fetchedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await rawBatch.commit();
        // 4. Normalize & prepare text
        const combinedText = JSON.stringify({
            news: ((_d = news === null || news === void 0 ? void 0 : news.articles) === null || _d === void 0 ? void 0 : _d.map((a) => a.title + " - " + a.description).slice(0, 10)) || [],
            reddit: [
                ...(((_f = (_e = redditCs === null || redditCs === void 0 ? void 0 : redditCs.data) === null || _e === void 0 ? void 0 : _e.children) === null || _f === void 0 ? void 0 : _f.map((c) => c.data.title + " " + c.data.selftext)) || []),
                ...(((_h = (_g = redditWebDev === null || redditWebDev === void 0 ? void 0 : redditWebDev.data) === null || _g === void 0 ? void 0 : _g.children) === null || _h === void 0 ? void 0 : _h.map((c) => c.data.title + " " + c.data.selftext)) || [])
            ].slice(0, 20)
        });
        // 5. Summarize
        const summary = await summarizeWithVertexAI(combinedText);
        // 6. Write snapshot
        const snapshot = {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            summary,
            meta: { sources: ['newsapi', 'reddit'] },
            metrics: summary.metrics || {}
        };
        await db.collection('careerUpdates').add(snapshot);
        // 7. Update aggregated metrics
        if ((_j = summary.metrics) === null || _j === void 0 ? void 0 : _j.topCity) {
            await db.collection('jobCountsBySkill').doc('global_metrics').set({
                latest: summary.metrics,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        logger.info('Career updates fetched & stored successfully.');
    }
    catch (err) {
        logger.error('fetchCareerUpdates error:', err);
        throw err;
    }
});
//# sourceMappingURL=fetchCareerIntelligence.js.map
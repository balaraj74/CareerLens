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
exports.refreshCareerUpdates = exports.fetchCareerUpdates = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const node_fetch_1 = __importDefault(require("node-fetch"));
const firestore_1 = require("firebase-admin/firestore");
const vertexai_1 = require("@google-cloud/vertexai");
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
const vertex = new vertexai_1.VertexAI({ project: "careerlens-1", location: "us-central1" });
async function fetchAndSummarizeData() {
    var _a, _b, _c, _d, _e;
    // Use free Reddit API and mock data since News API requires a key
    const sources = [
        "https://www.reddit.com/r/cscareerquestions/hot.json?limit=10",
        "https://www.reddit.com/r/learnprogramming/hot.json?limit=10",
        "https://www.reddit.com/r/webdev/hot.json?limit=10",
        "https://www.reddit.com/r/programming/hot.json?limit=5"
    ];
    let allData = [];
    for (const url of sources) {
        try {
            const res = await (0, node_fetch_1.default)(url, {
                headers: {
                    'User-Agent': 'CareerLens/1.0'
                }
            });
            if (res.ok) {
                const json = await res.json();
                if (json.data && json.data.children) {
                    allData.push(...json.data.children.map((child) => {
                        var _a;
                        return ({
                            title: child.data.title,
                            url: child.data.url,
                            subreddit: child.data.subreddit,
                            score: child.data.score,
                            selftext: (_a = child.data.selftext) === null || _a === void 0 ? void 0 : _a.substring(0, 500)
                        });
                    }));
                }
            }
            else {
                logger.error(`Failed to fetch ${url}: ${res.statusText}`);
            }
        }
        catch (error) {
            logger.error(`Error fetching ${url}:`, error);
        }
    }
    if (allData.length === 0) {
        logger.log("No data fetched, using fallback data.");
        // Provide fallback mock data
        allData = [
            { title: "AI and Machine Learning Skills in High Demand for 2025", subreddit: "cscareerquestions" },
            { title: "Best Cloud Certifications for Career Growth", subreddit: "learnprogramming" },
            { title: "Remote Work Opportunities for Full Stack Developers", subreddit: "webdev" }
        ];
    }
    // Summarize using Gemini
    const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash" });
    const summaryPrompt = `
    Summarize the latest tech/career/job/certification discussions from Reddit below.
    Group them into exactly 4 categories:
    - trendingSkills: Top 4-5 skills and technologies being discussed
    - certifications: Top 3-4 certifications mentioned
    - opportunities: Top 3-4 job/career opportunities discussed  
    - aiInsights: Top 3-4 AI-powered insights or predictions
    
    For each item, provide:
    - title: A catchy, concise title (max 10 words)
    - summary: A brief 1-2 sentence summary (max 50 words)
    
    Return ONLY valid JSON in this exact format:
    {
      "trendingSkills": [{"title": "...", "summary": "..."}],
      "certifications": [{"title": "...", "summary": "..."}],
      "opportunities": [{"title": "...", "summary": "..."}],
      "aiInsights": [{"title": "...", "summary": "..."}]
    }
    
    Reddit posts:
    ${JSON.stringify(allData.slice(0, 20))}
  `;
    try {
        const summarized = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: summaryPrompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });
        // Extract the JSON string from the response
        const responseText = ((_e = (_d = (_c = (_b = (_a = summarized.response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || '{}';
        logger.log('Raw Gemini response:', responseText);
        // Extract JSON from markdown code blocks if present
        let jsonString = responseText;
        if (responseText.includes('```json')) {
            jsonString = responseText.substring(responseText.indexOf('```json') + 7, responseText.lastIndexOf('```')).trim();
        }
        else if (responseText.includes('```')) {
            jsonString = responseText.substring(responseText.indexOf('```') + 3, responseText.lastIndexOf('```')).trim();
        }
        else {
            // Try to find JSON object
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) {
                jsonString = responseText.substring(start, end);
            }
        }
        const summaryJson = JSON.parse(jsonString);
        logger.log('Parsed summary:', summaryJson);
        await db.collection("careerIntelligence").doc("latest").set({
            summary: summaryJson,
            timestamp: new Date(),
        });
        logger.log("Successfully fetched and summarized career intelligence data.");
        return summaryJson;
    }
    catch (error) {
        logger.error("Error summarizing data with Vertex AI or saving to Firestore:", error);
        // Fallback to mock data if AI fails
        const fallbackSummary = {
            trendingSkills: [
                { title: "React & Next.js Frameworks", summary: "Modern web development continues to favor React ecosystem with Next.js gaining massive adoption." },
                { title: "Python for AI/ML", summary: "Python remains the dominant language for artificial intelligence and machine learning applications." },
                { title: "Cloud Computing (AWS/Azure/GCP)", summary: "Cloud infrastructure skills are essential, with multi-cloud expertise becoming increasingly valuable." },
                { title: "TypeScript Adoption", summary: "TypeScript usage is growing rapidly, becoming the preferred choice for large-scale applications." }
            ],
            certifications: [
                { title: "AWS Solutions Architect", summary: "One of the most sought-after certifications, validating cloud architecture expertise." },
                { title: "Google Professional Cloud Architect", summary: "Demonstrates ability to design and manage Google Cloud solutions effectively." },
                { title: "Azure Developer Associate", summary: "Proves proficiency in developing cloud applications on Microsoft Azure platform." }
            ],
            opportunities: [
                { title: "Full Stack Developer Roles", summary: "High demand for developers skilled in both frontend and backend technologies." },
                { title: "DevOps Engineers", summary: "Companies actively hiring for CI/CD pipeline and infrastructure automation expertise." },
                { title: "AI/ML Engineer Positions", summary: "Explosive growth in roles focused on machine learning model development and deployment." }
            ],
            aiInsights: [
                { title: "Remote Work is Here to Stay", summary: "Tech industry embracing permanent remote and hybrid work models globally." },
                { title: "AI Augmenting Developer Productivity", summary: "AI coding assistants like GitHub Copilot transforming how developers write code." },
                { title: "Emphasis on Soft Skills", summary: "Communication and collaboration skills becoming as important as technical abilities." }
            ]
        };
        await db.collection("careerIntelligence").doc("latest").set({
            summary: fallbackSummary,
            timestamp: new Date(),
            fallback: true
        });
        logger.log("Used fallback data due to AI error");
        return fallbackSummary;
    }
}
exports.fetchCareerUpdates = (0, scheduler_1.onSchedule)("every 12 hours", async () => {
    try {
        await fetchAndSummarizeData();
    }
    catch (error) {
        logger.error("Error in scheduled career update:", error);
    }
});
exports.refreshCareerUpdates = (0, https_1.onRequest)(async (req, res) => {
    try {
        await fetchAndSummarizeData();
        res.json({ success: true, message: "Successfully refreshed career intelligence data." });
    }
    catch (error) {
        logger.error("Error in manual career update refresh:", error);
        res.status(500).json({ success: false, message: "Failed to refresh career intelligence data." });
    }
});
//# sourceMappingURL=fetchCareerIntelligence.js.map
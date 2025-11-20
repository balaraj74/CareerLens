
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as admin from 'firebase-admin';
import fetch from "node-fetch";
import { getFirestore } from "firebase-admin/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK if not already initialized
if (!process.env.FIREBASE_CONFIG) {
  initializeApp({
    credential: applicationDefault(),
    projectId: 'careerlens-1',
  });
}

const db = getFirestore();
const secretClient = new SecretManagerServiceClient();
const vertex = new VertexAI({ project: "careerlens-1", location: "us-central1" });

// Helper to get secrets
async function getSecret(name: string): Promise<string> {
  try {
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/${process.env.GCP_PROJECT || 'careerlens-1'}/secrets/${name}/versions/latest`,
    });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    logger.warn(`Could not access secret ${name}, using fallback/mock mode.`);
    return '';
  }
}

async function fetchNews(apiKey: string, query: string) {
  if (!apiKey) return { articles: [] };
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&apiKey=${apiKey}`;
  try {
    const r = await fetch(url);
    return await r.json();
  } catch (e) {
    logger.error("Error fetching news", e);
    return { articles: [] };
  }
}

async function fetchReddit(subreddit: string) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'CareerLens/1.0' } });
    return await r.json();
  } catch (e) {
    logger.error(`Error fetching reddit ${subreddit}`, e);
    return {};
  }
}

async function summarizeWithVertexAI(text: string) {
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
    const text = response.candidates?.[0].content.parts[0].text || "{}";
    
    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
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

export const fetchCareerUpdates = onMessagePublished({
  topic: "career-updates-trigger",
  timeoutSeconds: 540,
  memory: "1GiB"
}, async (event) => {
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
        newsCount: (news as any)?.articles?.length, 
        redditCsCount: (redditCs as any)?.data?.children?.length 
      },
      fetchedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await rawBatch.commit();

    // 4. Normalize & prepare text
    const combinedText = JSON.stringify({
      news: (news as any)?.articles?.map((a: any) => a.title + " - " + a.description).slice(0, 10) || [],
      reddit: [
        ...((redditCs as any)?.data?.children?.map((c: any) => c.data.title + " " + c.data.selftext) || []),
        ...((redditWebDev as any)?.data?.children?.map((c: any) => c.data.title + " " + c.data.selftext) || [])
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
    if (summary.metrics?.topCity) {
      await db.collection('jobCountsBySkill').doc('global_metrics').set({
        latest: summary.metrics,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    logger.info('Career updates fetched & stored successfully.');
  } catch (err) {
    logger.error('fetchCareerUpdates error:', err);
    throw err;
  }
});

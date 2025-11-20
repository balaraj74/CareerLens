// Cloud Function for Real-Time Career Intel Engine
// Triggered by Pub/Sub topic: career-updates-trigger

const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const { VertexAI } = require('@google-cloud/vertexai');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fetch = require('node-fetch');

const db = new Firestore({ projectId: 'careerlens-1' });
const secretClient = new SecretManagerServiceClient();
const vertex = new VertexAI({ project: 'careerlens-1', location: 'us-central1' });

// Helper to get secrets from Secret Manager
async function getSecret(name) {
  try {
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/careerlens-1/secrets/${name}/versions/latest`,
    });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.warn(`Could not access secret ${name}, using fallback mode.`);
    return '';
  }
}

// Fetch news from NewsAPI
async function fetchNews(apiKey, query) {
  if (!apiKey) return { articles: [] };
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return { articles: [] };
  }
}

// Fetch from Reddit
async function fetchReddit(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CareerLens/1.0' }
    });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching reddit ${subreddit}:`, error);
    return {};
  }
}

// Summarize with Vertex AI Gemini
async function summarizeWithVertexAI(text) {
  const model = vertex.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
    const responseText = response.candidates?.[0].content.parts[0].text || '{}';
    
    // Clean up markdown code blocks if present
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Vertex AI summarization failed:', error);
    return {
      trendingSkills: [],
      jobs: [],
      certifications: [],
      opportunities: [],
      insights: 'Data analysis unavailable at the moment.',
      metrics: {}
    };
  }
}

// Main Cloud Function - triggered by Pub/Sub
functions.cloudEvent('fetchCareerUpdates', async (cloudEvent) => {
  try {
    console.log('Starting career updates fetch...');
    console.log('Cloud Event:', cloudEvent);

    // 1. Load secrets (optional NewsAPI key)
    const newsApiKey = await getSecret('NEWS_API_KEY');

    // 2. Fetch from multiple sources in parallel
    const [news, redditCs, redditWebDev] = await Promise.all([
      fetchNews(newsApiKey, 'AI careers OR data scientist OR machine learning'),
      fetchReddit('cscareerquestions'),
      fetchReddit('webdev')
    ]);

    console.log(`Fetched: ${news?.articles?.length || 0} news articles, ${redditCs?.data?.children?.length || 0} reddit posts`);

    // 3. Save raw payloads to Firestore
    await db.collection('rawFetches').add({
      source: 'combined',
      payload: {
        newsCount: news?.articles?.length || 0,
        redditCsCount: redditCs?.data?.children?.length || 0,
        redditWebDevCount: redditWebDev?.data?.children?.length || 0
      },
      fetchedAt: new Date()
    });

    // 4. Normalize & prepare text for AI
    const combinedText = JSON.stringify({
      news: news?.articles?.map(a => `${a.title} - ${a.description}`).slice(0, 10) || [],
      reddit: [
        ...(redditCs?.data?.children?.map(c => `${c.data.title} ${c.data.selftext}`) || []),
        ...(redditWebDev?.data?.children?.map(c => `${c.data.title} ${c.data.selftext}`) || [])
      ].slice(0, 20)
    });

    // 5. Summarize with Vertex AI
    console.log('Sending to Vertex AI for summarization...');
    const summary = await summarizeWithVertexAI(combinedText);
    console.log('AI Summary generated:', summary);

    // 6. Write summarized snapshot to Firestore
    const snapshot = {
      timestamp: new Date(),
      summary,
      meta: { sources: ['newsapi', 'reddit'] },
      metrics: summary.metrics || {}
    };

    await db.collection('careerUpdates').add(snapshot);
    console.log('Career updates snapshot saved to Firestore');

    // 7. Update aggregated metrics
    if (summary.metrics?.topCity) {
      await db.collection('jobCountsBySkill').doc('global_metrics').set({
        latest: summary.metrics,
        updatedAt: new Date()
      }, { merge: true });
    }

    console.log('✅ Career updates fetched & stored successfully!');
  } catch (error) {
    console.error('❌ fetchCareerUpdates error:', error);
    throw error;
  }
});

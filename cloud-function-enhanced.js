// Enhanced Real-Time Career Intel Engine
// Now with Google Custom Search API for real career websites!

const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const { VertexAI } = require('@google-cloud/vertexai');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fetch = require('node-fetch');

const db = new Firestore({ projectId: 'careerlens-1' });
const secretClient = new SecretManagerServiceClient();
const vertex = new VertexAI({ project: 'careerlens-1', location: 'us-central1' });

// Helper to get secrets
async function getSecret(name) {
  try {
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/careerlens-1/secrets/${name}/versions/latest`,
    });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.warn(`Could not access secret ${name}`);
    return '';
  }
}

// Fetch from Google Custom Search - REAL career websites!
async function fetchGoogleCareerSearch(apiKey, searchEngineId, query) {
  if (!apiKey || !searchEngineId) return { items: [] };
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google Custom Search error:', error);
    return { items: [] };
  }
}

// Fetch from multiple Reddit career subreddits
async function fetchReddit(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=15`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'CareerLens/2.0' } });
    return await response.json();
  } catch (error) {
    console.error(`Reddit error for ${subreddit}:`, error);
    return {};
  }
}

// Fetch from NewsAPI (optional)
async function fetchNews(apiKey, query) {
  if (!apiKey) return { articles: [] };
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=15&sortBy=publishedAt&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('NewsAPI error:', error);
    return { articles: [] };
  }
}

// Summarize with Vertex AI Gemini
async function summarizeWithVertexAI(combinedData) {
  const model = vertex.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const prompt = `You are an expert career analyst analyzing REAL-TIME data from multiple sources including Google Search results, Reddit discussions, and news articles.

IMPORTANT: Extract REAL data from the content provided. Do not make up numbers or percentages.

Output ONLY valid JSON with this structure:
{
  "trendingSkills": [
    {"skill": "React", "changePct": 15, "evidence": ["Based on X job postings mentioning React", "Y% increase in discussions"]},
    {"skill": "Python", "changePct": 20, "evidence": ["Z companies hiring", "Mentioned in A articles"]}
  ],
  "jobs": [
    {"title": "Software Engineer", "city": "Bengaluru", "count": 1500, "exampleLinks": ["indeed.com/...", "linkedin.com/..."]},
    {"title": "Data Scientist", "city": "San Francisco", "count": 800, "exampleLinks": ["..."]  }
  ],
  "certifications": [
    {"name": "AWS Solutions Architect", "platform": "AWS", "url": "https://..."},
    {"name": "Google Cloud Professional", "platform": "Google Cloud", "url": "https://..."}
  ],
  "opportunities": [
    {"title": "Remote Work Expansion", "summary": "Based on search results: X companies now offering remote positions"},
    {"title": "AI Job Growth", "summary": "Y% increase in AI-related job postings"}
  ],
  "insights": "One compelling insight based on the data (max 150 chars)",
  "metrics": {
    "aiMlGrowthPct": 25,
    "reactOpenings": 5000,
    "topCity": "Bengaluru"
  }
}

ANALYZE THIS REAL-TIME DATA:

=== GOOGLE SEARCH RESULTS (Real career websites) ===
${JSON.stringify(combinedData.googleSearch).substring(0, 15000)}

=== REDDIT CAREER DISCUSSIONS ===
${JSON.stringify(combinedData.reddit).substring(0, 10000)}

=== NEWS ARTICLES ===
${JSON.stringify(combinedData.news).substring(0, 5000)}

Extract real trends, numbers, and insights. Be specific and data-driven.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates?.[0].content.parts[0].text || '{}';
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Vertex AI error:', error);
    return {
      trendingSkills: [],
      jobs: [],
      certifications: [],
      opportunities: [],
      insights: 'Data analysis in progress...',
      metrics: {}
    };
  }
}

// Main Cloud Function
functions.cloudEvent('fetchCareerUpdates', async (cloudEvent) => {
  try {
    console.log('🚀 Starting ENHANCED career updates fetch with Google Search...');

    // Load secrets
    const [newsApiKey, googleApiKey, searchEngineId] = await Promise.all([
      getSecret('NEWS_API_KEY'),
      getSecret('GOOGLE_CUSTOM_SEARCH_API_KEY'),
      getSecret('GOOGLE_SEARCH_ENGINE_ID')
    ]);

    // Fetch from MULTIPLE sources in parallel
    console.log('📡 Fetching from Google Search, Reddit (5 subreddits), and News...');
    
    const [
      googleJobs,
      googleSalary,
      googleTrends,
      googleSkills,
      redditCsCareer,
      redditWebDev,
      redditDataScience,
      redditDevOps,
      redditMachineLearning,
      news
    ] = await Promise.all([
      fetchGoogleCareerSearch(googleApiKey, searchEngineId, 'software engineer jobs hiring 2025'),
      fetchGoogleCareerSearch(googleApiKey, searchEngineId, 'tech salary trends 2025'),
      fetchGoogleCareerSearch(googleApiKey, searchEngineId, 'trending programming skills demand'),
      fetchGoogleCareerSearch(googleApiKey, searchEngineId, 'most in-demand tech skills certifications'),
      fetchReddit('cscareerquestions'),
      fetchReddit('webdev'),
      fetchReddit('datascience'),
      fetchReddit('devops'),
      fetchReddit('MachineLearning'),
      fetchNews(newsApiKey, 'tech careers AI machine learning jobs')
    ]);

    const totalGoogleResults = (googleJobs.items?.length || 0) + (googleSalary.items?.length || 0) + 
                                (googleTrends.items?.length || 0) + (googleSkills.items?.length || 0);
    
    const totalRedditPosts = [redditCsCareer, redditWebDev, redditDataScience, redditDevOps, redditMachineLearning]
      .reduce((sum, r) => sum + (r.data?.children?.length || 0), 0);

    console.log(`✅ Fetched: ${totalGoogleResults} Google results, ${totalRedditPosts} Reddit posts, ${news.articles?.length || 0} news articles`);

    // Store raw data
    await db.collection('rawFetches').add({
      source: 'enhanced-multi-source',
      payload: {
        googleResultsCount: totalGoogleResults,
        redditPostsCount: totalRedditPosts,
        newsArticlesCount: news.articles?.length || 0,
        timestamp: new Date()
      },
      fetchedAt: new Date()
    });

    // Prepare combined data for AI
    const combinedData = {
      googleSearch: {
        jobs: googleJobs.items?.map(item => ({ title: item.title, snippet: item.snippet, link: item.link })) || [],
        salary: googleSalary.items?.map(item => ({ title: item.title, snippet: item.snippet })) || [],
        trends: googleTrends.items?.map(item => ({ title: item.title, snippet: item.snippet })) || [],
        skills: googleSkills.items?.map(item => ({ title: item.title, snippet: item.snippet })) || []
      },
      reddit: [
        ...(redditCsCareer.data?.children?.map(c => ({ title: c.data.title, text: c.data.selftext, subreddit: 'cscareerquestions' })) || []),
        ...(redditWebDev.data?.children?.map(c => ({ title: c.data.title, text: c.data.selftext, subreddit: 'webdev' })) || []),
        ...(redditDataScience.data?.children?.map(c => ({ title: c.data.title, text: c.data.selftext, subreddit: 'datascience' })) || []),
        ...(redditDevOps.data?.children?.map(c => ({ title: c.data.title, text: c.data.selftext, subreddit: 'devops' })) || []),
        ...(redditMachineLearning.data?.children?.map(c => ({ title: c.data.title, text: c.data.selftext, subreddit: 'MachineLearning' })) || [])
      ].slice(0, 30),
      news: news.articles?.map(a => ({ title: a.title, description: a.description })).slice(0, 15) || []
    };

    // Summarize with AI
    console.log('🤖 Sending to Vertex AI Gemini for analysis...');
    const summary = await summarizeWithVertexAI(combinedData);
    console.log('✅ AI analysis complete:', summary);

    // Store in Firestore
    const snapshot = {
      timestamp: new Date(),
      summary,
      meta: { 
        sources: ['Google Custom Search', 'Reddit (5 subreddits)', 'NewsAPI'],
        dataPoints: totalGoogleResults + totalRedditPosts + (news.articles?.length || 0)
      },
      metrics: summary.metrics || {}
    };

    await db.collection('careerUpdates').add(snapshot);

    // Update global metrics
    if (summary.metrics?.topCity) {
      await db.collection('jobCountsBySkill').doc('global_metrics').set({
        latest: summary.metrics,
        updatedAt: new Date()
      }, { merge: true });
    }

    console.log('✅ ENHANCED Career Intel stored successfully!');
    console.log(`📊 Data sources: Google (${totalGoogleResults}), Reddit (${totalRedditPosts}), News (${news.articles?.length || 0})`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
});

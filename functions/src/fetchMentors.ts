/**
 * Cloud Function: Fetch Mentors from Google Search
 * Runs daily to find career mentors online
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface MentorProfile {
  name: string;
  title: string;
  link: string;
  platform: string;
  snippet: string;
  category: string;
}

/**
 * Search Google Custom Search API
 */
async function searchGoogle(query: string, apiKey: string, searchEngineId: string): Promise<GoogleSearchResult[]> {
  try {
    const url = 'https://www.googleapis.com/customsearch/v1';
    const params = {
      key: apiKey,
      cx: searchEngineId,
      q: query,
      num: 10
    };

    const response = await axios.get(url, { params });

    if (response.data?.items) {
      return response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Search API error:', error);
    return [];
  }
}

/**
 * Parse mentor profiles from search results
 */
function parseMentorProfiles(results: GoogleSearchResult[], category: string): MentorProfile[] {
  return results.map(result => {
    // Extract name from title (usually "Name - Title" or "Name | Title")
    const titleParts = result.title.split(/[-|]/);
    const name = titleParts[0]?.trim() || result.title;
    const title = titleParts[1]?.trim() || 'Career Mentor';

    // Determine platform
    let platform = 'Web';
    if (result.link.includes('linkedin.com')) platform = 'LinkedIn';
    else if (result.link.includes('github.com')) platform = 'GitHub';
    else if (result.link.includes('twitter.com') || result.link.includes('x.com')) platform = 'Twitter/X';
    else if (result.link.includes('medium.com')) platform = 'Medium';

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
async function storeMentors(mentors: MentorProfile[]): Promise<number> {
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
      batch.set(docRef, {
        ...mentor,
        fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
        verified: false,
        rating: 0,
        reviews: 0
      });
      stored++;
    } else {
      // Update existing mentor
      const docRef = collectionRef.doc(mentorId);
      batch.update(docRef, {
        ...mentor,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  await batch.commit();
  return stored;
}

/**
 * Scheduled function - runs daily at 2 AM IST
 */
export const fetchMentorsScheduled = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Starting scheduled mentor search...');

    // Get API credentials from environment
    const apiKey = functions.config().google?.search_api_key;
    const searchEngineId = functions.config().google?.search_engine_id;

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
export const fetchMentorsManual = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Manual mentor search triggered...');

    const apiKey = functions.config().google?.search_api_key || req.query.apiKey as string;
    const searchEngineId = functions.config().google?.search_engine_id || req.query.engineId as string;
    const category = req.query.category as string || 'Software Engineering';
    const query = req.query.query as string || `${category} mentor LinkedIn`;

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
  } catch (error: any) {
    console.error('Manual fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

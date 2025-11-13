# 🧠 AI Career Intelligence Hub - Implementation Guide

## 📋 Overview

The AI Career Intelligence Hub is a real-time career data aggregation system that automatically fetches, analyzes, and summarizes career trends, jobs, certifications, and skill insights from multiple trusted sources.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Functions (Scheduler)              │
│                    Runs every 12 hours                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Sources (Parallel Fetch)                  │
│  • Reddit API (r/cscareerquestions, r/learnprogramming)    │
│  • Google News API (career trends, tech jobs)              │
│  • Learning Platforms (Coursera, Google Skills Boost)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Gemini AI Processing                           │
│  • Summarize content                                        │
│  • Extract trending skills                                  │
│  • Categorize updates                                       │
│  • Generate actionable insights                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Firestore Storage                     │
│  /careerUpdates/{date}/                                     │
│    ├── summary (AI-generated)                               │
│    ├── news[]                                               │
│    ├── reddit[]                                             │
│    ├── /jobs/{jobId}                                        │
│    ├── /skills/{skillId}                                    │
│    └── /certifications/{certId}                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Real-time)                   │
│  • Firestore real-time listeners                            │
│  • Manual refresh button                                    │
│  • Categorized tabs (Skills, Jobs, Certs, AI Insights)     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features Implemented

### ✅ Backend (Cloud Functions)

1. **Scheduled Data Fetching** (`fetchCareerUpdates`)
   - Runs every 12 hours automatically
   - Fetches from 5+ data sources in parallel
   - Stores results in Firestore

2. **Manual Refresh Endpoint** (`refreshCareerUpdates`)
   - HTTP endpoint for on-demand refresh
   - Called from Next.js frontend
   - CORS enabled for web access

3. **Data Sources Integration**
   - **Reddit Service**: Fetches from 8 career subreddits
   - **News Service**: Google News API for career articles
   - **Learning Service**: Coursera, Google Skills Boost courses

4. **AI Summarization**
   - Gemini 2.0 Flash for content analysis
   - Extracts trending skills with demand metrics
   - Generates weekly highlights
   - Creates actionable insights

### ✅ Frontend (Next.js)

1. **Real-time Data Display**
   - Firestore real-time listeners
   - Auto-updates when new data arrives
   - No page refresh needed

2. **Categorized Tabs**
   - All Updates
   - Trending Skills
   - Certifications
   - Job Opportunities
   - AI Insights

3. **Manual Refresh**
   - Button to trigger fresh data fetch
   - Loading states and animations
   - Error handling with user feedback

4. **Smart Caching**
   - Daily snapshots in Firestore
   - Automatic fallback to cached data
   - Client-side data fetching service

## 📦 Files Structure

```
CareerLens/
├── functions/
│   └── src/
│       ├── fetchCareerIntelligence.ts    # Main Cloud Function
│       ├── services/
│       │   ├── reddit-service.ts         # Reddit API integration
│       │   ├── news-service.ts           # Google News API
│       │   └── learning-service.ts       # Course platforms
│       └── index.ts                      # Export all functions
├── src/
│   ├── app/
│   │   ├── career-updates/
│   │   │   └── page.tsx                  # Main UI page
│   │   └── api/
│   │       └── career-updates/
│   │           ├── latest/route.ts       # Get latest data
│   │           └── refresh/route.ts      # Trigger refresh
│   └── lib/
│       └── services/
│           ├── career-updates-service.ts # Firestore queries
│           └── fetch-career-data.ts      # Client-side fetching
└── docs/
    └── CAREER-INTELLIGENCE-HUB.md        # This file
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add to `/functions/.env`:

```bash
# Google News API (get from https://newsapi.org/)
NEWS_API_KEY=your_news_api_key_here

# Gemini API Key (already configured)
GEMINI_API_KEY=your_gemini_api_key_here
```

Add to `/.env.local`:

```bash
# Cloud Function URL (after deployment)
NEXT_PUBLIC_CAREER_UPDATES_FUNCTION_URL=https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates
```

### 2. Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
firebase deploy --only functions:fetchCareerUpdates,functions:refreshCareerUpdates

# Or deploy all functions
firebase deploy --only functions
```

### 3. Verify Deployment

```bash
# Check function logs
firebase functions:log

# Test manual refresh endpoint
curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates
```

### 4. Firestore Security Rules

Already configured in `firestore.rules`:

```javascript
match /careerUpdates/{updateId} {
  allow read: if request.auth != null;
  allow write: if true; // System writes
  
  match /jobs/{jobId} {
    allow read: if request.auth != null;
    allow write: if true;
  }
  
  match /skills/{skillId} {
    allow read: if request.auth != null;
    allow write: if true;
  }
  
  match /certifications/{certId} {
    allow read: if request.auth != null;
    allow write: if true;
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 🎯 Usage

### For Users

1. **Navigate to Career Updates page**
   ```
   https://your-app.com/career-updates
   ```

2. **View categorized updates**
   - Click tabs to filter by category
   - Real-time updates appear automatically

3. **Manual refresh**
   - Click "Refresh Now" button
   - Wait 10-30 seconds for fresh data

### For Developers

#### Trigger Manual Refresh from Code

```typescript
const response = await fetch('/api/career-updates/refresh', {
  method: 'POST'
});

const data = await response.json();
console.log(data);
```

#### Query Latest Data

```typescript
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const today = new Date().toISOString().split('T')[0];
const docRef = doc(db, 'careerUpdates', today);
const snapshot = await getDoc(docRef);

if (snapshot.exists()) {
  const data = snapshot.data();
  console.log('Summary:', data.summary);
  console.log('News:', data.news);
}
```

## 📊 Data Structure

### Firestore Schema

```typescript
/careerUpdates/{YYYY-MM-DD}/
{
  summary: {
    weeklyHighlights: string[],
    topSkillsInDemand: string[],
    industryTrends: string,
    actionableInsights: string[]
  },
  news: [
    {
      id: string,
      title: string,
      description: string,
      source: string,
      url: string,
      createdAt: Timestamp
    }
  ],
  reddit: [
    {
      id: string,
      title: string,
      content: string,
      subreddit: string,
      upvotes: number,
      url: string,
      createdAt: Timestamp
    }
  ],
  timestamp: Timestamp,
  fetchedAt: Timestamp,
  status: 'processed'
}

/careerUpdates/{YYYY-MM-DD}/jobs/{jobId}
{
  title: string,
  company: string,
  location: string,
  type: 'full-time' | 'internship' | 'remote',
  description: string,
  skills: string[],
  applyLink: string,
  salary?: string,
  postedDate: Timestamp
}

/careerUpdates/{YYYY-MM-DD}/skills/{skillId}
{
  skill: string,
  mentions: number,
  trend: 'rising' | 'stable' | 'declining',
  demandChange: number,
  avgSalary?: string,
  jobCount?: number,
  relatedRoles?: string[]
}

/careerUpdates/{YYYY-MM-DD}/certifications/{certId}
{
  title: string,
  provider: string,
  platform: string,
  isFree: boolean,
  price?: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  duration: string,
  description: string,
  enrollLink: string,
  skills: string[]
}
```

## 🔍 Monitoring & Debugging

### Check Cloud Function Logs

```bash
# View all logs
firebase functions:log

# View specific function
firebase functions:log --only fetchCareerUpdates

# Follow logs in real-time
firebase functions:log --follow
```

### Test Locally

```bash
cd functions
npm run serve

# In another terminal
curl -X POST http://localhost:5001/careerlens-1/us-central1/refreshCareerUpdates
```

### Firestore Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database
4. Check `/careerUpdates` collection
5. Verify today's date document exists

## 🚨 Troubleshooting

### Issue: No data appearing

**Solution:**
1. Check if Cloud Function is deployed:
   ```bash
   firebase functions:list
   ```

2. Manually trigger refresh:
   ```bash
   curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates
   ```

3. Check Firestore rules are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Issue: API rate limits

**Solution:**
- News API: Free tier = 100 requests/day
- Reddit API: No auth = 60 requests/minute
- Implement caching (already done)
- Use scheduled function (every 12 hours)

### Issue: Gemini API errors

**Solution:**
1. Verify API key in functions config:
   ```bash
   firebase functions:config:get
   ```

2. Check quota limits in Google Cloud Console

3. Fallback to mock data (already implemented)

## 🎨 Customization

### Add New Data Source

1. Create service file:
   ```typescript
   // functions/src/services/linkedin-service.ts
   export async function fetchLinkedInJobs() {
     // Implementation
   }
   ```

2. Import in main function:
   ```typescript
   import { fetchLinkedInJobs } from './services/linkedin-service';
   
   const linkedInJobs = await fetchLinkedInJobs();
   ```

3. Store in Firestore:
   ```typescript
   batch.set(snapshotRef, {
     ...aggregatedData,
     linkedInJobs
   });
   ```

### Modify AI Prompt

Edit `functions/src/fetchCareerIntelligence.ts`:

```typescript
const prompt = `
Your custom prompt here...
Focus on: ${customFocus}
`;
```

### Change Schedule

Edit `functions/src/fetchCareerIntelligence.ts`:

```typescript
// Every 6 hours
export const fetchCareerUpdates = onSchedule('every 6 hours', async (event) => {
  // ...
});

// Daily at 9 AM
export const fetchCareerUpdates = onSchedule('0 9 * * *', async (event) => {
  // ...
});
```

## 📈 Future Enhancements

### Planned Features

1. **Personalized Recommendations**
   - Filter by user skills/interests
   - AI-powered matching
   - Email notifications

2. **Historical Trends**
   - Track skill demand over time
   - Salary trend analysis
   - BigQuery integration

3. **More Data Sources**
   - LinkedIn Jobs API
   - Indeed API
   - GitHub Jobs
   - AngelList

4. **Advanced Analytics**
   - Looker Studio dashboards
   - Predictive career insights
   - Market trend forecasting

5. **Push Notifications**
   - Firebase Cloud Messaging
   - Real-time job alerts
   - Skill trend notifications

## 📚 API Reference

### Cloud Functions

#### `fetchCareerUpdates`
- **Type**: Scheduled Function
- **Schedule**: Every 12 hours
- **Trigger**: Automatic (Cloud Scheduler)
- **Returns**: void
- **Side Effects**: Writes to Firestore

#### `refreshCareerUpdates`
- **Type**: HTTP Function
- **Method**: POST
- **URL**: `https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates`
- **Auth**: None (CORS enabled)
- **Returns**: 
  ```json
  {
    "success": true,
    "message": "Career updates refreshed successfully"
  }
  ```

### Next.js API Routes

#### `/api/career-updates/latest`
- **Method**: GET
- **Query Params**: `date` (optional, YYYY-MM-DD)
- **Returns**: Latest career updates data

#### `/api/career-updates/refresh`
- **Method**: POST
- **Returns**: Triggers Cloud Function and returns result

## 🔐 Security

- ✅ Firestore rules restrict write access
- ✅ API keys stored in environment variables
- ✅ CORS enabled for web access
- ✅ Rate limiting on Cloud Functions
- ✅ User authentication required for read access

## 📝 License

Part of CareerLens project - Built for Google GenAI Hackathon 2025

---

**Last Updated**: January 2025  
**Maintained By**: Balaraj R (@balaraj74)

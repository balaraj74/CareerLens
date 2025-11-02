# Real-Time Data Intelligence System

## Overview

CareerLens now includes a production-grade real-time data intelligence system that automatically fetches and processes:
- **Student Reviews** from Reddit (7 education subreddits)
- **Free Courses** from NPTEL, Coursera, AWS, Google Cloud
- **Mentor Profiles** via Google Search + LinkedIn
- **AI-Powered Insights** using Gemini 2.5 Flash Lite

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  External APIs  │────▶│  Data Services   │────▶│   Firestore     │
│  - Reddit JSON  │     │  - Fetchers      │     │  - Cache (24h)  │
│  - Google Search│     │  - Scrapers      │     │  - Raw Data     │
│  - NPTEL/Course │     │  - Rate Limiters │     │  - Summaries    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  AI Summarizer   │
                        │  - Sentiment     │
                        │  - Relevance     │
                        │  - Matching      │
                        └──────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  UI Components   │
                        │  - Real-time     │
                        │  - Notifications │
                        └──────────────────┘
```

## Services

### 1. Reddit API Service (`src/lib/reddit-api-service.ts`)

**Features:**
- Fetches student reviews from 7 Indian education subreddits
- Supports 6 exam categories (KCET, NEET, JEE, COMEDK, GATE, General)
- Intelligent caching (24-hour TTL)
- Rate limiting (2 seconds between requests)
- Duplicate prevention

**Functions:**
```typescript
// Fetch reviews for specific exam type
const reviews = await fetchCollegeReviews('KCET', 20);

// Get cached reviews
const cached = await getCachedRedditPosts('KCET');

// Refresh all categories
await refreshAllRedditReviews();
```

**Subreddits Searched:**
- r/Indian_Academia
- r/Indian_Engg
- r/JEENEETards
- r/CBSE
- r/Indian_Academians
- r/IndianTeenagers
- r/india

### 2. Google Custom Search Service (`src/lib/google-search-service.ts`)

**Features:**
- Enhanced review discovery beyond Reddit
- Course search across multiple platforms
- Mentor profile discovery (LinkedIn focus)
- Intelligent caching with Firestore
- Result categorization

**Functions:**
```typescript
// Search for college reviews
const reviews = await searchCollegeReviews('RV College', 'JEE');

// Search for free courses
const courses = await searchFreeCourses('Machine Learning', {
  level: 'beginner',
  platforms: ['coursera', 'udemy', 'nptel']
});

// Find mentors
const mentors = await searchMentors('Software Engineer', {
  company: 'Google',
  location: 'Bangalore'
});

// Search with auto-caching
const results = await searchWithCache({
  query: 'best engineering colleges',
  category: 'review'
});
```

### 3. Web Scraper Service (`src/lib/web-scraper-service.ts`)

**Features:**
- Scrapes 5 platforms: NPTEL, Coursera, AWS, GCP, YouTube
- No authentication required (uses public APIs/feeds)
- Rate limiting and error retry logic
- Structured data extraction
- Firestore caching

**Functions:**
```typescript
// Scrape individual platforms
const nptelCourses = await scrapeNPTELCourses();
const courseraCourses = await scrapeCoursera();
const awsCourses = await scrapeAWSEducate();
const gcpCourses = await scrapeGCPSkills();
const youtubeCourses = await scrapeYouTubeEducational('Python');

// Scrape all platforms at once
const results = await scrapeAllPlatforms();

// Get cached courses
const cached = await getCachedCourses('NPTEL');
```

**Platforms:**
- **NPTEL**: SWAYAM API (public JSON)
- **Coursera**: XML sitemap
- **AWS Educate**: RSS feed
- **Google Cloud Skills Boost**: Public catalog
- **YouTube**: Educational videos (requires API key)

### 4. AI Summarizer Service (`src/lib/ai-summarizer-service.ts`)

**Features:**
- Sentiment analysis (positive/neutral/negative)
- Review summarization with key points
- Course relevance scoring
- Mentor profile matching
- Batch processing with rate limiting

**Functions:**
```typescript
// Analyze sentiment
const sentiment = await analyzeSentiment(reviewText);

// Summarize review
const summary = await summarizeReview(redditPost);

// Batch summarize (with rate limiting)
const summaries = await batchSummarizeReviews(posts);

// Score course relevance
const recommendation = await scoreCourseRelevance(course, userProfile);

// Match mentor to user
const match = await matchMentorToUser(mentorProfile, userProfile);

// Process all data at once
const processed = await processAllData({
  reviews: redditPosts,
  courses: scrapedCourses,
  mentors: mentorProfiles,
  userProfile: currentUser
});
```

## Setup

### 1. Install Dependencies

```bash
npm install
# No additional packages needed - uses native fetch and existing Firebase/Genkit
```

### 2. Configure API Keys

Copy `.env.local.example` to `.env.local` and add your keys:

```bash
# Required: Google Custom Search
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_engine_id

# Optional: YouTube Data API
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key

# Reddit API - No keys needed!
```

**Get Google Custom Search API:**
1. Go to https://developers.google.com/custom-search/v1/introduction
2. Click "Get a Key"
3. Create a Custom Search Engine at https://cse.google.com/cse/
4. Add API key and Engine ID to `.env.local`

### 3. Deploy Firestore Rules & Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 4. Test Services

```typescript
// Test Reddit API
import { fetchCollegeReviews } from '@/lib/reddit-api-service';
const reviews = await fetchCollegeReviews('KCET', 10);
console.log('Reddit Reviews:', reviews);

// Test Google Search
import { searchCollegeReviews } from '@/lib/google-search-service';
const searchResults = await searchCollegeReviews('PESIT', 'JEE');
console.log('Search Results:', searchResults);

// Test Web Scraper
import { scrapeNPTELCourses } from '@/lib/web-scraper-service';
const courses = await scrapeNPTELCourses();
console.log('NPTEL Courses:', courses);

// Test AI Summarizer
import { summarizeReview } from '@/lib/ai-summarizer-service';
const summary = await summarizeReview(reviews[0]);
console.log('AI Summary:', summary);
```

## Usage in Components

### Fetch and Display Reddit Reviews

```typescript
'use client';

import { useEffect, useState } from 'react';
import { fetchCollegeReviews } from '@/lib/reddit-api-service';
import { summarizeReview } from '@/lib/ai-summarizer-service';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      // Fetch fresh reviews
      const posts = await fetchCollegeReviews('KCET', 20);
      
      // Summarize with AI
      const summaries = await Promise.all(
        posts.slice(0, 5).map(post => summarizeReview(post))
      );
      
      setReviews(summaries);
      setLoading(false);
    }
    
    loadReviews();
  }, []);

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>
          <h3>{review.sentiment.sentiment.toUpperCase()}</h3>
          <p>{review.summary}</p>
          <ul>
            {review.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Real-Time Course Discovery

```typescript
'use client';

import { useEffect, useState } from 'react';
import { scrapeAllPlatforms } from '@/lib/web-scraper-service';
import { batchScoreCourses } from '@/lib/ai-summarizer-service';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    async function loadCourses() {
      // Scrape all platforms
      const results = await scrapeAllPlatforms();
      const allCourses = results.flatMap(r => r.courses);
      
      // Score with AI
      const userProfile = {
        currentRole: 'Student',
        targetRole: 'Software Engineer',
        skills: ['Python', 'JavaScript'],
        interests: ['Machine Learning', 'Web Development']
      };
      
      const scored = await batchScoreCourses(allCourses.slice(0, 10), userProfile);
      setCourses(scored);
    }
    
    loadCourses();
  }, []);

  return (
    <div>
      {courses.map(({ course, relevanceScore, matchReasons }) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>Relevance: {(relevanceScore * 100).toFixed(0)}%</p>
          <ul>
            {matchReasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
          <a href={course.url}>View Course</a>
        </div>
      ))}
    </div>
  );
}
```

## Firestore Collections

### `redditReviews`
- `id` (string): Unique post ID
- `title` (string): Post title
- `text` (string): Post content
- `author` (string): Reddit username
- `subreddit` (string): Source subreddit
- `url` (string): Reddit post URL
- `score` (number): Upvotes
- `numComments` (number): Comment count
- `created` (timestamp): Post date
- `category` (string): Exam category
- `sentiment` (object): AI sentiment analysis
- `summary` (string): AI-generated summary

### `googleSearchResults`
- `id` (string): Unique ID
- `title` (string): Result title
- `snippet` (string): Description
- `link` (string): URL
- `source` (string): "Google Search"
- `category` (string): review/course/mentor
- `relevanceScore` (number): AI score
- `publishDate` (timestamp): Publication date
- `metadata` (object): Additional info
- `addedAt` (timestamp): Fetch date

### `scrapedCourses`
- `id` (string): Unique ID
- `title` (string): Course name
- `description` (string): Course details
- `url` (string): Course URL
- `platform` (string): NPTEL/Coursera/AWS/GCP/YouTube
- `instructor` (string): Teacher name
- `duration` (string): Course length
- `level` (string): beginner/intermediate/advanced
- `skillTags` (array): Related skills
- `isFree` (boolean): Free/paid
- `rating` (number): Course rating
- `thumbnail` (string): Image URL
- `addedAt` (timestamp): Scrape date

### `cache`
- `key` (string): Cache identifier
- `lastUpdated` (timestamp): Last refresh time
- Used to track cache staleness (24h TTL)

## Rate Limiting

All services implement intelligent rate limiting:

| Service | Delay | Limit |
|---------|-------|-------|
| Reddit API | 2 seconds | 30 requests/minute |
| Google Search | 1 second | 100 requests/day (free tier) |
| Web Scraper | 2 seconds | Platform-dependent |
| AI Summarizer | 1 second | 60 requests/minute |

## Caching Strategy

- **Cache TTL**: 24 hours
- **Storage**: Firestore `/cache` collection
- **Auto-Refresh**: Cloud Functions (scheduled)
- **Manual Refresh**: User-triggered with rate limit check

## Error Handling

All services include:
- Retry logic (3 attempts)
- Fallback to cached data
- Graceful degradation
- Detailed error logging

## Next Steps

1. ✅ **Tasks 1-4 Complete**: Core services built
2. 🔄 **Task 5 In Progress**: Firebase Cloud Functions
3. ⏳ **Task 6-15**: UI integration, notifications, deployment

## API Quotas

**Free Tier Limits:**
- Google Custom Search: 100 queries/day
- YouTube Data API: 10,000 units/day
- Reddit JSON API: No official limit (be respectful)
- NPTEL/Coursera/AWS/GCP: No authentication needed

**Upgrade for Production:**
- Google Custom Search: $5 per 1,000 queries
- YouTube: Free quota usually sufficient
- Consider caching aggressively to stay within limits

## Support

For questions or issues:
1. Check service logs in browser console
2. Verify API keys in `.env.local`
3. Test individual functions in isolation
4. Check Firestore rules and indexes

## License

Part of CareerLens - MIT License

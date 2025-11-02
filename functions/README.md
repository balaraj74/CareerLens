# CareerLens Cloud Functions

Firebase Cloud Functions for automated data intelligence and real-time notifications.

## 📦 Functions Overview

### 1. **fetchReviewsScheduled** 📅 Daily at Midnight IST
Automatically fetches college reviews from Reddit.

**Schedule**: `0 0 * * *` (Daily at 12:00 AM IST)

**What it does**:
- Searches r/JEENEETards for reviews across 5 categories (KCET, NEET, JEE, COMEDK, GATE)
- Stores new reviews in Firestore `reddit_reviews` collection
- Deduplicates based on Reddit post ID
- Updates metadata with fetch statistics

**Manual Trigger**:
```bash
curl "https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/fetchReviewsManual?category=KCET"
```

---

### 2. **fetchResourcesScheduled** ⏰ Every 12 Hours
Scrapes learning resources from multiple platforms.

**Schedule**: `0 */12 * * *` (Every 12 hours)

**Platforms**:
- NPTEL (nptel.ac.in)
- Coursera (coursera.org)
- AWS Training (aws.amazon.com/training)
- Google Cloud Training (cloud.google.com/learn/training)

**What it does**:
- Scrapes courses in parallel for efficiency
- Stores in Firestore `scraped_courses` collection
- Updates existing courses with new data
- Searches for: programming, data science, cloud computing

**Manual Trigger**:
```bash
curl "https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/fetchResourcesManual?search=python"
```

---

### 3. **fetchMentorsScheduled** 🌅 Daily at 2 AM IST
Searches for career mentors using Google Custom Search.

**Schedule**: `0 2 * * *` (Daily at 2:00 AM IST)

**What it does**:
- Searches LinkedIn for mentors in 5 categories
- Categories: Software Engineering, Data Science, Product Management, Career Guidance, Startup
- Stores profiles in Firestore `online_mentors` collection
- Rate limits: 1 second between searches

**Setup Required**:
```bash
# Set Google Search API credentials
firebase functions:config:set google.search_api_key="YOUR_API_KEY"
firebase functions:config:set google.search_engine_id="YOUR_ENGINE_ID"
```

**Manual Trigger**:
```bash
curl "https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/fetchMentorsManual?category=Data+Science&apiKey=YOUR_KEY&engineId=YOUR_ID"
```

---

### 4. **summarizeDataTrigger** 🤖 On New Review
AI-powered sentiment analysis and summarization.

**Trigger**: Firestore onCreate `reddit_reviews/{reviewId}`

**What it does**:
- Analyzes sentiment (positive/neutral/negative)
- Generates concise summaries
- Extracts key points
- Stores in `review_summaries` collection
- Updates original document with sentiment score

**Scheduled Version**: Runs every 6 hours for batch processing
- Schedule: `0 */6 * * *`
- Processes up to 50 unprocessed reviews and courses

**Manual Trigger**:
```bash
curl "https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/summarizeDataManual"
```

---

### 5. **notifyUsers** 🔔 Multiple Triggers
Push notifications for new content and daily digests.

**Triggers**:
- `notifyNewReview` - On new review added
- `notifyNewCourse` - On new course added
- `notifyNewMentor` - On new mentor added
- `notifyDailyDigest` - Daily at 9 AM IST (`0 9 * * *`)

**What it does**:
- Sends FCM push notifications to interested users
- Filters by user preferences and categories
- Batch processing with rate limiting
- Logs all notifications sent

**Manual Trigger**:
```bash
curl "https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/notifyUsersTrigger?userId=USER_ID&title=Test&body=Hello"
```

---

## 🚀 Deployment

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Project selected: `firebase use YOUR_PROJECT_ID`

### Install Dependencies
```bash
cd functions
npm install
```

### Set Environment Variables
```bash
# Google Search API (required for fetchMentors)
firebase functions:config:set google.search_api_key="YOUR_API_KEY"
firebase functions:config:set google.search_engine_id="YOUR_ENGINE_ID"

# View current config
firebase functions:config:get
```

### Build TypeScript
```bash
npm run build
```

### Deploy All Functions
```bash
# From project root
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:fetchReviewsScheduled
```

### Deploy Multiple Functions
```bash
firebase deploy --only functions:fetchReviewsScheduled,functions:fetchResourcesScheduled
```

---

## 🧪 Local Testing

### Start Emulators
```bash
cd functions
npm run serve
```

This starts:
- Functions emulator (http://localhost:5001)
- Firestore emulator (http://localhost:8080)

### Test HTTP Functions
```bash
# Health check
curl http://localhost:5001/YOUR_PROJECT/YOUR_REGION/healthCheck

# Fetch reviews
curl "http://localhost:5001/YOUR_PROJECT/YOUR_REGION/fetchReviewsManual?category=KCET"

# Fetch resources
curl "http://localhost:5001/YOUR_PROJECT/YOUR_REGION/fetchResourcesManual?search=python"

# Summarize data
curl http://localhost:5001/YOUR_PROJECT/YOUR_REGION/summarizeDataManual
```

### Test Scheduled Functions
```bash
# Use Firebase Shell
npm run shell

# In shell, run:
fetchReviewsScheduled()
fetchResourcesScheduled()
```

---

## 📊 Firestore Collections

### Collections Created by Functions

1. **`reddit_reviews`**
   ```typescript
   {
     id: string;              // Reddit post ID
     title: string;
     selftext: string;
     author: string;
     score: number;
     num_comments: number;
     created_utc: number;
     subreddit: string;
     url: string;
     category: string;        // KCET, NEET, JEE, etc.
     fetchedAt: Timestamp;
     processed: boolean;
     sentiment?: string;      // Added after processing
     sentimentScore?: number;
   }
   ```

2. **`scraped_courses`**
   ```typescript
   {
     title: string;
     platform: string;        // NPTEL, Coursera, etc.
     url: string;
     instructor?: string;
     level?: string;
     description: string;
     rating?: number;
     students?: number;
     fetchedAt: Timestamp;
     processed: boolean;
     summary?: string;        // Added after processing
     sentiment?: string;
     keywords?: string[];
   }
   ```

3. **`online_mentors`**
   ```typescript
   {
     name: string;
     title: string;
     link: string;
     platform: string;        // LinkedIn, GitHub, etc.
     snippet: string;
     category: string;
     fetchedAt: Timestamp;
     verified: boolean;
     rating: number;
     reviews: number;
   }
   ```

4. **`review_summaries`**
   ```typescript
   {
     id: string;              // Reference to review ID
     summary: string;
     sentiment: {
       sentiment: 'positive' | 'neutral' | 'negative';
       score: number;
       keywords: string[];
     };
     keyPoints: string[];
     category: string;
     createdAt: Timestamp;
     source: string;
     originalUrl: string;
   }
   ```

5. **`notification_logs`**
   ```typescript
   {
     type: string;            // new_review, new_course, etc.
     category?: string;
     sentTo: number;
     success: number;
     failed: number;
     timestamp: Timestamp;
   }
   ```

6. **`_metadata`**
   ```typescript
   {
     // Document IDs: reddit_reviews, scraped_courses, online_mentors, ai_processing
     lastFetch: Timestamp;
     totalFetched: number;
     categories?: string[];
     platforms?: string[];
   }
   ```

---

## 🔐 Security & Best Practices

### API Rate Limits
- **Reddit API**: No authentication required, but rate limited to ~60 requests/min
- **Google Search API**: 100 queries/day (free tier), increase with billing
- **Firebase Functions**: 2,000,000 invocations/month (free tier)

### Error Handling
All functions include:
- Try-catch blocks
- Console logging
- Graceful fallbacks
- Error responses with status codes

### Data Privacy
- No personal user data in logs
- FCM tokens encrypted by Firebase
- User preferences respected for notifications

---

## 📈 Monitoring & Logs

### View Logs
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only fetchReviewsScheduled

# Follow logs in real-time
firebase functions:log --only fetchReviewsScheduled --follow
```

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Functions → Logs
4. Filter by function name or timestamp

### Metrics
Monitor in Firebase Console:
- Invocation count
- Execution time
- Error rate
- Memory usage

---

## 🐛 Troubleshooting

### Function Not Deploying
```bash
# Check Node.js version (must be 20)
node --version

# Reinstall dependencies
cd functions
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Missing Environment Variables
```bash
# Check config
firebase functions:config:get

# Set missing variables
firebase functions:config:set google.search_api_key="YOUR_KEY"

# Redeploy after setting config
firebase deploy --only functions
```

### Function Timing Out
- Default timeout: 60 seconds
- Increase in code:
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('...')
```

### Rate Limit Errors
- Add delays between API calls
- Use exponential backoff
- Reduce batch sizes

---

## 📋 Checklist Before Deployment

- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Environment variables set (`firebase functions:config:get`)
- [ ] Google Search API credentials configured
- [ ] Firebase project selected (`firebase use`)
- [ ] Billing enabled (required for external API calls)
- [ ] Firestore security rules updated
- [ ] Test functions locally with emulators
- [ ] Review logs for errors after deployment

---

## 🎯 Next Steps

After deploying Cloud Functions:

1. **Monitor First Run**: Check logs for each scheduled function
2. **Verify Data**: Check Firestore collections for new documents
3. **Test Notifications**: Trigger manual notification to test FCM
4. **Set Up Alerts**: Configure Firebase Alerts for function failures
5. **Optimize**: Review execution times and optimize if needed

---

## 📞 Support

For issues or questions:
- Check Firebase Console logs
- Review Firestore security rules
- Verify API credentials
- Test with manual trigger endpoints

---

**Functions Ready for Production! 🚀**

Deploy with: `firebase deploy --only functions`

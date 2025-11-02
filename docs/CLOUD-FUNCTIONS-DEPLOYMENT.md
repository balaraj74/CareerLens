# 🚀 Cloud Functions Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [x] Firebase CLI installed
- [x] Node.js 20 installed
- [x] Project connected to Firebase

### 2. API Credentials
- [x] Google Search API Key (for mentors search)
- [x] Google Custom Search Engine ID: `6495457f6bd0c4747`
- [ ] Firebase Cloud Messaging (FCM) server key (for notifications)

### 3. Firebase Configuration
- [ ] Billing enabled (Blaze plan required for external API calls)
- [ ] Firestore database initialized
- [ ] App Hosting or Firebase Hosting configured

---

## 📦 Step-by-Step Deployment

### Step 1: Install Dependencies
```bash
cd /home/balaraj/CareerLens/functions
npm install
```

**Expected packages**:
- `firebase-admin@^12.0.0`
- `firebase-functions@^5.0.0`
- `axios@^1.6.0`
- `cheerio@^1.0.0-rc.12`

### Step 2: Build TypeScript
```bash
npm run build
```

**Expected output**:
```
Successfully compiled TypeScript files to /functions/lib
```

### Step 3: Set Environment Variables
```bash
# Set Google Search API credentials
firebase functions:config:set \
  google.search_api_key="YOUR_GOOGLE_SEARCH_API_KEY" \
  google.search_engine_id="6495457f6bd0c4747"

# Verify configuration
firebase functions:config:get
```

**Expected output**:
```json
{
  "google": {
    "search_api_key": "YOUR_API_KEY",
    "search_engine_id": "6495457f6bd0c4747"
  }
}
```

### Step 4: Test Locally (Optional but Recommended)
```bash
# Start Firebase emulators
npm run serve

# In another terminal, test functions
curl http://localhost:5001/YOUR_PROJECT/YOUR_REGION/healthCheck
```

### Step 5: Deploy to Firebase
```bash
# From project root
cd /home/balaraj/CareerLens

# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:fetchReviewsScheduled,functions:fetchResourcesScheduled
```

**Deployment output**:
```
✔  functions[fetchReviewsScheduled(us-central1)] Successful create operation.
✔  functions[fetchResourcesScheduled(us-central1)] Successful create operation.
✔  functions[fetchMentorsScheduled(us-central1)] Successful create operation.
✔  functions[summarizeDataTrigger(us-central1)] Successful create operation.
✔  functions[notifyNewReview(us-central1)] Successful create operation.
✔  functions[notifyNewCourse(us-central1)] Successful create operation.
✔  functions[notifyNewMentor(us-central1)] Successful create operation.
✔  functions[notifyDailyDigest(us-central1)] Successful create operation.

Deploy complete!
```

---

## 🧪 Testing Deployed Functions

### Test 1: Health Check
```bash
curl https://us-central1-YOUR_PROJECT.cloudfunctions.net/healthCheck
```

**Expected response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "functions": ["fetchReviewsScheduled", "fetchResourcesScheduled", ...]
}
```

### Test 2: Manual Review Fetch
```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/fetchReviewsManual?category=KCET"
```

**Expected response**:
```json
{
  "success": true,
  "category": "KCET",
  "fetched": 15,
  "stored": 12,
  "reviews": [...]
}
```

### Test 3: Manual Resource Scraping
```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/fetchResourcesManual?search=python"
```

**Expected response**:
```json
{
  "success": true,
  "searchTerm": "python",
  "fetched": 35,
  "stored": 28,
  "platforms": {
    "nptel": 8,
    "coursera": 10,
    "aws": 9,
    "gcp": 8
  }
}
```

### Test 4: AI Summarization
```bash
curl https://us-central1-YOUR_PROJECT.cloudfunctions.net/summarizeDataManual
```

**Expected response**:
```json
{
  "success": true,
  "reviewsProcessed": 12,
  "coursesProcessed": 28,
  "timestamp": "2025-11-02T..."
}
```

### Test 5: User Notification
```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/notifyUsersTrigger?userId=YOUR_USER_ID&title=Test&body=Hello"
```

**Expected response**:
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

---

## 📊 Verify Firestore Data

### Check Collections in Firebase Console

1. **`reddit_reviews`** - Should populate daily at midnight
   - Check for new documents
   - Verify `category`, `fetchedAt`, `processed` fields

2. **`scraped_courses`** - Should populate every 12 hours
   - Check for courses from all 4 platforms
   - Verify `platform`, `url`, `fetchedAt` fields

3. **`online_mentors`** - Should populate daily at 2 AM
   - Check for LinkedIn profiles
   - Verify `category`, `platform`, `link` fields

4. **`review_summaries`** - Populated by AI trigger
   - Check for sentiment analysis
   - Verify `sentiment.sentiment`, `summary` fields

5. **`_metadata`** - Tracks fetch statistics
   - Check `reddit_reviews`, `scraped_courses`, `online_mentors` documents
   - Verify `lastFetch` timestamps

---

## 🔍 Monitor Function Execution

### Via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select: **CareerLens** project
3. Navigate to: **Functions** → **Dashboard**
4. Check:
   - ✅ Invocation count
   - ✅ Error rate
   - ✅ Execution time
   - ✅ Memory usage

### Via Command Line
```bash
# View recent logs
firebase functions:log --limit 50

# Follow logs in real-time
firebase functions:log --follow

# View logs for specific function
firebase functions:log --only fetchReviewsScheduled
```

---

## ⏰ Scheduled Functions Timeline

### Daily Schedule (IST - Asia/Kolkata)

| Time | Function | What It Does |
|------|----------|--------------|
| **12:00 AM** | `fetchReviewsScheduled` | Fetch Reddit reviews (5 categories) |
| **2:00 AM** | `fetchMentorsScheduled` | Search for mentors (5 categories) |
| **6:00 AM** | `summarizeDataScheduled` | AI processing batch |
| **9:00 AM** | `notifyDailyDigest` | Send daily digest to users |
| **12:00 PM** | `fetchResourcesScheduled` | Scrape courses (every 12h) |
| **12:00 PM** | `summarizeDataScheduled` | AI processing batch |
| **6:00 PM** | `summarizeDataScheduled` | AI processing batch |
| **12:00 AM** | `fetchResourcesScheduled` | Scrape courses (every 12h) |
| **12:00 AM** | `summarizeDataScheduled` | AI processing batch |

### Real-time Triggers
- `summarizeDataTrigger` - Whenever new review added
- `notifyNewReview` - Whenever new review added
- `notifyNewCourse` - Whenever new course added
- `notifyNewMentor` - Whenever new mentor added

---

## 🐛 Troubleshooting

### Issue: "Billing account not configured"
**Solution**: Enable Blaze plan in Firebase Console
```
Firebase Console → Project Settings → Usage and Billing → Upgrade
```

### Issue: "Function deployment failed"
**Solution**: Check TypeScript compilation
```bash
cd functions
npm run build
# Fix any TypeScript errors
firebase deploy --only functions
```

### Issue: "Google Search API error"
**Solution**: Verify API credentials
```bash
firebase functions:config:get
# Should show google.search_api_key and google.search_engine_id

# Re-set if missing
firebase functions:config:set google.search_api_key="YOUR_KEY"
firebase deploy --only functions
```

### Issue: "Function timeout"
**Solution**: Increase timeout in function definition
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('...')
```

### Issue: "No data in Firestore"
**Solution**: 
1. Check function logs for errors
2. Manually trigger function to test
3. Verify Firestore security rules allow writes
4. Check network connectivity from Cloud Functions

---

## 🔒 Security Considerations

### Firestore Security Rules
Update `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow Cloud Functions to write
    match /reddit_reviews/{document=**} {
      allow write: if request.auth != null || request.resource.data.source == 'cloud_function';
      allow read: if request.auth != null;
    }
    
    match /scraped_courses/{document=**} {
      allow write: if request.auth != null || request.resource.data.source == 'cloud_function';
      allow read: if request.auth != null;
    }
    
    match /online_mentors/{document=**} {
      allow write: if request.auth != null || request.resource.data.source == 'cloud_function';
      allow read: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📈 Expected Results After 24 Hours

### Data Collection
- **Reddit Reviews**: ~100 new reviews (20 per category × 5 categories)
- **Courses**: ~100-150 courses (4 platforms × 2 scrapes/day)
- **Mentors**: ~50 mentor profiles (10 per category × 5 categories)
- **Summaries**: All reviews and courses processed with AI

### Notifications
- **New Content**: Triggered for each new item
- **Daily Digest**: Sent to all users at 9 AM IST
- **Category-Based**: Users notified based on preferences

### Costs Estimate (Free Tier)
- **Functions**: 2M invocations/month (well within limit)
- **Firestore**: 50K reads/day (within free tier)
- **Google Search API**: 100 queries/day (free tier limit)

---

## ✅ Deployment Success Indicators

### Immediate (Within 5 minutes)
- [x] All functions visible in Firebase Console
- [x] Health check returns 200 OK
- [x] No deployment errors in console

### Short-term (Within 1 hour)
- [ ] Manual triggers work successfully
- [ ] Data appears in Firestore collections
- [ ] No errors in function logs

### Long-term (Within 24 hours)
- [ ] Scheduled functions execute on time
- [ ] Reddit reviews appear daily
- [ ] Courses appear every 12 hours
- [ ] Mentors appear daily
- [ ] AI summaries generated
- [ ] Notifications sent to users

---

## 🎉 Next Steps After Deployment

1. **Monitor for 24 Hours**
   - Check Firebase Console logs
   - Verify data in Firestore
   - Test user notifications

2. **Optimize Performance**
   - Review execution times
   - Adjust batch sizes if needed
   - Tune AI processing parameters

3. **Scale Up (if needed)**
   - Increase Google Search API quota
   - Add more platforms to scraper
   - Expand notification categories

4. **Analytics**
   - Track user engagement with notifications
   - Monitor data freshness
   - Analyze sentiment trends

---

**Deployment Complete! 🚀**

Your CareerLens Cloud Functions are now live and automating data intelligence!

---

*Last Updated: November 2, 2025*

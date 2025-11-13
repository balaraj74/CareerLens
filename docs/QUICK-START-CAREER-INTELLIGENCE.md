# 🚀 Quick Start - AI Career Intelligence Hub

Get the Career Intelligence Hub running in 5 minutes!

## Option 1: Quick Test (No Deployment)

Perfect for testing the feature locally without deploying Cloud Functions.

### Step 1: Start Dev Server

```bash
cd CareerLens
npm run dev
```

### Step 2: Visit Career Updates Page

```
http://localhost:3000/career-updates
```

### Step 3: Click "Refresh Now"

The page will fetch data using the client-side service (no Cloud Functions needed).

**What happens:**
- Fetches news from Google News API (if key available)
- Fetches Reddit posts from public API
- Generates mock skills and jobs data
- Displays everything in categorized tabs

**Expected Result:**
- ✅ Data appears in 10-30 seconds
- ✅ All tabs populated
- ✅ No errors in console

---

## Option 2: Full Deployment (Production)

Deploy Cloud Functions for automated data fetching every 12 hours.

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Step 1: Configure Environment

Create `functions/.env`:

```bash
# Optional: Get from https://newsapi.org/
NEWS_API_KEY=your_news_api_key_here

# Required: Already configured in project
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 2: Deploy Everything

```bash
# Run automated deployment script
./scripts/deploy-career-intelligence.sh
```

**Or manually:**

```bash
# Build functions
cd functions
npm install
npm run build
cd ..

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions:fetchCareerUpdates,functions:refreshCareerUpdates
```

### Step 3: Test Deployment

```bash
# Trigger manual refresh
curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates

# Check logs
firebase functions:log --follow
```

### Step 4: Verify Data

1. Open Firebase Console
2. Go to Firestore Database
3. Check `/careerUpdates/{today's date}`
4. Verify data exists

### Step 5: Test Frontend

```
https://your-app.com/career-updates
```

**Expected Result:**
- ✅ Data loads automatically
- ✅ Real-time updates work
- ✅ Manual refresh works

---

## Option 3: Local Testing with Emulators

Test Cloud Functions locally before deploying.

### Step 1: Start Emulators

```bash
cd functions
npm run serve
```

### Step 2: Trigger Function

```bash
# In another terminal
curl -X POST http://localhost:5001/careerlens-1/us-central1/refreshCareerUpdates
```

### Step 3: Check Logs

Look at the terminal running emulators for logs.

---

## Troubleshooting

### Issue: No data appearing

**Solution 1: Check Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

**Solution 2: Manually trigger refresh**
```bash
curl -X POST https://your-function-url/refreshCareerUpdates
```

**Solution 3: Check authentication**
- Make sure you're logged in
- Check Firebase Console > Authentication

### Issue: Function deployment fails

**Solution:**
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-authenticate
firebase login --reauth

# Try again
firebase deploy --only functions
```

### Issue: API rate limits

**Solution:**
- News API free tier: 100 requests/day
- Reddit API: 60 requests/minute
- Use scheduled function (every 12 hours) to stay within limits

---

## Quick Commands Reference

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm run start
```

### Functions

```bash
# Build functions
cd functions && npm run build

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log --follow

# Delete function
firebase functions:delete functionName
```

### Firestore

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Backup data
gcloud firestore export gs://your-bucket/backup

# Import data
gcloud firestore import gs://your-bucket/backup
```

### Testing

```bash
# Test function endpoint
curl -X POST https://your-function-url/refreshCareerUpdates

# Test with verbose output
curl -v -X POST https://your-function-url/refreshCareerUpdates

# Check Firestore data
firebase firestore:get /careerUpdates/2025-01-15
```

---

## File Locations

### Configuration
- `.env.local` - Next.js environment variables
- `functions/.env` - Cloud Functions environment variables
- `firestore.rules` - Firestore security rules

### Code
- `functions/src/fetchCareerIntelligence.ts` - Main Cloud Function
- `functions/src/services/` - Data source services
- `src/app/career-updates/page.tsx` - Frontend UI
- `src/lib/services/fetch-career-data.ts` - Client-side fetching

### Documentation
- `docs/CAREER-INTELLIGENCE-HUB.md` - Full implementation guide
- `docs/TESTING-CAREER-INTELLIGENCE.md` - Testing guide
- `docs/DEPLOYMENT-CHECKLIST.md` - Deployment checklist
- `docs/CAREER-INTELLIGENCE-SUMMARY.md` - Quick summary

---

## Next Steps

After getting it running:

1. **Customize Data Sources**
   - Add more subreddits in `reddit-service.ts`
   - Add more news queries in `news-service.ts`
   - Add new data sources (LinkedIn, Indeed, etc.)

2. **Improve AI Summarization**
   - Customize Gemini prompt in `fetchCareerIntelligence.ts`
   - Add more categories
   - Personalize based on user profile

3. **Add Personalization**
   - Filter by user skills
   - Recommend based on interests
   - Send email notifications

4. **Monitor Performance**
   - Set up Cloud Monitoring alerts
   - Track API usage
   - Monitor costs

---

## Support

Need help?

- 📖 **Full Documentation**: `docs/CAREER-INTELLIGENCE-HUB.md`
- 🧪 **Testing Guide**: `docs/TESTING-CAREER-INTELLIGENCE.md`
- ✅ **Deployment Checklist**: `docs/DEPLOYMENT-CHECKLIST.md`
- 📧 **Email**: balarajr483@gmail.com
- 🐙 **GitHub**: [@balaraj74](https://github.com/balaraj74)

---

**Last Updated**: January 2025  
**Time to Deploy**: ~5 minutes  
**Difficulty**: Easy 🟢

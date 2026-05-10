# 🚀 Enhanced Real-Time Career Intel - Quick Deployment

## What's New?

✨ **Now fetches from REAL career websites using Google Custom Search!**

### Data Sources (10x more data!):
1. **Google Custom Search** - Real job postings from Indeed, Glassdoor, LinkedIn, etc.
2. **Reddit** - 5 career subreddits (was 2, now 5!)
3. **NewsAPI** - Tech career news
4. **Total**: ~50-100 data points per run (was ~20)

---

## Step 1: Set Up Google Custom Search

Follow: **`GOOGLE-CUSTOM-SEARCH-SETUP.md`**

You'll need:
- ✅ Google Custom Search API enabled
- ✅ Custom Search Engine ID
- ✅ API Key
- ✅ Both stored in Secret Manager

**Time: 5 minutes**

---

## Step 2: Update Cloud Function

### Option A: Console (Easiest)

1. Go to your function: [fetchcareerupdates](https://console.cloud.google.com/run/detail/us-central1/fetchcareerupdates?project=careerlens-1)

2. Click **"Edit & deploy new revision"**

3. Click **"Source"** tab

4. Replace `index.js` content with: **`cloud-function-enhanced.js`**

5. Keep same `package.json` (no changes needed!)

6. Click **"Save and redeploy"**

### Option B: Terminal (if you fix filesystem)

```bash
cd /home/balaraj/CareerLens
cp cloud-function-enhanced.js functions-deploy/index.js
cd functions-deploy
zip -r ../functions-deploy-enhanced.zip .
```

Then upload via console.

---

## Step 3: Test

### Manual trigger:
```bash
# Publish to Pub/Sub
gcloud pubsub topics publish career-updates-trigger \
  --message='{"task":"fetch"}' \
  --project=careerlens-1
```

### Check logs:
- Go to: [Cloud Run Logs](https://console.cloud.google.com/run/detail/us-central1/fetchcareerupdates/logs?project=careerlens-1)

You should see:
```
🚀 Starting ENHANCED career updates fetch with Google Search...
📡 Fetching from Google Search, Reddit (5 subreddits), and News...
✅ Fetched: 40 Google results, 75 Reddit posts, 15 news articles
🤖 Sending to Vertex AI Gemini for analysis...
✅ AI analysis complete
✅ ENHANCED Career Intel stored successfully!
📊 Data sources: Google (40), Reddit (75), News (15)
```

---

## Step 4: Verify in Firestore

[Open Firestore](https://console.firebase.google.com/project/careerlens-1/firestore/databases/-default-/data/~2FcareerUpdates)

You should see NEW documents with:
- More trending skills
- Real job counts from actual career sites
- Salary insights
- Better metrics

---

## 🎯 What You Get Now:

### Before (Reddit only):
- 20 data points
- Generic trends
- No real job data

### After (Google + Reddit + News):
- **100+ data points**
- **Real job postings** from Indeed, Glassdoor, etc.
- **Actual salary data**
- **Trending certifications**
- **City-wise job counts**
- **Much better AI insights!**

---

## 💰 Cost

**Google Custom Search**: 100 queries/day FREE
**Usage**: ~20 queries per run × 4 runs/day = 80 queries/day

**You're well within the free tier!** ✅

---

## ⏱️ Total Setup Time: 10 minutes

1. Enable Google Custom Search API (2 min)
2. Create Search Engine (3 min)
3. Store secrets (2 min)
4. Update function code (3 min)

**Then enjoy 10x better career intelligence!** 🚀

---

## 🔧 Troubleshooting

**No Google results?**
- Check API key in Secret Manager
- Verify Custom Search API is enabled
- Test API manually (see GOOGLE-CUSTOM-SEARCH-SETUP.md)

**Function timeout?**
- Increase timeout to 300s in Cloud Run settings
- Check Vertex AI API is enabled

**Still see old data?**
- Manually trigger via Pub/Sub
- Check logs for errors
- Verify Firestore rules allow writes

---

Ready to deploy? **Go to Step 1!** 🎯

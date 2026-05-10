# 🚀 Quick Deploy Guide - Enhanced Function

## Current Status
❌ **Enhanced function NOT deployed yet**  
The Cloud Run function is still using the old code with only Reddit data.

## What You Need to Do (5 minutes):

### Step 1: Copy the Enhanced Code
Open this file and copy ALL the content:
```
/home/balaraj/CareerLens/cloud-function-enhanced.js
```

### Step 2: Deploy to Cloud Run
1. **Open Cloud Run Console:**
   👉 https://console.cloud.google.com/run/detail/us-central1/fetchcareerupdates/source?project=careerlens-1

2. **Click "EDIT & DEPLOY NEW REVISION"** (blue button at top)

3. **In the inline editor:**
   - Find `index.js` in the file list
   - **DELETE all the old code**
   - **PASTE the enhanced code** from `cloud-function-enhanced.js`
   
4. **Click "DEPLOY"** (bottom right)
   - Wait 2-3 minutes for deployment

### Step 3: Verify Secrets Exist
Before testing, make sure you created the secrets:

1. **Check Secret Manager:**
   👉 https://console.cloud.google.com/security/secret-manager?project=careerlens-1

2. **You should see these secrets:**
   - `GOOGLE_CUSTOM_SEARCH_API_KEY` ✅
   - `GOOGLE_SEARCH_ENGINE_ID` ✅
   - `NEWS_API_KEY` (optional)

3. **If missing, use the automated setup page:**
   👉 Open `setup-google-search.html` in browser
   👉 Fill in API Key and Search Engine ID
   👉 Click "Generate Commands"
   👉 Run commands in Cloud Shell

### Step 4: Test the Enhanced Function
After deployment completes:

1. **Trigger via Pub/Sub:**
   👉 https://console.cloud.google.com/cloudpubsub/topic/detail/career-updates-trigger?project=careerlens-1
   
   - Click "MESSAGES" tab
   - Click "PUBLISH MESSAGE"
   - Message body: `{"task":"fetch"}`
   - Click "PUBLISH"

2. **Check Logs (30 seconds later):**
   👉 https://console.cloud.google.com/run/detail/us-central1/fetchcareerupdates/logs?project=careerlens-1
   
   **Look for:**
   ```
   ✅ Fetched: 40 Google results, 75 Reddit posts, 15 news articles
   ```
   
   **NOT:**
   ```
   Data sources: Google (0), Reddit (0), News (0)
   ```

### Step 5: Verify in Your App
1. Open: http://localhost:3001/test-data
2. Check "Data Sources" section:
   - **Google Results:** should be 40+ (not 0)
   - **Reddit Posts:** should be 75+ (not 0)
   - **News Articles:** should be 10+ (not 0)

---

## Quick Troubleshooting

### If you see "Data sources: Google (0), Reddit (0), News (0)"
❌ Enhanced function NOT deployed yet  
✅ **Solution:** Complete Step 2 above

### If you see "Could not access secret GOOGLE_CUSTOM_SEARCH_API_KEY"
❌ Secrets not created yet  
✅ **Solution:** Complete Step 3 above

### If you see "Error 400: Missing required parameter: cx"
❌ Search Engine ID not set  
✅ **Solution:** Create Custom Search Engine and add to secrets

---

## What Will Change After Deployment?

### Before (Current):
- 2 Reddit subreddits
- ~20 data points
- Generic tech trends
- No salary data
- No real job counts

### After (Enhanced):
- 4 Google Custom Searches (Indeed, LinkedIn, Glassdoor, etc.)
- 5 Reddit subreddits
- NewsAPI articles
- **100+ data points**
- Real job postings with counts
- Actual salary ranges
- Company-specific data
- Location-based insights

---

## Direct Links Summary:
1. 🔧 Deploy Function: https://console.cloud.google.com/run/detail/us-central1/fetchcareerupdates/source?project=careerlens-1
2. 🔑 Check Secrets: https://console.cloud.google.com/security/secret-manager?project=careerlens-1
3. 🧪 Test via Pub/Sub: https://console.cloud.google.com/cloudpubsub/topic/detail/career-updates-trigger?project=careerlens-1
4. 📊 View Logs: https://console.cloud.google.com/run/detail/us-central1/fetchcareerupdates/logs?project=careerlens-1
5. 🎯 Setup Page: file:///home/balaraj/CareerLens/setup-google-search.html

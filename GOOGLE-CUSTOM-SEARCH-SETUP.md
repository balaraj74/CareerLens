# 🔍 Google Custom Search API Setup for Real-Time Career Intel

## Step 1: Enable Google Custom Search API

👉 **[Enable Custom Search API](https://console.cloud.google.com/apis/library/customsearch.googleapis.com?project=careerlens-1)**

Click **"ENABLE"**

## Step 2: Create Custom Search Engine

1. Go to: **[Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/create)**

2. **Search engine name**: `CareerLens Real-Time Intel`

3. **What to search**: Select **"Search the entire web"**

4. **Settings**:
   - Enable **"Image search"**: OFF
   - Enable **"SafeSearch"**: ON
   - **Sites to search**: Leave empty for entire web

5. Click **"CREATE"**

6. **Copy your Search Engine ID** (looks like: `a1b2c3d4e5f6g7h8i`)

## Step 3: Get API Key

1. Go to: **[Google Cloud Credentials](https://console.cloud.google.com/apis/credentials?project=careerlens-1)**

2. Click **"+ CREATE CREDENTIALS"** → **"API key"**

3. **Copy the API key**

4. Click **"RESTRICT KEY"** (recommended):
   - **Application restrictions**: None (or HTTP referrers if needed)
   - **API restrictions**: Select **"Custom Search API"**
   - Click **"SAVE"**

## Step 4: Store in Secret Manager

```bash
# Store Custom Search API Key
echo -n 'YOUR_API_KEY_HERE' | gcloud secrets create GOOGLE_CUSTOM_SEARCH_API_KEY \
  --data-file=- \
  --project=careerlens-1 \
  --replication-policy="automatic"

# Store Search Engine ID
echo -n 'YOUR_SEARCH_ENGINE_ID_HERE' | gcloud secrets create GOOGLE_SEARCH_ENGINE_ID \
  --data-file=- \
  --project=careerlens-1 \
  --replication-policy="automatic"

# Grant access to service account
gcloud secrets add-iam-policy-binding GOOGLE_CUSTOM_SEARCH_API_KEY \
  --member="serviceAccount:careerlens-1@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=careerlens-1

gcloud secrets add-iam-policy-binding GOOGLE_SEARCH_ENGINE_ID \
  --member="serviceAccount:careerlens-1@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=careerlens-1
```

## 📊 Usage Limits

**Free Tier**: 100 queries/day
**Paid Tier**: $5 per 1,000 queries (after first 100)

For this project (runs every 6 hours = 4 times/day), you'll use:
- **~20-40 queries/day** (well within free tier!)

## 🎯 Career Sites We'll Search

The function will automatically search:
1. **Indeed** - Job postings and trends
2. **Glassdoor** - Salary insights
3. **Stack Overflow Jobs** - Developer roles
4. **AngelList** - Startup opportunities
5. **GitHub Jobs** - Tech positions
6. **Built In** - Tech company jobs
7. **Dice** - Tech career insights
8. **Career blogs** - Industry news

## ✅ Verification

```bash
# Test the API
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=software+engineer+jobs"
```

You should get JSON results with search data!

---

**After setup, update the Cloud Function code and redeploy!** 🚀

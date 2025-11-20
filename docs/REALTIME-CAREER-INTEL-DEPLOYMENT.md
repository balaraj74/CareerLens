# Real-Time Career Intel Engine - Deployment Guide

## 🎯 Overview
This guide will help you deploy the Real-Time Career Intel Engine that fetches live career data, summarizes it with Gemini AI, and displays it in real-time on your CareerLens dashboard.

## 📋 Prerequisites

1. Google Cloud Project: `careerlens-1`
2. Firebase project connected
3. `gcloud` CLI installed and authenticated
4. Node.js v20+ installed

## 🔧 Step 1: Enable Required APIs

Click these links to enable services in your Google Cloud project:

- **[Cloud Functions API](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=careerlens-1)**
- **[Cloud Firestore API](https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=careerlens-1)**
- **[Cloud Scheduler API](https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=careerlens-1)**
- **[Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=careerlens-1)**
- **[Secret Manager API](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=careerlens-1)**
- **[Cloud Pub/Sub API](https://console.cloud.google.com/apis/library/pubsub.googleapis.com?project=careerlens-1)**

Or run this command:

```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  firestore.googleapis.com \
  cloudscheduler.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  pubsub.googleapis.com \
  --project=careerlens-1
```

## 🔐 Step 2: Grant IAM Permissions

Grant necessary roles to your Cloud Functions service account:

```bash
PROJECT_ID="careerlens-1"
SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Grant Vertex AI access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/aiplatform.user"

# Grant Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/datastore.user"
```

Or use the [IAM Console](https://console.cloud.google.com/iam-admin/iam?project=careerlens-1) to add these roles manually.

## 🔑 Step 3: Create API Keys (Optional)

### NewsAPI Key (Recommended but optional)
1. Visit [NewsAPI.org](https://newsapi.org/register)
2. Sign up for a free account
3. Copy your API key

Store it in Secret Manager:

```bash
./scripts/create-secrets.sh
# Or manually:
echo -n 'YOUR_NEWS_API_KEY' | gcloud secrets create NEWS_API_KEY \
  --data-file=- \
  --project=careerlens-1 \
  --replication-policy="automatic"
```

**Note:** The system will work with Reddit data alone if you skip this step.

## 📡 Step 4: Setup Pub/Sub & Scheduler

Run the automated setup script:

```bash
./scripts/setup-pubsub.sh
```

This creates:
- Pub/Sub topic: `career-updates-trigger`
- Cloud Scheduler job: runs every 6 hours

## 🚀 Step 5: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
npm run deploy
```

This deploys:
- `fetchCareerUpdates` - Pub/Sub triggered function that fetches and processes data

## 🧪 Step 6: Test the Function

### Manual trigger via Pub/Sub:

```bash
gcloud pubsub topics publish career-updates-trigger \
  --message='{"task":"fetch"}' \
  --project=careerlens-1
```

### Check function logs:

```bash
gcloud functions logs read fetchCareerUpdates \
  --project=careerlens-1 \
  --limit=50
```

### Verify Firestore data:

Go to [Firestore Console](https://console.firebase.google.com/project/careerlens-1/firestore) and check:
- `careerUpdates` collection - should have snapshots
- `rawFetches` collection - should have raw API data

## 🎨 Step 7: Add Widget to Dashboard

Add the `CareerUpdatesWidget` component to your dashboard:

```tsx
import CareerUpdatesWidget from '@/components/CareerUpdatesWidget';

// In your dashboard page:
<CareerUpdatesWidget />
```

Example integration in `src/app/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      
      {/* Add the Real-Time Career Intel Widget */}
      <CareerUpdatesWidget />
      
      {/* Your other dashboard components */}
    </div>
  );
}
```

## 📊 Architecture Flow

```
Cloud Scheduler (every 6 hours)
    ↓
Pub/Sub Topic: career-updates-trigger
    ↓
Cloud Function: fetchCareerUpdates
    ↓
[Fetch] → NewsAPI + Reddit APIs
    ↓
[Store Raw] → Firestore: rawFetches
    ↓
[Summarize] → Vertex AI Gemini
    ↓
[Store Summary] → Firestore: careerUpdates
    ↓
[Client] → Next.js onSnapshot listener
    ↓
[Display] → CareerUpdatesWidget (Live UI)
```

## 🗂️ Firestore Collections

### `careerUpdates`
Stores summarized snapshots:
```json
{
  "timestamp": "2025-11-19T10:00:00Z",
  "summary": {
    "trendingSkills": [{"skill": "AI", "changePct": 23, "evidence": [...]}],
    "jobs": [{"title": "ML Engineer", "city": "Bengaluru", "count": 1200}],
    "certifications": [...],
    "opportunities": [...],
    "insights": "AI/ML skills are in high demand",
    "metrics": {"aiMlGrowthPct": 23, "reactOpenings": 3412, "topCity": "Bengaluru"}
  },
  "meta": {"sources": ["newsapi", "reddit"]}
}
```

### `rawFetches`
Stores raw API responses for audit/debugging.

### `jobCountsBySkill`
Stores aggregated metrics for quick queries.

## ⚙️ Configuration

### Change Scheduler Frequency

Edit the cron schedule in `scripts/setup-pubsub.sh`:
- Every hour: `"0 * * * *"`
- Every 3 hours: `"0 */3 * * *"`
- Every 12 hours: `"0 */12 * * *"`

Update existing job:
```bash
gcloud scheduler jobs update pubsub career-updates-scheduler \
  --location=us-central1 \
  --schedule="0 */3 * * *" \
  --project=careerlens-1
```

### Add More Data Sources

Edit `functions/src/fetchCareerIntelligence.ts` and add to the `fetchCareerUpdates` function:

```typescript
const [news, reddit1, reddit2, stackOverflow] = await Promise.all([
  fetchNews(newsApiKey, "AI careers"),
  fetchReddit("cscareerquestions"),
  fetchReddit("webdev"),
  fetchStackOverflow() // Add your fetcher
]);
```

## 🐛 Troubleshooting

### Function not triggered
- Check scheduler exists: `gcloud scheduler jobs list --project=careerlens-1`
- Check topic exists: `gcloud pubsub topics list --project=careerlens-1`
- Verify function deployment: `gcloud functions list --project=careerlens-1`

### No data in Firestore
- Check function logs for errors
- Verify IAM permissions
- Test with manual Pub/Sub publish

### Widget shows "Waiting for live intel"
- Check Firestore rules allow read access
- Verify Firebase config in `.env.local`
- Check browser console for errors

### Vertex AI errors
- Verify Vertex AI API is enabled
- Check service account has `aiplatform.user` role
- Review quotas: [Vertex AI Quotas](https://console.cloud.google.com/iam-admin/quotas?project=careerlens-1)

## 💰 Cost Estimation

**With conservative usage (6-hour intervals):**
- Cloud Functions: ~$0.50/month
- Cloud Scheduler: $0.10/month
- Vertex AI (Gemini): ~$2-5/month
- Firestore: <$1/month (small reads/writes)
- **Total: ~$3-7/month**

## 🎯 Demo Checklist

For judges/presentations:

- [ ] Function runs on schedule (check logs)
- [ ] Firestore has recent `careerUpdates` documents
- [ ] Widget displays live data on dashboard
- [ ] Metrics ticker shows real numbers
- [ ] "LIVE" badge animates
- [ ] Can trigger manual refresh via Pub/Sub
- [ ] Fallback data works if APIs fail

## 🔗 Useful Links

- [Cloud Functions Console](https://console.cloud.google.com/functions/list?project=careerlens-1)
- [Cloud Scheduler Console](https://console.cloud.google.com/cloudscheduler?project=careerlens-1)
- [Firestore Console](https://console.firebase.google.com/project/careerlens-1/firestore)
- [Secret Manager Console](https://console.cloud.google.com/security/secret-manager?project=careerlens-1)
- [Vertex AI Console](https://console.cloud.google.com/vertex-ai?project=careerlens-1)
- [Logs Explorer](https://console.cloud.google.com/logs/query?project=careerlens-1)

## 🎉 Success Criteria

You're ready to demo when:
1. ✅ Cloud Function deploys without errors
2. ✅ Scheduler triggers function every 6 hours
3. ✅ Firestore receives new snapshots
4. ✅ Widget displays live career intel on dashboard
5. ✅ No errors in Cloud Functions logs
6. ✅ Metrics update in real-time

---

**Need help?** Check the logs first:
```bash
gcloud functions logs read fetchCareerUpdates --limit=100 --project=careerlens-1
```

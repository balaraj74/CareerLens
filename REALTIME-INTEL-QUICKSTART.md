# Real-Time Career Intel Engine - Quick Start

## 🚀 Fast Deployment (5 minutes)

### 1. Enable APIs & Grant Permissions

**Option A: Automatic (Recommended)**
```bash
./scripts/deploy-realtime-intel.sh
```

**Option B: Manual**

Enable APIs (click or run command):
```bash
gcloud services enable cloudfunctions.googleapis.com firestore.googleapis.com cloudscheduler.googleapis.com aiplatform.googleapis.com secretmanager.googleapis.com pubsub.googleapis.com --project=careerlens-1
```

Grant IAM roles:
```bash
SERVICE_ACCOUNT="careerlens-1@appspot.gserviceaccount.com"
gcloud projects add-iam-policy-binding careerlens-1 --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding careerlens-1 --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/aiplatform.user"
gcloud projects add-iam-policy-binding careerlens-1 --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/datastore.user"
```

### 2. Setup Pub/Sub & Scheduler
```bash
./scripts/setup-pubsub.sh
```

### 3. Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
npm run deploy
```

### 4. Test It
```bash
gcloud pubsub topics publish career-updates-trigger --message='{"task":"fetch"}' --project=careerlens-1
```

Check logs:
```bash
gcloud functions logs read fetchCareerUpdates --limit=20 --project=careerlens-1
```

### 5. Add Widget to Your App

The widget is already created at `src/components/CareerUpdatesWidget.tsx`.

Add it to your page (e.g., `/career-updates/page.tsx`):
```tsx
import CareerUpdatesWidget from '@/components/CareerUpdatesWidget';

export default function Page() {
  return <CareerUpdatesWidget />;
}
```

## ✅ Verification Checklist

- [ ] APIs enabled
- [ ] IAM permissions granted
- [ ] Pub/Sub topic `career-updates-trigger` created
- [ ] Cloud Scheduler job `career-updates-scheduler` created
- [ ] Function `fetchCareerUpdates` deployed
- [ ] Function triggered successfully (check logs)
- [ ] Firestore collection `careerUpdates` has data
- [ ] Widget displays live data

## 📊 What Was Built

### Cloud Function: `fetchCareerUpdates`
- **Trigger**: Pub/Sub topic `career-updates-trigger`
- **Schedule**: Every 6 hours (via Cloud Scheduler)
- **Data Sources**: 
  - NewsAPI (optional, requires key)
  - Reddit (r/cscareerquestions, r/webdev)
- **AI Processing**: Vertex AI Gemini 1.5 Flash
- **Storage**: Firestore collections `careerUpdates`, `rawFetches`

### UI Component: `CareerUpdatesWidget`
- **Location**: `src/components/CareerUpdatesWidget.tsx`
- **Features**:
  - Real-time Firestore listener
  - Live data updates (no page refresh)
  - Trending skills with growth %
  - Hot jobs with counts
  - Metrics ticker (AI/ML growth, React jobs, top city)
  - "LIVE" badge animation

### Scripts
- `scripts/setup-pubsub.sh` - Creates Pub/Sub topic and scheduler
- `scripts/create-secrets.sh` - Stores API keys in Secret Manager
- `scripts/deploy-realtime-intel.sh` - Full deployment automation

## 🔗 Quick Links

- [Cloud Functions](https://console.cloud.google.com/functions/list?project=careerlens-1)
- [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler?project=careerlens-1)
- [Firestore Data](https://console.firebase.google.com/project/careerlens-1/firestore)
- [Function Logs](https://console.cloud.google.com/logs/query?project=careerlens-1&query=resource.type%3D%22cloud_function%22%0Aresource.labels.function_name%3D%22fetchCareerUpdates%22)
- [Vertex AI](https://console.cloud.google.com/vertex-ai?project=careerlens-1)

## 🆘 Troubleshooting

**Function not deploying?**
```bash
cd functions && npm run build
# Check for TypeScript errors
```

**No data in Firestore?**
```bash
# Check function logs
gcloud functions logs read fetchCareerUpdates --limit=50 --project=careerlens-1

# Manually trigger
gcloud pubsub topics publish career-updates-trigger --message='{"task":"fetch"}' --project=careerlens-1
```

**Widget not showing data?**
- Check Firestore rules allow public read for `careerUpdates`
- Check Firebase config in environment variables
- Open browser console for errors

## 🎯 Next Steps

1. **Optional**: Add NewsAPI key for more data sources
   ```bash
   ./scripts/create-secrets.sh
   ```

2. **Customize**: Edit `functions/src/fetchCareerIntelligence.ts` to add more data sources

3. **Adjust Schedule**: Change frequency in Cloud Scheduler console or re-run `setup-pubsub.sh` with different cron

4. **Monitor**: Set up alerts for function failures in Cloud Monitoring

5. **Enhance UI**: Customize `CareerUpdatesWidget.tsx` styles and layout

---

For detailed documentation, see `docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md`

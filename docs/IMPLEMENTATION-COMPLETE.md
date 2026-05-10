# ✅ Real-Time Career Intel Engine - Implementation Complete

## 📦 What Has Been Built

### 1. Cloud Function: `fetchCareerUpdates`
**Location:** `functions/src/fetchCareerIntelligence.ts`

**Features:**
- ✅ Pub/Sub triggered (topic: `career-updates-trigger`)
- ✅ Fetches data from multiple sources (NewsAPI + Reddit)
- ✅ Stores raw data in `rawFetches` collection
- ✅ Summarizes with Vertex AI Gemini 1.5 Flash
- ✅ Stores summary in `careerUpdates` collection
- ✅ Updates aggregated metrics in `jobCountsBySkill`
- ✅ Graceful fallback if APIs fail
- ✅ Secret Manager integration for API keys

**Data Sources:**
- NewsAPI (optional with API key)
- Reddit: r/cscareerquestions
- Reddit: r/webdev

**Output Schema:**
```json
{
  "trendingSkills": [{"skill": "AI", "changePct": 23, "evidence": [...]}],
  "jobs": [{"title": "ML Engineer", "city": "Bengaluru", "count": 1200}],
  "certifications": [{"name": "...", "platform": "...", "url": "..."}],
  "opportunities": [{"title": "...", "summary": "..."}],
  "insights": "one-line highlight",
  "metrics": {"aiMlGrowthPct": 23, "reactOpenings": 3412, "topCity": "..."}
}
```

### 2. UI Component: `CareerUpdatesWidget`
**Location:** `src/components/CareerUpdatesWidget.tsx`

**Features:**
- ✅ Real-time Firestore `onSnapshot` listener
- ✅ Displays trending skills with growth %
- ✅ Shows hot jobs with counts and cities
- ✅ Metrics ticker (AI/ML growth, React jobs, top city)
- ✅ "LIVE" badge with animation
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states
- ✅ Error handling

### 3. Deployment Scripts

**`scripts/setup-pubsub.sh`**
- Creates Pub/Sub topic: `career-updates-trigger`
- Creates Cloud Scheduler job: runs every 6 hours
- Provides next steps

**`scripts/create-secrets.sh`**
- Stores NewsAPI key in Secret Manager
- Interactive prompts
- Provides IAM binding commands

**`scripts/deploy-realtime-intel.sh`**
- Full automated deployment
- Enables all required APIs
- Grants IAM permissions
- Sets up Pub/Sub & Scheduler
- Builds and deploys functions

### 4. Documentation

**`docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md`**
- Complete deployment guide
- Step-by-step instructions
- Architecture diagrams
- Firestore schema
- Troubleshooting section
- Cost estimation
- Useful links

**`REALTIME-INTEL-QUICKSTART.md`**
- 5-minute quick start guide
- Verification checklist
- Quick links to consoles
- Common troubleshooting

## 🚀 Deployment Steps

### Quick Start (Choose One):

**Option A: Fully Automated**
```bash
./scripts/deploy-realtime-intel.sh
```

**Option B: Step-by-Step**
```bash
# 1. Enable APIs & Grant permissions
gcloud services enable cloudfunctions.googleapis.com firestore.googleapis.com cloudscheduler.googleapis.com aiplatform.googleapis.com secretmanager.googleapis.com pubsub.googleapis.com --project=careerlens-1

# Grant IAM roles
SERVICE_ACCOUNT="careerlens-1@appspot.gserviceaccount.com"
gcloud projects add-iam-policy-binding careerlens-1 --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding careerlens-1 --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/aiplatform.user"
gcloud projects add-iam-policy-binding careerlens-1 --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/datastore.user"

# 2. Setup Pub/Sub & Scheduler
./scripts/setup-pubsub.sh

# 3. Deploy functions
cd functions
npm install
npm run build
npm run deploy
```

### Optional: Add NewsAPI Key
```bash
./scripts/create-secrets.sh
# Or manually:
echo -n 'YOUR_API_KEY' | gcloud secrets create NEWS_API_KEY --data-file=- --project=careerlens-1
```

### Test It
```bash
# Trigger manually
gcloud pubsub topics publish career-updates-trigger --message='{"task":"fetch"}' --project=careerlens-1

# Check logs
gcloud functions logs read fetchCareerUpdates --limit=20 --project=careerlens-1

# View data in Firestore
# https://console.firebase.google.com/project/careerlens-1/firestore
```

## 📍 Integration Points

### Add Widget to Existing Page

The `CareerUpdatesWidget` can be added to any page:

```tsx
import CareerUpdatesWidget from '@/components/CareerUpdatesWidget';

// In your page component:
<CareerUpdatesWidget />
```

**Suggested locations:**
- Main dashboard/home page
- Career updates page (`/career-updates`) - already exists
- Profile/user dashboard

### Current Career Updates Page

You already have `/career-updates/page.tsx` that displays similar data from the `careerIntelligence/latest` document. The new system adds:

1. **Better data pipeline**: Pub/Sub + Cloud Scheduler (automated, reliable)
2. **Multiple data sources**: NewsAPI + Reddit (vs just Reddit)
3. **Structured output**: Well-defined JSON schema from Gemini
4. **Separate widget**: Reusable component for any page
5. **Enhanced UI**: Real-time badge, metrics ticker

**You can:**
- Replace the existing implementation with the new widget
- Use both (different collections: `careerIntelligence` vs `careerUpdates`)
- Merge the logic to use the new `careerUpdates` collection

## 🔗 Quick Access Links

### Google Cloud Console
- [Enable APIs](https://console.cloud.google.com/apis/library?project=careerlens-1)
- [Cloud Functions](https://console.cloud.google.com/functions/list?project=careerlens-1)
- [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler?project=careerlens-1)
- [Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=careerlens-1)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=careerlens-1)
- [IAM & Admin](https://console.cloud.google.com/iam-admin/iam?project=careerlens-1)
- [Vertex AI](https://console.cloud.google.com/vertex-ai?project=careerlens-1)

### Firebase Console
- [Firestore Database](https://console.firebase.google.com/project/careerlens-1/firestore)
- [Functions](https://console.firebase.google.com/project/careerlens-1/functions)

### Monitoring
- [Logs Explorer](https://console.cloud.google.com/logs/query?project=careerlens-1&query=resource.type%3D%22cloud_function%22%0Aresource.labels.function_name%3D%22fetchCareerUpdates%22)
- [Cloud Monitoring](https://console.cloud.google.com/monitoring?project=careerlens-1)

## 📊 System Architecture

```
┌─────────────────┐
│ Cloud Scheduler │ (Runs every 6 hours)
└────────┬────────┘
         │ triggers
         ▼
┌─────────────────┐
│  Pub/Sub Topic  │ career-updates-trigger
└────────┬────────┘
         │ invokes
         ▼
┌─────────────────────────────────────┐
│   Cloud Function:                   │
│   fetchCareerUpdates                │
│   ┌───────────────────────────┐    │
│   │ 1. Fetch NewsAPI          │    │
│   │ 2. Fetch Reddit (2 subs)  │    │
│   │ 3. Store raw → Firestore  │    │
│   │ 4. Summarize → Vertex AI  │    │
│   │ 5. Store summary          │    │
│   └───────────────────────────┘    │
└────────┬────────────────────────────┘
         │ writes to
         ▼
┌─────────────────────────────────────┐
│          Firestore                  │
│  ┌────────────────┐                │
│  │ rawFetches     │ (audit trail)  │
│  │ careerUpdates  │ (snapshots)    │
│  │ jobCountsBySkill│ (metrics)     │
│  └────────────────┘                │
└────────┬────────────────────────────┘
         │ real-time listener
         ▼
┌─────────────────────────────────────┐
│   Next.js Client                    │
│   CareerUpdatesWidget               │
│   (Live updates, no refresh)        │
└─────────────────────────────────────┘
```

## ✅ Verification Checklist

Before demo/production:

- [ ] All APIs enabled in GCP
- [ ] IAM permissions granted to service account
- [ ] Pub/Sub topic `career-updates-trigger` exists
- [ ] Cloud Scheduler job `career-updates-scheduler` exists (every 6 hours)
- [ ] Function `fetchCareerUpdates` deployed successfully
- [ ] Function logs show successful execution
- [ ] Firestore collection `careerUpdates` has documents
- [ ] Firestore collection `rawFetches` has documents
- [ ] Widget displays data without errors
- [ ] "LIVE" badge animates
- [ ] Manual Pub/Sub trigger works
- [ ] Scheduler triggers automatically (check logs after 6 hours)

## 🎯 Key Features for Demo

1. **Real-Time Updates**: Widget updates live without page refresh
2. **Multiple Data Sources**: NewsAPI + Reddit aggregated
3. **AI-Powered Insights**: Vertex AI Gemini summarizes trends
4. **Automated Pipeline**: Runs every 6 hours automatically
5. **Scalable Architecture**: Cloud Functions + Firestore
6. **Secure**: API keys in Secret Manager
7. **Observable**: Full logging and monitoring
8. **Cost-Effective**: ~$3-7/month for full operation

## 💡 Next Steps

1. **Deploy** using one of the scripts above
2. **Test** with manual Pub/Sub trigger
3. **Integrate** widget into your dashboard
4. **Monitor** function logs for first 24 hours
5. **Customize** AI prompt or add more data sources
6. **Optional**: Add NewsAPI key for richer data

## 📚 Documentation Files

- `REALTIME-INTEL-QUICKSTART.md` - Quick 5-minute start
- `docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md` - Complete guide
- `functions/src/fetchCareerIntelligence.ts` - Function code
- `src/components/CareerUpdatesWidget.tsx` - UI component
- `scripts/` - Deployment automation scripts

---

## 🆘 Need Help?

**Check the logs first:**
```bash
gcloud functions logs read fetchCareerUpdates --limit=100 --project=careerlens-1
```

**Common issues:**
- **Function not deploying**: Check build errors with `cd functions && npm run build`
- **No data in Firestore**: Verify IAM permissions and API enablement
- **Widget not showing**: Check Firebase config in `.env.local`

**Still stuck?** Review the full deployment guide: `docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md`

---

**Status**: ✅ Ready to deploy!

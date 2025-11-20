# 🚀 Real-Time Career Intel Engine - Step-by-Step Setup Guide

This guide walks you through implementing the Real-Time Career Intel Engine from start to finish. Complete each step and check it off as you go!

---

## ✅ Step 1: Enable Required Google Cloud APIs

### What you need to do:
Click each link below to enable the API in your Google Cloud project `careerlens-1`:

1. **[Enable Cloud Functions API](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=careerlens-1)** ⚡
   - Click "ENABLE"
   
2. **[Enable Cloud Firestore API](https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=careerlens-1)** 💾
   - Click "ENABLE"
   
3. **[Enable Cloud Scheduler API](https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=careerlens-1)** ⏰
   - Click "ENABLE"
   
4. **[Enable Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=careerlens-1)** 🤖
   - Click "ENABLE"
   
5. **[Enable Secret Manager API](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=careerlens-1)** 🔐
   - Click "ENABLE"
   
6. **[Enable Cloud Pub/Sub API](https://console.cloud.google.com/apis/library/pubsub.googleapis.com?project=careerlens-1)** 📡
   - Click "ENABLE"

### Or use this single command:
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

### ✅ Verification:
Run this to verify all APIs are enabled:
```bash
gcloud services list --enabled --project=careerlens-1 | grep -E "cloudfunctions|firestore|cloudscheduler|aiplatform|secretmanager|pubsub"
```

**Expected output:** All 6 services should be listed

---

## ✅ Step 2: Grant IAM Permissions

### What you need to do:
Your Cloud Functions need permission to access Secret Manager, Vertex AI, and Firestore.

### Option A: Use Console (Easiest)
1. **[Open IAM Console](https://console.cloud.google.com/iam-admin/iam?project=careerlens-1)** 🔗
2. Find service account: `careerlens-1@appspot.gserviceaccount.com`
3. Click the **pencil icon** (Edit principal)
4. Click **"ADD ANOTHER ROLE"** and add these 3 roles:
   - `Secret Manager Secret Accessor`
   - `Vertex AI User`
   - `Cloud Datastore User`
5. Click **"SAVE"**

### Option B: Use Commands
```bash
SERVICE_ACCOUNT="careerlens-1@appspot.gserviceaccount.com"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding careerlens-1 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Grant Vertex AI access
gcloud projects add-iam-policy-binding careerlens-1 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/aiplatform.user"

# Grant Firestore access
gcloud projects add-iam-policy-binding careerlens-1 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/datastore.user"
```

### ✅ Verification:
```bash
gcloud projects get-iam-policy careerlens-1 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:careerlens-1@appspot.gserviceaccount.com"
```

**Expected output:** Should show all 3 roles listed above

---

## ✅ Step 3: Get NewsAPI Key (Optional but Recommended)

### What you need to do:
1. **[Sign up at NewsAPI.org](https://newsapi.org/register)** 🔗
2. Fill in your details (free tier is perfect for this project)
3. Copy your API key (looks like: `1234567890abcdef1234567890abcdef`)

### Store the key in Secret Manager:

**Option A: Using Script**
```bash
./scripts/create-secrets.sh
# When prompted, paste your NewsAPI key
```

**Option B: Manual Command**
```bash
# Replace YOUR_NEWS_API_KEY with your actual key
echo -n 'YOUR_NEWS_API_KEY' | gcloud secrets create NEWS_API_KEY \
  --data-file=- \
  --project=careerlens-1 \
  --replication-policy="automatic"
```

### Grant access to the secret:
```bash
gcloud secrets add-iam-policy-binding NEWS_API_KEY \
  --member="serviceAccount:careerlens-1@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=careerlens-1
```

### ✅ Verification:
```bash
gcloud secrets list --project=careerlens-1
```

**Expected output:** Should show `NEWS_API_KEY` in the list

**Note:** If you skip this step, the system will work with Reddit data only.

---

## ✅ Step 4: Create Pub/Sub Topic and Cloud Scheduler

### What you need to do:
Run the automated setup script:

```bash
cd /home/balaraj/CareerLens
./scripts/setup-pubsub.sh
```

This will:
- Create Pub/Sub topic: `career-updates-trigger`
- Create Cloud Scheduler job: `career-updates-scheduler` (runs every 6 hours)

### ✅ Verification:

**Check Pub/Sub topic:**
```bash
gcloud pubsub topics list --project=careerlens-1 | grep career-updates-trigger
```

**Check Scheduler job:**
```bash
gcloud scheduler jobs list --location=us-central1 --project=careerlens-1
```

**Or view in console:**
- **[View Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=careerlens-1)** 🔗
- **[View Cloud Scheduler Jobs](https://console.cloud.google.com/cloudscheduler?project=careerlens-1)** 🔗

**Expected output:** Both should exist and scheduler should show "ENABLED"

---

## ✅ Step 5: Build and Deploy Cloud Functions

### What you need to do:

```bash
cd /home/balaraj/CareerLens/functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Google Cloud
npm run deploy
```

**This will take 3-5 minutes.** You'll see progress like:
```
Deploying function (may take a while - up to 2 minutes)...
✓ Function deployed successfully
```

### ✅ Verification:

**Check deployed function:**
```bash
gcloud functions list --project=careerlens-1 | grep fetchCareerUpdates
```

**Or view in console:**
- **[View Cloud Functions](https://console.cloud.google.com/functions/list?project=careerlens-1)** 🔗

**Expected output:** Function `fetchCareerUpdates` with status "ACTIVE"

---

## ✅ Step 6: Test Cloud Function Manually

### What you need to do:
Trigger the function manually to verify it works:

```bash
gcloud pubsub topics publish career-updates-trigger \
  --message='{"task":"fetch"}' \
  --project=careerlens-1
```

**Wait 30-60 seconds**, then check the logs:

```bash
gcloud functions logs read fetchCareerUpdates \
  --limit=50 \
  --project=careerlens-1
```

### ✅ Verification:

**Check Firestore has data:**
1. **[Open Firestore Console](https://console.firebase.google.com/project/careerlens-1/firestore)** 🔗
2. Look for these collections:
   - `careerUpdates` - Should have at least 1 document with timestamp
   - `rawFetches` - Should have raw API data

**Check logs show success:**
```bash
gcloud functions logs read fetchCareerUpdates --limit=20 --project=careerlens-1
```

**Expected output:** Should see "Career updates fetched & stored successfully" in logs

---

## ✅ Step 7: Update Firestore Security Rules

### What you need to do:

1. **[Open Firestore Rules](https://console.firebase.google.com/project/careerlens-1/firestore/rules)** 🔗

2. Add these rules to allow reading `careerUpdates`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow read access to career updates for all authenticated users
    match /careerUpdates/{document=**} {
      allow read: if true;  // Public read for demo purposes
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Allow read access to raw fetches for debugging (optional)
    match /rawFetches/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Your existing rules...
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"PUBLISH"**

### ✅ Verification:
Try reading from Firestore in your browser console (F12):
```javascript
// Should not throw permission error
firebase.firestore().collection('careerUpdates').limit(1).get()
```

---

## ✅ Step 8: Integrate CareerUpdatesWidget into App

### What you need to do:

The widget is already created! Now add it to your app.

**Option A: Add to existing `/career-updates` page**

Edit `src/app/career-updates/page.tsx`:

```tsx
import CareerUpdatesWidget from '@/components/CareerUpdatesWidget';

export default function CareerUpdatesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Career Updates</h1>
      
      {/* Add the new Real-Time Widget */}
      <CareerUpdatesWidget />
      
      {/* Your existing content below */}
    </div>
  );
}
```

**Option B: Add to main dashboard**

Find your main dashboard page and add:
```tsx
import CareerUpdatesWidget from '@/components/CareerUpdatesWidget';
```

### ✅ Verification:
1. The widget component exists at: `src/components/CareerUpdatesWidget.tsx` ✅
2. After adding to a page, you should see:
   - "Real-Time Career Intel" header
   - Green "LIVE" badge (animated)
   - Trending skills with growth percentages
   - Hot jobs with counts
   - Metrics ticker at bottom

---

## ✅ Step 9: Test End-to-End Flow

### What you need to do:

1. **Trigger the function again:**
```bash
gcloud pubsub topics publish career-updates-trigger --message='{"task":"fetch"}' --project=careerlens-1
```

2. **Watch the logs in real-time:**
```bash
gcloud functions logs read fetchCareerUpdates --limit=20 --follow --project=careerlens-1
```

3. **Open your app and watch the widget update live** (no page refresh needed!)

### ✅ Verification Checklist:

- [ ] Cloud Function executes without errors (check logs)
- [ ] Firestore `careerUpdates` collection gets a new document
- [ ] Widget on your page shows the new data within 5 seconds
- [ ] "LIVE" badge is animating
- [ ] Trending skills are displayed with percentages
- [ ] Metrics ticker shows values at the bottom

**Full flow test:**
```
Scheduler (or manual trigger)
  ↓
Pub/Sub publishes to career-updates-trigger
  ↓
Cloud Function fetchCareerUpdates runs
  ↓
Fetches from NewsAPI + Reddit
  ↓
Sends to Vertex AI Gemini for summarization
  ↓
Stores in Firestore careerUpdates collection
  ↓
Widget onSnapshot listener detects new data
  ↓
UI updates automatically! ✨
```

---

## ✅ Step 10: Commit and Push Changes

### What you need to do:

```bash
cd /home/balaraj/CareerLens

# Stage all Real-Time Intel Engine files
git add \
  src/components/CareerUpdatesWidget.tsx \
  functions/src/fetchCareerIntelligence.ts \
  functions/src/index.ts \
  functions/package.json \
  scripts/setup-pubsub.sh \
  scripts/create-secrets.sh \
  scripts/deploy-realtime-intel.sh \
  docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md \
  API-SETUP-GUIDE.md \
  REALTIME-INTEL-QUICKSTART.md \
  IMPLEMENTATION-COMPLETE.md

# Commit
git commit -m "feat: Add Real-Time Career Intel Engine

- Cloud Function with Pub/Sub trigger (every 6 hours)
- Vertex AI Gemini summarization
- Real-time Firestore widget with live updates
- NewsAPI + Reddit data sources
- Secret Manager integration
- Deployment scripts and documentation"

# Push to GitHub
git push origin main
```

### ✅ Verification:
```bash
git log -1
```

**Expected output:** Should show your commit message

---

## 🎉 Success Checklist

Once you complete all steps, verify these work:

- [ ] ✅ All Google Cloud APIs enabled
- [ ] ✅ IAM permissions granted
- [ ] ✅ NewsAPI key stored in Secret Manager (or using Reddit-only mode)
- [ ] ✅ Pub/Sub topic and Scheduler created
- [ ] ✅ Cloud Function deployed and active
- [ ] ✅ Function runs successfully (check logs)
- [ ] ✅ Firestore has `careerUpdates` documents
- [ ] ✅ Firestore rules allow reading
- [ ] ✅ Widget displays on page
- [ ] ✅ Real-time updates work (no page refresh)
- [ ] ✅ Code committed to GitHub

---

## 🆘 Quick Troubleshooting

### Function not deploying?
```bash
cd functions && npm run build
# Check for TypeScript errors
```

### No data in Firestore?
```bash
# Check logs for errors
gcloud functions logs read fetchCareerUpdates --limit=50 --project=careerlens-1

# Manually trigger again
gcloud pubsub topics publish career-updates-trigger --message='{"task":"fetch"}' --project=careerlens-1
```

### Widget shows "Waiting for live career intel"?
- Check Firestore rules allow public read for `careerUpdates`
- Verify Firebase config in `.env.local`
- Open browser console (F12) for error messages
- Manually add a test document to Firestore `careerUpdates` collection

### "Structure needs cleaning" error?
This is a file system issue. Reboot your system:
```bash
sudo reboot
```

---

## 📊 What You Built

- **Architecture**: Serverless, event-driven data pipeline
- **Data Sources**: NewsAPI (optional) + Reddit + future sources
- **AI**: Vertex AI Gemini 1.5 Flash for summarization
- **Storage**: Firestore with real-time listeners
- **Automation**: Cloud Scheduler triggers every 6 hours
- **Cost**: ~$3-7/month (within free tiers for light usage)
- **Security**: API keys in Secret Manager, IAM roles properly configured

---

## 📚 Documentation Reference

- **Quick Start**: `REALTIME-INTEL-QUICKSTART.md`
- **Full Deployment Guide**: `docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md`
- **API Setup**: `API-SETUP-GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION-COMPLETE.md`

---

**Need help?** Check the logs first:
```bash
gcloud functions logs read fetchCareerUpdates --limit=100 --project=careerlens-1
```

**Ready to impress judges!** 🏆

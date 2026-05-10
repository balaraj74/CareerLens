# 🔗 Real-Time Career Intel - Required APIs & Permissions

## ⚡ Quick Enable All APIs (Single Command)

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

---

## 🌐 Individual API Enable Links

Click each link to enable the service in your Google Cloud project `careerlens-1`:

### 1. Cloud Functions API
**Required for**: Serverless function deployment
- 🔗 [Enable Cloud Functions API](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=careerlens-1)

### 2. Cloud Firestore API
**Required for**: Database storage
- 🔗 [Enable Firestore API](https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=careerlens-1)

### 3. Cloud Scheduler API
**Required for**: Automated triggers every 6 hours
- 🔗 [Enable Cloud Scheduler API](https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=careerlens-1)

### 4. Vertex AI API
**Required for**: Gemini AI summarization
- 🔗 [Enable Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=careerlens-1)

### 5. Secret Manager API
**Required for**: Secure API key storage
- 🔗 [Enable Secret Manager API](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=careerlens-1)

### 6. Cloud Pub/Sub API
**Required for**: Event-driven triggers
- 🔗 [Enable Pub/Sub API](https://console.cloud.google.com/apis/library/pubsub.googleapis.com?project=careerlens-1)

---

## 🔐 Grant IAM Permissions

Your Cloud Functions service account needs these permissions:

### Quick Grant All Permissions

```bash
SERVICE_ACCOUNT="careerlens-1@appspot.gserviceaccount.com"

# Secret Manager access (for API keys)
gcloud projects add-iam-policy-binding careerlens-1 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Vertex AI access (for Gemini)
gcloud projects add-iam-policy-binding careerlens-1 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/aiplatform.user"

# Firestore access (for data storage)
gcloud projects add-iam-policy-binding careerlens-1 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/datastore.user"
```

### Or Use IAM Console

🔗 [Open IAM Console](https://console.cloud.google.com/iam-admin/iam?project=careerlens-1)

**Steps:**
1. Find service account: `careerlens-1@appspot.gserviceaccount.com`
2. Click "Edit Principal" (pencil icon)
3. Add these roles:
   - `Secret Manager Secret Accessor`
   - `Vertex AI User`
   - `Cloud Datastore User`
4. Click "Save"

---

## 📋 Verification Checklist

Run these commands to verify everything is set up:

### Check APIs are enabled:
```bash
gcloud services list --enabled --project=careerlens-1 | grep -E "cloudfunctions|firestore|cloudscheduler|aiplatform|secretmanager|pubsub"
```

**Expected output:**
```
aiplatform.googleapis.com
cloudfunctions.googleapis.com
cloudscheduler.googleapis.com
firestore.googleapis.com
pubsub.googleapis.com
secretmanager.googleapis.com
```

### Check IAM permissions:
```bash
gcloud projects get-iam-policy careerlens-1 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:careerlens-1@appspot.gserviceaccount.com"
```

**Should show:**
- `roles/secretmanager.secretAccessor`
- `roles/aiplatform.user`
- `roles/datastore.user`

---

## 🎯 Optional: External API Keys

### NewsAPI (Recommended)

**Why?** Get news articles about AI careers, tech trends, certifications.

**Steps:**
1. 🔗 [Sign up at NewsAPI.org](https://newsapi.org/register)
2. Free tier: 100 requests/day (enough for 6-hour intervals)
3. Copy your API key
4. Store in Secret Manager:

```bash
echo -n 'YOUR_NEWS_API_KEY' | gcloud secrets create NEWS_API_KEY \
  --data-file=- \
  --project=careerlens-1 \
  --replication-policy="automatic"
```

5. Grant access:
```bash
gcloud secrets add-iam-policy-binding NEWS_API_KEY \
  --member="serviceAccount:careerlens-1@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=careerlens-1
```

**Note:** System works without this (uses Reddit only)

---

## 🚦 Status Check Commands

### Check if Pub/Sub topic exists:
```bash
gcloud pubsub topics list --project=careerlens-1 | grep career-updates-trigger
```

### Check if Scheduler job exists:
```bash
gcloud scheduler jobs list --location=us-central1 --project=careerlens-1
```

### Check if Function is deployed:
```bash
gcloud functions list --project=careerlens-1 | grep fetchCareerUpdates
```

### Check if secrets exist:
```bash
gcloud secrets list --project=careerlens-1
```

---

## 🔧 Troubleshooting

### "Permission denied" errors

**Solution:** Re-run IAM grant commands above, or use IAM Console

### "API not enabled" errors

**Solution:** Click the API enable links above or run the bulk enable command

### "Service account not found"

**Solution:** Verify your service account exists:
```bash
gcloud iam service-accounts list --project=careerlens-1
```

### "Quota exceeded"

**Check quotas:**
🔗 [View Quotas](https://console.cloud.google.com/iam-admin/quotas?project=careerlens-1)

**Vertex AI quotas:**
🔗 [Vertex AI Quotas](https://console.cloud.google.com/iam-admin/quotas?project=careerlens-1&pageState=(%22allQuotasTable%22:(%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22vertex_22_257D%255D%22)))

---

## ✅ Ready to Deploy?

Once all APIs are enabled and permissions granted:

```bash
# Quick deployment
./scripts/deploy-realtime-intel.sh

# Or step-by-step
./scripts/setup-pubsub.sh
cd functions && npm run deploy
```

---

## 📞 Support Resources

- 📖 [Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- 📖 [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- 📖 [Firestore Documentation](https://firebase.google.com/docs/firestore)
- 📖 [Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- 💬 [Stack Overflow - google-cloud-platform](https://stackoverflow.com/questions/tagged/google-cloud-platform)

---

**Last Updated:** November 19, 2025
**Project:** careerlens-1
**Region:** us-central1

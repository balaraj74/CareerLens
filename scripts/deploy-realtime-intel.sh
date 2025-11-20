#!/bin/bash

# Quick deployment script for Real-Time Career Intel Engine
# Runs all setup steps in sequence

set -e  # Exit on error

PROJECT_ID="careerlens-1"
REGION="us-central1"

echo "🚀 Starting Real-Time Career Intel Engine deployment..."
echo "=================================================="
echo ""

# Step 1: Enable APIs
echo "📡 Step 1/5: Enabling Google Cloud APIs..."
gcloud services enable \
  cloudfunctions.googleapis.com \
  firestore.googleapis.com \
  cloudscheduler.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  pubsub.googleapis.com \
  --project=$PROJECT_ID

echo "✅ APIs enabled"
echo ""

# Step 2: Grant IAM permissions
echo "🔐 Step 2/5: Granting IAM permissions..."
SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/aiplatform.user" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/datastore.user" \
  --quiet

echo "✅ Permissions granted"
echo ""

# Step 3: Setup Pub/Sub and Scheduler
echo "⏰ Step 3/5: Setting up Pub/Sub and Cloud Scheduler..."
./scripts/setup-pubsub.sh
echo ""

# Step 4: Build functions
echo "🔨 Step 4/5: Building Cloud Functions..."
cd functions
npm install
npm run build
cd ..
echo "✅ Functions built"
echo ""

# Step 5: Deploy functions
echo "🚀 Step 5/5: Deploying Cloud Functions..."
cd functions
npm run deploy
cd ..
echo "✅ Functions deployed"
echo ""

echo "=================================================="
echo "✨ Deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. (Optional) Store NewsAPI key in Secret Manager:"
echo "   ./scripts/create-secrets.sh"
echo ""
echo "2. Test the function:"
echo "   gcloud pubsub topics publish career-updates-trigger --message='{\"task\":\"fetch\"}' --project=$PROJECT_ID"
echo ""
echo "3. Check logs:"
echo "   gcloud functions logs read fetchCareerUpdates --limit=50 --project=$PROJECT_ID"
echo ""
echo "4. View Firestore data:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo ""
echo "5. Add CareerUpdatesWidget to your dashboard!"
echo ""
echo "📚 Full documentation: docs/REALTIME-CAREER-INTEL-DEPLOYMENT.md"

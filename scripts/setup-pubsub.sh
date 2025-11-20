#!/bin/bash

# Setup script for Real-Time Career Intel Engine
# Creates Pub/Sub topic and Cloud Scheduler job

PROJECT_ID="careerlens-1"
TOPIC_NAME="career-updates-trigger"
JOB_NAME="career-updates-scheduler"
REGION="us-central1"

echo "🚀 Setting up Real-Time Career Intel Engine..."
echo "Project: $PROJECT_ID"
echo ""

# Create Pub/Sub topic
echo "📡 Creating Pub/Sub topic: $TOPIC_NAME"
gcloud pubsub topics create $TOPIC_NAME --project=$PROJECT_ID 2>/dev/null && \
  echo "✅ Topic created successfully" || \
  echo "⚠️  Topic already exists or error occurred"

echo ""

# Create Cloud Scheduler job (every 6 hours)
echo "⏰ Creating Cloud Scheduler job: $JOB_NAME"
gcloud scheduler jobs create pubsub $JOB_NAME \
  --location=$REGION \
  --schedule="0 */6 * * *" \
  --topic=$TOPIC_NAME \
  --message-body='{"task":"fetch"}' \
  --time-zone="UTC" \
  --project=$PROJECT_ID 2>/dev/null && \
  echo "✅ Scheduler job created (runs every 6 hours)" || \
  echo "⚠️  Scheduler job already exists or error occurred"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Store API keys in Secret Manager (optional, falls back to Reddit):"
echo "   echo -n 'YOUR_NEWS_API_KEY' | gcloud secrets create NEWS_API_KEY --data-file=- --project=$PROJECT_ID"
echo ""
echo "2. Deploy Cloud Functions:"
echo "   cd functions && npm run deploy"
echo ""
echo "3. Test manually:"
echo "   gcloud pubsub topics publish $TOPIC_NAME --message='{\"task\":\"fetch\"}' --project=$PROJECT_ID"

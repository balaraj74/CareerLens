#!/bin/bash

# Script to create secrets in Google Cloud Secret Manager
# Run this script to store API keys securely

PROJECT_ID="careerlens-1"

echo "🔐 Creating secrets in Secret Manager for project: $PROJECT_ID"
echo ""

# NewsAPI Key (optional - system falls back to Reddit if not provided)
echo "Enter your NewsAPI key (or press Enter to skip):"
read -r NEWS_API_KEY

if [ -n "$NEWS_API_KEY" ]; then
  echo -n "$NEWS_API_KEY" | gcloud secrets create NEWS_API_KEY \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic" 2>/dev/null && \
    echo "✅ NEWS_API_KEY created" || \
    echo "⚠️  NEWS_API_KEY already exists or error occurred"
else
  echo "⏭️  Skipping NEWS_API_KEY (will use Reddit-only mode)"
fi

echo ""
echo "✨ Secret creation complete!"
echo ""
echo "To grant access to Cloud Functions, run:"
echo "gcloud secrets add-iam-policy-binding NEWS_API_KEY \\"
echo "  --member='serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com' \\"
echo "  --role='roles/secretmanager.secretAccessor' \\"
echo "  --project=$PROJECT_ID"

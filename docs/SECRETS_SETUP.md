# 🔐 Firebase Secrets Configuration Guide

## Overview
This guide helps you set up all required secrets for CareerLens in Firebase App Hosting.

## Required Secrets

### 1. Google AI / Gemini API
```bash
# Get your API key from: https://aistudio.google.com/app/apikey
firebase apphosting:secrets:set GEMINI_API_KEY
# Paste your Gemini API key when prompted

firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY
# Use the same Gemini API key
```

### 2. News API
```bash
# Get your API key from: https://newsapi.org/register
firebase apphosting:secrets:set NEWS_API_KEY
# Paste your News API key when prompted
```

### 3. Google Custom Search
```bash
# Get API key from: https://console.cloud.google.com/apis/credentials
firebase apphosting:secrets:set GOOGLE_CUSTOM_SEARCH_API_KEY

# Get Search Engine ID from: https://programmablesearchengine.google.com/
firebase apphosting:secrets:set GOOGLE_CUSTOM_SEARCH_ENGINE_ID
```

### 4. Reddit API
```bash
# Create app at: https://www.reddit.com/prefs/apps
firebase apphosting:secrets:set REDDIT_CLIENT_ID
firebase apphosting:secrets:set REDDIT_CLIENT_SECRET
```

### 5. Redis Configuration
```bash
# Your Redis host (e.g., from Google Cloud Memorystore)
firebase apphosting:secrets:set REDIS_HOST

# Your Redis password
firebase apphosting:secrets:set REDIS_PASSWORD
```

## Alternative: Set via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (careerlens-1)
3. Navigate to: **App Hosting** → **Your Backend** → **Settings** → **Secrets**
4. Click **Add Secret** for each required secret
5. Enter the secret name and value

## Required Secrets Checklist

- [ ] `GEMINI_API_KEY` - Google AI API key
- [ ] `GOOGLE_GENAI_API_KEY` - Same as Gemini API key
- [ ] `NEWS_API_KEY` - NewsAPI.org key
- [ ] `GOOGLE_CUSTOM_SEARCH_API_KEY` - Google Search API key
- [ ] `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` - Programmable Search Engine ID
- [ ] `REDDIT_CLIENT_ID` - Reddit OAuth client ID
- [ ] `REDDIT_CLIENT_SECRET` - Reddit OAuth client secret
- [ ] `REDIS_HOST` - Redis server hostname
- [ ] `REDIS_PASSWORD` - Redis authentication password

## Verification

After setting all secrets, verify they're configured:

```bash
# List all secrets
firebase apphosting:secrets:list

# Check specific secret (won't show value, just existence)
firebase apphosting:secrets:describe GEMINI_API_KEY
```

## Security Best Practices

### DO:
✅ Use Firebase secrets for all sensitive data  
✅ Rotate secrets regularly (every 90 days)  
✅ Use different secrets for dev/staging/prod  
✅ Limit secret access to necessary services only  
✅ Monitor secret usage in logs  

### DON'T:
❌ Never commit secrets to git  
❌ Never expose secrets in client-side code  
❌ Never share secrets via email/chat  
❌ Never use production secrets in development  
❌ Never hardcode secrets in code  

## Troubleshooting

### Secret not found error
```bash
# Check if secret exists
firebase apphosting:secrets:list

# Re-create if missing
firebase apphosting:secrets:set SECRET_NAME
```

### Secret not accessible in app
```bash
# Verify secret is referenced in apphosting.yaml
# Example:
# - variable: NEWS_API_KEY
#   secret: NEWS_API_KEY

# Redeploy after adding to apphosting.yaml
firebase deploy
```

### Update existing secret
```bash
# Delete old secret
firebase apphosting:secrets:delete SECRET_NAME

# Create new one
firebase apphosting:secrets:set SECRET_NAME
```

## Getting API Keys

### Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key
4. Set as `GEMINI_API_KEY` secret

### News API Key
1. Visit: https://newsapi.org/register
2. Sign up for free account
3. Copy your API key from dashboard
4. Set as `NEWS_API_KEY` secret

### Google Custom Search
1. Enable Custom Search API in GCP Console
2. Create API key in Credentials
3. Create Programmable Search Engine at: https://programmablesearchengine.google.com/
4. Copy both API key and Engine ID
5. Set as secrets

### Reddit API
1. Visit: https://www.reddit.com/prefs/apps
2. Click "create another app"
3. Select "script" type
4. Copy client ID and secret
5. Set as secrets

### Redis (Google Cloud Memorystore)
1. In GCP Console, create Redis instance
2. Note the host IP and password
3. Set as secrets

## Quick Setup Script

```bash
#!/bin/bash

echo "🔐 Setting up Firebase secrets..."

read -p "Enter Gemini API Key: " GEMINI_KEY
firebase apphosting:secrets:set GEMINI_API_KEY <<< "$GEMINI_KEY"
firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY <<< "$GEMINI_KEY"

read -p "Enter News API Key: " NEWS_KEY
firebase apphosting:secrets:set NEWS_API_KEY <<< "$NEWS_KEY"

read -p "Enter Google Search API Key: " SEARCH_KEY
firebase apphosting:secrets:set GOOGLE_CUSTOM_SEARCH_API_KEY <<< "$SEARCH_KEY"

read -p "Enter Search Engine ID: " ENGINE_ID
firebase apphosting:secrets:set GOOGLE_CUSTOM_SEARCH_ENGINE_ID <<< "$ENGINE_ID"

read -p "Enter Reddit Client ID: " REDDIT_ID
firebase apphosting:secrets:set REDDIT_CLIENT_ID <<< "$REDDIT_ID"

read -p "Enter Reddit Client Secret: " REDDIT_SECRET
firebase apphosting:secrets:set REDDIT_CLIENT_SECRET <<< "$REDDIT_SECRET"

read -p "Enter Redis Host: " REDIS_HOST
firebase apphosting:secrets:set REDIS_HOST <<< "$REDIS_HOST"

read -p "Enter Redis Password: " REDIS_PASS
firebase apphosting:secrets:set REDIS_PASSWORD <<< "$REDIS_PASS"

echo "✅ All secrets configured!"
```

Save this as `setup-secrets.sh` and run with `chmod +x setup-secrets.sh && ./setup-secrets.sh`

---

**Last Updated**: November 21, 2025  
**Status**: Ready for Configuration 🔐

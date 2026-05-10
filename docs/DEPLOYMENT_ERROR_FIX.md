# 🔧 Firebase Deployment Error - Quick Fix Guide

## ❌ Common Errors After Deployment

### 1. Features not working in production (but work locally)
- **News Page**: Shows "No Articles Found"
- **Library Finder**: Google Maps error

This happens when environment variables/secrets are missing in Firebase.

## ✅ Solution: Set Up Required Secrets

### Option 1: Automated Setup (Recommended)
Run the secrets setup script:

```bash
./setup-secrets.sh
```

This interactive script will guide you through setting up all secrets.

### Option 2: Manual Setup

#### Step 1: Set Required Secrets (MUST HAVE)

```bash
# 1. Gemini API Key (Required for AI features)
firebase apphosting:secrets:set GEMINI_API_KEY
# Paste your key from: https://aistudio.google.com/app/apikey

# 2. Set the same key for GOOGLE_GENAI_API_KEY
firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY
# Use the same Gemini API key

# 3. News API Key (Required for News feature)
firebase apphosting:secrets:set NEWS_API_KEY
# Get free API key from: https://newsapi.org/register
```

**Note**: Google Maps API key is already configured in `apphosting.yaml` as a public variable.

#### Step 2: Set Optional Secrets (Comment out if skipping)

If you want to skip optional secrets, edit `apphosting.yaml` and comment out the lines:

```yaml
# Optional secrets - comment out if not using
# - variable: NEWS_API_KEY
#   secret: NEWS_API_KEY
```

**Or** set them up:

```bash
# News API (for career updates feature)
firebase apphosting:secrets:set NEWS_API_KEY

# Google Custom Search (for search features)
firebase apphosting:secrets:set GOOGLE_CUSTOM_SEARCH_API_KEY
firebase apphosting:secrets:set GOOGLE_CUSTOM_SEARCH_ENGINE_ID

# Reddit API (for community content)
firebase apphosting:secrets:set REDDIT_CLIENT_ID
firebase apphosting:secrets:set REDDIT_CLIENT_SECRET

# Redis (for background jobs)
firebase apphosting:secrets:set REDIS_HOST
firebase apphosting:secrets:set REDIS_PASSWORD
```

### Option 3: Use Minimal Configuration

I've already commented out optional secrets in `apphosting.yaml`. Now you only need:

1. **GEMINI_API_KEY** (Required)
2. **GOOGLE_GENAI_API_KEY** (Required - same as Gemini)

Set these and create a new rollout:

```bash
# Set required secrets
firebase apphosting:secrets:set GEMINI_API_KEY
firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY

# Commit the updated apphosting.yaml
git add apphosting.yaml
git commit -m "fix: Use minimal secrets configuration"
git push origin main

# Create new rollout in Firebase Console
# App Hosting → careerlens → Create rollout
```

## 🔍 Verify Secrets

Check which secrets are configured:

```bash
firebase apphosting:secrets:list
```

## 🎯 Current Issue

The error shows: `NEWS_API_KEY` is missing. You have two options:

### A. Add the missing secret:
```bash
firebase apphosting:secrets:set NEWS_API_KEY
# Get free API key from: https://newsapi.org/register
```

### B. Remove it from apphosting.yaml (Already done ✅)
The optional secrets are now commented out in `apphosting.yaml`.

## 📝 Next Steps

1. **Commit the changes** (optional secrets are now commented)
   ```bash
   git add apphosting.yaml setup-secrets.sh
   git commit -m "fix: Make optional secrets truly optional"
   git push origin main
   ```

2. **Set only required secrets**:
   ```bash
   ./setup-secrets.sh
   # Or manually:
   firebase apphosting:secrets:set GEMINI_API_KEY
   firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY
   ```

3. **Create new rollout** in Firebase Console:
   - Go to: https://console.firebase.google.com/project/careerlens-1/apphosting
   - Click "Create rollout"
   - Wait for deployment to complete

## 🚀 Alternative: Deploy Minimal Version First

Deploy with just AI features working, then add other features later:

```bash
# 1. Set only Gemini API keys
firebase apphosting:secrets:set GEMINI_API_KEY
firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY

# 2. Commit minimal config
git add apphosting.yaml
git commit -m "fix: Minimal config with only required secrets"
git push origin main

# 3. Create rollout in Firebase Console
# The app will work with AI features, but without:
# - News/Career Updates (needs NEWS_API_KEY)
# - Background Jobs (needs REDIS)
# - Reddit integration (needs REDDIT_CLIENT_ID/SECRET)
```

## ❓ FAQ

**Q: Do I need all these secrets?**
A: No! Only `GEMINI_API_KEY` and `GOOGLE_GENAI_API_KEY` are required. Others are optional.

**Q: Where do I get these API keys?**
A: See `SECRETS_SETUP.md` for links to each API provider.

**Q: Can I add secrets later?**
A: Yes! Add them anytime with `firebase apphosting:secrets:set SECRET_NAME`, then create a new rollout.

**Q: How do I delete a secret?**
A: `firebase apphosting:secrets:delete SECRET_NAME`

## ✅ Quick Fix Summary

**Right now, the fastest fix is:**

```bash
# Run the setup script
./setup-secrets.sh

# Or manually set just these two:
firebase apphosting:secrets:set GEMINI_API_KEY
firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY

# Then create a new rollout in Firebase Console
```

The optional secrets are already commented out in your `apphosting.yaml` file, so you're good to go! 🎉

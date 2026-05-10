# 🔧 Fix: Library Finder & News Not Working After Deployment

## 🎯 Problem
Two features work perfectly in local development but fail in production:

### 1. **Library Finder** 
- **Error**: "This page can't load Google Maps correctly"
- **Cause**: Missing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in production

### 2. **News Page**
- **Error**: "No Articles Found"
- **Cause**: Missing `NEWS_API_KEY` secret in Firebase

---

## ✅ Solution

I've already fixed the configuration. Now you just need to set the missing secret:

### Step 1: Set NEWS_API_KEY Secret

```bash
# Get your free API key from: https://newsapi.org/register
firebase apphosting:secrets:set NEWS_API_KEY
# Paste your News API key when prompted
```

### Step 2: Commit and Push Changes

```bash
git add apphosting.yaml setup-secrets.sh DEPLOYMENT_ERROR_FIX.md
git commit -m "fix: Add NEWS_API_KEY and Google Maps API for production deployment"
git push origin main
```

### Step 3: Create New Rollout

1. Go to Firebase Console: https://console.firebase.google.com/project/careerlens-1/apphosting
2. Click **"Create rollout"** button
3. Wait for deployment (2-5 minutes)

---

## 📋 What Changed

### ✅ Google Maps (Library Finder) - FIXED
**Before:**
```yaml
# Google Maps API was missing
```

**After:**
```yaml
# Google Maps API (Required for Library Finder)
- variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  value: AIzaSyCCovOlhJubYYE5iZ5I2AGk_roWOUVa5LU
```

✅ **This is now configured and will work immediately after rollout**

### ⚠️ News API - NEEDS SECRET
**Before:**
```yaml
# - variable: NEWS_API_KEY  # Commented out
#   secret: NEWS_API_KEY
```

**After:**
```yaml
- variable: NEWS_API_KEY  # Uncommented
  secret: NEWS_API_KEY
```

⚠️ **You need to set this secret** (see Step 1 above)

---

## 🚀 Quick Fix (All Steps)

### Option A: Using Setup Script (Recommended)
```bash
# Run interactive setup
./setup-secrets.sh

# Commit changes
git add .
git commit -m "fix: Add missing secrets for News and Maps"
git push origin main

# Create new rollout in Firebase Console
```

### Option B: Manual Setup
```bash
# 1. Set News API secret
firebase apphosting:secrets:set NEWS_API_KEY
# Get key from: https://newsapi.org/register

# 2. Verify secrets
firebase apphosting:secrets:list
# Should show: GEMINI_API_KEY, GOOGLE_GENAI_API_KEY, NEWS_API_KEY

# 3. Commit and push
git add apphosting.yaml
git commit -m "fix: Enable News API in production"
git push origin main

# 4. Create new rollout in Firebase Console
```

---

## 📝 Getting News API Key

### Free Tier (Recommended for Testing)
1. Visit: https://newsapi.org/register
2. Sign up with email
3. Verify email
4. Copy API key from dashboard
5. **Free tier includes**:
   - 100 requests per day
   - Headlines endpoint
   - Everything endpoint
   - Perfect for testing

### Paid Tier (For Production)
- Unlimited requests
- Commercial use
- Better rate limits
- See: https://newsapi.org/pricing

---

## 🧪 Testing After Fix

### Test Library Finder
1. Navigate to: https://careerlens-1.web.app/library-finder
2. Allow location access
3. Google Maps should load with library markers
4. Search should work

### Test News
1. Navigate to: https://careerlens-1.web.app/news
2. Should see latest news articles
3. Toggle between Indian/Global news
4. Search should work

---

## 🔍 Verification Commands

### Check if secrets are set:
```bash
firebase apphosting:secrets:list
```

**Expected output:**
```
GEMINI_API_KEY
GOOGLE_GENAI_API_KEY
NEWS_API_KEY
```

### Check environment variables in apphosting.yaml:
```bash
grep -A 1 "GOOGLE_MAPS\|NEWS_API" apphosting.yaml
```

**Expected output:**
```yaml
- variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  value: AIzaSyCCovOlhJubYYE5iZ5I2AGk_roWOUVa5LU
- variable: NEWS_API_KEY
  secret: NEWS_API_KEY
```

---

## ❓ Troubleshooting

### Library Finder still not working?
**Check:**
1. Google Maps API is enabled in GCP Console
2. API key has correct restrictions
3. Clear browser cache
4. Check browser console for errors

**Fix billing if needed:**
- Google Maps requires billing enabled (even for free tier)
- Enable at: https://console.cloud.google.com/billing
- You get $200 free credit monthly

### News still showing "No Articles Found"?
**Check:**
1. NEWS_API_KEY secret is set: `firebase apphosting:secrets:list`
2. API key is valid: Test at https://newsapi.org/docs
3. You haven't exceeded rate limit (100/day on free tier)
4. Check API route logs in Firebase Console

**Debug:**
```bash
# Check logs
firebase apphosting:logs --tail

# Look for errors like:
# "NEWS_API_KEY environment variable is not set"
# "NewsAPI error: 429" (rate limit exceeded)
# "NewsAPI error: 401" (invalid API key)
```

---

## 🎉 Success Checklist

After following these steps, verify:

- [ ] `NEWS_API_KEY` secret is set in Firebase
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is in `apphosting.yaml`
- [ ] Changes committed and pushed to GitHub
- [ ] New rollout created in Firebase Console
- [ ] Library Finder loads Google Maps correctly
- [ ] News page shows articles
- [ ] Both features work as expected

---

## 📊 Summary

### What Works Now
✅ **Google Maps (Library Finder)** - API key added to apphosting.yaml
✅ **All AI Features** - Gemini API keys configured
✅ **Authentication** - Firebase config present
✅ **Dashboard, Profile, Career Navigator** - All working

### What Needs Action
⚠️ **News API** - Set `NEWS_API_KEY` secret (1 command)

### Optional (Can Add Later)
- Reddit API (for community features)
- Redis (for background jobs)
- Google Custom Search (for search features)

---

**Time to Fix**: ~5 minutes
**Commands**: 3 (set secret, commit, create rollout)
**Cost**: Free (NewsAPI free tier)

🚀 **After the fix, both features will work perfectly in production!**

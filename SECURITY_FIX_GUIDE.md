# 🔒 Security Fix Guide - Exposed API Key

## ⚠️ Issue
GitGuardian detected an exposed NewsAPI key in commit `59d186c` in the file `src/app/api/news/route.ts`.

**Exposed Key:** `649784e50c964c6d80cd7e75ddb0d94f`

## 🚨 IMMEDIATE ACTION REQUIRED

### Step 1: Revoke the Exposed API Key

1. Visit [NewsAPI.org Account](https://newsapi.org/account)
2. Log in to your account
3. Find the exposed key: `649784e50c964c6d80cd7e75ddb0d94f`
4. **Delete or regenerate this API key immediately**
5. Generate a new API key

### Step 2: Update Your Local Environment

1. Open your `.env` file:
   ```bash
   nano /media/bharath/CCFEB79CFEB77CF0/ubuntu/CareerLens/CareerLens/.env
   ```

2. Replace the old API key with your new one:
   ```env
   NEWS_API_KEY=YOUR_NEW_API_KEY_HERE
   ```

3. Save and close the file

### Step 3: Verify the Fix

The code has already been updated to use environment variables (commit `1587b49`), so no code changes are needed. Just update your `.env` file.

## 📝 What Was Done

✅ **Already Fixed:**
- Removed hardcoded API key from `src/app/api/news/route.ts`
- Added environment variable check
- Created `.env.example` template
- Added proper error handling

⚠️ **Still Needs Attention:**
- The old API key is in git history (commits before `1587b49`)
- This key should be revoked immediately
- Get a new API key from NewsAPI.org

## 🔐 Best Practices Going Forward

1. **Never commit API keys** to git
2. **Always use environment variables** for sensitive data
3. **Keep `.env` in `.gitignore`** (already done ✅)
4. **Use `.env.example`** for documentation (already done ✅)
5. **Rotate keys regularly** as a security practice

## 📚 Additional Security Resources

- [NewsAPI Account Management](https://newsapi.org/account)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Environment Variables Best Practices](https://12factor.net/config)

## ✅ Verification Checklist

- [ ] Revoked old API key on NewsAPI.org
- [ ] Generated new API key
- [ ] Updated `.env` file with new key
- [ ] Tested the news feature locally
- [ ] Confirmed no other hardcoded secrets in codebase

---

**Note:** The current code (commit `1587b49`) is already secure. You just need to revoke the old key and get a new one to complete the security fix.

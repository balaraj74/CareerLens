# 🚀 Quick Deployment Guide

## Prerequisites Checklist
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] All environment variables configured in `.env.local`
- [ ] Redis instance running (for background jobs)
- [ ] BigQuery dataset created
- [ ] Service account credentials configured

## Quick Deploy (3 Steps)

### 1. Run the deployment script
```bash
./deploy.sh
```

### 2. Choose deployment type
- **Preview** (Recommended first): Test in isolated environment
- **Production**: Deploy to live site
- **Both**: Preview first, then production after testing

### 3. Monitor deployment
- Check Firebase Console for logs
- Test API endpoints
- Verify frontend functionality

## Manual Deployment

If you prefer manual control:

```bash
# 1. Type check
npm run typecheck

# 2. Build
npm run build

# 3. Deploy to preview
firebase hosting:channel:deploy preview

# 4. Deploy to production (after testing preview)
firebase deploy --only hosting
firebase deploy --only firestore
```

## Environment Variables Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Required variables:
   - `GEMINI_API_KEY` - For AI features
   - `NEWS_API_KEY` - For career updates
   - `GOOGLE_CUSTOM_SEARCH_API_KEY` - For search
   - `REDIS_HOST` - For background jobs
   - Firebase configuration (all NEXT_PUBLIC_FIREBASE_*)

## Post-Deployment Testing

### Test API Endpoints
```bash
# eBooks API
curl "https://careerlens-1.web.app/api/ebooks/archive/search?query=python"

# Career Updates
curl https://careerlens-1.web.app/api/career-updates/latest

# News API
curl https://careerlens-1.web.app/api/news

# Health check
curl https://careerlens-1.web.app/api/health
```

### Test Frontend
- [ ] Login/Signup works
- [ ] Dashboard loads
- [ ] Career Navigator functional
- [ ] AI features respond
- [ ] Background animation visible

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment variables not found
```bash
# Check if .env.local exists and is properly formatted
cat .env.local

# Restart dev server if testing locally
npm run dev
```

### Deployment fails
```bash
# Check Firebase login
firebase login --reauth

# Verify project
firebase projects:list
firebase use your-project-id
```

## Rollback

If something goes wrong:

```bash
# Via Firebase Console
# Hosting → Release History → Rollback

# Or via CLI
firebase hosting:clone SOURCE:CHANNEL TARGET:live
```

## Support

- **Full Documentation**: See `FIREBASE_ROLLOUT_PLAN.md`
- **Firebase Console**: https://console.firebase.google.com
- **Firebase Support**: https://firebase.google.com/support

---

**Ready to deploy?** Run `./deploy.sh` to get started! 🚀

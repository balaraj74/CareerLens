# ✅ AI Career Intelligence Hub - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup

- [ ] **Node.js 18+** installed
- [ ] **Firebase CLI** installed (`npm install -g firebase-tools`)
- [ ] **Firebase project** created
- [ ] **Google Cloud project** linked to Firebase
- [ ] **Gemini API key** obtained
- [ ] **News API key** obtained (optional)

### 2. Configuration Files

- [ ] `.env.local` created in project root
- [ ] `functions/.env` created with API keys
- [ ] All required environment variables set:
  ```bash
  # .env.local
  NEXT_PUBLIC_FIREBASE_API_KEY=xxx
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
  GOOGLE_GENAI_API_KEY=xxx
  GEMINI_API_KEY=xxx
  
  # functions/.env
  NEWS_API_KEY=xxx (optional)
  GEMINI_API_KEY=xxx
  ```

### 3. Firebase Configuration

- [ ] **Firestore Database** enabled
- [ ] **Firebase Authentication** enabled
- [ ] **Google OAuth** configured
- [ ] **Cloud Functions** enabled
- [ ] **Cloud Scheduler** enabled (for scheduled functions)

### 4. Code Verification

- [ ] All TypeScript files compile without errors
- [ ] `npm run build` succeeds
- [ ] No console errors in development
- [ ] All imports resolved correctly
- [ ] Environment variables loaded correctly

## Deployment Steps

### Step 1: Build Functions

```bash
cd functions
npm install
npm run build
cd ..
```

**Verify:**
- [ ] `functions/lib/` directory created
- [ ] No TypeScript compilation errors
- [ ] All service files compiled

### Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**Verify:**
- [ ] Rules deployed successfully
- [ ] Check Firebase Console > Firestore > Rules
- [ ] Rules include `careerUpdates` collection
- [ ] Subcollections (jobs, skills, certifications) have permissions

### Step 3: Deploy Cloud Functions

```bash
firebase deploy --only functions:fetchCareerUpdates,functions:refreshCareerUpdates
```

**Verify:**
- [ ] Functions deployed successfully
- [ ] Check Firebase Console > Functions
- [ ] Both functions listed:
  - `fetchCareerUpdates` (scheduled)
  - `refreshCareerUpdates` (HTTP)
- [ ] No deployment errors

### Step 4: Configure Cloud Scheduler

```bash
# Check if scheduler is created
gcloud scheduler jobs list
```

**Verify:**
- [ ] Scheduler job exists for `fetchCareerUpdates`
- [ ] Schedule is "every 12 hours"
- [ ] Job is enabled

**If not created automatically:**
```bash
gcloud scheduler jobs create pubsub fetchCareerUpdates \
  --schedule="0 */12 * * *" \
  --topic=firebase-schedule-fetchCareerUpdates \
  --message-body="{}"
```

### Step 5: Test Cloud Functions

```bash
# Test manual refresh endpoint
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/refreshCareerUpdates
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Career updates refreshed successfully"
}
```

**Verify:**
- [ ] HTTP 200 status code
- [ ] Success message returned
- [ ] Check Firestore for new data
- [ ] Check function logs: `firebase functions:log`

### Step 6: Verify Firestore Data

**Check Firebase Console > Firestore:**

- [ ] `/careerUpdates/{today's date}` document exists
- [ ] Document contains:
  - [ ] `summary` field (AI-generated)
  - [ ] `news` array
  - [ ] `reddit` array
  - [ ] `timestamp` field
- [ ] Subcollections exist:
  - [ ] `/jobs/` (with documents)
  - [ ] `/skills/` (with documents)
  - [ ] `/certifications/` (with documents)

### Step 7: Deploy Next.js App

```bash
# Build Next.js app
npm run build

# Deploy to Firebase App Hosting
firebase apphosting:rollouts:create careerlens -b main -f
```

**Verify:**
- [ ] Build succeeds
- [ ] Deployment completes
- [ ] App accessible at production URL
- [ ] No build errors

### Step 8: Test Frontend

**Visit:** `https://your-app.com/career-updates`

**Verify:**
- [ ] Page loads without errors
- [ ] Data displays in all tabs
- [ ] "Refresh Now" button works
- [ ] Real-time updates work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Animations smooth

## Post-Deployment Verification

### 1. Functionality Tests

- [ ] **All Updates Tab**
  - [ ] News articles display
  - [ ] Reddit posts display
  - [ ] Correct timestamps
  - [ ] Links work

- [ ] **Trending Skills Tab**
  - [ ] Skills display with metrics
  - [ ] Trend indicators correct
  - [ ] Demand change percentages shown

- [ ] **Certifications Tab**
  - [ ] Certifications display
  - [ ] Enroll links work
  - [ ] Free/Paid badges correct

- [ ] **Job Opportunities Tab**
  - [ ] Jobs display
  - [ ] Apply links work
  - [ ] Skills tags shown

- [ ] **AI Insights Tab**
  - [ ] Summary displays
  - [ ] Highlights shown
  - [ ] Actionable insights listed

### 2. Performance Tests

- [ ] **Page Load Time** < 2 seconds
- [ ] **Data Fetch Time** < 30 seconds
- [ ] **Real-time Update** < 1 second
- [ ] **Bundle Size** < 100KB

**Measure with:**
```bash
# Lighthouse audit
npm run build
npx lighthouse https://your-app.com/career-updates --view
```

### 3. Error Handling Tests

- [ ] **No Data Scenario**
  - [ ] Empty state message shows
  - [ ] "Refresh Now" instruction clear

- [ ] **Network Error**
  - [ ] Error message displays
  - [ ] Retry option available

- [ ] **API Rate Limit**
  - [ ] Graceful degradation
  - [ ] Fallback to cached data

### 4. Security Tests

- [ ] **Firestore Rules**
  - [ ] Unauthenticated users can't write
  - [ ] Authenticated users can read
  - [ ] System can write

- [ ] **API Keys**
  - [ ] Not exposed in client code
  - [ ] Stored in environment variables
  - [ ] Not in Git repository

- [ ] **CORS**
  - [ ] Cloud Function allows web access
  - [ ] No CORS errors in console

## Monitoring Setup

### 1. Enable Logging

```bash
# View function logs
firebase functions:log --follow

# Filter by function
firebase functions:log --only fetchCareerUpdates
```

### 2. Set Up Alerts (Optional)

**Google Cloud Console > Monitoring > Alerting:**

- [ ] Alert on function errors
- [ ] Alert on high latency
- [ ] Alert on quota exceeded

### 3. Monitor Costs

**Firebase Console > Usage and Billing:**

- [ ] Check function invocations
- [ ] Check Firestore reads/writes
- [ ] Check Cloud Scheduler runs
- [ ] Set budget alerts

## Maintenance Tasks

### Daily

- [ ] Check function logs for errors
- [ ] Verify data is being updated
- [ ] Monitor API rate limits

### Weekly

- [ ] Review Firestore data quality
- [ ] Check for stale data
- [ ] Verify scheduler is running

### Monthly

- [ ] Review API costs
- [ ] Update API keys if needed
- [ ] Check for new data sources
- [ ] Update documentation

## Rollback Plan

### If Deployment Fails

1. **Revert Cloud Functions:**
   ```bash
   firebase functions:delete fetchCareerUpdates
   firebase functions:delete refreshCareerUpdates
   ```

2. **Revert Firestore Rules:**
   ```bash
   # Copy previous rules from Firebase Console
   # Redeploy: firebase deploy --only firestore:rules
   ```

3. **Revert Next.js App:**
   ```bash
   # Rollback to previous version in Firebase Console
   # App Hosting > Rollouts > Rollback
   ```

### If Data Issues Occur

1. **Clear Bad Data:**
   ```bash
   # Delete today's document in Firestore Console
   # Trigger fresh fetch
   curl -X POST https://your-function-url/refreshCareerUpdates
   ```

2. **Restore from Backup:**
   ```bash
   # If Firestore backups enabled
   # Restore from Firebase Console > Firestore > Backups
   ```

## Success Criteria

### Deployment Successful If:

- ✅ All functions deployed without errors
- ✅ Firestore rules deployed
- ✅ Data appears in Firestore
- ✅ Frontend displays data correctly
- ✅ Manual refresh works
- ✅ Real-time updates work
- ✅ No console errors
- ✅ Performance metrics met
- ✅ Security tests pass

### Ready for Production If:

- ✅ All success criteria met
- ✅ Monitoring set up
- ✅ Alerts configured
- ✅ Documentation updated
- ✅ Team trained on maintenance
- ✅ Rollback plan tested

## Troubleshooting

### Common Issues

#### Issue: Functions not deploying
```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools@latest

# Re-authenticate
firebase login --reauth
```

#### Issue: Scheduler not running
```bash
# Check scheduler status
gcloud scheduler jobs list

# Manually trigger
gcloud scheduler jobs run fetchCareerUpdates
```

#### Issue: No data in Firestore
```bash
# Check function logs
firebase functions:log --only fetchCareerUpdates

# Manually trigger refresh
curl -X POST https://your-function-url/refreshCareerUpdates

# Check API keys
echo $GEMINI_API_KEY
```

#### Issue: Frontend not updating
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check Firestore rules
firebase deploy --only firestore:rules
```

## Final Checklist

Before marking deployment complete:

- [ ] All deployment steps completed
- [ ] All verification tests passed
- [ ] Monitoring enabled
- [ ] Documentation updated
- [ ] Team notified
- [ ] Rollback plan documented
- [ ] Success criteria met

## Sign-Off

**Deployed By:** _________________  
**Date:** _________________  
**Version:** _________________  
**Status:** ✅ Production Ready / ⚠️ Issues Found / ❌ Failed

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Last Updated**: January 2025  
**Maintained By**: Balaraj R (@balaraj74)

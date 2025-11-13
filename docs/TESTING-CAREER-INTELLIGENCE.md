# 🧪 Testing Guide - AI Career Intelligence Hub

## Quick Start Testing

### 1. Test Locally (Without Deployment)

```bash
# Start the Next.js dev server
npm run dev

# Visit the Career Updates page
open http://localhost:3000/career-updates

# Click "Refresh Now" button
# This will fetch data using client-side service (no Cloud Functions needed)
```

### 2. Test Cloud Functions Locally

```bash
# Terminal 1: Start Firebase Emulators
cd functions
npm run serve

# Terminal 2: Trigger the function
curl -X POST http://localhost:5001/careerlens-1/us-central1/refreshCareerUpdates

# Check logs in Terminal 1
```

### 3. Test Production Deployment

```bash
# Deploy functions
./scripts/deploy-career-intelligence.sh

# Test the endpoint
curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates

# Check Firestore Console
# Navigate to: careerUpdates/{today's date}
```

## Detailed Testing Scenarios

### Scenario 1: Fresh Data Fetch

**Steps:**
1. Open Career Updates page
2. Click "Refresh Now"
3. Wait 10-30 seconds
4. Verify data appears in all tabs

**Expected Results:**
- ✅ Loading spinner appears
- ✅ News articles displayed (5-15 items)
- ✅ Reddit posts displayed (5-10 items)
- ✅ Skills tab shows trending skills (8-10 items)
- ✅ AI Insights tab shows summary
- ✅ Last updated timestamp changes

### Scenario 2: Real-time Updates

**Steps:**
1. Open Career Updates page in Browser 1
2. Open Firebase Console in Browser 2
3. Manually add a document to `/careerUpdates/{today}`
4. Watch Browser 1 for automatic update

**Expected Results:**
- ✅ Data appears without page refresh
- ✅ No console errors
- ✅ Smooth animation on new data

### Scenario 3: Cached Data

**Steps:**
1. Visit Career Updates page (first time today)
2. Wait for data to load
3. Refresh the page (F5)
4. Data should load instantly from cache

**Expected Results:**
- ✅ Instant load on second visit
- ✅ No API calls made
- ✅ Same data displayed

### Scenario 4: Error Handling

**Steps:**
1. Disconnect internet
2. Click "Refresh Now"
3. Verify error message appears

**Expected Results:**
- ✅ User-friendly error message
- ✅ Suggestion to check connection
- ✅ Retry button available

### Scenario 5: Empty State

**Steps:**
1. Clear Firestore data for today
2. Visit Career Updates page
3. Don't click refresh

**Expected Results:**
- ✅ Empty state message shown
- ✅ "Click Refresh Now" instruction
- ✅ No console errors

## API Testing

### Test Reddit Service

```bash
# Test Reddit API directly
curl "https://www.reddit.com/r/cscareerquestions/hot.json?limit=5" \
  -H "User-Agent: CareerLens/1.0"

# Should return JSON with posts
```

### Test News API (requires API key)

```bash
# Test Google News API
curl "https://newsapi.org/v2/everything?q=AI%20careers&apiKey=YOUR_KEY"

# Should return JSON with articles
```

### Test Cloud Function

```bash
# Test manual refresh endpoint
curl -X POST \
  https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "message": "Career updates refreshed successfully"
# }
```

### Test Next.js API Route

```bash
# Test latest data endpoint
curl http://localhost:3000/api/career-updates/latest

# Test refresh endpoint
curl -X POST http://localhost:3000/api/career-updates/refresh
```

## Firestore Testing

### Verify Data Structure

```javascript
// Run in Firebase Console > Firestore > Query
const today = new Date().toISOString().split('T')[0];
const docRef = db.collection('careerUpdates').doc(today);

docRef.get().then(doc => {
  if (doc.exists) {
    console.log('✅ Document exists');
    console.log('Summary:', doc.data().summary);
    console.log('News count:', doc.data().news?.length);
    console.log('Reddit count:', doc.data().reddit?.length);
  } else {
    console.log('❌ No data for today');
  }
});
```

### Check Subcollections

```javascript
// Check jobs subcollection
const jobsRef = db.collection('careerUpdates')
  .doc(today)
  .collection('jobs');

jobsRef.get().then(snapshot => {
  console.log('Jobs count:', snapshot.size);
  snapshot.forEach(doc => {
    console.log('Job:', doc.data().title);
  });
});
```

## Performance Testing

### Measure Load Time

```javascript
// Add to page.tsx
console.time('Data Load');

// After data loads
console.timeEnd('Data Load');
// Expected: < 2 seconds
```

### Check Bundle Size

```bash
npm run build

# Check .next/static/chunks/
# Career updates page should be < 100KB
```

### Monitor API Calls

```javascript
// Open DevTools > Network tab
// Filter by "Fetch/XHR"
// Verify:
// - Only 1 Firestore read on page load
// - No unnecessary API calls
// - Proper caching headers
```

## Automated Testing

### Unit Tests (Future)

```typescript
// __tests__/career-updates.test.ts
import { fetchAllCareerData } from '@/lib/services/fetch-career-data';

describe('Career Data Fetching', () => {
  it('should fetch news data', async () => {
    const data = await fetchAllCareerData();
    expect(data.news).toBeDefined();
    expect(data.news.length).toBeGreaterThan(0);
  });

  it('should fetch Reddit data', async () => {
    const data = await fetchAllCareerData();
    expect(data.reddit).toBeDefined();
  });
});
```

### Integration Tests (Future)

```typescript
// __tests__/integration/career-intelligence.test.ts
import { refreshCareerUpdates } from '@/functions/src/fetchCareerIntelligence';

describe('Career Intelligence Integration', () => {
  it('should fetch and store data', async () => {
    await refreshCareerUpdates();
    
    // Verify Firestore has data
    const today = new Date().toISOString().split('T')[0];
    const doc = await db.collection('careerUpdates').doc(today).get();
    
    expect(doc.exists).toBe(true);
    expect(doc.data().news).toBeDefined();
  });
});
```

## Debugging Tips

### Enable Verbose Logging

```typescript
// Add to page.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('📊 Data loaded:', {
    news: updates.length,
    skills: skills.length,
    jobs: jobs.length
  });
}
```

### Check Firestore Rules

```bash
# Test read access
firebase firestore:rules:test \
  --collection=careerUpdates \
  --operation=read \
  --auth='{"uid":"test-user"}'

# Expected: ALLOW
```

### Monitor Cloud Function Logs

```bash
# Follow logs in real-time
firebase functions:log --follow

# Filter by function name
firebase functions:log --only fetchCareerUpdates

# Check for errors
firebase functions:log | grep ERROR
```

### Inspect Network Requests

```javascript
// Add to page.tsx
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('firestore')) {
        console.log('Firestore request:', entry.duration, 'ms');
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
}, []);
```

## Common Issues & Solutions

### Issue: No data appearing

**Debug Steps:**
1. Check browser console for errors
2. Verify Firestore rules are deployed
3. Check if user is authenticated
4. Manually trigger refresh
5. Check Cloud Function logs

**Solution:**
```bash
# Redeploy rules
firebase deploy --only firestore:rules

# Trigger manual refresh
curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates
```

### Issue: Slow loading

**Debug Steps:**
1. Check Network tab for slow requests
2. Verify Firestore indexes exist
3. Check bundle size
4. Monitor API rate limits

**Solution:**
```bash
# Create Firestore indexes
firebase firestore:indexes

# Optimize bundle
npm run build -- --analyze
```

### Issue: Stale data

**Debug Steps:**
1. Check last updated timestamp
2. Verify Cloud Scheduler is running
3. Check Cloud Function logs
4. Manually trigger refresh

**Solution:**
```bash
# Check scheduler status
gcloud scheduler jobs list

# Manually trigger
curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates
```

## Checklist Before Production

- [ ] Environment variables configured
- [ ] Cloud Functions deployed
- [ ] Firestore rules deployed
- [ ] API keys secured (not in code)
- [ ] Error handling tested
- [ ] Loading states working
- [ ] Real-time updates working
- [ ] Manual refresh working
- [ ] Empty states handled
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Logs monitored
- [ ] Rate limits configured
- [ ] Caching working
- [ ] Documentation updated

## Success Metrics

### Performance
- ✅ Page load < 2 seconds
- ✅ Data fetch < 30 seconds
- ✅ Real-time update < 1 second
- ✅ Bundle size < 100KB

### Reliability
- ✅ 99% uptime
- ✅ < 1% error rate
- ✅ Graceful degradation
- ✅ Proper error messages

### User Experience
- ✅ Smooth animations
- ✅ Clear loading states
- ✅ Helpful error messages
- ✅ Intuitive navigation

---

**Last Updated**: January 2025  
**Maintained By**: Balaraj R (@balaraj74)

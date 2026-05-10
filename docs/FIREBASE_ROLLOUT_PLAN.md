# 🚀 CareerLens Firebase Rollout Plan

## 📋 Overview
Complete rollout guide for deploying CareerLens with all newly added APIs to Firebase App Hosting.

**Current Version**: 0.1.0  
**Deployment Target**: Firebase App Hosting (Next.js 15.5.6)  
**Runtime**: Node.js 20  
**Firebase Site**: careerlens-1

---

## 🆕 Newly Added APIs & Features

### 1. **eBooks Integration** 📚
- **Endpoints**:
  - `GET /api/ebooks/archive/search` - Search Internet Archive for books
  - `GET /api/ebooks/archive/metadata` - Get detailed book metadata
- **Service**: `src/lib/services/internet-archive-service.ts`
- **Features**: Free eBook discovery, download links, metadata retrieval

### 2. **Course Scraper** 🎓
- **Endpoints**:
  - `POST /api/courses/scrape` - Scrape course information from URLs
- **Service**: `src/lib/services/course-scraper-service.ts`
- **Features**: Extract course details, pricing, reviews, curriculum

### 3. **English Helper** 🗣️
- **Endpoints**:
  - `POST /api/english-helper` - AI-powered English learning assistance
- **Features**: Grammar correction, pronunciation help, conversation practice
- **AI Model**: Gemini 1.5 Pro

### 4. **Background Jobs System** ⚙️
- **Endpoints**:
  - `POST /api/jobs` - Create background job
  - `GET /api/jobs/[jobId]/status` - Check job status
  - `POST /api/jobs/[jobId]/cancel` - Cancel job
- **Service**: BullMQ with Redis
- **Features**: Long-running task management, progress tracking

### 5. **BigQuery Integration** 📊
- **Endpoints**:
  - `POST /api/bigquery/career-insights` - Career trend analysis
  - `POST /api/bigquery/skill-gap-analysis` - Skill gap identification
  - `POST /api/bigquery/resume-optimization` - Resume keyword optimization
  - `GET /api/bigquery/trending-skills` - Get trending skills
  - `GET /api/bigquery/salary-range` - Salary data by role/location
- **Service**: `src/lib/bigquery/service.ts`
- **Features**: Real-time market data, salary insights, skill trends

### 6. **Enhanced Career Updates** 📰
- **Endpoints**:
  - `GET /api/career-updates/latest` - Latest career news
  - `POST /api/career-updates/refresh` - Refresh all sources
  - `GET /api/career-updates/debug` - Debug endpoint
- **Services**: 
  - News API integration
  - Reddit API integration
  - Google Custom Search
- **Features**: Multi-source aggregation, AI summarization, real-time updates

### 7. **AI-Powered Features** 🤖
- **Endpoints**:
  - `POST /api/ai/career-summary` - Generate career summary
  - `POST /api/ai/personalized-brief` - Personalized career briefs
  - `POST /api/copilot/chat` - AI chat assistant
- **AI Models**: Gemini 1.5 Pro via Google Generative AI
- **Features**: Context-aware responses, career guidance, personalized recommendations

---

## 🔧 Pre-Deployment Checklist

### Environment Variables Required

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Google Cloud Platform
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
GCP_PROJECT_ID=your_gcp_project_id
BIGQUERY_DATASET_ID=career_data

# News & Search APIs
NEWS_API_KEY=your_news_api_key
GOOGLE_CUSTOM_SEARCH_API_KEY=your_search_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=CareerLens/1.0

# Redis (for Background Jobs)
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Optional: Socket.io for Real-time Updates
SOCKET_SERVER_URL=your_socket_server_url
```

### Infrastructure Setup

#### 1. **BigQuery Setup** 📊
```bash
# Run the setup script
chmod +x scripts/setup-bigquery.sh
./scripts/setup-bigquery.sh

# Or manually create tables using:
# src/lib/bigquery/schemas.sql
```

#### 2. **Redis Setup** (for Background Jobs) 🔴
```bash
# Option 1: Google Cloud Memorystore
gcloud redis instances create careerlens-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_6_x

# Option 2: Redis Labs Cloud
# Visit https://redis.com/try-free/

# Option 3: Docker (Development)
docker run -d -p 6379:6379 redis:7-alpine
```

#### 3. **Firestore Indexes** 🔥
```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Verify indexes are created
firebase firestore:indexes
```

#### 4. **Firestore Rules** 🔒
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Test rules
firebase emulators:start --only firestore
```

---

## 📦 Build & Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Environment Configuration
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Edit .env.local with your actual values
nano .env.local
```

### Step 3: Run Type Check
```bash
npm run typecheck
```

### Step 4: Test Build Locally
```bash
# Build the application
npm run build

# Test production build
npm run start
```

### Step 5: Deploy to Firebase

#### Option A: Full Deployment (Recommended for First Time)
```bash
# Login to Firebase
firebase login

# Initialize (if not already done)
firebase init

# Deploy everything
firebase deploy
```

#### Option B: Selective Deployment
```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore
firebase deploy --only firestore
```

#### Option C: Staged Rollout (Recommended for Production)
```bash
# Deploy to preview channel first
firebase hosting:channel:deploy preview-v2

# Test thoroughly, then deploy to live
firebase deploy --only hosting
```

---

## 🧪 Post-Deployment Testing

### 1. API Health Checks

```bash
# Test base URL
curl https://careerlens-1.web.app/

# Test eBooks API
curl "https://careerlens-1.web.app/api/ebooks/archive/search?query=python&limit=5"

# Test Career Updates
curl https://careerlens-1.web.app/api/career-updates/latest

# Test News API
curl https://careerlens-1.web.app/api/news

# Test Background Jobs
curl -X POST https://careerlens-1.web.app/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{}}'
```

### 2. Frontend Functionality Tests

- ✅ User Authentication (Sign up/Login)
- ✅ Dashboard loads correctly
- ✅ Profile page displays data
- ✅ Career Navigator works
- ✅ Career Graph visualization
- ✅ AI Calendar functionality
- ✅ Career Updates feed refreshes
- ✅ eBooks search and display
- ✅ English Helper responds
- ✅ Background video plays
- ✅ Mesh wave animation visible
- ✅ Glassmorphism UI renders correctly

### 3. Performance Checks

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://careerlens-1.web.app/ --view

# Check Core Web Vitals
# Visit: https://pagespeed.web.dev/
```

---

## 📊 Monitoring & Analytics

### Firebase Console Monitoring

1. **Hosting Metrics**
   - Navigate to: Firebase Console → Hosting
   - Monitor: Traffic, Bandwidth, Storage usage

2. **Function Logs**
   - Navigate to: Firebase Console → Functions
   - Check: Execution logs, Error rates, Latency

3. **Firestore Usage**
   - Navigate to: Firebase Console → Firestore
   - Monitor: Read/Write operations, Storage size

4. **Performance Monitoring**
   - Navigate to: Firebase Console → Performance
   - Track: Page load times, API response times

### Set Up Alerts

```bash
# Create alert policies in GCP Console
# Monitor:
# - API error rates > 5%
# - Response times > 3 seconds
# - BigQuery query costs > threshold
# - Redis memory usage > 80%
```

---

## 🔄 Rollback Plan

### Quick Rollback to Previous Version

```bash
# List hosting releases
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Or rollback via Firebase Console
# Hosting → Rollback → Select previous version
```

### Emergency Rollback Script

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rolling back to previous version..."

# Get previous release
PREVIOUS_VERSION=$(firebase hosting:releases:list --limit 2 | tail -n 1 | awk '{print $1}')

# Restore previous version
firebase hosting:rollback $PREVIOUS_VERSION

echo "✅ Rollback complete!"
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: API Routes Return 404
**Solution**: Check `apphosting.yaml` routing configuration
```yaml
runConfig:
  minInstances: 0
  maxInstances: 10
  concurrency: 80
env:
  - variable: NODE_ENV
    value: production
```

### Issue 2: Environment Variables Not Found
**Solution**: Set in Firebase Console
```bash
firebase functions:config:set \
  gemini.key="YOUR_KEY" \
  news.key="YOUR_KEY"
```

### Issue 3: BigQuery Authentication Fails
**Solution**: Verify service account permissions
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/bigquery.dataEditor"
```

### Issue 4: Redis Connection Timeout
**Solution**: Check VPC/firewall rules, verify Redis host/port

### Issue 5: Build Fails Due to Memory
**Solution**: Increase Node.js memory limit
```json
// package.json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- **Auto-scaling**: Firebase App Hosting handles automatically
- **Max Instances**: Configure in `apphosting.yaml`
- **Concurrency**: Set based on load testing results

### Caching Strategy
```javascript
// Implement at API level
export const revalidate = 3600; // 1 hour cache

// Or use Firebase CDN caching
// Set Cache-Control headers in responses
```

### Database Optimization
- **Firestore**: Create composite indexes for complex queries
- **BigQuery**: Use partitioned tables for large datasets
- **Redis**: Implement key expiration policies

---

## 🔐 Security Hardening

### 1. API Rate Limiting
```typescript
// middleware.ts
import { rateLimiter } from '@/lib/rate-limiter';

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const isAllowed = await rateLimiter.check(ip);
  
  if (!isAllowed) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

### 2. CORS Configuration
```typescript
// Add to API routes
headers: {
  'Access-Control-Allow-Origin': 'https://careerlens-1.web.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
```

### 3. API Key Protection
```typescript
// Verify API keys server-side only
if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing API key');
}
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Local testing complete
- [ ] Firestore indexes created
- [ ] Firestore rules updated
- [ ] BigQuery tables created
- [ ] Redis instance running
- [ ] Service account permissions verified

### During Deployment
- [ ] Deploy to preview channel first
- [ ] Test all API endpoints
- [ ] Verify frontend functionality
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Run Lighthouse audit

### Post-Deployment
- [ ] Update DNS if needed
- [ ] Configure custom domain
- [ ] Set up monitoring alerts
- [ ] Enable Firebase Analytics
- [ ] Document deployment date/version
- [ ] Notify team of successful deployment
- [ ] Monitor for 24 hours

---

## 🎯 Next Steps After Rollout

1. **Monitor Performance** - First 48 hours critical
2. **Gather User Feedback** - Set up feedback mechanism
3. **Optimize Slow APIs** - Profile and improve
4. **Scale Infrastructure** - Based on actual usage
5. **Implement A/B Testing** - For new features
6. **Set Up CI/CD Pipeline** - Automate future deployments

---

## 📞 Support & Resources

### Documentation Links
- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
- [Gemini AI Documentation](https://ai.google.dev/docs)

### Emergency Contacts
- **Firebase Support**: [Console Support](https://console.firebase.google.com/support)
- **GCP Support**: [Cloud Console](https://console.cloud.google.com/support)

---

## 📊 Success Metrics

### Week 1 Targets
- ✅ Uptime: 99.9%
- ✅ API Response Time: < 2 seconds
- ✅ Error Rate: < 1%
- ✅ User Authentication: 100% success rate

### Month 1 Targets
- ✅ Active Users: Track growth
- ✅ Feature Adoption: Monitor new API usage
- ✅ Performance: Maintain Core Web Vitals scores
- ✅ Cost Optimization: Stay within budget

---

## 🚀 Quick Deploy Commands

```bash
# Complete deployment script
#!/bin/bash

echo "🚀 Starting CareerLens deployment..."

# 1. Type check
echo "📝 Running type check..."
npm run typecheck || exit 1

# 2. Build
echo "🔨 Building application..."
npm run build || exit 1

# 3. Deploy to preview
echo "🔍 Deploying to preview channel..."
firebase hosting:channel:deploy preview

# 4. Prompt for production
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Deploying to production..."
    firebase deploy
    echo "✅ Deployment complete!"
else
    echo "❌ Production deployment cancelled"
fi
```

---

**Last Updated**: November 21, 2025  
**Version**: 1.0  
**Status**: Ready for Production Rollout 🎉

# 🧠 AI Career Intelligence Hub

> Real-time career data aggregation and AI-powered insights using Google Cloud

---

## 🎯 Overview

The AI Career Intelligence Hub is a fully automated system that fetches, analyzes, and summarizes career trends, jobs, certifications, and skill insights from multiple trusted sources every 12 hours.

### Key Features

- 🤖 **AI-Powered Summarization** using Gemini 2.5 Flash
- ⚡ **Real-time Updates** via Firestore listeners
- 🔄 **Automated Data Fetching** every 12 hours
- 📊 **Multiple Data Sources** (Reddit, Google News, Learning Platforms)
- 🎨 **Modern UI** with categorized tabs and animations
- 🔧 **Manual Refresh** option for on-demand updates

---

## 🏗️ Architecture

```
Cloud Scheduler (every 12 hours)
         ↓
fetchCareerUpdates() Cloud Function
         ↓
Parallel API Calls:
  • Reddit API (8 subreddits)
  • Google News API (career articles)
  • Learning Platforms (courses)
         ↓
Gemini AI Processing
  • Summarize content
  • Extract skills
  • Categorize updates
         ↓
Store in Firestore
  /careerUpdates/{date}/
         ↓
Real-time Listener in Next.js
         ↓
Display to User
```

---

## 🚀 Quick Start

### Option 1: Test Locally (1 minute)

```bash
npm run dev
# Visit http://localhost:3000/career-updates
# Click "Refresh Now"
```

### Option 2: Deploy to Production (5 minutes)

```bash
./scripts/deploy-career-intelligence.sh
```

### Option 3: Manual Deployment

```bash
# Build functions
cd functions && npm run build && cd ..

# Deploy
firebase deploy --only firestore:rules
firebase deploy --only functions:fetchCareerUpdates,functions:refreshCareerUpdates
```

---

## 📚 Documentation

### Getting Started
- 🚀 **[Quick Start Guide](QUICK-START-CAREER-INTELLIGENCE.md)** - Get running in 5 minutes
- 📖 **[Implementation Guide](CAREER-INTELLIGENCE-HUB.md)** - Complete technical documentation
- 📊 **[Summary](CAREER-INTELLIGENCE-SUMMARY.md)** - Quick overview of features

### Development
- 🧪 **[Testing Guide](TESTING-CAREER-INTELLIGENCE.md)** - Testing scenarios and commands
- ✅ **[Deployment Checklist](DEPLOYMENT-CHECKLIST.md)** - Step-by-step deployment
- 📝 **[Upgrade Summary](../UPGRADE-SUMMARY.md)** - What's new and changed

---

## 🎨 Features

### Trending Skills Tab
- Top 10 skills with demand metrics
- Trend indicators (rising/stable/declining)
- Demand change percentages
- Average salary ranges
- Job counts
- Related roles

### Job Opportunities Tab
- Extracted from news and Reddit
- Job title, company, location
- Job type (full-time/internship/remote)
- Required skills
- Apply links
- Salary ranges

### Certifications Tab
- Curated from learning platforms
- Free and paid options
- Beginner to advanced levels
- Duration estimates
- Direct enroll links

### AI Insights Tab
- Gemini-generated summary
- Weekly highlights
- Top skills in demand
- Industry trends
- Actionable insights

---

## 🔧 Configuration

### Environment Variables

**Next.js** (`.env.local`):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
GOOGLE_GENAI_API_KEY=xxx
```

**Cloud Functions** (`functions/.env`):
```bash
NEWS_API_KEY=xxx  # Optional
GEMINI_API_KEY=xxx  # Required
```

### API Keys

1. **Gemini API** (Required)
   - Get from: https://makersuite.google.com/app/apikey
   - Used for: AI summarization

2. **News API** (Optional)
   - Get from: https://newsapi.org/
   - Free tier: 100 requests/day
   - Used for: Career news articles

3. **Reddit API** (No key needed)
   - Public JSON endpoints
   - Rate limit: 60 requests/minute

---

## 📊 Data Structure

### Firestore Schema

```
/careerUpdates/{YYYY-MM-DD}/
  ├── summary (AI-generated)
  ├── news[] (articles)
  ├── reddit[] (posts)
  ├── timestamp
  ├── /jobs/{jobId}
  ├── /skills/{skillId}
  └── /certifications/{certId}
```

---

## 🧪 Testing

### Quick Test

```bash
# Start dev server
npm run dev

# Visit page
open http://localhost:3000/career-updates

# Click "Refresh Now"
```

### Test Cloud Function

```bash
# Trigger manual refresh
curl -X POST https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates

# Check logs
firebase functions:log --follow
```

### Verify Data

```bash
# Check Firestore
# Firebase Console > Firestore > careerUpdates > {today's date}
```

---

## 🐛 Troubleshooting

### No data appearing?

1. Check Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Manually trigger refresh:
   ```bash
   curl -X POST https://your-function-url/refreshCareerUpdates
   ```

3. Check authentication:
   - Make sure you're logged in
   - Check Firebase Console > Authentication

### Function deployment fails?

```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-authenticate
firebase login --reauth

# Try again
firebase deploy --only functions
```

### API rate limits?

- News API: 100 requests/day (free tier)
- Reddit API: 60 requests/minute
- Use scheduled function (every 12 hours) to stay within limits

---

## 📈 Performance

### Metrics
- ⚡ Page load: < 2 seconds
- ⚡ Data fetch: < 30 seconds
- ⚡ Real-time update: < 1 second
- ⚡ Bundle size: < 100KB

### Optimization
- Daily snapshots in Firestore
- Client-side caching
- Lazy loading
- Code splitting

---

## 🔐 Security

### Firestore Rules
- ✅ Authenticated read access
- ✅ System write access
- ✅ Subcollection permissions

### API Keys
- ✅ Stored in environment variables
- ✅ Not exposed in client code
- ✅ Not in Git repository

### CORS
- ✅ Cloud Function allows web access
- ✅ No CORS errors

---

## 🔮 Future Enhancements

### Planned Features

1. **Personalized Recommendations**
   - Filter by user skills/interests
   - AI-powered matching
   - Email notifications

2. **Historical Trends**
   - Track skill demand over time
   - Salary trend analysis
   - BigQuery integration

3. **More Data Sources**
   - LinkedIn Jobs API
   - Indeed API
   - GitHub Jobs
   - AngelList

4. **Advanced Analytics**
   - Looker Studio dashboards
   - Predictive insights
   - Market forecasting

5. **Push Notifications**
   - Firebase Cloud Messaging
   - Real-time job alerts
   - Skill trend notifications

---

## 📞 Support

### Documentation
- 📖 [Implementation Guide](CAREER-INTELLIGENCE-HUB.md)
- 🧪 [Testing Guide](TESTING-CAREER-INTELLIGENCE.md)
- ✅ [Deployment Checklist](DEPLOYMENT-CHECKLIST.md)
- 🚀 [Quick Start](QUICK-START-CAREER-INTELLIGENCE.md)

### Contact
- 📧 Email: balarajr483@gmail.com
- 🐙 GitHub: [@balaraj74](https://github.com/balaraj74)

---

## 🎓 Learn More

### Key Technologies
- **Google Cloud Functions** - Serverless backend
- **Gemini 2.5 Flash** - AI summarization
- **Firebase Firestore** - Real-time database
- **Next.js 15** - React framework
- **TypeScript** - Type safety

### Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)

---

## ✅ Status

- **Version**: 1.0.0
- **Status**: ✅ Production Ready
- **Last Updated**: January 2025
- **Maintained By**: Balaraj R (@balaraj74)

---

<div align="center">

**Built with ❤️ using Google Cloud Technologies**

![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75B2?style=flat-square&logo=google&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)

</div>

# 🚀 BigQuery Quick Start for CareerLens

This is a simplified, step-by-step guide to get BigQuery running in your CareerLens Resume Builder.

## ⚡ Quick Setup (5 Minutes)

### Step 1: Enable BigQuery in Your Firebase Project

```bash
# Set your project
gcloud config set project YOUR_FIREBASE_PROJECT_ID

# Enable BigQuery API
gcloud services enable bigquery.googleapis.com
```

### Step 2: Create Dataset and Tables

1. Go to [BigQuery Console](https://console.cloud.google.com/bigquery)
2. Select your Firebase project
3. Click **"Create Dataset"**
   - Dataset ID: `career_lens_data`
   - Location: `US`
   - Click **Create**

4. Copy and run the SQL from `src/lib/bigquery/schemas.sql`:
   - Click on your new dataset
   - Click **"+"** (Compose new query)
   - Paste the CREATE TABLE statements
   - Click **Run**

### Step 3: Add Environment Variables

Add to your `.env.local`:

```bash
GOOGLE_CLOUD_PROJECT_ID=your-firebase-project-id
BIGQUERY_DATASET=career_lens_data
```

### Step 4: Authenticate Locally

```bash
gcloud auth application-default login
```

### Step 5: Test It!

```bash
# Start your dev server
npm run dev

# Open http://localhost:3000/resume
# Go to "Optimize" or "Skills" tab
# Try the BigQuery-powered features!
```

## 🎯 Features You'll Get

1. **Skill Gap Analysis** - Compare your skills to market requirements
2. **Resume Optimizer** - Get ATS score and keyword suggestions  
3. **Career Insights** - View salary trends, job openings, and growth rates
4. **Smart Recommendations** - AI-powered career path suggestions

## 📝 Sample Data

The schema file includes sample data for:
- Full Stack Developer
- Data Scientist

You can test with these roles immediately!

## 🔧 Troubleshooting

**"No data returned"**
- Make sure you ran the INSERT statements from `schemas.sql`
- Check that your role name matches the sample data

**"Permission denied"**
- Run: `gcloud auth application-default login`
- Make sure BigQuery API is enabled

**"Failed to fetch"**
- Verify `.env.local` has correct project ID
- Restart your dev server after adding env vars

## 🎉 What's Next?

1. **Add more data**: Insert more job roles and industries
2. **Automate updates**: Set up periodic data refresh
3. **Customize queries**: Modify service.ts for your needs
4. **Monitor costs**: Set up BigQuery cost alerts

## 💡 Pro Tips

- Mock data fallback works automatically - no BigQuery needed for testing UI
- All queries use LIMIT to control costs
- Tables are partitioned and clustered for fast queries
- TypeScript types ensure safety

## 📚 Full Documentation

See `BIGQUERY_INTEGRATION_GUIDE.md` for complete details on:
- Architecture
- API endpoints
- Production deployment
- Advanced features

---

**Ready to build amazing resume intelligence! 🚀**

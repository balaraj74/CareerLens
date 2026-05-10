# 🚀 Google Cloud Platform Setup for BigQuery - Visual Guide

## 📋 What You Need to Do in GCP Console

Follow these exact steps to set up BigQuery for your CareerLens Resume Builder.

---

## ✅ Step 1: Access Google Cloud Console

1. **Open your browser** and go to: [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Sign in** with your Google account
3. **Select your Firebase project** from the project dropdown (top-left corner)
   - Look for the project you're using for CareerLens
   - It should be the same as your `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

---

## ✅ Step 2: Enable BigQuery API

### Option A: Using Navigation Menu
1. Click the **☰ hamburger menu** (top-left)
2. Scroll down to **"APIs & Services"** → Click **"Library"**
3. In the search box, type: **"BigQuery API"**
4. Click on **"BigQuery API"**
5. Click the blue **"ENABLE"** button
6. Wait a few seconds - you'll see "API enabled" ✓

### Option B: Direct Link
1. Go to: `https://console.cloud.google.com/apis/library/bigquery.googleapis.com`
2. Click **"ENABLE"**

---

## ✅ Step 3: Create BigQuery Dataset

1. **Navigate to BigQuery**:
   - Click ☰ menu → **"BigQuery"** (under "Analytics" section)
   - Or go directly to: `https://console.cloud.google.com/bigquery`

2. **Create Dataset**:
   - In the left sidebar (Explorer), find your project name
   - Click the **⋮ (three dots)** next to your project name
   - Select **"Create dataset"**

3. **Configure Dataset**:
   ```
   Dataset ID: career_lens_data
   Data location: US (United States)
   Default table expiration: Never
   Enable table expiration: OFF
   Encryption: Google-managed key
   ```

4. Click **"CREATE DATASET"**

---

## ✅ Step 4: Create Tables

Now you'll create 3 tables using SQL.

### 4.1 Open SQL Editor
1. In BigQuery console, click **"+ Compose new query"** (top-left, blue button)
2. This opens the SQL editor

### 4.2 Create Table 1: job_market_data

**Copy and paste this SQL**, then click **"RUN"**:

```sql
CREATE TABLE IF NOT EXISTS `career_lens_data.job_market_data` (
  job_id STRING NOT NULL,
  job_role STRING NOT NULL,
  industry STRING NOT NULL,
  required_skills ARRAY<STRING>,
  trending_skills ARRAY<STRING>,
  average_salary INT64,
  salary_min INT64,
  salary_max INT64,
  region STRING,
  experience_level STRING,
  demand_score FLOAT64,
  ats_keywords ARRAY<STRING>,
  job_description STRING,
  company_size STRING,
  remote_friendly BOOL,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY job_role, industry, region;
```

✅ You should see: **"This statement created a new table named job_market_data"**

### 4.3 Create Table 2: resume_keywords

**Copy and paste this SQL**, then click **"RUN"**:

```sql
CREATE TABLE IF NOT EXISTS `career_lens_data.resume_keywords` (
  keyword_id STRING NOT NULL,
  role STRING NOT NULL,
  industry STRING,
  high_impact_keywords ARRAY<STRING>,
  ats_keywords ARRAY<STRING>,
  soft_skills ARRAY<STRING>,
  technical_skills ARRAY<STRING>,
  action_verbs ARRAY<STRING>,
  certifications ARRAY<STRING>,
  keyword_weight FLOAT64,
  effectiveness_score FLOAT64,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY role, industry;
```

✅ You should see: **"This statement created a new table named resume_keywords"**

### 4.4 Create Table 3: career_insights

**Copy and paste this SQL**, then click **"RUN"**:

```sql
CREATE TABLE IF NOT EXISTS `career_lens_data.career_insights` (
  insight_id STRING NOT NULL,
  domain STRING NOT NULL,
  future_opportunities ARRAY<STRING>,
  certifications ARRAY<STRING>,
  demand_score FLOAT64,
  growth_rate FLOAT64,
  avg_career_progression_years INT64,
  top_companies ARRAY<STRING>,
  emerging_technologies ARRAY<STRING>,
  skill_gap_analysis STRING,
  salary_growth_potential FLOAT64,
  job_openings_count INT64,
  geographic_hotspots ARRAY<STRING>,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY domain;
```

✅ You should see: **"This statement created a new table named career_insights"**

---

## ✅ Step 5: Insert Sample Data

Now add test data so you can try the features immediately!

### 5.1 Insert Job Market Data

**Copy, paste, and RUN**:

```sql
INSERT INTO `career_lens_data.job_market_data` 
(job_id, job_role, industry, required_skills, trending_skills, average_salary, salary_min, salary_max, 
 region, experience_level, demand_score, ats_keywords, job_description, company_size, remote_friendly, updated_at)
VALUES 
(
  'job_001',
  'Full Stack Developer',
  'Technology',
  ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
  ['Next.js', 'GraphQL', 'Docker', 'Kubernetes', 'AI/ML Integration'],
  120000,
  90000,
  150000,
  'United States',
  'Mid-Level',
  8.5,
  ['React', 'Node.js', 'TypeScript', 'AWS', 'CI/CD', 'Agile'],
  'Seeking a Full Stack Developer proficient in modern web technologies...',
  'Enterprise',
  true,
  CURRENT_TIMESTAMP()
),
(
  'job_002',
  'Data Scientist',
  'Technology',
  ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
  ['LLMs', 'Generative AI', 'MLOps', 'RAG', 'Vector Databases'],
  135000,
  100000,
  170000,
  'United States',
  'Senior',
  9.2,
  ['Python', 'ML', 'AI', 'Deep Learning', 'PyTorch', 'Data Analysis'],
  'Looking for experienced Data Scientist to lead AI initiatives...',
  'Enterprise',
  true,
  CURRENT_TIMESTAMP()
);
```

✅ You should see: **"This statement inserted 2 rows"**

### 5.2 Insert Resume Keywords

**Copy, paste, and RUN**:

```sql
INSERT INTO `career_lens_data.resume_keywords`
(keyword_id, role, industry, high_impact_keywords, ats_keywords, soft_skills, 
 technical_skills, action_verbs, certifications, keyword_weight, effectiveness_score, updated_at)
VALUES
(
  'kw_001',
  'Full Stack Developer',
  'Technology',
  ['Full Stack Development', 'Cloud Architecture', 'Microservices', 'CI/CD Pipeline', 'System Design'],
  ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'PostgreSQL', 'Docker'],
  ['Problem Solving', 'Team Collaboration', 'Communication', 'Agile Methodology'],
  ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'GraphQL', 'REST API'],
  ['Developed', 'Architected', 'Implemented', 'Optimized', 'Deployed', 'Led'],
  ['AWS Certified Developer', 'Azure Fundamentals', 'MongoDB Certified'],
  0.95,
  9.1,
  CURRENT_TIMESTAMP()
),
(
  'kw_002',
  'Data Scientist',
  'Technology',
  ['Machine Learning', 'Predictive Modeling', 'Statistical Analysis', 'AI Solutions', 'Data Pipeline'],
  ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'SQL'],
  ['Analytical Thinking', 'Communication', 'Business Acumen', 'Research'],
  ['Python', 'R', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
  ['Analyzed', 'Modeled', 'Predicted', 'Researched', 'Implemented', 'Deployed'],
  ['TensorFlow Developer', 'AWS ML Specialty', 'Google Cloud ML Engineer'],
  0.98,
  9.5,
  CURRENT_TIMESTAMP()
);
```

✅ You should see: **"This statement inserted 2 rows"**

### 5.3 Insert Career Insights

**Copy, paste, and RUN**:

```sql
INSERT INTO `career_lens_data.career_insights`
(insight_id, domain, future_opportunities, certifications, demand_score, growth_rate,
 avg_career_progression_years, top_companies, emerging_technologies, skill_gap_analysis,
 salary_growth_potential, job_openings_count, geographic_hotspots, updated_at)
VALUES
(
  'ins_001',
  'Full Stack Development',
  ['Cloud Architect', 'Engineering Manager', 'Technical Lead', 'DevOps Engineer'],
  ['AWS Solutions Architect', 'Kubernetes Administrator', 'Google Cloud Professional'],
  8.7,
  15.5,
  3,
  ['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix'],
  ['AI Integration', 'Edge Computing', 'WebAssembly', 'Serverless', 'Web3'],
  'High demand for Next.js and TypeScript. Growing need for AI/ML integration skills.',
  25.5,
  45000,
  ['San Francisco', 'Seattle', 'New York', 'Austin', 'Remote'],
  CURRENT_TIMESTAMP()
),
(
  'ins_002',
  'Data Science',
  ['ML Engineer', 'AI Research Scientist', 'Data Engineering Lead', 'AI Product Manager'],
  ['TensorFlow Developer', 'AWS ML Specialty', 'Deep Learning Specialization'],
  9.4,
  22.3,
  2,
  ['OpenAI', 'Google DeepMind', 'Meta AI', 'Amazon AWS', 'Nvidia'],
  ['Generative AI', 'LLM Fine-tuning', 'RAG Systems', 'MLOps', 'Quantum ML'],
  'Critical need for LLM and Generative AI expertise. MLOps becoming essential.',
  32.8,
  52000,
  ['San Francisco', 'New York', 'Boston', 'Seattle', 'Remote'],
  CURRENT_TIMESTAMP()
);
```

✅ You should see: **"This statement inserted 2 rows"**

---

## ✅ Step 6: Verify Tables Created

1. In the BigQuery Explorer (left sidebar):
   - Expand your project
   - Expand `career_lens_data` dataset
   - You should see 3 tables:
     - ✅ `job_market_data`
     - ✅ `resume_keywords`
     - ✅ `career_insights`

2. Click on each table to verify data:
   - Click table name
   - Click **"Preview"** tab
   - You should see 2 rows in each table

---

## ✅ Step 7: Set Up Local Authentication

### Option A: Cloud Shell (Easiest)
1. In GCP Console, click the **Terminal icon** (top-right, looks like `>_`)
2. This opens Cloud Shell at the bottom
3. Run:
   ```bash
   gcloud auth application-default login
   ```
4. Follow the authentication flow

### Option B: Local Terminal (Recommended for Development)

**Install Google Cloud SDK** (if not installed):
```bash
# For Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# For macOS
brew install --cask google-cloud-sdk

# For Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

**Authenticate**:
```bash
# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project YOUR-FIREBASE-PROJECT-ID

# Set up application default credentials
gcloud auth application-default login
```

---

## ✅ Step 8: Update Your .env.local File

Add these lines to `/home/balaraj/CareerLens/.env.local`:

```bash
# BigQuery Configuration
GOOGLE_CLOUD_PROJECT_ID=your-firebase-project-id
BIGQUERY_DATASET=career_lens_data
```

**Replace `your-firebase-project-id`** with your actual Firebase project ID.

---

## ✅ Step 9: Test It Works!

1. **Open terminal** in your CareerLens directory

2. **Make sure dev server is running**:
   ```bash
   npm run dev
   ```

3. **Open browser** to: `http://localhost:3000/resume`

4. **Test the new features**:
   - Click **"Optimize"** tab
   - Click **"Skills"** tab
   - Click **"Insights"** tab

5. **Try Skill Gap Analysis**:
   - Enter role: "Full Stack Developer"
   - Add skills like: "JavaScript", "React"
   - Click "Analyze Skill Gap"
   - You should see results! 🎉

6. **Try Resume Optimizer**:
   - Enter role: "Data Scientist"
   - Paste some resume text
   - Click "Optimize My Resume"
   - You should see ATS score! 🎉

---

## 🎯 Visual Checklist

Use this to track your progress:

- [ ] Opened Google Cloud Console
- [ ] Selected correct Firebase project
- [ ] Enabled BigQuery API
- [ ] Created dataset: `career_lens_data`
- [ ] Created table: `job_market_data`
- [ ] Created table: `resume_keywords`
- [ ] Created table: `career_insights`
- [ ] Inserted sample data (2 rows each)
- [ ] Verified tables in Explorer
- [ ] Authenticated with gcloud
- [ ] Updated .env.local
- [ ] Tested in browser (works!)

---

## 🔍 How to Find Your Project ID

Not sure what your project ID is?

1. **In GCP Console**: Look at the top bar, next to "Google Cloud"
2. **In Firebase Console**: Go to Project Settings → General
3. **In your code**: Check `.env.local` for `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

---

## 🆘 Troubleshooting

### "Permission denied" or "Access denied"
**Solution**: Make sure you're logged in to the correct Google account that owns the Firebase project.

### "Dataset not found"
**Solution**: Check spelling - it must be exactly `career_lens_data`

### "Table already exists"
**Solution**: That's OK! Skip to the INSERT statements to add data.

### "Cannot find module @google-cloud/bigquery"
**Solution**: 
```bash
npm install @google-cloud/bigquery
```

### BigQuery features show "No data"
**Solution**: 
1. Check `.env.local` has correct project ID
2. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again
3. Make sure you inserted sample data

---

## 💰 Cost Information

**Good News**: BigQuery has a generous free tier!

- **Free Monthly**: 1 TB of query processing
- **Free Storage**: 10 GB
- **Your usage**: Will be well within free tier for testing

The sample data is tiny (<1 MB), so costs will be $0 for development.

---

## ✅ Summary: What We Did

1. ✅ Enabled BigQuery API in your GCP project
2. ✅ Created `career_lens_data` dataset
3. ✅ Created 3 tables (job_market_data, resume_keywords, career_insights)
4. ✅ Inserted sample data for testing
5. ✅ Set up authentication
6. ✅ Configured environment variables

---

## 🎉 Next Steps

Now that BigQuery is set up:

1. **Test all features** in the Resume Hub (`/resume`)
2. **Add more data** - Insert more job roles and industries
3. **Customize** - Modify queries in `src/lib/bigquery/service.ts`
4. **Deploy** - Push to production when ready!

---

## 📚 Need More Help?

Check these docs:
- **BIGQUERY_QUICKSTART.md** - Quick reference
- **BIGQUERY_INTEGRATION_GUIDE.md** - Detailed technical guide
- **BIGQUERY_QUICK_REFERENCE.md** - API reference

---

**You're all set! BigQuery is now powering your Resume Builder! 🚀**

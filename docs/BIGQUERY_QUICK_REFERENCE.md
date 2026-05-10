# 📋 BigQuery Quick Reference Card

## 🔌 API Endpoints

### GET Endpoints
```bash
# Get skills for a role
GET /api/bigquery/skills?role=Full Stack Developer&industry=Technology

# Get trending skills
GET /api/bigquery/trending-skills?industry=Technology&limit=10

# Get resume keywords
GET /api/bigquery/resume-keywords?role=Data Scientist&industry=Technology

# Get career insights
GET /api/bigquery/career-insights?domain=Data Science

# Get salary range
GET /api/bigquery/salary-range?role=Full Stack Developer&region=United States
```

### POST Endpoints
```bash
# Skill gap analysis
POST /api/bigquery/skill-gap-analysis
{
  "targetRole": "Full Stack Developer",
  "currentSkills": ["JavaScript", "React", "CSS"],
  "industry": "Technology"
}

# Resume optimization
POST /api/bigquery/resume-optimization
{
  "role": "Full Stack Developer",
  "resumeText": "Your resume text here...",
  "industry": "Technology"
}
```

## 🎨 UI Components Usage

### Skill Gap Analysis
```tsx
import { SkillGapAnalysis } from '@/components/resume/skill-gap-analysis';

<SkillGapAnalysis 
  targetRole="Full Stack Developer"
  currentSkills={["JavaScript", "React"]}
  industry="Technology"
  onAnalyze={(data) => console.log(data)}
/>
```

### Resume Optimizer
```tsx
import { ResumeOptimizer } from '@/components/resume/resume-optimizer';

<ResumeOptimizer 
  initialRole="Data Scientist"
  initialResume="Your resume text..."
  onOptimize={(data) => console.log(data)}
/>
```

### Career Insights
```tsx
import { CareerInsightsDashboard } from '@/components/resume/career-insights-dashboard';

<CareerInsightsDashboard domain="Full Stack Development" />
```

## 🔧 Service Layer Functions

```typescript
import {
  getSkillsForRole,
  getTrendingSkills,
  getResumeKeywords,
  getCareerInsights,
  analyzeSkillGap,
  getResumeOptimization,
  getSalaryRange,
} from '@/lib/bigquery/service';

// Skill analysis
const skills = await getSkillsForRole('Full Stack Developer', 'Technology');
const trending = await getTrendingSkills('Technology', 10);

// Resume optimization
const keywords = await getResumeKeywords('Data Scientist', 'Technology');
const optimization = await getResumeOptimization('Software Engineer', resumeText);

// Career planning
const insights = await getCareerInsights('Data Science');
const salary = await getSalaryRange('Full Stack Developer', 'United States');

// Skill gap
const analysis = await analyzeSkillGap(
  'Full Stack Developer', 
  ['JavaScript', 'React'],
  'Technology'
);
```

## 🗄️ BigQuery Tables

### job_market_data
```sql
SELECT job_role, required_skills, trending_skills, average_salary
FROM career_lens_data.job_market_data
WHERE job_role = 'Full Stack Developer'
ORDER BY demand_score DESC;
```

### resume_keywords
```sql
SELECT high_impact_keywords, ats_keywords, action_verbs
FROM career_lens_data.resume_keywords
WHERE role = 'Data Scientist';
```

### career_insights
```sql
SELECT future_opportunities, certifications, demand_score
FROM career_lens_data.career_insights
WHERE domain = 'Data Science';
```

## 🌍 Environment Variables

```bash
# Required
GOOGLE_CLOUD_PROJECT_ID=your-project-id
BIGQUERY_DATASET=career_lens_data

# Optional (for production)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## 🚀 Common Commands

```bash
# Setup
./scripts/setup-bigquery.sh

# Authenticate locally
gcloud auth application-default login

# Create dataset
bq mk --dataset --location=US project-id:career_lens_data

# Run schema
bq query --use_legacy_sql=false < src/lib/bigquery/schemas.sql

# Test API
curl http://localhost:3000/api/bigquery/skills?role=Developer

# Type check
npm run typecheck

# Dev server
npm run dev
```

## 📊 Response Types

```typescript
// Skill Gap Analysis
interface SkillGapAnalysis {
  role: string;
  requiredSkills: string[];
  trendingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;  // 0-100
  recommendations: string[];
}

// Resume Optimization
interface ResumeOptimization {
  atsScore: number;  // 0-100
  missingKeywords: string[];
  suggestedKeywords: string[];
  actionVerbs: string[];
  improvementAreas: string[];
  strengths: string[];
}

// Career Insights
interface CareerInsights {
  demand_score: number;  // 0-10
  growth_rate: number;  // percentage
  salary_growth_potential: number;
  job_openings_count: number;
  future_opportunities: string[];
  certifications: string[];
  top_companies: string[];
  emerging_technologies: string[];
  geographic_hotspots: string[];
}
```

## 🎯 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Permission denied" | Run `gcloud auth application-default login` |
| "No data returned" | Insert sample data from schemas.sql |
| "BigQuery not configured" | Add env vars to .env.local |
| "Module not found" | Restart dev server after code changes |

## 📁 File Structure

```
src/
├── lib/bigquery/
│   ├── config.ts          # Client config
│   ├── service.ts         # Query functions
│   └── schemas.sql        # Database schema
├── app/api/bigquery/
│   ├── skills/route.ts
│   ├── trending-skills/route.ts
│   ├── resume-keywords/route.ts
│   ├── career-insights/route.ts
│   ├── skill-gap-analysis/route.ts
│   ├── resume-optimization/route.ts
│   └── salary-range/route.ts
└── components/resume/
    ├── skill-gap-analysis.tsx
    ├── resume-optimizer.tsx
    └── career-insights-dashboard.tsx
```

## 🔗 Quick Links

- [BigQuery Console](https://console.cloud.google.com/bigquery)
- [Quick Start Guide](./BIGQUERY_QUICKSTART.md)
- [Full Documentation](./BIGQUERY_INTEGRATION_GUIDE.md)
- [Features List](./BIGQUERY_FEATURES.md)

---

**Keep this card handy for quick reference! 📌**

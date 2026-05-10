'use server';
/**
 * Enhanced Resume Optimizer Flow
 * Pure AI-driven — no BigQuery dependency
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for Gemini AI response
const ResumeOptimizationSchema = z.object({
    atsScore: z.number().min(0).max(100).describe('ATS compatibility score'),
    overallQuality: z.number().min(0).max(100).describe('Overall resume quality'),

    keywordAnalysis: z.object({
        missingCriticalKeywords: z.array(z.string()).describe('Essential keywords missing from resume'),
        missingTrendingKeywords: z.array(z.string()).describe('Trending skills/keywords to add'),
        presentKeywords: z.array(z.string()).describe('Strong keywords already present'),
        keywordDensity: z.number().describe('Keyword density score 0-100'),
    }),

    actionVerbAnalysis: z.object({
        strongVerbsUsed: z.array(z.string()).describe('Effective action verbs found'),
        weakVerbsToReplace: z.array(z.object({
            weak: z.string(),
            suggested: z.string(),
        })).describe('Weak verbs to replace with stronger alternatives'),
        suggestedVerbs: z.array(z.string()).describe('Additional power verbs to consider'),
    }),

    improvementAreas: z.array(z.object({
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        category: z.enum(['ats', 'keywords', 'impact', 'formatting', 'content']),
        issue: z.string(),
        recommendation: z.string(),
        example: z.string().optional(),
    })).describe('Prioritized improvement suggestions'),

    strengths: z.array(z.string()).describe('What the resume does well'),

    skillGapInsights: z.object({
        hasAllRequiredSkills: z.boolean(),
        missingRequiredSkills: z.array(z.string()),
        hasModernSkills: z.boolean(),
        skillMatchPercentage: z.number(),
    }),

    sectionFeedback: z.array(z.object({
        section: z.string(),
        score: z.number().min(0).max(10),
        feedback: z.string(),
        improvements: z.array(z.string()),
    })),

    quickWins: z.array(z.string()).describe('Easy improvements with high impact'),
});

export type ResumeOptimizationResult = z.infer<typeof ResumeOptimizationSchema>;

/**
 * Optimize resume with Gemini AI (pure AI — no BigQuery)
 */
export async function optimizeResumeWithAI(
    resumeText: string,
    targetRole: string,
    industry: string = 'Technology'
): Promise<ResumeOptimizationResult> {
    console.log(`📝 [ResumeOptimizer] Starting AI analysis for role: "${targetRole}"`);

    try {
        const prompt = `You are an elite resume optimization AI and ATS expert with deep knowledge of what "${targetRole}" job postings require in ${new Date().getFullYear()}.

**Target Role:** ${targetRole}
**Industry:** ${industry}

**RESUME TO OPTIMIZE:**

${resumeText}

---

**YOUR TASK:**

Analyze this resume SPECIFICALLY for "${targetRole}" positions and provide:

### 1. ATS Score (0-100)
- Does the resume contain keywords that ATS systems look for in "${targetRole}" roles?
- Is the formatting ATS-compatible? (standard section headers, no tables/graphics)
- Are critical "${targetRole}" keywords present?
- Contact info visible?

### 2. Keyword Analysis
- Which CRITICAL keywords for "${targetRole}" are MISSING from this resume?
  (e.g., for Data Scientist: Python, SQL, ML, TensorFlow, statistics)
  (e.g., for DevOps: Docker, Kubernetes, CI/CD, Terraform, AWS)
- Which TRENDING keywords for "${targetRole}" should be added?
- Which relevant keywords are already PRESENT?
- Keyword density score (0-100)

### 3. Action Verb Analysis
- Identify strong action verbs already used
- Find weak verbs to replace (e.g., "worked on" → "engineered", "responsible for" → "led")
- Suggest power verbs specific to "${targetRole}" roles

### 4. Improvement Areas (prioritized)
- CRITICAL: ATS blockers, missing must-have skills for "${targetRole}"
- HIGH: Skill gaps, weak bullet points, missing quantified impact
- MEDIUM: Keyword optimization, formatting improvements
- LOW: Polish, minor enhancements

### 5. Strengths
What does this resume do well for a "${targetRole}" application?

### 6. Skill Gap Insights
- Does resume mention all required skills for "${targetRole}"?
- Are modern/trending skills present?
- Calculate skill match percentage

### 7. Section-by-Section Feedback
Rate each resume section 0-10 and provide specific improvements.

### 8. Quick Wins (5-7)
Easy changes with HIGH impact — simple keyword additions, verb replacements, format tweaks.

**CRITICAL RULES:**
- ALL analysis must be specific to "${targetRole}" — not generic advice
- Be SPECIFIC with examples from the actual resume text
- For a Data Scientist resume, check for Python/ML/stats — NOT React/Node.js
- For a DevOps resume, check for Docker/K8s/Terraform — NOT Figma/design
- Prioritize changes by impact on getting interviews`;

        const response = await ai.generate({
            model: 'vertexai/gemini-2.5-flash',
            prompt,
            output: {
                schema: ResumeOptimizationSchema,
            },
            config: {
                temperature: 0.3,
                maxOutputTokens: 8192,
            },
        });

        if (!response.output) {
            throw new Error('AI returned empty output for resume optimization');
        }

        console.log(`✅ [ResumeOptimizer] Analysis complete. ATS Score: ${response.output.atsScore}`);
        return response.output;

    } catch (error) {
        console.error('❌ [ResumeOptimizer] Error:', error);
        throw new Error(
            `Resume optimization failed for role "${targetRole}": ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

/**
 * Quick keyword check (lightweight, no full AI call)
 */
export async function quickKeywordCheck(
    resumeText: string,
    targetRole: string,
    _industry: string = 'Technology'
): Promise<{
    atsScore: number;
    missingKeywords: string[];
    presentKeywords: string[];
}> {
    // Well-known ATS keywords per role
    const ROLE_KEYWORDS: Record<string, string[]> = {
        'data scientist': ['python', 'sql', 'machine learning', 'tensorflow', 'pandas', 'numpy', 'statistics', 'deep learning', 'nlp', 'scikit-learn', 'jupyter', 'data visualization', 'r', 'pytorch'],
        'data analyst': ['sql', 'python', 'excel', 'tableau', 'power bi', 'statistics', 'data visualization', 'etl', 'reporting', 'dashboard'],
        'data engineer': ['python', 'sql', 'spark', 'airflow', 'kafka', 'aws', 'etl', 'data pipeline', 'hadoop', 'docker', 'data modeling', 'dbt'],
        'frontend': ['javascript', 'react', 'typescript', 'html', 'css', 'next.js', 'responsive design', 'webpack', 'git', 'tailwind', 'testing'],
        'backend': ['python', 'java', 'node.js', 'sql', 'rest api', 'docker', 'microservices', 'postgresql', 'mongodb', 'redis', 'git'],
        'full stack': ['javascript', 'react', 'node.js', 'typescript', 'sql', 'html', 'css', 'python', 'docker', 'git', 'rest api'],
        'devops': ['docker', 'kubernetes', 'ci/cd', 'terraform', 'aws', 'linux', 'ansible', 'jenkins', 'monitoring', 'git', 'bash'],
        'cloud': ['aws', 'azure', 'gcp', 'terraform', 'kubernetes', 'docker', 'networking', 'iam', 'serverless', 'ci/cd'],
        'cybersecurity': ['siem', 'penetration testing', 'network security', 'linux', 'python', 'firewalls', 'incident response', 'vulnerability', 'compliance'],
        'mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'typescript', 'firebase', 'rest api'],
        'product manager': ['agile', 'scrum', 'jira', 'roadmap', 'user research', 'a/b testing', 'stakeholder', 'analytics', 'requirements'],
        'ui/ux': ['figma', 'sketch', 'user research', 'prototyping', 'wireframing', 'usability testing', 'design systems', 'accessibility'],
    };

    const roleLower = targetRole.toLowerCase();
    let keywords: string[] = [];

    for (const [roleKey, skills] of Object.entries(ROLE_KEYWORDS)) {
        if (roleLower.includes(roleKey) || roleKey.includes(roleLower)) {
            keywords = skills;
            break;
        }
    }

    if (keywords.length === 0) {
        keywords = ['communication', 'leadership', 'teamwork', 'problem solving', 'analytical'];
    }

    const normalizedResume = resumeText.toLowerCase();
    const present: string[] = [];
    const missing: string[] = [];

    keywords.forEach(keyword => {
        if (normalizedResume.includes(keyword.toLowerCase())) {
            present.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const atsScore = keywords.length > 0
        ? Math.round((present.length / keywords.length) * 100)
        : 0;

    return { atsScore, missingKeywords: missing, presentKeywords: present };
}

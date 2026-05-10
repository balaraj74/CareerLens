'use server';
/**
 * Gemini AI-Powered Skill Gap Analysis
 * Pure AI-driven — no BigQuery dependency
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for Gemini AI response
const SkillGapAnalysisSchema = z.object({
    matchPercentage: z.number().min(0).max(100).describe('Overall skill match percentage'),
    skillAlignment: z.enum(['excellent', 'good', 'fair', 'poor']).describe('Overall alignment level'),

    skillBreakdown: z.object({
        matchedSkills: z.array(z.object({
            skill: z.string(),
            proficiencyLevel: z.enum(['expert', 'advanced', 'intermediate', 'beginner']),
            marketDemand: z.enum(['critical', 'high', 'medium', 'low']),
        })).describe('Skills you have that match the role'),

        missingCriticalSkills: z.array(z.object({
            skill: z.string(),
            importance: z.enum(['must-have', 'highly-recommended', 'nice-to-have']),
            learnability: z.enum(['easy', 'moderate', 'challenging']),
            timeToLearn: z.string().describe('Estimated time to learn, e.g., "2-3 months"'),
        })).describe('Critical skills you need to acquire'),

        emergingSkills: z.array(z.object({
            skill: z.string(),
            trendScore: z.number().describe('How trending this skill is, 0-10'),
            futureValue: z.enum(['very-high', 'high', 'medium', 'low']),
        })).describe('Trending skills that will increase your market value'),
    }),

    recommendations: z.array(z.object({
        priority: z.enum(['immediate', 'short-term', 'long-term']),
        category: z.enum(['technical', 'soft-skills', 'tools', 'certifications']),
        action: z.string(),
        rationale: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
    })).describe('Prioritized recommendations'),

    careerInsights: z.object({
        readinessLevel: z.enum(['ready', 'almost-ready', 'needs-preparation', 'significant-gap']),
        estimatedTimeToReady: z.string().describe('Time needed to be job-ready'),
        strengthAreas: z.array(z.string()),
        weaknessAreas: z.array(z.string()),
        competitiveAdvantages: z.array(z.string()),
    }),

    learningPath: z.array(z.object({
        phase: z.string(),
        duration: z.string(),
        skills: z.array(z.string()),
        resources: z.array(z.string()),
    })).describe('Suggested learning path to bridge the gap'),

    marketContext: z.object({
        demandLevel: z.enum(['very-high', 'high', 'moderate', 'low']),
        competitionLevel: z.enum(['very-competitive', 'competitive', 'moderate', 'low']),
        salaryOutlook: z.string(),
        jobOpenings: z.string(),
    }),
});

export type SkillGapAnalysisResult = z.infer<typeof SkillGapAnalysisSchema>;

/**
 * Analyze skill gap using Gemini AI (pure AI — no BigQuery)
 */
export async function analyzeSkillGapWithAI(
    targetRole: string,
    currentSkills: string[],
    industry: string = 'Technology'
): Promise<SkillGapAnalysisResult> {
    console.log(`🧠 [SkillGap] Starting PURE AI analysis for: "${targetRole}"`);
    console.log(`🧠 [SkillGap] User skills: [${currentSkills.join(', ')}]`);
    console.log(`🧠 [SkillGap] Industry: ${industry}`);

    const prompt = `You are a world-class career advisor and skill gap analyst with deep knowledge of the global job market in ${new Date().getFullYear()}.

IMPORTANT: You must analyze SPECIFICALLY for the "${targetRole}" role. Do NOT default to generic web development advice.

---

**TARGET ROLE:** ${targetRole}
**INDUSTRY:** ${industry}

**CANDIDATE'S CURRENT SKILLS:**
${currentSkills.map(s => `- ${s}`).join('\n')}

---

**YOUR TASK — Skill Gap Analysis for "${targetRole}":**

You MUST base your entire analysis on what the "${targetRole}" role ACTUALLY requires in the real job market. Think about:
- What do ${targetRole} job postings on LinkedIn, Indeed, Glassdoor typically require?
- What technical stack and tools does a ${targetRole} use daily?
- What certifications are valued for a ${targetRole}?
- What are the trending skills in this domain right now?

### 1. Match Percentage (0-100%)
Compare the candidate's skills listed above against what a "${targetRole}" actually needs.
- If they listed Python and the role needs Python → that's a match
- If they listed JavaScript but the role needs TensorFlow → that is NOT a match
- Be realistic. Don't inflate.

### 2. Matched Skills
Which of the candidate's skills directly apply to the "${targetRole}" role?
Only list skills from their list above that are genuinely relevant to "${targetRole}".

### 3. Missing Critical Skills
What MUST-HAVE skills for "${targetRole}" does the candidate NOT have?
Be specific to the role:
- For "Data Scientist" → Python, SQL, ML frameworks, statistics, etc.
- For "DevOps Engineer" → Docker, Kubernetes, CI/CD, Terraform, etc.
- For "UI/UX Designer" → Figma, user research, prototyping, etc.
- For "Cybersecurity Analyst" → SIEM, penetration testing, network security, etc.
Do NOT list React/Node.js unless "${targetRole}" actually requires them.

### 4. Emerging/Trending Skills
What are the hottest emerging skills in the "${targetRole}" domain right now?

### 5. Recommendations (5-8)
Prioritized, actionable steps. Each must be specific to "${targetRole}".

### 6. Career Insights
Readiness assessment, time to job-ready, strengths, weaknesses, competitive advantages.

### 7. Learning Path (3 phases)
Phase 1: Foundation → Phase 2: Advancement → Phase 3: Specialization
Each phase should list specific skills and learning resources relevant to "${targetRole}".

### 8. Market Context
Current demand, competition level, salary range, and approximate job openings for "${targetRole}" in ${industry}.

---

CRITICAL RULES:
1. EVERY skill, recommendation, and insight MUST be specific to "${targetRole}" — NOT generic web development
2. If the candidate's skills are mostly unrelated to "${targetRole}", the match percentage should be LOW (under 30%)
3. Missing skills should be what "${targetRole}" job postings actually list as requirements
4. Be honest, specific, and actionable
`;

    try {
        const response = await ai.generate({
            model: 'vertexai/gemini-2.5-flash',
            prompt,
            output: {
                schema: SkillGapAnalysisSchema,
            },
            config: {
                temperature: 0.4,
                maxOutputTokens: 8192,
            },
        });

        if (!response.output) {
            throw new Error('AI returned empty output — no skill gap analysis generated');
        }

        console.log(`✅ [SkillGap] Analysis complete for "${targetRole}" → Match: ${response.output.matchPercentage}%`);
        console.log(`✅ [SkillGap] Alignment: ${response.output.skillAlignment}`);
        console.log(`✅ [SkillGap] Matched: ${response.output.skillBreakdown.matchedSkills.length}, Missing: ${response.output.skillBreakdown.missingCriticalSkills.length}`);

        return response.output;
    } catch (error) {
        console.error(`❌ [SkillGap] Analysis failed for "${targetRole}":`, error);
        throw new Error(
            `Skill gap analysis failed for role "${targetRole}": ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

/**
 * Quick skill match check (lightweight, no AI call)
 * Uses simple string matching for fast results
 */
export async function quickSkillMatch(
    targetRole: string,
    currentSkills: string[],
    _industry: string = 'Technology'
): Promise<{
    matchPercentage: number;
    matchedCount: number;
    missingCount: number;
}> {
    // Well-known skill requirements per role domain
    const ROLE_SKILL_MAP: Record<string, string[]> = {
        'data scientist': ['python', 'sql', 'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'statistics', 'r', 'deep learning', 'scikit-learn', 'data visualization', 'jupyter', 'nlp'],
        'data analyst': ['sql', 'python', 'excel', 'tableau', 'power bi', 'statistics', 'data visualization', 'r', 'pandas', 'etl'],
        'data engineer': ['python', 'sql', 'spark', 'airflow', 'kafka', 'aws', 'gcp', 'etl', 'hadoop', 'docker', 'data modeling'],
        'frontend': ['javascript', 'react', 'typescript', 'html', 'css', 'next.js', 'tailwind', 'vue', 'angular', 'webpack', 'git'],
        'backend': ['python', 'java', 'node.js', 'sql', 'rest api', 'docker', 'microservices', 'postgresql', 'mongodb', 'redis', 'git'],
        'full stack': ['javascript', 'react', 'node.js', 'typescript', 'sql', 'html', 'css', 'python', 'docker', 'git', 'rest api', 'mongodb'],
        'devops': ['docker', 'kubernetes', 'ci/cd', 'terraform', 'aws', 'linux', 'ansible', 'jenkins', 'monitoring', 'git', 'python', 'bash'],
        'cloud': ['aws', 'azure', 'gcp', 'terraform', 'kubernetes', 'docker', 'networking', 'iam', 'serverless', 'ci/cd', 'linux'],
        'cybersecurity': ['network security', 'siem', 'penetration testing', 'linux', 'python', 'firewalls', 'incident response', 'cryptography', 'vulnerability assessment', 'compliance'],
        'machine learning': ['python', 'tensorflow', 'pytorch', 'deep learning', 'nlp', 'computer vision', 'statistics', 'sql', 'mlops', 'scikit-learn'],
        'mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'typescript', 'firebase', 'rest api', 'git'],
        'product manager': ['agile', 'scrum', 'jira', 'data analysis', 'user research', 'roadmapping', 'a/b testing', 'sql', 'stakeholder management', 'wireframing'],
        'ui/ux': ['figma', 'sketch', 'user research', 'prototyping', 'wireframing', 'usability testing', 'design systems', 'adobe xd', 'html', 'css', 'accessibility'],
    };

    const roleLower = targetRole.toLowerCase();
    let requiredSkills: string[] = [];

    // Find best matching role
    for (const [roleKey, skills] of Object.entries(ROLE_SKILL_MAP)) {
        if (roleLower.includes(roleKey) || roleKey.includes(roleLower)) {
            requiredSkills = skills;
            break;
        }
    }

    // Default fallback for unknown roles
    if (requiredSkills.length === 0) {
        requiredSkills = ['communication', 'problem solving', 'teamwork', 'technical skills', 'analytical thinking'];
    }

    const normalizedCurrent = currentSkills.map(s => s.toLowerCase().trim());

    const matchedCount = normalizedCurrent.filter(skill =>
        requiredSkills.some(req =>
            req.includes(skill) || skill.includes(req)
        )
    ).length;

    const matchPercentage = requiredSkills.length > 0
        ? Math.round((matchedCount / requiredSkills.length) * 100)
        : 0;

    return {
        matchPercentage: Math.min(matchPercentage, 100),
        matchedCount,
        missingCount: Math.max(requiredSkills.length - matchedCount, 0),
    };
}

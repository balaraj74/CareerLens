/**
 * Gemini AI Career Insights Analyzer
 * Pure AI-driven — no BigQuery dependency
 * 
 * Provides real-time, AI-powered career intelligence including:
 * - Market demand analysis
 * - Career progression paths
 * - Emerging technologies
 * - Salary trends
 * - Geographic opportunities
 * - Industry certifications
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ================================
// Response Schema Definition
// ================================

const careerInsightSchema = z.object({
    // Core Metrics
    demand_score: z.number().min(0).max(10).describe('Market demand score (0-10)'),
    growth_rate: z.number().describe('Projected annual growth rate percentage'),
    salary_growth_potential: z.number().describe('Salary growth potential percentage over 3-5 years'),
    job_openings_count: z.number().int().min(0).describe('Estimated current job openings'),
    avg_career_progression_years: z.number().min(0).describe('Average years to next career level'),

    // Career Opportunities
    future_opportunities: z.array(z.string()).min(3).max(6).describe('Future career paths and roles'),

    // Skills & Learning
    certifications: z.array(z.string()).min(3).max(8).describe('Recommended certifications'),
    emerging_technologies: z.array(z.string()).min(3).max(10).describe('Trending technologies to learn'),

    // Companies & Locations
    top_companies: z.array(z.string()).min(4).max(8).describe('Top hiring companies'),
    geographic_hotspots: z.array(z.string()).min(3).max(8).describe('Best locations for opportunities'),

    // Analysis & Insights
    skill_gap_analysis: z.string().describe('Brief analysis of current skill gaps and market needs'),
    market_outlook: z.string().describe('Overall market outlook and future trends'),
    competitive_advantage: z.string().describe('What gives candidates an edge in this field'),

    // Risk Assessment
    automation_risk: z.enum(['Low', 'Medium', 'High']).describe('Risk of automation'),
    market_saturation: z.enum(['Low', 'Medium', 'High']).describe('Market saturation level'),

    // Recommendations
    immediate_actions: z.array(z.object({
        action: z.string(),
        priority: z.enum(['Critical', 'High', 'Medium']),
        timeframe: z.string(),
        impact: z.string()
    })).min(3).max(5).describe('Immediate actionable steps'),
});

export type CareerInsightResult = z.infer<typeof careerInsightSchema>;

// ================================
// Input Types
// ================================

interface CareerInsightsInput {
    domain: string;
    currentRole?: string;
    experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Lead';
    location?: string;
}

// ================================
// AI Flow
// ================================

/**
 * Analyze career insights using Gemini AI (pure AI — no BigQuery)
 */
export async function analyzeCareerInsightsWithAI(
    input: CareerInsightsInput
): Promise<CareerInsightResult> {
    const { domain, currentRole, experienceLevel = 'Mid', location } = input;

    console.log('🧠 [CareerInsights] Starting AI analysis:', { domain, currentRole, experienceLevel });

    try {
        const prompt = `You are an expert career advisor and market analyst with deep knowledge of technology trends, job markets, and career development in ${new Date().getFullYear()}.

**Career Domain Analysis Request:**
- Domain/Field: ${domain}
- Current Role: ${currentRole || 'Not specified'}
- Experience Level: ${experienceLevel}
- Location: ${location || 'Global'}

**Your Task:**
Provide a comprehensive, data-driven career analysis for someone in the "${domain}" field.

### Required Analysis:

1. **Market Metrics**: 
   - Demand score (0-10) based on current job market for "${domain}"
   - Projected annual growth rate
   - Salary growth potential over 3-5 years
   - Estimated current global job openings for "${domain}"
   - Average years to next career level

2. **Career Progression**: 
   - 3-6 realistic future career paths from "${domain}" role
   - Consider both IC and management tracks

3. **Certifications**: 
   - Recommend 3-8 certifications ACTUALLY valued for "${domain}" today
   - Examples: AWS Solutions Architect for Cloud, CISSP for Cybersecurity, etc.
   - Do NOT recommend generic certs unrelated to "${domain}"

4. **Emerging Technologies**: 
   - 3-10 technologies ACTUALLY trending in the "${domain}" space right now
   - Be specific: "LangChain" not just "AI", "dbt" not just "data tools"

5. **Top Companies**: 
   - 4-8 REAL companies actively hiring for "${domain}" roles
   - Include mix of FAANG, startups, and industry leaders

6. **Geographic Hotspots**: 
   - 3-8 real locations/regions with strong "${domain}" job markets
   - Include both in-person and remote-friendly markets

7. **Insights**:
   - Skill gap analysis for "${domain}" professionals
   - Overall market outlook
   - What gives candidates a competitive advantage

8. **Risk Assessment**:
   - Automation risk level for "${domain}" roles
   - Market saturation level

9. **Immediate Actions**: 
   - 3-5 specific, actionable steps for a ${experienceLevel}-level "${domain}" professional
   - Each with priority, timeframe, and expected impact

**Important Guidelines:**
- Be realistic and data-driven, not overly optimistic
- Consider the current job market (${new Date().getFullYear()})
- ALL recommendations must be specific to "${domain}" — not generic tech advice
- Be specific with company names, certifications, and technologies
- Factor in AI/automation trends affecting "${domain}"`;

        console.log('🤖 [CareerInsights] Calling Gemini AI...');

        const result = await ai.generate({
            model: 'vertexai/gemini-2.5-flash',
            prompt,
            output: {
                schema: careerInsightSchema,
            },
            config: {
                temperature: 0.5,
                maxOutputTokens: 8192,
            },
        });

        if (!result.output) {
            throw new Error('AI returned empty output for career insights');
        }

        console.log('✅ [CareerInsights] Analysis complete for:', domain);

        return result.output;

    } catch (error) {
        console.error('❌ [CareerInsights] Error:', error);
        throw new Error(
            `Career insights analysis failed for domain "${domain}": ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

/**
 * Quick career insights check (lightweight, no full AI call)
 */
export async function getQuickCareerInsights(domain: string) {
    return {
        domain,
        trendingSkillsCount: 0,
        jobOpenings: 0,
        topSkills: [],
        avgSalary: null,
        note: 'Use full analyzeCareerInsightsWithAI for complete analysis',
    };
}

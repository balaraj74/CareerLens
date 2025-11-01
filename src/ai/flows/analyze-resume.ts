'use server';
/**
 * AI Resume Analyzer Flow
 * Analyzes resumes for ATS compatibility, keyword optimization, and provides improvement suggestions
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ResumeAnalysisScores,
  ResumeSuggestion,
  ResumeSection,
  ResumeAnalysisResult,
} from '@/lib/types';

// Schema for AI response
const AnalysisResponseSchema = z.object({
  scores: z.object({
    atsScore: z.number().min(0).max(100),
    readabilityScore: z.number().min(0).max(100),
    keywordScore: z.number().min(0).max(100),
    impactScore: z.number().min(0).max(100),
    structureScore: z.number().min(0).max(100),
    overallScore: z.number().min(0).max(100),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['critical', 'important', 'optional']),
      category: z.enum(['ats', 'keywords', 'formatting', 'content', 'structure']),
      title: z.string(),
      description: z.string(),
      beforeText: z.string().optional(),
      afterText: z.string().optional(),
      section: z.string().optional(),
      impact: z.enum(['high', 'medium', 'low']),
    })
  ),
  keywordAnalysis: z.object({
    missingKeywords: z.array(z.string()),
    presentKeywords: z.array(z.string()),
    overusedWords: z.array(z.string()),
  }),
  sectionAnalysis: z.array(
    z.object({
      name: z.string(),
      content: z.string(),
      score: z.number().min(0).max(10),
      suggestions: z.array(
        z.object({
          id: z.string(),
          type: z.enum(['critical', 'important', 'optional']),
          category: z.enum(['ats', 'keywords', 'formatting', 'content', 'structure']),
          title: z.string(),
          description: z.string(),
          impact: z.enum(['high', 'medium', 'low']),
        })
      ),
    })
  ),
});

// Define the prompt
const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  model: 'googleai/gemini-2.0-flash-exp',
  input: {
    schema: z.object({
      resumeText: z.string(),
      targetRole: z.string().optional(),
      targetIndustry: z.string().optional(),
    }),
  },
  output: {
    schema: AnalysisResponseSchema,
  },
  prompt: `
You are an expert resume analyst and ATS (Applicant Tracking System) specialist with 15+ years of experience in recruitment and career coaching.

Analyze the following resume comprehensively:

{{#if targetRole}}
Target Role: {{targetRole}}
{{/if}}
{{#if targetIndustry}}
Target Industry: {{targetIndustry}}
{{/if}}

Resume Text:
{{resumeText}}

Provide a detailed analysis covering:

1. **ATS Compatibility** (0-100):
   - Parsing-friendly format check
   - Standard section headers
   - Keywords alignment
   - No graphics/tables/columns issues
   - Contact info visibility

2. **Readability Score** (0-100):
   - Clear structure and hierarchy
   - Sentence complexity
   - Bullet point effectiveness
   - White space usage
   - Font/formatting consistency

3. **Keyword Density** (0-100):
   - Relevant technical skills
   - Industry-specific terms
   - Action verbs usage
   - Role-specific keywords
   - Avoid keyword stuffing

4. **Impact Score** (0-100):
   - Quantifiable achievements
   - Strong action verbs
   - Result-oriented statements
   - Leadership indicators
   - Problem-solving examples

5. **Structure Score** (0-100):
   - Professional summary presence
   - Experience section quality
   - Education placement
   - Skills section effectiveness
   - Optional sections (projects, certifications)

6. **Overall Score** (weighted average):
   - 30% ATS Compatibility
   - 20% Impact Score
   - 20% Keyword Density
   - 15% Structure
   - 15% Readability

Identify:
- Top 5 strengths
- Top 5 weaknesses
- Missing keywords (compared to industry standards)
- Present keywords (well-used terms)
- Overused words (reduce repetition)

For each section (Summary, Experience, Education, Skills, Projects, etc.):
- Evaluate presence and quality (0-10)
- Provide specific feedback
- Suggest 2-3 actionable improvements

Provide 8-12 prioritized suggestions:
- Critical (fix immediately): ATS blockers, major formatting issues
- Important (high impact): keyword gaps, weak bullet points
- Optional (polish): minor improvements, optimization

For each suggestion, include:
- Specific issue found
- Actionable recommendation
- Example of improvement
- Expected impact (high/medium/low)

Be constructive, specific, and actionable. Focus on modern best practices for 2024.

Return a JSON object with the structure matching the AnalysisResponseSchema.
`,
});

/**
 * Analyze resume and return comprehensive feedback
 */
export async function analyzeResume(
  resumeText: string,
  targetRole?: string,
  targetIndustry?: string
): Promise<ResumeAnalysisResult> {
  try {
    const response = await analyzeResumePrompt({
      resumeText,
      targetRole,
      targetIndustry,
    });

    const analysis = response.output;

    if (!analysis) {
      throw new Error('Failed to analyze resume');
    }

    // Transform sections with explicit typing
    const sections: ResumeSection[] = analysis.sectionAnalysis.map((section: any) => ({
      name: section.name,
      content: section.content,
      score: section.score,
      suggestions: section.suggestions,
    }));

    // Suggestions are already in correct format
    const suggestions: ResumeSuggestion[] = analysis.suggestions;

    const result: ResumeAnalysisResult = {
      scores: analysis.scores as ResumeAnalysisScores,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions,
      keywordAnalysis: {
        missingKeywords: analysis.keywordAnalysis.missingKeywords,
        presentKeywords: analysis.keywordAnalysis.presentKeywords,
        overusedWords: analysis.keywordAnalysis.overusedWords,
      },
      sections,
      analyzedAt: new Date(),
    };

    return result;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
}

/**
 * Quick ATS compatibility check
 */
export async function quickATSCheck(resumeText: string): Promise<{
  compatible: boolean;
  score: number;
  issues: string[];
}> {
  const quickPrompt = ai.definePrompt({
    name: 'quickATSCheck',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        resumeText: z.string(),
      }),
    },
    output: {
      schema: z.object({
        compatible: z.boolean(),
        score: z.number().min(0).max(100),
        issues: z.array(z.string()),
      }),
    },
    prompt: `
Quickly evaluate this resume for ATS compatibility:

{{resumeText}}

Check for:
1. Standard section headers
2. No tables/graphics/columns
3. Contact info present
4. Keywords present
5. Proper formatting

Return:
- compatible: true if score >= 70
- score: 0-100 ATS compatibility
- issues: array of critical problems found
`,
  });

  const response = await quickPrompt({ resumeText });
  return response.output || { compatible: false, score: 0, issues: ['Analysis failed'] };
}

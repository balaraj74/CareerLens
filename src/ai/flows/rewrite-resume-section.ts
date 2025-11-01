'use server';
/**
 * AI Resume Rewrite Flow
 * Rewrites resume content with different tones and styles
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export type RewriteTone = 'formal' | 'impact-driven' | 'creative' | 'academic';

const RewriteResponseSchema = z.object({
  originalText: z.string(),
  rewrittenText: z.string(),
  improvements: z.array(z.string()),
  tone: z.string(),
  keyChanges: z.array(z.object({
    before: z.string(),
    after: z.string(),
    reason: z.string(),
  })),
});

const rewritePrompt = ai.definePrompt({
  name: 'rewriteResumeSection',
  model: 'googleai/gemini-2.0-flash-exp',
  input: {
    schema: z.object({
      text: z.string(),
      section: z.string(),
      tone: z.string(),
      targetRole: z.string().optional(),
      additionalContext: z.string().optional(),
    }),
  },
  output: {
    schema: RewriteResponseSchema,
  },
  prompt: `
You are an expert resume writer specializing in creating compelling, ATS-friendly content that gets candidates hired.

**Task**: Rewrite the following resume section with a {{tone}} tone.

**Section**: {{section}}
{{#if targetRole}}
**Target Role**: {{targetRole}}
{{/if}}
{{#if additionalContext}}
**Additional Context**: {{additionalContext}}
{{/if}}

**Original Text**:
{{text}}

**Tone Guidelines**:

**Formal**:
- Professional, corporate language
- Traditional resume phrasing
- Conservative word choices
- Emphasis on responsibilities and duties
- Example: "Managed team of 5 engineers" instead of "Led a dynamic team"

**Impact-Driven**:
- Start with strong action verbs
- Quantify achievements with metrics
- Focus on results and outcomes
- Use power words (achieved, accelerated, optimized, delivered)
- Example: "Accelerated product launch by 40%, delivering $2M in revenue"

**Creative**:
- Dynamic, engaging language
- Storytelling elements
- Modern vocabulary
- Show personality while staying professional
- Example: "Transformed user experience through innovative design thinking"

**Academic**:
- Scholarly tone
- Research-focused terminology
- Methodological precision
- Emphasis on contributions to field
- Example: "Conducted empirical research analyzing..."

**Requirements**:
1. Maintain factual accuracy - don't invent achievements
2. Keep the same core information
3. Optimize for ATS (include relevant keywords)
4. Improve readability and impact
5. Match the requested tone
6. Use strong action verbs
7. Quantify where possible (if numbers exist in original)
8. Keep length similar to original (±20%)

**Return**:
- originalText: The input text
- rewrittenText: Your improved version
- improvements: 3-5 key improvements made
- tone: The tone used
- keyChanges: 3-5 specific before/after examples with reasons

Be specific, impactful, and professional. Focus on making every word count.
`,
});

/**
 * Rewrite a resume section with specified tone
 */
export async function rewriteResumeSection(
  text: string,
  section: string,
  tone: RewriteTone,
  targetRole?: string,
  additionalContext?: string
): Promise<{
  originalText: string;
  rewrittenText: string;
  improvements: string[];
  tone: string;
  keyChanges: Array<{ before: string; after: string; reason: string }>;
}> {
  try {
    const response = await rewritePrompt({
      text,
      section,
      tone,
      targetRole,
      additionalContext,
    });

    const result = response.output;

    if (!result) {
      throw new Error('Failed to rewrite resume section');
    }

    return result;
  } catch (error) {
    console.error('Error rewriting resume section:', error);
    throw new Error('Failed to rewrite resume section. Please try again.');
  }
}

/**
 * Rewrite multiple bullet points
 */
export async function rewriteBulletPoints(
  bulletPoints: string[],
  tone: RewriteTone,
  targetRole?: string
): Promise<string[]> {
  const bulletPrompt = ai.definePrompt({
    name: 'rewriteBulletPoints',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        bullets: z.array(z.string()),
        tone: z.string(),
        targetRole: z.string().optional(),
      }),
    },
    output: {
      schema: z.object({
        rewrittenBullets: z.array(z.string()),
      }),
    },
    prompt: `
Rewrite these resume bullet points with a {{tone}} tone:

{{#if targetRole}}
Target Role: {{targetRole}}
{{/if}}

Original Bullets:
{{#each bullets}}
• {{this}}
{{/each}}

Requirements:
- Start with strong action verbs
- Quantify achievements where possible
- Keep factual accuracy
- Make each bullet impactful
- Optimize for ATS
- Match {{tone}} tone

Return only the improved bullets as an array.
`,
  });

  try {
    const response = await bulletPrompt({
      bullets: bulletPoints,
      tone,
      targetRole,
    });

    return response.output?.rewrittenBullets || bulletPoints;
  } catch (error) {
    console.error('Error rewriting bullet points:', error);
    return bulletPoints;
  }
}

/**
 * Generate professional summary from profile data
 */
export async function generateProfessionalSummary(
  profileData: {
    role?: string;
    experience?: string;
    skills?: string[];
    achievements?: string[];
    targetRole?: string;
  },
  tone: RewriteTone = 'impact-driven'
): Promise<string> {
  const summaryPrompt = ai.definePrompt({
    name: 'generateProfessionalSummary',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        role: z.string().optional(),
        experience: z.string().optional(),
        skills: z.array(z.string()).optional(),
        achievements: z.array(z.string()).optional(),
        targetRole: z.string().optional(),
        tone: z.string(),
      }),
    },
    output: {
      schema: z.object({
        summary: z.string(),
      }),
    },
    prompt: `
Generate a compelling professional summary for a resume with {{tone}} tone.

{{#if role}}Current Role: {{role}}{{/if}}
{{#if experience}}Experience: {{experience}}{{/if}}
{{#if targetRole}}Target Role: {{targetRole}}{{/if}}
{{#if skills}}Key Skills: {{#each skills}}{{this}}, {{/each}}{{/if}}
{{#if achievements}}Notable Achievements: {{#each achievements}}{{this}}; {{/each}}{{/if}}

Requirements:
- 3-4 sentences (50-80 words)
- Highlight unique value proposition
- Include relevant keywords
- Match {{tone}} tone
- Focus on impact and results
- Make it compelling and ATS-friendly

Return only the summary text.
`,
  });

  try {
    const response = await summaryPrompt({
      ...profileData,
      tone,
    });

    return response.output?.summary || '';
  } catch (error) {
    console.error('Error generating professional summary:', error);
    throw new Error('Failed to generate summary. Please try again.');
  }
}

/**
 * Optimize text for ATS keywords
 */
export async function optimizeForATS(
  text: string,
  targetRole: string,
  keywords: string[]
): Promise<{
  optimizedText: string;
  addedKeywords: string[];
  keywordDensity: number;
}> {
  const atsPrompt = ai.definePrompt({
    name: 'optimizeForATS',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        text: z.string(),
        targetRole: z.string(),
        keywords: z.array(z.string()),
      }),
    },
    output: {
      schema: z.object({
        optimizedText: z.string(),
        addedKeywords: z.array(z.string()),
        keywordDensity: z.number(),
      }),
    },
    prompt: `
Optimize this resume text for ATS by naturally incorporating these keywords:

Target Role: {{targetRole}}
Keywords to include: {{#each keywords}}{{this}}, {{/each}}

Original Text:
{{text}}

Requirements:
1. Naturally incorporate missing keywords
2. Don't force keywords awkwardly
3. Maintain readability and flow
4. Keep factual accuracy
5. Calculate keyword density (keywords/total words * 100)

Return:
- optimizedText: The improved version
- addedKeywords: Keywords successfully added
- keywordDensity: Percentage of keyword usage
`,
  });

  try {
    const response = await atsPrompt({
      text,
      targetRole,
      keywords,
    });

    return response.output || {
      optimizedText: text,
      addedKeywords: [],
      keywordDensity: 0,
    };
  } catch (error) {
    console.error('Error optimizing for ATS:', error);
    throw new Error('Failed to optimize for ATS. Please try again.');
  }
}

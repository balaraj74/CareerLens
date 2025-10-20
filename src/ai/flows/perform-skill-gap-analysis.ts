'use server';
/**
 * @fileOverview Performs skill gap analysis between user skills and target role requirements.
 *
 * - performSkillGapAnalysis - A function that analyzes the skill gap.
 */

import {ai} from '@/ai/genkit';
import {
  SkillGapAnalysisInputSchema,
  SkillGapAnalysisOutputSchema,
  type SkillGapAnalysisInput,
  type SkillGapAnalysisOutput,
} from '@/ai/schemas/perform-skill-gap-analysis';


export async function performSkillGapAnalysis(
  input: SkillGapAnalysisInput
): Promise<SkillGapAnalysisOutput> {
  return performSkillGapAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: {schema: SkillGapAnalysisInputSchema},
  output: {schema: SkillGapAnalysisOutputSchema},
  prompt: `You are an expert career coach specializing in skill gap analysis.

You will use this information to identify the overlapping skills, missing skills, and provide a suggested learning order.

User Skills: {{userSkills}}
Target Role Requirements: {{targetRoleRequirements}}

Given the user's skills and the target role requirements, identify the overlapping skills, missing skills, and a suggested learning order for acquiring the missing skills. Consider dependencies and prerequisites when suggesting the learning order.

Output the overlapping skills, missing skills, and a suggested learning order in JSON format.
`,
  model: 'googleai/gemini-2.5-flash-lite',
});

const performSkillGapAnalysisFlow = ai.defineFlow(
  {
    name: 'performSkillGapAnalysisFlow',
    inputSchema: SkillGapAnalysisInputSchema,
    outputSchema: SkillGapAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

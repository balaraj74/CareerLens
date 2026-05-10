'use server';
/**
 * @fileOverview Performs skill gap analysis between user skills and target role requirements.
 *
 * - performSkillGapAnalysis - A function that analyzes the skill gap.
 */

import { ai } from '@/ai/genkit';
import {
  SkillGapAnalysisInputSchema,
  SkillGapAnalysisOutputSchema,
  type SkillGapAnalysisInput,
  type SkillGapAnalysisOutput,
} from '@/ai/schemas/perform-skill-gap-analysis';

export async function performSkillGapAnalysis(
  input: SkillGapAnalysisInput
): Promise<SkillGapAnalysisOutput> {
  const prompt = `You are an expert career coach specializing in skill gap analysis.

You will use this information to identify the overlapping skills, missing skills, and provide a suggested learning order.

User Skills: ${input.userSkills.join(', ')}
Target Role Requirements: ${input.targetRoleRequirements.join(', ')}

Given the user's skills and the target role requirements, identify the overlapping skills, missing skills, and a suggested learning order for acquiring the missing skills. Consider dependencies and prerequisites when suggesting the learning order.

Output the overlapping skills, missing skills, and a suggested learning order in JSON format.
`;

  try {
    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt,
      output: {
        schema: SkillGapAnalysisOutputSchema,
      },
    });

    if (!response.output) {
      throw new Error('No output generated from AI');
    }

    return response.output;
  } catch (error) {
    console.error('Error generating skill gap analysis:', error);
    throw new Error('Failed to generate skill gap analysis');
  }
}

'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating career recommendations based on user profile and preferences.
 *
 * It includes:
 * - generateCareerRecommendations - A function that orchestrates the career recommendation generation process.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateCareerRecommendationsInputSchema,
  GenerateCareerRecommendationsOutputSchema,
  type GenerateCareerRecommendationsInput,
  type GenerateCareerRecommendationsOutput,
} from '@/ai/schemas/career-recommendations';

export async function generateCareerRecommendations(
  input: GenerateCareerRecommendationsInput
): Promise<GenerateCareerRecommendationsOutput> {
  const prompt = `
    You are CareerLens, an AI career advisor.
    User Profile: ${input.profile}
    Task: Recommend top 3 career paths with:
    1. A "career" title.
    2. A "reason" for why it’s a good fit.
    3. A list of "missingSkills" (as a string, comma separated).
    4. A "learningPlan" (as a string with newlines for formatting).
    5. A list of "resources" (as a string with newlines for formatting).
    Return a single JSON object with a key "careerRecommendations" which is an array of these objects.
  `;

  try {
    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt,
      output: {
        schema: GenerateCareerRecommendationsOutputSchema,
      },
    });

    if (!response.output) {
      throw new Error('No output generated from AI');
    }

    return response.output;
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    throw new Error('Failed to generate career recommendations');
  }
}

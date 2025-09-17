'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating career recommendations based on user profile and preferences.
 *
 * It includes:
 * - generateCareerRecommendations - A function that orchestrates the career recommendation generation process.
 * - GenerateCareerRecommendationsInput - The input type for the generateCareerRecommendations function.
 * - GenerateCareerRecommendationsOutput - The return type for the generateCareerRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateCareerRecommendationsInputSchema = z.object({
  profile: z
    .string()
    .describe('A detailed description of the user profile, including education, experience, skills, and interests.'),
});
export type GenerateCareerRecommendationsInput = z.infer<typeof GenerateCareerRecommendationsInputSchema>;

const CareerRecommendationSchema = z.object({
  career: z.string().describe('The title of the career path.'),
  reason: z.string().describe('Why this career is a good fit for the user.'),
  missingSkills: z.string().describe('A comma-separated list of skills the user needs to acquire.'),
  learningPlan: z.string().describe('A 3-month learning roadmap.'),
  resources: z.string().describe('A list of suggested free and paid resources.'),
});

export const GenerateCareerRecommendationsOutputSchema = z.object({
  careerRecommendations: z.array(CareerRecommendationSchema).describe('A list of top 3 career recommendations.'),
});
export type GenerateCareerRecommendationsOutput = z.infer<typeof GenerateCareerRecommendationsOutputSchema>;

export async function generateCareerRecommendations(input: GenerateCareerRecommendationsInput): Promise<GenerateCareerRecommendationsOutput> {
  return generateCareerRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCareerRecommendationsPrompt',
  input: {schema: GenerateCareerRecommendationsInputSchema},
  output: {schema: GenerateCareerRecommendationsOutputSchema},
  prompt: `
    You are CareerLens, an AI career advisor.
    User Profile: {{{profile}}}
    Task: Recommend top 3 career paths with:
    1. A "career" title.
    2. A "reason" for why it’s a good fit.
    3. A list of "missingSkills" (as a string, comma separated).
    4. A "learningPlan" (as a string with newlines for formatting).
    5. A list of "resources" (as a string with newlines for formatting).
    Return a single JSON object with a key "careerRecommendations" which is an array of these objects.
  `,
});

const generateCareerRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateCareerRecommendationsFlow',
    inputSchema: GenerateCareerRecommendationsInputSchema,
    outputSchema: GenerateCareerRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

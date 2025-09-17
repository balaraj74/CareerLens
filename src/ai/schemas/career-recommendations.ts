/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the career recommendations generation flow.
 */

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

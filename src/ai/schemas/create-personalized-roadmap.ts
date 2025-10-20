/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the personalized roadmap creation flow.
 */

import { z } from 'genkit';

export const CreatePersonalizedRoadmapInputSchema = z.object({
  careerRecommendation: z
    .string()
    .describe('The career recommendation to base the learning plan on.'),
  userSkills: z.array(z.string()).describe('The skills the user already possesses.'),
  missingSkills: z.array(z.string()).describe('The skills the user needs to learn.'),
});
export type CreatePersonalizedRoadmapInput = z.infer<
  typeof CreatePersonalizedRoadmapInputSchema
>;

export const CreatePersonalizedRoadmapOutputSchema = z.object({
  learningPlan: z.array(z.object({
    week: z.number().describe('The week number in the 3-month plan.'),
    topic: z.string().describe('The learning topic for the week.'),
    resources: z.array(z.object({
      name: z.string().describe('The name of the resource.'),
      url: z.string().url().describe('The URL of the resource.'),
      type: z.enum(['free', 'paid']).describe('Whether the resource is free or paid.'),
    })).describe('A list of learning resources for the week.'),
  })).describe('A 3-month weekly learning plan with resources.'),
});
export type CreatePersonalizedRoadmapOutput = z.infer<
  typeof CreatePersonalizedRoadmapOutputSchema
>;

'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized 3-month weekly learning plan
 *  with free and paid resources based on a career recommendation.
 *
 * - createPersonalizedRoadmap - A function that generates a personalized roadmap.
 */

import {ai} from '@/ai/genkit';
import {
  CreatePersonalizedRoadmapInputSchema,
  CreatePersonalizedRoadmapOutputSchema,
  type CreatePersonalizedRoadmapInput,
  type CreatePersonalizedRoadmapOutput,
} from '@/ai/schemas/create-personalized-roadmap';


export async function createPersonalizedRoadmap(
  input: CreatePersonalizedRoadmapInput
): Promise<CreatePersonalizedRoadmapOutput> {
  return createPersonalizedRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createPersonalizedRoadmapPrompt',
  input: {schema: CreatePersonalizedRoadmapInputSchema},
  output: {schema: CreatePersonalizedRoadmapOutputSchema},
  prompt: `You are a career coach who helps users create personalized learning plans to achieve their career goals.

  Based on the career recommendation: {{{careerRecommendation}}},
  and the user's existing skills: {{#if userSkills}}{{#each userSkills}}- {{{this}}}
{{/each}}{{else}}None{{/if}},
  and the missing skills required for the role: {{#if missingSkills}}{{#each missingSkills}}- {{{this}}}
{{/each}}{{else}}None{{/if}},

  Create a personalized 3-month (12 weeks) weekly learning plan with specific topics and resources (both free and paid) for the user to learn the missing skills and advance their career.
  Provide the name and URL for each resource.

  Ensure that all URLs are valid.

  Format the output as a JSON object conforming to this schema:
  ${JSON.stringify(CreatePersonalizedRoadmapOutputSchema.describe(''))}
  `,
  model: 'googleai/gemini-2.5-flash-lite',
});

const createPersonalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'createPersonalizedRoadmapFlow',
    inputSchema: CreatePersonalizedRoadmapInputSchema,
    outputSchema: CreatePersonalizedRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

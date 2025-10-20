'use server';

/**
 * @fileOverview Generates interview questions (easy, medium, and hard) with model answers for a specific career role.
 *
 * - generateInterviewQuestions - A function that generates interview questions with model answers.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateInterviewQuestionsInputSchema,
  GenerateInterviewQuestionsOutputSchema,
  type GenerateInterviewQuestionsInput,
  type GenerateInterviewQuestionsOutput,
} from '@/ai/schemas/generate-interview-questions';


export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert career coach helping candidates prepare for interviews.

  Generate a set of interview questions (easy, medium, and hard) along with model answers tailored to the following career role:

  {{careerRole}}

  The response should be a JSON object containing an array of interview questions, each with a question, difficulty (easy, medium, or hard), and a model answer.
  `,
  model: 'googleai/gemini-2.5-flash-lite',
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

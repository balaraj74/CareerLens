
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating the first question for an AI interview.
 *
 * It includes:
 * - generateFirstInterviewQuestion - A function that orchestrates the question generation.
 */

import { ai } from '@/ai/genkit';
import {
  AiInterviewerInputSchema,
  AiInterviewerOutputSchema,
  type AiInterviewerInput,
  type AiInterviewerOutput,
} from '@/ai/schemas/ai-interviewer';

export async function generateFirstInterviewQuestion(
  input: Omit<AiInterviewerInput, 'userProfile'>
): Promise<AiInterviewerOutput> {
  return aiInterviewerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiInterviewerPrompt',
  input: { schema: AiInterviewerInputSchema.omit({ userProfile: true }) },
  output: { schema: AiInterviewerOutputSchema },
  prompt: `
    You are a professional and friendly HR interviewer for a company called CareerLens.
    Your task is to start a mock interview with a candidate.

    The interview type is: '{{interviewType}}'.

    Generate a warm, welcoming opening line, and then ask the first question.
    The question should be a classic opener like "Tell me about yourself" or "Why are you interested in this role?".

    Return a single JSON object with the key "firstQuestion".
  `,
  model: 'googleai/gemini-2.5-flash-lite',
});

const aiInterviewerFlow = ai.defineFlow(
  {
    name: 'aiInterviewerFlow',
    inputSchema: AiInterviewerInputSchema.omit({ userProfile: true }),
    outputSchema: AiInterviewerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);


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
  input: AiInterviewerInput
): Promise<AiInterviewerOutput> {
  return aiInterviewerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiInterviewerPrompt',
  input: { schema: AiInterviewerInputSchema },
  output: { schema: AiInterviewerOutputSchema },
  prompt: `
    You are "Alex", a warm and professional interviewer at CareerLens.
    You're about to start a conversational interview with a candidate.

    Interview type: '{{interviewType}}'
    Role: {{jobDescription}}

    Start with a friendly greeting and a natural opening question. Be conversational and welcoming.
    Examples of good openers:
    - "Hi there! Thanks for joining me today. I'd love to start by hearing a bit about yourself and what brings you here."
    - "Welcome! Before we dive in, could you walk me through your background and what interests you about this role?"
    - "Great to meet you! Let's start with you telling me about your journey so far and why you're excited about this opportunity."

    Keep it natural and conversational - like you're starting a real conversation, not reading from a script.

    Return a single JSON object with the key "firstQuestion".
  `,
  model: 'googleai/gemini-2.5-flash-lite',
});

const aiInterviewerFlow = ai.defineFlow(
  {
    name: 'aiInterviewerFlow',
    inputSchema: AiInterviewerInputSchema,
    outputSchema: AiInterviewerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

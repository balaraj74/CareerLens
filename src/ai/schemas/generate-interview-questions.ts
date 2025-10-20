/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the interview question generation flow.
 */

import { z } from 'genkit';

export const GenerateInterviewQuestionsInputSchema = z.object({
  careerRole: z.string().describe('The career role to generate interview questions for.'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const InterviewQuestionSchema = z.object({
  question: z.string().describe('The interview question.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the question.'),
  modelAnswer: z.string().describe('A model answer for the question.'),
});

export const GenerateInterviewQuestionsOutputSchema = z.object({
  interviewQuestions: z.array(InterviewQuestionSchema).describe('A list of interview questions with model answers.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

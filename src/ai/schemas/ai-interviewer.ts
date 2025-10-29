
/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the AI Interviewer flow.
 */

import { z } from 'genkit';

export const AiInterviewerInputSchema = z.object({
  interviewType: z.enum(['technical', 'hr', 'mixed']).describe("The type of interview to be conducted."),
  jobDescription: z.string().optional().describe('The description of the role the user is interviewing for.'),
  avatarType: z.enum(['HR', 'Mentor', 'Robot']).describe('The selected avatar type.'),
});
export type AiInterviewerInput = z.infer<typeof AiInterviewerInputSchema>;


export const AiInterviewerOutputSchema = z.object({
  firstQuestion: z.string().describe("The welcoming greeting and first question from the AI interviewer."),
});
export type AiInterviewerOutput = z.infer<typeof AiInterviewerOutputSchema>;

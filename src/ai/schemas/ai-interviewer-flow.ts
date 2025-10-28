
/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the stateful, conversational AI Interviewer flow.
 */

import { z } from 'genkit';
import { userProfileSchema } from '@/lib/types';

export const transcriptItemSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
  timestamp: z.string(),
});
export type TranscriptItem = z.infer<typeof transcriptItemSchema>;


export const AiInterviewerInputSchema = z.object({
  userProfile: userProfileSchema.describe(
    'The full profile of the user being interviewed.'
  ),
  jobDescription: z.string().optional().describe('The description of the role the user is interviewing for.'),
  transcript: z
    .array(transcriptItemSchema)
    .describe('The history of the conversation so far.'),
  avatarType: z.enum(['HR', 'Mentor', 'Robot']).describe('The selected avatar type.'),
});
export type AiInterviewerInput = z.infer<
  typeof AiInterviewerInputSchema
>;

export const AiInterviewerFlowOutputSchema = z.object({
    followUp: z.string().describe("The AI's next question or statement in the conversation."),
    isEndOfInterview: z.boolean().describe("Set to true only when the interview should be concluded."),
    audioDataUri: z.string().optional().describe('The base64 encoded audio data URI of the AI response.'),
});
export type AiInterviewerFlowOutput = z.infer<
  typeof AiInterviewerFlowOutputSchema
>;

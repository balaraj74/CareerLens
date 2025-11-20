/**
 * @fileOverview Type definitions for English Helper
 */

import { z } from 'zod';

// Input/Output schemas
export const EnglishHelperInputSchema = z.object({
  topic: z.enum(['daily', 'interview', 'travel', 'technical', 'idioms', 'debate']),
  proficiency: z.enum(['basic', 'intermediate', 'advanced']),
  accent: z.enum(['american', 'british', 'australian', 'neutral']),
});

export const EnglishHelperStarterSchema = z.object({
  greeting: z.string().describe('Warm, friendly greeting to start the conversation'),
});

export const EnglishHelperFollowupInputSchema = z.object({
  transcript: z.array(z.object({
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
    timestamp: z.string(),
  })),
  topic: z.string(),
  proficiency: z.string(),
});

export const EnglishHelperFollowupSchema = z.object({
  response: z.string().describe('Natural, conversational response that continues the practice'),
  feedback: z.object({
    grammar: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    vocabulary: z.object({
      newWords: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    pronunciation: z.object({
      score: z.number().min(0).max(100),
      tips: z.array(z.string()),
    }),
    fluency: z.object({
      score: z.number().min(0).max(100),
      observations: z.array(z.string()),
    }),
    encouragement: z.string(),
  }),
  isEndOfSession: z.boolean().describe('True after 5-7 exchanges or when practice goal is met'),
});

export type EnglishHelperInput = z.infer<typeof EnglishHelperInputSchema>;
export type EnglishHelperStarter = z.infer<typeof EnglishHelperStarterSchema>;
export type EnglishHelperFollowupInput = z.infer<typeof EnglishHelperFollowupInputSchema>;
export type EnglishHelperFollowup = z.infer<typeof EnglishHelperFollowupSchema>;

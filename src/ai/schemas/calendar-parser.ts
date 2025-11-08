/**
 * Schema definitions for Natural Language Calendar Event Parser
 */

import { z } from 'zod';

export const RecurrencePatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']),
  interval: z.number().default(1),
  endDate: z.string().optional(),
  occurrences: z.number().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
});

export const ParsedEventDataSchema = z.object({
  summary: z.string(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  category: z.enum([
    'learning',
    'interview',
    'networking',
    'deadline',
    'meeting',
    'task',
    'personal',
    'career',
    'project'
  ]).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  location: z.string().optional(),
  recurrence: RecurrencePatternSchema.optional(),
  attendees: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(100),
  ambiguities: z.array(z.string()).optional(),
});

export const NaturalLanguageInputSchema = z.object({
  userInput: z.string(),
  currentDateTime: z.string(),
  userTimeZone: z.string().default('UTC'),
});

export type NaturalLanguageInput = z.infer<typeof NaturalLanguageInputSchema>;
export type ParsedEventData = z.infer<typeof ParsedEventDataSchema>;
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>;

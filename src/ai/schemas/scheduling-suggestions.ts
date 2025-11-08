/**
 * Schema definitions for AI Scheduling Suggestions
 */

import { z } from 'zod';

export const UserHabitSchema = z.object({
  preferredStartTime: z.string(), // "09:00"
  preferredEndTime: z.string(), // "17:00"
  peakProductivityHours: z.array(z.number()).optional(), // [9, 10, 14, 15]
  commonCategories: z.array(z.string()).optional(),
  averageSessionDuration: z.number().optional(), // minutes
  preferredDaysForCategory: z.record(z.array(z.number())).optional(), // {"learning": [1,3,5]}
});

export const FreeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  durationMinutes: z.number(),
});

export const SchedulingSuggestionInputSchema = z.object({
  eventSummary: z.string(),
  eventDescription: z.string().optional(),
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
  ]),
  duration: z.number(), // minutes
  priority: z.enum(['high', 'medium', 'low']),
  userHabits: UserHabitSchema,
  freeSlots: z.array(FreeSlotSchema),
  existingEvents: z.array(z.object({
    id: z.string(),
    summary: z.string(),
    start: z.string(),
    end: z.string(),
    category: z.string(),
  })),
  currentDateTime: z.string(),
  userTimeZone: z.string().default('UTC'),
});

export const SuggestedTimeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  score: z.number().min(0).max(100),
  reasoning: z.string(),
  factors: z.object({
    matchesUserHabits: z.number().min(0).max(100),
    optimalTimeOfDay: z.number().min(0).max(100),
    noConflicts: z.number().min(0).max(100),
    energyLevel: z.number().min(0).max(100),
    balancesSchedule: z.number().min(0).max(100),
  }),
});

export const SchedulingSuggestionOutputSchema = z.object({
  recommendedSlots: z.array(SuggestedTimeSlotSchema).max(3),
  overallReasoning: z.string(),
  warnings: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
});

export type SchedulingSuggestionInput = z.infer<typeof SchedulingSuggestionInputSchema>;
export type SchedulingSuggestionOutput = z.infer<typeof SchedulingSuggestionOutputSchema>;
export type SuggestedTimeSlot = z.infer<typeof SuggestedTimeSlotSchema>;
export type UserHabit = z.infer<typeof UserHabitSchema>;
export type FreeSlot = z.infer<typeof FreeSlotSchema>;

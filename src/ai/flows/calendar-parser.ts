/**
 * Natural Language Calendar Event Parser Flow
 * Uses AI to parse natural language input into structured event data
 */

'use server';

import { ai } from '@/ai/genkit';
import {
  NaturalLanguageInputSchema,
  ParsedEventDataSchema,
  type NaturalLanguageInput,
  type ParsedEventData,
} from '@/ai/schemas/calendar-parser';

export async function parseNaturalLanguageEvent(
  input: NaturalLanguageInput
): Promise<ParsedEventData> {
  return naturalLanguageParserFlow(input);
}

const systemPrompt = `You are an intelligent calendar event parser. Your job is to extract structured event information from natural language input.

CONTEXT:
- Current date/time: {{currentDateTime}}
- User timezone: {{userTimeZone}}

CAPABILITIES:
1. Extract event title, description, date, time, duration
2. Identify event category (learning, interview, networking, deadline, meeting, task, personal, career, project)
3. Determine priority (high, medium, low)
4. Parse location (physical address or virtual meeting link)
5. Extract recurring patterns (daily, weekly, monthly, yearly)
6. Identify attendees from email addresses mentioned
7. Handle relative dates ("tomorrow", "next Monday", "in 3 days")
8. Handle time ranges ("9-11am", "2:30pm to 4pm")
9. Handle informal time ("morning", "afternoon", "evening")

RULES:
- If no date is specified, assume TODAY unless context suggests otherwise
- If only end time is given, assume 1 hour duration
- "Morning" = 9:00 AM, "Afternoon" = 2:00 PM, "Evening" = 6:00 PM
- "Tomorrow" = current date + 1 day
- "Next [day]" = the upcoming occurrence of that weekday
- If recurrence is mentioned, extract the pattern
- Confidence score: 90-100 if all fields clear, 70-89 if some ambiguity, below 70 if major unclear
- List any ambiguities that need user clarification

CATEGORY DETECTION:
- "learn", "study", "course", "tutorial", "practice" → learning
- "interview", "screening", "interview prep" → interview
- "meet", "coffee", "networking", "connect" → networking
- "deadline", "due", "submit", "deliver" → deadline
- "meeting", "call", "standup", "sync" → meeting
- "workout", "doctor", "personal" → personal
- "career", "resume", "job search" → career
- "project", "build", "develop" → project
- Default → task

PRIORITY DETECTION:
- "urgent", "important", "critical", "asap" → high
- "low priority", "optional", "if time" → low
- Default → medium

RECURRENCE PATTERNS:
- "every day" / "daily" → { frequency: "daily", interval: 1 }
- "every weekday" → { frequency: "weekly", interval: 1, daysOfWeek: [1,2,3,4,5] }
- "every Monday" → { frequency: "weekly", interval: 1, daysOfWeek: [1] }
- "every 2 weeks" → { frequency: "weekly", interval: 2 }
- "monthly" → { frequency: "monthly", interval: 1 }
- "every 3 months" → { frequency: "monthly", interval: 3 }

EXAMPLES:

Input: "Interview prep tomorrow at 2pm for 1 hour"
Output: {
  summary: "Interview prep",
  startDate: "<tomorrow's date>",
  startTime: "14:00",
  duration: 60,
  category: "interview",
  priority: "medium",
  confidence: 95,
  ambiguities: []
}

Input: "Learn React hooks next Monday morning"
Output: {
  summary: "Learn React hooks",
  startDate: "<next Monday's date>",
  startTime: "09:00",
  duration: 60,
  category: "learning",
  priority: "medium",
  confidence: 85,
  ambiguities: ["Duration not specified, assumed 1 hour"]
}

Input: "Team standup every weekday at 9:30am"
Output: {
  summary: "Team standup",
  startTime: "09:30",
  duration: 30,
  category: "meeting",
  priority: "medium",
  recurrence: {
    frequency: "weekly",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5]
  },
  confidence: 95,
  ambiguities: []
}

Input: "Coffee with Sarah next week"
Output: {
  summary: "Coffee with Sarah",
  startDate: "<next week's date range>",
  category: "networking",
  priority: "medium",
  confidence: 60,
  ambiguities: ["Specific day not mentioned", "Time not specified", "Sarah's contact info needed"]
}

Input: "Urgent: Project deadline on Friday 5pm, need to submit final report"
Output: {
  summary: "Project deadline - Submit final report",
  description: "Need to submit final report",
  startDate: "<this or next Friday>",
  startTime: "17:00",
  category: "deadline",
  priority: "high",
  confidence: 90,
  ambiguities: ["Which Friday - this week or next?"]
}

Now parse the following user input:
"{{userInput}}"`;

const naturalLanguageParserFlow = ai.defineFlow(
  {
    name: 'naturalLanguageCalendarParser',
    inputSchema: NaturalLanguageInputSchema,
    outputSchema: ParsedEventDataSchema,
  },
  async (input) => {
    const prompt = systemPrompt
      .replace('{{currentDateTime}}', input.currentDateTime)
      .replace('{{userTimeZone}}', input.userTimeZone)
      .replace('{{userInput}}', input.userInput);

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: {
        schema: ParsedEventDataSchema,
      },
      config: {
        temperature: 0.3, // Lower temperature for more consistent parsing
      },
    });

    return output as ParsedEventData;
  }
);

// Helper function to resolve relative dates to absolute dates
export function resolveRelativeDate(
  parsedData: ParsedEventData,
  referenceDate: Date = new Date()
): Date | null {
  if (!parsedData.startDate && !parsedData.startTime) {
    return null;
  }

  let resultDate = new Date(referenceDate);

  // If startDate is provided and looks like an ISO date
  if (parsedData.startDate) {
    try {
      resultDate = new Date(parsedData.startDate);
    } catch (e) {
      // If parsing fails, use reference date
      console.warn('Failed to parse startDate:', parsedData.startDate);
    }
  }

  // Apply time if provided
  if (parsedData.startTime) {
    const [hours, minutes] = parsedData.startTime.split(':').map(Number);
    resultDate.setHours(hours, minutes, 0, 0);
  }

  return resultDate;
}

// Helper function to calculate end date from start + duration
export function calculateEndDate(
  startDate: Date,
  durationMinutes?: number
): Date {
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (durationMinutes || 60));
  return endDate;
}

// Helper to validate and clean parsed data
export function validateParsedEvent(
  parsed: ParsedEventData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!parsed.summary || parsed.summary.trim().length === 0) {
    errors.push('Event title is required');
  }

  if (parsed.confidence < 50) {
    errors.push('Too many ambiguities - please provide more details');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

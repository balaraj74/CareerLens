/**
 * AI Calendar Suggestions Service
 * Uses Gemini AI to generate intelligent event suggestions
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { CareerEvent } from './google-calendar-service';
import type { EnhancedUserProfile } from './types';

const eventSuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      summary: z.string(),
      description: z.string(),
      type: z.enum(['learning', 'interview', 'networking', 'deadline', 'meeting', 'task']),
      priority: z.enum(['high', 'medium', 'low']),
      duration: z.number(), // in minutes
      suggestedTime: z.string(), // e.g., "morning", "afternoon", "evening"
      reasoning: z.string(),
    })
  ),
});

export type EventSuggestion = z.infer<typeof eventSuggestionSchema>['suggestions'][0];

/**
 * Generate AI-powered event suggestions based on user profile and current calendar
 */
export async function generateEventSuggestions(
  userProfile: EnhancedUserProfile,
  currentEvents: CareerEvent[],
  count: number = 5
): Promise<EventSuggestion[]> {
  try {
    const prompt = `You are an AI career coach analyzing a user's profile and calendar to suggest productive events.

User Profile:
- Name: ${userProfile.name}
- Title: ${userProfile.title || 'Professional'}
- Skills: ${(userProfile.skills || []).map((s) => s.name).join(', ')}
- Career Goals: ${userProfile.objective || 'Career development'}
- Experience Level: ${userProfile.experienceDetails?.length || 0} years

Current Calendar Events (Today):
${currentEvents
  .slice(0, 5)
  .map(
    (e) =>
      `- ${e.summary} (${e.type}, ${new Date(e.start.dateTime).toLocaleTimeString()})`
  )
  .join('\n')}

Generate ${count} smart event suggestions that will help them advance their career. Consider:
1. Skill gaps that need addressing
2. Interview preparation needs
3. Networking opportunities
4. Learning new technologies
5. Building projects
6. Maintaining work-life balance

For each suggestion, provide:
- A clear, actionable title
- Detailed description
- Event type (learning/interview/networking/deadline/meeting/task)
- Priority level
- Estimated duration in minutes
- Best time of day (morning/afternoon/evening)
- Reasoning why this is beneficial

Format as JSON matching this schema:
{
  "suggestions": [
    {
      "summary": "Event title",
      "description": "Detailed description",
      "type": "learning",
      "priority": "high",
      "duration": 60,
      "suggestedTime": "morning",
      "reasoning": "Why this helps career growth"
    }
  ]
}`;

    const result = await ai.generate({
      model: 'gemini-2.5-flash-lite',
      prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      output: {
        schema: eventSuggestionSchema,
      },
    });

    return result.output?.suggestions || [];
  } catch (error) {
    console.error('Error generating event suggestions:', error);
    return getFallbackSuggestions(userProfile);
  }
}

/**
 * Analyze calendar and provide insights
 */
export async function analyzeCalendarPatterns(
  events: CareerEvent[],
  userProfile: EnhancedUserProfile
): Promise<{
  insights: string[];
  recommendations: string[];
  productivityScore: number;
}> {
  try {
    const prompt = `Analyze this user's calendar patterns and provide insights.

User: ${userProfile.name} (${userProfile.title})
Recent Calendar Events:
${events
  .slice(0, 20)
  .map(
    (e) =>
      `- ${e.summary} (${e.type}, ${e.priority} priority, ${e.completed ? 'completed' : 'pending'})`
  )
  .join('\n')}

Provide:
1. 3-5 key insights about their productivity patterns
2. 3-5 actionable recommendations to improve efficiency
3. A productivity score from 0-100

Format as JSON:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "productivityScore": 75
}`;

    const result = await ai.generate({
      model: 'gemini-2.5-flash-lite',
      prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
      output: {
        schema: z.object({
          insights: z.array(z.string()),
          recommendations: z.array(z.string()),
          productivityScore: z.number().min(0).max(100),
        }),
      },
    });

    return (
      result.output || {
        insights: [],
        recommendations: [],
        productivityScore: 50,
      }
    );
  } catch (error) {
    console.error('Error analyzing calendar:', error);
    return {
      insights: ['Unable to analyze calendar patterns at this time.'],
      recommendations: [
        'Keep your calendar organized and up to date.',
        'Schedule regular learning sessions.',
        'Block time for focused work.',
      ],
      productivityScore: 50,
    };
  }
}

/**
 * Get smart time slot suggestions for a new event
 */
export async function suggestTimeSlots(
  duration: number, // in minutes
  events: CareerEvent[],
  preferences: {
    preferredTimes?: ('morning' | 'afternoon' | 'evening')[];
    avoidWeekends?: boolean;
  } = {}
): Promise<Array<{ start: Date; end: Date; score: number }>> {
  const suggestions: Array<{ start: Date; end: Date; score: number }> = [];
  const now = new Date();

  // Look ahead 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);

    // Skip weekends if preferred
    if (preferences.avoidWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }

    // Check morning (9 AM - 12 PM)
    if (!preferences.preferredTimes || preferences.preferredTimes.includes('morning')) {
      const morningSlot = findFreeSlot(date, 9, 12, duration, events);
      if (morningSlot) {
        suggestions.push({ ...morningSlot, score: 90 });
      }
    }

    // Check afternoon (1 PM - 5 PM)
    if (!preferences.preferredTimes || preferences.preferredTimes.includes('afternoon')) {
      const afternoonSlot = findFreeSlot(date, 13, 17, duration, events);
      if (afternoonSlot) {
        suggestions.push({ ...afternoonSlot, score: 80 });
      }
    }

    // Check evening (6 PM - 9 PM)
    if (!preferences.preferredTimes || preferences.preferredTimes.includes('evening')) {
      const eveningSlot = findFreeSlot(date, 18, 21, duration, events);
      if (eveningSlot) {
        suggestions.push({ ...eveningSlot, score: 70 });
      }
    }
  }

  // Sort by score (descending)
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Find a free time slot on a given day
 */
function findFreeSlot(
  date: Date,
  startHour: number,
  endHour: number,
  durationMinutes: number,
  events: CareerEvent[]
): { start: Date; end: Date } | null {
  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, 0, 0, 0);

  // Get events for this day
  const dayEvents = events.filter((e) => {
    const eventDate = new Date(e.start.dateTime);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  // Sort by start time
  dayEvents.sort(
    (a, b) =>
      new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
  );

  // Find gap
  let currentTime = dayStart;

  for (const event of dayEvents) {
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);

    // Check if there's enough time before this event
    const gap = eventStart.getTime() - currentTime.getTime();
    if (gap >= durationMinutes * 60 * 1000) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
      return { start: new Date(currentTime), end: slotEnd };
    }

    currentTime = eventEnd;
  }

  // Check if there's time after the last event
  const remainingTime = dayEnd.getTime() - currentTime.getTime();
  if (remainingTime >= durationMinutes * 60 * 1000) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
    return { start: new Date(currentTime), end: slotEnd };
  }

  return null;
}

/**
 * Fallback suggestions when AI is unavailable
 */
function getFallbackSuggestions(userProfile: EnhancedUserProfile): EventSuggestion[] {
  const suggestions: EventSuggestion[] = [
    {
      summary: 'Daily Skill Practice',
      description: `Practice ${(userProfile.skills || []).slice(0, 2).map((s) => s.name).join(' and ')} for 30 minutes`,
      type: 'learning',
      priority: 'high',
      duration: 30,
      suggestedTime: 'morning',
      reasoning: 'Consistent daily practice builds expertise over time',
    },
    {
      summary: 'Interview Preparation Session',
      description: 'Practice common interview questions for your role',
      type: 'interview',
      priority: 'high',
      duration: 60,
      suggestedTime: 'afternoon',
      reasoning: 'Regular interview prep keeps you market-ready',
    },
    {
      summary: 'Networking Coffee Chat',
      description: 'Reach out to someone in your industry for a virtual coffee',
      type: 'networking',
      priority: 'medium',
      duration: 30,
      suggestedTime: 'afternoon',
      reasoning: 'Building professional relationships opens opportunities',
    },
    {
      summary: 'Career Goal Review',
      description: 'Review and update your career goals and progress',
      type: 'task',
      priority: 'medium',
      duration: 45,
      suggestedTime: 'evening',
      reasoning: 'Regular reflection keeps you aligned with your objectives',
    },
    {
      summary: 'Learn New Technology',
      description: 'Explore a trending technology in your field',
      type: 'learning',
      priority: 'medium',
      duration: 90,
      suggestedTime: 'morning',
      reasoning: 'Staying current with technology trends is crucial',
    },
  ];

  return suggestions;
}

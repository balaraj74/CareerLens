/**
 * AI Scheduling Suggestions Flow
 * Analyzes user habits and suggests optimal times for events
 */

'use server';

import { ai } from '@/ai/genkit';
import {
  SchedulingSuggestionInputSchema,
  SchedulingSuggestionOutputSchema,
  type SchedulingSuggestionInput,
  type SchedulingSuggestionOutput,
} from '@/ai/schemas/scheduling-suggestions';

export async function getSchedulingSuggestions(
  input: SchedulingSuggestionInput
): Promise<SchedulingSuggestionOutput> {
  return schedulingSuggestionsFlow(input);
}

const systemPrompt = `You are an intelligent scheduling assistant that analyzes user habits and calendar patterns to suggest optimal times for new events.

CONTEXT:
- Event to schedule: "{{eventSummary}}" ({{description}})
- Category: {{category}}
- Duration: {{duration}} minutes
- Priority: {{priority}}
- Current date/time: {{currentDateTime}}
- User timezone: {{userTimeZone}}

USER HABITS:
{{userHabits}}

AVAILABLE TIME SLOTS:
{{freeSlots}}

EXISTING EVENTS THIS WEEK:
{{existingEvents}}

YOUR TASK:
Analyze the user's habits, existing schedule, and available slots to recommend the top 3 best times for this event.

SCORING CRITERIA (each 0-100):

1. **Matches User Habits (25%)**: 
   - Does it align with user's preferred working hours?
   - Is it during their peak productivity hours?
   - Does it match typical day/time for this category?

2. **Optimal Time of Day (25%)**:
   - Learning/Interview Prep: Best in morning when fresh (9-11am) or afternoon (2-4pm)
   - Networking: Lunch hours (12-1pm) or after work (5-6pm)
   - Meetings: Mid-morning (10-11am) or mid-afternoon (2-3pm)
   - Deadlines: End of day to force completion
   - Deep work: Morning blocks (9am-12pm)

3. **No Conflicts (20%)**:
   - No back-to-back events (15min buffer ideal)
   - Not too many events same day
   - Lunch break protected (12-1pm)

4. **Energy Level (15%)**:
   - Cognitively demanding (learning, interview): When fresh
   - Social (networking): When energized but relaxed
   - Admin tasks: Low-energy periods fine

5. **Balances Schedule (15%)**:
   - Spreads events across days
   - Doesn't overload any single day
   - Maintains variety (don't cluster same category)

REASONING:
Provide clear, actionable reasoning for each suggestion. Example:
"9:00-10:00 AM Monday is optimal because it's during your peak productivity hours (9-11am), you typically do learning sessions in the morning, and you have no other events that day yet, allowing for a focused start."

WARNINGS & TIPS:
- Warn if user's schedule is very full
- Suggest breaks if too many consecutive events
- Recommend better days if all slots are suboptimal
- Tip about related preparation or follow-up

OUTPUT:
- Return exactly 3 time slot suggestions, ranked by total score
- Each with detailed factor breakdown and reasoning
- Include overall reasoning about the schedule patterns
- Add warnings/tips if needed`;

const schedulingSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiSchedulingSuggestions',
    inputSchema: SchedulingSuggestionInputSchema,
    outputSchema: SchedulingSuggestionOutputSchema,
  },
  async (input) => {
    // Format user habits for the prompt
    const habitsText = `
- Preferred hours: ${input.userHabits.preferredStartTime} - ${input.userHabits.preferredEndTime}
- Peak productivity: Hours ${input.userHabits.peakProductivityHours?.join(', ') || 'Not specified'}
- Common categories: ${input.userHabits.commonCategories?.join(', ') || 'Various'}
- Average session: ${input.userHabits.averageSessionDuration || 60} minutes
`;

    // Format free slots
    const slotsText = input.freeSlots.map((slot, i) => 
      `${i + 1}. ${slot.start} - ${slot.end} (${slot.durationMinutes} min available)`
    ).join('\n');

    // Format existing events
    const eventsText = input.existingEvents.length > 0 
      ? input.existingEvents.map(e => 
          `- ${new Date(e.start).toLocaleString()}: ${e.summary} (${e.category})`
        ).join('\n')
      : 'No existing events this week';

    const prompt = systemPrompt
      .replace('{{eventSummary}}', input.eventSummary)
      .replace('{{description}}', input.eventDescription || 'No description')
      .replace('{{category}}', input.category)
      .replace('{{duration}}', input.duration.toString())
      .replace('{{priority}}', input.priority)
      .replace('{{currentDateTime}}', input.currentDateTime)
      .replace('{{userTimeZone}}', input.userTimeZone)
      .replace('{{userHabits}}', habitsText)
      .replace('{{freeSlots}}', slotsText)
      .replace('{{existingEvents}}', eventsText);

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: {
        schema: SchedulingSuggestionOutputSchema,
      },
      config: {
        temperature: 0.7, // Moderate creativity for suggestions
      },
    });

    return output as SchedulingSuggestionOutput;
  }
);

// Helper to analyze user habits from historical events
export function analyzeUserHabits(events: Array<{
  start: string;
  end: string;
  category: string;
}>): {
  preferredStartTime: string;
  preferredEndTime: string;
  peakProductivityHours: number[];
  commonCategories: string[];
  averageSessionDuration: number;
  preferredDaysForCategory: Record<string, number[]>;
} {
  if (events.length === 0) {
    return {
      preferredStartTime: '09:00',
      preferredEndTime: '17:00',
      peakProductivityHours: [9, 10, 14, 15],
      commonCategories: [],
      averageSessionDuration: 60,
      preferredDaysForCategory: {},
    };
  }

  const startHours: number[] = [];
  const endHours: number[] = [];
  const durations: number[] = [];
  const categories: string[] = [];
  const hourCounts: Record<number, number> = {};
  const categoryDays: Record<string, number[]> = {};

  events.forEach(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours();
    const endHour = end.getHours();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    const day = start.getDay();

    startHours.push(startHour);
    endHours.push(endHour);
    durations.push(duration);
    categories.push(event.category);

    hourCounts[startHour] = (hourCounts[startHour] || 0) + 1;

    if (!categoryDays[event.category]) {
      categoryDays[event.category] = [];
    }
    if (!categoryDays[event.category].includes(day)) {
      categoryDays[event.category].push(day);
    }
  });

  // Calculate averages
  const avgStartHour = Math.round(startHours.reduce((a, b) => a + b, 0) / startHours.length);
  const avgEndHour = Math.round(endHours.reduce((a, b) => a + b, 0) / endHours.length);
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

  // Find peak hours (top 4)
  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([hour]) => parseInt(hour));

  // Find most common categories (top 3)
  const categoryCount: Record<string, number> = {};
  categories.forEach(cat => {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  return {
    preferredStartTime: `${avgStartHour.toString().padStart(2, '0')}:00`,
    preferredEndTime: `${avgEndHour.toString().padStart(2, '0')}:00`,
    peakProductivityHours: peakHours.sort((a, b) => a - b),
    commonCategories: topCategories,
    averageSessionDuration: avgDuration,
    preferredDaysForCategory: categoryDays,
  };
}

// Helper to find free slots in a date range
export function findFreeSlots(
  startDate: Date,
  endDate: Date,
  existingEvents: Array<{ start: string; end: string }>,
  minSlotDuration: number = 30, // minutes
  workingHours: { start: number; end: number } = { start: 9, end: 17 }
): Array<{ start: string; end: string; durationMinutes: number }> {
  const freeSlots: Array<{ start: string; end: string; durationMinutes: number }> = [];
  
  // Sort existing events by start time
  const sortedEvents = [...existingEvents].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Skip weekends (optional - can be configured)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Start of working hours for this day
    const dayStart = new Date(currentDate);
    dayStart.setHours(workingHours.start, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(workingHours.end, 0, 0, 0);

    // Get events for this day
    const dayEvents = sortedEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.toDateString() === currentDate.toDateString();
    });

    let slotStart = dayStart;

    // Check gaps between events
    for (const event of dayEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // If there's a gap before this event
      if (eventStart > slotStart) {
        const duration = (eventStart.getTime() - slotStart.getTime()) / (1000 * 60);
        if (duration >= minSlotDuration) {
          freeSlots.push({
            start: slotStart.toISOString(),
            end: eventStart.toISOString(),
            durationMinutes: Math.floor(duration),
          });
        }
      }

      // Move slot start to after this event
      slotStart = eventEnd > slotStart ? eventEnd : slotStart;
    }

    // Check if there's time at the end of the day
    if (slotStart < dayEnd) {
      const duration = (dayEnd.getTime() - slotStart.getTime()) / (1000 * 60);
      if (duration >= minSlotDuration) {
        freeSlots.push({
          start: slotStart.toISOString(),
          end: dayEnd.toISOString(),
          durationMinutes: Math.floor(duration),
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return freeSlots;
}

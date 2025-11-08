/**
 * Enhanced Calendar Service
 * High-level service layer that integrates all calendar features
 */

'use server';

import { parseNaturalLanguageEvent, resolveRelativeDate, calculateEndDate } from '@/ai/flows/calendar-parser';
import { getSchedulingSuggestions, analyzeUserHabits, findFreeSlots } from '@/ai/flows/scheduling-suggestions';
import { generateRecurringInstances, formatRecurrenceText } from './recurring-events';
import type { 
  EnhancedCalendarEvent, 
  EventCategory, 
  EventPriority,
  RecurrencePattern,
  Reminder,
  CalendarStats,
  EventFilters,
  getDefaultReminders,
} from './calendar-types';

// Helper function to get default reminders (non-server action)
function getEventDefaultReminders(category: EventCategory): Reminder[] {
  const reminderMap: Record<EventCategory, Reminder[]> = {
    interview: [
      { id: '1', type: 'push', minutesBefore: 60, sent: false },
      { id: '2', type: 'push', minutesBefore: 5, sent: false },
    ],
    deadline: [
      { id: '1', type: 'push', minutesBefore: 1440, sent: false }, // 1 day
      { id: '2', type: 'push', minutesBefore: 60, sent: false },
      { id: '3', type: 'push', minutesBefore: 5, sent: false },
    ],
    learning: [
      { id: '1', type: 'push', minutesBefore: 5, sent: false },
    ],
    networking: [
      { id: '1', type: 'push', minutesBefore: 30, sent: false },
      { id: '2', type: 'push', minutesBefore: 5, sent: false },
    ],
    meeting: [
      { id: '1', type: 'push', minutesBefore: 5, sent: false },
    ],
    task: [
      { id: '1', type: 'push', minutesBefore: 5, sent: false },
    ],
    personal: [
      { id: '1', type: 'push', minutesBefore: 15, sent: false },
    ],
    career: [
      { id: '1', type: 'push', minutesBefore: 5, sent: false },
    ],
    project: [
      { id: '1', type: 'push', minutesBefore: 5, sent: false },
    ],
  };

  return reminderMap[category] || [{ id: '1', type: 'push', minutesBefore: 5, sent: false }];
}

/**
 * Create event from natural language input
 */
export async function createEventFromNaturalLanguage(
  userInput: string,
  userId: string,
  userTimeZone: string = 'UTC'
): Promise<{
  event: EnhancedCalendarEvent | null;
  ambiguities: string[];
  confidence: number;
}> {
  try {
    // Parse natural language
    const parsed = await parseNaturalLanguageEvent({
      userInput,
      currentDateTime: new Date().toISOString(),
      userTimeZone,
    });

    // Check confidence
    if (parsed.confidence < 50) {
      return {
        event: null,
        ambiguities: parsed.ambiguities || ['Input too unclear to parse'],
        confidence: parsed.confidence,
      };
    }

    // Resolve dates
    const startDate = resolveRelativeDate(parsed);
    if (!startDate) {
      return {
        event: null,
        ambiguities: ['Could not determine event date'],
        confidence: parsed.confidence,
      };
    }

    const endDate = calculateEndDate(startDate, parsed.duration);
    const category = parsed.category || 'task';

    // Convert parsed recurrence to proper RecurrencePattern
    let recurrence: RecurrencePattern | undefined;
    if (parsed.recurrence) {
      recurrence = {
        ...parsed.recurrence,
        endDate: parsed.recurrence.endDate ? new Date(parsed.recurrence.endDate) : undefined,
      };
    }

    // Create event object
    const event: EnhancedCalendarEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      summary: parsed.summary,
      description: parsed.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: userTimeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: userTimeZone,
      },
      category,
      priority: parsed.priority || 'medium',
      status: 'confirmed',
      isRecurring: !!recurrence && recurrence.frequency !== 'none',
      recurrence,
      reminders: getEventDefaultReminders(category),
      aiSuggested: true,
      aiReasoning: `Created from natural language: "${userInput}"`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      location: parsed.location,
      attendees: parsed.attendees?.map(email => ({
        id: email,
        email,
        rsvpStatus: 'pending',
      })),
    };

    return {
      event,
      ambiguities: parsed.ambiguities || [],
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error('Failed to create event from natural language:', error);
    return {
      event: null,
      ambiguities: ['Failed to parse input'],
      confidence: 0,
    };
  }
}

/**
 * Get AI-suggested optimal times for an event
 */
export async function suggestOptimalTimes(
  eventSummary: string,
  eventDescription: string | undefined,
  category: EventCategory,
  duration: number,
  priority: EventPriority,
  existingEvents: EnhancedCalendarEvent[],
  userTimeZone: string = 'UTC'
): Promise<{
  suggestions: Array<{
    start: Date;
    end: Date;
    score: number;
    reasoning: string;
  }>;
  overallReasoning: string;
  warnings: string[];
}> {
  try {
    // Analyze user habits
    const habits = analyzeUserHabits(
      existingEvents.map(e => ({
        start: e.start.dateTime,
        end: e.end.dateTime,
        category: e.category,
      }))
    );

    // Find free slots for next 7 days
    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const freeSlots = findFreeSlots(
      startDate,
      endDate,
      existingEvents.map(e => ({
        start: e.start.dateTime,
        end: e.end.dateTime,
      })),
      duration
    );

    // Get AI suggestions
    const result = await getSchedulingSuggestions({
      eventSummary,
      eventDescription,
      category,
      duration,
      priority,
      userHabits: habits,
      freeSlots,
      existingEvents: existingEvents.slice(0, 20).map(e => ({
        id: e.id,
        summary: e.summary,
        start: e.start.dateTime,
        end: e.end.dateTime,
        category: e.category,
      })),
      currentDateTime: new Date().toISOString(),
      userTimeZone,
    });

    return {
      suggestions: result.recommendedSlots.map(slot => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
        score: slot.score,
        reasoning: slot.reasoning,
      })),
      overallReasoning: result.overallReasoning,
      warnings: result.warnings || [],
    };
  } catch (error) {
    console.error('Failed to get scheduling suggestions:', error);
    return {
      suggestions: [],
      overallReasoning: 'Failed to generate suggestions',
      warnings: ['An error occurred while analyzing your schedule'],
    };
  }
}

/**
 * Create recurring event instances
 */
export function createRecurringEvent(
  baseEvent: EnhancedCalendarEvent
): EnhancedCalendarEvent[] {
  if (!baseEvent.recurrence || baseEvent.recurrence.frequency === 'none') {
    return [baseEvent];
  }

  return generateRecurringInstances(baseEvent, baseEvent.recurrence);
}

/**
 * Calculate calendar statistics
 */
export function calculateCalendarStats(
  events: EnhancedCalendarEvent[]
): CalendarStats {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const stats: CalendarStats = {
    totalEvents: events.length,
    completedEvents: events.filter(e => e.completed).length,
    upcomingEvents: events.filter(
      e => new Date(e.start.dateTime) > now && e.status !== 'cancelled'
    ).length,
    overdueEvents: events.filter(
      e =>
        new Date(e.end.dateTime) < now &&
        !e.completed &&
        e.status !== 'cancelled'
    ).length,
    todayEvents: events.filter(e => {
      const eventDate = new Date(e.start.dateTime);
      return eventDate >= todayStart && eventDate <= todayEnd;
    }).length,
    thisWeekEvents: events.filter(e => {
      const eventDate = new Date(e.start.dateTime);
      return eventDate >= weekStart && eventDate <= weekEnd;
    }).length,
    currentStreak: 0,
    longestStreak: 0,
    productivityScore: 0,
    eventsByCategory: {} as Record<EventCategory, number>,
    eventsByPriority: {
      high: 0,
      medium: 0,
      low: 0,
    },
    completionRate: 0,
    averageEventsPerDay: 0,
  };

  // Count by category
  events.forEach(event => {
    stats.eventsByCategory[event.category] =
      (stats.eventsByCategory[event.category] || 0) + 1;
    stats.eventsByPriority[event.priority]++;
  });

  // Calculate completion rate
  const completableEvents = events.filter(
    e => new Date(e.end.dateTime) < now && e.status !== 'cancelled'
  );
  if (completableEvents.length > 0) {
    stats.completionRate = Math.round(
      (stats.completedEvents / completableEvents.length) * 100
    );
  }

  // Calculate streaks
  const eventDates = new Set(
    events.map(e => new Date(e.start.dateTime).toDateString())
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();

    if (eventDates.has(dateString)) {
      tempStreak++;
      if (i === 0 || currentStreak > 0) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === 0) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  stats.currentStreak = currentStreak;
  stats.longestStreak = longestStreak;

  // Calculate productivity score (0-100)
  const factors = {
    completionRate: stats.completionRate * 0.4,
    streakBonus: Math.min(currentStreak * 5, 20),
    upcomingPlanning: Math.min((stats.upcomingEvents / 10) * 20, 20),
    consistency: Math.min((stats.averageEventsPerDay / 3) * 20, 20),
  };

  stats.productivityScore = Math.round(
    factors.completionRate +
      factors.streakBonus +
      factors.upcomingPlanning +
      factors.consistency
  );

  // Average events per day (last 30 days)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEvents = events.filter(
    e => new Date(e.start.dateTime) >= thirtyDaysAgo
  );
  stats.averageEventsPerDay = Math.round((recentEvents.length / 30) * 10) / 10;

  return stats;
}

/**
 * Filter events
 */
export function filterEvents(
  events: EnhancedCalendarEvent[],
  filters: EventFilters
): EnhancedCalendarEvent[] {
  return events.filter(event => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(event.category)) return false;
    }

    // Priority filter
    if (filters.priorities && filters.priorities.length > 0) {
      if (!filters.priorities.includes(event.priority)) return false;
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(event.status)) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const eventDate = new Date(event.start.dateTime);
      if (
        eventDate < filters.dateRange.start ||
        eventDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = `${event.summary} ${event.description} ${event.location}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }

    // Show completed filter
    if (filters.showCompleted === false && event.completed) {
      return false;
    }

    // Show cancelled filter
    if (filters.showCancelled === false && event.status === 'cancelled') {
      return false;
    }

    // AI suggested only filter
    if (filters.aiSuggestedOnly === true && !event.aiSuggested) {
      return false;
    }

    return true;
  });
}

/**
 * Sort events
 */
export function sortEvents(
  events: EnhancedCalendarEvent[],
  sortBy: 'start-asc' | 'start-desc' | 'priority' | 'category' | 'created'
): EnhancedCalendarEvent[] {
  const sorted = [...events];

  switch (sortBy) {
    case 'start-asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.start.dateTime).getTime() -
          new Date(b.start.dateTime).getTime()
      );

    case 'start-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.start.dateTime).getTime() -
          new Date(a.start.dateTime).getTime()
      );

    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return sorted.sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );

    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));

    case 'created':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    default:
      return sorted;
  }
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(
  events: EnhancedCalendarEvent[],
  date: Date
): EnhancedCalendarEvent[] {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  return events.filter(event => {
    const eventDate = new Date(event.start.dateTime);
    return eventDate >= targetDate && eventDate < nextDate;
  });
}

/**
 * Get upcoming events (next N days)
 */
export function getUpcomingEvents(
  events: EnhancedCalendarEvent[],
  days: number = 7
): EnhancedCalendarEvent[] {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  return events
    .filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return (
        eventDate > now &&
        eventDate <= futureDate &&
        event.status !== 'cancelled'
      );
    })
    .sort(
      (a, b) =>
        new Date(a.start.dateTime).getTime() -
        new Date(b.start.dateTime).getTime()
    );
}

/**
 * Check for event conflicts
 */
export function findEventConflicts(
  newEvent: { start: string; end: string },
  existingEvents: EnhancedCalendarEvent[]
): EnhancedCalendarEvent[] {
  const newStart = new Date(newEvent.start);
  const newEnd = new Date(newEvent.end);

  return existingEvents.filter(event => {
    if (event.status === 'cancelled') return false;

    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);

    // Check for overlap
    return (
      (newStart >= eventStart && newStart < eventEnd) ||
      (newEnd > eventStart && newEnd <= eventEnd) ||
      (newStart <= eventStart && newEnd >= eventEnd)
    );
  });
}

/**
 * Get event duration in minutes
 */
export function getEventDuration(event: EnhancedCalendarEvent): number {
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Format event time range
 */
export function formatEventTimeRange(event: EnhancedCalendarEvent): string {
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);

  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  if (event.allDay) {
    return 'All day';
  }

  return `${start.toLocaleTimeString('en-US', timeFormat)} - ${end.toLocaleTimeString('en-US', timeFormat)}`;
}

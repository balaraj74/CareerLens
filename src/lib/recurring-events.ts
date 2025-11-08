/**
 * Recurring Events Utility
 * Handles creation and management of recurring calendar events
 */

import type {
  EnhancedCalendarEvent,
  RecurrencePattern,
  RecurrenceFrequency,
} from './calendar-types';

/**
 * Generate recurring event instances from a pattern
 */
export function generateRecurringInstances(
  baseEvent: EnhancedCalendarEvent,
  pattern: RecurrencePattern,
  maxInstances: number = 52 // Default to 1 year of weekly events
): EnhancedCalendarEvent[] {
  if (pattern.frequency === 'none' || !pattern.interval) {
    return [baseEvent];
  }

  const instances: EnhancedCalendarEvent[] = [];
  const startDate = new Date(baseEvent.start.dateTime);
  const eventDuration =
    new Date(baseEvent.end.dateTime).getTime() - startDate.getTime();

  let currentDate = new Date(startDate);
  let count = 0;

  // Determine when to stop generating instances
  const shouldContinue = (date: Date, count: number): boolean => {
    if (pattern.occurrences && count >= pattern.occurrences) {
      return false;
    }
    if (pattern.endDate && date > new Date(pattern.endDate)) {
      return false;
    }
    if (count >= maxInstances) {
      return false;
    }
    return true;
  };

  while (shouldContinue(currentDate, count)) {
    // Check if this date matches the pattern
    if (shouldIncludeDate(currentDate, pattern, count === 0)) {
      const instanceStart = new Date(currentDate);
      const instanceEnd = new Date(currentDate.getTime() + eventDuration);

      instances.push({
        ...baseEvent,
        id: `${baseEvent.id}-instance-${count}`,
        parentEventId: baseEvent.id,
        start: {
          dateTime: instanceStart.toISOString(),
          timeZone: baseEvent.start.timeZone,
        },
        end: {
          dateTime: instanceEnd.toISOString(),
          timeZone: baseEvent.end.timeZone,
        },
      });

      count++;
    }

    // Advance to next potential date
    currentDate = getNextDate(currentDate, pattern);
  }

  return instances;
}

/**
 * Check if a date should be included based on recurrence pattern
 */
function shouldIncludeDate(
  date: Date,
  pattern: RecurrencePattern,
  isFirst: boolean
): boolean {
  // Always include the first instance
  if (isFirst) {
    return true;
  }

  // For weekly recurrence, check if day of week matches
  if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
    const dayOfWeek = date.getDay();
    return pattern.daysOfWeek.includes(dayOfWeek);
  }

  // For monthly recurrence, check if day of month matches
  if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
    return date.getDate() === pattern.dayOfMonth;
  }

  // For daily and yearly, include by default
  return true;
}

/**
 * Get the next date based on recurrence pattern
 */
function getNextDate(
  currentDate: Date,
  pattern: RecurrencePattern
): Date {
  const nextDate = new Date(currentDate);

  switch (pattern.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + pattern.interval);
      break;

    case 'weekly':
      // If specific days are set, find next matching day
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const currentDay = nextDate.getDay();
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        
        // Find next day in the same week
        let found = false;
        for (const day of sortedDays) {
          if (day > currentDay) {
            nextDate.setDate(nextDate.getDate() + (day - currentDay));
            found = true;
            break;
          }
        }
        
        // If not found, go to first day of next interval week
        if (!found) {
          const daysUntilNextWeek = (7 - currentDay) + sortedDays[0] + (7 * (pattern.interval - 1));
          nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
        }
      } else {
        // No specific days, just advance by interval weeks
        nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
      }
      break;

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + pattern.interval);
      // Handle day overflow (e.g., Jan 31 -> Feb 28)
      if (pattern.dayOfMonth) {
        const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(pattern.dayOfMonth, lastDay));
      }
      break;

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
      break;

    default:
      // If unknown frequency, just return same date to end loop
      break;
  }

  return nextDate;
}

/**
 * Update all instances of a recurring event
 */
export function updateRecurringInstances(
  events: EnhancedCalendarEvent[],
  parentEventId: string,
  updates: Partial<EnhancedCalendarEvent>,
  updateMode: 'this' | 'following' | 'all'
): EnhancedCalendarEvent[] {
  return events.map(event => {
    // Not part of this recurring series
    if (event.parentEventId !== parentEventId && event.id !== parentEventId) {
      return event;
    }

    const eventDate = new Date(event.start.dateTime);
    const shouldUpdate = (() => {
      switch (updateMode) {
        case 'this':
          return event.id === parentEventId;
        case 'all':
          return true;
        case 'following':
          // Would need to track which instance triggered the update
          // For simplicity, update all for now
          return true;
        default:
          return false;
      }
    })();

    if (shouldUpdate) {
      return { ...event, ...updates };
    }

    return event;
  });
}

/**
 * Delete instances of a recurring event
 */
export function deleteRecurringInstances(
  events: EnhancedCalendarEvent[],
  parentEventId: string,
  deleteMode: 'this' | 'following' | 'all'
): EnhancedCalendarEvent[] {
  return events.filter(event => {
    // Keep if not part of this series
    if (event.parentEventId !== parentEventId && event.id !== parentEventId) {
      return true;
    }

    switch (deleteMode) {
      case 'this':
        return event.id !== parentEventId;
      case 'all':
        return false;
      case 'following':
        // Would need to compare dates
        return false;
      default:
        return true;
    }
  });
}

/**
 * Format recurrence pattern as human-readable text
 */
export function formatRecurrenceText(pattern: RecurrencePattern): string {
  if (pattern.frequency === 'none') {
    return 'Does not repeat';
  }

  let text = '';

  // Frequency and interval
  if (pattern.interval === 1) {
    text = pattern.frequency.charAt(0).toUpperCase() + pattern.frequency.slice(1);
  } else {
    const unit = pattern.frequency === 'daily' ? 'days' : 
                 pattern.frequency === 'weekly' ? 'weeks' :
                 pattern.frequency === 'monthly' ? 'months' : 'years';
    text = `Every ${pattern.interval} ${unit}`;
  }

  // Days of week for weekly
  if (pattern.frequency === 'weekly' && pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = pattern.daysOfWeek.map(d => dayNames[d]).join(', ');
    text += ` on ${days}`;
  }

  // Day of month for monthly
  if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
    text += ` on day ${pattern.dayOfMonth}`;
  }

  // End date or occurrences
  if (pattern.endDate) {
    const endDate = new Date(pattern.endDate);
    text += `, until ${endDate.toLocaleDateString()}`;
  } else if (pattern.occurrences) {
    text += `, ${pattern.occurrences} times`;
  }

  return text;
}

/**
 * Parse RRULE string (RFC 5545) to RecurrencePattern
 * Example: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=20251231T235959Z"
 */
export function parseRRule(rrule: string): RecurrencePattern | null {
  try {
    const parts = rrule.split(';');
    const pattern: Partial<RecurrencePattern> = {
      interval: 1,
      frequency: 'none',
    };

    for (const part of parts) {
      const [key, value] = part.split('=');

      switch (key) {
        case 'FREQ':
          pattern.frequency = value.toLowerCase() as RecurrenceFrequency;
          break;
        case 'INTERVAL':
          pattern.interval = parseInt(value, 10);
          break;
        case 'UNTIL':
          pattern.endDate = new Date(value);
          break;
        case 'COUNT':
          pattern.occurrences = parseInt(value, 10);
          break;
        case 'BYDAY':
          const dayMap: Record<string, number> = {
            SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
          };
          pattern.daysOfWeek = value.split(',').map(d => dayMap[d]).filter(d => d !== undefined);
          break;
        case 'BYMONTHDAY':
          pattern.dayOfMonth = parseInt(value, 10);
          break;
      }
    }

    return pattern as RecurrencePattern;
  } catch (error) {
    console.error('Failed to parse RRULE:', error);
    return null;
  }
}

/**
 * Convert RecurrencePattern to RRULE string
 */
export function toRRule(pattern: RecurrencePattern): string {
  if (pattern.frequency === 'none') {
    return '';
  }

  const parts: string[] = [];
  parts.push(`FREQ=${pattern.frequency.toUpperCase()}`);
  
  if (pattern.interval && pattern.interval > 1) {
    parts.push(`INTERVAL=${pattern.interval}`);
  }

  if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const days = pattern.daysOfWeek.map(d => dayMap[d]).join(',');
    parts.push(`BYDAY=${days}`);
  }

  if (pattern.dayOfMonth) {
    parts.push(`BYMONTHDAY=${pattern.dayOfMonth}`);
  }

  if (pattern.endDate) {
    const endDate = new Date(pattern.endDate);
    parts.push(`UNTIL=${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
  } else if (pattern.occurrences) {
    parts.push(`COUNT=${pattern.occurrences}`);
  }

  return parts.join(';');
}

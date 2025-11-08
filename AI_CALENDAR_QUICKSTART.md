# 🚀 AI Calendar - Quick Start Guide

## For Developers

### 1. Import the Services

```typescript
// Natural Language Parsing
import { createEventFromNaturalLanguage } from '@/lib/calendar-service';

// AI Scheduling
import { suggestOptimalTimes } from '@/lib/calendar-service';

// Recurring Events
import { createRecurringEvent, formatRecurrenceText } from '@/lib/calendar-service';
import { generateRecurringInstances } from '@/lib/recurring-events';

// Notifications
import { 
  initializeNotificationSystem,
  notificationQueue,
  inAppNotifications 
} from '@/lib/notifications';

// Stats & Utilities
import { 
  calculateCalendarStats,
  filterEvents,
  sortEvents,
  findEventConflicts 
} from '@/lib/calendar-service';

// Types
import type { 
  EnhancedCalendarEvent,
  EventCategory,
  RecurrencePattern 
} from '@/lib/calendar-types';
```

### 2. Setup (One-time in your app)

```typescript
// In your main layout or calendar page useEffect
useEffect(() => {
  // Request notification permissions
  initializeNotificationSystem();
}, []);
```

### 3. Create Event from User Input

```typescript
'use client';

import { useState } from 'react';
import { createEventFromNaturalLanguage } from '@/lib/calendar-service';

export function QuickAddEvent() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createEventFromNaturalLanguage(
      input,
      user.uid,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    if (result.event) {
      // Success! Add to your events state
      setEvents(prev => [...prev, result.event]);
      toast({
        title: 'Event created!',
        description: result.event.summary,
      });
      setInput('');
    } else {
      // Show ambiguities to user
      toast({
        title: 'Need more details',
        description: result.ambiguities.join(', '),
        variant: 'warning',
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g., Interview tomorrow at 2pm"
        className="..."
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Add Event'}
      </button>
    </form>
  );
}
```

### 4. Show AI Scheduling Suggestions

```typescript
'use client';

import { useState } from 'react';
import { suggestOptimalTimes } from '@/lib/calendar-service';

export function SmartSchedule({ events }: { events: EnhancedCalendarEvent[] }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    
    const result = await suggestOptimalTimes(
      'Learning Session',
      'Study new framework',
      'learning',
      90, // 90 minutes
      'medium',
      events,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    setSuggestions(result.suggestions);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={getSuggestions}>
        ✨ Get AI Suggestions
      </button>

      {loading && <p>Analyzing your schedule...</p>}

      {suggestions.map((slot, i) => (
        <div key={i} className="suggestion-card">
          <div className="score">{slot.score}/100</div>
          <div className="time">
            {new Date(slot.start).toLocaleString()}
          </div>
          <p className="reasoning">{slot.reasoning}</p>
          <button onClick={() => createEventAtTime(slot.start, slot.end)}>
            Schedule Here
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 5. Handle Recurring Events

```typescript
'use client';

import { createRecurringEvent } from '@/lib/calendar-service';

export function CreateRecurringEvent() {
  const handleCreateRecurring = () => {
    const baseEvent: EnhancedCalendarEvent = {
      id: 'temp-id',
      summary: 'Team Standup',
      category: 'meeting',
      priority: 'high',
      status: 'confirmed',
      isRecurring: true,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        occurrences: 20, // 4 weeks
      },
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeZone: 'UTC',
      },
      reminders: [
        { id: '1', type: 'push', minutesBefore: 5, sent: false }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
    };

    const instances = createRecurringEvent(baseEvent);
    
    // Add all instances to your calendar
    setEvents(prev => [...prev, ...instances]);
    
    toast({
      title: 'Recurring event created',
      description: `${instances.length} instances added`,
    });
  };

  return (
    <button onClick={handleCreateRecurring}>
      Create Recurring Event
    </button>
  );
}
```

### 6. Schedule Notifications

```typescript
'use client';

import { useEffect } from 'react';
import { notificationQueue } from '@/lib/notifications';

export function CalendarPage() {
  const [events, setEvents] = useState<EnhancedCalendarEvent[]>([]);

  useEffect(() => {
    // Schedule notifications for all events
    events.forEach(event => {
      if (event.reminders && event.reminders.length > 0) {
        notificationQueue.scheduleReminders(event);
      }
    });
  }, [events]);

  const handleAddEvent = (newEvent: EnhancedCalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
    // Notifications are auto-scheduled by the useEffect above
  };

  return (
    // Your calendar UI
  );
}
```

### 7. Display Calendar Stats

```typescript
'use client';

import { useMemo } from 'react';
import { calculateCalendarStats } from '@/lib/calendar-service';

export function CalendarStats({ events }: { events: EnhancedCalendarEvent[] }) {
  const stats = useMemo(() => calculateCalendarStats(events), [events]);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Productivity Score</h3>
        <div className="score">{stats.productivityScore}/100</div>
      </div>

      <div className="stat-card">
        <h3>Current Streak</h3>
        <div className="value">{stats.currentStreak} days</div>
      </div>

      <div className="stat-card">
        <h3>Completion Rate</h3>
        <div className="value">{stats.completionRate}%</div>
      </div>

      <div className="stat-card">
        <h3>Upcoming Events</h3>
        <div className="value">{stats.upcomingEvents}</div>
      </div>

      <div className="stat-card">
        <h3>This Week</h3>
        <div className="value">{stats.thisWeekEvents} events</div>
      </div>

      <div className="stat-card">
        <h3>Overdue</h3>
        <div className="value">{stats.overdueEvents}</div>
      </div>
    </div>
  );
}
```

### 8. Filter & Sort Events

```typescript
'use client';

import { useState, useMemo } from 'react';
import { filterEvents, sortEvents } from '@/lib/calendar-service';
import type { EventFilters } from '@/lib/calendar-types';

export function EventList({ events }: { events: EnhancedCalendarEvent[] }) {
  const [filters, setFilters] = useState<EventFilters>({
    categories: [],
    priorities: [],
    showCompleted: true,
    showCancelled: false,
  });
  const [sortBy, setSortBy] = useState<'start-asc' | 'priority'>('start-asc');

  const filteredAndSorted = useMemo(() => {
    const filtered = filterEvents(events, filters);
    return sortEvents(filtered, sortBy);
  }, [events, filters, sortBy]);

  return (
    <div>
      {/* Filter UI */}
      <div className="filters">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="start-asc">Date (Earliest)</option>
          <option value="start-desc">Date (Latest)</option>
          <option value="priority">Priority</option>
          <option value="category">Category</option>
        </select>

        {/* Category filters */}
        <button onClick={() => setFilters(f => ({ 
          ...f, 
          categories: f.categories?.includes('learning') 
            ? f.categories.filter(c => c !== 'learning')
            : [...(f.categories || []), 'learning']
        }))}>
          📚 Learning
        </button>
        {/* More category buttons... */}
      </div>

      {/* Event list */}
      {filteredAndSorted.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### 9. Check for Conflicts

```typescript
'use client';

import { findEventConflicts } from '@/lib/calendar-service';

export function EventForm({ events }: { events: EnhancedCalendarEvent[] }) {
  const [newEvent, setNewEvent] = useState({
    start: '',
    end: '',
  });

  const conflicts = useMemo(() => {
    if (newEvent.start && newEvent.end) {
      return findEventConflicts(
        { start: newEvent.start, end: newEvent.end },
        events
      );
    }
    return [];
  }, [newEvent, events]);

  return (
    <div>
      <input
        type="datetime-local"
        value={newEvent.start}
        onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
      />
      <input
        type="datetime-local"
        value={newEvent.end}
        onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
      />

      {conflicts.length > 0 && (
        <div className="warning">
          ⚠️ Conflicts with {conflicts.length} existing event(s):
          <ul>
            {conflicts.map(event => (
              <li key={event.id}>{event.summary}</li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={handleCreate}
        disabled={conflicts.length > 0}
      >
        Create Event
      </button>
    </div>
  );
}
```

---

## Common Use Cases

### Use Case 1: Quick Event Creation
**User:** "Interview tomorrow at 2pm"
**System:** Parses → Creates event → Schedules notification

### Use Case 2: Find Best Time
**User:** Wants to add 90-min learning session
**System:** Analyzes schedule → Suggests 3 optimal times with scores

### Use Case 3: Recurring Meeting
**User:** Creates "Team Standup every weekday 9:30am"
**System:** Generates 20+ instances → Schedules 20+ notifications

### Use Case 4: Smart Reminders
**System:** Auto-sends push notification 5 minutes before each event

### Use Case 5: Calendar Analytics
**User:** Views dashboard
**System:** Shows productivity score, streaks, completion rate

---

## Testing Your Integration

```typescript
// Test file: __tests__/calendar.test.ts

describe('AI Calendar Features', () => {
  test('Natural language parsing', async () => {
    const result = await createEventFromNaturalLanguage(
      "Meeting tomorrow at 3pm",
      "test-user",
      "UTC"
    );
    
    expect(result.event).toBeTruthy();
    expect(result.event?.summary).toContain('Meeting');
    expect(result.confidence).toBeGreaterThan(80);
  });

  test('AI scheduling suggestions', async () => {
    const suggestions = await suggestOptimalTimes(
      "Learning session",
      undefined,
      "learning",
      60,
      "medium",
      mockEvents,
      "UTC"
    );
    
    expect(suggestions.suggestions.length).toBe(3);
    expect(suggestions.suggestions[0].score).toBeGreaterThan(50);
  });

  test('Recurring event generation', () => {
    const instances = generateRecurringInstances(mockEvent, {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [1, 3, 5],
      occurrences: 6
    });
    
    expect(instances.length).toBe(6);
  });
});
```

---

## Environment Variables Required

```env
# .env.local

# Gemini AI (for NL parsing and scheduling)
GOOGLE_API_KEY=your_gemini_api_key

# Firebase (for user auth and data)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Optional: Google Calendar OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=...
```

---

## Performance Tips

1. **Debounce NL input**: Wait 500ms before parsing
2. **Cache AI suggestions**: 1 hour TTL
3. **Lazy load events**: Only current month by default
4. **Batch notifications**: Schedule all at once
5. **Index Firestore**: Create indexes on `start.dateTime`, `category`, `status`

---

## Troubleshooting

### "Notification permission denied"
- Users must grant permission manually
- Fallback to in-app notifications
- Show clear UI prompt

### "Low confidence score from NL parser"
- Ask user for more details
- Show parsed data for confirmation
- Offer manual form as fallback

### "AI suggestions taking too long"
- Show loading state immediately
- Implement timeout (10s)
- Cache recent suggestions

### "Recurring events not showing"
- Verify `isRecurring` flag is true
- Check `generateRecurringInstances` return
- Ensure instances added to state

---

## Next Steps

1. **Integrate into your calendar UI**
2. **Add loading/error states**
3. **Test with real users**
4. **Monitor AI API usage**
5. **Optimize performance**
6. **Add more features** (sharing, export, etc.)

---

**You're all set! 🎉** The core infrastructure is ready. Now build an amazing UI to surface these powerful features!

/**
 * Google Calendar Service
 * Handles Google Calendar API integration for events management
 */

import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{ email: string }>;
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private';
}

export interface CareerEvent extends CalendarEvent {
  type: 'learning' | 'interview' | 'networking' | 'deadline' | 'meeting' | 'task';
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  aiSuggested?: boolean;
}

class GoogleCalendarService {
  private auth: any;
  private calendar: any;

  constructor() {
    // Initialize OAuth2 client
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
      );

      this.auth = oauth2Client;
      this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    } catch (error) {
      console.error('Failed to initialize Google Calendar auth:', error);
    }
  }

  /**
   * Set OAuth2 credentials
   */
  setCredentials(tokens: { access_token: string; refresh_token?: string }) {
    if (this.auth) {
      this.auth.setCredentials(tokens);
    }
  }

  /**
   * Get authorization URL for OAuth2 flow
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    if (this.auth) {
      return this.auth.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
      });
    }
    return '';
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  /**
   * Fetch events from Google Calendar
   */
  async fetchEvents(
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 100
  ): Promise<CareerEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: (timeMin || new Date()).toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      // Transform to CareerEvent format
      return events.map((event: any) => this.transformToCareerEvent(event));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  /**
   * Fetch today's events
   */
  async fetchTodayEvents(): Promise<CareerEvent[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.fetchEvents(startOfDay, endOfDay);
  }

  /**
   * Fetch this week's events
   */
  async fetchWeekEvents(): Promise<CareerEvent[]> {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return this.fetchEvents(startOfWeek, endOfWeek);
  }

  /**
   * Create a new event
   */
  async createEvent(event: Partial<CareerEvent>): Promise<CareerEvent | null> {
    try {
      const eventData = {
        summary: event.summary || 'New Event',
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees,
        colorId: this.getColorIdForType(event.type),
        reminders: event.reminders || {
          useDefault: false,
          overrides: [
            { method: 'email' as const, minutes: 24 * 60 },
            { method: 'popup' as const, minutes: 30 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: eventData,
      });

      return this.transformToCareerEvent(response.data);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CareerEvent>
  ): Promise<CareerEvent | null> {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: updates,
      });

      return this.transformToCareerEvent(response.data);
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  /**
   * Mark event as completed (add to description)
   */
  async markEventCompleted(eventId: string): Promise<CareerEvent | null> {
    try {
      const event = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      const description = event.data.description || '';
      const updatedDescription = `${description}\n\n✅ Completed`;

      return this.updateEvent(eventId, {
        description: updatedDescription,
        status: 'confirmed',
      } as Partial<CareerEvent>);
    } catch (error) {
      console.error('Error marking event completed:', error);
      return null;
    }
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.fetchEvents(startDate, new Date());

    const stats = {
      totalEvents: events.length,
      completedEvents: events.filter((e) => e.completed).length,
      upcomingEvents: events.filter(
        (e) => new Date(e.start.dateTime) > new Date()
      ).length,
      eventsByType: {} as Record<string, number>,
      currentStreak: 0,
      longestStreak: 0,
    };

    // Count events by type
    events.forEach((event) => {
      const type = event.type || 'task';
      stats.eventsByType[type] = (stats.eventsByType[type] || 0) + 1;
    });

    // Calculate streaks (days with at least one event)
    const eventDates = new Set(
      events.map((e) => new Date(e.start.dateTime).toDateString())
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
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

    return stats;
  }

  /**
   * Transform Google Calendar event to CareerEvent
   */
  private transformToCareerEvent(googleEvent: any): CareerEvent {
    const description = googleEvent.description || '';
    const isCompleted = description.includes('✅ Completed');
    const isAISuggested = description.includes('[AI Suggested]');

    // Determine event type from description or summary
    let type: CareerEvent['type'] = 'task';
    const summary = (googleEvent.summary || '').toLowerCase();

    if (summary.includes('interview') || summary.includes('interview prep')) {
      type = 'interview';
    } else if (
      summary.includes('learn') ||
      summary.includes('course') ||
      summary.includes('study')
    ) {
      type = 'learning';
    } else if (summary.includes('network') || summary.includes('meetup')) {
      type = 'networking';
    } else if (summary.includes('deadline') || summary.includes('due')) {
      type = 'deadline';
    } else if (summary.includes('meeting') || summary.includes('call')) {
      type = 'meeting';
    }

    // Determine priority
    let priority: CareerEvent['priority'] = 'medium';
    if (
      summary.includes('urgent') ||
      summary.includes('important') ||
      type === 'deadline'
    ) {
      priority = 'high';
    } else if (summary.includes('optional') || summary.includes('casual')) {
      priority = 'low';
    }

    return {
      id: googleEvent.id,
      summary: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description,
      start: {
        dateTime:
          googleEvent.start.dateTime ||
          new Date(googleEvent.start.date).toISOString(),
        timeZone: googleEvent.start.timeZone,
      },
      end: {
        dateTime:
          googleEvent.end.dateTime ||
          new Date(googleEvent.end.date).toISOString(),
        timeZone: googleEvent.end.timeZone,
      },
      location: googleEvent.location,
      attendees: googleEvent.attendees,
      colorId: googleEvent.colorId,
      reminders: googleEvent.reminders,
      status: googleEvent.status,
      visibility: googleEvent.visibility,
      type,
      priority,
      completed: isCompleted,
      aiSuggested: isAISuggested,
    };
  }

  /**
   * Get color ID based on event type
   */
  private getColorIdForType(type?: CareerEvent['type']): string {
    const colorMap: Record<CareerEvent['type'], string> = {
      learning: '9', // Blue
      interview: '11', // Red
      networking: '5', // Yellow
      deadline: '11', // Red
      meeting: '7', // Cyan
      task: '1', // Lavender
    };

    return type ? colorMap[type] : '1';
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Export mock data for development
export const mockCareerEvents: CareerEvent[] = [
  {
    id: '1',
    summary: 'React Advanced Patterns Course',
    description: 'Complete chapters 5-7',
    start: {
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
    end: {
      dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    },
    type: 'learning',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    summary: 'Technical Interview Prep',
    description: 'Practice system design questions',
    start: {
      dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
    end: {
      dateTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    },
    type: 'interview',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    summary: 'Virtual Coffee Chat - Sarah',
    description: 'Networking opportunity with senior developer',
    start: {
      dateTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    end: {
      dateTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    },
    type: 'networking',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    summary: 'Project Deadline - Portfolio Website',
    description: 'Final submission for client review',
    start: {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    end: {
      dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    },
    type: 'deadline',
    priority: 'high',
    completed: false,
  },
];

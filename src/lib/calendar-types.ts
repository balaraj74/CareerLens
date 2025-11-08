/**
 * Enhanced Calendar Types
 * Comprehensive type definitions for the AI Calendar feature
 */

// ============================================================================
// Core Event Types
// ============================================================================

export type EventCategory = 
  | 'learning' 
  | 'interview' 
  | 'networking' 
  | 'deadline' 
  | 'meeting' 
  | 'task'
  | 'personal'
  | 'career'
  | 'project';

export type EventPriority = 'high' | 'medium' | 'low';
export type EventStatus = 'pending' | 'confirmed' | 'tentative' | 'cancelled' | 'completed';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
export type ReminderType = 'push' | 'email' | 'sms' | 'in-app';
export type RSVPStatus = 'accepted' | 'declined' | 'tentative' | 'pending';

// ============================================================================
// Event Category Configuration
// ============================================================================

export interface CategoryConfig {
  label: string;
  color: string;
  icon: string;
  description: string;
}

export const EVENT_CATEGORIES: Record<EventCategory, CategoryConfig> = {
  learning: {
    label: 'Learning',
    color: '#3B82F6', // Blue
    icon: '📚',
    description: 'Courses, tutorials, and skill development',
  },
  interview: {
    label: 'Interview',
    color: '#EF4444', // Red
    icon: '💼',
    description: 'Job interviews and preparation',
  },
  networking: {
    label: 'Networking',
    color: '#F59E0B', // Amber
    icon: '🤝',
    description: 'Networking events and meetups',
  },
  deadline: {
    label: 'Deadline',
    color: '#DC2626', // Dark Red
    icon: '⏰',
    description: 'Project deadlines and due dates',
  },
  meeting: {
    label: 'Meeting',
    color: '#8B5CF6', // Purple
    icon: '📅',
    description: 'Scheduled meetings and calls',
  },
  task: {
    label: 'Task',
    color: '#10B981', // Green
    icon: '✓',
    description: 'General tasks and to-dos',
  },
  personal: {
    label: 'Personal',
    color: '#EC4899', // Pink
    icon: '🏠',
    description: 'Personal activities and appointments',
  },
  career: {
    label: 'Career',
    color: '#6366F1', // Indigo
    icon: '🎯',
    description: 'Career development activities',
  },
  project: {
    label: 'Project',
    color: '#14B8A6', // Teal
    icon: '🚀',
    description: 'Project work and milestones',
  },
};

// ============================================================================
// Recurrence Pattern
// ============================================================================

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // Every X days/weeks/months
  endDate?: Date; // When to stop recurring
  occurrences?: number; // Or stop after X occurrences
  daysOfWeek?: number[]; // For weekly: 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // For monthly: 1-31
}

// ============================================================================
// Attendee and RSVP
// ============================================================================

export interface Attendee {
  id: string;
  email: string;
  name?: string;
  rsvpStatus: RSVPStatus;
  optional?: boolean;
  responseTime?: Date;
}

// ============================================================================
// Notification/Reminder
// ============================================================================

export interface Reminder {
  id: string;
  type: ReminderType;
  minutesBefore: number;
  sent?: boolean;
  sentAt?: Date;
}

// ============================================================================
// Sync Source
// ============================================================================

export type SyncSource = 'local' | 'google' | 'outlook' | 'apple';

export interface SyncMetadata {
  source: SyncSource;
  externalId?: string;
  lastSynced?: Date;
  syncEnabled: boolean;
}

// ============================================================================
// Main Event Interface
// ============================================================================

export interface EnhancedCalendarEvent {
  // Core Fields
  id: string;
  summary: string;
  description?: string;
  
  // Date/Time
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  allDay?: boolean;
  
  // Categorization
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  
  // Location
  location?: string;
  locationUrl?: string; // For virtual meetings
  
  // Recurrence
  recurrence?: RecurrencePattern;
  isRecurring: boolean;
  parentEventId?: string; // For recurring event instances
  
  // People
  attendees?: Attendee[];
  organizer?: {
    id: string;
    email: string;
    name?: string;
  };
  
  // Reminders
  reminders: Reminder[];
  
  // AI Features
  aiSuggested?: boolean;
  aiScore?: number; // 0-100, how well this fits user's schedule
  aiReasoning?: string;
  
  // Sync
  sync?: SyncMetadata;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  
  // Tags
  tags?: string[];
  
  // Attachments
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  
  // Completion
  completed?: boolean;
  completedAt?: Date;
  
  // Notes
  notes?: string;
}

// ============================================================================
// Event Templates
// ============================================================================

export interface EventTemplate {
  id: string;
  name: string;
  category: EventCategory;
  priority: EventPriority;
  defaultDuration: number; // minutes
  defaultReminders: Reminder[];
  description?: string;
}

export const DEFAULT_EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'interview-prep',
    name: 'Interview Preparation',
    category: 'interview',
    priority: 'high',
    defaultDuration: 60,
    defaultReminders: [
      { id: '1', type: 'push', minutesBefore: 60, sent: false },
      { id: '2', type: 'push', minutesBefore: 5, sent: false },
    ],
  },
  {
    id: 'learning-session',
    name: 'Learning Session',
    category: 'learning',
    priority: 'medium',
    defaultDuration: 90,
    defaultReminders: [
      { id: '1', type: 'push', minutesBefore: 5, sent: false },
    ],
  },
  {
    id: 'networking-event',
    name: 'Networking Event',
    category: 'networking',
    priority: 'medium',
    defaultDuration: 60,
    defaultReminders: [
      { id: '1', type: 'push', minutesBefore: 30, sent: false },
      { id: '2', type: 'push', minutesBefore: 5, sent: false },
    ],
  },
  {
    id: 'project-deadline',
    name: 'Project Deadline',
    category: 'deadline',
    priority: 'high',
    defaultDuration: 0,
    defaultReminders: [
      { id: '1', type: 'push', minutesBefore: 1440, sent: false }, // 1 day
      { id: '2', type: 'push', minutesBefore: 60, sent: false },
      { id: '3', type: 'push', minutesBefore: 5, sent: false },
    ],
  },
];

// ============================================================================
// AI Suggestion Types
// ============================================================================

export interface AIEventSuggestion {
  id: string;
  event: Partial<EnhancedCalendarEvent>;
  confidence: number; // 0-100
  reasoning: string;
  alternativeTimes?: Date[];
  basedOn?: {
    userHabits?: string[];
    freeSlots?: Array<{ start: Date; end: Date }>;
    similarEvents?: string[]; // Event IDs
  };
  createdAt: Date;
}

// ============================================================================
// Natural Language Parse Result
// ============================================================================

export interface ParsedEventData {
  summary: string;
  description?: string;
  start?: Date;
  end?: Date;
  duration?: number; // minutes
  category?: EventCategory;
  priority?: EventPriority;
  location?: string;
  recurrence?: RecurrencePattern;
  attendees?: string[]; // emails
  confidence: number;
  ambiguities?: string[]; // Things that need clarification
}

// ============================================================================
// Calendar Stats
// ============================================================================

export interface CalendarStats {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
  todayEvents: number;
  thisWeekEvents: number;
  currentStreak: number; // Days with events
  longestStreak: number;
  productivityScore: number; // 0-100
  eventsByCategory: Record<EventCategory, number>;
  eventsByPriority: Record<EventPriority, number>;
  completionRate: number; // Percentage
  averageEventsPerDay: number;
}

// ============================================================================
// Notification Queue
// ============================================================================

export interface NotificationQueueItem {
  id: string;
  eventId: string;
  reminder: Reminder;
  event: EnhancedCalendarEvent;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

// ============================================================================
// User Preferences
// ============================================================================

export interface CalendarPreferences {
  defaultView: 'day' | 'week' | 'month';
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  workingDays: number[]; // 1-7 (Monday-Sunday)
  defaultEventDuration: number; // minutes
  defaultReminders: Reminder[];
  timeZone: string;
  enableAISuggestions: boolean;
  enableNotifications: boolean;
  notificationTypes: ReminderType[];
  syncSources: SyncSource[];
  theme: 'light' | 'dark' | 'auto';
  colorCodeEvents: boolean;
}

// ============================================================================
// Filter and Sort Options
// ============================================================================

export interface EventFilters {
  categories?: EventCategory[];
  priorities?: EventPriority[];
  statuses?: EventStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
  showCompleted?: boolean;
  showCancelled?: boolean;
  aiSuggestedOnly?: boolean;
}

export type EventSortBy = 
  | 'start-asc' 
  | 'start-desc' 
  | 'priority' 
  | 'category' 
  | 'created';

// ============================================================================
// Export Helper Functions
// ============================================================================

export const getDefaultReminders = (category: EventCategory): Reminder[] => {
  const template = DEFAULT_EVENT_TEMPLATES.find(t => t.category === category);
  return template?.defaultReminders || [
    { id: '1', type: 'push', minutesBefore: 5, sent: false }
  ];
};

export const getCategoryColor = (category: EventCategory): string => {
  return EVENT_CATEGORIES[category]?.color || '#6B7280';
};

export const getCategoryIcon = (category: EventCategory): string => {
  return EVENT_CATEGORIES[category]?.icon || '📌';
};

export const formatRecurrence = (pattern: RecurrencePattern): string => {
  if (pattern.frequency === 'none') return 'Does not repeat';
  
  const frequency = pattern.frequency;
  const interval = pattern.interval;
  
  if (interval === 1) {
    return `${frequency.charAt(0).toUpperCase() + frequency.slice(1)}`;
  }
  
  return `Every ${interval} ${frequency === 'daily' ? 'days' : frequency.replace('ly', 's')}`;
};

export const isEventUpcoming = (event: EnhancedCalendarEvent): boolean => {
  return new Date(event.start.dateTime) > new Date() && event.status !== 'cancelled';
};

export const isEventOverdue = (event: EnhancedCalendarEvent): boolean => {
  return (
    new Date(event.end.dateTime) < new Date() && 
    !event.completed && 
    event.status !== 'cancelled'
  );
};

export const isEventToday = (event: EnhancedCalendarEvent): boolean => {
  const today = new Date().toDateString();
  const eventDate = new Date(event.start.dateTime).toDateString();
  return today === eventDate;
};

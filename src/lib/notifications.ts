/**
 * Calendar Notification System
 * Handles browser notifications and reminder scheduling for calendar events
 */

import type { EnhancedCalendarEvent, Reminder, NotificationQueueItem } from './calendar-types';

// ============================================================================
// Browser Notification Permission
// ============================================================================

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function hasNotificationPermission(): boolean {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         Notification.permission === 'granted';
}

// ============================================================================
// Send Notification
// ============================================================================

export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon-192x192.png', // Your app icon
      badge: '/badge-72x72.png',
      ...options,
    });

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
}

export function sendEventReminder(event: EnhancedCalendarEvent, minutesBefore: number) {
  const title = `Reminder: ${event.summary}`;
  const body = minutesBefore === 5
    ? `Starting in 5 minutes`
    : minutesBefore === 0
    ? `Starting now!`
    : `Starting in ${minutesBefore} minutes`;

  const notification = sendBrowserNotification(title, {
    body,
    tag: `event-${event.id}-${minutesBefore}`,
    data: {
      eventId: event.id,
      action: 'reminder',
    },
  });

  if (notification) {
    // Handle click
    notification.onclick = () => {
      window.focus();
      // Navigate to calendar with event selected
      window.location.href = `/calendar?event=${event.id}`;
    };
  }

  return notification;
}

// ============================================================================
// Notification Queue Management
// ============================================================================

class NotificationQueue {
  private queue: NotificationQueueItem[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_FREQUENCY = 30000; // Check every 30 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.startChecking();
    }
  }

  /**
   * Schedule reminders for an event
   */
  scheduleReminders(event: EnhancedCalendarEvent) {
    if (!event.reminders || event.reminders.length === 0) {
      return;
    }

    const eventStart = new Date(event.start.dateTime);

    event.reminders.forEach(reminder => {
      const scheduledFor = new Date(eventStart.getTime() - reminder.minutesBefore * 60 * 1000);

      // Don't schedule if time has passed
      if (scheduledFor <= new Date()) {
        return;
      }

      const queueItem: NotificationQueueItem = {
        id: `${event.id}-${reminder.id}`,
        eventId: event.id,
        reminder,
        event,
        scheduledFor,
        status: 'pending',
        attempts: 0,
      };

      // Remove existing item for this event/reminder combo
      this.queue = this.queue.filter(item => item.id !== queueItem.id);
      
      // Add new item
      this.queue.push(queueItem);
    });

    this.saveToStorage();
  }

  /**
   * Cancel all reminders for an event
   */
  cancelReminders(eventId: string) {
    this.queue = this.queue.filter(item => item.eventId !== eventId);
    this.saveToStorage();
  }

  /**
   * Get pending reminders
   */
  getPendingReminders(): NotificationQueueItem[] {
    return this.queue.filter(item => item.status === 'pending');
  }

  /**
   * Check for due notifications and send them
   */
  private checkAndSendNotifications() {
    const now = new Date();
    const dueItems = this.queue.filter(
      item => item.status === 'pending' && item.scheduledFor <= now
    );

    dueItems.forEach(item => {
      try {
        sendEventReminder(item.event, item.reminder.minutesBefore);
        
        // Mark as sent
        item.status = 'sent';
        item.reminder.sent = true;
        item.reminder.sentAt = now;

        console.log(`Sent notification for event: ${item.event.summary}`);
      } catch (error) {
        console.error(`Failed to send notification:`, error);
        item.status = 'failed';
        item.attempts++;
        item.lastAttempt = now;
        item.error = String(error);

        // Retry up to 3 times
        if (item.attempts < 3) {
          item.status = 'pending';
          // Retry in 1 minute
          item.scheduledFor = new Date(now.getTime() + 60 * 1000);
        }
      }
    });

    // Remove old sent/failed items (older than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    this.queue = this.queue.filter(item => 
      item.status === 'pending' || 
      (item.reminder.sentAt && new Date(item.reminder.sentAt) > oneHourAgo)
    );

    this.saveToStorage();
  }

  /**
   * Start periodic checking
   */
  private startChecking() {
    if (this.checkInterval) {
      return;
    }

    // Check immediately
    this.checkAndSendNotifications();

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkAndSendNotifications();
    }, this.CHECK_FREQUENCY);
  }

  /**
   * Stop periodic checking
   */
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('notificationQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save notification queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('notificationQueue');
      if (stored) {
        this.queue = JSON.parse(stored);
        // Clean up old items
        const now = new Date();
        this.queue = this.queue.filter(item => 
          new Date(item.event.start.dateTime) > now
        );
      }
    } catch (error) {
      console.error('Failed to load notification queue:', error);
      this.queue = [];
    }
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.queue = [];
    this.saveToStorage();
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      sent: this.queue.filter(i => i.status === 'sent').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
    };
  }
}

// Export singleton instance
export const notificationQueue = new NotificationQueue();

// ============================================================================
// Service Worker Registration (for background notifications)
// ============================================================================

export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-notifications.js');
    console.log('Notification service worker registered');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// ============================================================================
// In-App Notification Banner
// ============================================================================

export interface InAppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // Auto-dismiss after X ms (0 = no auto-dismiss)
  createdAt: Date;
}

export class InAppNotificationManager {
  private listeners: Set<(notifications: InAppNotification[]) => void> = new Set();
  private notifications: InAppNotification[] = [];

  show(notification: Omit<InAppNotification, 'id' | 'createdAt'>) {
    const fullNotification: InAppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
    };

    this.notifications.push(fullNotification);
    this.notifyListeners();

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(fullNotification.id);
      }, notification.duration);
    }

    return fullNotification.id;
  }

  dismiss(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  dismissAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(callback: (notifications: InAppNotification[]) => void) {
    this.listeners.add(callback);
    // Immediately call with current notifications
    callback([...this.notifications]);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }
}

export const inAppNotifications = new InAppNotificationManager();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Show event reminder as in-app notification
 */
export function showInAppReminder(event: EnhancedCalendarEvent, minutesBefore: number) {
  let message = '';
  if (minutesBefore === 0) {
    message = 'Starting now!';
  } else if (minutesBefore === 5) {
    message = 'Starting in 5 minutes';
  } else if (minutesBefore < 60) {
    message = `Starting in ${minutesBefore} minutes`;
  } else {
    const hours = Math.floor(minutesBefore / 60);
    message = `Starting in ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  inAppNotifications.show({
    type: 'info',
    title: event.summary,
    message,
    action: {
      label: 'View',
      onClick: () => {
        window.location.href = `/calendar?event=${event.id}`;
      },
    },
    duration: 10000, // 10 seconds
  });
}

/**
 * Initialize notification system
 */
export async function initializeNotificationSystem() {
  // Request permission
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    console.log('Notification system initialized');
    
    // Register service worker for background notifications
    await registerNotificationServiceWorker();
  } else {
    console.warn('Notification permission denied - using in-app notifications only');
  }

  return hasPermission;
}

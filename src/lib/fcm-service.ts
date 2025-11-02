/**
 * Firebase Cloud Messaging Service
 * Handles push notifications for event reminders
 */

import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { CareerEvent } from './google-calendar-service';

let messaging: Messaging | null = null;

/**
 * Initialize FCM and request notification permissions
 */
export async function initializeFCM(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const app = getApp();
    messaging = getMessaging(app);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    
    const user = getAuth().currentUser;
    if (user) {
      const db = getFirestore();
      await setDoc(
        doc(db, 'fcmTokens', user.uid),
        {
          token,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return token;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return null;
  }
}

export function onMessageListener(callback: (payload: any) => void): (() => void) | null {
  if (!messaging) {
    console.warn('FCM not initialized');
    return null;
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });

  return unsubscribe;
}

export async function scheduleEventReminder(
  event: CareerEvent,
  reminderMinutes: number = 15
): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const user = getAuth().currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const eventStart = new Date(event.start.dateTime);
    const reminderTime = new Date(eventStart.getTime() - reminderMinutes * 60 * 1000);

    await setDoc(doc(db, 'eventReminders', `${user.uid}_${event.id}`), {
      userId: user.uid,
      eventId: event.id,
      eventSummary: event.summary,
      eventDescription: event.description || '',
      eventStart: event.start.dateTime,
      reminderTime: reminderTime.toISOString(),
      reminderMinutes,
      sent: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`Reminder scheduled for ${event.summary} at ${reminderTime}`);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const user = getAuth().currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const reminderRef = doc(db, 'eventReminders', `${user.uid}_${eventId}`);
    await setDoc(reminderRef, { sent: true }, { merge: true });

    console.log(`Reminder cancelled for event ${eventId}`);
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    throw error;
  }
}

export function showNotification(
  title: string,
  options: NotificationOptions = {}
): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  return new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    ...options,
  });
}

export async function getUserFCMToken(): Promise<string | null> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const user = getAuth().currentUser;

    if (!user) {
      return null;
    }

    const tokenDoc = await getDoc(doc(db, 'fcmTokens', user.uid));
    return tokenDoc.exists() ? tokenDoc.data().token : null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function sendTestNotification(): Promise<void> {
  const notification = showNotification('CareerLens Test', {
    body: 'FCM is working correctly!',
    tag: 'test',
    requireInteraction: false,
  });

  if (notification) {
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export function handleNotificationPayload(payload: any): void {
  const { notification, data } = payload;

  if (notification) {
    const notif = showNotification(notification.title || 'CareerLens', {
      body: notification.body || '',
      icon: notification.icon || '/icon-192.png',
      tag: data?.eventId || 'event',
      data: data || {},
    });

    if (notif && data?.eventId) {
      notif.onclick = () => {
        window.focus();
        window.location.href = `/calendar?event=${data.eventId}`;
        notif.close();
      };
    }
  }
}

export async function scheduleMultipleReminders(
  events: CareerEvent[],
  reminderMinutes: number = 15
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await scheduleEventReminder(event, reminderMinutes);
      success++;
    } catch (error) {
      console.error(`Failed to schedule reminder for ${event.summary}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

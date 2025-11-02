/**
 * Firebase Cloud Function for Event Reminders
 * This function should be deployed to Firebase Functions
 * It checks for upcoming events and sends FCM notifications
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Scheduled function that runs every 5 minutes to check for reminders
 */
export const checkEventReminders = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    try {
      // Query reminders that should be sent in the next 5 minutes
      const remindersSnapshot = await db
        .collection('eventReminders')
        .where('sent', '==', false)
        .where('reminderTime', '<=', fiveMinutesFromNow.toISOString())
        .get();

      console.log(`Found ${remindersSnapshot.size} reminders to send`);

      const batch = db.batch();
      const notifications: Promise<any>[] = [];

      for (const doc of remindersSnapshot.docs) {
        const reminder = doc.data();
        const { userId, eventSummary, eventDescription, eventStart, reminderMinutes } =
          reminder;

        // Get user's FCM token
        const tokenDoc = await db.collection('fcmTokens').doc(userId).get();
        if (!tokenDoc.exists) {
          console.warn(`No FCM token found for user ${userId}`);
          continue;
        }

        const fcmToken = tokenDoc.data()?.token;
        if (!fcmToken) {
          console.warn(`Invalid FCM token for user ${userId}`);
          continue;
        }

        // Calculate time until event
        const eventDate = new Date(eventStart);
        const minutesUntil = Math.round(
          (eventDate.getTime() - now.getTime()) / (1000 * 60)
        );

        // Prepare notification
        const message: admin.messaging.Message = {
          token: fcmToken,
          notification: {
            title: `📅 Upcoming: ${eventSummary}`,
            body: `Starting in ${minutesUntil} minutes${
              eventDescription ? `: ${eventDescription}` : ''
            }`,
            imageUrl: undefined,
          },
          data: {
            eventId: doc.id,
            eventSummary,
            eventStart,
            type: 'event_reminder',
            clickAction: 'OPEN_CALENDAR',
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'event_reminders',
              priority: 'high',
              sound: 'default',
              clickAction: 'OPEN_CALENDAR',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
          webpush: {
            notification: {
              icon: '/icon-192.png',
              badge: '/icon-96.png',
              requireInteraction: true,
              actions: [
                {
                  action: 'view',
                  title: 'View Event',
                },
                {
                  action: 'dismiss',
                  title: 'Dismiss',
                },
              ],
            },
            fcmOptions: {
              link: `/calendar?event=${doc.id}`,
            },
          },
        };

        // Send notification
        notifications.push(
          messaging
            .send(message)
            .then((response) => {
              console.log(`Sent notification for ${eventSummary}: ${response}`);
              return { success: true, event: eventSummary };
            })
            .catch((error) => {
              console.error(
                `Error sending notification for ${eventSummary}:`,
                error
              );
              return { success: false, event: eventSummary, error };
            })
        );

        // Mark reminder as sent
        batch.update(doc.ref, { sent: true, sentAt: now.toISOString() });
      }

      // Commit batch updates
      await batch.commit();

      // Wait for all notifications to be sent
      const results = await Promise.all(notifications);
      const successCount = results.filter((r) => r.success).length;

      console.log(
        `Sent ${successCount}/${results.length} notifications successfully`
      );

      return {
        success: true,
        sent: successCount,
        total: results.length,
      };
    } catch (error) {
      console.error('Error checking event reminders:', error);
      throw error;
    }
  });

/**
 * HTTP function to manually send a test notification
 */
export const sendTestReminder = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    // Get user's FCM token
    const tokenDoc = await db.collection('fcmTokens').doc(userId).get();
    if (!tokenDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'FCM token not found for user'
      );
    }

    const fcmToken = tokenDoc.data()?.token;
    if (!fcmToken) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token');
    }

    // Send test notification
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '🚀 CareerLens Test',
        body: 'Event reminders are working correctly!',
      },
      data: {
        type: 'test',
      },
      webpush: {
        notification: {
          icon: '/icon-192.png',
        },
      },
    };

    const response = await messaging.send(message);
    console.log(`Test notification sent to user ${userId}: ${response}`);

    return {
      success: true,
      message: 'Test notification sent successfully',
      messageId: response,
    };
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cleanup old reminders (runs daily)
 */
export const cleanupOldReminders = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const oldReminders = await db
        .collection('eventReminders')
        .where('sent', '==', true)
        .where('sentAt', '<=', thirtyDaysAgo.toISOString())
        .get();

      console.log(`Deleting ${oldReminders.size} old reminders`);

      const batch = db.batch();
      oldReminders.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return {
        success: true,
        deleted: oldReminders.size,
      };
    } catch (error) {
      console.error('Error cleaning up old reminders:', error);
      throw error;
    }
  });

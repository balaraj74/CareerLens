/**
 * Cloud Function: Notify Users
 * Sends push notifications for new content and updates
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

/**
 * Send push notification to a user
 */
async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`User ${userId} not found`);
      return false;
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    const pushEnabled = userData?.pushNotifications !== false; // Default true

    if (!fcmToken || !pushEnabled) {
      console.log(`User ${userId} has no FCM token or push disabled`);
      return false;
    }

    // Send notification
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl })
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'careerlens_updates',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    await admin.messaging().send(message);
    console.log(`Notification sent to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error sending notification to ${userId}:`, error);
    return false;
  }
}

/**
 * Send batch notifications to multiple users
 */
async function sendBatchNotifications(
  userIds: string[],
  payload: NotificationPayload
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Process in chunks of 10 to avoid rate limits
  const chunkSize = 10;
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(userId => sendPushNotification(userId, payload))
    );
    
    success += results.filter(r => r).length;
    failed += results.filter(r => !r).length;

    // Rate limit: wait 100ms between chunks
    if (i + chunkSize < userIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { success, failed };
}

/**
 * Get users interested in a category
 */
async function getUsersByCategory(category: string): Promise<string[]> {
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('categories', 'array-contains', category)
    .where('pushNotifications', '==', true)
    .get();

  return snapshot.docs.map(doc => doc.id);
}

/**
 * Trigger when new review is added
 */
export const notifyNewReview = functions.firestore
  .document('reddit_reviews/{reviewId}')
  .onCreate(async (snapshot, context) => {
    const review = snapshot.data();
    const category = review.category || 'General';

    console.log(`New review added: ${review.title}`);

    // Get interested users
    const userIds = await getUsersByCategory(category);

    if (userIds.length === 0) {
      console.log('No users to notify');
      return { success: true, notified: 0 };
    }

    // Send notifications
    const payload: NotificationPayload = {
      title: `New ${category} Review`,
      body: review.title,
      data: {
        type: 'new_review',
        reviewId: snapshot.id,
        category,
        url: review.url
      }
    };

    const { success, failed } = await sendBatchNotifications(userIds, payload);

    console.log(`Notifications sent: ${success} success, ${failed} failed`);

    // Store notification log
    await db.collection('notification_logs').add({
      type: 'new_review',
      reviewId: snapshot.id,
      category,
      sentTo: userIds.length,
      success,
      failed,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, notified: success };
  });

/**
 * Trigger when new course is added
 */
export const notifyNewCourse = functions.firestore
  .document('scraped_courses/{courseId}')
  .onCreate(async (snapshot, context) => {
    const course = snapshot.data();
    const platform = course.platform || 'Unknown';

    console.log(`New course added: ${course.title}`);

    // Get all users with push enabled (courses are relevant to everyone)
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef
      .where('pushNotifications', '==', true)
      .limit(1000) // Limit to prevent overwhelming
      .get();

    const userIds = usersSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0) {
      console.log('No users to notify');
      return { success: true, notified: 0 };
    }

    // Send notifications
    const payload: NotificationPayload = {
      title: `New Course: ${platform}`,
      body: course.title,
      data: {
        type: 'new_course',
        courseId: snapshot.id,
        platform,
        url: course.url
      }
    };

    const { success, failed } = await sendBatchNotifications(userIds, payload);

    console.log(`Notifications sent: ${success} success, ${failed} failed`);

    return { success: true, notified: success };
  });

/**
 * Trigger when mentor is added
 */
export const notifyNewMentor = functions.firestore
  .document('online_mentors/{mentorId}')
  .onCreate(async (snapshot, context) => {
    const mentor = snapshot.data();
    const category = mentor.category || 'Career Guidance';

    console.log(`New mentor added: ${mentor.name}`);

    // Get interested users
    const userIds = await getUsersByCategory(category);

    if (userIds.length === 0) {
      console.log('No users to notify');
      return { success: true, notified: 0 };
    }

    // Send notifications
    const payload: NotificationPayload = {
      title: `New ${category} Mentor`,
      body: `${mentor.name} - ${mentor.title}`,
      data: {
        type: 'new_mentor',
        mentorId: snapshot.id,
        category,
        url: mentor.link
      }
    };

    const { success, failed } = await sendBatchNotifications(userIds, payload);

    console.log(`Notifications sent: ${success} success, ${failed} failed`);

    return { success: true, notified: success };
  });

/**
 * Scheduled daily digest - runs at 9 AM IST
 */
export const notifyDailyDigest = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Sending daily digest notifications...');

    // Get stats from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Count new content
    const [reviewsSnapshot, coursesSnapshot, mentorsSnapshot] = await Promise.all([
      db.collection('reddit_reviews')
        .where('fetchedAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .get(),
      db.collection('scraped_courses')
        .where('fetchedAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .get(),
      db.collection('online_mentors')
        .where('fetchedAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .get()
    ]);

    const newReviews = reviewsSnapshot.size;
    const newCourses = coursesSnapshot.size;
    const newMentors = mentorsSnapshot.size;

    if (newReviews === 0 && newCourses === 0 && newMentors === 0) {
      console.log('No new content for daily digest');
      return { success: true, notified: 0 };
    }

    // Get all users with push enabled
    const usersSnapshot = await db.collection('users')
      .where('pushNotifications', '==', true)
      .get();

    const userIds = usersSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0) {
      return { success: true, notified: 0 };
    }

    // Send digest notification
    const payload: NotificationPayload = {
      title: '📊 CareerLens Daily Digest',
      body: `${newReviews} reviews, ${newCourses} courses, ${newMentors} mentors added yesterday`,
      data: {
        type: 'daily_digest',
        newReviews: newReviews.toString(),
        newCourses: newCourses.toString(),
        newMentors: newMentors.toString()
      }
    };

    const { success, failed } = await sendBatchNotifications(userIds, payload);

    console.log(`Daily digest sent: ${success} success, ${failed} failed`);

    return { success: true, notified: success };
  });

/**
 * Manual trigger for testing
 */
export const notifyUsersTrigger = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const title = req.query.title as string || 'Test Notification';
    const body = req.query.body as string || 'This is a test notification from CareerLens';

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'Missing userId query parameter'
      });
      return;
    }

    const payload: NotificationPayload = {
      title,
      body,
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };

    const sent = await sendPushNotification(userId, payload);

    res.json({
      success: sent,
      message: sent ? 'Notification sent successfully' : 'Failed to send notification'
    });
  } catch (error: any) {
    console.error('Notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

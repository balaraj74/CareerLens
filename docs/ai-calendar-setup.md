# AI Career Calendar - Setup Guide

This guide will help you set up the AI Career Calendar feature with Google Calendar API, Firebase Cloud Messaging, and Gemini AI.

## 📋 Prerequisites

- CareerLens project with Firebase setup
- Google Cloud Platform account
- Node.js and npm installed

## 🔧 Step 1: Google Calendar API Setup

### 1.1 Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Calendar API"
5. Click **Enable**

### 1.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: CareerLens Calendar
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `https://your-production-domain.web.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://your-production-domain.web.app/api/auth/google/callback`
5. Click **Create**
6. **Save** the Client ID and Client Secret

### 1.3 Add Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=your_client_id_here
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 🔔 Step 2: Firebase Cloud Messaging Setup

### 2.1 Generate VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Navigate to **Cloud Messaging** tab
5. Scroll to **Web Push certificates**
6. Click **Generate key pair**
7. **Copy** the key pair value

### 2.2 Add VAPID Key to Environment

Add to your `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 2.3 Create Firebase Service Worker

Create `/public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'CareerLens';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    tag: payload.data?.eventId || 'notification',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const clickAction = event.notification.data?.clickAction || 'OPEN_APP';
  
  if (clickAction === 'OPEN_CALENDAR') {
    event.waitUntil(
      clients.openWindow('/calendar')
    );
  }
});
```

## 🚀 Step 3: Install Dependencies

Install the required packages:

```bash
npm install googleapis
```

The other required packages (firebase, genkit, etc.) are already installed.

## 📦 Step 4: Deploy Firebase Cloud Function

### 4.1 Setup Firebase Functions (if not already done)

```bash
cd functions
npm install
```

### 4.2 Add Function to index.ts

Add to `/functions/index.ts`:

```typescript
export * from './event-reminders';
```

### 4.3 Deploy Functions

```bash
firebase deploy --only functions
```

This will deploy:
- `checkEventReminders` - Runs every 5 minutes to send reminders
- `sendTestReminder` - HTTP function to test notifications
- `cleanupOldReminders` - Runs daily to clean old data

## 🔐 Step 5: Configure Firestore Security Rules

Add to your `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Event Reminders
    match /eventReminders/{reminderId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
    }
    
    // FCM Tokens
    match /fcmTokens/{userId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 🧪 Step 6: Test the Setup

### 6.1 Test FCM Initialization

1. Start your dev server: `npm run dev`
2. Navigate to `/calendar`
3. Check browser console for FCM initialization logs
4. Allow notification permissions when prompted

### 6.2 Test Calendar API

1. Click "Sync" button in the calendar
2. Authenticate with Google Calendar (first time only)
3. Check if events load successfully

### 6.3 Test AI Suggestions

1. View the "AI Suggestions" section
2. Click "+" to add a suggestion to calendar
3. Check if event is created

### 6.4 Test Reminders

1. Create an event with a reminder
2. Wait for the reminder time
3. Check if notification appears

## 📱 Step 7: Test Notifications

### 7.1 Manual Test

Use the test function:

```javascript
import { sendTestNotification } from '@/lib/fcm-service';

await sendTestNotification();
```

### 7.2 Check Firestore

1. Go to Firebase Console > Firestore
2. Check `eventReminders` collection
3. Verify reminder documents are created

### 7.3 Check Cloud Function Logs

```bash
firebase functions:log
```

Look for reminder sending logs.

## 🎨 Step 8: UI Customization

The calendar UI uses:
- **Glassmorphism**: `backdrop-blur-sm`, `bg-opacity`
- **Gradients**: `bg-gradient-to-br from-blue-500/10 to-purple-500/10`
- **Framer Motion**: Smooth animations on all cards
- **Tailwind CSS**: Responsive design

Customize colors in `/src/app/calendar/page.tsx`:
- Stat cards have different gradient themes
- Priority badges use color-coded styles
- Event types have emoji icons

## 🐛 Troubleshooting

### Issue: FCM not initialized
**Solution**: Check VAPID key in `.env.local` and restart dev server

### Issue: Calendar API 401 error
**Solution**: Re-authenticate by clearing browser storage and logging in again

### Issue: No reminders sent
**Solution**: 
1. Check if Cloud Function is deployed: `firebase functions:list`
2. Check function logs: `firebase functions:log`
3. Verify Firestore documents exist

### Issue: Notifications not appearing
**Solution**:
1. Check browser notification permissions
2. Verify service worker is registered: DevTools > Application > Service Workers
3. Test with `sendTestNotification()`

## 📊 Feature Usage

### Create Event with Reminder

```typescript
import { createEvent } from '@/lib/google-calendar-service';
import { scheduleEventReminder } from '@/lib/fcm-service';

const event = await createEvent(accessToken, {
  summary: 'Interview Prep',
  description: 'Practice React questions',
  start: {
    dateTime: '2024-03-15T10:00:00',
    timeZone: 'America/New_York',
  },
  end: {
    dateTime: '2024-03-15T11:00:00',
    timeZone: 'America/New_York',
  },
});

await scheduleEventReminder(event, 15); // 15 minutes before
```

### Get AI Suggestions

```typescript
import { generateEventSuggestions } from '@/lib/ai-calendar-suggestions';

const suggestions = await generateEventSuggestions(
  userProfile,
  currentEvents,
  5 // Number of suggestions
);
```

### Analyze Calendar Patterns

```typescript
import { analyzeCalendarPatterns } from '@/lib/ai-calendar-suggestions';

const analysis = await analyzeCalendarPatterns(events, userProfile);
console.log('Insights:', analysis.insights);
console.log('Recommendations:', analysis.recommendations);
console.log('Productivity Score:', analysis.productivityScore);
```

## 🎯 Next Steps

1. **Production Deployment**: Update OAuth redirect URIs
2. **User Onboarding**: Add calendar connection flow
3. **Advanced Features**: 
   - Recurring events
   - Calendar sharing
   - Team collaboration
   - Smart scheduling
4. **Analytics**: Track calendar usage and productivity

## 📚 Additional Resources

- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Need Help?** Check the [troubleshooting section](#-troubleshooting) or open an issue on GitHub.

# Firebase Permissions Error - Fix Guide

## Problem
You're seeing: `FirebaseError: Missing or insufficient permissions.`

This happens when Firestore security rules don't allow the operations your app is trying to perform.

## Solution

### Option 1: Deploy via Firebase Console (Quickest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `careerlens-1`
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab
5. Copy the updated rules from `firestore.rules` file
6. Click **Publish**

### Option 2: Deploy via Firebase CLI

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy just the rules
firebase deploy --only firestore:rules
```

### Option 3: Temporary Development Mode (NOT FOR PRODUCTION)

If you just want to test quickly, you can enable permissive rules:

**⚠️ WARNING: This allows anyone to read/write your database! Only for local development!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

## What Was Fixed

I've updated `firestore.rules` to add missing collections:

### New Rules Added:
1. **activities** - User's career activities
2. **eventReminders** - Calendar event reminders  
3. **fcmTokens** - Push notification tokens
4. **cache** - System caching for API results
5. **colleges** - College data

### Updated Collections:
- Users collection now supports `setDoc` with `merge: true`
- All update operations changed to use `setDoc` to avoid "No document to update" errors

## Current Rules Structure

```
✅ users/{userId} - Read/write own data
✅ careerActivities/{activityId} - User's activities
✅ careerGraphs/{userId} - User's career graph
✅ reviews/{reviewId} - Public read, authenticated write
✅ resources/{resourceId} - Public read, authenticated write
✅ redditPosts/{postId} - Public read/write (cached data)
✅ mentors/{mentorId} - Public read, authenticated write
✅ chatRooms/{roomId} - Participants only
✅ messages/{messageId} - Authenticated create
✅ activities/{activityId} - User's own activities (NEW)
✅ eventReminders/{reminderId} - Authenticated read/write (NEW)
✅ fcmTokens/{tokenId} - Authenticated read/write (NEW)
✅ cache/{cacheId} - Public read/write for caching (NEW)
✅ colleges/{collegeId} - Public read, authenticated write (NEW)
```

## Quick Test

After deploying rules, test with:

```javascript
// In browser console on your app
const { getFirestore, doc, setDoc } = await import('firebase/firestore');
const db = getFirestore();

// Should work now
await setDoc(doc(db, 'users', 'test-user-id'), {
  name: 'Test User',
  updatedAt: new Date()
}, { merge: true });

console.log('✅ Firestore permissions working!');
```

## Common Issues

### Issue: "Missing or insufficient permissions" on users collection
**Fix**: Make sure you're logged in and accessing your own user document

### Issue: "No document to update"  
**Fix**: All code now uses `setDoc` with `{ merge: true }` instead of `updateDoc`

### Issue: Rules deployed but still getting errors
**Fix**: 
1. Clear browser cache
2. Sign out and sign in again
3. Check Firebase Console > Firestore > Rules to confirm they're published
4. Wait 1-2 minutes for rules to propagate

## Files Modified

1. `firestore.rules` - Added new collection rules
2. `src/lib/enhanced-profile-service.ts` - Changed all `updateDoc` to `setDoc`
3. Created this guide

## Next Steps

1. **Deploy the rules** using one of the options above
2. **Refresh your app** (Ctrl+Shift+R / Cmd+Shift+R)
3. **Test the functionality** that was giving errors
4. If still having issues, check browser console for specific errors

## Verify Deployment

After deploying, verify in Firebase Console:
1. Go to Firestore Database > Rules
2. Check the "Active" timestamp - should be recent
3. Look for the new collection rules in the editor

## Need Help?

If you're still seeing errors:
1. Check browser console for full error message
2. Note which page/action causes the error
3. Verify you're logged in with a valid user account
4. Check Firebase Console > Firestore > Data to see if documents exist

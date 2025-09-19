
'use client';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { UserProfile } from './types';

// Helper to safely convert Firestore Timestamps back to JS Date objects.
// This is important when reading data from Firestore.
const convertTimestamps = (data: any) => {
    if (data && data.dob instanceof Timestamp) {
        data.dob = data.dob.toDate();
    }
    // Add any other timestamp conversions here if needed
    return data;
}

/**
 * Fetches a user's profile from Firestore.
 * @param userId - The ID of the user.
 * @returns An object with success status, data, and an optional error message.
 */
export async function fetchProfile(
  userId: string
): Promise<{ success: boolean; data?: UserProfile | null; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Document exists, convert any timestamps before returning
      const data = userDoc.data();
      const convertedData = convertTimestamps(data);
      return { success: true, data: convertedData as UserProfile };
    } else {
      // User profile does not exist yet. This is not an error.
      return { success: true, data: null };
    }
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return { success: false, error: 'Failed to retrieve profile data from the server.' };
  }
}

/**
 * Creates or updates a user's profile in Firestore.
 * This mirrors the robust logic from your "Agrisence" app.
 * @param userId - The ID of the user.
 * @param data - The user profile data to save.
 * @returns An object with success status and an optional error message.
 */
export async function saveProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
   if (!userId) {
    return { success: false, error: 'User ID is required to save the profile.' };
  }
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    // Prepare the data with timestamps
    const profileData: Partial<UserProfile> & { updatedAt: any; createdAt?: any } = {
        ...data,
        updatedAt: serverTimestamp(),
    };
    
    // If the document doesn't exist, we are creating it for the first time.
    // Add the createdAt timestamp, similar to the logic in your expense tracker.
    if (!docSnap.exists()) {
        profileData.createdAt = serverTimestamp();
    }

    // Use setDoc with merge:true to create or update the document.
    // This is safer than updateDoc as it won't fail if the doc doesn't exist,
    // and it's perfect for a profile that is created once and updated many times.
    await setDoc(userDocRef, profileData, { merge: true });
    return { success: true };
  } catch (err: any)
   {
    console.error('Error saving profile:', err);
    return { success: false, error: 'Failed to save profile changes to the server.' };
  }
}

    
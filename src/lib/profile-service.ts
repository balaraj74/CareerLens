'use client';

import { doc, getDoc, setDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { UserProfile } from './types';

// Helper to safely convert Firestore Timestamps to JS Date objects.
const convertTimestamps = (data: any) => {
    if (data.dob && typeof data.dob.toDate === 'function') {
        data.dob = data.dob.toDate();
    }
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
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as any;
      return { success: true, data: convertTimestamps(data) as UserProfile };
    } else {
      // User profile does not exist yet.
      return { success: true, data: null };
    }
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return { success: false, error: 'Failed to retrieve profile data.' };
  }
}


interface UpdatableUserProfile {
    [key: string]: any;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

/**
 * Saves a user's profile to Firestore.
 * @param userId - The ID of the user.
 * @param data - The user profile data to save.
 * @returns An object with success status and an optional error message.
 */
export async function saveProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    const profileData: UpdatableUserProfile = { ...data };

    // Set timestamps
    profileData.updatedAt = serverTimestamp();
    if (!docSnap.exists()) {
        // Only set createdAt if the document doesn't exist.
        profileData.createdAt = serverTimestamp();
    }

    // Use setDoc with merge:true to create or update the document.
    await setDoc(userDocRef, profileData, { merge: true });
    return { success: true };
  } catch (err: any)
   {
    console.error('Error saving profile:', err);
    return { success: false, error: 'Failed to save profile changes.' };
  }
}

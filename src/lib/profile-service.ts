
'use client';

import { db } from "./firebaseClient";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from './types';
import { defaultProfileData } from "./data";

/**
 * Fetches a user's profile from Firestore using the client-side SDK.
 * If the profile doesn't exist, it returns a default empty profile object.
 * This prevents "NOT_FOUND" errors on the client.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the user's profile data.
 */
export async function fetchProfile(
  userId: string
): Promise<{ success: boolean; data: UserProfile | null; error?: string }> {
  if (!userId) {
    return { success: false, data: null, error: 'User ID is required.' };
  }
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        // Return a default, empty profile if one doesn't exist.
        // This is not an error state.
        return { success: true, data: defaultProfileData };
    }
    
    const data = docSnap.data() as any;

    // Convert Firestore Timestamps to JS Date objects
    if (data.dob && data.dob instanceof Timestamp) {
      data.dob = data.dob.toDate();
    }
    
    // The user's profile already exists, so return it
    return { success: true, data: data as UserProfile };

  } catch (err: any) {
    console.error('Error fetching profile from Firestore:', err);
    // Return default data as a fallback on error to prevent crashes
    return { success: false, data: defaultProfileData, error: 'Failed to retrieve profile data. You might be offline.' };
  }
}

/**
 * Creates or updates a user's profile in Firestore using the client-side SDK.
 * Uses setDoc with { merge: true } to seamlessly handle both cases.
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
    const docRef = doc(db, "users", userId);
    
    // Create a copy to avoid mutating the original data
    const dataToSave: any = { ...data };

    // Convert JS Date back to Firestore Timestamp before saving
    if (dataToSave.dob && dataToSave.dob instanceof Date) {
        dataToSave.dob = Timestamp.fromDate(dataToSave.dob);
    }
    
    // Add/update timestamps for creation and updates
    dataToSave.updatedAt = Timestamp.now();
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        dataToSave.createdAt = Timestamp.now();
    }

    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('Error saving profile to Firestore:', err);
    return { success: false, error: 'Failed to save profile changes. Please check your connection.' };
  }
}

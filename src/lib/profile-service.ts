
'use client';

import { db } from "./firebaseClient";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from './types';


/**
 * Fetches a user's profile from Firestore using the client-side SDK.
 * @param userId - The ID of the user.
 * @returns The user profile data or undefined if not found.
 */
export async function fetchProfile(userId: string): Promise<UserProfile | undefined> {
  if (!userId) {
    console.error('User ID is required to fetch a profile.');
    return undefined;
  }
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // The document data is returned, which should conform to UserProfile
      return docSnap.data() as UserProfile;
    } else {
      // No document found, return undefined
      return undefined;
    }
  } catch (err: any) {
    console.error('Error fetching profile from Firestore:', err);
    // In case of error (e.g., offline), return undefined
    return undefined;
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
    
    // Add server timestamp for updates
    const dataToSave = {
      ...data,
      updatedAt: Timestamp.now()
    };

    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('Error saving profile to Firestore:', err);
    return { success: false, error: err.message || 'Failed to save profile changes. Please check your connection.' };
  }
}

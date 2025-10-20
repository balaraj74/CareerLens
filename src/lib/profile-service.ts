'use client';

import { doc, getDoc, setDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import type { UserProfile } from './types';


/**
 * Fetches a user's profile from Firestore using the client-side SDK.
 * @param db - The Firestore instance.
 * @param userId - The ID of the user.
 * @returns The user profile data or undefined if not found.
 */
export async function fetchProfile(db: Firestore, userId: string): Promise<UserProfile | undefined> {
  if (!userId) {
    console.warn('User ID is not provided. Cannot fetch profile.');
    return undefined;
  }
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Return the document data, which should conform to UserProfile
      return docSnap.data() as UserProfile;
    } else {
      console.log("No profile document found for user:", userId);
      // Return undefined, the caller can decide to create a new profile.
      return undefined;
    }
  } catch (err: any) {
    console.error('Error fetching profile from Firestore:', err);
    // Propagate the error so the UI can handle it (e.g., show a toast).
    throw new Error('Failed to fetch user profile.');
  }
}

/**
 * Creates or updates a user's profile in the 'users' collection in Firestore.
 * @param db - The Firestore instance.
 * @param userId - The ID of the user.
 * @param data - The user profile data to save.
 */
export async function saveProfile(
  db: Firestore,
  userId: string,
  data: UserProfile
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save the profile.');
  }
  
  // A reference to the document in the 'users' collection.
  const docRef = doc(db, "users", userId);
  
  // Create a new object for Firestore to avoid mutating the original form data.
  // Add the `updatedAt` server timestamp.
  const dataToSave = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  try {
    // Use setDoc with { merge: true } to create or update the document.
    // This is robust and prevents overwriting fields unintentionally.
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error("Error saving profile to Firestore:", error);
    // Throw a more user-friendly error message.
    throw new Error("Could not save your profile to the database. Please try again.");
  }
}

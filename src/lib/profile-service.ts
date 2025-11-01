
'use client';

import { doc, getDoc, setDoc, serverTimestamp, type Firestore, enableNetwork } from "firebase/firestore";
import type { UserProfile } from './types';


/**
 * Serializes a user profile by converting Firestore Timestamps to ISO strings.
 * This is needed when passing profile data to Next.js server actions.
 * @param profile - The user profile with potential Firestore Timestamp objects
 * @returns A serialized profile safe for server actions
 */
export function serializeProfile(profile: any): any {
  if (!profile) return profile;
  
  return {
    ...profile,
    updatedAt: profile.updatedAt?.seconds 
      ? new Date(profile.updatedAt.seconds * 1000).toISOString() 
      : undefined,
    createdAt: profile.createdAt?.seconds 
      ? new Date(profile.createdAt.seconds * 1000).toISOString() 
      : undefined,
  };
}


/**
 * Fetches a user's profile from Firestore using the client-side SDK.
 * @param db - The Firestore instance.
 * @param userId - The ID of the user.
 * @returns The user profile data or undefined if not found.
 */
export async function fetchProfile(db: Firestore, userId: string): Promise<UserProfile | undefined> {
  if (!db) {
    console.warn('Firestore instance is not available. Cannot fetch profile.');
    return undefined;
  }
  if (!userId) {
    console.warn('User ID is not provided. Cannot fetch profile.');
    return undefined;
  }
  try {
    // Explicitly enable the network to help mitigate "client is offline" errors in race conditions.
    await enableNetwork(db);
    
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
    if (err.message.includes('offline')) {
       throw new Error('Could not connect to the database. Please check your internet connection.');
    }
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
    console.log('Attempting to save profile to Firestore for user:', userId);
    console.log('Data to save:', dataToSave);
    // Use setDoc with { merge: true } to create or update the document.
    // This is robust and prevents overwriting fields unintentionally.
    await setDoc(docRef, dataToSave, { merge: true });
    console.log('Profile successfully saved to Firestore!');
  } catch (error: any) {
    console.error("Error saving profile to Firestore:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Provide specific error messages based on the error type
    if (error.code === 'permission-denied') {
      throw new Error("Permission denied. Please ensure Firestore security rules are deployed.");
    } else if (error.code === 'unavailable') {
      throw new Error("Could not connect to Firestore. Please check your internet connection.");
    }
    
    // Throw a more user-friendly error message.
    throw new Error(error.message || "Could not save your profile to the database. Please try again.");
  }
}

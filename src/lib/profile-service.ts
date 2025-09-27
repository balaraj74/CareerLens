
'use client';

import { db } from "./firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
      return docSnap.data() as UserProfile;
    } else {
      return undefined;
    }
  } catch (err: any) {
    console.error('Error fetching profile from Firestore:', err);
    return undefined;
  }
}

/**
 * Creates or updates a user's profile in Firestore.
 * @param userId - The ID of the user.
 * @param data - The user profile data to save.
 */
export async function saveProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save the profile.');
  }
  
  const docRef = doc(db, "users", userId);
  
  // Add a server timestamp for updates
  const dataToSave = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Use setDoc with { merge: true } to create or update the document.
  await setDoc(docRef, dataToSave, { merge: true });
}


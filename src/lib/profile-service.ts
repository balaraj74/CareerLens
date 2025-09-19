'use client';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { UserProfile } from './types';
import type { User } from 'firebase/auth';

// Helper to safely convert Firestore Timestamps back to JS Date objects.
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
      const data = userDoc.data();
      const convertedData = convertTimestamps(data);
      return { success: true, data: convertedData as UserProfile };
    } else {
      return { success: true, data: null };
    }
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return { success: false, error: 'Failed to retrieve profile data from the server.' };
  }
}

/**
 * Creates or updates a user's profile in Firestore.
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

    const profileData: Partial<UserProfile> & { updatedAt: any; createdAt?: any } = {
        ...data,
        updatedAt: serverTimestamp(),
    };
    
    if (!docSnap.exists()) {
        profileData.createdAt = serverTimestamp();
    }

    await setDoc(userDocRef, profileData, { merge: true });
    return { success: true };
  } catch (err: any)
   {
    console.error('Error saving profile:', err);
    return { success: false, error: 'Failed to save profile changes to the server.' };
  }
}

/**
 * Fetches a user's profile, creating it if it doesn't exist.
 * This is the primary function to use when a user logs in.
 * @param user - The Firebase Auth user object.
 * @returns The user's profile data.
 */
export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return convertTimestamps(data) as UserProfile;
  } else {
    // Document doesn't exist, create it.
    const newUserProfile: UserProfile = {
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      dob: undefined,
      gender: '',
      photoURL: user.photoURL || '',
      linkedin: '',
      github: '',
      summary: '',
      careerGoals: '',
      education: [],
      experience: [],
      skills: [],
      interests: [],
      preferences: {
        location: '',
        remote: false,
        industries: [],
      },
    };

    const profileDataToSave = {
        ...newUserProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, profileDataToSave);

    // We return the local object, which is equivalent to what's in the DB.
    // The date fields will be undefined, which is fine for the initial state.
    return newUserProfile;
  }
}
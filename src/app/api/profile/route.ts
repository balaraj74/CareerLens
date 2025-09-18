
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Helper function to handle errors consistently.
const handleError = (message: string, status: number) => {
  console.error(`API Error: ${message}`);
  return NextResponse.json({ error: message }, { status });
};

export async function GET(request: Request) {
  // **Defensive Check**: Ensure adminDb was initialized before using it.
  if (!adminDb) {
    return handleError('Firebase Admin SDK not initialized.', 500);
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return handleError('User ID is required.', 400);
  }

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return handleError('User profile not found.', 404);
    }

    return NextResponse.json(userDoc.data());
  } catch (error: any) {
    return handleError(error.message || 'Failed to fetch user profile.', 500);
  }
}

export async function POST(request: Request) {
    // **Defensive Check**: Ensure adminDb was initialized before using it.
    if (!adminDb) {
        return handleError('Firebase Admin SDK not initialized.', 500);
    }

    try {
        const body = await request.json();
        const { userId, ...profileData } = body;

        if (!userId) {
            return handleError('User ID is required.', 400);
        }

        const userDocRef = adminDb.collection('users').doc(userId);
        await userDocRef.set({
            ...profileData,
            updatedAt: new Date().toISOString(),
        }, { merge: true });

        return NextResponse.json({ success: true, message: "Profile saved successfully." });
    } catch (error: any) {
        return handleError(error.message || 'Failed to save user profile.', 500);
    }
}

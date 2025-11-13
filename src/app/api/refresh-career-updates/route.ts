
import { NextResponse } from 'next/server';

// This would be your deployed function URL
const FUNCTION_URL = 'https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates';

export async function GET() {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST', // onRequest is POST by default
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error calling cloud function:', errorText);
      return NextResponse.json({ success: false, message: 'Failed to trigger refresh.' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in refresh API route:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while trying to refresh.' }, { status: 500 });
  }
}

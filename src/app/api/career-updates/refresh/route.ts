/**
 * API Route: Fetch Career Updates
 * Triggers manual refresh of career intelligence data
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const CLOUD_FUNCTION_URL = process.env.NEXT_PUBLIC_CAREER_UPDATES_FUNCTION_URL || 
      'https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates';

    // Call the Cloud Function
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Cloud Function returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Career updates refreshed successfully',
      data
    });

  } catch (error: any) {
    console.error('Error refreshing career updates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to refresh career updates'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger career updates refresh',
    endpoint: '/api/career-updates/refresh'
  });
}

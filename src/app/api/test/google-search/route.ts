import { NextRequest, NextResponse } from 'next/server';
import { searchCollegeReviews } from '@/lib/google-search-service';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing Google Custom Search...');
    
    // Search for college reviews
    const results = await searchCollegeReviews('PESIT Bangalore', 'JEE', { numResults: 5 });
    
    return NextResponse.json({
      success: true,
      count: results.length,
      sample: results.length > 0 ? {
        title: results[0].title.substring(0, 80),
        category: results[0].category,
        source: results[0].source,
        link: results[0].link
      } : null,
      message: results.length > 0
        ? `Successfully found ${results.length} results from Google Search`
        : 'Google Search API is working but no results found. Check your Search Engine configuration.'
    });
    
  } catch (error: any) {
    console.error('[API] Google Search test failed:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Failed to perform Google Search';
    let helpText = '';
    
    if (errorMessage.includes('credentials not configured')) {
      helpText = 'Add NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY to .env.local';
    } else if (errorMessage.includes('403')) {
      helpText = 'API key invalid or quota exceeded (100/day free tier)';
    } else if (errorMessage.includes('400')) {
      helpText = 'Invalid Search Engine ID or API request format';
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      help: helpText
    }, { status: 500 });
  }
}

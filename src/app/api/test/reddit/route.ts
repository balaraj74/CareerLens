import { NextRequest, NextResponse } from 'next/server';
import { fetchCollegeReviews } from '@/lib/reddit-api-service';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing Reddit API...');
    
    // Try multiple exam types to increase chances of finding results
    let reviews = await fetchCollegeReviews('JEE', 10);
    
    if (reviews.length === 0) {
      console.log('[API] No JEE reviews, trying General...');
      reviews = await fetchCollegeReviews('General', 10);
    }
    
    return NextResponse.json({
      success: true,
      count: reviews.length,
      sample: reviews.length > 0 ? {
        title: reviews[0].title,
        subreddit: reviews[0].subreddit,
        category: reviews[0].category,
        score: reviews[0].score,
        url: reviews[0].url
      } : null,
      message: reviews.length > 0 
        ? `Successfully fetched ${reviews.length} reviews from Reddit`
        : 'No reviews found. Reddit API is working but no matching posts found.'
    });
    
  } catch (error: any) {
    console.error('[API] Reddit API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Reddit reviews',
      details: 'Check console for more information'
    }, { status: 500 });
  }
}

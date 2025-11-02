import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment, quickSentimentCheck } from '@/lib/ai-summarizer-service';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing AI Summarizer...');
    
    // Test text
    const testText = "This college is amazing! Great faculty, excellent placement opportunities, and wonderful campus life. Highly recommend for engineering students.";
    
    // Quick sentiment check (no AI call needed)
    const quickSentiment = quickSentimentCheck(testText);
    
    // For full test, uncomment this (requires AI API call):
    // const sentiment = await analyzeSentiment(testText);
    
    return NextResponse.json({
      success: true,
      sentiment: quickSentiment,
      summary: "Quick sentiment analysis completed without AI call",
      message: "AI Summarizer is ready (quick test passed)"
    });
    
  } catch (error: any) {
    console.error('[API] AI Summarizer test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze sentiment'
    }, { status: 500 });
  }
}

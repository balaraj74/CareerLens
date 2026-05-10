import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

/**
 * POST /api/ai/moderate-content
 * Server-side endpoint for AI content moderation.
 * Keeps genkit (Node-only) out of the client bundle.
 */
export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const result = await callGemini(
      `Analyze the following content for inappropriate material, spam, offensive language, or harmful content. Respond with ONLY "APPROPRIATE" or "INAPPROPRIATE".\n\nContent: ${content}`,
      { temperature: 0.1, maxOutputTokens: 10 }
    );

    const isAppropriate = result.trim().toUpperCase() === 'APPROPRIATE';
    return NextResponse.json({ success: true, isAppropriate });
  } catch (error) {
    console.error('Error moderating content:', error);
    // Default to allowing content if AI moderation fails
    return NextResponse.json({ success: true, isAppropriate: true });
  }
}

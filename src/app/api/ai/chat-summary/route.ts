import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { chatText } = await req.json();

    if (!chatText) {
      return NextResponse.json({ summary: 'No chat content provided' });
    }

    const prompt = `Summarize this mentorship chat conversation in 2-3 sentences. Focus on key topics discussed and action items:\n\n${chatText}`;

    const summary = await callGemini(prompt, {
      temperature: 0.5,
      maxOutputTokens: 200,
    });

    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    console.error('Error generating chat summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

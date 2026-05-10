import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const text = await callGemini(prompt, {
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const colleges = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error('Error in college predictor:', error);
    return NextResponse.json(
      { error: 'Failed to predict colleges', colleges: [] },
      { status: 500 }
    );
  }
}

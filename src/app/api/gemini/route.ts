import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/gemini
 * Server-side endpoint to proxy Gemini calls for the mobile application.
 * Utilizes Vertex AI on the server to prevent API key exposure and expiration.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, options } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await callGemini(prompt, {
      model: options?.preferredModel || 'vertexai/gemini-2.5-flash',
      temperature: options?.temperature ?? 0.2,
    });

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in server Gemini proxy:', error);
    return NextResponse.json(
      { error: 'Gemini server call failed', message: error.message },
      { status: 500 }
    );
  }
}

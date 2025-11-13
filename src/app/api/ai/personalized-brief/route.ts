import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * AI Personalized Career Brief API
 * Generates personalized career updates for individual users
 */
export async function POST(req: NextRequest) {
  try {
    const { userName, userProfile, updates } = await req.json();

    const updatesList = updates.slice(0, 15).map((u: any) => 
      `${u.type}: ${u.title}`
    ).join('\n');

    const prompt = `You are an AI Career Advisor. Create a personalized career brief for ${userName}.

User Profile:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Career Goals: ${userProfile.goals?.join(', ') || 'Not specified'}

Recent Career Updates:
${updatesList}

Generate a friendly, personalized brief with:
1. greeting: A warm greeting with the user's name
2. keyUpdates: 3-4 most relevant updates for this user
3. recommendations: 3-4 personalized recommendations based on their skills and goals
4. opportunities: 3-4 specific job/internship/certification opportunities

Format as JSON only. Be conversational and encouraging.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const brief = JSON.parse(jsonMatch[0]);
      return NextResponse.json(brief);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating personalized brief:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized brief' },
      { status: 500 }
    );
  }
}

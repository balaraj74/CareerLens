import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export const dynamic = 'force-dynamic';

/**
 * AI Career Summary API
 * Generates intelligent career summaries using Vertex AI
 */
export async function POST(req: NextRequest) {
  try {
    const { updates, userProfile } = await req.json();

    // Build context from updates
    const updatesSummary = updates.map((u: any) => 
      `- ${u.type}: ${u.title} (${u.source})`
    ).join('\n');

    // Build user context
    const userContext = userProfile ? `
User Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
User Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
User Goals: ${userProfile.goals?.join(', ') || 'Not specified'}
` : '';

    const prompt = `You are an AI Career Intelligence Advisor. Analyze the following career updates and create a comprehensive summary.

${userContext}

Recent Career Updates:
${updatesSummary}

Generate a JSON response with:
1. weeklyHighlights: Array of 4-5 key highlights from the updates
2. topSkillsInDemand: Array of 5 top skills mentioned across updates
3. personalizedRecommendations: Array of 3-4 personalized recommendations based on user profile
4. industryTrends: A 2-3 sentence summary of current industry trends
5. actionableInsights: Array of 4-5 specific actions the user should take

Format as valid JSON only.`;

    const text = await callGemini(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return NextResponse.json(summary);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating career summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate career summary' },
      { status: 500 }
    );
  }
}

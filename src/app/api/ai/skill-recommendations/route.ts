import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/skill-recommendations
 * Server-side endpoint for AI skill recommendations.
 * Keeps genkit (Node-only) out of the client bundle.
 */
export async function POST(req: NextRequest) {
  try {
    const { goal, currentSkills, yearsOfExperience, educationLevel, interests } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: 'goal is required' }, { status: 400 });
    }

    const prompt = `
You are a career development AI assistant. Analyze the following user profile and recommend the next 5 most important skills they should learn.

User Profile:
- Career Goal: ${goal}
- Current Skills: ${(currentSkills || []).join(', ')}
- Years of Experience: ${yearsOfExperience || 0}
- Education: ${educationLevel || 'Bachelor'}
- Interests: ${(interests || []).join(', ')}

Provide 5 skill recommendations in JSON format with the following structure:
[
  {
    "name": "skill name",
    "category": "AI|Web|Data|Cloud|Mobile|DevOps|Design|Other",
    "description": "brief description of the skill",
    "difficulty": "Beginner|Intermediate|Advanced",
    "importanceScore": 0-100,
    "prerequisites": ["skill1", "skill2"],
    "estimatedLearningTime": "time estimate",
    "inDemand": true|false,
    "salaryImpact": "Low|Medium|High"
  }
]

Focus on skills that:
1. Build on their existing knowledge
2. Are in high demand for their career goal
3. Have a clear learning path
4. Will increase their marketability

Return ONLY the JSON array, no additional text.
`;

    const text = await callGemini(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const skillsData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data: skillsData });
  } catch (error) {
    console.error('Error generating skill recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

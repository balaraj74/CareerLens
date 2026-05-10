import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

/**
 * POST /api/ai/resource-recommendations
 * Server-side endpoint for AI resource/course recommendations.
 * Keeps genkit (Node-only) out of the client bundle.
 */
export async function POST(req: NextRequest) {
  try {
    const { userProfile, count } = await req.json();

    if (!userProfile) {
      return NextResponse.json({ error: 'userProfile is required' }, { status: 400 });
    }

    const prompt = `
You are a career development AI assistant. Analyze this user profile and recommend ${count || 5} FREE online courses/certifications that would be most beneficial for their career growth.

User Profile:
- Name: ${userProfile.name || 'Student'}
- Current Skills: ${(userProfile.skills || []).map((s: any) => s.name || s).join(', ')}
- Career Goal: ${userProfile.objective || 'Not specified'}
- Experience: ${(userProfile.experienceDetails || []).length} years

Available Platforms:
1. NPTEL (Indian, high quality, free certificates)
2. Coursera (with financial aid)
3. edX (audit mode free)
4. AWS Educate (cloud certifications)
5. Google Cloud Skills Boost
6. Microsoft Learn
7. MIT OpenCourseWare
8. Harvard Online
9. IBM SkillsBuild
10. FreeCodeCamp
11. Khan Academy

Return ONLY valid JSON array with this structure:
[
  {
    "title": "course title",
    "description": "what you'll learn",
    "url": "direct course URL",
    "provider": "platform name",
    "duration": "estimated time",
    "category": "category",
    "skills": ["skill1", "skill2"],
    "certificate": true,
    "free": true,
    "level": "Beginner|Intermediate|Advanced",
    "rating": 4.5,
    "enrollments": 50000,
    "isAIRecommended": true
  }
]

Focus on:
- Courses directly relevant to their career goals
- Mix of platforms
- All must be free or have free options
`;

    const text = await callGemini(prompt, {
      temperature: 0.7,
      maxOutputTokens: 3000,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const resourcesData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: resourcesData });
  } catch (error) {
    console.error('Error generating resource recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

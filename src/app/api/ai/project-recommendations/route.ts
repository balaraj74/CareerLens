import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/project-recommendations
 * Server-side endpoint for AI project recommendations.
 * Keeps genkit (Node-only) out of the client bundle.
 */
export async function POST(req: NextRequest) {
  try {
    const { skills, goal, difficulty, count } = await req.json();

    if (!skills || !goal) {
      return NextResponse.json({ error: 'skills and goal are required' }, { status: 400 });
    }

    const prompt = `
You are a senior software engineer and career mentor. Generate ${count || 3} practical project ideas for someone with these skills: ${(skills || []).join(', ')}.

Career Goal: ${goal}
Difficulty Level: ${difficulty || 'Intermediate'}

For each project, provide:
1. A catchy, specific title
2. Brief summary (1-2 sentences)
3. Detailed description
4. Exact tech stack needed
5. Estimated completion time
6. 3-5 learning goals
7. Step-by-step implementation phases with tasks
8. 2-3 bonus challenges to extend the project
9. Deployment options (e.g., Vercel, Google Cloud Run, AWS)
10. Real-world application or business value

Return ONLY valid JSON array with this structure:
[
  {
    "title": "project title",
    "summary": "brief summary",
    "description": "detailed description",
    "difficulty": "${difficulty || 'Intermediate'}",
    "techStack": ["tech1", "tech2"],
    "category": "AI/ML|Web App|Mobile App|Data Science|DevOps|Game|Tool|API",
    "estimatedTime": "time estimate",
    "learningGoals": ["goal1", "goal2"],
    "prerequisites": ["skill1"],
    "steps": [
      {"phase": "Phase 1", "tasks": ["task1", "task2"]}
    ],
    "bonusChallenges": ["challenge1", "challenge2"],
    "deploymentOptions": [
      {"platform": "platform name", "difficulty": "Easy|Medium|Hard"}
    ],
    "skillsYouWillLearn": ["skill1", "skill2"],
    "realWorldApplication": "how this applies to real jobs",
    "portfolioValue": "Low|Medium|High"
  }
]

Make projects:
- Practical and resume-worthy
- Build on existing skills while teaching new ones
- Include modern, in-demand technologies
- Have clear, achievable goals
`;

    const text = await callGemini(prompt, {
      temperature: 0.8,
      maxOutputTokens: 4096,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const projectsData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: projectsData });
  } catch (error) {
    console.error('Error generating project recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate project recommendations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

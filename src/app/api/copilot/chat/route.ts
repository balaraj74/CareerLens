import { NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { profile, message } = await req.json();

        const prompt = `
      You are CareerLens Copilot, an advanced AI career mentor.
      
      User Profile:
      - Name: ${profile.name || 'User'}
      - Title: ${profile.title || 'Aspiring Professional'}
      - Skills: ${profile.skills?.map((s: any) => s.name).join(', ') || 'None listed'}
      - Level: ${profile.level || 1}
      - Resume Score: ${profile.analytics?.resumeScore || 0}
      
      Context: The user is on their dashboard.
      
      Task:
      1. Analyze the profile and suggest ONE specific, high-impact action they should take in the app right now.
      2. Choose the most relevant internal route for this action from the list below:
         - /resume (for resume improvements)
         - /ai-career-hub (for skills, projects, and certifications)
         - /roadmap (for career path)
         - /career-navigator (for job search)
         - /interview-prep (for interview practice)
         - /community (for networking)
         - /calendar (for planning)
      
      Return a JSON object with the following structure:
      {
        "message": "A warm, encouraging, and futuristic message (max 2 sentences) explaining WHY they should take this action.",
        "actionUrl": "The specific route from the list above",
        "actionLabel": "A short, punchy button label (e.g., 'Improve Resume', 'Start Project', 'Find Jobs')"
      }
      
      Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
      
      ${message ? `User's specific question/request: "${message}"` : ''}
    `;

        const text = await callGemini(prompt, {
            temperature: 0.7,
            maxOutputTokens: 512,
        });

        let data;
        try {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = text.substring(firstBrace, lastBrace + 1);
                data = JSON.parse(jsonString);
            } else {
                throw new Error('No JSON object found in response');
            }
        } catch (e) {
            console.error('Failed to parse JSON from Gemini:', text);
            data = {
                message: text.replace(/```json/g, '').replace(/```/g, '').trim(),
                actionUrl: '/ai-career-hub',
                actionLabel: 'Explore Career Hub'
            };
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error generating copilot response:', error);
        return NextResponse.json({
            error: 'Failed to generate response',
            details: error.message,
        }, { status: 500 });
    }
}

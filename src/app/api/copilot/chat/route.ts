import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { profile, message } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up potential markdown formatting if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            // Find the first '{' and last '}' to extract the JSON object
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = text.substring(firstBrace, lastBrace + 1);
                data = JSON.parse(jsonString);
            } else {
                throw new Error('No JSON object found');
            }
        } catch (e) {
            console.error('Failed to parse JSON from Gemini:', text);
            // Fallback if JSON parsing fails
            data = {
                message: text.replace(/```json/g, '').replace(/```/g, '').trim(), // Use clean text as message
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
            stack: error.stack
        }, { status: 500 });
    }
}

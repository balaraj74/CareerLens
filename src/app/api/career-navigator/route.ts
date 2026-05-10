import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/ai/genkit';

const CAREER_NAVIGATOR_PROMPT = `You are CareerLens AI — an expert career architect for Indian students.

Generate a career decision tree based on the student's profile.

📊 OUTPUT EXACT JSON — NO MARKDOWN, NO CODE BLOCKS:
{
  "root": { "id": "root", "label": "Your Career Paths", "type": "root" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Stream/Career Name",
      "type": "stream|subject|exam|degree|career",
      "level": "grade11|ug|pg|career",
      "score": 85,
      "summary": "Brief 1-line summary",
      "metadata": {
        "durationYears": 4,
        "salaryRange": { "min": 400000, "max": 3500000 },
        "difficulty": "high",
        "demand": "high",
        "demandTrend": "↑23% YoY",
        "futureProofRating": 9,
        "topCompanies": ["Google", "TCS"]
      },
      "actions": {
        "exams": ["JEE Main"],
        "courses": ["BTech CSE"],
        "certifications": [
          { "title": "AWS SA", "platform": "AWS", "url": "https://aws.training" }
        ],
        "skills": ["Python", "ML"],
        "projects": ["Build ML model"]
      },
      "children": ["child-id-1"],
      "sources": ["NASSCOM"]
    }
  ],
  "edges": [
    { "from": "root", "to": "node-id", "type": "leads_to", "label": "Best Match" }
  ],
  "insights": [
    "Key insight about student's path"
  ]
}

RULES:
1. Generate 10-15 nodes MAX (keep it focused, not exhaustive)
2. Keep summaries SHORT (under 20 words each)
3. Keep skills/exams/courses arrays to 3-5 items each
4. Keep certifications to 1-2 per node
5. Use real 2025 Indian salary data (INR)
6. Score paths 0-100: interest match (40%) + demand (30%) + salary (30%)
7. Output ONLY valid JSON — no text before { or after }
8. Use double quotes for all keys and values
9. No trailing commas`;

/**
 * Attempt to repair truncated JSON from AI responses.
 * Closes any open arrays/objects to make it parseable.
 */
function repairTruncatedJson(raw: string): string {
  let text = raw
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1) {
    throw new Error('No JSON object found in AI response');
  }

  // If we have a complete-looking object, extract it
  if (lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  } else {
    // Truncated — take from first brace to end
    text = text.substring(firstBrace);
  }

  // Fix common JSON issues
  text = text
    .replace(/,\s*}/g, '}')   // trailing commas before }
    .replace(/,\s*]/g, ']')   // trailing commas before ]
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ');

  // Try parsing as-is first
  try {
    JSON.parse(text);
    return text;
  } catch {
    // Fall through to repair logic
  }

  // Count unclosed brackets/braces and close them
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (const ch of text) {
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // If we're inside a string, close it
  if (inString) text += '"';

  // Remove trailing comma before we close
  text = text.replace(/,\s*$/, '');

  // Close any dangling key without value (e.g. `"key":` at end)
  text = text.replace(/:\s*$/, ': null');

  // Close unclosed brackets and braces
  for (let i = 0; i < openBrackets; i++) text += ']';
  for (let i = 0; i < openBraces; i++) text += '}';

  // Final cleanup
  text = text
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const { currentGrade, selectedStream, selectedSubjects, interests, region } = await request.json();

    const userContext = `
Student Profile:
- Current Level: ${currentGrade || 'Grade 10'}
- Subjects: ${selectedSubjects ? JSON.stringify(selectedSubjects) : '["General"]'}
- Interests: ${interests ? JSON.stringify(interests) : '["Technology"]'}
- Region: ${region || 'India'}

Generate a focused career decision tree (10-15 nodes max) for this student.
Output ONLY valid JSON.`;

    const fullPrompt = CAREER_NAVIGATOR_PROMPT + '\n\n' + userContext;

    const responseText = await callGemini(fullPrompt, {
      temperature: 0.5,
      maxOutputTokens: 16384,
      topP: 0.9,
      topK: 40,
    });

    // Repair and parse the response
    const repairedJson = repairTruncatedJson(responseText);

    let careerData;
    try {
      careerData = JSON.parse(repairedJson);
    } catch (parseError: any) {
      console.error('[career-navigator] JSON Parse Error:', parseError.message);
      console.error('[career-navigator] Raw response (first 500):', responseText.substring(0, 500));
      console.error('[career-navigator] Repaired (last 200):', repairedJson.slice(-200));
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Ensure required structure exists
    if (!careerData.nodes || !Array.isArray(careerData.nodes)) {
      careerData.nodes = [];
    }
    if (!careerData.edges || !Array.isArray(careerData.edges)) {
      careerData.edges = [];
    }
    if (!careerData.insights || !Array.isArray(careerData.insights)) {
      careerData.insights = [];
    }
    if (!careerData.root) {
      careerData.root = { id: 'root', label: 'Your Career Paths', type: 'root' };
    }

    return NextResponse.json({
      success: true,
      data: careerData,
      metadata: {
        nodesCount: careerData.nodes.length,
        edgesCount: careerData.edges?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[career-navigator] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate career pathway',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

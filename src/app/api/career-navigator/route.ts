import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CAREER_NAVIGATOR_PROMPT = `You are CareerLens AI — an expert career architect trained on global and Indian education pathways.

Your task is to generate a complete multi-level "Career Path Tree" based on student's current grade, interests, and region.

🎓 COVER ALL EDUCATION STREAMS:

GRADE 10 → STREAMS:
• Science (PCMC, PCMB, PCME, PCMCs, Electronics, Biotech, CS)
• Commerce (With Maths, Without Maths, CA Foundation)
• Arts/Humanities (Psychology, Journalism, Law, Design)
• Diploma/Polytechnic/ITI/Vocational (NSQF)

EXAMS TO INCLUDE:
• JEE Main/Advanced, NEET, KCET, COMEDK, BITSAT, CUET
• CLAT, AILET, NID, NIFT, UCEED
• CA Foundation, CS Executive
• GATE, IIT-JAM, GMAT, GRE, SAT, TOEFL

DEGREES (UG + PG):
• BTech/BE (CSE, AI/ML, ECE, Mechanical, Civil, Aerospace, Robotics)
• MBBS, BDS, BPT, Nursing, BPharm, PharmD
• BCom, BBA, BMS, CA, CMA, CS, Actuarial Science
• BA (Psych, Journalism, Law prep), BFA, B.Ed, B.Arch
• BSc (Pure sciences, Data Science, Bioinformatics)

CAREERS:
• Tech: Software Engineer, Data Scientist, ML Engineer, DevOps, Cloud Architect, Cybersecurity Expert, Full-Stack Dev, AI Researcher
• Medical: Doctor, Dentist, Physiotherapist, Nurse, Pharmacist, Medical Researcher
• Business: CA, Consultant, Investment Banker, Financial Analyst, Entrepreneur, Product Manager, Marketing Manager
• Creative: Designer, Architect, Animator, Content Creator, Journalist, Filmmaker
• Government: IAS, IPS, IES, Bank PO, SSC, Defense

💼 FOR EACH CAREER NODE INCLUDE:
• Job roles (3-5 examples)
• Required skills (ranked by importance)
• Salary: Fresher (₹), Mid-level (₹), Senior (₹)
• Top companies hiring (Indian + Global)
• Demand trend: ↑23% YoY / ↓5% YoY
• Future-proof rating: 1-10
• Certifications: Google, AWS, Coursera, NPTEL
• Recommended projects

🎨 PERSONALIZATION LOGIC:
• Match interests to paths (AI/ML → PCMC → BTech CSE/AI)
• Score nodes 0-100 based on: interest match (40%) + market demand (30%) + salary potential (30%)
• Add insight cards: "Science stream opens widest opportunities" / "AI/ML jobs growing 23% YoY"

📊 OUTPUT EXACT JSON SCHEMA:
{
  "root": { "id": "root", "label": "Your Career Paths", "type": "root" },
  "nodes": [
    {
      "id": "unique-node-id",
      "label": "Computer Science & AI",
      "type": "stream|subject|exam|degree|career",
      "level": "grade11|ug|pg|career",
      "score": 95,
      "summary": "Top choice for tech careers. High demand, excellent pay, remote-friendly.",
      "metadata": {
        "durationYears": 4,
        "salaryRange": { "min": 400000, "max": 3500000 },
        "difficulty": "high",
        "demand": "high",
        "demandTrend": "↑23% YoY",
        "futureProofRating": 9,
        "topCompanies": ["Google", "Microsoft", "Amazon", "Flipkart", "TCS"]
      },
      "actions": {
        "exams": ["JEE Main", "BITSAT", "VITEEE"],
        "courses": ["BTech CSE", "BTech AI/ML", "BSc Computer Science"],
        "certifications": [
          { "title": "AWS Solutions Architect", "platform": "AWS", "url": "https://aws.training" },
          { "title": "Google Data Analytics", "platform": "Coursera", "url": "https://coursera.org/google" }
        ],
        "skills": ["Python", "Data Structures", "Machine Learning", "Cloud Computing", "System Design"],
        "projects": ["Build ML model", "Create web app", "Contribute to open source"]
      },
      "children": ["node-id-1", "node-id-2"],
      "sources": ["IEEE", "NASSCOM", "LinkedIn Jobs Report 2025"]
    }
  ],
  "edges": [
    { "from": "root", "to": "node-id", "type": "leads_to", "label": "Best Match" }
  ],
  "insights": [
    "Based on your AI/ML interest, Computer Science is the perfect fit",
    "Tech careers offer highest starting salaries in India (₹4-15 LPA)",
    "Remote work opportunities make tech careers location-independent"
  ]
}

🎯 CRITICAL RULES:
1. Generate 20-30 nodes with clear parent-child hierarchy
2. Use real 2025 salary data for India
3. Include top 5 universities per path (IITs, NITs, AIIMS, private)
4. Add lateral entry options (Diploma → BTech, BSc → MSc)
5. Include international pathway options (GRE → MS abroad)
6. Mark trending careers with fire emoji in insights
7. **CRITICAL**: Output ONLY valid JSON. No markdown, no code blocks, no extra text before or after JSON
8. **CRITICAL**: Ensure all strings are properly escaped, no trailing commas, valid array/object syntax
9. **CRITICAL**: Use double quotes for all keys and string values
10. **CRITICAL**: Do NOT include any text before the opening { or after the closing }`;

export async function POST(request: NextRequest) {
  try {
    const { currentGrade, selectedStream, selectedSubjects, interests, region } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const userContext = `
INPUT:
{
  "currentLevel": "${currentGrade}",
  "currentSubjects": ${selectedSubjects ? JSON.stringify(selectedSubjects) : '[]'},
  "preferredInterests": ${interests ? JSON.stringify(interests) : '["general"]'},
  "region": "${region || 'India'}"
}

INSTRUCTION:
Generate a complete career decision tree for the above student profile. Include:
- All possible streams/subjects for next academic level
- Major entrance exams with difficulty ratings
- Bachelor/Master degree options with top colleges
- Career paths with salary ranges (INR), job roles, companies
- Certifications and online courses (Coursera, NPTEL, Udemy)
- Score each path based on: market demand + salary potential + student interests
- Include modern tech careers (AI/ML, Cloud, DevOps, Data Science)
- Add traditional careers (Doctor, Engineer, CA, IAS, Lawyer)
- Provide 15-25 nodes with parent-child relationships

Output ONLY the JSON schema specified above. NO markdown, NO extra text.`;

    const fullPrompt = CAREER_NAVIGATOR_PROMPT + '\n\n' + userContext;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: fullPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.9,
            topK: 40,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Details:', errorText);
      throw new Error(`Gemini API failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    let responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Clean up response - remove markdown, code fences, extra whitespace
    responseText = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    // Find the first { and last }
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON found in response');
    }
    
    responseText = responseText.substring(firstBrace, lastBrace + 1);
    
    // Try to fix common JSON issues
    responseText = responseText
      .replace(/,\s*}/g, '}')  // Remove trailing commas before }
      .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
      .replace(/\n/g, ' ')      // Remove newlines
      .replace(/\r/g, '')       // Remove carriage returns
      .replace(/\t/g, ' ')      // Replace tabs with spaces
      .replace(/\s+/g, ' ');    // Normalize whitespace
    
    let careerData;
    try {
      careerData = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Problematic JSON (first 500 chars):', responseText.substring(0, 500));
      console.error('Problematic JSON (last 500 chars):', responseText.substring(responseText.length - 500));
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Validate structure
    if (!careerData.nodes || !Array.isArray(careerData.nodes)) {
      throw new Error('Invalid response structure from AI: missing or invalid nodes array');
    }
    
    if (!careerData.edges || !Array.isArray(careerData.edges)) {
      careerData.edges = []; // Default to empty edges if not provided
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
    console.error('Career Navigator API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate career pathway',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

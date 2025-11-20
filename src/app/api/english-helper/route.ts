import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { userMessage, conversationHistory, topic, proficiency } = await request.json();

    // Build system prompt based on context
    const systemPrompt = `You are an English conversation teacher helping a ${proficiency} level student practice ${topic} conversations. 
    
Your role:
- Keep responses conversational and natural (2-3 sentences max)
- Ask follow-up questions to encourage the student to speak more
- Provide gentle corrections when needed
- Adapt vocabulary to the student's proficiency level
- Be encouraging and supportive
- Keep the conversation flowing smoothly
- Focus on the ${topic} topic

Remember: Your goal is to help the student practice speaking, so keep your responses brief to give them more speaking time.`;

    // Format conversation history for Gemini
    const contents = [
      {
        parts: [{ text: systemPrompt }]
      },
      ...conversationHistory.slice(-6).map((msg: Message) => ({
        parts: [{ text: msg.text }]
      })),
      {
        parts: [{ text: userMessage }]
      }
    ];

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 150, // Keep responses short
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I'm here to help you practice. Could you tell me more?";

    // Analyze the user's message for feedback
    const feedback = analyzeMessage(userMessage, proficiency);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      feedback: feedback,
    });

  } catch (error) {
    console.error('English Helper API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        response: "I'm sorry, I'm having trouble right now. Let's continue practicing." 
      },
      { status: 500 }
    );
  }
}

// Analyze user's message for feedback
function analyzeMessage(message: string, proficiency: string) {
  const feedback: Array<{
    type: 'grammar' | 'pronunciation' | 'vocabulary' | 'fluency';
    message: string;
    severity: 'error' | 'warning' | 'info';
  }> = [];

  const words = message.toLowerCase().split(' ');
  const wordCount = words.length;

  // Grammar checks
  const grammarIssues = [
    { pattern: /\bi is\b|\bhe go\b|\bshe go\b|\bthey is\b/i, message: 'Check subject-verb agreement' },
    { pattern: /\bdon't has\b|\bdoesn't have to\b/i, message: 'Verb form error detected' },
    { pattern: /\bmore better\b|\bmore easier\b/i, message: 'Avoid double comparatives' },
  ];

  grammarIssues.forEach(({ pattern, message: msg }) => {
    if (pattern.test(message)) {
      feedback.push({ type: 'grammar', message: msg, severity: 'error' });
    }
  });

  // Vocabulary assessment
  const advancedWords = ['consequently', 'furthermore', 'nevertheless', 'moreover', 'therefore', 'although', 'whereas'];
  const hasAdvancedVocab = advancedWords.some(word => message.toLowerCase().includes(word));
  
  if (hasAdvancedVocab && proficiency !== 'basic') {
    feedback.push({ 
      type: 'vocabulary', 
      message: 'Great use of advanced vocabulary!', 
      severity: 'info' 
    });
  }

  // Fluency assessment
  if (wordCount > 15) {
    feedback.push({ 
      type: 'fluency', 
      message: 'Excellent sentence length and fluency!', 
      severity: 'info' 
    });
  } else if (wordCount < 5 && proficiency !== 'basic') {
    feedback.push({ 
      type: 'fluency', 
      message: 'Try to elaborate more in your responses', 
      severity: 'warning' 
    });
  }

  // Basic pronunciation tips (based on common patterns)
  if (message.includes('th') && proficiency === 'basic') {
    feedback.push({ 
      type: 'pronunciation', 
      message: 'Remember to pronounce "th" correctly', 
      severity: 'info' 
    });
  }

  return feedback;
}

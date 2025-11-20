'use server';
/**
 * @fileOverview Genkit flows for English Helper conversational practice
 * Generates starter prompts and follow-up responses with feedback
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input/Output schemas
export const EnglishHelperInputSchema = z.object({
  topic: z.enum(['daily', 'interview', 'travel', 'technical', 'idioms', 'debate']),
  proficiency: z.enum(['basic', 'intermediate', 'advanced']),
  accent: z.enum(['american', 'british', 'australian', 'neutral']),
});

export const EnglishHelperStarterSchema = z.object({
  greeting: z.string().describe('Warm, friendly greeting to start the conversation'),
});

export const EnglishHelperFollowupInputSchema = z.object({
  transcript: z.array(z.object({
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
    timestamp: z.string(),
  })),
  topic: z.string(),
  proficiency: z.string(),
});

export const EnglishHelperFollowupSchema = z.object({
  response: z.string().describe('Natural, conversational response that continues the practice'),
  feedback: z.object({
    grammar: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    vocabulary: z.object({
      newWords: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    pronunciation: z.object({
      score: z.number().min(0).max(100),
      tips: z.array(z.string()),
    }),
    fluency: z.object({
      score: z.number().min(0).max(100),
      observations: z.array(z.string()),
    }),
    encouragement: z.string(),
  }),
  isEndOfSession: z.boolean().describe('True after 5-7 exchanges or when practice goal is met'),
});

export type EnglishHelperInput = z.infer<typeof EnglishHelperInputSchema>;
export type EnglishHelperStarter = z.infer<typeof EnglishHelperStarterSchema>;
export type EnglishHelperFollowupInput = z.infer<typeof EnglishHelperFollowupInputSchema>;
export type EnglishHelperFollowup = z.infer<typeof EnglishHelperFollowupSchema>;

/**
 * Generate initial greeting for English practice session
 */
export async function getEnglishHelperStarter(
  input: EnglishHelperInput
): Promise<EnglishHelperStarter> {
  const systemPrompt = `You are a friendly, encouraging English conversation partner helping someone practice their spoken English.

Your role:
- Create a warm, welcoming atmosphere
- Be patient and supportive
- Adapt to the user's proficiency level: ${input.proficiency}
- Focus on the topic: ${input.topic}

Start with a natural, friendly greeting that invites conversation. Keep it simple and encouraging.`;

  const topicDescriptions = {
    daily: 'everyday conversations like hobbies, routines, and daily activities',
    interview: 'professional interview scenarios and career discussions',
    travel: 'travel experiences, destinations, and cultural exchanges',
    technical: 'technical topics, problem-solving, and professional concepts',
    idioms: 'English idioms, expressions, and their usage',
    debate: 'discussing different viewpoints and expressing opinions',
  };

  const llmResponse = await ai.generate({
    prompt: `${systemPrompt}

Generate a warm greeting to start practicing ${topicDescriptions[input.topic]}.

Examples:
- "Hi there! I'm so glad you're here to practice with me. Let's talk about your day - what's been the most interesting part so far?"
- "Hello! It's great to see you! I'd love to hear about your hobbies. What do you enjoy doing in your free time?"
- "Welcome! Let's have a fun conversation. Tell me, have you traveled anywhere exciting recently?"

Make it natural, friendly, and encouraging. Keep it to 2-3 sentences max.`,
    model: 'googleai/gemini-2.5-flash-lite',
    config: {
      temperature: 0.9,
      topP: 0.95,
    },
    output: {
      format: 'json',
      schema: EnglishHelperStarterSchema,
    },
  });

  if (!llmResponse.output) {
    throw new Error('Failed to generate starter prompt');
  }

  return llmResponse.output;
}

/**
 * Generate follow-up response with detailed feedback
 */
export async function getEnglishHelperFollowup(
  input: EnglishHelperFollowupInput
): Promise<EnglishHelperFollowup> {
  const conversationHistory = input.transcript
    .map((item) => `${item.speaker === 'ai' ? 'Teacher' : 'Student'}: ${item.text}`)
    .join('\n');

  const lastUserResponse = input.transcript
    .filter((item) => item.speaker === 'user')
    .pop()?.text || '';

  const exchangeCount = input.transcript.filter((item) => item.speaker === 'ai').length;

  const systemPrompt = `You are a supportive English conversation teacher providing practice and feedback.

CONVERSATION CONTEXT:
${conversationHistory}

STUDENT'S LAST RESPONSE: "${lastUserResponse}"

YOUR TASK:
1. Analyze the student's response for:
   - Grammar accuracy (tense usage, sentence structure, word order)
   - Vocabulary richness and appropriateness
   - Fluency indicators (hesitations, filler words, coherence)
   - Pronunciation considerations (common mistakes for learners)

2. Provide constructive feedback:
   - Point out specific errors gently
   - Suggest corrections and improvements
   - Highlight what they did well
   - Introduce new vocabulary naturally

3. Continue the conversation:
   - Ask a follow-up question that relates to what they said
   - Keep it natural and encouraging
   - Adjust difficulty to their proficiency: ${input.proficiency}
   - Stay on topic: ${input.topic}

4. End the session after ${exchangeCount >= 5 ? '1-2 more exchanges' : '5-7 total exchanges'}

TONE: Friendly, patient, encouraging, but honest about areas for improvement`;

  const llmResponse = await ai.generate({
    prompt: `${systemPrompt}

Based on the student's response, provide:
1. A natural conversational response that continues the practice
2. Detailed feedback on their English (grammar, vocabulary, pronunciation, fluency)
3. Encouragement and next steps
4. Set isEndOfSession to ${exchangeCount >= 6 ? 'true if wrapping up' : 'false (continue practicing)'}

Be specific about errors you notice, but frame them positively. For example:
- Instead of "You made a mistake", say "Great effort! A small tip: we usually say 'I have been' instead of 'I have been was'"
- Celebrate what they're doing right: "I love how you used the word 'fascinating' - that's advanced vocabulary!"

Keep your conversational response to 2-3 sentences max. Make it feel like a real conversation, not a lecture.`,
    model: 'googleai/gemini-2.5-flash-lite',
    config: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
    },
    output: {
      format: 'json',
      schema: EnglishHelperFollowupSchema,
    },
  });

  if (!llmResponse.output) {
    throw new Error('Failed to generate follow-up response');
  }

  return llmResponse.output;
}


'use server';
/**
 * @fileOverview This file defines the Genkit flow for a conversational AI interviewer.
 * It handles generating follow-up questions and detecting the end of the interview.
 * The TTS and audio logic has been moved to the client.
 */

import { ai } from '@/ai/genkit';
import {
  AiInterviewerInputSchema,
  AiInterviewerFlowOutputSchema,
  type AiInterviewerInput,
  type AiInterviewerFlowOutput,
  type TranscriptItem,
} from '@/ai/schemas/ai-interviewer-flow';
import { z } from 'zod';

export async function aiInterviewerFollowup(input: AiInterviewerInput): Promise<AiInterviewerFlowOutput> {
    return aiInterviewerFlow(input);
}

const systemPrompt = `You are "Alex", a friendly and experienced interviewer conducting a conversational interview. 

KEY BEHAVIORS:
- Listen carefully to what the candidate says and respond DIRECTLY to their specific answers
- Ask follow-up questions that dig deeper into what they just mentioned
- Be natural and conversational, like you're having a real dialogue
- Reference specific details from their previous answers
- Show genuine interest in their responses
- Use phrases like "That's interesting...", "Can you tell me more about...", "You mentioned X, could you elaborate..."
- Keep questions short and focused (1-2 sentences max)
- Vary your question types: clarifying questions, behavioral questions, situational questions
- After 5-7 meaningful exchanges, naturally conclude the interview

IMPORTANT: Never ask generic questions that ignore what the candidate just said. Always build on the conversation.

When concluding (after 5-7 questions), say something warm like "Thank you for sharing all of that with me. I think we have a good sense of your background now. Is there anything you'd like to ask me before we wrap up?" Then set isEndOfInterview to true.
`;

const aiInterviewerFollowupPrompt = ai.definePrompt({
    name: 'aiInterviewerFollowupPrompt',
    system: systemPrompt,
    input: { schema: AiInterviewerInputSchema },
    output: { schema: AiInterviewerFlowOutputSchema },
    prompt: `
      Job Description: ${"{{jobDescription}}"}
      Conversation History is attached. Based on the last user response, ask the next question or conclude the interview.
    `,
    model: 'googleai/gemini-2.5-flash-lite',
});


export const aiInterviewerFlow = ai.defineFlow(
  {
    name: 'aiInterviewerFlow',
    inputSchema: AiInterviewerInputSchema,
    outputSchema: AiInterviewerFlowOutputSchema,
  },
  async (input) => {
    const { transcript, jobDescription } = input;

    // Build the conversation history with proper context
    let conversationContext = `You are conducting an interview for the role: ${jobDescription || 'Software Engineer'}.\n\n`;
    conversationContext += "Conversation so far:\n";
    
    transcript.forEach((item: TranscriptItem, index: number) => {
      if (item.speaker === 'ai') {
        conversationContext += `Interviewer: ${item.text}\n`;
      } else {
        conversationContext += `Candidate: ${item.text}\n`;
      }
    });

    // Get the last user response to understand context
    const lastUserResponse = transcript.filter(item => item.speaker === 'user').pop()?.text || '';
    
    // Count how many questions have been asked
    const questionCount = transcript.filter(item => item.speaker === 'ai').length;
    
    // Build a dynamic prompt that responds to what the user actually said
    const dynamicPrompt = `${conversationContext}

Based on the candidate's last response: "${lastUserResponse}"

${questionCount >= 5 ? 'You have asked several questions. Consider wrapping up the interview soon with a concluding statement.' : 'Generate a thoughtful, natural follow-up question that directly relates to what the candidate just said. Ask for specific examples, clarifications, or dive deeper into their experience.'}

Respond naturally as if you're having a real conversation. Reference specific things the candidate mentioned. Be engaging and conversational.

Question count so far: ${questionCount}

Return a JSON object with:
- followUp: Your next question or statement (be conversational and specific to their answer)
- isEndOfInterview: ${questionCount >= 6 ? 'true if you want to conclude, false to continue' : 'false (continue the interview)'}`;

    const llmResponse = await ai.generate({
        prompt: dynamicPrompt,
        model: 'googleai/gemini-2.5-flash-lite',
        config: {
          temperature: 0.8, // Higher temperature for more natural, varied responses
          topK: 40,
          topP: 0.95,
        },
        output: {
            format: 'json',
            schema: z.object({
                followUp: z.string().describe("Your next question or statement, directly responding to what the candidate said."),
                isEndOfInterview: z.boolean().describe("Set to true only when concluding the interview after 5-7 questions."),
            })
        }
    });

    const output = llmResponse.output;

    if (!output) {
      throw new Error('AI failed to generate a response.');
    }

    // Return only text and end-of-interview flag. Audio is handled client-side.
    return {
        followUp: output.followUp,
        isEndOfInterview: output.isEndOfInterview,
    };
  }
);

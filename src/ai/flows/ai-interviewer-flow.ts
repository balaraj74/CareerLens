
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

const systemPrompt = `You are "Alex", an expert career coach and interviewer. Your persona is professional, encouraging, and insightful. Your goal is to conduct a realistic and helpful mock interview.
You will be given the job description, and the entire conversation history.
Your task is to analyze the user's most recent answer and generate the next logical follow-up question or conversational turn.
Keep your responses concise, natural, and to the point, ideally 1-2 sentences.
The interview should progress naturally. After about 5-7 questions, you should conclude the interview.
When you decide the interview is over, your response MUST be a concluding statement (e.g., "That's all the questions I have for you. You did a great job.") and you MUST set the "isEndOfInterview" flag to true.
At the very end of the entire interview, you will provide a comprehensive performance report. The report should have a headline "## Performance Report" and include feedback on clarity, confidence, use of examples (like the STAR method), and suggestions for improvement.
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
    const { transcript } = input;

    const history = transcript.map((item: TranscriptItem) => ({
      role: item.speaker === 'user' ? 'user' : 'model',
      content: [{ text: item.text }],
    }));

    const llmResponse = await ai.generate({
        prompt: `Job Description: ${input.jobDescription || 'Not provided.'}. Based on the last user response, ask the next question or conclude the interview.`,
        history,
        model: 'googleai/gemini-2.5-flash-lite',
        system: systemPrompt,
        output: {
            schema: z.object({
                followUp: z.string().describe("The AI's next question or statement in the conversation."),
                isEndOfInterview: z.boolean().describe("Set to true only when the interview should be concluded."),
            })
        }
    });

    const output = llmResponse.output;

    if (!output) {
      throw new Error('AI failed to generate a response.');
    }

    // Return only text and end-of-interview flag. Audio is handled client-side.
    return {
        ...output,
    };
  }
);

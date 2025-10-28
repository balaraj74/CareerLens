
'use server';
/**
 * @fileOverview This file defines the Genkit flow for a conversational AI interviewer.
 * It handles generating follow-up questions and detecting the end of the interview.
 */

import { ai } from '@/ai/genkit';
import {
  AiInterviewerInputSchema,
  AiInterviewerFlowOutputSchema,
  type AiInterviewerInput,
  type AiInterviewerFlowOutput,
} from '@/ai/schemas/ai-interviewer-flow';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import wav from 'wav';


export async function aiInterviewerFollowup(input: AiInterviewerInput): Promise<AiInterviewerFlowOutput> {
    return aiInterviewerStream(input);
}


const systemPrompt = `You are "Alex", an expert career coach and interviewer. Your persona is professional, encouraging, and insightful. Your goal is to conduct a realistic and helpful mock interview.
You will be given the user's profile, the job description, and the entire conversation history.
Your task is to analyze the user's most recent answer and generate the next logical follow-up question or conversational turn.
Keep your responses concise and natural-sounding, ideally 1-3 sentences.
The interview should progress naturally. After about 5-7 questions, you should conclude the interview.
When you decide the interview is over, your response MUST be a concluding statement (e.g., "That's all the questions I have for you. You did a great job.") and you MUST set the "isEndOfInterview" flag to true.
At the very end of the entire interview, you will provide a comprehensive performance report. The report should have a headline "## Performance Report" and include feedback on clarity, confidence, use of examples (like the STAR method), and suggestions for improvement.
`;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export const aiInterviewerStream = ai.defineFlow(
  {
    name: 'aiInterviewerStream',
    inputSchema: AiInterviewerInputSchema,
    outputSchema: AiInterviewerFlowOutputSchema,
  },
  async (input) => {
    const { userProfile, jobDescription, transcript } = input;

    const llm = ai.getModel('googleai/gemini-2.5-flash-lite');

    const history = transcript.map(item => ({
      role: item.speaker === 'user' ? 'user' : 'model',
      content: [{ text: item.text }],
    }));

    const finalPrompt = `
      User Profile: ${JSON.stringify(userProfile)}
      Job Description: ${jobDescription || 'Not provided.'}
      Conversation History is attached. Based on the last user response, ask the next question or conclude the interview.
    `;

    // Step 1: Generate the text response
    const llmResponse = await llm.generate({
      system: systemPrompt,
      history,
      prompt: finalPrompt,
      output: {
          schema: z.object({
            followUp: z.string().describe("The AI's next question or statement in the conversation."),
            isEndOfInterview: z.boolean().describe("Set to true only when the interview should be concluded."),
          })
      }
    });

    const output = llmResponse.output!;

    // Step 2: Generate audio from the text response
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: output.followUp,
    });

    if (!media) {
      throw new Error('no media returned from TTS model');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    // Step 3: Combine results and return
    return {
        ...output,
        audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

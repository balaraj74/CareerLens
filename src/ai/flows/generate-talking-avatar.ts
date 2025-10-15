'use server';
/**
 * @fileOverview A Genkit flow for generating a talking avatar video using Veo.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const GenerateTalkingAvatarInputSchema = z.object({
  text: z.string().describe('The text the avatar should speak.'),
  character: z.string().describe('A description of the avatar character.'),
});
export type GenerateTalkingAvatarInput = z.infer<typeof GenerateTalkingAvatarInputSchema>;

export const GenerateTalkingAvatarOutputSchema = z.object({
  videoUrl: z.string().url().describe('The data URL of the generated video.'),
});
export type GenerateTalkingAvatarOutput = z.infer<typeof GenerateTalkingAvatarOutputSchema>;

async function pollOperation(operation: any): Promise<any> {
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            operation = await ai.checkOperation(operation);
        } catch (e) {
            console.error("Polling error", e);
            // Decide if you want to retry or just fail
            throw new Error("Failed while polling for video generation status.");
        }
    }
    return operation;
}


export const generateTalkingAvatar = ai.defineFlow(
  {
    name: 'generateTalkingAvatar',
    inputSchema: GenerateTalkingAvatarInputSchema,
    outputSchema: GenerateTalkingAvatarOutputSchema,
  },
  async ({ text, character }) => {
    
    const prompt = `${character}. The character is speaking the following words: "${text}"`;
    
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: prompt,
      config: {
        aspectRatio: '16:9',
        personGeneration: 'allow_adult',
      }
    });

    if (!operation) {
        throw new Error("Video generation failed to start.");
    }
    
    const finalOperation = await pollOperation(operation);

    if (finalOperation.error) {
      throw new Error(`Video generation failed: ${finalOperation.error.message}`);
    }

    const videoPart = finalOperation.output?.message?.content.find((p: any) => !!p.media);
    if (!videoPart || !videoPart.media?.url) {
      throw new Error('No video was generated in the operation result.');
    }

    // The URL from Veo is temporary and needs the API key to be accessed.
    // We fetch it on the server and convert to a data URI to send to the client.
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
        `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (!videoDownloadResponse.ok) {
        throw new Error(`Failed to download video file: ${videoDownloadResponse.statusText}`);
    }

    const videoBuffer = await videoDownloadResponse.buffer();
    const videoDataUrl = `data:${videoPart.media.contentType || 'video/mp4'};base64,${videoBuffer.toString('base64')}`;

    return {
      videoUrl: videoDataUrl,
    };
  }
);

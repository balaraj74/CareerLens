'use server';
/**
 * @fileOverview A Genkit flow for generating a talking avatar video using Veo.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateTalkingAvatarInputSchema, GenerateTalkingAvatarOutputSchema, type GenerateTalkingAvatarInput } from '@/ai/schemas/generate-talking-avatar';

async function pollOperation(operation: any): Promise<any> {
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            operation = await ai.checkOperation(operation);
        } catch (e) {
            console.error("Polling failed, but continuing to allow main flow to handle final state.", e);
        }
    }
    return operation;
}

const generateTalkingAvatarFlow = ai.defineFlow(
  {
    name: 'generateTalkingAvatarFlow',
    inputSchema: GenerateTalkingAvatarInputSchema,
    outputSchema: GenerateTalkingAvatarOutputSchema,
  },
  async ({ text, character }) => {
    
    const prompt = `A medium close-up shot of ${character}, looking directly at the camera and speaking as if in a video call. The character says the following words: "${text}"`;
    
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
        personGeneration: 'allow_adult',
      }
    });

    if (!operation) {
        throw new Error("Video generation failed to start.");
    }
    
    const finalOperation = await pollOperation(operation);

    if (finalOperation.error) {
      if (finalOperation.error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please wait a few moments and try again.');
      }
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

    const videoBuffer = await videoDownloadResponse.arrayBuffer();
    const videoDataUrl = `data:${videoPart.media.contentType || 'video/mp4'};base64,${Buffer.from(videoBuffer).toString('base64')}`;

    return {
      videoUrl: videoDataUrl,
    };
  }
);


export async function generateTalkingAvatar(input: GenerateTalkingAvatarInput) {
    return generateTalkingAvatarFlow(input);
}

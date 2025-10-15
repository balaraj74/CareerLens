'use server';
/**
 * @fileOverview A Genkit flow for generating a talking avatar video using Veo.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GenerateTalkingAvatarInputSchema, GenerateTalkingAvatarOutputSchema, type GenerateTalkingAvatarInput } from '@/ai/schemas/generate-talking-avatar';

async function pollOperation(operation: any): Promise<any> {
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        // The try/catch is removed here to let the main flow handle promise rejections.
        operation = await ai.checkOperation(operation);
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
    
    const prompt = `${character}. The character is speaking the following words: "${text}"`;
    
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: prompt,
      config: {
        aspectRatio: '16:9',
        personGeneration: 'allow_all',
      }
    });

    if (!operation) {
        throw new Error("Video generation failed to start.");
    }
    
    // The polling operation is now wrapped in a try/catch in the main flow.
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

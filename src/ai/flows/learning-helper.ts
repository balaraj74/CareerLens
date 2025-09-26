'use server';

/**
 * @fileOverview This file defines the Genkit flows for the AI Learning Helper feature.
 *
 * - processPdf - A function that takes a PDF and returns various learning aids.
 * - LearningHelperInput - The input type for the processPdf function.
 * - LearningHelperOutput - The return type for the processPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const LearningHelperInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of study material, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type LearningHelperInput = z.infer<typeof LearningHelperInputSchema>;

export const LearningHelperOutputSchema = z.object({
  quickPoints: z
    .array(z.string())
    .describe('A summarized list of key points from the document in bullet format.'),
});
export type LearningHelperOutput = z.infer<typeof LearningHelperOutputSchema>;

export async function processPdf(input: LearningHelperInput): Promise<LearningHelperOutput> {
  return learningHelperFlow(input);
}

const extractTextPrompt = ai.definePrompt({
    name: 'extractTextFromPdfPrompt',
    input: { schema: LearningHelperInputSchema },
    prompt: `Extract all text content from the provided PDF document. Organize it in a structured and readable format.
  
    PDF Document: {{media url=pdfDataUri}}`,
});

const quickPointsPrompt = ai.definePrompt({
  name: 'generateQuickPointsPrompt',
  input: { schema: z.object({ textContent: z.string() }) },
  output: { schema: LearningHelperOutputSchema },
  prompt: `You are an AI learning assistant. Your task is to summarize the given text content into a concise list of key bullet points.
  
  Focus on the main concepts, definitions, formulas, and important takeaways.
  
  Extracted Text:
  \`\`\`
  {{{textContent}}}
  \`\`\`
  
  Generate the summary and format it as a valid JSON object.`,
});


const learningHelperFlow = ai.defineFlow(
  {
    name: 'learningHelperFlow',
    inputSchema: LearningHelperInputSchema,
    outputSchema: LearningHelperOutputSchema,
  },
  async (input) => {
    // Step 1: Extract text from the PDF
    const textExtractionResponse = await extractTextPrompt(input);
    const textContent = textExtractionResponse.text;

    // Step 2: Generate quick points from the extracted text
    const quickPointsResponse = await quickPointsPrompt({ textContent });
    
    // Step 3: Return the structured output
    return quickPointsResponse.output!;
  }
);

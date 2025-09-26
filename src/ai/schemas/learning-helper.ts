/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the AI Learning Helper feature.
 */
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

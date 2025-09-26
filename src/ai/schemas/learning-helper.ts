/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the AI Learning Helper feature. It is now the primary input schema.
 */
import { z } from 'genkit';

// This remains the input for the entire flow.
export const LearningHelperInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of study material, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type LearningHelperInput = z.infer<typeof LearningHelperInputSchema>;

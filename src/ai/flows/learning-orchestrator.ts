'use server';

/**
 * @fileOverview This file defines the main Genkit flow for the AI Learning Helper.
 * It orchestrates the process of extracting text from a PDF and generating
 * multiple learning aids like summaries, deep dives, mind maps, and quizzes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  LearningOrchestratorInputSchema,
  LearningOrchestratorOutputSchema,
  type LearningOrchestratorInput,
  type LearningOrchestratorOutput,
} from '@/ai/schemas/learning-orchestrator';

// Define a prompt to extract text content from a PDF.
const extractTextPrompt = ai.definePrompt({
  name: 'extractTextFromPdfPrompt',
  input: { schema: LearningOrchestratorInputSchema },
  prompt: `Extract all text content from the provided PDF document. Your primary goal is to capture the core information accurately.
  Organize the extracted text in a structured and readable format.
  
  PDF Document: {{media url=pdfDataUri}}`,
  model: 'googleai/gemini-2.5-flash-lite',
});

// Define the main prompt that generates all the learning materials.
const learningContentPrompt = ai.definePrompt({
  name: 'generateLearningContentPrompt',
  input: { schema: z.object({ textContent: z.string() }) },
  output: { schema: LearningOrchestratorOutputSchema },
  prompt: `You are an expert AI Learning Assistant. Your task is to transform the following text content into a comprehensive set of study materials.
  
  Please generate the following based on the text provided:
  1.  **Quick Points**: A concise list of the most important bullet points, definitions, and key takeaways.
  2.  **Deep Dive**: A detailed, structured explanation of the core concepts. Use Markdown for formatting (headings, bold, lists).
  3.  **Mind Map**: A hierarchical JSON structure representing the main topics and their sub-points. Each node should have an 'id', 'label', and optional 'children' array.
  4.  **Exam Mode**: A set of varied practice questions (multiple choice, true/false, short answer) with correct answers to test understanding.

  Extracted Text:
  \`\`\`
  {{{textContent}}}
  \`\`\`
  
  Format the entire output as a single, valid JSON object that conforms to the specified output schema.
  `,
  model: 'googleai/gemini-2.5-flash-lite',
});

// Define the main orchestration flow.
export const learningOrchestratorFlow = ai.defineFlow(
  {
    name: 'learningOrchestratorFlow',
    inputSchema: LearningOrchestratorInputSchema,
    outputSchema: LearningOrchestratorOutputSchema,
  },
  async (input: LearningOrchestratorInput): Promise<LearningOrchestratorOutput> => {
    // Step 1: Extract text from the PDF using the specialized prompt.
    const textExtractionResponse = await extractTextPrompt(input);
    const textContent = textExtractionResponse.text;

    // Step 2: Generate all learning content from the extracted text in a single call.
    const learningContentResponse = await learningContentPrompt({ textContent });
    
    // Step 3: Return the structured output.
    // The '!' asserts that the output will not be null, which is expected here.
    return learningContentResponse.output!;
  }
);

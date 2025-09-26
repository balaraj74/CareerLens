'use server';

/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the AI Learning Helper orchestrator flow.
 */
import { z } from 'genkit';

// Schema for the input of the main orchestrator flow.
export const LearningOrchestratorInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of study material, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type LearningOrchestratorInput = z.infer<typeof LearningOrchestratorInputSchema>;

// Recursive schema for a tree-like mind map structure.
const MindMapNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().describe('A unique identifier for the node.'),
    label: z.string().describe('The text label for this node of the mind map.'),
    children: z.array(MindMapNodeSchema).optional().describe('An array of child nodes.'),
  })
);

// Schema for a single exam question.
const ExamQuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).describe('An array of possible answers for multiple-choice questions.'),
    answer: z.string().describe('The correct answer.'),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']).describe('The type of question.'),
});

// Schema for the final, structured output of the orchestrator.
export const LearningOrchestratorOutputSchema = z.object({
  quickPoints: z
    .array(z.string())
    .describe('A summarized list of key points from the document in bullet format.'),
  deepDive: z
    .string()
    .describe('A detailed, structured explanation of the core concepts, formatted in Markdown.'),
  mindMap: MindMapNodeSchema.describe('A hierarchical mind map of the content.'),
  examQuestions: z
    .array(ExamQuestionSchema)
    .describe('A list of practice questions for self-assessment.'),
});
export type LearningOrchestratorOutput = z.infer<typeof LearningOrchestratorOutputSchema>;

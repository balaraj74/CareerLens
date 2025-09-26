'use server';

/**
 * @fileOverview This file defines the Genkit flows for the AI Learning Helper feature.
 *
 * - processPdf - A function that takes a PDF and returns various learning aids.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    LearningHelperInputSchema, 
    type LearningHelperInput,
} from '@/ai/schemas/learning-helper';
import { 
    learningOrchestratorFlow, 
    type LearningOrchestratorOutput 
} from './learning-orchestrator';


export async function processPdf(input: LearningHelperInput): Promise<LearningOrchestratorOutput> {
  // This flow now acts as a wrapper around the more powerful orchestrator
  return learningOrchestratorFlow(input);
}

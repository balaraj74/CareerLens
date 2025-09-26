
'use server';

import { generateCareerRecommendations as genkitGenerateCareerRecommendations } from '@/ai/flows/generate-career-recommendations';
import { performSkillGapAnalysis } from '@/ai/flows/perform-skill-gap-analysis';
import { createPersonalizedRoadmap } from '@/ai/flows/create-personalized-roadmap';
import { generateResumeFromJson } from '@/ai/flows/generate-resume-from-json';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { processPdf } from '@/ai/flows/learning-helper';

import type { GenerateCareerRecommendationsInput, GenerateCareerRecommendationsOutput } from '@/ai/schemas/career-recommendations';
import type { SkillGapAnalysisInput, SkillGapAnalysisOutput } from '@/ai/flows/perform-skill-gap-analysis';
import type { CreatePersonalizedRoadmapInput, CreatePersonalizedRoadmapOutput } from '@/ai/flows/create-personalized-roadmap';
import type { GenerateResumeFromJsonInput, GenerateResumeFromJsonOutput } from '@/ai/flows/generate-resume-from-json';
import type { GenerateInterviewQuestionsInput, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import type { LearningHelperInput } from '@/ai/schemas/learning-helper';
import type { LearningOrchestratorOutput } from '@/ai/schemas/learning-orchestrator';


export async function getCareerRecommendations(
  input: GenerateCareerRecommendationsInput
): Promise<{ success: boolean; data?: GenerateCareerRecommendationsOutput; error?: string }> {
  try {
    const result = await genkitGenerateCareerRecommendations(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate recommendations.' };
  }
}

export async function getSkillGapAnalysis(input: SkillGapAnalysisInput): Promise<{ success: boolean; data?: SkillGapAnalysisOutput; error?: string }> {
  try {
    const result = await performSkillGapAnalysis(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to perform skill gap analysis.' };
  }
}

export async function getPersonalizedRoadmap(
  input: CreatePersonalizedRoadmapInput
): Promise<{ success: boolean; data?: CreatePersonalizedRoadmapOutput; error?: string }> {
  try {
    const result = await createPersonalizedRoadmap(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to create roadmap.' };
  }
}

export async function getResumeJson(input: GenerateResumeFromJsonInput): Promise<{ success: boolean; data?: GenerateResumeFromJsonOutput; error?: string }> {
  try {
    const result = await generateResumeFromJson(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate resume.' };
  }
}

export async function getInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<{ success: boolean; data?: GenerateInterviewQuestionsOutput; error?: string }> {
  try {
    const result = await generateInterviewQuestions(input);
    return { success: true, data: result };
  } catch (error: any)
   {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate questions.' };
  }
}

export async function getLearningHelperOutput(
  input: LearningHelperInput
): Promise<{ success: boolean; data?: LearningOrchestratorOutput; error?: string }> {
  try {
    const result = await processPdf(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to process PDF.' };
  }
}

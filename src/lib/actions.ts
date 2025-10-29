
'use server';

import { generateCareerRecommendations as genkitGenerateCareerRecommendations } from '@/ai/flows/generate-career-recommendations';
import { performSkillGapAnalysis } from '@/ai/flows/perform-skill-gap-analysis';
import { createPersonalizedRoadmap } from '@/ai/flows/create-personalized-roadmap';
import { generateResumeFromJson } from '@/ai/flows/generate-resume-from-json';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { processPdf } from '@/ai/flows/learning-helper';
import { generateFirstInterviewQuestion } from '@/ai/flows/ai-interviewer';
import { aiInterviewerFollowup as genkitAiInterviewerFollowup } from '@/ai/flows/ai-interviewer-flow';


import type { GenerateCareerRecommendationsInput, GenerateCareerRecommendationsOutput } from '@/ai/schemas/career-recommendations';
import type { SkillGapAnalysisInput, SkillGapAnalysisOutput } from '@/ai/schemas/perform-skill-gap-analysis';
import type { CreatePersonalizedRoadmapInput, CreatePersonalizedRoadmapOutput } from '@/ai/schemas/create-personalized-roadmap';
import type { GenerateResumeFromJsonInput, GenerateResumeFromJsonOutput } from '@/ai/schemas/generate-resume-from-json';
import type { GenerateInterviewQuestionsInput, GenerateInterviewQuestionsOutput } from '@/ai/schemas/generate-interview-questions';
import type { LearningHelperInput } from '@/ai/schemas/learning-helper';
import type { LearningOrchestratorOutput } from '@/ai/schemas/learning-orchestrator';
import type { AiInterviewerInput, AiInterviewerOutput } from '@/ai/schemas/ai-interviewer';
import type { AiInterviewerInput as AiInterviewerFollowupInput, AiInterviewerFlowOutput as AiInterviewerFollowupOutput } from '@/ai/schemas/ai-interviewer-flow';


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

export async function getResumeJson(input: any): Promise<{ success: boolean; data?: GenerateResumeFromJsonOutput; error?: string }> {
  try {
    // The profile data is now directly at the top level of the payload due to form structure.
    const payload = {
      ...(input.profile || {}),
      manual: input.manual,
      jobDescription: input.jobDescription,
      email: input.profile.email, // Ensure email is passed if available
    };
    
    const result = await generateResumeFromJson(payload as GenerateResumeFromJsonInput);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in getResumeJson (adapter):", error);
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


export async function getAiInterviewerResponse(
  input: Omit<AiInterviewerInput, 'userProfile'>
): Promise<{ success: boolean; data?: AiInterviewerOutput; error?: string }> {
  try {
    const result = await generateFirstInterviewQuestion(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to get AI interviewer response.' };
  }
}

export async function getAiInterviewerFollowup(
  input: Omit<AiInterviewerFollowupInput, 'userProfile'>
): Promise<{ success: boolean; data?: AiInterviewerFollowupOutput; error?: string }> {
  try {
    const result = await genkitAiInterviewerFollowup(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to get AI followup.' };
  }
}

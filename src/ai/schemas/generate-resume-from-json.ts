/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the resume generation flow.
 */

import { z } from 'genkit';
import { userProfileSchema } from '@/lib/types';

// Input schema now includes manual overrides and an optional job description.
export const GenerateResumeFromJsonInputSchema = userProfileSchema.extend({
  manual: z.object({
      fullName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      summary: z.string().optional(),
      experience: z.string().optional().describe('Manual entry for experience, can be bullet points or paragraph.'),
      education: z.string().optional().describe('Manual entry for education.'),
      projects: z.string().optional().describe('Manual entry for projects.'),
      skills: z.string().optional().describe('Comma-separated list of skills.'),
  }).describe('Manual overrides or additions from the user.'),
  jobDescription: z.string().optional().describe('The job description to compare against for ATS scoring.'),
  email: z.string().email().optional(), // Add email from auth user
});
export type GenerateResumeFromJsonInput = z.infer<typeof GenerateResumeFromJsonInputSchema>;


export const GenerateResumeFromJsonOutputSchema = z.object({
  resumeText: z.string().describe('The full, ATS-optimized resume as a formatted string.'),
  atsScore: z.number().describe('The ATS-friendliness score from 0 to 100.'),
  atsExplanation: z.string().describe('A brief explanation of the ATS score.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations to improve the resume.'),
});
export type GenerateResumeFromJsonOutput = z.infer<typeof GenerateResumeFromJsonOutputSchema>;

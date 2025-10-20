/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the skill gap analysis flow.
 */

import { z } from 'genkit';

export const SkillGapAnalysisInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe('A list of skills possessed by the user.'),
  targetRoleRequirements: z
    .array(z.string())
    .describe('A list of skills required for the target role.'),
});
export type SkillGapAnalysisInput = z.infer<typeof SkillGapAnalysisInputSchema>;

export const SkillGapAnalysisOutputSchema = z.object({
  overlappingSkills: z
    .array(z.string())
    .describe('Skills that the user possesses which are also required for the target role.'),
  missingSkills: z
    .array(z.string())
    .describe('Skills that are required for the target role but not possessed by the user.'),
  suggestedLearningOrder: z
    .array(z.string())
    .describe('A suggested order for learning the missing skills, based on dependencies and prerequisites.'),
});
export type SkillGapAnalysisOutput = z.infer<typeof SkillGapAnalysisOutputSchema>;

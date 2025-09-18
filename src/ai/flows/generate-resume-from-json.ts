'use server';

/**
 * @fileOverview Generates a resume in JSON format from user profile information.
 *
 * - generateResumeFromJson - A function that generates a resume in JSON format.
 * - GenerateResumeFromJsonInput - The input type for the generateResumeFromJson function.
 * - GenerateResumeFromJsonOutput - The return type for the generateResumeFromJson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeFromJsonInputSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  email: z.string().email().describe('The email address of the user.'),
  phone: z.string().describe('The phone number of the user.'),
  linkedin: z.string().url().optional().describe('The LinkedIn profile URL of the user.'),
  github: z.string().url().optional().describe('The GitHub profile URL of the user.'),
  skills: z.array(z.string()).describe('A list of skills the user possesses.'),
  experience: z.array(z.object({
    title: z.string().describe('The job title.'),
    company: z.string().describe('The company name.'),
    startDate: z.string().describe('The start date of the job.'),
    endDate: z.string().describe('The end date of the job, or "Present" if currently employed.'),
    description: z.string().describe('A description of the job responsibilities.'),
  })).describe('A list of work experiences.'),
  education: z.array(z.object({
    institution: z.string().describe('The name of the educational institution.'),
    degree: z.string().describe('The degree obtained.'),
    startDate: z.string().describe('The start date of the education.'),
    endDate: z.string().describe('The end date of the education.'),
    description: z.string().optional().describe('A description of the education, including relevant coursework or achievements.'),
  })).describe('A list of educational experiences.'),
  summary: z.string().describe('A brief summary of the user.'),
}).describe('User profile information.');
export type GenerateResumeFromJsonInput = z.infer<typeof GenerateResumeFromJsonInputSchema>;

const GenerateResumeFromJsonOutputSchema = z.object({
  resumeJson: z.string().describe('A JSON string representing the resume data.'),
});
export type GenerateResumeFromJsonOutput = z.infer<typeof GenerateResumeFromJsonOutputSchema>;

export async function generateResumeFromJson(input: GenerateResumeFromJsonInput): Promise<GenerateResumeFromJsonOutput> {
  return generateResumeFromJsonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeJsonPrompt',
  input: {schema: GenerateResumeFromJsonInputSchema},
  output: {schema: GenerateResumeFromJsonOutputSchema},
  prompt: `You are an expert resume writer. You will receive user profile information and generate a clean, professional resume in JSON format. Ensure the JSON is valid and includes all provided information.

User Profile:
{{{input}}}

The output must be a single JSON object with a key "resumeJson" which is a string of the resume data. Do not include any surrounding text, only the JSON.
`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const generateResumeFromJsonFlow = ai.defineFlow(
  {
    name: 'generateResumeFromJsonFlow',
    inputSchema: GenerateResumeFromJsonInputSchema,
    outputSchema: GenerateResumeFromJsonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Attempt to parse the JSON to ensure it's valid
    try {
      JSON.parse(output!.resumeJson);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Failed to generate valid JSON resume.');
    }
    return output!;
  }
);

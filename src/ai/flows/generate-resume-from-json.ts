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

// Updated input schema to be more comprehensive as per user request
const GenerateResumeFromJsonInputSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  email: z.string().email().describe('The email address of the user.'),
  phone: z.string().describe('The phone number of the user.'),
  linkedin: z.string().url().optional().describe('The LinkedIn profile URL of the user.'),
  github: z.string().url().optional().describe('The GitHub profile URL of the user.'),
  summary: z.string().describe('A brief professional summary of the user (2-3 sentences).'),
  experience: z.array(z.object({
    title: z.string().describe('The job title.'),
    company: z.string().describe('The company name.'),
    startDate: z.string().describe('The start date of the job (e.g., "Jan 2020").'),
    endDate: z.string().describe('The end date of the job, or "Present" if currently employed (e.g., "Present").'),
    description: z.string().describe('A description of the job responsibilities and key achievements. Use action verbs.'),
  })).describe('A list of work experiences.'),
  education: z.array(z.object({
    institution: z.string().describe('The name of the educational institution.'),
    degree: z.string().describe('The degree obtained (e.g., "Bachelor of Science in Computer Science").'),
    startDate: z.string().describe('The start date of the education (e.g., "Sep 2016").'),
    endDate: z.string().describe('The end date of the education (e.g., "May 2020").'),
    description: z.string().optional().describe('A brief description of relevant coursework or honors.'),
  })).describe('A list of educational experiences.'),
  skills: z.array(z.string()).describe('A list of key skills the user possesses (e.g., "TypeScript", "React", "Node.js").'),
}).describe('User profile information for resume generation.');
export type GenerateResumeFromJsonInput = z.infer<typeof GenerateResumeFromJsonInputSchema>;

// Output schema remains the same, as we want a JSON string.
const GenerateResumeFromJsonOutputSchema = z.object({
  resumeJson: z.string().describe('A JSON string representing the complete, structured resume data.'),
});
export type GenerateResumeFromJsonOutput = z.infer<typeof GenerateResumeFromJsonOutputSchema>;

export async function generateResumeFromJson(input: GenerateResumeFromJsonInput): Promise<GenerateResumeFromJsonOutput> {
  return generateResumeFromJsonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeJsonPrompt',
  input: {schema: GenerateResumeFromJsonInputSchema},
  output: {schema: GenerateResumeFromJsonOutputSchema},
  prompt: `You are an expert resume writer and ATS (Applicant Tracking System) optimizer. You will receive user profile information and generate a clean, professional, and well-structured resume in JSON format.
  
  Instructions:
  1.  Use the provided user data to fill out all fields.
  2.  Ensure the generated JSON is valid and strictly adheres to the output schema.
  3.  For experience descriptions, use strong action verbs and focus on achievements.
  4.  The entire output must be a single JSON object with a key "resumeJson", where the value is a JSON string. Do not include any surrounding text, markdown, or explanations.

  User Profile Data:
  \`\`\`json
  {{{jsonStringify input}}}
  \`\`\`
`, 
  config: {
    // Increased safety threshold to avoid blocking valid content.
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
    // The AI model can sometimes struggle with complex nested JSON.
    // By providing the input as a stringified JSON block within the prompt,
    // we give it a clearer context of the data it needs to transform.
    const {output} = await prompt({
        ...input,
        // Helper to stringify the input for the prompt
        jsonStringify: (obj: any) => JSON.stringify(obj, null, 2),
    });

    // We still need to validate the output to ensure the AI followed instructions.
    try {
      JSON.parse(output!.resumeJson);
    } catch (e) {
      console.error('AI generated invalid JSON:', output?.resumeJson);
      console.error('Error parsing JSON:', e);
      throw new Error('Failed to generate a valid JSON resume. The AI model returned malformed data.');
    }
    return output!;
  }
);

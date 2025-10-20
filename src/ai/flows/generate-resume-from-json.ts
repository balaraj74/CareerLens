
'use server';

/**
 * @fileOverview Generates an ATS-optimized resume from user profile information and a job description.
 *
 * - generateResumeFromJson - A function that orchestrates the resume generation and ATS analysis.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateResumeFromJsonInputSchema,
    GenerateResumeFromJsonOutputSchema,
    type GenerateResumeFromJsonInput,
    type GenerateResumeFromJsonOutput
} from '@/ai/schemas/generate-resume-from-json';


export async function generateResumeFromJson(input: GenerateResumeFromJsonInput): Promise<GenerateResumeFromJsonOutput> {
  return generateResumeFromJsonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeJsonPrompt',
  input: {schema: GenerateResumeFromJsonInputSchema},
  output: {schema: GenerateResumeFromJsonOutputSchema},
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert resume writer and ATS (Applicant Tracking System) optimizer. Your task is to create a professional, ATS-friendly resume.

  **Instructions:**

  1.  **Merge Data:** Combine the user's saved profile data with their manual input. The manual input should take precedence if there's an overlap.
  2.  **Analyze and Rewrite:**
      *   Rewrite experience and project descriptions into concise, professional bullet points. Start each bullet with a strong action verb.
      *   Focus on quantifiable achievements (e.g., "Increased sales by 20%" or "Reduced server costs by 15%").
      *   Ensure the language is professional and tailored to corporate or tech roles.
  3.  **ATS Optimization:**
      *   If a \`jobDescription\` is provided, analyze it for key skills, technologies, and qualifications.
      *   Integrate these keywords naturally into the generated resume text, especially in the summary and experience sections.
  4.  **Calculate ATS Score:**
      *   Based on the keyword matching, formatting, and overall quality, provide an \`atsScore\` from 0-100. A score of 85+ is good.
      *   Provide a brief \`atsExplanation\` for the score.
  5.  **Provide Recommendations:**
      *   Give a list of actionable \`recommendations\` to improve the resume and its ATS score.

  **User Profile Data:**
  Name: {{name}}
  Email: {{email}}
  Phone: {{phone}}
  LinkedIn: {{linkedin}}
  GitHub: {{github}}
  Summary: {{bio}}
  Career Goals: {{careerGoals}}
  
  Experience:
  {{#each experience}}
  - Role: {{this.role}}, Company: {{this.company}}, Duration: {{this.years}}, Description: {{this.description}}
  {{/each}}
  
  Education:
  {{#each education}}
  - Degree: {{this.degree}}, Field: {{this.field}}, Institution: {{this.institution}}, Year: {{this.year}}
  {{/each}}
  
  Skills:
  {{#each skills}}
  - {{this.name}}
  {{/each}}

  **User Manual Input (Overrides Profile):**
  Full Name: {{manual.fullName}}
  Email: {{manual.email}}
  Phone: {{manual.phone}}
  LinkedIn: {{manual.linkedin}}
  GitHub: {{manual.github}}
  Summary: {{manual.summary}}
  Experience: {{manual.experience}}
  Education: {{manual.education}}
  Projects: {{manual.projects}}
  Skills: {{manual.skills}}
  
  **Target Job Description:**
  \`\`\`
  {{{jobDescription}}}
  \`\`\`

  Generate the complete resume as a formatted string in \`resumeText\` and provide the ATS analysis. The output must be a single, valid JSON object.
  `, 
   config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
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
    return output!;
  }
);

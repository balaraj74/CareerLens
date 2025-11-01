'use server';
/**
 * Dynamic Project Builder AI Flow
 * Suggests projects based on skill gaps and generates detailed project plans
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProjectSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number(),
  skillsToLearn: z.array(z.string()),
  technologies: z.array(z.string()),
  impact: z.string(),
  marketValue: z.enum(['high', 'medium', 'low']),
});

const ProjectPlanSchema = z.object({
  overview: z.string(),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()),
  techStack: z.object({
    frontend: z.array(z.string()).optional(),
    backend: z.array(z.string()).optional(),
    database: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }),
  fileStructure: z.array(z.object({
    path: z.string(),
    description: z.string(),
  })),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    tasks: z.array(z.string()),
  })),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['documentation', 'tutorial', 'video', 'article']),
  })),
  challenges: z.array(z.string()),
  extensions: z.array(z.string()),
});

/**
 * Analyze user's skill graph and suggest projects
 */
export async function suggestProjects(
  currentSkills: string[],
  targetRole: string,
  skillGaps: string[],
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
): Promise<Array<z.infer<typeof ProjectSuggestionSchema>>> {
  const prompt = ai.definePrompt({
    name: 'suggestProjects',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        currentSkills: z.array(z.string()),
        targetRole: z.string(),
        skillGaps: z.array(z.string()),
        experienceLevel: z.string(),
      }),
    },
    output: {
      schema: z.object({
        projects: z.array(ProjectSuggestionSchema),
      }),
    },
    prompt: `
You are an expert career advisor and project architect specializing in skill development.

**User Profile:**
- Current Skills: {{#each currentSkills}}{{this}}, {{/each}}
- Target Role: {{targetRole}}
- Skill Gaps: {{#each skillGaps}}{{this}}, {{/each}}
- Experience Level: {{experienceLevel}}

**Task:** Suggest 5 high-impact project ideas that will:
1. Fill the identified skill gaps
2. Build a strong portfolio for {{targetRole}}
3. Be realistic for {{experienceLevel}} level
4. Have high market value for job applications

**For each project, provide:**
- title: Catchy, professional project name
- description: 2-3 sentences explaining the project
- difficulty: beginner, intermediate, or advanced
- estimatedHours: Realistic time to complete (20-100 hours)
- skillsToLearn: 3-5 specific skills gained from this project
- technologies: Specific tools/frameworks/languages to use
- impact: Why this project will impress recruiters (1 sentence)
- marketValue: high/medium/low based on current job market demand

**Project Selection Criteria:**
1. **Portfolio-worthy**: Should demonstrate real-world problem solving
2. **Modern Stack**: Use current, in-demand technologies
3. **Progressive Complexity**: Match user's experience level
4. **Skill Coverage**: Target multiple skill gaps per project
5. **Interview Talking Points**: Create stories for behavioral interviews

**Examples of Good Projects:**
- Beginner: Personal finance tracker (React, Node.js, MongoDB)
- Intermediate: Real-time collaboration tool (Next.js, WebSockets, Redis)
- Advanced: Distributed system or ML pipeline (Kubernetes, Kafka, TensorFlow)

Focus on projects that are:
- Practical and useful
- Technically impressive
- Resume-building
- Learn-by-doing
- Open-source ready

Return 5 project suggestions ranked by impact and relevance.
`,
  });

  try {
    const response = await prompt({
      currentSkills,
      targetRole,
      skillGaps,
      experienceLevel,
    });

    return response.output?.projects || [];
  } catch (error) {
    console.error('Error suggesting projects:', error);
    throw new Error('Failed to generate project suggestions');
  }
}

/**
 * Generate detailed project plan with step-by-step guide
 */
export async function generateProjectPlan(
  projectTitle: string,
  projectDescription: string,
  targetSkills: string[],
  userExperience: string
): Promise<z.infer<typeof ProjectPlanSchema>> {
  const prompt = ai.definePrompt({
    name: 'generateProjectPlan',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        projectTitle: z.string(),
        projectDescription: z.string(),
        targetSkills: z.array(z.string()),
        userExperience: z.string(),
      }),
    },
    output: {
      schema: ProjectPlanSchema,
    },
    prompt: `
You are a senior software architect creating a comprehensive project blueprint.

**Project:** {{projectTitle}}
**Description:** {{projectDescription}}
**Skills to Learn:** {{#each targetSkills}}{{this}}, {{/each}}
**User Experience:** {{userExperience}}

**Create a detailed, actionable project plan with:**

1. **Overview** (2-3 paragraphs):
   - What the project does
   - Why it's valuable
   - What makes it impressive

2. **Learning Objectives** (5-7 items):
   - Specific skills and concepts
   - Technical competencies gained
   - Real-world applications

3. **Prerequisites** (3-5 items):
   - Required knowledge
   - Tools to install
   - Accounts to create

4. **Tech Stack**:
   - Frontend: Frameworks, libraries, styling
   - Backend: Runtime, frameworks, APIs
   - Database: Type, ORM, migrations
   - Tools: Dev tools, deployment, CI/CD

5. **File Structure** (10-15 files):
   - path: Relative file path
   - description: What this file does

6. **Implementation Steps** (5-8 major phases):
   Each step:
   - title: Phase name
   - description: What you'll build
   - duration: Estimated time (e.g., "4-6 hours")
   - tasks: 3-5 specific action items

7. **Resources** (8-12 items):
   - Official documentation
   - Relevant tutorials
   - Video courses
   - Key articles
   Include real URLs when possible

8. **Challenges** (4-6 items):
   - Common pitfalls
   - Technical difficulties
   - How to overcome them

9. **Extensions** (5-7 ideas):
   - Features to add later
   - Ways to enhance complexity
   - Portfolio improvements

**Guidelines:**
- Be specific and actionable
- Include code structure details
- Provide realistic time estimates
- Focus on best practices
- Make it portfolio-ready
- Include deployment steps

Make this a professional-grade blueprint that someone can follow to build a impressive project.
`,
  });

  try {
    const response = await prompt({
      projectTitle,
      projectDescription,
      targetSkills,
      userExperience,
    });

    return response.output || {
      overview: '',
      learningObjectives: [],
      prerequisites: [],
      techStack: {},
      fileStructure: [],
      steps: [],
      resources: [],
      challenges: [],
      extensions: [],
    };
  } catch (error) {
    console.error('Error generating project plan:', error);
    throw new Error('Failed to generate project plan');
  }
}

/**
 * Generate GitHub README content for the project
 */
export async function generateProjectReadme(
  projectTitle: string,
  projectDescription: string,
  techStack: any,
  features: string[]
): Promise<string> {
  const prompt = ai.definePrompt({
    name: 'generateProjectReadme',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        projectTitle: z.string(),
        projectDescription: z.string(),
        techStack: z.string(),
        features: z.array(z.string()),
      }),
    },
    output: {
      schema: z.object({
        readme: z.string(),
      }),
    },
    prompt: `
Generate a professional GitHub README.md for this project:

**Project:** {{projectTitle}}
**Description:** {{projectDescription}}
**Tech Stack:** {{techStack}}
**Features:** {{#each features}}{{this}}, {{/each}}

Create a comprehensive README with:
- Project banner/title
- Badges (build, license, etc.)
- Description
- Features list
- Tech stack
- Getting started
- Installation steps
- Usage examples
- Screenshots section
- Contributing guidelines
- License

Use Markdown formatting, emojis, and make it visually appealing.
Include placeholder image URLs for screenshots.
`,
  });

  try {
    const response = await prompt({
      projectTitle,
      projectDescription,
      techStack: JSON.stringify(techStack),
      features,
    });

    return response.output?.readme || '';
  } catch (error) {
    console.error('Error generating README:', error);
    throw new Error('Failed to generate README');
  }
}

/**
 * Analyze completed project and update skills
 */
export async function analyzeProjectCompletion(
  projectTitle: string,
  projectDescription: string,
  skillsLearned: string[],
  timeSpent: number,
  challenges: string[]
): Promise<{
  skillsGained: Array<{ name: string; proficiency: number }>;
  achievements: string[];
  portfolioSummary: string;
  interviewTalkingPoints: string[];
}> {
  const prompt = ai.definePrompt({
    name: 'analyzeProjectCompletion',
    model: 'googleai/gemini-2.0-flash-exp',
    input: {
      schema: z.object({
        projectTitle: z.string(),
        projectDescription: z.string(),
        skillsLearned: z.array(z.string()),
        timeSpent: z.number(),
        challenges: z.array(z.string()),
      }),
    },
    output: {
      schema: z.object({
        skillsGained: z.array(z.object({
          name: z.string(),
          proficiency: z.number(),
        })),
        achievements: z.array(z.string()),
        portfolioSummary: z.string(),
        interviewTalkingPoints: z.array(z.string()),
      }),
    },
    prompt: `
Analyze this completed project and provide career insights:

**Project:** {{projectTitle}}
**Description:** {{projectDescription}}
**Skills Learned:** {{#each skillsLearned}}{{this}}, {{/each}}
**Time Spent:** {{timeSpent}} hours
**Challenges:** {{#each challenges}}{{this}}, {{/each}}

Provide:
1. skillsGained: Array of skills with proficiency (0-100)
2. achievements: 5 bullet points for resume
3. portfolioSummary: 2-3 sentences for portfolio description
4. interviewTalkingPoints: 5 STAR method stories from this project

Make it impressive and interview-ready!
`,
  });

  try {
    const response = await prompt({
      projectTitle,
      projectDescription,
      skillsLearned,
      timeSpent,
      challenges,
    });

    return response.output || {
      skillsGained: [],
      achievements: [],
      portfolioSummary: '',
      interviewTalkingPoints: [],
    };
  } catch (error) {
    console.error('Error analyzing project completion:', error);
    throw new Error('Failed to analyze project completion');
  }
}

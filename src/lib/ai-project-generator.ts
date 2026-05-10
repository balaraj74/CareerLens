import type { EnhancedUserProfile } from './types';

// Project recommendation types
export interface ProjectRecommendation {
  id: string;
  title: string;
  summary: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
  category: 'AI/ML' | 'Web App' | 'Mobile App' | 'Data Science' | 'DevOps' | 'Game' | 'Tool' | 'API';
  estimatedTime: string;
  learningGoals: string[];
  prerequisites: string[];
  steps: {
    phase: string;
    tasks: string[];
  }[];
  bonusChallenges: string[];
  deploymentOptions: {
    platform: string;
    difficulty: string;
    url?: string;
  }[];
  skillsYouWillLearn: string[];
  realWorldApplication: string;
  portfolioValue: 'Low' | 'Medium' | 'High';
  xpReward: number;
}

/**
 * Generate project recommendations based on user skills and goals
 */
export async function generateProjectRecommendations(
  profile: EnhancedUserProfile,
  count: number = 3
): Promise<ProjectRecommendation[]> {
  const skills = (profile.skills || []).map(s => s.name);
  const goal = profile.title || 'Software Developer';
  const level = profile.level || 1;

  // Determine difficulty based on user level
  const difficulty = level <= 2 ? 'Beginner' : level <= 4 ? 'Intermediate' : 'Advanced';

  try {
    return await callGeminiForProjects(skills, goal, difficulty, count);
  } catch (error) {
    console.error('Error generating projects with AI, falling back to curated:', error);
    return generateCuratedProjects(skills, goal, difficulty, count);
  }
}

/**
 * Call Vertex AI via Genkit to generate personalized project ideas
 */
async function callGeminiForProjects(
  skills: string[],
  goal: string,
  difficulty: string,
  count: number
): Promise<ProjectRecommendation[]> {
  const res = await fetch('/api/ai/project-recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, goal, difficulty, count }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error('Invalid API response');
  }

  return json.data.map((project: any, index: number) => ({
    id: `project-${Date.now()}-${index}`,
    ...project,
    xpReward: calculateProjectXP(project.difficulty, project.portfolioValue),
  }));
}

/**
 * Generate curated project recommendations (fallback)
 */
function generateCuratedProjects(
  skills: string[],
  goal: string,
  difficulty: string,
  count: number
): ProjectRecommendation[] {
  const allProjects: ProjectRecommendation[] = [
    // AI/ML Projects
    {
      id: 'project-salary-predictor',
      title: 'AI Salary Predictor with ML',
      summary: 'Build a machine learning model to predict salaries based on job data',
      description:
        'Create an end-to-end ML application that scrapes job data, trains a regression model, and deploys a web interface for salary predictions. Learn data preprocessing, feature engineering, model training, and deployment.',
      difficulty: 'Intermediate',
      techStack: ['Python', 'scikit-learn', 'Pandas', 'Flask', 'Streamlit', 'Docker'],
      category: 'AI/ML',
      estimatedTime: '2-3 weeks',
      learningGoals: [
        'Data collection and cleaning',
        'Feature engineering for ML',
        'Regression model training',
        'Model evaluation and tuning',
        'Web deployment',
      ],
      prerequisites: ['Python', 'Basic Statistics'],
      steps: [
        {
          phase: 'Phase 1: Data Collection',
          tasks: [
            'Scrape job postings from multiple sources',
            'Clean and structure the data',
            'Perform exploratory data analysis',
          ],
        },
        {
          phase: 'Phase 2: Model Development',
          tasks: [
            'Feature engineering (encode categories, scale numbers)',
            'Split data into train/test sets',
            'Train multiple regression models',
            'Evaluate and select best model',
          ],
        },
        {
          phase: 'Phase 3: Web Interface',
          tasks: [
            'Build Streamlit app with input form',
            'Integrate trained model',
            'Add visualizations of predictions',
            'Deploy to Streamlit Cloud',
          ],
        },
      ],
      bonusChallenges: [
        'Add location-based salary adjustments',
        'Implement skill-based recommendations',
        'Create API endpoints for integration',
      ],
      deploymentOptions: [
        { platform: 'Streamlit Cloud', difficulty: 'Easy' },
        { platform: 'Google Cloud Run', difficulty: 'Medium' },
        { platform: 'AWS EC2', difficulty: 'Hard' },
      ],
      skillsYouWillLearn: ['Machine Learning', 'Data Science', 'Web Deployment', 'API Design'],
      realWorldApplication:
        'Similar systems are used by LinkedIn, Glassdoor, and Indeed to provide salary insights',
      portfolioValue: 'High',
      xpReward: 250,
    },
    {
      id: 'project-chatbot-ai',
      title: 'AI Chatbot with NLP',
      summary: 'Build an intelligent chatbot using natural language processing',
      description:
        'Create a conversational AI chatbot that can answer questions, provide recommendations, and learn from interactions. Integrate with OpenAI or build your own NLP pipeline.',
      difficulty: 'Advanced',
      techStack: ['Python', 'OpenAI API', 'LangChain', 'FastAPI', 'React', 'PostgreSQL'],
      category: 'AI/ML',
      estimatedTime: '3-4 weeks',
      learningGoals: [
        'Natural Language Processing',
        'Prompt engineering',
        'Context management',
        'Real-time chat systems',
        'Vector databases',
      ],
      prerequisites: ['Python', 'React', 'API Development'],
      steps: [
        {
          phase: 'Phase 1: Backend Setup',
          tasks: [
            'Set up FastAPI server',
            'Integrate OpenAI or Gemini API',
            'Implement conversation memory',
            'Add database for chat history',
          ],
        },
        {
          phase: 'Phase 2: Frontend',
          tasks: [
            'Build React chat interface',
            'Add typing indicators',
            'Implement message streaming',
            'Add file upload support',
          ],
        },
        {
          phase: 'Phase 3: Advanced Features',
          tasks: [
            'Add RAG (Retrieval Augmented Generation)',
            'Implement user authentication',
            'Add conversation history',
            'Deploy to production',
          ],
        },
      ],
      bonusChallenges: [
        'Add voice input/output',
        'Implement multi-language support',
        'Create custom knowledge base',
      ],
      deploymentOptions: [
        { platform: 'Vercel', difficulty: 'Easy' },
        { platform: 'Google Cloud Run', difficulty: 'Medium' },
        { platform: 'Kubernetes', difficulty: 'Hard' },
      ],
      skillsYouWillLearn: ['NLP', 'LLM Integration', 'RAG Systems', 'Real-time Communication'],
      realWorldApplication:
        'Similar to ChatGPT, customer support bots, and AI assistants used by major companies',
      portfolioValue: 'High',
      xpReward: 350,
    },

    // Web App Projects
    {
      id: 'project-task-manager',
      title: 'Full-Stack Task Management App',
      summary: 'Build a collaborative task manager with real-time updates',
      description:
        'Create a modern task management application with team collaboration features, real-time updates, and a beautiful UI. Learn full-stack development, authentication, and real-time data sync.',
      difficulty: 'Intermediate',
      techStack: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Framer Motion'],
      category: 'Web App',
      estimatedTime: '2-3 weeks',
      learningGoals: [
        'Full-stack Next.js development',
        'Firebase authentication',
        'Real-time database',
        'Modern UI/UX',
        'State management',
      ],
      prerequisites: ['JavaScript', 'React basics'],
      steps: [
        {
          phase: 'Phase 1: Setup & Auth',
          tasks: [
            'Initialize Next.js project',
            'Set up Firebase',
            'Implement authentication (email, Google)',
            'Create protected routes',
          ],
        },
        {
          phase: 'Phase 2: Core Features',
          tasks: [
            'Build task CRUD operations',
            'Add categories and labels',
            'Implement drag-and-drop',
            'Add due dates and reminders',
          ],
        },
        {
          phase: 'Phase 3: Collaboration',
          tasks: [
            'Add team workspaces',
            'Implement task assignments',
            'Add real-time updates',
            'Create activity feed',
          ],
        },
      ],
      bonusChallenges: [
        'Add Kanban board view',
        'Implement calendar integration',
        'Add file attachments',
        'Create mobile app with React Native',
      ],
      deploymentOptions: [
        { platform: 'Vercel', difficulty: 'Easy' },
        { platform: 'Firebase Hosting', difficulty: 'Easy' },
        { platform: 'Netlify', difficulty: 'Easy' },
      ],
      skillsYouWillLearn: ['Next.js', 'Firebase', 'Real-time Data', 'TypeScript', 'UI/UX Design'],
      realWorldApplication: 'Similar to Trello, Asana, and Monday.com project management tools',
      portfolioValue: 'High',
      xpReward: 300,
    },
    {
      id: 'project-social-network',
      title: 'Social Media Platform',
      summary: 'Build a social networking app with posts, comments, and real-time chat',
      description:
        'Create a full-featured social media platform with user profiles, posts, likes, comments, friend system, and real-time messaging. Learn complex state management and scalable architecture.',
      difficulty: 'Advanced',
      techStack: [
        'React',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Redis',
        'Socket.io',
        'AWS S3',
        'Docker',
      ],
      category: 'Web App',
      estimatedTime: '4-6 weeks',
      learningGoals: [
        'Complex backend architecture',
        'Database design and optimization',
        'Real-time communication',
        'File uploads and CDN',
        'Scalability patterns',
      ],
      prerequisites: ['React', 'Node.js', 'SQL', 'REST APIs'],
      steps: [
        {
          phase: 'Phase 1: Foundation',
          tasks: [
            'Design database schema',
            'Set up backend with Express',
            'Implement JWT authentication',
            'Create user registration/login',
          ],
        },
        {
          phase: 'Phase 2: Core Features',
          tasks: [
            'Build post creation and feed',
            'Implement likes and comments',
            'Add image/video uploads',
            'Create user profiles',
          ],
        },
        {
          phase: 'Phase 3: Social Features',
          tasks: [
            'Implement friend system',
            'Add real-time chat with Socket.io',
            'Create notifications',
            'Build search functionality',
          ],
        },
        {
          phase: 'Phase 4: Optimization',
          tasks: [
            'Add Redis caching',
            'Implement pagination',
            'Optimize database queries',
            'Deploy with Docker',
          ],
        },
      ],
      bonusChallenges: [
        'Add stories feature (24hr posts)',
        'Implement video calls',
        'Add recommendation algorithm',
        'Create mobile app',
      ],
      deploymentOptions: [
        { platform: 'AWS EC2', difficulty: 'Medium' },
        { platform: 'DigitalOcean', difficulty: 'Medium' },
        { platform: 'Kubernetes', difficulty: 'Hard' },
      ],
      skillsYouWillLearn: [
        'System Design',
        'Real-time Systems',
        'Database Optimization',
        'Caching',
        'Deployment',
      ],
      realWorldApplication: 'Core architecture used by Facebook, Twitter, and Instagram',
      portfolioValue: 'High',
      xpReward: 500,
    },

    // Data Science Projects
    {
      id: 'project-analytics-dashboard',
      title: 'Real-Time Analytics Dashboard',
      summary: 'Build an interactive dashboard for data visualization and insights',
      description:
        'Create a comprehensive analytics dashboard that connects to multiple data sources, processes data in real-time, and presents insights through interactive visualizations.',
      difficulty: 'Intermediate',
      techStack: ['Python', 'Streamlit', 'Plotly', 'Pandas', 'PostgreSQL', 'Apache Kafka'],
      category: 'Data Science',
      estimatedTime: '2-3 weeks',
      learningGoals: [
        'Data pipeline design',
        'Real-time data processing',
        'Interactive visualizations',
        'Dashboard design',
        'Performance optimization',
      ],
      prerequisites: ['Python', 'SQL', 'Data Analysis'],
      steps: [
        {
          phase: 'Phase 1: Data Pipeline',
          tasks: [
            'Set up data sources',
            'Create ETL pipeline',
            'Store data in PostgreSQL',
            'Implement data validation',
          ],
        },
        {
          phase: 'Phase 2: Dashboard',
          tasks: [
            'Build Streamlit interface',
            'Create interactive charts',
            'Add filters and controls',
            'Implement auto-refresh',
          ],
        },
        {
          phase: 'Phase 3: Advanced Features',
          tasks: [
            'Add predictive analytics',
            'Implement anomaly detection',
            'Create export functionality',
            'Deploy dashboard',
          ],
        },
      ],
      bonusChallenges: [
        'Add AI-powered insights',
        'Implement user authentication',
        'Create custom metrics',
        'Add alerting system',
      ],
      deploymentOptions: [
        { platform: 'Streamlit Cloud', difficulty: 'Easy' },
        { platform: 'Google Cloud Run', difficulty: 'Medium' },
        { platform: 'AWS Elastic Beanstalk', difficulty: 'Medium' },
      ],
      skillsYouWillLearn: [
        'Data Visualization',
        'ETL Pipelines',
        'Dashboard Design',
        'Performance Optimization',
      ],
      realWorldApplication: 'Used by companies for business intelligence and decision making',
      portfolioValue: 'High',
      xpReward: 280,
    },

    // Beginner Projects
    {
      id: 'project-portfolio-website',
      title: 'Personal Portfolio Website',
      summary: 'Create a stunning portfolio to showcase your projects and skills',
      description:
        'Build a modern, responsive portfolio website with smooth animations, project showcases, and a contact form. Learn web development fundamentals and deployment.',
      difficulty: 'Beginner',
      techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
      category: 'Web App',
      estimatedTime: '1-2 weeks',
      learningGoals: [
        'Responsive design',
        'Modern CSS',
        'React components',
        'SEO basics',
        'Deployment',
      ],
      prerequisites: ['Basic HTML/CSS'],
      steps: [
        {
          phase: 'Phase 1: Design',
          tasks: [
            'Plan layout and sections',
            'Choose color scheme',
            'Design mockups',
            'Set up React project',
          ],
        },
        {
          phase: 'Phase 2: Build',
          tasks: [
            'Create header and navigation',
            'Build hero section',
            'Add projects showcase',
            'Create contact form',
          ],
        },
        {
          phase: 'Phase 3: Polish',
          tasks: [
            'Add animations',
            'Optimize for mobile',
            'Improve SEO',
            'Deploy to Vercel',
          ],
        },
      ],
      bonusChallenges: [
        'Add dark mode',
        'Implement blog section',
        'Add testimonials',
        'Create custom domain',
      ],
      deploymentOptions: [
        { platform: 'Vercel', difficulty: 'Easy' },
        { platform: 'Netlify', difficulty: 'Easy' },
        { platform: 'GitHub Pages', difficulty: 'Easy' },
      ],
      skillsYouWillLearn: ['Web Development', 'React', 'Responsive Design', 'Deployment'],
      realWorldApplication: 'Essential for any developer job search and freelancing',
      portfolioValue: 'Medium',
      xpReward: 150,
    },
  ];

  // Filter projects based on user's skills and difficulty
  const relevantProjects = allProjects.filter((p) => {
    // Match difficulty
    if (p.difficulty !== difficulty) return false;

    // Check if user has some prerequisites
    const hasPrereqs = p.prerequisites.some((prereq) =>
      skills.some((skill) => skill.toLowerCase().includes(prereq.toLowerCase()))
    );

    return hasPrereqs || skills.length === 0;
  });

  // If no matches, return beginner projects
  if (relevantProjects.length === 0) {
    return allProjects.filter((p) => p.difficulty === 'Beginner').slice(0, count);
  }

  return relevantProjects.slice(0, count);
}

/**
 * Calculate XP reward based on project complexity
 */
function calculateProjectXP(difficulty: string, portfolioValue: string): number {
  const baseXP: Record<string, number> = {
    Beginner: 100,
    Intermediate: 200,
    Advanced: 300,
  };

  const multiplier: Record<string, number> = {
    Low: 1,
    Medium: 1.5,
    High: 2,
  };

  return Math.round((baseXP[difficulty] || 100) * (multiplier[portfolioValue] || 1));
}

/**
 * Generate project brief as formatted text for PDF export
 */
export function generateProjectBrief(project: ProjectRecommendation): string {
  return `
PROJECT BRIEF: ${project.title}

📋 OVERVIEW
${project.description}

⚙️ TECH STACK
${project.techStack.map((tech) => `• ${tech}`).join('\n')}

🎯 LEARNING GOALS
${project.learningGoals.map((goal) => `• ${goal}`).join('\n')}

📝 IMPLEMENTATION STEPS
${project.steps
  .map(
    (step) => `
${step.phase}:
${step.tasks.map((task) => `  • ${task}`).join('\n')}`
  )
  .join('\n')}

🚀 BONUS CHALLENGES
${project.bonusChallenges.map((challenge) => `• ${challenge}`).join('\n')}

💼 REAL-WORLD APPLICATION
${project.realWorldApplication}

📊 ESTIMATED TIME: ${project.estimatedTime}
🏆 PORTFOLIO VALUE: ${project.portfolioValue}
⭐ XP REWARD: ${project.xpReward} XP

DEPLOYMENT OPTIONS
${project.deploymentOptions.map((opt) => `• ${opt.platform} (${opt.difficulty})`).join('\n')}
  `.trim();
}

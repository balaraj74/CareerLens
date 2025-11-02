import { Firestore, collection, doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import type { EnhancedUserProfile } from './types';

// Skill recommendation types
export interface SkillRecommendation {
  id: string;
  name: string;
  category: 'AI' | 'Web' | 'Data' | 'Cloud' | 'Mobile' | 'DevOps' | 'Design' | 'Other';
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  importanceScore: number; // 0-100
  skillMatch: number; // How well it matches user's goal (0-100)
  learningResources: {
    type: 'Coursera' | 'YouTube' | 'Google' | 'FreeCodeCamp' | 'Udemy' | 'Other';
    title: string;
    url: string;
    duration?: string;
    isFree: boolean;
  }[];
  prerequisites: string[];
  estimatedLearningTime: string; // e.g., "2-3 weeks"
  icon?: string; // emoji or icon name
  inDemand: boolean;
  salaryImpact: 'Low' | 'Medium' | 'High';
}

export interface LearningPath {
  goal: string;
  currentLevel: string;
  recommendedSkills: SkillRecommendation[];
  completedSkills: string[];
  inProgressSkills: string[];
  totalEstimatedTime: string;
  careerReadiness: number; // 0-100
}

/**
 * Analyze user profile and generate skill recommendations using AI
 */
export async function generateSkillRecommendations(
  profile: EnhancedUserProfile,
  careerGoal?: string
): Promise<SkillRecommendation[]> {
  const goal = careerGoal || profile.title || 'Software Engineer';
  const existingSkills = profile.skills || [];
  const experience = profile.experience || [];
  const education = profile.education || [];

  // Create context for AI
  const userContext = {
    goal,
    currentSkills: existingSkills,
    yearsOfExperience: experience.length,
    educationLevel: education[0]?.degree || 'Bachelor',
    interests: profile.interests || [],
  };

  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      // Call Gemini API for skill recommendations
      const recommendations = await callGeminiForSkills(userContext);
      return recommendations;
    } else {
      console.log('Gemini API key not configured, using curated skills');
      // Use fallback if no API key
      return generateFallbackSkillRecommendations(userContext);
    }
  } catch (error) {
    console.error('Error generating skill recommendations:', error);
    // Fallback to rule-based recommendations
    return generateFallbackSkillRecommendations(userContext);
  }
}

/**
 * Call Gemini API to get personalized skill recommendations
 */
async function callGeminiForSkills(userContext: any): Promise<SkillRecommendation[]> {
  // Note: You'll need to set up Gemini API key in environment variables
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('Gemini API key not configured');
    throw new Error('Gemini API key not found');
  }

  const prompt = `
You are a career development AI assistant. Analyze the following user profile and recommend the next 5 most important skills they should learn.

User Profile:
- Career Goal: ${userContext.goal}
- Current Skills: ${userContext.currentSkills.join(', ')}
- Years of Experience: ${userContext.yearsOfExperience}
- Education: ${userContext.educationLevel}
- Interests: ${userContext.interests.join(', ')}

Provide 5 skill recommendations in JSON format with the following structure:
[
  {
    "name": "skill name",
    "category": "AI|Web|Data|Cloud|Mobile|DevOps|Design|Other",
    "description": "brief description of the skill",
    "difficulty": "Beginner|Intermediate|Advanced",
    "importanceScore": 0-100,
    "prerequisites": ["skill1", "skill2"],
    "estimatedLearningTime": "time estimate",
    "inDemand": true|false,
    "salaryImpact": "Low|Medium|High"
  }
]

Focus on skills that:
1. Build on their existing knowledge
2. Are in high demand for their career goal
3. Have a clear learning path
4. Will increase their marketability

Return ONLY the JSON array, no additional text.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const skillsData = JSON.parse(jsonMatch[0]);
    
    // Transform to our format and add additional data
    return skillsData.map((skill: any, index: number) => ({
      id: `skill-${Date.now()}-${index}`,
      ...skill,
      skillMatch: calculateSkillMatch(skill, userContext),
      learningResources: generateLearningResources(skill.name),
      icon: getCategoryIcon(skill.category),
    }));
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Fallback skill recommendations when AI is unavailable
 */
function generateFallbackSkillRecommendations(userContext: any): SkillRecommendation[] {
  const goalLowerCase = userContext.goal?.toLowerCase() || '';
  const currentSkills = Array.isArray(userContext.currentSkills) 
    ? userContext.currentSkills.map((s: any) => 
        typeof s === 'string' ? s.toLowerCase() : s?.name?.toLowerCase() || ''
      )
    : [];

  // Define skill trees for common career goals
  const skillTrees: Record<string, SkillRecommendation[]> = {
    'ai engineer': [
      {
        id: 'skill-python-ml',
        name: 'Machine Learning Fundamentals',
        category: 'AI',
        description: 'Core ML algorithms, supervised/unsupervised learning, model evaluation',
        difficulty: 'Intermediate',
        importanceScore: 95,
        skillMatch: 95,
        learningResources: generateLearningResources('Machine Learning'),
        prerequisites: ['Python', 'Statistics'],
        estimatedLearningTime: '3-4 months',
        icon: '🤖',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-tensorflow',
        name: 'TensorFlow / PyTorch',
        category: 'AI',
        description: 'Deep learning frameworks for building neural networks',
        difficulty: 'Advanced',
        importanceScore: 90,
        skillMatch: 90,
        learningResources: generateLearningResources('TensorFlow'),
        prerequisites: ['Python', 'Machine Learning'],
        estimatedLearningTime: '2-3 months',
        icon: '🧠',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-nlp',
        name: 'Natural Language Processing',
        category: 'AI',
        description: 'Text processing, sentiment analysis, transformers, LLMs',
        difficulty: 'Advanced',
        importanceScore: 85,
        skillMatch: 88,
        learningResources: generateLearningResources('NLP'),
        prerequisites: ['Python', 'Machine Learning'],
        estimatedLearningTime: '2-3 months',
        icon: '💬',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-mlops',
        name: 'MLOps & Model Deployment',
        category: 'Cloud',
        description: 'Deploy ML models to production, monitoring, CI/CD for ML',
        difficulty: 'Advanced',
        importanceScore: 80,
        skillMatch: 85,
        learningResources: generateLearningResources('MLOps'),
        prerequisites: ['Machine Learning', 'Docker'],
        estimatedLearningTime: '1-2 months',
        icon: '⚙️',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-prompt-engineering',
        name: 'Prompt Engineering',
        category: 'AI',
        description: 'Master LLM prompting, chain-of-thought, few-shot learning',
        difficulty: 'Beginner',
        importanceScore: 75,
        skillMatch: 82,
        learningResources: generateLearningResources('Prompt Engineering'),
        prerequisites: [],
        estimatedLearningTime: '2-3 weeks',
        icon: '✨',
        inDemand: true,
        salaryImpact: 'Medium',
      },
    ],
    'full-stack developer': [
      {
        id: 'skill-react',
        name: 'React.js',
        category: 'Web',
        description: 'Modern frontend framework with hooks, context, and state management',
        difficulty: 'Intermediate',
        importanceScore: 95,
        skillMatch: 95,
        learningResources: generateLearningResources('React'),
        prerequisites: ['JavaScript', 'HTML', 'CSS'],
        estimatedLearningTime: '2-3 months',
        icon: '⚛️',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-nodejs',
        name: 'Node.js & Express',
        category: 'Web',
        description: 'Backend JavaScript runtime and web framework',
        difficulty: 'Intermediate',
        importanceScore: 90,
        skillMatch: 92,
        learningResources: generateLearningResources('Node.js'),
        prerequisites: ['JavaScript'],
        estimatedLearningTime: '1-2 months',
        icon: '🟢',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-typescript',
        name: 'TypeScript',
        category: 'Web',
        description: 'Type-safe JavaScript for scalable applications',
        difficulty: 'Intermediate',
        importanceScore: 85,
        skillMatch: 88,
        learningResources: generateLearningResources('TypeScript'),
        prerequisites: ['JavaScript'],
        estimatedLearningTime: '3-4 weeks',
        icon: '📘',
        inDemand: true,
        salaryImpact: 'Medium',
      },
      {
        id: 'skill-database',
        name: 'Database Design (SQL & NoSQL)',
        category: 'Data',
        description: 'PostgreSQL, MongoDB, database optimization',
        difficulty: 'Intermediate',
        importanceScore: 80,
        skillMatch: 85,
        learningResources: generateLearningResources('Databases'),
        prerequisites: [],
        estimatedLearningTime: '1-2 months',
        icon: '🗄️',
        inDemand: true,
        salaryImpact: 'Medium',
      },
      {
        id: 'skill-docker',
        name: 'Docker & Containers',
        category: 'DevOps',
        description: 'Containerization for consistent deployments',
        difficulty: 'Intermediate',
        importanceScore: 75,
        skillMatch: 80,
        learningResources: generateLearningResources('Docker'),
        prerequisites: [],
        estimatedLearningTime: '2-3 weeks',
        icon: '🐳',
        inDemand: true,
        salaryImpact: 'Medium',
      },
    ],
    'data analyst': [
      {
        id: 'skill-sql-advanced',
        name: 'Advanced SQL',
        category: 'Data',
        description: 'Complex queries, window functions, CTEs, optimization',
        difficulty: 'Intermediate',
        importanceScore: 95,
        skillMatch: 95,
        learningResources: generateLearningResources('SQL'),
        prerequisites: ['Basic SQL'],
        estimatedLearningTime: '1-2 months',
        icon: '🗃️',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-python-data',
        name: 'Python for Data Analysis',
        category: 'Data',
        description: 'Pandas, NumPy, data cleaning, transformation',
        difficulty: 'Intermediate',
        importanceScore: 90,
        skillMatch: 92,
        learningResources: generateLearningResources('Python Data Analysis'),
        prerequisites: ['Python Basics'],
        estimatedLearningTime: '2-3 months',
        icon: '🐍',
        inDemand: true,
        salaryImpact: 'High',
      },
      {
        id: 'skill-tableau',
        name: 'Data Visualization (Tableau/Power BI)',
        category: 'Data',
        description: 'Create interactive dashboards and reports',
        difficulty: 'Intermediate',
        importanceScore: 85,
        skillMatch: 88,
        learningResources: generateLearningResources('Tableau'),
        prerequisites: [],
        estimatedLearningTime: '1-2 months',
        icon: '📊',
        inDemand: true,
        salaryImpact: 'Medium',
      },
      {
        id: 'skill-statistics',
        name: 'Statistics & Probability',
        category: 'Data',
        description: 'Hypothesis testing, distributions, statistical inference',
        difficulty: 'Intermediate',
        importanceScore: 80,
        skillMatch: 85,
        learningResources: generateLearningResources('Statistics'),
        prerequisites: [],
        estimatedLearningTime: '2-3 months',
        icon: '📈',
        inDemand: true,
        salaryImpact: 'Medium',
      },
      {
        id: 'skill-excel-advanced',
        name: 'Advanced Excel',
        category: 'Data',
        description: 'Pivot tables, VLOOKUP, macros, data modeling',
        difficulty: 'Beginner',
        importanceScore: 75,
        skillMatch: 82,
        learningResources: generateLearningResources('Excel'),
        prerequisites: [],
        estimatedLearningTime: '3-4 weeks',
        icon: '📊',
        inDemand: true,
        salaryImpact: 'Low',
      },
    ],
  };

  // Find matching skill tree
  for (const [key, skills] of Object.entries(skillTrees)) {
    if (goalLowerCase.includes(key.toLowerCase())) {
      // Filter out skills user already has
      return skills.filter(
        (skill) => !currentSkills.some((cs: any) => skill.name.toLowerCase().includes(cs.name?.toLowerCase() || cs))
      );
    }
  }

  // Default recommendations if no match found
  return skillTrees['full-stack developer'];
}

/**
 * Calculate how well a skill matches user's goal and current skills
 */
function calculateSkillMatch(skill: any, userContext: any): number {
  let match = 70; // Base score

  // Bonus for matching career goal
  const goalKeywords = userContext.goal.toLowerCase().split(' ');
  const skillKeywords = (skill.name + ' ' + skill.description).toLowerCase();
  
  for (const keyword of goalKeywords) {
    if (skillKeywords.includes(keyword)) {
      match += 5;
    }
  }

  // Bonus for related interests
  for (const interest of userContext.interests) {
    if (skillKeywords.includes(interest.toLowerCase())) {
      match += 3;
    }
  }

  return Math.min(match, 100);
}

/**
 * Generate learning resources for a skill
 */
function generateLearningResources(skillName: string): SkillRecommendation['learningResources'] {
  const resources = [
    {
      type: 'YouTube' as const,
      title: `${skillName} Full Course`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' full course')}`,
      duration: 'varies',
      isFree: true,
    },
    {
      type: 'Google' as const,
      title: `Google Cloud ${skillName} Training`,
      url: `https://cloud.google.com/training`,
      duration: 'varies',
      isFree: true,
    },
    {
      type: 'FreeCodeCamp' as const,
      title: `Learn ${skillName}`,
      url: `https://www.freecodecamp.org/learn`,
      duration: 'varies',
      isFree: true,
    },
  ];

  return resources;
}

/**
 * Get icon for skill category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    AI: '🤖',
    Web: '🌐',
    Data: '📊',
    Cloud: '☁️',
    Mobile: '📱',
    DevOps: '⚙️',
    Design: '🎨',
    Other: '💡',
  };
  return icons[category] || '💡';
}

/**
 * Save user's learning path to Firestore
 */
export async function saveLearningPath(
  db: Firestore,
  userId: string,
  learningPath: LearningPath
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    learningPath,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add skill to user's learning list
 */
export async function addSkillToLearning(
  db: Firestore,
  userId: string,
  skill: SkillRecommendation
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'learningPath.inProgressSkills': arrayUnion(skill.name),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark skill as completed
 */
export async function completeSkill(
  db: Firestore,
  userId: string,
  skillName: string,
  xpReward: number = 100
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    const inProgress = data.learningPath?.inProgressSkills || [];
    const completed = data.learningPath?.completedSkills || [];

    // Remove from in-progress and add to completed
    const updatedInProgress = inProgress.filter((s: string) => s !== skillName);
    const updatedCompleted = [...completed, skillName];

    await updateDoc(userRef, {
      'learningPath.inProgressSkills': updatedInProgress,
      'learningPath.completedSkills': updatedCompleted,
      currentXP: (data.currentXP || 0) + xpReward,
      updatedAt: serverTimestamp(),
    });
  }
}

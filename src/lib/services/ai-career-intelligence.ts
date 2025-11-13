/**
 * AI Career Intelligence Service
 * Uses Gemini AI to analyze and personalize career updates
 */

export interface AICareerSummary {
  weeklyHighlights: string[];
  topSkillsInDemand: string[];
  personalizedRecommendations: string[];
  industryTrends: string;
  actionableInsights: string[];
}

export interface AIPersonalizedBrief {
  greeting: string;
  keyUpdates: string[];
  recommendations: string[];
  opportunities: string[];
}

/**
 * Generate AI-powered career summary using Gemini
 */
export async function generateCareerSummary(
  updates: any[],
  userProfile?: { skills: string[]; interests: string[]; goals: string[] }
): Promise<AICareerSummary> {
  try {
    const response = await fetch('/api/ai/career-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, userProfile }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate career summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating career summary:', error);
    return getMockCareerSummary();
  }
}

/**
 * Generate personalized career brief for user
 */
export async function generatePersonalizedBrief(
  userName: string,
  userProfile: { skills: string[]; interests: string[]; goals: string[] },
  updates: any[]
): Promise<AIPersonalizedBrief> {
  try {
    const response = await fetch('/api/ai/personalized-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, userProfile, updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate personalized brief');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating personalized brief:', error);
    return getMockPersonalizedBrief(userName);
  }
}

/**
 * Analyze skill trends using AI
 */
export async function analyzeSkillTrends(
  skills: string[]
): Promise<{ skill: string; analysis: string; outlook: string }[]> {
  try {
    const response = await fetch('/api/ai/skill-trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze skill trends');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing skill trends:', error);
    return [];
  }
}

// Mock responses for development
function getMockCareerSummary(): AICareerSummary {
  return {
    weeklyHighlights: [
      'AI and Machine Learning roles increased by 45% this week',
      'Google announced new Cloud Skills Boost certifications',
      'Remote work opportunities for developers up 30%',
      'Cybersecurity positions showing highest salary growth'
    ],
    topSkillsInDemand: [
      'Generative AI & LLMs',
      'React/Next.js',
      'Cloud Architecture (GCP/AWS)',
      'Python & Data Science',
      'Kubernetes & DevOps'
    ],
    personalizedRecommendations: [
      'Consider learning Generative AI - 285% increase in demand',
      'Google Cloud Professional Architect certification launching next month',
      'Your Python skills align well with 1,500+ open ML positions'
    ],
    industryTrends: 'The tech industry is experiencing a surge in AI/ML positions, with companies prioritizing candidates who have experience with Large Language Models and cloud infrastructure. Remote work continues to be a strong trend, especially for senior developers.',
    actionableInsights: [
      'Update your resume to highlight AI/ML projects',
      'Enroll in free Google Cloud Skills Boost courses',
      'Join AI-focused communities on Reddit and LinkedIn',
      'Build a portfolio project using Generative AI'
    ]
  };
}

function getMockPersonalizedBrief(userName: string): AIPersonalizedBrief {
  return {
    greeting: `Hi ${userName} 👋`,
    keyUpdates: [
      'Python and AI engineering roles are trending this week',
      'Google is hiring interns for MLOps positions',
      'Coursera launched a new Generative AI Developer Certificate'
    ],
    recommendations: [
      'Your React skills are in high demand - 3,400+ jobs match your profile',
      'Consider adding Kubernetes to your skillset - 87% increase in openings',
      'Google Cloud Professional Architect exam is happening in 2 weeks'
    ],
    opportunities: [
      'Google AI/ML Engineering Internship (Apply by Nov 15)',
      'Microsoft Full Stack Developer role in Bangalore',
      'Free certification: AWS Solutions Architect on Coursera'
    ]
  };
}

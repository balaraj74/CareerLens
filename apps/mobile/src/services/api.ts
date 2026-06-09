import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  const extra = Constants.expoConfig?.extra;
  if (extra?.apiBaseUrl) {
    return extra.apiBaseUrl;
  }
  
  if (__DEV__) {
    // Android emulator needs 10.0.2.2, iOS and Web use localhost
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:3000/api' 
      : 'http://localhost:3000/api';
  }
  
  // Deployed production fallback
  return 'https://careerlens--careerlens-1.us-central1.hosted.app/api';
};

export interface UserProfile {
  name?: string;
  title?: string;
  skills?: Array<{ name: string; level: number }>;
  level?: number;
  analytics?: {
    resumeScore?: number;
    skillScore?: number;
    readinessScore?: number;
  };
}

export interface SkillGapAnalysisResult {
    matchPercentage: number;
    skillAlignment: 'excellent' | 'good' | 'fair' | 'poor';
    skillBreakdown: {
        matchedSkills: { skill: string; proficiencyLevel: string; marketDemand: string }[];
        missingCriticalSkills: { skill: string; importance: string; learnability: string; timeToLearn: string }[];
        emergingSkills: { skill: string; trendScore: number; futureValue: string }[];
    };
    recommendations: { priority: string; category: string; action: string; rationale: string; impact: string }[];
    careerInsights: { readinessLevel: string; estimatedTimeToReady: string; strengthAreas: string[]; weaknessAreas: string[]; competitiveAdvantages: string[] };
    learningPath: { phase: string; duration: string; skills: string[]; resources: string[] }[];
    marketContext: { demandLevel: string; competitionLevel: string; salaryOutlook: string; jobOpenings: string };
    radarData: { category: string; currentScore: number; targetScore: number }[];
}

export const api = {
  baseUrl: getBaseUrl(),

  // AI Copilot Chat (calls Next.js copilot/chat API)
  async getCopilotResponse(profile: UserProfile, message: string) {
    try {
      const response = await fetch(`${this.baseUrl}/copilot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile, message }),
      });
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching copilot chat:', error);
      // Fallback response if offline/error
      return {
        message: "I am having trouble connecting to the network right now. Try practicing your interview skills or checking your offline roadmap!",
        actionUrl: '/roadmap',
        actionLabel: 'Check Roadmap',
      };
    }
  },

  // Career Navigator API (calls Next.js career-navigator API)
  async generateCareerNavigator(profile: UserProfile) {
    try {
      const response = await fetch(`${this.baseUrl}/career-navigator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });
      if (!response.ok) {
        throw new Error(`Career Navigator API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching career navigator:', error);
      return null;
    }
  },

  // College Recommendations predictor API
  async getColleges(rank: number, exam: string, category: string) {
    try {
      const response = await fetch(`${this.baseUrl}/college-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rank, exam, category }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching colleges:', error);
      return [];
    }
  },

  // News Feed API
  async getTechNews() {
    try {
      const response = await fetch(`${this.baseUrl}/news`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching tech news:', error);
      return [];
    }
  },

  // Course discovery scraper API
  async getScrapedCourses(query: string) {
    try {
      const response = await fetch(`${this.baseUrl}/courses/scrape?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching scraped courses:', error);
      return [];
    }
  },

  // Skill Gap Analysis API
  async analyzeSkillGap(targetRole: string, currentSkills: string[], industry: string): Promise<SkillGapAnalysisResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/bigquery/skill-gap-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetRole, currentSkills, industry }),
      });
      if (!response.ok) {
        throw new Error(`Skill gap API error: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching skill gap analysis:', error);
      return null;
    }
  }
};

/**
 * Free Resource Hub Service
 * AI-powered course and certification recommendations
 */

import { getFirestore, collection, addDoc, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import type { EnhancedUserProfile } from './types';

export interface Resource {
  id: string;
  title: string;
  provider: 'NPTEL' | 'Coursera' | 'AWS Educate' | 'Google Cloud Skills Boost' | 'edX' | 'Udacity' | 'Other';
  category: string;
  description: string;
  url: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  certificate: boolean;
  free: boolean;
  rating?: number;
  enrollments?: number;
  thumbnail?: string;
  isAIRecommended?: boolean;
  createdAt: string;
}

/**
 * Get AI-powered resource recommendations based on user profile
 */
export async function getAIResourceRecommendations(
  userProfile: EnhancedUserProfile,
  count: number = 5
): Promise<Resource[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not configured, using fallback recommendations');
      return getFallbackResources(userProfile, count);
    }

    // Analyze user profile with Gemini
    const prompt = `
You are a career development AI assistant. Analyze this user profile and recommend ${count} FREE online courses/certifications that would be most beneficial for their career growth.

User Profile:
- Name: ${userProfile.name || 'Student'}
- Current Skills: ${(userProfile.skills || []).map((s) => s.name).join(', ')}
- Career Goal: ${userProfile.objective || 'Not specified'}
- Experience: ${(userProfile.experienceDetails || []).length} years

Available Platforms:
1. NPTEL (Indian, high quality, free certificates)
2. Coursera (Many free courses, audit option)
3. AWS Educate (Cloud computing, free)
4. Google Cloud Skills Boost (GCP, free)
5. edX (MIT, Harvard courses)

Recommend courses that:
1. Fill skill gaps for their career goal
2. Are 100% free or have free audit options
3. Provide certificates (free or paid)
4. Are relevant to current job market

Respond in JSON format:
{
  "recommendations": [
    {
      "title": "Course name",
      "provider": "NPTEL|Coursera|AWS Educate|Google Cloud Skills Boost|edX",
      "category": "Category",
      "description": "Why this course is perfect for the user",
      "duration": "X weeks/months",
      "level": "Beginner|Intermediate|Advanced",
      "skills": ["skill1", "skill2"],
      "url": "Direct enrollment URL",
      "certificate": true|false
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const resources: Resource[] = parsed.recommendations.map((rec: any, idx: number) => ({
        id: `ai-rec-${Date.now()}-${idx}`,
        title: rec.title,
        provider: rec.provider,
        category: rec.category,
        description: rec.description,
        url: rec.url,
        duration: rec.duration,
        level: rec.level,
        skills: rec.skills,
        certificate: rec.certificate,
        free: true,
        isAIRecommended: true,
        createdAt: new Date().toISOString(),
      }));

      // Cache recommendations in Firestore
      await cacheResources(resources);

      return resources;
    }

    return getFallbackResources(userProfile, count);
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return getFallbackResources(userProfile, count);
  }
}

/**
 * Get curated resources from Firestore cache
 */
/**
 * Get cached resources from Firestore
 */
export async function getCachedResources(userId: string): Promise<Resource[]> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    
    const resourcesRef = collection(db, 'resources');
    const q = query(resourcesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(10));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Resource));
  } catch (error) {
    console.error('Error fetching cached resources:', error);
    // Return empty array if there's a permission error or no cached resources
    return [];
  }
}

/**
 * Cache resources in Firestore
 */
async function cacheResources(resources: Resource[]): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);

    for (const resource of resources) {
      await addDoc(collection(db, 'resources'), resource);
    }
  } catch (error) {
    console.error('Error caching resources:', error);
  }
}

/**
 * Fallback resources when AI is unavailable
 */
function getFallbackResources(userProfile: EnhancedUserProfile, count: number): Resource[] {
  const allResources = getCuratedResources();
  
  // Simple matching based on user skills
  const userSkills = (userProfile.skills || []).map((s) => s.name.toLowerCase());
  const matchedResources = allResources.filter((resource) =>
    resource.skills.some((skill) => userSkills.includes(skill.toLowerCase()))
  );

  // Return matched resources or top resources
  return matchedResources.length >= count
    ? matchedResources.slice(0, count)
    : allResources.slice(0, count);
}

/**
 * Curated list of free resources
 */
export function getCuratedResources(): Resource[] {
  return [
    // NPTEL Courses
    {
      id: 'nptel-1',
      title: 'Data Structures and Algorithms',
      provider: 'NPTEL',
      category: 'Computer Science',
      description: 'Comprehensive course on DSA by IIT professors. Covers arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
      url: 'https://nptel.ac.in/courses/106102064',
      duration: '12 weeks',
      level: 'Intermediate',
      skills: ['Data Structures', 'Algorithms', 'Problem Solving'],
      certificate: true,
      free: true,
      rating: 4.8,
      enrollments: 50000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'nptel-2',
      title: 'Introduction to Machine Learning',
      provider: 'NPTEL',
      category: 'Artificial Intelligence',
      description: 'Learn ML fundamentals, supervised and unsupervised learning, neural networks, and practical applications.',
      url: 'https://nptel.ac.in/courses/106105152',
      duration: '8 weeks',
      level: 'Beginner',
      skills: ['Machine Learning', 'Python', 'Data Science'],
      certificate: true,
      free: true,
      rating: 4.7,
      enrollments: 35000,
      createdAt: new Date().toISOString(),
    },
    // Coursera Courses
    {
      id: 'coursera-1',
      title: 'Google IT Support Professional Certificate',
      provider: 'Coursera',
      category: 'IT Support',
      description: 'Prepare for a career in IT support. Learn troubleshooting, customer service, networking, operating systems, and security.',
      url: 'https://www.coursera.org/professional-certificates/google-it-support',
      duration: '6 months',
      level: 'Beginner',
      skills: ['IT Support', 'Networking', 'Operating Systems', 'Security'],
      certificate: true,
      free: true,
      rating: 4.8,
      enrollments: 500000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'coursera-2',
      title: 'IBM Data Science Professional Certificate',
      provider: 'Coursera',
      category: 'Data Science',
      description: 'Master data science fundamentals. Learn Python, SQL, data analysis, visualization, and machine learning.',
      url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
      duration: '10 months',
      level: 'Beginner',
      skills: ['Data Science', 'Python', 'SQL', 'Machine Learning'],
      certificate: true,
      free: true,
      rating: 4.6,
      enrollments: 300000,
      createdAt: new Date().toISOString(),
    },
    // AWS Educate
    {
      id: 'aws-1',
      title: 'AWS Cloud Foundations',
      provider: 'AWS Educate',
      category: 'Cloud Computing',
      description: 'Learn cloud computing basics, AWS core services, security, architecture, pricing, and support.',
      url: 'https://aws.amazon.com/education/awseducate/',
      duration: '4 weeks',
      level: 'Beginner',
      skills: ['AWS', 'Cloud Computing', 'DevOps'],
      certificate: true,
      free: true,
      rating: 4.7,
      enrollments: 100000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'aws-2',
      title: 'Introduction to Cloud 101',
      provider: 'AWS Educate',
      category: 'Cloud Computing',
      description: 'Understand cloud concepts, AWS services, and build your first cloud project.',
      url: 'https://aws.amazon.com/education/awseducate/',
      duration: '2 weeks',
      level: 'Beginner',
      skills: ['Cloud Computing', 'AWS', 'Infrastructure'],
      certificate: true,
      free: true,
      rating: 4.5,
      enrollments: 75000,
      createdAt: new Date().toISOString(),
    },
    // Google Cloud Skills Boost
    {
      id: 'gcp-1',
      title: 'Google Cloud Fundamentals: Core Infrastructure',
      provider: 'Google Cloud Skills Boost',
      category: 'Cloud Computing',
      description: 'Introduce Google Cloud services. Learn Compute Engine, Cloud Storage, BigQuery, and more.',
      url: 'https://www.cloudskillsboost.google/',
      duration: '1 week',
      level: 'Beginner',
      skills: ['Google Cloud', 'Cloud Computing', 'GCP'],
      certificate: true,
      free: true,
      rating: 4.6,
      enrollments: 80000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gcp-2',
      title: 'Getting Started with Application Development',
      provider: 'Google Cloud Skills Boost',
      category: 'Software Development',
      description: 'Learn to build and deploy applications on Google Cloud Platform.',
      url: 'https://www.cloudskillsboost.google/',
      duration: '2 weeks',
      level: 'Intermediate',
      skills: ['Google Cloud', 'Application Development', 'APIs'],
      certificate: true,
      free: true,
      rating: 4.5,
      enrollments: 60000,
      createdAt: new Date().toISOString(),
    },
    // edX Courses
    {
      id: 'edx-1',
      title: 'CS50: Introduction to Computer Science',
      provider: 'edX',
      category: 'Computer Science',
      description: "Harvard's legendary CS50 course. Learn C, Python, SQL, algorithms, web development, and more.",
      url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
      duration: '12 weeks',
      level: 'Beginner',
      skills: ['Programming', 'Algorithms', 'Web Development'],
      certificate: true,
      free: true,
      rating: 4.9,
      enrollments: 2000000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'edx-2',
      title: 'Introduction to Artificial Intelligence (AI)',
      provider: 'edX',
      category: 'Artificial Intelligence',
      description: 'Learn AI fundamentals from Microsoft. Covers machine learning, neural networks, and practical applications.',
      url: 'https://www.edx.org/course/artificial-intelligence-ai',
      duration: '6 weeks',
      level: 'Intermediate',
      skills: ['Artificial Intelligence', 'Machine Learning', 'Python'],
      certificate: true,
      free: true,
      rating: 4.6,
      enrollments: 150000,
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Search resources by keywords
 */
export function searchResources(keyword: string, allResources: Resource[]): Resource[] {
  const lowerKeyword = keyword.toLowerCase();
  return allResources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(lowerKeyword) ||
      resource.description.toLowerCase().includes(lowerKeyword) ||
      resource.category.toLowerCase().includes(lowerKeyword) ||
      resource.skills.some((skill) => skill.toLowerCase().includes(lowerKeyword))
  );
}

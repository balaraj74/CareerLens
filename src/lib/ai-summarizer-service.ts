/**
 * AI Summarization Service using Gemini
 * 
 * Purpose: Process raw data (Reddit posts, search results, courses) with AI
 * Features:
 * - Sentiment analysis for reviews
 * - Course relevance scoring
 * - Mentor profile matching
 * - Smart summarization
 * - Batch processing with rate limiting
 * 
 * Uses: Gemini 2.5 Flash Lite (existing CareerLens AI setup)
 */

import { ai } from '@/ai/genkit';

// Import types from other services
import type { RedditPost } from './reddit-api-service';
import type { GoogleSearchResult } from './google-search-service';
import type { ScrapedCourse } from './web-scraper-service';

// ===== INTERFACES =====

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  keywords: string[];
}

export interface ReviewSummary {
  id: string;
  originalText: string;
  summary: string;
  sentiment: SentimentAnalysis;
  keyPoints: string[];
  topics: string[];
  helpful: boolean;
  credibilityScore: number; // 0 to 1
}

export interface CourseRecommendation {
  course: ScrapedCourse;
  relevanceScore: number; // 0 to 1
  matchReasons: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  prerequisites: string[];
}

export interface MentorMatch {
  mentor: GoogleSearchResult;
  matchScore: number; // 0 to 1
  matchReasons: string[];
  expertise: string[];
  availability: 'high' | 'medium' | 'low';
}

// ===== RATE LIMITING =====

const RATE_LIMIT_DELAY = 1000; // 1 second between AI calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== SENTIMENT ANALYSIS =====

/**
 * Analyze sentiment of a review/post
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const promptText = `Analyze the sentiment of this text and return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: number from -1 (very negative) to 1 (very positive)
- confidence: number from 0 to 1 (how confident in the analysis)
- keywords: array of key emotional words found

Text: "${text.substring(0, 500)}" 

Return ONLY valid JSON, no other text.`;

    const response = await ai.generate({
      prompt: promptText,
      config: {
        temperature: 0.3, // Low temperature for consistent results
        maxOutputTokens: 500
      }
    });

    const result = JSON.parse(response.text);

    return {
      sentiment: result.sentiment || 'neutral',
      score: result.score || 0,
      confidence: result.confidence || 0.5,
      keywords: result.keywords || []
    };

  } catch (error) {
    console.error('[AI] Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      keywords: []
    };
  }
}

/**
 * Summarize and analyze a Reddit post or review
 */
export async function summarizeReview(
  post: RedditPost | GoogleSearchResult
): Promise<ReviewSummary> {
  try {
    const text = 'text' in post ? post.text : post.snippet;
    const title = post.title;

    const promptText = `Analyze this student review and return a JSON object with:
- summary: brief 2-3 sentence summary
- keyPoints: array of main points (max 5)
- topics: array of topics discussed (college life, academics, placements, etc.)
- helpful: boolean (is this review helpful for students?)
- credibilityScore: number 0-1 (how credible/authentic does this seem?)

Title: "${title}"
Text: "${text.substring(0, 1000)}"

Return ONLY valid JSON, no other text.`;

    const response = await ai.generate({
      prompt: promptText,
      config: {
        temperature: 0.5,
        maxOutputTokens: 800
      }
    });

    const result = JSON.parse(response.text);
    const sentiment = await analyzeSentiment(text);

    return {
      id: post.id,
      originalText: text,
      summary: result.summary || 'No summary available',
      sentiment,
      keyPoints: result.keyPoints || [],
      topics: result.topics || [],
      helpful: result.helpful ?? true,
      credibilityScore: result.credibilityScore || 0.5
    };

  } catch (error) {
    console.error('[AI] Error summarizing review:', error);
    return {
      id: post.id,
      originalText: 'text' in post ? post.text : post.snippet,
      summary: 'Error generating summary',
      sentiment: {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        keywords: []
      },
      keyPoints: [],
      topics: [],
      helpful: false,
      credibilityScore: 0
    };
  }
}

/**
 * Batch summarize multiple reviews with rate limiting
 */
export async function batchSummarizeReviews(
  posts: (RedditPost | GoogleSearchResult)[]
): Promise<ReviewSummary[]> {
  const summaries: ReviewSummary[] = [];

  console.log(`[AI] Batch summarizing ${posts.length} reviews...`);

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[AI] Summarizing review ${i + 1}/${posts.length}...`);
    
    const summary = await summarizeReview(post);
    summaries.push(summary);

    // Rate limiting
    if (i < posts.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  console.log(`[AI] Batch summarization complete: ${summaries.length} reviews processed`);
  return summaries;
}

// ===== COURSE RECOMMENDATION =====

/**
 * Score course relevance based on user profile
 */
export async function scoreCourseRelevance(
  course: ScrapedCourse,
  userProfile: {
    currentRole?: string;
    targetRole?: string;
    skills?: string[];
    interests?: string[];
    careerLevel?: string;
  }
): Promise<CourseRecommendation> {
  try {
    const promptText = `Analyze this course and score its relevance for the user. Return JSON with:
- relevanceScore: 0-1 (how relevant is this course?)
- matchReasons: array of strings explaining why it matches
- difficulty: "easy", "medium", or "hard" (estimated difficulty for this user)
- estimatedTime: string (e.g., "2 weeks", "40 hours")
- prerequisites: array of required skills/knowledge

Course:
- Title: "${course.title}"
- Description: "${course.description?.substring(0, 500)}"
- Platform: ${course.platform}
- Level: ${course.level || 'unknown'}
- Skills: ${course.skillTags?.join(', ') || 'none'}

User Profile:
- Current Role: ${userProfile.currentRole || 'unknown'}
- Target Role: ${userProfile.targetRole || 'unknown'}
- Current Skills: ${userProfile.skills?.join(', ') || 'none'}
- Interests: ${userProfile.interests?.join(', ') || 'none'}
- Career Level: ${userProfile.careerLevel || 'unknown'}

Return ONLY valid JSON, no other text.`;

    const response = await ai.generate({
      prompt: promptText,
      config: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    });

    const result = JSON.parse(response.text);

    return {
      course,
      relevanceScore: result.relevanceScore || 0.5,
      matchReasons: result.matchReasons || ['General interest match'],
      difficulty: result.difficulty || 'medium',
      estimatedTime: result.estimatedTime || course.duration || 'Unknown',
      prerequisites: result.prerequisites || []
    };

  } catch (error) {
    console.error('[AI] Error scoring course:', error);
    return {
      course,
      relevanceScore: 0.5,
      matchReasons: ['Unable to analyze'],
      difficulty: 'medium',
      estimatedTime: course.duration || 'Unknown',
      prerequisites: []
    };
  }
}

/**
 * Batch score multiple courses
 */
export async function batchScoreCourses(
  courses: ScrapedCourse[],
  userProfile: any
): Promise<CourseRecommendation[]> {
  const recommendations: CourseRecommendation[] = [];

  console.log(`[AI] Batch scoring ${courses.length} courses...`);

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    console.log(`[AI] Scoring course ${i + 1}/${courses.length}: ${course.title.substring(0, 50)}...`);
    
    const recommendation = await scoreCourseRelevance(course, userProfile);
    recommendations.push(recommendation);

    // Rate limiting
    if (i < courses.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  // Sort by relevance score
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  console.log(`[AI] Batch scoring complete: ${recommendations.length} courses scored`);
  return recommendations;
}

// ===== MENTOR MATCHING =====

/**
 * Match mentor to user profile
 */
export async function matchMentorToUser(
  mentor: GoogleSearchResult,
  userProfile: {
    currentRole?: string;
    targetRole?: string;
    skills?: string[];
    interests?: string[];
    location?: string;
  }
): Promise<MentorMatch> {
  try {
    const promptText = `Analyze this potential mentor and score their match for the user. Return JSON with:
- matchScore: 0-1 (how good is this match?)
- matchReasons: array of strings explaining why they're a good match
- expertise: array of their key expertise areas
- availability: "high", "medium", or "low" (estimated availability for mentorship)

Mentor:
- Name/Title: "${mentor.title}"
- Description: "${mentor.snippet?.substring(0, 500)}"
- Link: ${mentor.link}
- Platform: ${mentor.metadata?.platform}

User Profile:
- Current Role: ${userProfile.currentRole || 'unknown'}
- Target Role: ${userProfile.targetRole || 'unknown'}
- Skills: ${userProfile.skills?.join(', ') || 'none'}
- Interests: ${userProfile.interests?.join(', ') || 'none'}
- Location: ${userProfile.location || 'unknown'}

Return ONLY valid JSON, no other text.`;

    const response = await ai.generate({
      prompt: promptText,
      config: {
        temperature: 0.4,
        maxOutputTokens: 500
      }
    });

    const result = JSON.parse(response.text);

    return {
      mentor,
      matchScore: result.matchScore || 0.5,
      matchReasons: result.matchReasons || ['Potential expertise match'],
      expertise: result.expertise || [],
      availability: result.availability || 'medium'
    };

  } catch (error) {
    console.error('[AI] Error matching mentor:', error);
    return {
      mentor,
      matchScore: 0.5,
      matchReasons: ['Unable to analyze'],
      expertise: [],
      availability: 'medium'
    };
  }
}

/**
 * Batch match multiple mentors
 */
export async function batchMatchMentors(
  mentors: GoogleSearchResult[],
  userProfile: any
): Promise<MentorMatch[]> {
  const matches: MentorMatch[] = [];

  console.log(`[AI] Batch matching ${mentors.length} mentors...`);

  for (let i = 0; i < mentors.length; i++) {
    const mentor = mentors[i];
    console.log(`[AI] Matching mentor ${i + 1}/${mentors.length}...`);
    
    const match = await matchMentorToUser(mentor, userProfile);
    matches.push(match);

    // Rate limiting
    if (i < mentors.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  console.log(`[AI] Batch matching complete: ${matches.length} mentors matched`);
  return matches;
}

// ===== INTELLIGENT DATA PROCESSING =====

/**
 * Process all fetched data with AI summarization
 */
export async function processAllData(data: {
  reviews?: (RedditPost | GoogleSearchResult)[];
  courses?: ScrapedCourse[];
  mentors?: GoogleSearchResult[];
  userProfile?: any;
}): Promise<{
  reviewSummaries: ReviewSummary[];
  courseRecommendations: CourseRecommendation[];
  mentorMatches: MentorMatch[];
}> {
  console.log('[AI] Starting comprehensive data processing...');

  const result = {
    reviewSummaries: [] as ReviewSummary[],
    courseRecommendations: [] as CourseRecommendation[],
    mentorMatches: [] as MentorMatch[]
  };

  try {
    // Process reviews
    if (data.reviews && data.reviews.length > 0) {
      console.log(`[AI] Processing ${data.reviews.length} reviews...`);
      result.reviewSummaries = await batchSummarizeReviews(data.reviews.slice(0, 20)); // Limit to 20
    }

    // Process courses
    if (data.courses && data.courses.length > 0 && data.userProfile) {
      console.log(`[AI] Processing ${data.courses.length} courses...`);
      result.courseRecommendations = await batchScoreCourses(
        data.courses.slice(0, 15), // Limit to 15
        data.userProfile
      );
    }

    // Process mentors
    if (data.mentors && data.mentors.length > 0 && data.userProfile) {
      console.log(`[AI] Processing ${data.mentors.length} mentors...`);
      result.mentorMatches = await batchMatchMentors(
        data.mentors.slice(0, 10), // Limit to 10
        data.userProfile
      );
    }

    console.log('[AI] Data processing complete:', {
      reviews: result.reviewSummaries.length,
      courses: result.courseRecommendations.length,
      mentors: result.mentorMatches.length
    });

    return result;

  } catch (error) {
    console.error('[AI] Error processing data:', error);
    return result;
  }
}

/**
 * Quick sentiment check (no full analysis)
 */
export function quickSentimentCheck(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['great', 'excellent', 'good', 'best', 'amazing', 'wonderful', 'helpful', 'recommend'];
  const negativeWords = ['bad', 'poor', 'worst', 'terrible', 'awful', 'disappointing', 'waste', 'avoid'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// ===== EXPORTS =====

export default {
  analyzeSentiment,
  summarizeReview,
  batchSummarizeReviews,
  scoreCourseRelevance,
  batchScoreCourses,
  matchMentorToUser,
  batchMatchMentors,
  processAllData,
  quickSentimentCheck
};

/**
 * Reddit Integration Service
 * Fetches authentic student reviews from Reddit
 */

import type { RedditReview, ReviewSummary, ReviewFilters } from '@/lib/types/community';

const REDDIT_API_BASE = 'https://www.reddit.com/';

/**
 * Fetch reviews for a college from Reddit
 */
export async function fetchCollegeReviews(
  collegeName: string,
  filters?: ReviewFilters
): Promise<RedditReview[]> {
  try {
    const reviews: RedditReview[] = [];
    
    // Search multiple relevant subreddits
    const subreddits = [
      'Indian_Academia',
      'IndianStudents',
      'EngineeringStudents',
      'india',
      'bangalore',
      'mumbai',
      'delhi',
      'hyderabad',
      'pune',
      'Chennai',
      'kolkata'
    ];
    
    for (const subreddit of subreddits) {
      try {
        const subredditReviews = await searchSubreddit(collegeName, subreddit);
        reviews.push(...subredditReviews);
        
        // Small delay to avoid rate limiting (Reddit allows ~60 requests per minute)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Silently continue - don't break the entire search for one subreddit failure
        if (error instanceof Error && !error.message.includes('404')) {
          console.warn(`Could not fetch from r/${subreddit}:`, error.message);
        }
      }
    }
    
    // Apply filters
    let filteredReviews = reviews;
    if (filters) {
      filteredReviews = applyFilters(reviews, filters);
    }
    
    // Sort by score and recency
    filteredReviews.sort((a, b) => {
      const scoreA = a.score + (Date.now() - a.created_utc * 1000) / (1000 * 60 * 60 * 24 * 30);
      const scoreB = b.score + (Date.now() - b.created_utc * 1000) / (1000 * 60 * 60 * 24 * 30);
      return scoreB - scoreA;
    });
    
    return filteredReviews.slice(0, 50); // Limit to 50 reviews
  } catch (error) {
    console.error('Error fetching Reddit reviews:', error);
    return [];
  }
}

/**
 * Search a specific subreddit for college mentions
 */
async function searchSubreddit(
  collegeName: string,
  subreddit: string
): Promise<RedditReview[]> {
  try {
    // Construct search query
    const searchQuery = encodeURIComponent(collegeName);
    const url = `${REDDIT_API_BASE}r/${subreddit}/search.json?q=${searchQuery}&restrict_sr=1&sort=relevance&limit=25`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CareerLens/1.0'
      }
    });
    
    if (!response.ok) {
      // Silently skip 404 errors (subreddit doesn't exist or is private)
      if (response.status === 404) {
        console.warn(`Subreddit r/${subreddit} not found or is private (404)`);
        return [];
      }
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    const reviews: RedditReview[] = [];
    
    if (data.data && data.data.children) {
      for (const post of data.data.children) {
        const postData = post.data;
        
        // Skip if college name not mentioned
        const text = `${postData.title} ${postData.selftext || ''}`.toLowerCase();
        if (!text.includes(collegeName.toLowerCase())) {
          continue;
        }
        
        const review: RedditReview = {
          id: postData.id,
          college_id: '', // Will be set by caller
          college_name: collegeName,
          post_id: postData.id,
          post_title: postData.title,
          post_url: `https://reddit.com${postData.permalink}`,
          author: postData.author,
          content: postData.selftext || postData.title,
          created_utc: postData.created_utc,
          score: postData.score,
          num_comments: postData.num_comments,
          subreddit: postData.subreddit,
          flair: postData.link_flair_text,
          sentiment: analyzeSentiment(postData.selftext || postData.title),
          topics: extractTopics(postData.selftext || postData.title),
          batch_year: extractBatchYear(postData.selftext || postData.title),
          course: extractCourse(postData.selftext || postData.title),
          verified: postData.link_flair_text?.includes('Verified') || false
        };
        
        reviews.push(review);
      }
    }
    
    return reviews;
  } catch (error) {
    console.error(`Error searching r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Analyze sentiment of text
 */
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'great', 'excellent', 'amazing', 'good', 'best', 'love', 'awesome', 
    'fantastic', 'wonderful', 'outstanding', 'impressive', 'highly recommend',
    'satisfied', 'happy', 'proud', 'beautiful campus', 'good placement'
  ];
  
  // Negative keywords
  const negativeWords = [
    'bad', 'poor', 'worst', 'terrible', 'awful', 'horrible', 'hate',
    'disappointed', 'regret', 'waste', 'not worth', 'avoid', 'pathetic',
    'unprofessional', 'overrated', 'useless'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  if (total === 0) return 'neutral';
  
  if (positiveCount > negativeCount * 2) return 'positive';
  if (negativeCount > positiveCount * 2) return 'negative';
  if (Math.abs(positiveCount - negativeCount) <= 1) return 'mixed';
  
  return positiveCount > negativeCount ? 'positive' : 'negative';
}

/**
 * Extract topics from text
 */
function extractTopics(text: string): string[] {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const topics: string[] = [];
  
  const topicKeywords: Record<string, string[]> = {
    'Placements': ['placement', 'placed', 'package', 'salary', 'job', 'recruit', 'internship'],
    'Faculty': ['faculty', 'professor', 'teacher', 'teaching', 'instructor', 'staff'],
    'Infrastructure': ['infrastructure', 'building', 'campus', 'facility', 'lab', 'library', 'hostel'],
    'Curriculum': ['curriculum', 'syllabus', 'course', 'subject', 'semester', 'exam'],
    'Fees': ['fees', 'fee structure', 'cost', 'expensive', 'affordable', 'scholarship'],
    'Campus Life': ['campus', 'fest', 'event', 'club', 'activity', 'social', 'friends'],
    'Location': ['location', 'city', 'connectivity', 'transport', 'area'],
    'Admin': ['management', 'administration', 'admin', 'office', 'staff']
  };
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  });
  
  return topics.length > 0 ? topics : ['General'];
}

/**
 * Extract batch year from text
 */
function extractBatchYear(text: string): number | undefined {
  const yearMatch = text.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2015 && year <= 2030) {
      return year;
    }
  }
  return undefined;
}

/**
 * Extract course from text
 */
function extractCourse(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  const courses = [
    'computer science', 'cs', 'cse',
    'information technology', 'it',
    'electronics', 'ece',
    'mechanical', 'mech',
    'civil',
    'electrical', 'eee',
    'medicine', 'mbbs',
    'btech', 'mtech', 'mba'
  ];
  
  for (const course of courses) {
    if (lowerText.includes(course)) {
      return course.toUpperCase();
    }
  }
  
  return undefined;
}

/**
 * Apply filters to reviews
 */
function applyFilters(
  reviews: RedditReview[],
  filters: ReviewFilters
): RedditReview[] {
  let filtered = reviews;
  
  if (filters.batch_years && filters.batch_years.length > 0) {
    filtered = filtered.filter(r => 
      r.batch_year && filters.batch_years!.includes(r.batch_year)
    );
  }
  
  if (filters.courses && filters.courses.length > 0) {
    filtered = filtered.filter(r => 
      r.course && filters.courses!.some(c => 
        r.course!.toLowerCase().includes(c.toLowerCase())
      )
    );
  }
  
  if (filters.topics && filters.topics.length > 0) {
    filtered = filtered.filter(r =>
      r.topics.some(t => filters.topics!.includes(t))
    );
  }
  
  if (filters.sentiment && filters.sentiment.length > 0) {
    filtered = filtered.filter(r => filters.sentiment!.includes(r.sentiment));
  }
  
  if (filters.min_score) {
    filtered = filtered.filter(r => r.score >= filters.min_score!);
  }
  
  if (filters.verified_only) {
    filtered = filtered.filter(r => r.verified);
  }
  
  return filtered;
}

/**
 * Generate review summary from reviews
 */
export function generateReviewSummary(
  collegeId: string,
  reviews: RedditReview[]
): ReviewSummary {
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
    mixed: 0
  };
  
  reviews.forEach(review => {
    sentimentCounts[review.sentiment]++;
  });
  
  const totalSentiment = 
    sentimentCounts.positive * 1 +
    sentimentCounts.mixed * 0 +
    sentimentCounts.neutral * 0 +
    sentimentCounts.negative * -1;
  
  const averageSentiment = totalSentiment / reviews.length || 0;
  
  // Analyze topics
  const topicRatings: Record<string, any> = {};
  reviews.forEach(review => {
    review.topics.forEach(topic => {
      if (!topicRatings[topic]) {
        topicRatings[topic] = {
          topic,
          mention_count: 0,
          positive_count: 0,
          negative_count: 0,
          key_points: []
        };
      }
      topicRatings[topic].mention_count++;
      if (review.sentiment === 'positive') topicRatings[topic].positive_count++;
      if (review.sentiment === 'negative') topicRatings[topic].negative_count++;
    });
  });
  
  // Calculate topic ratings
  Object.values(topicRatings).forEach((topic: any) => {
    const sentimentScore = (topic.positive_count - topic.negative_count) / topic.mention_count;
    topic.average_rating = Math.max(0, Math.min(5, 2.5 + sentimentScore * 2.5));
    topic.sentiment = sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral';
  });
  
  // Determine trend
  const recentReviews = reviews.filter(r => 
    r.created_utc > (Date.now() / 1000) - (180 * 24 * 60 * 60) // Last 6 months
  );
  const recentSentiment = recentReviews.reduce((sum, r) => 
    sum + (r.sentiment === 'positive' ? 1 : r.sentiment === 'negative' ? -1 : 0), 0
  ) / recentReviews.length || 0;
  
  const trend = recentSentiment > averageSentiment + 0.2 ? 'improving' :
                recentSentiment < averageSentiment - 0.2 ? 'declining' : 'stable';
  
  return {
    college_id: collegeId,
    total_reviews: reviews.length,
    average_sentiment: averageSentiment,
    sentiment_distribution: sentimentCounts,
    topic_ratings: topicRatings,
    recent_trend: trend,
    last_updated: Date.now()
  };
}

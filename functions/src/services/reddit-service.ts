/**
 * Reddit API Integration Service
 * Fetches career insights from relevant subreddits
 */

import fetch from 'node-fetch';

export interface RedditPost {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  comments: number;
  url: string;
  subreddit: string;
  createdAt: Date;
  flair?: string;
}

const SUBREDDITS = [
  'cscareerquestions',
  'learnprogramming',
  'ITCareerQuestions',
  'careerguidance',
  'datascience',
  'MachineLearning',
  'webdev',
  'devops'
];

/**
 * Fetch top posts from career-related subreddits
 */
export async function fetchRedditCareerInsights(limit: number = 10): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];

  try {
    for (const subreddit of SUBREDDITS) {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CareerLens/1.0 (AI Career Intelligence Hub)'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch from r/${subreddit}: ${response.statusText}`);
        continue;
      }

      const data: any = await response.json();
      const posts = data.data.children;

      for (const post of posts) {
        const postData = post.data;
        
        // Filter for career-relevant posts
        if (isCareerRelevant(postData.title, postData.selftext)) {
          allPosts.push({
            id: postData.id,
            title: postData.title,
            content: postData.selftext || postData.title,
            author: postData.author,
            upvotes: postData.ups,
            comments: postData.num_comments,
            url: `https://reddit.com${postData.permalink}`,
            subreddit: subreddit,
            createdAt: new Date(postData.created_utc * 1000),
            flair: postData.link_flair_text
          });
        }
      }
    }

    // Sort by upvotes and return top posts
    return allPosts
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit * 2);

  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    return [];
  }
}

/**
 * Check if post is career-relevant
 */
function isCareerRelevant(title: string, content: string): boolean {
  const keywords = [
    'job', 'career', 'interview', 'salary', 'internship', 'hire', 'hiring',
    'resume', 'cv', 'leetcode', 'certification', 'course', 'learning',
    'transition', 'switch', 'offer', 'advice', 'guidance', 'skill',
    'bootcamp', 'degree', 'experience', 'junior', 'senior', 'entry level'
  ];

  const text = (title + ' ' + content).toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
}

/**
 * Fetch trending tech topics from r/technology and r/programming
 */
export async function fetchTechTrends(): Promise<string[]> {
  const trends: Set<string> = new Set();

  try {
    const techSubreddits = ['technology', 'programming', 'artificial', 'MachineLearning'];
    
    for (const subreddit of techSubreddits) {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CareerLens/1.0'
        }
      });

      if (!response.ok) continue;

      const data: any = await response.json();
      const posts = data.data.children;

      for (const post of posts) {
        const title = post.data.title.toLowerCase();
        
        // Extract tech keywords
        const techKeywords = [
          'AI', 'machine learning', 'python', 'javascript', 'react', 'kubernetes',
          'docker', 'cloud', 'AWS', 'azure', 'GCP', 'terraform', 'typescript',
          'golang', 'rust', 'devops', 'blockchain', 'web3', 'cybersecurity'
        ];

        techKeywords.forEach(keyword => {
          if (title.includes(keyword.toLowerCase())) {
            trends.add(keyword);
          }
        });
      }
    }

    return Array.from(trends);

  } catch (error) {
    console.error('Error fetching tech trends:', error);
    return [];
  }
}

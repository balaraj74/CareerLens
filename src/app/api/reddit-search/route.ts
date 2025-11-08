import { NextRequest, NextResponse } from 'next/server';

const REDDIT_API_BASE = 'https://www.reddit.com/';

// Simple in-memory cache with 5-minute expiry
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Reddit is blocking our requests, so use mock data for demo
const MOCK_ENABLED = true;

export async function POST(request: NextRequest) {
  try {
    const { collegeName, subreddits } = await request.json();

    if (!collegeName) {
      return NextResponse.json(
        { error: 'College name is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = collegeName.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Cache hit for: ${collegeName}`);
      return NextResponse.json(cached.data);
    }

    console.log(`🔍 Fetching Reddit reviews for: ${collegeName}`);

    // Use mock data if enabled (Reddit blocks us otherwise)
    if (MOCK_ENABLED) {
      const mockReviews = generateMockRedditReviews(collegeName);
      const result = {
        success: true,
        collegeName,
        reviews: mockReviews,
        total: mockReviews.length,
        source: 'mock' // Indicate this is mock data
      };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log(`✅ Generated ${mockReviews.length} mock Reddit reviews for ${collegeName}`);
      return NextResponse.json(result);
    }

    const searchSubreddits = subreddits || [
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

    const allReviews: any[] = [];

    // Search each subreddit
    for (const subreddit of searchSubreddits) {
      try {
        const searchQuery = encodeURIComponent(collegeName);
        const url = `${REDDIT_API_BASE}r/${subreddit}/search.json?q=${searchQuery}&restrict_sr=1&sort=relevance&limit=25`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CareerLens/1.0 (College Review Aggregator)'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Subreddit r/${subreddit} not found (404)`);
            continue;
          }
          throw new Error(`Reddit API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.children) {
          for (const post of data.data.children) {
            const postData = post.data;

            // Check if college name is mentioned
            const text = `${postData.title} ${postData.selftext || ''}`.toLowerCase();
            if (!text.includes(collegeName.toLowerCase())) {
              continue;
            }

            // Analyze sentiment
            const sentiment = analyzeSentiment(postData.selftext || postData.title);
            const topics = extractTopics(postData.selftext || postData.title);

            const review = {
              id: postData.id,
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
              flair: postData.link_flair_text || null,
              sentiment,
              topics,
              verified: postData.link_flair_text?.includes('Verified') || false
            };

            allReviews.push(review);
          }
        }

        // Longer delay to avoid rate limiting (500ms between requests)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) {
          console.warn(`Could not fetch from r/${subreddit}:`, error.message);
        }
      }
    }

    // Sort by score and recency
    allReviews.sort((a, b) => {
      const scoreA = a.score + (Date.now() - a.created_utc * 1000) / (1000 * 60 * 60 * 24 * 30);
      const scoreB = b.score + (Date.now() - b.created_utc * 1000) / (1000 * 60 * 60 * 24 * 30);
      return scoreB - scoreA;
    });

    const limitedReviews = allReviews.slice(0, 50);

    console.log(`✅ Found ${limitedReviews.length} Reddit reviews for ${collegeName}`);

    const result = {
      success: true,
      collegeName,
      reviews: limitedReviews,
      total: limitedReviews.length
    };

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in Reddit search API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Reddit reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
  if (!text) return 'neutral';

  const lowerText = text.toLowerCase();

  const positiveWords = [
    'great', 'excellent', 'amazing', 'good', 'best', 'love', 'awesome',
    'fantastic', 'wonderful', 'outstanding', 'impressive', 'highly recommend',
    'satisfied', 'happy', 'proud', 'beautiful campus', 'good placement'
  ];

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

function generateMockRedditReviews(collegeName: string): any[] {
  const reviews = [
    {
      id: `mock_${Date.now()}_1`,
      college_name: collegeName,
      post_id: 'mock1',
      post_title: `My experience at ${collegeName}`,
      post_url: 'https://reddit.com/r/Indian_Academia',
      author: 'Student123',
      content: `I've been studying at ${collegeName} for 2 years now. The placements are pretty good, especially for CS students. Faculty is knowledgeable but infrastructure could be better. Overall a solid choice!`,
      created_utc: Math.floor(Date.now() / 1000) - 86400 * 30,
      score: 45,
      num_comments: 12,
      subreddit: 'Indian_Academia',
      sentiment: 'positive',
      topics: ['Placements', 'Faculty', 'Infrastructure']
    },
    {
      id: `mock_${Date.now()}_2`,
      college_name: collegeName,
      post_id: 'mock2',
      post_title: `${collegeName} placement statistics 2024`,
      post_url: 'https://reddit.com/r/IndianStudents',
      author: 'CareerSeeker',
      content: `${collegeName} has shown excellent placement records this year. Average package increased by 15%. Top companies like Google, Microsoft, and Amazon visited campus. Highly recommended for tech students.`,
      created_utc: Math.floor(Date.now() / 1000) - 86400 * 15,
      score: 67,
      num_comments: 23,
      subreddit: 'IndianStudents',
      sentiment: 'positive',
      topics: ['Placements']
    },
    {
      id: `mock_${Date.now()}_3`,
      college_name: collegeName,
      post_id: 'mock3',
      post_title: `Campus life at ${collegeName}`,
      post_url: 'https://reddit.com/r/bangalore',
      author: 'CampusLife2024',
      content: `The campus culture at ${collegeName} is vibrant with lots of fests and technical events. Great clubs for coding, robotics, and cultural activities. Infrastructure is modern with good labs and library facilities.`,
      created_utc: Math.floor(Date.now() / 1000) - 86400 * 45,
      score: 34,
      num_comments: 8,
      subreddit: 'bangalore',
      sentiment: 'positive',
      topics: ['Campus Life', 'Infrastructure']
    },
    {
      id: `mock_${Date.now()}_4`,
      college_name: collegeName,
      post_id: 'mock4',
      post_title: `${collegeName} review - honest opinion`,
      post_url: 'https://reddit.com/r/EngineeringStudents',
      author: 'HonestReviewer',
      content: `${collegeName} is decent but has some issues. The faculty quality varies - some professors are excellent while others are just okay. Fees are on the higher side. However, the placement support is good and campus is well-maintained.`,
      created_utc: Math.floor(Date.now() / 1000) - 86400 * 60,
      score: 28,
      num_comments: 15,
      subreddit: 'EngineeringStudents',
      sentiment: 'mixed',
      topics: ['Faculty', 'Fees', 'Placements', 'Infrastructure']
    },
    {
      id: `mock_${Date.now()}_5`,
      college_name: collegeName,
      post_id: 'mock5',
      post_title: `Thinking of joining ${collegeName}, need advice`,
      post_url: 'https://reddit.com/r/Indian_Academia',
      author: 'FutureStudent',
      content: `Considering ${collegeName} for BTech. Heard good things about their placement record and industry connections. The location is great too with good connectivity. Any current students who can share their experience?`,
      created_utc: Math.floor(Date.now() / 1000) - 86400 * 20,
      score: 19,
      num_comments: 27,
      subreddit: 'Indian_Academia',
      sentiment: 'neutral',
      topics: ['Placements', 'Location']
    }
  ];

  return reviews;
}

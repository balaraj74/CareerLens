/**
 * AI Review Summarization Service
 * Uses Gemini to generate intelligent summaries of college reviews
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RedditReview, ReviewSummary } from '@/lib/types/community';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Generate AI summary of college reviews
 */
export async function generateAISummary(
  collegeName: string,
  reviews: RedditReview[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Prepare reviews for summarization
    const reviewTexts = reviews.slice(0, 20).map((review, idx) => 
      `Review ${idx + 1} (${review.sentiment}, ${review.score} upvotes):\n${review.content}\n`
    ).join('\n---\n');
    
    const prompt = `You are an expert college counselor analyzing student reviews for ${collegeName}.

Here are authentic student reviews from Reddit:

${reviewTexts}

Please provide a comprehensive summary in this format:

**Overall Sentiment:** [Brief overview]

**Strengths:**
- [List 3-5 key positive points]

**Weaknesses:**
- [List 3-5 key concerns]

**Key Topics:**
- **Placements:** [Brief summary]
- **Faculty & Teaching:** [Brief summary]
- **Infrastructure:** [Brief summary]
- **Campus Life:** [Brief summary]

**Bottom Line:** [2-3 sentences with honest recommendation]

Keep it objective, balanced, and helpful for students making decisions.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateFallbackSummary(collegeName, reviews);
  }
}

/**
 * Fallback summary if AI fails
 */
function generateFallbackSummary(
  collegeName: string,
  reviews: RedditReview[]
): string {
  const sentimentCounts = {
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
    mixed: reviews.filter(r => r.sentiment === 'mixed').length
  };
  
  const totalReviews = reviews.length;
  const positivePercent = Math.round((sentimentCounts.positive / totalReviews) * 100);
  
  const topTopics = getTopTopics(reviews);
  
  return `**Overall Sentiment:** Based on ${totalReviews} reviews, ${positivePercent}% of students have positive experiences at ${collegeName}.

**Top Discussion Topics:**
${topTopics.map(t => `- **${t.topic}**: Mentioned in ${t.count} reviews`).join('\n')}

**Key Points:**
- Students actively discuss placements, faculty quality, and campus facilities
- Recent reviews show ${sentimentCounts.positive > sentimentCounts.negative ? 'generally positive' : 'mixed'} sentiment
- Consider reading individual reviews for specific concerns about your branch

**Note:** This is an automated summary. Please read detailed reviews for complete context.`;
}

/**
 * Get most discussed topics
 */
function getTopTopics(reviews: RedditReview[]): Array<{ topic: string; count: number }> {
  const topicCounts: Record<string, number> = {};
  
  reviews.forEach(review => {
    review.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  
  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Generate comparison summary for multiple colleges
 */
export async function generateComparisonSummary(
  colleges: Array<{ name: string; reviews: RedditReview[] }>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const collegesInfo = colleges.map(c => {
      const positive = c.reviews.filter(r => r.sentiment === 'positive').length;
      const total = c.reviews.length;
      const percent = Math.round((positive / total) * 100);
      
      return `**${c.name}:**
- Total Reviews: ${total}
- Positive Sentiment: ${percent}%
- Top Topics: ${getTopTopics(c.reviews).map(t => t.topic).join(', ')}`;
    }).join('\n\n');
    
    const prompt = `Compare these colleges based on student reviews:

${collegesInfo}

Provide a brief comparison highlighting:
1. Which college has better overall sentiment
2. Key differentiators
3. Recommendation based on priorities (placements vs campus life vs academics)

Keep it concise (5-7 sentences).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating comparison:', error);
    return 'Unable to generate AI comparison. Please review individual summaries.';
  }
}

/**
 * Extract key quotes from reviews
 */
export function extractKeyQuotes(
  reviews: RedditReview[],
  maxQuotes: number = 5
): Array<{ text: string; author: string; sentiment: string; score: number }> {
  // Filter reviews with substantial content
  const substantialReviews = reviews.filter(r => 
    r.content.length > 100 && r.score > 0
  );
  
  // Sort by score and diversity of sentiment
  const quotes = substantialReviews
    .sort((a, b) => b.score - a.score)
    .slice(0, maxQuotes * 2)
    .reduce((acc, review) => {
      // Try to get diverse sentiments
      const hasPositive = acc.some(q => q.sentiment === 'positive');
      const hasNegative = acc.some(q => q.sentiment === 'negative');
      
      if (acc.length < maxQuotes) {
        if (review.sentiment === 'positive' && !hasPositive) {
          acc.push({
            text: truncateText(review.content, 200),
            author: review.author,
            sentiment: review.sentiment,
            score: review.score
          });
        } else if (review.sentiment === 'negative' && !hasNegative) {
          acc.push({
            text: truncateText(review.content, 200),
            author: review.author,
            sentiment: review.sentiment,
            score: review.score
          });
        } else if (acc.length < maxQuotes) {
          acc.push({
            text: truncateText(review.content, 200),
            author: review.author,
            sentiment: review.sentiment,
            score: review.score
          });
        }
      }
      return acc;
    }, [] as Array<{ text: string; author: string; sentiment: string; score: number }>);
  
  return quotes;
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Analyze placement reviews specifically
 */
export function analyzePlacementReviews(reviews: RedditReview[]): {
  average_package_mentioned: number | null;
  top_recruiters: string[];
  placement_percentage: number | null;
  key_insights: string[];
} {
  const placementReviews = reviews.filter(r => 
    r.topics.includes('Placements') || 
    r.content.toLowerCase().includes('placement') ||
    r.content.toLowerCase().includes('package')
  );
  
  // Extract package numbers (in LPA)
  const packages: number[] = [];
  placementReviews.forEach(review => {
    const matches = review.content.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lakhs)/gi);
    if (matches) {
      matches.forEach(match => {
        const num = parseFloat(match);
        if (num > 0 && num < 100) { // Reasonable package range
          packages.push(num);
        }
      });
    }
  });
  
  const avgPackage = packages.length > 0 
    ? packages.reduce((sum, p) => sum + p, 0) / packages.length 
    : null;
  
  // Extract company names (common patterns)
  const companies = new Set<string>();
  const companyPatterns = [
    /placed at (\w+)/gi,
    /recruited by (\w+)/gi,
    /offer from (\w+)/gi,
    /joined (\w+)/gi
  ];
  
  placementReviews.forEach(review => {
    companyPatterns.forEach(pattern => {
      const matches = review.content.matchAll(pattern);
      for (const match of matches) {
        companies.add(match[1]);
      }
    });
  });
  
  // Extract placement percentage
  let placementPercent: number | null = null;
  placementReviews.forEach(review => {
    const match = review.content.match(/(\d+)%?\s*(?:placed|placement)/i);
    if (match) {
      const percent = parseInt(match[1]);
      if (percent > 0 && percent <= 100) {
        placementPercent = percent;
      }
    }
  });
  
  // Generate insights
  const insights: string[] = [];
  if (avgPackage) {
    insights.push(`Average package mentioned: ₹${avgPackage.toFixed(1)} LPA`);
  }
  if (placementPercent) {
    insights.push(`Placement rate: ${placementPercent}%`);
  }
  if (companies.size > 0) {
    insights.push(`Top recruiters: ${Array.from(companies).slice(0, 5).join(', ')}`);
  }
  
  const positiveCount = placementReviews.filter(r => r.sentiment === 'positive').length;
  const negativeCount = placementReviews.filter(r => r.sentiment === 'negative').length;
  
  if (positiveCount > negativeCount * 2) {
    insights.push('Students generally satisfied with placement outcomes');
  } else if (negativeCount > positiveCount) {
    insights.push('Some concerns raised about placement support');
  }
  
  return {
    average_package_mentioned: avgPackage,
    top_recruiters: Array.from(companies).slice(0, 10),
    placement_percentage: placementPercent,
    key_insights: insights
  };
}

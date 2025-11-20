"use strict";
/**
 * Reddit API Integration Service
 * Fetches career insights from relevant subreddits
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRedditCareerInsights = fetchRedditCareerInsights;
exports.fetchTechTrends = fetchTechTrends;
const node_fetch_1 = __importDefault(require("node-fetch"));
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
async function fetchRedditCareerInsights(limit = 10) {
    const allPosts = [];
    try {
        for (const subreddit of SUBREDDITS) {
            const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
            const response = await (0, node_fetch_1.default)(url, {
                headers: {
                    'User-Agent': 'CareerLens/1.0 (AI Career Intelligence Hub)'
                }
            });
            if (!response.ok) {
                console.error(`Failed to fetch from r/${subreddit}: ${response.statusText}`);
                continue;
            }
            const data = await response.json();
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
    }
    catch (error) {
        console.error('Error fetching Reddit data:', error);
        return [];
    }
}
/**
 * Check if post is career-relevant
 */
function isCareerRelevant(title, content) {
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
async function fetchTechTrends() {
    const trends = new Set();
    try {
        const techSubreddits = ['technology', 'programming', 'artificial', 'MachineLearning'];
        for (const subreddit of techSubreddits) {
            const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
            const response = await (0, node_fetch_1.default)(url, {
                headers: {
                    'User-Agent': 'CareerLens/1.0'
                }
            });
            if (!response.ok)
                continue;
            const data = await response.json();
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
    }
    catch (error) {
        console.error('Error fetching tech trends:', error);
        return [];
    }
}
//# sourceMappingURL=reddit-service.js.map
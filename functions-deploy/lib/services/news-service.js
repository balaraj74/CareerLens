"use strict";
/**
 * Google News API Integration Service
 * Fetches latest career and technology news
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCareerNews = fetchCareerNews;
exports.fetchTechHeadlines = fetchTechHeadlines;
const node_fetch_1 = __importDefault(require("node-fetch"));
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_BASE = 'https://newsapi.org/v2';
/**
 * Fetch career-related news from Google News API
 */
async function fetchCareerNews(limit = 20) {
    const queries = [
        'technology jobs',
        'AI careers',
        'cloud certifications',
        'software engineering internship',
        'tech hiring trends',
        'Google careers',
        'Microsoft careers',
        'startup jobs'
    ];
    const allArticles = [];
    try {
        for (const query of queries) {
            const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
            const response = await (0, node_fetch_1.default)(url);
            if (!response.ok) {
                console.error(`Failed to fetch news for "${query}": ${response.statusText}`);
                continue;
            }
            const data = await response.json();
            if (data.articles) {
                for (const article of data.articles) {
                    allArticles.push({
                        id: generateId(article.url),
                        title: article.title,
                        description: article.description || '',
                        content: article.content || article.description || '',
                        source: article.source.name,
                        author: article.author,
                        url: article.url,
                        imageUrl: article.urlToImage,
                        publishedAt: new Date(article.publishedAt),
                        category: categorizeArticle(article.title, article.description)
                    });
                }
            }
        }
        // Remove duplicates and sort by date
        const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.url, item])).values());
        return uniqueArticles
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
            .slice(0, limit);
    }
    catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}
/**
 * Fetch top headlines for tech industry
 */
async function fetchTechHeadlines() {
    try {
        const url = `${NEWS_API_BASE}/top-headlines?category=technology&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`;
        const response = await (0, node_fetch_1.default)(url);
        if (!response.ok) {
            console.error('Failed to fetch tech headlines');
            return [];
        }
        const data = await response.json();
        if (data.articles) {
            return data.articles.map((article) => ({
                id: generateId(article.url),
                title: article.title,
                description: article.description || '',
                content: article.content || article.description || '',
                source: article.source.name,
                author: article.author,
                url: article.url,
                imageUrl: article.urlToImage,
                publishedAt: new Date(article.publishedAt),
                category: 'tech'
            }));
        }
        return [];
    }
    catch (error) {
        console.error('Error fetching tech headlines:', error);
        return [];
    }
}
/**
 * Categorize article based on title and description
 */
function categorizeArticle(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('job') || text.includes('hiring') || text.includes('internship') || text.includes('career')) {
        return 'job';
    }
    if (text.includes('certification') || text.includes('course') || text.includes('training') || text.includes('certificate')) {
        return 'certification';
    }
    if (text.includes('industry') || text.includes('market') || text.includes('trend') || text.includes('forecast')) {
        return 'industry';
    }
    return 'tech';
}
/**
 * Generate unique ID from URL
 */
function generateId(url) {
    return Buffer.from(url).toString('base64').substring(0, 20);
}
//# sourceMappingURL=news-service.js.map
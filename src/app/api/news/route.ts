import { NextRequest, NextResponse } from 'next/server';

const NEWS_API_KEY = '649784e50c964c6d80cd7e75ddb0d94f';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region') || 'indian';
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '20';
    const query = searchParams.get('query');

    let url: string;

    if (query) {
      // Search endpoint
      if (region === 'indian') {
        url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
      } else {
        url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
      }
    } else {
      // Use "everything" endpoint with region-specific queries (free tier limitation)
      if (region === 'indian') {
        // Query for Indian news with category-specific keywords
        const searchQuery = category && category !== 'all' && category !== 'general' 
          ? `india ${category}` 
          : 'india';
        url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
      } else {
        // Query for global news with category-specific keywords
        const searchQuery = category && category !== 'all' && category !== 'general' 
          ? category 
          : 'world news';
        url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Log for debugging
    console.log(`NewsAPI Response: ${data.totalResults} articles found`);

    // Transform and filter articles
    const articles = data.articles
      .filter((article: any) => 
        article.title && 
        article.title !== '[Removed]' && 
        article.description &&
        article.url
      )
      .map((article: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        headline: article.title,
        snippet: article.description,
        image: article.urlToImage || '/placeholder-news.jpg',
        source: article.source.name,
        publishTime: article.publishedAt,
        link: article.url,
        category: category || 'general',
        author: article.author || 'Unknown',
      }));

    console.log(`Filtered to ${articles.length} valid articles`);

    return NextResponse.json({ 
      success: true,
      articles,
      total: articles.length 
    });

  } catch (error) {
    console.error('News API Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return a more helpful error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch news from NewsAPI';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        articles: [],
        debug: process.env.NODE_ENV === 'development' ? {
          apiKeyPresent: !!NEWS_API_KEY,
          errorType: error instanceof Error ? error.constructor.name : typeof error
        } : undefined
      },
      { status: 500 }
    );
  }
}

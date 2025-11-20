import { NextResponse } from 'next/server';

// Helper to fetch from Google Custom Search
async function fetchGoogleCareerSearch(apiKey: string, searchEngineId: string, query: string) {
    if (!apiKey || !searchEngineId) return { items: [], error: 'Missing API keys' };

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function GET() {
    const googleKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY || '';
    const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID || '';
    const geminiKey = process.env.GEMINI_API_KEY || '';

    // Test one simple query
    const testQuery = "site:linkedin.com/jobs software engineer india";
    const result = await fetchGoogleCareerSearch(googleKey, googleCx, testQuery);

    return NextResponse.json({
        keys: {
            googleKey: googleKey ? `${googleKey.substring(0, 15)}...` : 'MISSING',
            googleCx: googleCx ? `${googleCx.substring(0, 10)}...` : 'MISSING',
            geminiKey: geminiKey ? 'Present' : 'MISSING'
        },
        testQuery,
        result: result,
        itemsFound: result.items?.length || 0,
        error: result.error || null
    });
}

'use client';

/**
 * Real-Time Data Services Test Page
 * 
 * Test all 4 services:
 * - Reddit API
 * - Google Custom Search
 * - Web Scraper (NPTEL, Coursera, etc.)
 * - AI Summarizer
 * 
 * Access at: http://localhost:3000/test-services
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function TestServicesPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const testRedditAPI = async () => {
    setLoading('reddit');
    setErrors({ ...errors, reddit: null });
    try {
      const response = await fetch('/api/test/reddit');
      const data = await response.json();
      setResults({ ...results, reddit: data });
    } catch (error: any) {
      setErrors({ ...errors, reddit: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testGoogleSearch = async () => {
    setLoading('google');
    setErrors({ ...errors, google: null });
    try {
      const response = await fetch('/api/test/google-search');
      const data = await response.json();
      setResults({ ...results, google: data });
    } catch (error: any) {
      setErrors({ ...errors, google: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testWebScraper = async () => {
    setLoading('scraper');
    setErrors({ ...errors, scraper: null });
    try {
      const response = await fetch('/api/test/web-scraper');
      const data = await response.json();
      setResults({ ...results, scraper: data });
    } catch (error: any) {
      setErrors({ ...errors, scraper: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testAISummarizer = async () => {
    setLoading('ai');
    setErrors({ ...errors, ai: null });
    try {
      const response = await fetch('/api/test/ai-summarizer');
      const data = await response.json();
      setResults({ ...results, ai: data });
    } catch (error: any) {
      setErrors({ ...errors, ai: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testAll = async () => {
    await testRedditAPI();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testGoogleSearch();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testWebScraper();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testAISummarizer();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Real-Time Data Services Test</h1>
          <p className="text-muted-foreground">
            Test all 4 services to verify your API credentials and connections
          </p>
        </div>

        {/* Test All Button */}
        <div className="flex gap-4">
          <Button onClick={testAll} disabled={loading !== null} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test All Services'
            )}
          </Button>
        </div>

        {/* API Status Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Make sure you have set up your API credentials in <code>.env.local</code>:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY (for Google Search)</li>
              <li>NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=6495457f6bd0c4747 ✅</li>
              <li>GOOGLE_GENAI_API_KEY (for AI Summarizer) ✅</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reddit API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Reddit API Service
                {results.reddit && !errors.reddit && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {errors.reddit && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Fetch real-time student reviews from 7 education subreddits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testRedditAPI} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'reddit' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Reddit API
              </Button>

              {results.reddit && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    Found {results.reddit.count} reviews
                  </Badge>
                  <p className="text-sm text-muted-foreground">{results.reddit.message}</p>
                  {results.reddit.sample && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">{results.reddit.sample.title}</p>
                      <p className="text-muted-foreground mt-1">
                        {results.reddit.sample.subreddit} • {results.reddit.sample.category}
                      </p>
                      {results.reddit.sample.url && (
                        <a 
                          href={results.reddit.sample.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                        >
                          View on Reddit →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {errors.reddit && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.reddit}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Google Custom Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Google Custom Search
                {results.google && !errors.google && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {errors.google && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Search for reviews, courses, and mentors across the web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testGoogleSearch} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'google' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Google Search
              </Button>

              {results.google && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    Found {results.google.count} results
                  </Badge>
                  <p className="text-sm text-muted-foreground">{results.google.message}</p>
                  {results.google.sample && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">{results.google.sample.title}</p>
                      <p className="text-muted-foreground mt-1">
                        {results.google.sample.category}
                      </p>
                      {results.google.sample.link && (
                        <a 
                          href={results.google.sample.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                        >
                          Open Link →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {errors.google && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.google}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Web Scraper */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Web Scraper Service
                {results.scraper && !errors.scraper && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {errors.scraper && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Scrape courses from NPTEL, Coursera, AWS, GCP, YouTube
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testWebScraper} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'scraper' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Web Scraper
              </Button>

              {results.scraper && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    Scraped {results.scraper.count} courses
                  </Badge>
                  {results.scraper.sample && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">{results.scraper.sample.title}</p>
                      <p className="text-muted-foreground mt-1">
                        {results.scraper.sample.platform} • {results.scraper.sample.isFree ? 'Free' : 'Paid'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {errors.scraper && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.scraper}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* AI Summarizer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Summarization Service
                {results.ai && !errors.ai && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {errors.ai && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Analyze sentiment, summarize reviews, score courses with Gemini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testAISummarizer} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'ai' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test AI Summarizer
              </Button>

              {results.ai && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    Sentiment: {results.ai.sentiment}
                  </Badge>
                  {results.ai.summary && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="text-muted-foreground">{results.ai.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {errors.ai && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.ai}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

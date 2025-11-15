'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  RefreshCw,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Clock,
  Loader2,
  Globe,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  fetchNews,
  searchNewsArticles,
  formatPublishTime,
  getSourceIcon,
  getCategoryColor,
  NEWS_CATEGORIES,
  type NewsArticle,
} from '@/lib/services/news-service';



export function NewsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'indian' | 'global'>('indian');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('careerlens_bookmarked_news');
    if (saved) {
      try {
        setBookmarkedIds(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('careerlens_bookmarked_news', JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  // Fetch news when tab or category changes
  useEffect(() => {
    loadNews();
  }, [activeTab, selectedCategory]);

  // Handle search - use API search if query exists
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await searchNewsArticles(searchQuery, activeTab, 20);
        setArticles(results);
        setFilteredArticles(results);
        toast({
          title: '🔍 Search Results',
          description: `Found ${results.length} articles matching "${searchQuery}"`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '❌ Search Failed',
          description: 'Unable to search news. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      loadNews();
    }
  };

  // Filter articles locally based on search query (for real-time filtering)
  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = articles.filter(
        article =>
          article.headline.toLowerCase().includes(lowerQuery) ||
          article.snippet.toLowerCase().includes(lowerQuery)
      );
      setFilteredArticles(results);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const newsData = await fetchNews(activeTab, category, 20);
      setArticles(newsData);
      setFilteredArticles(newsData);
      
      toast({
        title: '✅ News Updated',
        description: `Loaded ${newsData.length} latest articles from ${activeTab === 'indian' ? 'Indian' : 'Global'} sources.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Failed to Load News',
        description: 'Unable to fetch news articles. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
        toast({
          title: '🔖 Bookmark Removed',
          description: 'Article removed from bookmarks.',
        });
      } else {
        newSet.add(articleId);
        toast({
          title: '✅ Article Bookmarked',
          description: 'Article saved to your bookmarks.',
        });
      }
      return newSet;
    });
  };



  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
              <Newspaper className="w-8 h-8 text-primary" />
              Latest News
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with the latest headlines from India and around the world
            </p>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={loadNews}
            disabled={loading}
            className="glass-card"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* Tabs for Indian/Global News */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'indian' | 'global')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="indian" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Indian News
              </TabsTrigger>
              <TabsTrigger value="global" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Global News
              </TabsTrigger>
            </TabsList>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search news... (Press Enter to search)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="pl-10 glass-card"
                  />
                </div>
                <Button
                  variant="default"
                  onClick={handleSearch}
                  disabled={loading}
                  className="glass-card"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] glass-card">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NEWS_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* News Content */}
            <TabsContent value="indian" className="mt-0">
              <NewsGrid
                articles={filteredArticles}
                loading={loading}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
              />
            </TabsContent>

            <TabsContent value="global" className="mt-0">
              <NewsGrid
                articles={filteredArticles}
                loading={loading}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface NewsGridProps {
  articles: NewsArticle[];
  loading: boolean;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
}

function NewsGrid({
  articles,
  loading,
  bookmarkedIds,
  onToggleBookmark,
}: NewsGridProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <div className="aspect-video bg-muted rounded-t-lg" />
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="glass-card hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
              {/* Article Image */}
              {article.image && (
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {/* Bookmark Button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleBookmark(article.id);
                    }}
                  >
                    {bookmarkedIds.has(article.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}

              <CardHeader className="flex-1">
                {/* Source and Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{getSourceIcon(article.source)}</span>
                    <span className="font-medium">{article.source}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatPublishTime(article.publishTime)}
                  </div>
                </div>

                {/* Headline */}
                <CardTitle className="line-clamp-3 hover:text-primary transition-colors">
                  {article.headline}
                </CardTitle>

                {/* Snippet */}
                <CardDescription className="line-clamp-3 mt-2">
                  {article.snippet}
                </CardDescription>

                {/* Category Badge */}
                <div className="mt-3">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              {/* Read More Button */}
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  className="w-full glass-card"
                  asChild
                >
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default NewsPage;

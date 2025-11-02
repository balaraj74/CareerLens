'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Star, Filter, Search, Sparkles, TrendingUp, Award, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  type Resource,
  getAIResourceRecommendations,
  getCuratedResources,
  searchResources,
} from '@/lib/resource-hub-service';
import {
  scrapeAllPlatforms,
  type ScrapedCourse
} from '@/lib/web-scraper-service';
import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import type { EnhancedUserProfile } from '@/lib/types';

export default function ResourceHubPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResources, setLiveResources] = useState<Resource[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const providers = ['all', 'NPTEL', 'Coursera', 'AWS Educate', 'Google Cloud Skills Boost', 'edX'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, aiRecommendations, searchQuery, selectedProvider, selectedLevel]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const curated = getCuratedResources();
      setResources(curated);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to get personalized recommendations',
        variant: 'destructive',
      });
      return;
    }

    setLoadingAI(true);
    try {
      // Fetch user profile from Firestore
      const app = getApp();
      const db = getFirestore(app);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data() as EnhancedUserProfile;
      const recommendations = await getAIResourceRecommendations(userProfile);
      setAiRecommendations(recommendations);
      toast({
        title: 'Recommendations Ready!',
        description: `Found ${recommendations.length} courses tailored for you`,
      });
    } catch (error: any) {
      console.error('Error getting AI recommendations:', error);
      toast({
        title: 'Recommendation Failed',
        description: error.message || 'Failed to get personalized recommendations',
        variant: 'destructive',
      });
        } finally {
      setLoadingAI(false);
    }
  };

  const loadLiveResources = async () => {
    setLoadingLive(true);
    try {
      toast({
        title: 'Scraping Courses...',
        description: 'Fetching live courses from 5 platforms',
      });

      const scrapeResults = await scrapeAllPlatforms();
      
      // Flatten all courses from all platforms
      const allScrapedCourses: ScrapedCourse[] = scrapeResults.flatMap(result => result.courses);
      
      // Convert ScrapedCourse to Resource format
      const liveCoursesAsResources: Resource[] = allScrapedCourses.map((course: ScrapedCourse) => ({
        id: `live_${course.platform}_${course.id}`,
        title: course.title,
        description: course.description,
        url: course.url,
        provider: course.platform === 'AWS' ? 'AWS Educate' : 
                  course.platform === 'GCP' ? 'Google Cloud Skills Boost' : 
                  course.platform as 'NPTEL' | 'Coursera',
        duration: course.duration || 'Self-paced',
        category: course.category || 'Technology',
        skills: course.skillTags || [],
        certificate: true,
        free: course.isFree,
        level: course.level ? 
               (course.level.charAt(0).toUpperCase() + course.level.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced' : 
               'Beginner',
        createdAt: new Date().toISOString(),
        rating: course.rating,
        enrollments: course.enrollmentCount,
        thumbnail: course.thumbnail
      }));

      setLiveResources(liveCoursesAsResources);
      
      toast({
        title: 'Success!',
        description: `Found ${liveCoursesAsResources.length} courses from ${scrapeResults.length} platforms`,
      });
    } catch (error) {
      console.error('Error loading live resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to scrape courses',
        variant: 'destructive',
      });
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    filterResources();
  }, [resources, aiRecommendations, liveResources, selectedProvider, selectedLevel, searchQuery]);

  const filterResources = () => {
    let allResources = [...resources, ...aiRecommendations, ...liveResources];
    
    // Remove duplicates based on URL
    allResources = Array.from(new Map(allResources.map(r => [r.url, r])).values());

    // Filter by provider
    if (selectedProvider !== 'all') {
      allResources = allResources.filter((r) => r.provider === selectedProvider);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      allResources = allResources.filter((r) => r.level === selectedLevel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allResources = allResources.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      );
    }

    setFilteredResources(allResources);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const allResources = [...resources, ...aiRecommendations];
      const results = searchResources(searchQuery, allResources);
      setFilteredResources(results);
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Failed to search resources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      'NPTEL': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      'Coursera': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'AWS Educate': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      'Google Cloud Skills Boost': 'bg-green-500/10 text-green-400 border-green-500/30',
      'edX': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };
    return colors[provider] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-green-500/10 text-green-400',
      'Intermediate': 'bg-yellow-500/10 text-yellow-400',
      'Advanced': 'bg-red-500/10 text-red-400',
    };
    return colors[level] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-400" />
              Free Resource Hub
            </h1>
            <p className="text-slate-400 mt-1">
              Discover free courses from NPTEL, Coursera, AWS, GCP & more
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadAIRecommendations}
              disabled={loadingAI || !user}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loadingAI ? 'Getting Recommendations...' : 'AI Recommendations'}
            </Button>
            <Button
              onClick={loadLiveResources}
              disabled={loadingLive}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loadingLive ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Load Live Resources
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* AI Recommendations Banner */}
        {aiRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Based on your profile and goals, we found {aiRecommendations.length} courses perfect for you!
                </p>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">
                    AI-powered recommendations using your skills and career goals
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live Resources Banner */}
        {liveResources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Live Resources from Web
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Scraped {liveResources.length} fresh courses from 5 platforms: NPTEL, Coursera, AWS Training, Google Cloud Skills Boost, and YouTube!
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    Real-time data updated just now
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Search</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Provider Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Provider</label>
                <div className="flex flex-wrap gap-2">
                  {providers.map((provider) => (
                    <Button
                      key={provider}
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProvider(provider)}
                      className={`text-xs ${
                        selectedProvider === provider
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {provider === 'all' ? 'All' : provider}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLevel(level)}
                      className={`${
                        selectedLevel === level
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {level === 'all' ? 'All Levels' : level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-slate-400 mt-4">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Resources Found</h3>
                  <p className="text-slate-400 mb-4">
                    Try adjusting your filters or get AI recommendations
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedProvider('all');
                      setSelectedLevel('all');
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={getProviderColor(resource.provider)}>
                          {resource.provider}
                        </Badge>
                        {resource.isAIRecommended && (
                          <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-400 border-purple-500/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Pick
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white leading-tight">
                        {resource.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-slate-400 text-sm mb-4 flex-1">
                        {resource.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getLevelColor(resource.level)}>
                            {resource.level}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600">
                            {resource.category}
                          </Badge>
                          {resource.duration && (
                            <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600">
                              {resource.duration}
                            </Badge>
                          )}
                        </div>

                        {resource.rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < resource.rating!
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            {resource.enrollments && (
                              <span className="text-xs text-slate-500">
                                {resource.enrollments.toLocaleString()} enrolled
                              </span>
                            )}
                          </div>
                        )}

                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Course
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

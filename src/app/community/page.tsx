'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Plus, Filter, Search, Award, BookOpen, RefreshCw, Radio, ExternalLink, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  type Review,
  type ReviewSubmission,
  submitReview,
  getAllReviews,
  getReviewsByCategory,
  getMockReviews,
  voteReview,
} from '@/lib/community-service';
import { 
  type RedditPost,
  fetchCollegeReviews,
  refreshAllRedditReviews
} from '@/lib/reddit-api-service';

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [redditReviews, setRedditReviews] = useState<RedditPost[]>([]);
  const [loadingReddit, setLoadingReddit] = useState(false);
  const [redditDataSource, setRedditDataSource] = useState<'real' | 'mock' | 'error'>('real');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examData, setExamData] = useState({ exam: '', rank: '', score: '' });
  const [topColleges, setTopColleges] = useState<string[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  const categories = ['all', 'KCET', 'NEET', 'JEE', 'COMEDK', 'GATE', 'General', 'College Reviews'];

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, selectedCategory, searchQuery]);

  // Debounced Reddit search - only triggers after user stops typing for 1.5 seconds
  useEffect(() => {
    if (searchQuery.trim().length > 3) {
      const timer = setTimeout(() => {
        searchCollegeOnReddit(searchQuery);
      }, 1500); // Wait 1.5 seconds after user stops typing

      return () => clearTimeout(timer);
    } else {
      // Clear Reddit reviews if search is too short
      setRedditReviews([]);
    }
  }, [searchQuery]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Try to fetch from Firestore first, fallback to mock data
      const fetchedReviews = await getAllReviews(50);
      const allReviews = fetchedReviews.length > 0 ? fetchedReviews : getMockReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews(getMockReviews());
    } finally {
      setLoading(false);
    }
  };

  const loadRedditReviews = async () => {
    setLoadingReddit(true);
    try {
      toast({
        title: 'Loading from Reddit...',
        description: 'Fetching real reviews from r/JEENEETards',
      });

      let posts: RedditPost[] = [];
      
      if (selectedCategory === 'all') {
        // Refresh all categories
        await refreshAllRedditReviews();
        toast({
          title: 'Success!',
          description: 'Refreshed reviews from all categories',
        });
      } else {
        // Fetch specific category - type assertion to match expected category types
        const categoryMapping: Record<string, "General" | "KCET" | "NEET" | "JEE" | "COMEDK" | "GATE"> = {
          'College Reviews': 'General',
          'General': 'General',
          'KCET': 'KCET',
          'NEET': 'NEET', 
          'JEE': 'JEE',
          'COMEDK': 'COMEDK',
          'GATE': 'GATE'
        };
        const mappedCategory = categoryMapping[selectedCategory] || 'General';
        posts = await fetchCollegeReviews(mappedCategory, 20);
        setRedditReviews(posts);
        toast({
          title: 'Success!',
          description: `Found ${posts.length} reviews from Reddit`,
        });
      }
    } catch (error) {
      console.error('Error loading Reddit reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Reddit reviews',
        variant: 'destructive',
      });
    } finally {
      setLoadingReddit(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((review) => review.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.title.toLowerCase().includes(query) ||
          review.content.toLowerCase().includes(query) ||
          review.college?.toLowerCase().includes(query)
      );
    } else {
      // Clear Reddit reviews when search is empty
      setRedditReviews([]);
    }

    setFilteredReviews(filtered);
  };

  const getTopCollegesFromGemini = async (exam: string, rank: string, score: string) => {
    setLoadingColleges(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `Based on ${exam} exam with rank: ${rank} and score: ${score}, list the TOP 10 colleges in India that the student can realistically get admission to. 
      
      Return ONLY a JSON array of college names, nothing else. Format: ["College Name 1", "College Name 2", ...]
      
      Consider:
      - Student's rank and score
      - College cutoffs for ${exam}
      - Location preferences (Karnataka, Bangalore for KCET; Pan-India for JEE/NEET)
      - Branch availability
      - Include a mix of top-tier, mid-tier, and safe options
      
      Example output format:
      ["IIT Bombay", "RVCE Bangalore", "PESIT Bangalore", "BMS College of Engineering", "NIT Karnataka"]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      
      // Extract JSON array from response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      const colleges = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      console.log(`🎓 Gemini suggested ${colleges.length} colleges for ${exam}`);
      return colleges;
    } catch (error) {
      console.error('Error getting colleges from Gemini:', error);
      toast({
        title: 'Failed to get college recommendations',
        description: 'Please try again',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoadingColleges(false);
    }
  };

  const handleExamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!examData.exam || !examData.rank || !examData.score) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all exam details',
        variant: 'destructive',
      });
      return;
    }

    setIsExamModalOpen(false);
    setLoadingColleges(true);

    toast({
      title: 'Analyzing your exam results...',
      description: 'AI is finding the best colleges for you',
    });

    // Step 1: Get top colleges from Gemini
    const colleges = await getTopCollegesFromGemini(examData.exam, examData.rank, examData.score);
    
    if (colleges.length === 0) {
      toast({
        title: 'No colleges found',
        description: 'Please try with different details',
        variant: 'destructive',
      });
      return;
    }

    setTopColleges(colleges);
    
    toast({
      title: `Found ${colleges.length} colleges!`,
      description: 'Now fetching real student reviews from Reddit...',
    });

    // Step 2: Fetch Reddit reviews for each college
    await fetchReviewsForColleges(colleges);
  };

  const fetchReviewsForColleges = async (colleges: string[]) => {
    setLoadingReddit(true);
    const allReviews: RedditPost[] = [];

    try {
      // Fetch reviews for top 5 colleges to avoid too many API calls
      const collegesToSearch = colleges.slice(0, 5);
      
      for (const college of collegesToSearch) {
        try {
          console.log(`🔍 Fetching Reddit reviews for: ${college}`);
          
          const response = await fetch('/api/reddit-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ collegeName: college }),
          });

          if (response.ok) {
            const data = await response.json();
            const reviews = data.reviews || [];
            
            const redditPosts: RedditPost[] = reviews.map((review: any) => ({
              id: review.id,
              title: review.post_title,
              text: review.content,
              author: review.author,
              subreddit: review.subreddit,
              url: review.post_url,
              score: review.score,
              numComments: review.num_comments,
              created: review.created_utc,
              sentiment: review.sentiment === 'mixed' ? 'neutral' : review.sentiment,
              category: review.topics[0] || 'General'
            }));
            
            allReviews.push(...redditPosts);
          }
          
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error fetching reviews for ${college}:`, error);
        }
      }

      setRedditReviews(allReviews);
      
      toast({
        title: `Success! Found ${allReviews.length} reviews`,
        description: `Showing real student experiences from Reddit`,
      });
    } catch (error) {
      console.error('Error fetching college reviews:', error);
      toast({
        title: 'Could not load all reviews',
        description: 'Showing partial results',
        variant: 'destructive',
      });
    } finally {
      setLoadingReddit(false);
    }
  };

  const searchCollegeOnReddit = async (collegeName: string) => {
    setLoadingReddit(true);
    try {
      console.log(`🔍 Searching Reddit for: ${collegeName}`);
      
      // Must use API route to avoid CORS issues (Reddit blocks browser requests)
      const response = await fetch('/api/reddit-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeName }),
      }).catch(err => {
        console.error('Fetch error:', err);
        throw new Error(`Network error: ${err.message}`);
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      const reviews = data.reviews || [];
      const source = data.source || 'real'; // 'real', 'mock', or 'error'
      
      console.log(`📊 Found ${reviews.length} Reddit reviews for ${collegeName} (Source: ${source})`);
      
      // Update data source indicator
      setRedditDataSource(source);
      
      // Convert Reddit reviews to RedditPost format for display
      const redditPosts: RedditPost[] = reviews.map((review: any) => ({
        id: review.id,
        title: review.post_title,
        text: review.content,
        author: review.author,
        subreddit: review.subreddit,
        url: review.post_url,
        score: review.score,
        numComments: review.num_comments,
        created: review.created_utc,
        sentiment: review.sentiment === 'mixed' ? 'neutral' : review.sentiment,
        category: review.topics[0] || 'General'
      }));
      
      setRedditReviews(redditPosts);
      
      if (reviews.length > 0) {
        const sourceLabel = source === 'real' ? 'Live from Reddit' : source === 'mock' ? 'Demo Data' : 'Partial Results';
        toast({
          title: `Found ${reviews.length} Reddit reviews`,
          description: `${sourceLabel} - ${collegeName}`,
        });
      }
    } catch (error) {
      console.error('Error fetching Reddit reviews:', error);
      toast({
        title: 'Could not load Reddit reviews',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setLoadingReddit(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const reviewData: ReviewSubmission = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        category: formData.get('category') as Review['category'],
        college: formData.get('college') as string,
        year: formData.get('year') as string,
        rating: parseInt(formData.get('rating') as string) as Review['rating'],
      };

      await submitReview(reviewData);
      
      toast({
        title: 'Review Submitted!',
        description: 'Your review has been posted successfully',
      });

      setIsSubmitModalOpen(false);
      loadReviews();
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to vote',
        variant: 'destructive',
      });
      return;
    }

    try {
      await voteReview(reviewId, voteType);
      toast({
        title: voteType === 'upvote' ? 'Upvoted!' : 'Downvoted',
        description: 'Your vote has been recorded',
      });
      loadReviews();
    } catch (error) {
      toast({
        title: 'Vote Failed',
        description: 'Failed to record your vote',
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      KCET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      NEET: 'bg-green-500/10 text-green-400 border-green-500/30',
      JEE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      COMEDK: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      GATE: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      'College Reviews': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              Community Reviews
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered college finder with real student experiences from Reddit • KCET, NEET, JEE, COMEDK, GATE
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsExamModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI College Finder
            </Button>
            <Button
              onClick={() => router.push('/colleges')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Find Your College
            </Button>
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Your Review
            </Button>
            <Button
              onClick={loadRedditReviews}
              disabled={loadingReddit}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loadingReddit ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Radio className="w-4 h-4 mr-2" />
              )}
              Load from Reddit
            </Button>
          </div>
        </motion.div>

        {/* College Recommendations Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 border-purple-500/30 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      🎓 Find Your Perfect College
                    </h3>
                    <p className="text-slate-300 text-sm">
                      Get AI-powered recommendations based on your exam scores with real student reviews from Reddit
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/colleges')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 whitespace-nowrap"
                >
                  Start Finding →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {category === 'all' ? 'All' : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Search {loadingReddit && <span className="text-orange-500 text-xs ml-2">Fetching Reddit reviews...</span>}
                </label>
                <div className="relative">
                  {loadingReddit ? (
                    <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 animate-spin" />
                  ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  )}
                  <Input
                    type="text"
                    placeholder="Search college name (e.g., RVCE, IIT Bombay, NITK)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 bg-slate-800/50 border-slate-700 text-white ${loadingReddit ? 'border-orange-500' : ''}`}
                  />
                  {searchQuery && redditReviews.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge className="bg-orange-600 text-white text-xs">
                        {redditReviews.length} Reddit reviews
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Hint */}
        {searchQuery.trim() && !loadingReddit && redditReviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-orange-900/30 via-red-900/30 to-orange-900/30 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-orange-400 animate-pulse" />
                  <div>
                    <p className="text-white font-medium">Searching Reddit for "{searchQuery}"...</p>
                    <p className="text-slate-400 text-sm">
                      We'll fetch authentic student reviews from Reddit communities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Recommended Colleges */}
        {topColleges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-green-900/30 via-emerald-900/30 to-green-900/30 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  AI Recommended Colleges for {examData.exam}
                </CardTitle>
                <p className="text-slate-300 text-sm">
                  Based on your rank {examData.rank} and score {examData.score}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topColleges.map((college, index) => (
                    <motion.div
                      key={college}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-green-500/50 transition-all cursor-pointer"
                      onClick={() => setSearchQuery(college)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{college}</p>
                        <p className="text-xs text-slate-400">Click to see reviews</p>
                      </div>
                      <GraduationCap className="w-5 h-5 text-green-400" />
                    </motion.div>
                  ))}
                </div>
                {loadingReddit && (
                  <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
                      <div>
                        <p className="text-white font-medium">Fetching Reddit reviews...</p>
                        <p className="text-sm text-slate-400">Getting authentic student experiences from Reddit</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-slate-400 mt-4">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 && !searchQuery.trim() ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Reviews Found</h3>
                <p className="text-slate-400">
                  Be the first to share your experience!
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getCategoryColor(review.category)}>
                              {review.category}
                            </Badge>
                            {review.verified && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                <Award className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {review.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              {review.author.photoURL && (
                                <img
                                  src={review.author.photoURL}
                                  alt={review.author.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span>{review.author.name}</span>
                            </div>
                            {review.college && (
                              <>
                                <span>•</span>
                                <span>{review.college}</span>
                              </>
                            )}
                            {review.year && (
                              <>
                                <span>•</span>
                                <span>{review.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed mb-4">
                        {review.content}
                      </p>
                      
                      {/* Vote Buttons */}
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(review.id, 'upvote')}
                          className="bg-slate-800/50 border-slate-700 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          {review.upvotes}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(review.id, 'downvote')}
                          className="bg-slate-800/50 border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          {review.downvotes}
                        </Button>
                        <span className="text-sm text-slate-500 ml-auto">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Reddit Reviews Section */}
        {redditReviews.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex items-center gap-2 bg-gradient-to-r ${
                redditDataSource === 'real' 
                  ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' 
                  : redditDataSource === 'mock'
                  ? 'from-orange-500/20 to-yellow-500/20 border-orange-500/30'
                  : 'from-slate-500/20 to-gray-500/20 border-slate-500/30'
              } border rounded-lg px-4 py-2`}>
                <Radio className={`w-5 h-5 ${
                  redditDataSource === 'real' ? 'text-green-400' : 
                  redditDataSource === 'mock' ? 'text-orange-400' : 
                  'text-slate-400'
                }`} />
                <span className="text-white font-semibold">
                  {redditDataSource === 'real' ? '🟢 Live from Reddit' : 
                   redditDataSource === 'mock' ? '🟡 Demo Data' : 
                   '⚪ Partial Results'}
                </span>
                <Badge variant="outline" className={`${
                  redditDataSource === 'real' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                    : redditDataSource === 'mock'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}>
                  {redditReviews.length} posts
                </Badge>
              </div>
              {redditDataSource === 'mock' && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  ⚠️ Demo mode - showing sample data
                </Badge>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {redditReviews.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-900/50 border-orange-500/30 backdrop-blur-sm hover:border-orange-500/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                              <Radio className="w-3 h-3 mr-1" />
                              {post.subreddit}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={
                                post.score > 50 
                                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                                  : post.score > 10
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                              }
                            >
                              {post.score > 0 ? '+' : ''}{post.score} upvotes
                            </Badge>
                            {post.numComments > 0 && (
                              <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/30">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {post.numComments}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>by u/{post.author}</span>
                            <span>•</span>
                            <span>{new Date(post.created * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed mb-4 line-clamp-3">
                        {post.text || post.title}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(post.url, '_blank')}
                          className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Reddit
                        </Button>
                        <span className="text-sm text-slate-500 ml-auto">
                          Posted {Math.floor((Date.now() - post.created * 1000) / (1000 * 60 * 60 * 24))} days ago
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Exam Details Modal */}
        <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-green-400" />
                AI College Finder
              </DialogTitle>
              <p className="text-slate-400 text-sm mt-2">
                Enter your exam details and we'll find the best colleges with real Reddit reviews
              </p>
            </DialogHeader>
            <form onSubmit={handleExamSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Exam *</label>
                <Select 
                  value={examData.exam} 
                  onValueChange={(value) => setExamData({ ...examData, exam: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select your exam" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="KCET" className="text-white">KCET</SelectItem>
                    <SelectItem value="NEET" className="text-white">NEET</SelectItem>
                    <SelectItem value="JEE Main" className="text-white">JEE Main</SelectItem>
                    <SelectItem value="JEE Advanced" className="text-white">JEE Advanced</SelectItem>
                    <SelectItem value="COMEDK" className="text-white">COMEDK</SelectItem>
                    <SelectItem value="GATE" className="text-white">GATE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Your Rank *</label>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  value={examData.rank}
                  onChange={(e) => setExamData({ ...examData, rank: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Your Score *</label>
                <Input
                  type="number"
                  placeholder="e.g., 150"
                  value={examData.score}
                  onChange={(e) => setExamData({ ...examData, score: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  <strong>How it works:</strong>
                </p>
                <ol className="text-xs text-slate-300 mt-2 space-y-1 list-decimal list-inside">
                  <li>AI analyzes your exam results</li>
                  <li>Recommends top colleges you can get into</li>
                  <li>Fetches authentic student reviews from Reddit</li>
                </ol>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={loadingColleges}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {loadingColleges ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Finding Colleges...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find My Colleges
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExamModalOpen(false)}
                  className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Submit Review Modal */}
        <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">Share Your Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Title *</label>
                <Input
                  name="title"
                  required
                  placeholder="e.g., KCET 2024 - My Journey"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Category *</label>
                  <Select name="category" required>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Rating *</label>
                  <Select name="rating" required>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()} className="text-white">
                          {rating} Star{rating !== 1 && 's'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">College (optional)</label>
                  <Input
                    name="college"
                    placeholder="e.g., IIT Bombay"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Year (optional)</label>
                  <Input
                    name="year"
                    placeholder="e.g., 2024"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Your Review *</label>
                <Textarea
                  name="content"
                  required
                  rows={6}
                  placeholder="Share your experience, tips, strategies..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

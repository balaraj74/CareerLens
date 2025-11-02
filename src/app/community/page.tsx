'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Plus, Filter, Search, Award, BookOpen, RefreshCw, Radio, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
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

  const categories = ['all', 'KCET', 'NEET', 'JEE', 'COMEDK', 'GATE', 'General', 'College Reviews'];

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, selectedCategory, searchQuery]);

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
    }

    setFilteredReviews(filtered);
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
              Real student experiences from KCET, NEET, JEE, COMEDK, GATE & colleges
            </p>
          </div>
          <div className="flex gap-3">
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
                <label className="text-sm text-slate-400">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search reviews, colleges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
          ) : filteredReviews.length === 0 ? (
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
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
                <Radio className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold">Live from Reddit</span>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  {redditReviews.length} posts
                </Badge>
              </div>
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

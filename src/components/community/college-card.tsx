'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CollegeRecommendation } from '@/lib/types/community';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Building2, Award, TrendingUp, Bookmark, BookmarkCheck,
  ExternalLink, ChevronDown, ChevronUp, Star, Users, MessageSquare,
  BarChart3, Calendar
} from 'lucide-react';

interface Props {
  recommendation: CollegeRecommendation;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  rank: number;
}

export default function CollegeCard({ recommendation, isBookmarked, onToggleBookmark, rank }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { college, match_score, predicted_admission_chance, reasons, review_summary } = recommendation;

  const getChanceColor = (chance: number) => {
    if (chance >= 80) return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    if (chance >= 60) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (chance >= 40) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-500';
    if (sentiment < -0.3) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Rank Badge */}
          <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
              rank <= 3 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              #{rank}
            </div>

            {/* College Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {college.name}
                </h3>
                {college.logo_url && (
                  <img src={college.logo_url} alt={college.name} className="w-8 h-8 rounded" />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {college.city}, {college.state}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {college.type}
                </div>
                {college.nirf_rank && (
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    <Award className="w-3 h-3 mr-1" />
                    NIRF #{college.nirf_rank}
                  </Badge>
                )}
                {college.autonomous && (
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    Autonomous
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleBookmark}
            className={isBookmarked ? 'text-yellow-500 border-yellow-500' : ''}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Score & Admission Chance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Match Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {match_score}
              </span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
            <Progress value={match_score} className="mt-2 h-2" />
          </div>

          <div className={`rounded-xl p-4 ${getChanceColor(predicted_admission_chance)}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Admission Chance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {Math.round(predicted_admission_chance)}%
              </span>
            </div>
            <Progress value={predicted_admission_chance} className="mt-2 h-2" />
          </div>
        </div>

        {/* Placement Stats */}
        {college.placement_stats && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Placement Statistics ({college.placement_stats.year})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Placement Rate</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {college.placement_stats.placement_percentage}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Highest</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{(college.placement_stats.highest_package / 100000).toFixed(1)}L
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{(college.placement_stats.average_package / 100000).toFixed(1)}L
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Median</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{(college.placement_stats.median_package / 100000).toFixed(1)}L
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reasons */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Why this college?
          </h4>
          <ul className="space-y-1">
            {reasons.slice(0, expanded ? undefined : 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mt-1">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Review Summary */}
        {review_summary && review_summary.total_reviews > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Student Reviews from Reddit
              </span>
              <Badge variant="outline" className="ml-auto">
                <MessageSquare className="w-3 h-3 mr-1" />
                {review_summary.total_reviews} reviews
              </Badge>
            </div>
            
            {/* Sentiment */}
            <div className="flex items-center gap-4 mb-3">
              <div className={`text-sm font-medium ${getSentimentColor(review_summary.average_sentiment)}`}>
                {review_summary.average_sentiment > 0.3 ? '😊 Mostly Positive' :
                 review_summary.average_sentiment < -0.3 ? '😟 Some Concerns' :
                 '😐 Mixed Reviews'}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">👍 {review_summary.sentiment_distribution.positive}</span>
                <span className="text-gray-600">😐 {review_summary.sentiment_distribution.neutral}</span>
                <span className="text-red-600">👎 {review_summary.sentiment_distribution.negative}</span>
              </div>
            </div>

            {/* Recent Trend */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Recent Trend: </span>
              <Badge variant="outline" className={
                review_summary.recent_trend === 'improving' ? 'text-green-600 border-green-600' :
                review_summary.recent_trend === 'declining' ? 'text-red-600 border-red-600' :
                'text-gray-600'
              }>
                {review_summary.recent_trend}
              </Badge>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More
              </>
            )}
          </Button>
          
          {college.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(college.website, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            {/* Facilities */}
            {college.facilities && college.facilities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Facilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {college.facilities.map((facility, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reddit Reviews Insights */}
            {review_summary && review_summary.total_reviews > 0 && Object.keys(review_summary.topic_ratings).length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Reddit Student Reviews ({review_summary.total_reviews} reviews)
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(review_summary.topic_ratings)
                    .sort(([,a]: [string, any], [,b]: [string, any]) => b.mention_count - a.mention_count)
                    .slice(0, 5)
                    .map(([topic, rating]: [string, any]) => (
                      <div key={topic} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{topic}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              rating.sentiment === 'positive' ? 'bg-green-100 text-green-700 border-green-300' :
                              rating.sentiment === 'negative' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {rating.sentiment === 'positive' ? '👍' : rating.sentiment === 'negative' ? '👎' : '😐'}
                            {rating.mention_count} mentions
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${
                                star <= rating.average_rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-gray-600 dark:text-gray-400">
                            {rating.average_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    📊 Data from {review_summary.total_reviews} authentic student reviews on Reddit
                  </div>
                </div>
              </div>
            )}

            {/* Top Recruiters */}
            {college.placement_stats?.top_recruiters && college.placement_stats.top_recruiters.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Top Recruiters
                </h4>
                <div className="flex flex-wrap gap-2">
                  {college.placement_stats.top_recruiters.slice(0, 10).map((recruiter, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                      {recruiter}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Established:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {college.established}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Affiliation:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {college.affiliation}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CollegeRecommendation } from '@/lib/types/community';
import CollegeCard from './college-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, TrendingUp, Award, Bookmark } from 'lucide-react';

interface Props {
  recommendations: CollegeRecommendation[];
}

export default function CollegeRecommendations({ recommendations }: Props) {
  const [sortBy, setSortBy] = useState<'match' | 'admission' | 'placement'>('match');
  const [filterType, setFilterType] = useState<string>('all');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  // Sort recommendations
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case 'match':
        return b.match_score - a.match_score;
      case 'admission':
        return b.predicted_admission_chance - a.predicted_admission_chance;
      case 'placement':
        return (b.college.placement_stats?.placement_percentage || 0) - 
               (a.college.placement_stats?.placement_percentage || 0);
      default:
        return 0;
    }
  });

  // Filter by college type
  const filteredRecommendations = filterType === 'all'
    ? sortedRecommendations
    : sortedRecommendations.filter(r => r.college.type === filterType);

  const toggleBookmark = (collegeId: string) => {
    setBookmarked(prev => {
      const updated = new Set(prev);
      if (updated.has(collegeId)) {
        updated.delete(collegeId);
      } else {
        updated.add(collegeId);
      }
      return updated;
    });
  };

  const collegeTypes = ['all', 'Government', 'Private', 'Autonomous', 'Deemed'];

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            {collegeTypes.map(type => (
              <Badge
                key={type}
                variant={filterType === type ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  filterType === type
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'All' : type}
              </Badge>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm"
            >
              <option value="match">Match Score</option>
              <option value="admission">Admission Chance</option>
              <option value="placement">Placements</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRecommendations.length} of {recommendations.length} colleges
          </p>
        </div>
        {bookmarked.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarked.size} Bookmarked
          </Button>
        )}
      </div>

      {/* College Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.college.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <CollegeCard
                recommendation={recommendation}
                isBookmarked={bookmarked.has(recommendation.college.id)}
                onToggleBookmark={() => toggleBookmark(recommendation.college.id)}
                rank={index + 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No colleges found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters to see more results
          </p>
        </Card>
      )}
    </div>
  );
}

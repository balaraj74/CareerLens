'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  BookOpen,
  Briefcase,
  Award,
  Clock,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CareerGraphData, CareerRecommendation, SkillNode } from '@/lib/types';

interface CareerInsightsProps {
  careerGraph: CareerGraphData;
  recommendations?: CareerRecommendation[];
}

export function CareerInsights({ careerGraph, recommendations = [] }: CareerInsightsProps) {
  // Calculate insights
  const insights = {
    topSkills: [...careerGraph.skills]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5),
    emergingSkills: careerGraph.skills
      .filter((s) => s.frequency >= 3 && s.recency < 14)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3),
    staleSkills: careerGraph.skills
      .filter((s) => s.recency > 60)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3),
    totalSkills: careerGraph.skills.length,
    recentActivities: careerGraph.activities.slice(0, 10),
  };

  const getSkillColor = (weight: number): string => {
    if (weight >= 80) return 'text-emerald-400';
    if (weight >= 60) return 'text-blue-400';
    if (weight >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRecommendationIcon = (type: CareerRecommendation['type']) => {
    switch (type) {
      case 'skill':
        return <Zap className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'project':
        return <Briefcase className="w-4 h-4" />;
      case 'certification':
        return <Award className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: CareerRecommendation['priority']): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-white/10 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                Career Readiness Score
              </CardTitle>
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                {careerGraph.targetRole || 'General'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="text-6xl font-bold text-white">
                  {Math.round(careerGraph.readinessScore)}
                  <span className="text-2xl text-gray-400">%</span>
                </div>
                <div className="flex-1 pb-2">
                  <Progress
                    value={careerGraph.readinessScore}
                    className="h-4 bg-white/10"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                {careerGraph.readinessScore >= 80
                  ? "🎉 Excellent! You're highly qualified for your target role."
                  : careerGraph.readinessScore >= 60
                  ? "💪 Good progress! Focus on emerging skills to reach expert level."
                  : careerGraph.readinessScore >= 40
                  ? "📚 Keep learning! You're building a strong foundation."
                  : "🚀 Just getting started! Every expert was once a beginner."}
              </p>
              {careerGraph.targetRole && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>
                    Target: <strong>{careerGraph.targetRole}</strong>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-white/10 bg-black/20 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Top Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.topSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`text-lg font-bold ${getSkillColor(skill.weight)}`}
                    >
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{skill.name}</span>
                        <span className={`text-sm font-semibold ${getSkillColor(skill.weight)}`}>
                          {Math.round(skill.weight)}%
                        </span>
                      </div>
                      <Progress
                        value={skill.weight}
                        className="h-2 bg-white/10"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emerging Skills */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-white/10 bg-black/20 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Emerging Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.emergingSkills.length > 0 ? (
                <div className="space-y-3">
                  {insights.emergingSkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                    >
                      <div>
                        <div className="text-white font-medium">{skill.name}</div>
                        <div className="text-xs text-gray-400">
                          Practiced {skill.frequency}x in last {skill.recency} days
                        </div>
                      </div>
                      <div className="text-2xl">🔥</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Practice skills consistently to see them here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-white/10 bg-black/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-400" />
                  AI-Powered Recommendations
                </CardTitle>
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                  {recommendations.length} suggestions
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold text-sm">
                            {rec.title}
                          </h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {rec.estimatedTime && (
                        <span className="text-xs text-gray-500">
                          ⏱️ {rec.estimatedTime}
                        </span>
                      )}
                      {rec.url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                          onClick={() => window.open(rec.url, '_blank')}
                        >
                          View <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          label="Total Skills"
          value={insights.totalSkills}
          icon="🎯"
          color="text-violet-400"
        />
        <QuickStatCard
          label="Emerging"
          value={insights.emergingSkills.length}
          icon="🔥"
          color="text-yellow-400"
        />
        <QuickStatCard
          label="Expert Level"
          value={careerGraph.skills.filter((s) => s.weight >= 80).length}
          icon="⭐"
          color="text-emerald-400"
        />
        <QuickStatCard
          label="Need Practice"
          value={insights.staleSkills.length}
          icon="📚"
          color="text-orange-400"
        />
      </div>
    </div>
  );
}

function QuickStatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-black/20 border border-white/10 rounded-xl p-4 hover:border-violet-500/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <TrendingUp className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import { CareerHeatmap } from './CareerHeatmap';
import { SkillGraph } from './SkillGraph';
import { CareerInsights } from './CareerInsights';
import {
  fetchCareerGraph,
  generateHeatmapData,
  updateCareerGraph,
} from '@/lib/career-graph-service';
import type { CareerGraphData, HeatmapDay, CareerRecommendation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function CareerGraphPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [careerGraph, setCareerGraph] = useState<CareerGraphData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadCareerGraph();
  }, [user, db]);

  const loadCareerGraph = async () => {
    if (!user || !db) return;

    setIsLoading(true);
    try {
      const graphData = await fetchCareerGraph(db, user.uid);

      if (graphData) {
        setCareerGraph(graphData);
        const heatmap = generateHeatmapData(graphData.activities);
        setHeatmapData(heatmap);

        // Load mock recommendations for now
        // TODO: Replace with AI-generated recommendations
        setRecommendations(getMockRecommendations(graphData));
      } else {
        toast({
          variant: 'destructive',
          title: 'No Career Graph Found',
          description: 'Start building your career graph by updating your profile!',
        });
      }
    } catch (error) {
      console.error('Error loading career graph:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Load',
        description: 'Could not load your career graph. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user || !db) return;

    setIsRefreshing(true);
    try {
      await updateCareerGraph(db, user.uid);
      await loadCareerGraph();
      toast({
        title: 'Career Graph Updated',
        description: 'Your career graph has been refreshed with the latest data.',
      });
    } catch (error) {
      console.error('Error refreshing career graph:', error);
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: 'Could not refresh your career graph. Please try again.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = () => {
    if (!careerGraph) return;

    const shareText = `Check out my career progress! 🚀\n\n📊 Readiness Score: ${Math.round(
      careerGraph.readinessScore
    )}%\n🎯 Skills Mastered: ${careerGraph.skills.length}\n💼 Target Role: ${
      careerGraph.targetRole || 'Exploring'
    }\n\nBuilding my career with CareerLens AI!`;

    if (navigator.share) {
      navigator.share({
        title: 'My Career Progress',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied to Clipboard',
        description: 'Share your career progress with others!',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-20 w-full bg-white/10" />
          <Skeleton className="h-96 w-full bg-white/10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 bg-white/10" />
            <Skeleton className="h-64 bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!careerGraph) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] p-4 md:p-8 flex items-center justify-center">
        <Alert className="max-w-2xl border-yellow-500/30 bg-yellow-500/10">
          <Activity className="w-5 h-5 text-yellow-400" />
          <AlertTitle className="text-yellow-400">No Career Graph Yet</AlertTitle>
          <AlertDescription className="text-gray-300">
            Start building your career graph by completing your profile and adding skills.
            The AI will track your progress and provide personalized recommendations!
          </AlertDescription>
          <Button
            className="mt-4 bg-yellow-500 hover:bg-yellow-600"
            onClick={() => (window.location.href = '/profile')}
          >
            Complete Profile
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-500/50"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.5)',
                    '0 0 40px rgba(139, 92, 246, 0.8)',
                    '0 0 20px rgba(139, 92, 246, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-8 h-8 text-white" />
              </motion.div>
              Career Development Graph
            </h1>
            <p className="text-gray-400">
              Your adaptive learning journey, visualized and powered by AI
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-white/20 hover:bg-white/10"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              size="lg"
              onClick={handleShare}
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/20 border border-white/10 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity Heatmap
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
            >
              Skills Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-6">
            <CareerInsights
              careerGraph={careerGraph}
              recommendations={recommendations}
            />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-8 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CareerHeatmap
                heatmapData={heatmapData}
                userName={user?.displayName || undefined}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-8 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SkillGraph
                skills={careerGraph.skills}
                onNodeClick={(skill) => {
                  toast({
                    title: skill.name,
                    description: `Proficiency: ${Math.round(skill.weight)}% | Category: ${skill.category}`,
                  });
                }}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-2">
            🎯 Keep Building Your Career Path
          </h3>
          <p className="text-gray-400 mb-4">
            Add more skills, complete courses, and practice regularly to strengthen your career graph.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/profile')}
              className="border-white/20 hover:bg-white/10"
            >
              Update Profile
            </Button>
            <Button
              onClick={() => (window.location.href = '/learning-helper')}
              className="bg-gradient-to-r from-violet-600 to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Mock recommendations - to be replaced with AI-generated ones
function getMockRecommendations(graph: CareerGraphData): CareerRecommendation[] {
  const recommendations: CareerRecommendation[] = [];

  // Recommend improving low-weight skills
  const lowSkills = graph.skills.filter((s) => s.weight < 40).slice(0, 2);
  lowSkills.forEach((skill) => {
    recommendations.push({
      type: 'course',
      title: `Master ${skill.name}`,
      description: `Boost your proficiency in ${skill.name} with focused practice.`,
      priority: 'high',
      estimatedTime: '2-4 weeks',
      relevanceScore: 90,
    });
  });

  // Recommend practicing stale skills
  const staleSkills = graph.skills.filter((s) => s.recency > 60).slice(0, 1);
  staleSkills.forEach((skill) => {
    recommendations.push({
      type: 'project',
      title: `Practice ${skill.name}`,
      description: `It's been a while! Build a project using ${skill.name}.`,
      priority: 'medium',
      estimatedTime: '1 week',
      relevanceScore: 75,
    });
  });

  // Add general recommendations
  recommendations.push(
    {
      type: 'skill',
      title: 'Learn Cloud Computing',
      description: 'AWS or Azure skills are highly sought after in 2024.',
      priority: 'high',
      estimatedTime: '6-8 weeks',
      relevanceScore: 85,
    },
    {
      type: 'certification',
      title: 'Get Certified',
      description: 'Earn a professional certification to validate your skills.',
      priority: 'medium',
      estimatedTime: '3 months',
      relevanceScore: 80,
    }
  );

  return recommendations;
}

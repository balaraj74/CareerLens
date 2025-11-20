'use client';
import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import {
  fetchEnhancedProfile,
  completeDailyGoal,
  updateStreak,
} from '@/lib/enhanced-profile-service';
import type { EnhancedUserProfile } from '@/lib/types';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Target,
  Zap,
  Brain,
  Star,
  Award,
  TrendingUp,
  Rocket,
  Battery,
  BookOpen,
  Code,
  Briefcase,
  Bell,
  Settings,
  Mic,
  Download,
  FileText,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  Lightbulb,
  Activity,
  BarChart3,
  Users,
  Globe,
  Heart,
  Flame,
  Coffee,
  MessageSquare,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Calendar,
  Loader2,
  Edit,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function DynamicDashboard() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const router = useRouter();

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    loadProfile();
  }, [user, db]);

  useEffect(() => {
    if (profile?.name) {
      const text = `👋 Welcome back, ${profile.name.split(' ')[0]}! Ready to boost your AI career today?`;
      let index = 0;

      const timer = setInterval(() => {
        if (index <= text.length) {
          setGreeting(text.slice(0, index));
          index++;
        } else {
          setTypingComplete(true);
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, [profile?.name]);

  const loadProfile = async () => {
    if (!user || !db) return;

    try {
      setLoading(true);
      const data = await fetchEnhancedProfile(db, user.uid);
      setProfile(data);

      // Update streak on dashboard view
      if (data) {
        await updateStreak(db, user.uid);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchCopilotMessage(profile);
    }
  }, [profile]);

  const fetchCopilotMessage = async (userProfile: EnhancedUserProfile) => {
    setIsCopilotLoading(true);
    try {
      // Send only necessary data to avoid payload issues
      const simplifiedProfile = {
        name: userProfile.name,
        title: userProfile.title,
        level: userProfile.level,
        skills: userProfile.skills,
        analytics: userProfile.analytics,
      };

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: simplifiedProfile }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Copilot API Error Details:', errorData);
        throw new Error(`API Error: ${res.status} - ${errorData.details || 'Unknown error'}`);
      }

      const data = await res.json();
      console.log('Copilot API Response:', data);

      if (data.message) {
        setCopilotMessage(data.message);
        setActionUrl(data.actionUrl || '/ai-career-hub');
        setActionLabel(data.actionLabel || 'Explore Career Hub');
      }
    } catch (err) {
      console.error('Failed to fetch copilot message', err);
      // Fallback UI if API fails
      setCopilotMessage("I'm ready to help you advance your career! Check out the AI Career Hub for personalized recommendations.");
      setActionUrl('/ai-career-hub');
      setActionLabel('Open Career Hub');
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    if (!user || !db) return;

    try {
      await completeDailyGoal(db, user.uid, goalId);
      await loadProfile(); // Reload to get updated data

      toast({
        title: 'Goal Completed! 🎉',
        description: 'You earned XP!',
      });
    } catch (error) {
      console.error('Error completing goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete goal',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200">Loading your career mission control...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <Card className="p-8 text-center max-w-md bg-slate-900/80 border-blue-500/30">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">
            Welcome to CareerLens!
          </h2>
          <p className="text-gray-400 mb-6">
            Complete your profile to unlock your personalized career dashboard
          </p>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Link href="/profile/edit">
              <Edit className="w-4 h-4 mr-2" />
              Complete Profile
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const xpPercentage = (profile.currentXP / profile.nextLevelXP) * 100;
  const xpToNextLevel = profile.nextLevelXP - profile.currentXP;

  const topSkills = (profile.skillsWithProficiency || profile.skills || [])
    .slice(0, 3)
    .map((s) => ({
      name: typeof s === 'string' ? s : 'name' in s ? (s.name as string) : 'Unknown',
      confidence: typeof s === 'object' && s !== null && 'proficiency' in s ? (s.proficiency as number) : 75,
      trend: 'up' as const,
    }));

  const suggestedProjects = profile.projects
    .filter((p) => p.status === 'not-started')
    .slice(0, 2);

  const careerPathNodes = [
    {
      level: 1,
      title: 'Learner',
      emoji: '🌱',
      status: profile.level >= 1 ? 'completed' : 'locked',
      xp: 1000,
    },
    {
      level: 2,
      title: 'Explorer',
      emoji: '🔍',
      status: profile.level >= 2 ? 'completed' : profile.level === 1 ? 'current' : 'locked',
      xp: 2000,
    },
    {
      level: 3,
      title: 'Developer',
      emoji: '💻',
      status: profile.level >= 3 ? 'completed' : profile.level === 2 ? 'current' : 'locked',
      xp: 3000,
    },
    {
      level: 4,
      title: 'Specialist',
      emoji: '⚙️',
      status: profile.level >= 4 ? 'completed' : profile.level === 3 ? 'current' : 'locked',
      xp: 4500,
    },
    {
      level: 5,
      title: 'Innovator',
      emoji: '🚀',
      status: profile.level >= 5 ? 'completed' : profile.level === 4 ? 'current' : 'locked',
      xp: 6000,
    },
    {
      level: 6,
      title: 'Master',
      emoji: '👑',
      status: profile.level >= 6 ? 'completed' : profile.level === 5 ? 'current' : 'locked',
      xp: 8000,
    },
  ];

  const currentCareerNode = careerPathNodes.find((n) => n.level === profile.level);

  return (
    <div className="relative w-full overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      {/* Animated Background with Parallax */}
      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ y: backgroundY }}
      >
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header with AI Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-8 relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <motion.h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
                  {greeting}
                  {!typingComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      |
                    </motion.span>
                  )}
                </motion.h1>

                <AnimatePresence>
                  {typingComplete && (
                    <motion.div
                      className="text-lg text-primary flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Your CareerLens Copilot is analyzing today's insights...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Status Orb */}
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                  <Brain className="w-10 h-10 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* User Progress Overview - Gamified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card bg-gradient-to-br from-accent/10 to-pink-500/10 border-accent/20 p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circular XP Ring */}
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#xpGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * xpPercentage) / 100 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    style={{ strokeDasharray: 553 }}
                  />
                  <defs>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {profile.level}
                  </motion.div>
                  <div
                    className="text-sm text-accent-foreground/80"
                  >
                    Level
                  </div>
                  <div
                    className="text-xs text-accent-foreground/60 mt-2"
                  >
                    {Math.round(xpPercentage)}% to Level {profile.level + 1}
                  </div>
                </div>

                {/* Pulse Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Progress Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-2xl font-bold text-foreground"
                    >
                      {profile.title || `${profile.careerStage} Career Explorer`}
                    </h3>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-none">
                      Level {profile.level}
                    </Badge>
                  </div>
                  <p
                    className="text-accent-foreground/80"
                  >
                    🎯 {xpToNextLevel} XP left to level up!
                  </p>
                </div>

                {/* XP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span
                      className="text-accent-foreground/80"
                    >
                      Experience Points
                    </span>
                    <span
                      className="font-mono text-pink-500"
                    >
                      {profile.currentXP} / {profile.nextLevelXP} XP
                    </span>
                  </div>
                  <div
                    className="relative h-4 rounded-full overflow-hidden bg-secondary"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercentage}%` }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="bg-secondary/50 rounded-lg p-3 text-center"
                  >
                    <div
                      className="text-2xl font-bold text-accent"
                    >
                      {profile.analytics.totalProjects}
                    </div>
                    <div
                      className="text-xs text-accent/80"
                    >
                      Projects
                    </div>
                  </div>
                  <div
                    className="bg-secondary/50 rounded-lg p-3 text-center"
                  >
                    <div
                      className="text-2xl font-bold text-pink-500"
                    >
                      {profile.analytics.totalSkills}
                    </div>
                    <div
                      className="text-xs text-pink-500/80"
                    >
                      Skills
                    </div>
                  </div>
                  <div
                    className="bg-secondary/50 rounded-lg p-3 text-center"
                  >
                    <div
                      className="text-2xl font-bold text-primary"
                    >
                      {profile.streak}d
                    </div>
                    <div
                      className="text-xs text-primary/80"
                    >
                      Streak
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Smart Insights */}
          <div className="space-y-6">
            {/* Resume Score Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ rotateY: 5, scale: 1.02 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="glass-card bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-6 cursor-pointer group relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, 0],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-cyan-500">
                      AI Resume Score
                    </h3>
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                    >
                      {profile.analytics.resumeScore}%
                    </motion.div>
                  </div>

                  <div
                    className="text-sm text-primary/80 text-center mb-4"
                  >
                    {profile.analytics.resumeScore >= 80 ? (
                      <span className="font-semibold">Excellent!</span>
                    ) : profile.analytics.resumeScore >= 60 ? (
                      <span className="font-semibold">Good progress!</span>
                    ) : (
                      <span className="font-semibold">Let's improve it!</span>
                    )}
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/resume">
                      <FileText className="w-4 h-4 mr-2" />
                      Improve Resume
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Job Match Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ rotateY: 5, scale: 1.02 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="glass-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-bold text-green-500"
                  >
                    Job Match
                  </h3>
                  <Target
                    className="w-5 h-5 text-green-500"
                  />
                </div>

                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                  >
                    {profile.analytics.jobMatchProbability}%
                  </motion.div>
                </div>

                <div
                  className="text-sm text-green-500/80 text-center"
                >
                  High match for <strong>{profile.title || 'your target'}</strong> roles
                </div>
              </Card>
            </motion.div>

            {/* Top Skills Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-bold text-purple-500"
                  >
                    Top Skills
                  </h3>
                  <Zap
                    className="w-5 h-5 text-purple-500"
                  />
                </div>

                <div className="space-y-3">
                  {topSkills.length > 0 ? (
                    topSkills.map((skill, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-sm font-medium text-purple-500"
                          >
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs text-purple-500/80"
                            >
                              {skill.confidence}%
                            </span>
                            <TrendingUp
                              className={`w-3 h-3 ${skill.trend === 'up'
                                ? 'text-green-400'
                                : 'text-yellow-400'
                                }`}
                            />
                          </div>
                        </div>
                        <Progress value={skill.confidence} className="h-2" />
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-2">
                      Add skills to see your progress!
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Center Column - Projects & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suggested Projects */}
            {suggestedProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-card bg-gradient-to-br from-primary/10 to-indigo-500/10 border-primary/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3
                      className="text-xl font-bold text-primary"
                    >
                      🚀 Suggested Projects
                    </h3>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Link href="/recommendations">
                        <Plus className="w-4 h-4 mr-2" />
                        Get More Ideas
                      </Link>
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {suggestedProjects.map((project, idx) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                      >
                        <Card className="bg-secondary/50 border-primary/20 p-4 h-full relative overflow-hidden group cursor-pointer">
                          <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                              <Badge
                                className={`${project.difficulty === 'Beginner'
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : project.difficulty === 'Intermediate'
                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                                  }`}
                              >
                                {project.difficulty}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                +{project.xpReward} XP
                              </Badge>
                            </div>

                            <h4
                              className="text-lg font-bold mb-2 text-primary"
                            >
                              {project.title}
                            </h4>
                            <p
                              className="text-sm mb-3 text-primary/80"
                            >
                              {project.description}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.techStack.map((tech) => (
                                <Badge
                                  key={tech}
                                  variant="outline"
                                  className="text-xs border-primary/30 text-primary"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <span
                                className="text-xs text-primary"
                              >
                                ⏱️ {project.estimatedTime}
                              </span>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start Now
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Career Path Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="glass-card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
                <h3
                  className="text-xl font-bold mb-6 text-indigo-500"
                >
                  🛤️ Career Path Timeline
                </h3>

                <div className="relative">
                  {/* Path Line */}
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="relative grid grid-cols-6 gap-2">
                    {careerPathNodes.map((node, idx) => (
                      <motion.div
                        key={node.level}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        whileHover={{ y: -10 }}
                      >
                        <div className="relative z-10 flex flex-col items-center">
                          <motion.div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${node.status === 'completed'
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : node.status === 'current'
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                : 'bg-gradient-to-br from-slate-600 to-slate-700'
                              } shadow-lg`}
                            animate={
                              node.status === 'current'
                                ? {
                                  boxShadow: [
                                    '0 0 20px rgba(59, 130, 246, 0.5)',
                                    '0 0 40px rgba(59, 130, 246, 0.8)',
                                    '0 0 20px rgba(59, 130, 246, 0.5)',
                                  ],
                                }
                                : {}
                            }
                            transition={
                              node.status === 'current'
                                ? { duration: 2, repeat: Infinity }
                                : {}
                            }
                          >
                            {node.status === 'locked' ? (
                              <Lock className="w-6 h-6 text-white" />
                            ) : (
                              <span>{node.emoji}</span>
                            )}
                          </motion.div>

                          <div
                            className="text-xs mt-2 text-center font-medium text-indigo-500"
                          >
                            {node.title}
                          </div>
                          <div
                            className="text-xs text-indigo-500/80"
                          >
                            Lv {node.level}
                          </div>
                        </div>

                        {node.status === 'completed' && (
                          <motion.div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-green-400"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Daily Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass-card bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-bold text-emerald-500"
                  >
                    ✅ Today's Goals
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {profile.dailyGoals.filter((g) => g.completed).length}/
                    {profile.dailyGoals.length} Complete
                  </Badge>
                </div>

                <div className="space-y-3">
                  {profile.dailyGoals.map((goal, idx) => (
                    <motion.div
                      key={goal.id}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/50 ${goal.completed && 'opacity-50'}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + idx * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.button
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${goal.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-emerald-500 hover:bg-emerald-500/20'
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => !goal.completed && handleCompleteGoal(goal.id)}
                        disabled={goal.completed}
                      >
                        {goal.completed && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </motion.button>
                      <span
                        className={`flex-1 ${goal.completed
                          ? 'line-through'
                          : 'text-emerald-500'
                          }`}
                      >
                        {goal.text}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        +{goal.xpReward} XP
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Copilot Floating Assistant - Hidden on Mobile */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            className="fixed bottom-24 right-8 w-80 z-50 hidden lg:block"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Card className="glass-card bg-background/95 border-primary/30 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(34, 211, 238, 0.5)',
                        '0 0 40px rgba(34, 211, 238, 0.8)',
                        '0 0 20px rgba(34, 211, 238, 0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <div className="font-bold text-primary">
                      AI Copilot
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      Online
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIChat(false)}
                  className="text-primary hover:text-primary/80"
                >
                  ×
                </Button>
              </div>

              <div
                className="bg-secondary/50 rounded-lg p-3 mb-3"
              >
                <div
                  className="text-sm text-primary/90"
                >
                  {isCopilotLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Analyzing your profile...</span>
                    </div>
                  ) : copilotMessage ? (
                    copilotMessage
                  ) : (
                    profile.analytics.resumeScore < 70
                      ? `Hi ${profile.name?.split(' ')[0]}! Your resume score is ${profile.analytics.resumeScore}%. Let's work on improving it to unlock more opportunities!`
                      : profile.analytics.totalProjects === 0
                        ? `Ready to start your first project? I recommend the "${suggestedProjects[0]?.title || 'AI Salary Predictor'}" to boost your skills!`
                        : `Great progress! Keep building projects to level up faster. You're ${xpToNextLevel} XP away from Level ${profile.level + 1}!`
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-sm"
                  onClick={() => {
                    if (actionUrl) {
                      router.push(actionUrl);
                    } else {
                      profile && fetchCopilotMessage(profile);
                    }
                  }}
                  disabled={isCopilotLoading}
                >
                  {isCopilotLoading ? 'Thinking...' : actionLabel || 'Get Guidance'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => setShowAIChat(false)}
                >
                  Later
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Button - Hidden on Mobile */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl z-50 hidden lg:flex"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAIChat(!showAIChat)}
        animate={{
          boxShadow: [
            '0 0 30px rgba(34, 211, 238, 0.5)',
            '0 0 60px rgba(34, 211, 238, 0.8)',
            '0 0 30px rgba(34, 211, 238, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="w-8 h-8 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div >
  );
}

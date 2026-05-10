'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import {
    subscribeToProfile,
    completeDailyGoal,
    updateStreak,
} from '@/lib/enhanced-profile-service';
import type { EnhancedUserProfile } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
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
    BookOpen,
    Code,
    Briefcase,
    FileText,
    CheckCircle2,
    Lock,
    Activity,
    BarChart3,
    Users,
    Flame,
    ChevronRight,
    Loader2,
    Calendar,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function PremiumDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { db, loading: firebaseLoading } = useFirebase();
    const { toast } = useToast();
    const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [copilotMessage, setCopilotMessage] = useState('');
    const [isCopilotLoading, setIsCopilotLoading] = useState(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Real-time profile subscription
    useEffect(() => {
        // Still initialising Firebase or Auth — keep the spinner
        if (firebaseLoading || authLoading) return;

        // Auth resolved but no user — stop loading
        if (!user || !db) {
            setLoading(false);
            setProfile(null);
            return;
        }

        // Subscribe to real-time Firestore updates
        setLoading(true);
        const unsub = subscribeToProfile(
            db,
            user.uid,
            (data) => {
                setProfile(data);
                setLoading(false);
            },
            (error) => {
                console.error('Error loading profile:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load dashboard data',
                    variant: 'destructive',
                });
                setLoading(false);
            }
        );

        unsubscribeRef.current = unsub;

        // Update streak on first load
        updateStreak(db, user.uid).catch(console.error);

        return () => {
            unsub();
            unsubscribeRef.current = null;
        };
    }, [user, db, firebaseLoading, authLoading]);

    useEffect(() => {
        if (profile?.name) {
            const hour = new Date().getHours();
            const timeGreeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
            setGreeting(`${timeGreeting}, ${profile.name.split(' ')[0]}!`);
        }
    }, [profile?.name]);

    const handleCompleteGoal = async (goalId: string) => {
        if (!user || !db) return;

        try {
            await completeDailyGoal(db, user.uid, goalId);
            // No need to manually reload — onSnapshot will fire automatically
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
            <div className="flex items-center justify-center min-h-screen mesh-wave-bg">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#00E5FF] mx-auto mb-4" />
                    <p className="text-white/75">Loading your career dashboard...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen mesh-wave-bg">
                <Card className="glass-card p-8 text-center max-w-md">
                    <Brain className="w-16 h-16 text-[#00E5FF] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-white">
                        Welcome to CareerLens!
                    </h2>
                    <p className="text-white/65 mb-6">
                        Complete your profile to unlock your personalized career dashboard
                    </p>
                    <Button asChild className="glass-btn bg-gradient-to-r from-[#00E5FF] to-[#A57CFF]">
                        <Link href="/profile/edit">
                            Complete Profile
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const xpPercentage = (profile.currentXP / profile.nextLevelXP) * 100;
    const topSkills = (profile.skillsWithProficiency || profile.skills || [])
        .slice(0, 3)
        .map((s) => ({
            name: typeof s === 'string' ? s : 'name' in s ? (s.name as string) : 'Unknown',
            confidence: typeof s === 'object' && s !== null && 'proficiency' in s ? (s.proficiency as number) : 75,
        }));

    const careerPathNodes = [
        { level: 1, title: 'Learner', emoji: '🌱', status: profile.level >= 1 ? 'completed' : 'locked' },
        { level: 2, title: 'Explorer', emoji: '🔍', status: profile.level >= 2 ? 'completed' : profile.level === 1 ? 'current' : 'locked' },
        { level: 3, title: 'Developer', emoji: '💻', status: profile.level >= 3 ? 'completed' : profile.level === 2 ? 'current' : 'locked' },
        { level: 4, title: 'Specialist', emoji: '⚙️', status: profile.level >= 4 ? 'completed' : profile.level === 3 ? 'current' : 'locked' },
        { level: 5, title: 'Innovator', emoji: '🚀', status: profile.level >= 5 ? 'completed' : profile.level === 4 ? 'current' : 'locked' },
        { level: 6, title: 'Master', emoji: '👑', status: profile.level >= 6 ? 'completed' : profile.level === 5 ? 'current' : 'locked' },
    ];

    return (
        <div className="min-h-screen p-6 relative z-10">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Welcome Header - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glass-card rounded-[40px] p-8 border-[#00E5FF]/20 hover:border-[#00E5FF]/40 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <motion.h1
                                    className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#00E5FF] via-[#A57CFF] to-[#00FFC6] bg-clip-text text-transparent"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {greeting}
                                </motion.h1>
                                <motion.p
                                    className="text-lg text-white/65 flex items-center gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                                    Your CareerLens Copilot is analyzing today's insights...
                                </motion.p>
                            </div>

                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.3 }}
                            >
                                <Avatar className="w-24 h-24 border-4 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                                    <AvatarImage src={user?.photoURL || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-[#00E5FF] to-[#A57CFF] text-white text-2xl font-bold">
                                        {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>
                        </div>
                    </Card>
                </motion.div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Section - Stats & Progress (8 columns) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Projects Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            >
                                <Card className="glass-card rounded-[30px] p-6 border-[#00E5FF]/20 hover:border-[#00E5FF]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-white/50 mb-1">Total</p>
                                            <p className="text-3xl font-bold text-white">{profile.analytics.totalProjects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5 flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-[#00E5FF]" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/65">Projects</p>
                                </Card>
                            </motion.div>

                            {/* Skills Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            >
                                <Card className="glass-card rounded-[30px] p-6 border-[#A57CFF]/20 hover:border-[#A57CFF]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(165,124,255,0.2)]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-white/50 mb-1">Total</p>
                                            <p className="text-3xl font-bold text-white">{profile.analytics.totalSkills}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A57CFF]/20 to-[#A57CFF]/5 flex items-center justify-center">
                                            <Code className="w-6 h-6 text-[#A57CFF]" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/65">Skills</p>
                                </Card>
                            </motion.div>

                            {/* Streak Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            >
                                <Card className="glass-card rounded-[30px] p-6 border-[#00FFC6]/20 hover:border-[#00FFC6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,198,0.2)]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-white/50 mb-1">Current</p>
                                            <p className="text-3xl font-bold text-white">{profile.streak}d</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FFC6]/20 to-[#00FFC6]/5 flex items-center justify-center">
                                            <Flame className="w-6 h-6 text-[#00FFC6]" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/65">Day Streak</p>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Progress Section with Level Circle & XP Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="glass-card rounded-[40px] p-8 border-[#A57CFF]/20">
                                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-[#A57CFF]" />
                                    Progress
                                </h3>

                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Circular Level Indicator */}
                                    <div className="relative">
                                        <svg className="w-48 h-48 transform -rotate-90">
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="88"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="16"
                                                fill="none"
                                            />
                                            <motion.circle
                                                cx="96"
                                                cy="96"
                                                r="88"
                                                stroke="url(#levelGradient)"
                                                strokeWidth="16"
                                                fill="none"
                                                strokeLinecap="round"
                                                initial={{ strokeDashoffset: 553 }}
                                                animate={{ strokeDashoffset: 553 - (553 * xpPercentage) / 100 }}
                                                transition={{ duration: 2, ease: 'easeOut' }}
                                                style={{ strokeDasharray: 553 }}
                                            />
                                            <defs>
                                                <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#A57CFF" />
                                                    <stop offset="50%" stopColor="#FF6EC7" />
                                                    <stop offset="100%" stopColor="#00E5FF" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.div
                                                className="text-6xl font-bold bg-gradient-to-r from-[#A57CFF] to-[#FF6EC7] bg-clip-text text-transparent"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {profile.level}
                                            </motion.div>
                                            <p className="text-sm text-white/65">Level</p>
                                            <p className="text-xs text-white/50 mt-1">{Math.round(xpPercentage)}% Progress</p>
                                        </div>
                                    </div>

                                    {/* XP Progress Bar & Info */}
                                    <div className="flex-1 space-y-6 w-full">
                                        <div>
                                            <p className="text-2xl font-bold text-white mb-2">
                                                {profile.title || `${profile.careerStage} Developer`}
                                            </p>
                                            <p className="text-white/65">
                                                {profile.nextLevelXP - profile.currentXP} XP to next level
                                            </p>
                                        </div>

                                        {/* XP Bar */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/65">Experience Points</span>
                                                <span className="font-mono text-[#FF6EC7] font-semibold">
                                                    {profile.currentXP} / {profile.nextLevelXP} XP
                                                </span>
                                            </div>
                                            <div className="relative h-5 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-[#A57CFF] via-[#FF6EC7] to-[#00E5FF] rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${xpPercentage}%` }}
                                                    transition={{ duration: 2, ease: 'easeOut' }}
                                                />
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Career Path Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card className="glass-card rounded-[40px] p-8 border-[#00E5FF]/20">
                                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                    <Rocket className="w-6 h-6 text-[#00E5FF]" />
                                    Career Path Timeline
                                </h3>

                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-[#00E5FF] via-[#A57CFF] to-[#FF6EC7] opacity-20 rounded-full" />
                                    <div className="absolute top-8 left-0 h-1 bg-gradient-to-r from-[#00E5FF] via-[#A57CFF] to-[#FF6EC7] rounded-full"
                                        style={{ width: `${(profile.level / 6) * 100}%` }}
                                    />

                                    <div className="relative grid grid-cols-6 gap-2">
                                        {careerPathNodes.map((node, idx) => (
                                            <motion.div
                                                key={node.level}
                                                className="flex flex-col items-center"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7 + idx * 0.1 }}
                                                whileHover={{ y: -10 }}
                                            >
                                                <motion.div
                                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 shadow-lg relative z-10 ${node.status === 'completed'
                                                        ? 'bg-gradient-to-br from-[#00FFC6] to-[#00E5B8]'
                                                        : node.status === 'current'
                                                            ? 'bg-gradient-to-br from-[#00E5FF] to-[#A57CFF]'
                                                            : 'bg-white/10'
                                                        }`}
                                                    animate={
                                                        node.status === 'current'
                                                            ? {
                                                                boxShadow: [
                                                                    '0 0 20px rgba(0,229,255,0.5)',
                                                                    '0 0 40px rgba(165,124,255,0.8)',
                                                                    '0 0 20px rgba(0,229,255,0.5)',
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
                                                        <Lock className="w-6 h-6 text-white/40" />
                                                    ) : (
                                                        <span>{node.emoji}</span>
                                                    )}
                                                </motion.div>
                                                <p className="text-xs font-medium text-white text-center">{node.title}</p>
                                                <p className="text-xs text-white/50">Lv {node.level}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Analytics Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* AI Resume Score */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                whileHover={{ y: -4 }}
                            >
                                <Card className="glass-card rounded-[30px] p-6 border-[#00E5FF]/20 hover:border-[#00E5FF]/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-[#00E5FF]">AI Resume Score</h4>
                                        <FileText className="w-5 h-5 text-[#00E5FF]" />
                                    </div>

                                    <div className="text-center mb-4">
                                        <motion.div
                                            className="text-5xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#00CCEE] bg-clip-text text-transparent"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.8 }}
                                        >
                                            {profile.analytics.resumeScore}%
                                        </motion.div>
                                        <p className="text-sm text-white/65 mt-2">
                                            {profile.analytics.resumeScore >= 80 ? 'Excellent!' : profile.analytics.resumeScore >= 60 ? 'Good progress!' : "Let's improve it!"}
                                        </p>
                                    </div>

                                    <Button asChild className="w-full glass-btn bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/10 hover:from-[#00E5FF]/30 hover:to-[#00E5FF]/20 border-[#00E5FF]/30">
                                        <Link href="/resume">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Improve Resume
                                        </Link>
                                    </Button>
                                </Card>
                            </motion.div>

                            {/* Job Match */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ y: -4 }}
                            >
                                <Card className="glass-card rounded-[30px] p-6 border-[#00FFC6]/20 hover:border-[#00FFC6]/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-[#00FFC6]">Job Match</h4>
                                        <Target className="w-5 h-5 text-[#00FFC6]" />
                                    </div>

                                    <div className="text-center mb-4">
                                        <motion.div
                                            className="text-5xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#00E5B8] bg-clip-text text-transparent"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.9 }}
                                        >
                                            {profile.analytics.jobMatchProbability}%
                                        </motion.div>
                                        <p className="text-sm text-white/65 mt-2">
                                            High match for <strong>{profile.title || 'software engineer'}</strong> roles
                                        </p>
                                    </div>

                                    <div className="h-10" />
                                </Card>
                            </motion.div>
                        </div>

                        {/* Top Skills Bar Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <Card className="glass-card rounded-[30px] p-6 border-[#A57CFF]/20">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-bold text-[#A57CFF]">Top Skills</h4>
                                    <Zap className="w-5 h-5 text-[#A57CFF]" />
                                </div>

                                <div className="space-y-4">
                                    {topSkills.map((skill, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1 + idx * 0.1 }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-white">{skill.name}</span>
                                                <span className="text-sm font-mono text-[#A57CFF]">{skill.confidence}%</span>
                                            </div>
                                            <div className="relative h-3 rounded-full overflow-hidden bg-white/5">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-[#A57CFF] to-[#FF6EC7] rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${skill.confidence}%` }}
                                                    transition={{ duration: 1.5, delay: 1.2 + idx * 0.1 }}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Section - Goals & Tasks (4 columns) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Today's Goals - Tall Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="glass-card rounded-[40px] p-6 border-[#00FFC6]/20">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-[#00FFC6] flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6" />
                                        Today's Goals
                                    </h3>
                                    <Badge className="bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30 rounded-full px-3">
                                        {profile.dailyGoals.filter((g) => g.completed).length}/{profile.dailyGoals.length}
                                    </Badge>
                                </div>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {profile.dailyGoals.map((goal, idx) => (
                                        <motion.div
                                            key={goal.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + idx * 0.1 }}
                                            onClick={() => !goal.completed && handleCompleteGoal(goal.id)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${goal.completed
                                                ? 'bg-white/5 border border-[#00FFC6]/20'
                                                : 'bg-gradient-to-r from-[#A57CFF]/10 to-[#FF6EC7]/10 border border-[#A57CFF]/30 hover:border-[#A57CFF]/50 hover:shadow-[0_0_20px_rgba(165,124,255,0.2)]'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 ${goal.completed ? 'text-[#00FFC6]' : 'text-white/40'}`}>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${goal.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                                                            {goal.text}
                                                        </p>
                                                    </div>                        </div>
                                                <Badge className="bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30 rounded-full text-xs px-2">
                                                    +{goal.xpReward} XP
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Mini Calendar/Activity Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Card className="glass-card rounded-[30px] p-6 border-[#00E5FF]/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-[#00E5FF]" />
                                        Activity
                                    </h4>
                                    <Clock className="w-5 h-5 text-white/50" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#00FFC6]" />
                                            <span className="text-sm text-white">Login Streak</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#00FFC6]">{profile.streak} days</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#A57CFF]" />
                                            <span className="text-sm text-white">Total XP</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#A57CFF]">{profile.currentXP}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#FF6EC7]" />
                                            <span className="text-sm text-white">Achievements</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#FF6EC7]">{profile.achievements?.length || 0}</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

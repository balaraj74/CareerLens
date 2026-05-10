'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import { subscribeToProfile } from '@/lib/enhanced-profile-service';
import type { EnhancedUserProfile } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Target,
  Zap,
  Brain,
  Star,
  Award,
  TrendingUp,
  Shield,
  Rocket,
  Battery,
  BookOpen,
  Code,
  Briefcase,
  GraduationCap,
  Users,
  Globe,
  Heart,
  Flame,
  Edit,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export function DynamicGamifiedProfile() {
  const { user, loading: authLoading } = useAuth();
  const { db, loading: firebaseLoading } = useFirebase();
  const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (authLoading || firebaseLoading) return;

    if (!user || !db) {
      setLoading(false);
      setProfile(null);
      return;
    }

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
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsub;

    return () => {
      unsub();
      unsubscribeRef.current = null;
    };
  }, [user, db, authLoading, firebaseLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-cyan mx-auto mb-4" />
          <p className="text-white/75">Loading your career dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 text-center max-w-md">
          <Brain className="w-16 h-16 text-neon-purple mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to CareerLens!</h2>
          <p className="text-white/65 mb-6">
            Complete your profile to unlock your personalized career dashboard
          </p>
          <Button asChild variant="neon">
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
  const xpToNext = profile.nextLevelXP - profile.currentXP;

  const topSkills = (profile.skillsWithProficiency || profile.skills || [])
    .slice(0, 6)
    .map((s) => ({
      name: typeof s === 'string' ? s : 'name' in s ? (s.name as string) : 'Unknown',
      level: typeof s === 'object' && s !== null && 'proficiency' in s ? (s.proficiency as number) : 75,
    }));

  const recentAchievements = profile.achievements
    .filter((a) => a.unlocked)
    .slice(0, 4);

  const lockedAchievements = profile.achievements.filter((a) => !a.unlocked).slice(0, 2);

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden z-10">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan/30 rounded-full"
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
      </div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-emerald bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Career Dashboard
          </motion.h1>
          <Button asChild variant="neon">
            <Link href="/profile/edit">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 border-white/20 backdrop-blur-xl p-6">
            <div className="flex items-center gap-6">
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-3xl font-bold border-2 border-white/20"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {profile.name?.charAt(0) || '?'}
              </motion.div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold">{profile.name || 'Anonymous User'}</h2>
                <p className="text-neon-cyan text-lg">{profile.title || 'Career Explorer'}</p>
                <div className="flex gap-4 mt-2">
                  <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                    Level {profile.level}
                  </Badge>
                  <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                    {profile.careerStage}
                  </Badge>
                  <Badge className="bg-neon-emerald/20 text-neon-emerald border-neon-emerald/30">
                    <Flame className="w-3 h-3 mr-1" />
                    {profile.streak} Day Streak
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-white/65">Resume Score</div>
                <div className="text-4xl font-bold text-neon-emerald">
                  {profile.analytics.resumeScore}%
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - XP & Stats */}
          <div className="space-y-6">
            {/* XP Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-xl p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-700"
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
                        animate={{
                          strokeDashoffset: 553 - (553 * xpPercentage) / 100,
                        }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        style={{ strokeDasharray: 553 }}
                      />
                      <defs>
                        <linearGradient
                          id="xpGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {profile.level}
                      </motion.div>
                      <div className="text-sm text-purple-300">Level</div>
                      <div className="text-xs text-purple-400 mt-2">
                        {Math.round(xpPercentage)}% to Level {profile.level + 1}
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-purple-300">XP Progress</span>
                      <span className="text-pink-300 font-mono">
                        {profile.currentXP} / {profile.nextLevelXP}
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercentage}%` }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-purple-400 mt-2">
                      🎯 {xpToNext} XP to next level
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-cyan" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-cyan">
                    {profile.analytics.totalProjects}
                  </div>
                  <div className="text-xs text-neon-cyan/80">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-purple">
                    {profile.analytics.totalSkills}
                  </div>
                  <div className="text-xs text-purple-300">Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">
                    {profile.analytics.totalInterviews}
                  </div>
                  <div className="text-xs text-pink-300">Interviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {profile.streak}
                  </div>
                  <div className="text-xs text-green-300">Day Streak</div>
                </div>
              </div>
            </Card>

            {/* AI Mentor */}
            <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30 backdrop-blur-xl p-6">
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(34, 211, 238, 0.5)',
                      '0 0 40px rgba(34, 211, 238, 0.8)',
                      '0 0 20px rgba(34, 211, 238, 0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>

                <div className="flex-1">
                  <h3 className="font-bold text-cyan-300 mb-2">AI Career Mentor</h3>
                  <p className="text-sm text-cyan-100">
                    {profile.analytics.resumeScore < 70
                      ? "Let's work on improving your resume score to unlock more opportunities!"
                      : profile.analytics.totalProjects === 0
                        ? 'Ready to start your first project? Check out the AI-suggested projects!'
                        : `Great progress, ${profile.name?.split(' ')[0]}! Keep building your skills.`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Graph */}
            <Card className="bg-gradient-to-br from-white/[0.08] to-neon-cyan/10 border-white/20 backdrop-blur-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-neon-cyan" />
                Top Skills
              </h3>

              <div className="space-y-3">
                {topSkills.length > 0 ? (
                  topSkills.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white/90">
                          {skill.name}
                        </span>
                        <span className="text-xs text-neon-cyan">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No skills added yet. Edit your profile to add skills!
                  </p>
                )}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Achievements
                </h3>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  {recentAchievements.length}/{profile.achievements.length}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {recentAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 p-[2px]">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-2">
                        <div className="text-3xl mb-1">{achievement.icon}</div>
                        <div className="text-xs text-center font-medium text-yellow-200">
                          {achievement.name}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {lockedAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    className="relative group grayscale opacity-50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ delay: 0.4 + (recentAchievements.length + idx) * 0.1 }}
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 p-[2px]">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-2">
                        <div className="text-3xl mb-1">{achievement.icon}</div>
                        <div className="text-xs text-center font-medium text-gray-400">
                          {achievement.name}
                        </div>
                        {achievement.progress !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            {achievement.progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Personal Info Tabs */}
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 backdrop-blur-xl p-6">
              <Tabs defaultValue="experience">
                <TabsList className="grid grid-cols-4 w-full mb-4">
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="more">More</TabsTrigger>
                </TabsList>

                <TabsContent value="experience" className="space-y-4">
                  {profile.experienceDetails && profile.experienceDetails.length > 0 ? (
                    profile.experienceDetails.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-neon-cyan pl-4">
                        <h4 className="font-bold text-neon-cyan">{exp.role}</h4>
                        <p className="text-sm text-white/85">{exp.company}</p>
                        <p className="text-xs text-white/60">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </p>
                        <p className="text-sm text-white/75 mt-2">{exp.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      No experience added yet. Edit your profile to add work experience!
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  {profile.educationDetails && profile.educationDetails.length > 0 ? (
                    profile.educationDetails.map((edu, idx) => (
                      <div key={idx} className="border-l-2 border-purple-500 pl-4">
                        <h4 className="font-bold text-purple-300">
                          {edu.degree} in {edu.field}
                        </h4>
                        <p className="text-sm text-purple-200">{edu.institution}</p>
                        <p className="text-xs text-gray-400">
                          {edu.startDate} - {edu.endDate}
                        </p>
                        {edu.gpa && (
                          <p className="text-sm text-gray-300 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      No education added yet. Edit your profile to add education!
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  {profile.projects && profile.projects.length > 0 ? (
                    profile.projects.map((project, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-green-300">{project.title}</h4>
                          <Badge
                            className={`${project.status === 'completed'
                              ? 'bg-neon-emerald/20 text-neon-emerald border-neon-emerald/30'
                              : project.status === 'in-progress'
                                ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                                : 'bg-white/10 text-white/65 border-white/20'
                              }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/75 mt-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.techStack.map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      No projects yet. Start building to earn XP!
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="more" className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-400 mb-2">
                      Certifications
                    </h4>
                    {profile.certifications && profile.certifications.length > 0 ? (
                      profile.certifications.map((cert, idx) => (
                        <div key={idx} className="text-sm text-gray-300 mb-1">
                          • {cert.name} - {cert.issuer} ({cert.issueDate})
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No certifications yet</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-400 mb-2">
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages && profile.languages.length > 0 ? (
                        profile.languages.map((lang, idx) => (
                          <Badge key={idx} variant="secondary">
                            {lang.name} ({lang.proficiency})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No languages added</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-400 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No interests added</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

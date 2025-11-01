'use client';
import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  Sparkles, Trophy, Target, Zap, Brain, Star, Award, 
  TrendingUp, Shield, Rocket, Battery, BookOpen, Code,
  Briefcase, GraduationCap, Users, Globe, Heart, Flame
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileData {
  name: string;
  title: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  resumeScore: number;
  energy: number;
  achievements: Achievement[];
  skills: Skill[];
  careerPath: CareerNode[];
  stats: ProfileStats;
  personalInfo: PersonalInfo;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Skill {
  name: string;
  level: number;
  xp: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

interface CareerNode {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  level: number;
}

interface ProfileStats {
  projectsCompleted: number;
  skillsLearned: number;
  interviewsPassed: number;
  careerMilestones: number;
  streakDays: number;
  totalLearningHours: number;
}

interface PersonalInfo {
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  bio?: string;
  objective?: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements?: string[];
}

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  highlights: string[];
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  link?: string;
}

interface Language {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export function GamifiedProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Alex Hunter',
    title: 'Full Stack Developer',
    level: 12,
    currentXP: 3450,
    nextLevelXP: 5000,
    resumeScore: 87,
    energy: 85,
    achievements: [
      { id: '1', name: 'First Steps', description: 'Complete your profile', icon: 'trophy', rarity: 'common', unlockedAt: new Date() },
      { id: '2', name: 'Code Master', description: 'Learn 10 programming skills', icon: 'code', rarity: 'rare', unlockedAt: new Date() },
      { id: '3', name: 'Interview Champion', description: 'Pass 5 mock interviews', icon: 'award', rarity: 'epic', progress: 3, maxProgress: 5 },
      { id: '4', name: 'Career Architect', description: 'Complete personalized roadmap', icon: 'rocket', rarity: 'legendary', progress: 7, maxProgress: 10 },
    ],
    skills: [
      { name: 'React', level: 8, xp: 2400, category: 'Frontend', trend: 'up' },
      { name: 'Node.js', level: 7, xp: 2100, category: 'Backend', trend: 'up' },
      { name: 'TypeScript', level: 6, xp: 1800, category: 'Language', trend: 'stable' },
      { name: 'Python', level: 5, xp: 1500, category: 'Language', trend: 'up' },
      { name: 'AWS', level: 4, xp: 1200, category: 'Cloud', trend: 'up' },
      { name: 'Docker', level: 6, xp: 1800, category: 'DevOps', trend: 'stable' },
    ],
    careerPath: [
      { id: '1', title: 'Junior Developer', status: 'completed', level: 1 },
      { id: '2', title: 'Mid-Level Developer', status: 'completed', level: 5 },
      { id: '3', title: 'Senior Developer', status: 'current', level: 10 },
      { id: '4', title: 'Tech Lead', status: 'locked', level: 15 },
      { id: '5', title: 'Engineering Manager', status: 'locked', level: 20 },
    ],
    stats: {
      projectsCompleted: 24,
      skillsLearned: 15,
      interviewsPassed: 8,
      careerMilestones: 12,
      streakDays: 45,
      totalLearningHours: 230,
    },
    personalInfo: {
      email: 'alex.hunter@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexhunter',
      github: 'github.com/alexhunter',
      portfolio: 'alexhunter.dev',
      bio: 'Passionate full-stack developer with a love for creating innovative solutions and learning cutting-edge technologies.',
      objective: 'Seeking a senior developer role where I can leverage my skills in React, Node.js, and cloud technologies to build scalable applications.',
      education: [
        {
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2018',
          endDate: '2022',
          gpa: '3.8/4.0',
          achievements: ['Dean\'s List', 'CS Department Award']
        }
      ],
      experience: [
        {
          company: 'Tech Innovations Inc',
          position: 'Senior Full Stack Developer',
          location: 'San Francisco, CA',
          startDate: '2023-01',
          endDate: 'Present',
          description: 'Lead development of scalable web applications',
          achievements: [
            'Architected microservices platform handling 1M+ requests/day',
            'Reduced application load time by 60% through optimization',
            'Mentored 5 junior developers'
          ],
          technologies: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          location: 'Remote',
          startDate: '2022-06',
          endDate: '2022-12',
          description: 'Built full-stack features for B2B SaaS platform',
          achievements: [
            'Developed REST APIs serving 50K+ users',
            'Implemented real-time notifications using WebSockets',
            'Improved test coverage from 40% to 85%'
          ],
          technologies: ['Vue.js', 'Express', 'MongoDB', 'Redis']
        }
      ],
      projects: [
        {
          name: 'E-Commerce Platform',
          description: 'Full-featured online shopping platform with payment integration',
          technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
          github: 'github.com/alexhunter/ecommerce',
          highlights: [
            'Implemented secure payment processing',
            'Built admin dashboard for inventory management',
            'Optimized for mobile responsiveness'
          ]
        },
        {
          name: 'AI Chat Application',
          description: 'Real-time chat app with AI-powered responses',
          technologies: ['React', 'Socket.io', 'OpenAI API', 'Node.js'],
          link: 'aichat.alexhunter.dev',
          highlights: [
            'Real-time messaging with 100+ concurrent users',
            'AI-powered smart replies',
            'End-to-end encryption'
          ]
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-08',
          credentialId: 'AWS-12345',
          link: 'aws.amazon.com/certification'
        },
        {
          name: 'Professional Scrum Master I',
          issuer: 'Scrum.org',
          date: '2023-03'
        }
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Professional' },
        { name: 'Mandarin', proficiency: 'Basic' }
      ],
      interests: ['Open Source', 'AI/ML', 'Blockchain', 'Game Development', 'Tech Blogging']
    }
  });

  const xpPercentage = (profileData.currentXP / profileData.nextLevelXP) * 100;
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 via-orange-500 to-red-600',
  };

  const glowAnimation = {
    initial: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
    animate: {
      boxShadow: [
        '0 0 20px rgba(139, 92, 246, 0.3)',
        '0 0 40px rgba(139, 92, 246, 0.6)',
        '0 0 20px rgba(139, 92, 246, 0.3)',
      ],
    },
    transition: { duration: 2, repeat: Infinity },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-8">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar with Holographic Effect */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  {...glowAnimation}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Star className="w-4 h-4 text-white fill-white" />
                  </motion.div>
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      {profileData.name}
                    </h1>
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Level {profileData.level}
                    </Badge>
                  </div>
                  <p className="text-purple-200 text-lg mb-4">{profileData.title}</p>
                  
                  {/* XP Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Experience Points</span>
                      <span className="text-blue-300 font-mono">{profileData.currentXP} / {profileData.nextLevelXP} XP</span>
                    </div>
                    <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/30">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Energy Meter */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 p-4">
                    <div className="text-center">
                      <Battery className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <div className="text-2xl font-bold text-green-400">{profileData.energy}%</div>
                      <div className="text-xs text-green-300">Energy</div>
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-green-400/10 rounded-lg"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </Card>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Resume Score Tracker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-200 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Resume Score
                  </h3>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </motion.div>
                </div>
                
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-700"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 352 }}
                      animate={{ strokeDashoffset: 352 - (352 * profileData.resumeScore) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      style={{ strokeDasharray: 352 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{profileData.resumeScore}</div>
                      <div className="text-xs text-purple-300">Score</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-purple-300">
                    <span>Completeness</span>
                    <span className="text-green-400">95%</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Impact</span>
                    <span className="text-blue-400">82%</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Keywords</span>
                    <span className="text-yellow-400">88%</span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Improve Resume
                </Button>
              </Card>
            </motion.div>

            {/* AI Mentor - Jarvis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30 backdrop-blur-xl p-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, 0],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
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
                    <div>
                      <h3 className="text-lg font-bold text-cyan-200">AI Career Mentor</h3>
                      <div className="flex items-center gap-1 text-xs text-cyan-400">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-green-400"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.div
                      className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm text-cyan-100">
                        "Your React skills are impressive! I recommend focusing on system design next to reach Tech Lead level."
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                        Get Advice
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                        Set Goals
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/40 to-purple-900/40 border-purple-500/30 backdrop-blur-xl p-6">
                <h3 className="text-lg font-bold text-purple-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Career Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Projects', value: profileData.stats.projectsCompleted, icon: Briefcase },
                    { label: 'Skills', value: profileData.stats.skillsLearned, icon: Code },
                    { label: 'Interviews', value: profileData.stats.interviewsPassed, icon: Users },
                    { label: 'Streak', value: `${profileData.stats.streakDays}d`, icon: Flame },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20"
                      whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                    >
                      <stat.icon className="w-4 h-4 text-purple-400 mb-1" />
                      <div className="text-2xl font-bold text-purple-300">{stat.value}</div>
                      <div className="text-xs text-purple-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Skill Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-xl p-6">
                <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Skill Mastery
                </h3>
                <div className="space-y-4">
                  {profileData.skills.map((skill, idx) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-200 font-medium">{skill.name}</span>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                            Lv {skill.level}
                          </Badge>
                          <motion.div
                            animate={{
                              y: skill.trend === 'up' ? [-2, 0, -2] : skill.trend === 'down' ? [2, 0, 2] : 0,
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <TrendingUp
                              className={`w-4 h-4 ${
                                skill.trend === 'up'
                                  ? 'text-green-400'
                                  : skill.trend === 'down'
                                  ? 'text-red-400 rotate-180'
                                  : 'text-yellow-400'
                              }`}
                            />
                          </motion.div>
                        </div>
                        <span className="text-purple-400 text-sm font-mono">{skill.xp} XP</span>
                      </div>
                      <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/20">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${(skill.level / 10) * 100}%` }}
                          transition={{ duration: 1, delay: 0.4 + idx * 0.1 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: idx * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30 backdrop-blur-xl p-6">
                <h3 className="text-xl font-bold text-yellow-200 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profileData.achievements.map((achievement, idx) => (
                    <motion.div
                      key={achievement.id}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div
                        className={`relative aspect-square rounded-lg bg-gradient-to-br ${
                          rarityColors[achievement.rarity]
                        } p-[2px] ${achievement.unlockedAt ? '' : 'grayscale opacity-50'}`}
                      >
                        <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-3">
                          {achievement.unlockedAt ? (
                            <Award className="w-8 h-8 text-yellow-400 mb-1" />
                          ) : (
                            <Shield className="w-8 h-8 text-slate-600 mb-1" />
                          )}
                          <div className="text-xs text-center font-medium text-purple-200">
                            {achievement.name}
                          </div>
                          {achievement.progress && (
                            <div className="text-xs text-purple-400 mt-1">
                              {achievement.progress}/{achievement.maxProgress}
                            </div>
                          )}
                        </div>
                        {achievement.unlockedAt && (
                          <motion.div
                            className="absolute inset-0 rounded-lg"
                            animate={{
                              boxShadow: [
                                '0 0 20px rgba(250, 204, 21, 0.3)',
                                '0 0 40px rgba(250, 204, 21, 0.6)',
                                '0 0 20px rgba(250, 204, 21, 0.3)',
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-2 text-xs text-purple-200 whitespace-nowrap">
                          {achievement.description}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Career Path Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30 backdrop-blur-xl p-6">
                <h3 className="text-xl font-bold text-blue-200 mb-6 flex items-center gap-2">
                  <Rocket className="w-6 h-6" />
                  Career Path
                </h3>
                <div className="relative">
                  {/* Path Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
                  
                  <div className="space-y-8">
                    {profileData.careerPath.map((node, idx) => (
                      <motion.div
                        key={node.id}
                        className="relative flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        <motion.div
                          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                            node.status === 'completed'
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : node.status === 'current'
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                              : 'bg-gradient-to-br from-slate-600 to-slate-700'
                          }`}
                          whileHover={{ scale: 1.1 }}
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
                          transition={node.status === 'current' ? { duration: 2, repeat: Infinity } : {}}
                        >
                          <div className="text-2xl font-bold text-white">{node.level}</div>
                          {node.status === 'completed' && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-green-400"
                              initial={{ scale: 1, opacity: 0.5 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-bold ${
                                node.status === 'completed'
                                  ? 'text-green-300'
                                  : node.status === 'current'
                                  ? 'text-blue-300'
                                  : 'text-slate-500'
                              }`}
                            >
                              {node.title}
                            </h4>
                            {node.status === 'current' && (
                              <Badge className="bg-blue-600 border-none">
                                <Star className="w-3 h-3 mr-1 fill-white" />
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-purple-400">
                            {node.status === 'completed'
                              ? 'Completed ✓'
                              : node.status === 'current'
                              ? 'In Progress...'
                              : 'Locked'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Personal Information Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/40 to-indigo-900/40 border-indigo-500/30 backdrop-blur-xl p-6">
                <Tabs defaultValue="experience" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="more">More</TabsTrigger>
                  </TabsList>

                  <TabsContent value="experience" className="space-y-4 mt-4">
                    {profileData.personalInfo.experience.map((exp, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-indigo-200">{exp.position}</h4>
                            <p className="text-indigo-300">{exp.company} • {exp.location}</p>
                            <p className="text-sm text-indigo-400">{exp.startDate} - {exp.endDate}</p>
                          </div>
                          <Briefcase className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-purple-300 text-sm mb-3">{exp.description}</p>
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-indigo-300">Key Achievements:</h5>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="text-sm text-purple-300 flex items-start gap-2">
                                <Star className="w-3 h-3 mt-1 text-yellow-400 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exp.technologies.map((tech, i) => (
                            <Badge key={i} variant="outline" className="border-indigo-500/30 text-indigo-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4 mt-4">
                    {profileData.personalInfo.education.map((edu, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-indigo-200">{edu.degree} in {edu.field}</h4>
                            <p className="text-indigo-300">{edu.institution}</p>
                            <p className="text-sm text-indigo-400">{edu.startDate} - {edu.endDate}</p>
                            {edu.gpa && <p className="text-sm text-purple-300 mt-1">GPA: {edu.gpa}</p>}
                          </div>
                          <GraduationCap className="w-5 h-5 text-indigo-400" />
                        </div>
                        {edu.achievements && edu.achievements.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-semibold text-indigo-300 mb-2">Achievements:</h5>
                            <div className="flex flex-wrap gap-2">
                              {edu.achievements.map((achievement, i) => (
                                <Badge key={i} className="bg-indigo-600/50 border-indigo-500/30">
                                  <Award className="w-3 h-3 mr-1" />
                                  {achievement}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Certifications */}
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-indigo-200 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certifications
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {profileData.personalInfo.certifications.map((cert, idx) => (
                          <motion.div
                            key={idx}
                            className="bg-slate-800/30 rounded-lg p-3 border border-indigo-500/20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-semibold text-indigo-200 text-sm">{cert.name}</h5>
                            <p className="text-xs text-indigo-300">{cert.issuer}</p>
                            <p className="text-xs text-purple-400 mt-1">{cert.date}</p>
                            {cert.credentialId && (
                              <p className="text-xs text-slate-400 mt-1">ID: {cert.credentialId}</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-4 mt-4">
                    {profileData.personalInfo.projects.map((project, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-indigo-200 flex items-center gap-2">
                              {project.name}
                              {project.link && (
                                <Globe className="w-4 h-4 text-indigo-400" />
                              )}
                            </h4>
                            <p className="text-purple-300 text-sm mt-1">{project.description}</p>
                          </div>
                          <Code className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="space-y-2 mt-3">
                          <h5 className="text-sm font-semibold text-indigo-300">Highlights:</h5>
                          <ul className="space-y-1">
                            {project.highlights.map((highlight, i) => (
                              <li key={i} className="text-sm text-purple-300 flex items-start gap-2">
                                <Sparkles className="w-3 h-3 mt-1 text-blue-400 flex-shrink-0" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.technologies.map((tech, i) => (
                            <Badge key={i} variant="outline" className="border-indigo-500/30 text-indigo-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        {(project.github || project.link) && (
                          <div className="flex gap-2 mt-3">
                            {project.github && (
                              <Button size="sm" variant="outline" className="border-indigo-500/30 text-indigo-300">
                                GitHub
                              </Button>
                            )}
                            {project.link && (
                              <Button size="sm" variant="outline" className="border-indigo-500/30 text-indigo-300">
                                Live Demo
                              </Button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="more" className="space-y-4 mt-4">
                    {/* Contact & Links */}
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20">
                      <h4 className="text-lg font-bold text-indigo-200 mb-3">Contact & Links</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-indigo-400">Email:</span>{' '}
                          <span className="text-purple-300">{profileData.personalInfo.email}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400">Phone:</span>{' '}
                          <span className="text-purple-300">{profileData.personalInfo.phone}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400">Location:</span>{' '}
                          <span className="text-purple-300">{profileData.personalInfo.location}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400">LinkedIn:</span>{' '}
                          <span className="text-purple-300">{profileData.personalInfo.linkedin}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400">GitHub:</span>{' '}
                          <span className="text-purple-300">{profileData.personalInfo.github}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400">Portfolio:</span>{' '}
                          <span className="text-purple-300">{profileData.personalInfo.portfolio}</span>
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20">
                      <h4 className="text-lg font-bold text-indigo-200 mb-3">Languages</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        {profileData.personalInfo.languages.map((lang, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-indigo-300 font-semibold">{lang.name}</span>
                            <div className="text-purple-400">{lang.proficiency}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20">
                      <h4 className="text-lg font-bold text-indigo-200 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.personalInfo.interests.map((interest, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
                              {interest}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Bio & Objective */}
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/20">
                      <h4 className="text-lg font-bold text-indigo-200 mb-2">Professional Summary</h4>
                      <p className="text-purple-300 text-sm mb-4">{profileData.personalInfo.bio}</p>
                      
                      <h4 className="text-lg font-bold text-indigo-200 mb-2">Career Objective</h4>
                      <p className="text-purple-300 text-sm">{profileData.personalInfo.objective}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

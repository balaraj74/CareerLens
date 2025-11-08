'use client';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Firestore,
  enableNetwork,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import type {
  EnhancedUserProfile,
  Achievement,
  Project,
  DailyGoal,
  WeeklyActivity,
} from './types';

/**
 * Fetch enhanced user profile with all gamification data
 */
export async function fetchEnhancedProfile(
  db: Firestore,
  userId: string
): Promise<EnhancedUserProfile | null> {
  if (!db || !userId) {
    console.warn('DB or userId not provided');
    return null;
  }

  try {
    // Don't call enableNetwork as it may cause Target ID conflicts
    // await enableNetwork(db);
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        // Ensure required gamification fields have defaults
        level: data.level || 1,
        currentXP: data.currentXP || 0,
        totalXP: data.totalXP || 0,
        nextLevelXP: data.nextLevelXP || 1000,
        careerStage: data.careerStage || 'Learner',
        streak: data.streak || 0,
        projects: data.projects || [],
        achievements: data.achievements || initializeAchievements(),
        dailyGoals: data.dailyGoals || initializeDailyGoals(),
        weeklyActivity: data.weeklyActivity || initializeWeeklyActivity(),
        certifications: data.certifications || [],
        languages: data.languages || [],
        interests: data.interests || [],
        analytics: data.analytics || initializeAnalytics(),
      } as EnhancedUserProfile;
    }

    // Return a new profile with defaults
    return createDefaultProfile(userId);
  } catch (error: any) {
    // Handle specific Firebase errors
    if (error?.code === 'target-id-exists' || error?.message?.includes('Target ID already exists')) {
      console.warn('Firestore target ID conflict detected, retrying...');
      // Wait a bit and retry once
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as EnhancedUserProfile;
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
    console.error('Error fetching enhanced profile:', error);
    return null;
  }
}

/**
 * Save enhanced user profile
 */
export async function saveEnhancedProfile(
  db: Firestore,
  userId: string,
  profile: Partial<EnhancedUserProfile>
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const docRef = doc(db, 'users', userId);

  try {
    const dataToSave = {
      ...profile,
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log('Enhanced profile saved successfully');
  } catch (error) {
    console.error('Error saving enhanced profile:', error);
    throw error;
  }
}

/**
 * Award XP to user and update level
 */
export async function awardXP(
  db: Firestore,
  userId: string,
  xpAmount: number,
  reason: string
): Promise<{ leveledUp: boolean; newLevel: number }> {
  const profile = await fetchEnhancedProfile(db, userId);
  if (!profile) throw new Error('Profile not found');

  const newCurrentXP = profile.currentXP + xpAmount;
  const newTotalXP = profile.totalXP + xpAmount;
  let newLevel = profile.level;
  let leveledUp = false;

  // Check if leveled up
  if (newCurrentXP >= profile.nextLevelXP) {
    newLevel += 1;
    leveledUp = true;
    const carryoverXP = newCurrentXP - profile.nextLevelXP;
    const newNextLevelXP = calculateNextLevelXP(newLevel);

    await setDoc(doc(db, 'users', userId), {
      level: newLevel,
      currentXP: carryoverXP,
      totalXP: newTotalXP,
      nextLevelXP: newNextLevelXP,
      careerStage: getCareerStage(newLevel),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Log achievement
    await logActivity(db, userId, 'level_up', {
      level: newLevel,
      reason,
    });
  } else {
    await setDoc(doc(db, 'users', userId), {
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  return { leveledUp, newLevel };
}

/**
 * Complete a daily goal
 */
export async function completeDailyGoal(
  db: Firestore,
  userId: string,
  goalId: string
): Promise<void> {
  const profile = await fetchEnhancedProfile(db, userId);
  if (!profile) throw new Error('Profile not found');

  const updatedGoals = profile.dailyGoals.map((goal) =>
    goal.id === goalId
      ? { ...goal, completed: true, completedAt: new Date().toISOString() }
      : goal
  );

  const completedGoal = updatedGoals.find((g) => g.id === goalId);
  if (completedGoal) {
    await awardXP(db, userId, completedGoal.xpReward, `Completed goal: ${completedGoal.text}`);
  }

  await setDoc(doc(db, 'users', userId), {
    dailyGoals: updatedGoals,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Unlock an achievement
 */
export async function unlockAchievement(
  db: Firestore,
  userId: string,
  achievementId: string
): Promise<void> {
  const profile = await fetchEnhancedProfile(db, userId);
  if (!profile) throw new Error('Profile not found');

  const updatedAchievements = profile.achievements.map((achievement) =>
    achievement.id === achievementId
      ? {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        }
      : achievement
  );

  await setDoc(doc(db, 'users', userId), {
    achievements: updatedAchievements,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Award XP for unlocking achievement
  await awardXP(db, userId, 100, `Unlocked achievement: ${achievementId}`);

  // Log activity
  await logActivity(db, userId, 'achievement_unlocked', {
    achievementId,
  });
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  db: Firestore,
  userId: string,
  projectId: string,
  status: 'not-started' | 'in-progress' | 'completed'
): Promise<void> {
  const profile = await fetchEnhancedProfile(db, userId);
  if (!profile) throw new Error('Profile not found');

  const updatedProjects = profile.projects.map((project) => {
    if (project.id === projectId) {
      const updates: any = { ...project, status };
      if (status === 'in-progress' && !project.startedAt) {
        updates.startedAt = new Date().toISOString();
      }
      if (status === 'completed') {
        updates.completedAt = new Date().toISOString();
      }
      return updates;
    }
    return project;
  });

  await setDoc(doc(db, 'users', userId), {
    projects: updatedProjects,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Award XP if completed
  const completedProject = updatedProjects.find((p) => p.id === projectId);
  if (status === 'completed' && completedProject) {
    await awardXP(
      db,
      userId,
      completedProject.xpReward,
      `Completed project: ${completedProject.title}`
    );
  }
}

/**
 * Update user streak
 */
export async function updateStreak(db: Firestore, userId: string): Promise<number> {
  const profile = await fetchEnhancedProfile(db, userId);
  if (!profile) throw new Error('Profile not found');

  const today = new Date().toISOString().split('T')[0];
  const lastActivity = profile.lastActivityDate?.split('T')[0];

  let newStreak = profile.streak || 0;

  if (!lastActivity) {
    newStreak = 1;
  } else if (lastActivity === today) {
    // Already counted today
    return newStreak;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActivity === yesterdayStr) {
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  await setDoc(doc(db, 'users', userId), {
    streak: newStreak,
    lastActivityDate: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return newStreak;
}

/**
 * Log user activity
 */
export async function logActivity(
  db: Firestore,
  userId: string,
  activityType: string,
  metadata: any
): Promise<void> {
  try {
    await addDoc(collection(db, 'activities'), {
      userId,
      type: activityType,
      metadata,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Calculate analytics based on user data
 */
export async function calculateAnalytics(
  db: Firestore,
  userId: string
): Promise<void> {
  const profile = await fetchEnhancedProfile(db, userId);
  if (!profile) return;

  const analytics = {
    totalProjects: profile.projects.length,
    completedProjects: profile.projects.filter((p) => p.status === 'completed').length,
    totalSkills: profile.skills?.length || 0,
    totalInterviews: 0, // Can be tracked separately
    resumeScore: calculateResumeScore(profile),
    jobMatchProbability: calculateJobMatch(profile),
    weeklyHours: profile.weeklyActivity.reduce((sum, day) => sum + day.hours, 0),
    avgProductivity: Math.round(
      profile.weeklyActivity.reduce((sum, day) => sum + day.productivity, 0) /
        (profile.weeklyActivity.length || 1)
    ),
  };

  await setDoc(doc(db, 'users', userId), {
    analytics,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Helper Functions
 */

function calculateNextLevelXP(level: number): number {
  return Math.floor(1000 * Math.pow(1.5, level - 1));
}

function getCareerStage(
  level: number
): 'Learner' | 'Explorer' | 'Developer' | 'Specialist' | 'Innovator' | 'Master' {
  if (level <= 1) return 'Learner';
  if (level <= 2) return 'Explorer';
  if (level <= 3) return 'Developer';
  if (level <= 4) return 'Specialist';
  if (level <= 5) return 'Innovator';
  return 'Master';
}

function calculateResumeScore(profile: EnhancedUserProfile): number {
  let score = 0;

  // Basic info
  if (profile.name) score += 10;
  if (profile.email) score += 5;
  if (profile.phone) score += 5;
  if (profile.linkedin) score += 5;
  if (profile.github) score += 5;

  // Summary/Objective
  if (profile.summary || profile.objective) score += 10;

  // Experience
  const expCount = profile.experienceDetails?.length || profile.experience?.length || 0;
  score += Math.min(expCount * 10, 30);

  // Education
  const eduCount = profile.educationDetails?.length || profile.education?.length || 0;
  score += Math.min(eduCount * 10, 20);

  // Skills
  const skillCount = profile.skills?.length || 0;
  score += Math.min(skillCount * 2, 10);

  return Math.min(score, 100);
}

function calculateJobMatch(profile: EnhancedUserProfile): number {
  // Simplified job match calculation
  let score = 60; // Base score

  // More skills = better match
  const skillCount = profile.skills?.length || 0;
  score += Math.min(skillCount, 20);

  // More experience = better match
  const expCount = profile.experienceDetails?.length || profile.experience?.length || 0;
  score += Math.min(expCount * 5, 20);

  return Math.min(score, 100);
}

function initializeAchievements(): Achievement[] {
  return [
    {
      id: 'ml-beginner',
      name: 'ML Beginner',
      icon: '🧠',
      unlocked: false,
      description: 'Complete your first ML project',
      category: 'learning',
    },
    {
      id: 'resume-pro',
      name: 'Resume Pro',
      icon: '🚀',
      unlocked: false,
      description: 'Achieve 90% resume score',
      category: 'career',
    },
    {
      id: 'three-internships',
      name: '3 Internships',
      icon: '💼',
      unlocked: false,
      description: 'Complete 3 internships',
      category: 'career',
    },
    {
      id: 'code-master',
      name: 'Code Master',
      icon: '⚡',
      unlocked: false,
      progress: 0,
      description: 'Master 10 programming languages',
      category: 'skill',
    },
    {
      id: 'ai-specialist',
      name: 'AI Specialist',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      description: 'Complete 5 AI projects',
      category: 'project',
    },
    {
      id: 'interview-hero',
      name: 'Interview Hero',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      description: 'Complete 10 mock interviews',
      category: 'career',
    },
  ];
}

function initializeDailyGoals(): DailyGoal[] {
  return [
    {
      id: 'update-resume',
      text: 'Update resume headline',
      completed: false,
      xpReward: 50,
      category: 'career',
    },
    {
      id: 'learn-skill',
      text: 'Learn one new skill',
      completed: false,
      xpReward: 100,
      category: 'learning',
    },
    {
      id: 'mock-interview',
      text: 'Complete mock interview',
      completed: false,
      xpReward: 150,
      category: 'career',
    },
  ];
}

function initializeWeeklyActivity(): WeeklyActivity[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (today.getDay() || 7) + index + 1);

    return {
      day,
      date: date.toISOString().split('T')[0],
      hours: 0,
      productivity: 0,
      activities: [],
    };
  });
}

function initializeAnalytics() {
  return {
    totalProjects: 0,
    completedProjects: 0,
    totalSkills: 0,
    totalInterviews: 0,
    resumeScore: 0,
    jobMatchProbability: 0,
    weeklyHours: 0,
    avgProductivity: 0,
  };
}

function createDefaultProfile(userId: string): EnhancedUserProfile {
  return {
    name: '',
    email: '',
    phone: '',
    bio: '',
    linkedin: '',
    github: '',
    education: [],
    experience: [],
    skills: [],
    careerGoals: '',
    level: 1,
    currentXP: 0,
    totalXP: 0,
    nextLevelXP: 1000,
    careerStage: 'Learner',
    streak: 0,
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    achievements: initializeAchievements(),
    dailyGoals: initializeDailyGoals(),
    weeklyActivity: initializeWeeklyActivity(),
    analytics: initializeAnalytics(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

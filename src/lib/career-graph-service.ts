'use client';

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type {
  CareerActivity,
  SkillNode,
  CareerGraphData,
  HeatmapDay,
  UserProfile,
} from './types';

/**
 * Logs a career activity to Firestore
 */
export async function logCareerActivity(
  db: Firestore,
  userId: string,
  activity: Omit<CareerActivity, 'id' | 'userId' | 'timestamp'>
): Promise<void> {
  if (!userId || !db) {
    throw new Error('User ID and Firestore instance are required');
  }

  try {
    const activityData = {
      userId,
      type: activity.type,
      metadata: activity.metadata,
      impact: activity.impact,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'careerActivities'), activityData);
    
    // Update the career graph with new activity
    await updateCareerGraph(db, userId);
  } catch (error) {
    console.error('Error logging career activity:', error);
    throw new Error('Failed to log career activity');
  }
}

/**
 * Fetches career activities for a user within a date range
 */
export async function fetchCareerActivities(
  db: Firestore,
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CareerActivity[]> {
  if (!userId || !db) {
    throw new Error('User ID and Firestore instance are required');
  }

  try {
    const activitiesRef = collection(db, 'careerActivities');
    
    // Try the optimized query first (requires index)
    try {
      let q = query(
        activitiesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(365) // Last year of activities
      );

      const querySnapshot = await getDocs(q);
      const activities: CareerActivity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          metadata: data.metadata || {},
          impact: data.impact || 1,
        });
      });

      return activities;
    } catch (indexError: any) {
      // If index is not ready, fall back to simpler query
      if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
        console.warn('Firestore index not ready yet, using fallback query. Activities may be limited.');
        
        // Simpler query without orderBy (doesn't require index)
        let q = query(
          activitiesRef,
          where('userId', '==', userId),
          limit(100) // Reduced limit for fallback
        );

        const querySnapshot = await getDocs(q);
        const activities: CareerActivity[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            userId: data.userId,
            type: data.type,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            metadata: data.metadata || {},
            impact: data.impact || 1,
          });
        });

        // Sort manually in JavaScript
        activities.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        return activities.slice(0, 365); // Limit to 365 after sorting
      }
      throw indexError;
    }
  } catch (error) {
    console.error('Error fetching career activities:', error);
    return [];
  }
}

/**
 * Calculates skill weight based on frequency, recency, and practice
 */
export function calculateSkillWeight(
  skillName: string,
  activities: CareerActivity[]
): number {
  const relevantActivities = activities.filter(
    (a) => a.metadata.skillName?.toLowerCase() === skillName.toLowerCase()
  );

  if (relevantActivities.length === 0) return 20; // Base weight for new skills

  // Calculate frequency score (0-40)
  const frequencyScore = Math.min(relevantActivities.length * 2, 40);

  // Calculate recency score (0-30)
  const latestActivity = relevantActivities[0];
  const daysSinceLatest = latestActivity.timestamp
    ? Math.floor(
        (Date.now() - new Date(latestActivity.timestamp).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 365;
  const recencyScore = Math.max(30 - daysSinceLatest / 10, 0);

  // Calculate intensity score (0-30)
  const avgIntensity =
    relevantActivities.reduce((sum, a) => sum + (a.impact || 1), 0) /
    relevantActivities.length;
  const intensityScore = avgIntensity * 3;

  return Math.min(frequencyScore + recencyScore + intensityScore, 100);
}

/**
 * Builds skill nodes from profile and activities
 */
export async function buildSkillNodes(
  profile: UserProfile,
  activities: CareerActivity[]
): Promise<SkillNode[]> {
  const skillNodes: SkillNode[] = [];
  const skillMap = new Map<string, SkillNode>();

  // Initialize from profile skills
  profile.skills?.forEach((skill) => {
    const weight = calculateSkillWeight(skill.name, activities);
    const relevantActivities = activities.filter(
      (a) => a.metadata.skillName?.toLowerCase() === skill.name.toLowerCase()
    );

    const latestActivity = relevantActivities[0];
    const recency = latestActivity?.timestamp
      ? Math.floor(
          (Date.now() - new Date(latestActivity.timestamp).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 365;

    skillMap.set(skill.name.toLowerCase(), {
      id: skill.name.toLowerCase().replace(/\s+/g, '-'),
      name: skill.name,
      category: categorizeSkill(skill.name),
      weight,
      frequency: relevantActivities.length,
      recency,
      connections: [],
    });
  });

  // Add connections based on co-occurrence in activities
  skillMap.forEach((node, key) => {
    const relatedSkills = new Set<string>();
    
    activities.forEach((activity) => {
      if (activity.metadata.skillName?.toLowerCase() === key) {
        // Find other skills practiced in nearby time periods
        const nearbyActivities = activities.filter(
          (a) =>
            a.metadata.skillName &&
            a.metadata.skillName.toLowerCase() !== key &&
            Math.abs(
              new Date(a.timestamp).getTime() -
                new Date(activity.timestamp).getTime()
            ) <
              7 * 24 * 60 * 60 * 1000 // Within same week
        );
        nearbyActivities.forEach((a) => {
          if (a.metadata.skillName) {
            relatedSkills.add(a.metadata.skillName.toLowerCase());
          }
        });
      }
    });

    node.connections = Array.from(relatedSkills).map((s) =>
      s.replace(/\s+/g, '-')
    );
  });

  return Array.from(skillMap.values());
}

/**
 * Categorizes a skill based on common patterns
 */
function categorizeSkill(
  skillName: string
): 'technical' | 'soft' | 'domain' | 'tool' | 'language' {
  const name = skillName.toLowerCase();

  // Programming languages
  if (
    ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'kotlin', 'swift'].some(
      (lang) => name.includes(lang)
    )
  ) {
    return 'language';
  }

  // Tools and frameworks
  if (
    ['react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'docker', 'kubernetes', 'git', 'aws', 'azure'].some(
      (tool) => name.includes(tool)
    )
  ) {
    return 'tool';
  }

  // Soft skills
  if (
    ['communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking'].some(
      (soft) => name.includes(soft)
    )
  ) {
    return 'soft';
  }

  // Domain knowledge
  if (
    ['machine learning', 'data science', 'web development', 'mobile', 'devops', 'security', 'blockchain'].some(
      (domain) => name.includes(domain)
    )
  ) {
    return 'domain';
  }

  return 'technical';
}

/**
 * Generates heatmap data for the last year (GitHub contribution style)
 */
export function generateHeatmapData(activities: CareerActivity[]): HeatmapDay[] {
  const heatmapData: HeatmapDay[] = [];
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Create a map of date -> activities
  const activityMap = new Map<string, CareerActivity[]>();

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toISOString().split('T')[0];
    if (!activityMap.has(dateKey)) {
      activityMap.set(dateKey, []);
    }
    activityMap.get(dateKey)!.push(activity);
  });

  // Generate data for each day in the last year
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const dayActivities = activityMap.get(dateKey) || [];
    const count = dayActivities.length;
    
    // Calculate intensity (0-4 scale like GitHub)
    let intensity = 0;
    if (count > 0) {
      if (count >= 10) intensity = 4;
      else if (count >= 7) intensity = 3;
      else if (count >= 4) intensity = 2;
      else intensity = 1;
    }

    heatmapData.push({
      date: dateKey,
      count,
      intensity,
      activities: dayActivities,
    });
  }

  return heatmapData;
}

/**
 * Calculates career readiness score based on skills and target role
 */
export function calculateReadinessScore(
  currentSkills: SkillNode[],
  targetRole?: string,
  careerGoals?: string
): number {
  if (!targetRole && !careerGoals) return 0;

  // For now, use a simple weighted average of skill proficiency
  // In a real system, this would compare against job requirements
  if (currentSkills.length === 0) return 0;

  const totalWeight = currentSkills.reduce((sum, skill) => sum + skill.weight, 0);
  const averageWeight = totalWeight / currentSkills.length;

  // Bonus for having diverse skill categories
  const categories = new Set(currentSkills.map((s) => s.category));
  const diversityBonus = Math.min(categories.size * 5, 20);

  // Bonus for recent activity
  const recentSkills = currentSkills.filter((s) => s.recency < 30).length;
  const recencyBonus = Math.min(recentSkills * 2, 15);

  return Math.min(averageWeight + diversityBonus + recencyBonus, 100);
}

/**
 * Updates the career graph in Firestore
 */
export async function updateCareerGraph(
  db: Firestore,
  userId: string
): Promise<void> {
  if (!userId || !db) return;

  try {
    // Fetch user profile
    const profileRef = doc(db, 'users', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) return;

    const profile = profileSnap.data() as UserProfile;

    // Fetch activities
    const activities = await fetchCareerActivities(db, userId);

    // Build skill nodes
    const skills = await buildSkillNodes(profile, activities);

    // Calculate readiness score
    const readinessScore = calculateReadinessScore(
      skills,
      undefined,
      profile.careerGoals
    );

    // Save career graph
    const graphData: CareerGraphData = {
      userId,
      currentRole: profile.experience?.[0]?.role,
      targetRole: profile.careerGoals,
      skills,
      activities: activities.slice(0, 100), // Keep last 100 activities
      readinessScore,
      lastUpdated: new Date().toISOString(),
    };

    const graphRef = doc(db, 'careerGraphs', userId);
    await setDoc(graphRef, graphData, { merge: true });
  } catch (error) {
    console.error('Error updating career graph:', error);
  }
}

/**
 * Fetches the career graph for a user
 */
export async function fetchCareerGraph(
  db: Firestore,
  userId: string
): Promise<CareerGraphData | null> {
  if (!userId || !db) return null;

  try {
    const graphRef = doc(db, 'careerGraphs', userId);
    const graphSnap = await getDoc(graphRef);

    if (graphSnap.exists()) {
      return graphSnap.data() as CareerGraphData;
    }

    // If no graph exists, create one
    await updateCareerGraph(db, userId);
    const newGraphSnap = await getDoc(graphRef);
    
    return newGraphSnap.exists() ? (newGraphSnap.data() as CareerGraphData) : null;
  } catch (error) {
    console.error('Error fetching career graph:', error);
    return null;
  }
}

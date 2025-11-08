/**
 * College Recommendation Service
 * Predicts suitable colleges based on exam scores and preferences
 */

import type { 
  College, 
  StudentPreferences, 
  CollegeRecommendation,
  ExamType 
} from '@/lib/types/community';
import type { Firestore } from 'firebase/firestore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * Get college recommendations based on student preferences
 */
export async function getCollegeRecommendations(
  db: Firestore,
  preferences: StudentPreferences,
  maxResults: number = 20
): Promise<CollegeRecommendation[]> {
  try {
    // Fetch eligible colleges based on cutoffs
    const colleges = await fetchEligibleColleges(db, preferences);
    
    // Calculate match scores
    const recommendations: CollegeRecommendation[] = [];
    
    for (const college of colleges) {
      const matchScore = calculateMatchScore(college, preferences);
      const admissionChance = calculateAdmissionChance(
        college,
        preferences.exam_type,
        preferences.score,
        preferences.branch_preferences[0]
      );
      
      if (admissionChance > 20) { // Only show if >20% chance
        recommendations.push({
          college,
          match_score: matchScore,
          predicted_admission_chance: admissionChance,
          reasons: generateReasons(college, preferences, matchScore),
          review_summary: {
            college_id: college.id,
            total_reviews: 0,
            average_sentiment: 0,
            sentiment_distribution: {
              positive: 0,
              neutral: 0,
              negative: 0,
              mixed: 0
            },
            topic_ratings: {},
            recent_trend: 'stable',
            last_updated: Date.now()
          },
          pros: generatePros(college),
          cons: generateCons(college),
          trending: false,
          highly_rated: false,
          recent_feedback: 'none'
        });
      }
    }
    
    // Sort by match score
    recommendations.sort((a, b) => b.match_score - a.match_score);
    
    return recommendations.slice(0, maxResults);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Fetch colleges eligible based on cutoffs
 */
async function fetchEligibleColleges(
  db: Firestore,
  preferences: StudentPreferences
): Promise<College[]> {
  try {
    const collegesRef = collection(db, 'colleges');
    
    // Query based on preferences
    let q = query(collegesRef);
    
    // Filter by location if specified
    if (preferences.location_preferences.length > 0) {
      q = query(q, where('state', 'in', preferences.location_preferences));
    }
    
    // Filter by college type
    if (preferences.college_type_preferences.length > 0) {
      q = query(q, where('type', 'in', preferences.college_type_preferences));
    }
    
    const snapshot = await getDocs(q);
    const colleges: College[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const college: College = {
        id: doc.id,
        name: data.name,
        location: data.location,
        city: data.city,
        state: data.state,
        type: data.type,
        affiliation: data.affiliation,
        established: data.established,
        courses: data.courses || [],
        cutoffs: data.cutoffs || {},
        nirf_rank: data.nirf_rank,
        autonomous: data.autonomous || false,
        placement_stats: data.placement_stats,
        facilities: data.facilities || [],
        website: data.website,
        logo_url: data.logo_url
      };
      
      // Check if student's score meets any branch cutoff
      const examCutoffs = college.cutoffs[preferences.exam_type];
      if (examCutoffs) {
        const meetsAnyCutoff = preferences.branch_preferences.some(branch => {
          const cutoff = examCutoffs[branch];
          return cutoff && preferences.score >= cutoff * 0.8; // 80% of cutoff
        });
        
        if (meetsAnyCutoff) {
          colleges.push(college);
        }
      }
    });
    
    return colleges;
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }
}

/**
 * Calculate match score (0-100)
 */
function calculateMatchScore(
  college: College,
  preferences: StudentPreferences
): number {
  let score = 0;
  let maxScore = 0;
  
  // Location match (25 points)
  maxScore += 25;
  if (preferences.location_preferences.includes(college.state)) {
    score += 25;
  } else if (preferences.location_preferences.length === 0) {
    score += 15; // Partial credit if no preference
  }
  
  // College type match (15 points)
  maxScore += 15;
  if (preferences.college_type_preferences.includes(college.type)) {
    score += 15;
  } else if (preferences.college_type_preferences.length === 0) {
    score += 10;
  }
  
  // Branch availability (20 points)
  maxScore += 20;
  const availableBranches = preferences.branch_preferences.filter(branch =>
    college.courses.some(course => course.includes(branch))
  );
  score += (availableBranches.length / preferences.branch_preferences.length) * 20;
  
  // Placement stats (20 points)
  maxScore += 20;
  if (college.placement_stats) {
    const placementScore = Math.min(college.placement_stats.placement_percentage, 100);
    score += (placementScore / 100) * 20;
  }
  
  // NIRF ranking (10 points)
  maxScore += 10;
  if (college.nirf_rank) {
    if (college.nirf_rank <= 50) score += 10;
    else if (college.nirf_rank <= 100) score += 8;
    else if (college.nirf_rank <= 200) score += 5;
    else score += 2;
  }
  
  // Autonomous status (5 points)
  maxScore += 5;
  if (college.autonomous) score += 5;
  
  // Facilities (5 points)
  maxScore += 5;
  score += Math.min((college.facilities.length / 10) * 5, 5);
  
  return Math.round((score / maxScore) * 100);
}

/**
 * Calculate admission chance (0-100)
 */
function calculateAdmissionChance(
  college: College,
  examType: ExamType,
  score: number,
  preferredBranch: string
): number {
  const examCutoffs = college.cutoffs[examType];
  if (!examCutoffs) return 0;
  
  const cutoff = examCutoffs[preferredBranch];
  if (!cutoff) return 0;
  
  // Calculate based on how much above cutoff
  const difference = score - cutoff;
  const percentAboveCutoff = (difference / cutoff) * 100;
  
  if (percentAboveCutoff >= 20) return 95; // Way above cutoff
  if (percentAboveCutoff >= 10) return 85;
  if (percentAboveCutoff >= 5) return 75;
  if (percentAboveCutoff >= 0) return 60;
  if (percentAboveCutoff >= -5) return 45;
  if (percentAboveCutoff >= -10) return 30;
  if (percentAboveCutoff >= -20) return 15;
  
  return 5; // Below cutoff
}

/**
 * Generate recommendation reasons
 */
function generateReasons(
  college: College,
  preferences: StudentPreferences,
  matchScore: number
): string[] {
  const reasons: string[] = [];
  
  if (matchScore >= 80) {
    reasons.push('Excellent match for your preferences');
  }
  
  if (preferences.location_preferences.includes(college.state)) {
    reasons.push(`Located in your preferred state: ${college.state}`);
  }
  
  if (college.nirf_rank && college.nirf_rank <= 100) {
    reasons.push(`NIRF Ranked #${college.nirf_rank}`);
  }
  
  if (college.placement_stats && college.placement_stats.placement_percentage >= 80) {
    reasons.push(`High placement rate: ${college.placement_stats.placement_percentage}%`);
  }
  
  if (college.type === 'Government') {
    reasons.push('Government institution with lower fees');
  }
  
  if (college.autonomous) {
    reasons.push('Autonomous college with flexible curriculum');
  }
  
  const branchMatch = preferences.branch_preferences.filter(branch =>
    college.courses.some(course => course.includes(branch))
  );
  if (branchMatch.length > 0) {
    reasons.push(`Offers your preferred branches: ${branchMatch.slice(0, 2).join(', ')}`);
  }
  
  return reasons;
}

/**
 * Generate pros
 */
function generatePros(college: College): string[] {
  const pros: string[] = [];
  
  if (college.placement_stats) {
    pros.push(`Average package: ₹${college.placement_stats.average_package} LPA`);
  }
  
  if (college.nirf_rank) {
    pros.push(`NIRF Rank: ${college.nirf_rank}`);
  }
  
  if (college.type === 'Government') {
    pros.push('Affordable government fees');
  }
  
  if (college.autonomous) {
    pros.push('Autonomous status');
  }
  
  if (college.facilities.length > 0) {
    pros.push(`Facilities: ${college.facilities.slice(0, 3).join(', ')}`);
  }
  
  return pros;
}

/**
 * Generate cons
 */
function generateCons(college: College): string[] {
  const cons: string[] = [];
  
  if (college.type === 'Private' && !college.placement_stats?.placement_percentage) {
    cons.push('Limited placement data available');
  }
  
  if (!college.nirf_rank || college.nirf_rank > 200) {
    cons.push('Lower NIRF ranking');
  }
  
  if (!college.autonomous) {
    cons.push('Not autonomous - fixed curriculum');
  }
  
  if (college.facilities.length < 5) {
    cons.push('Limited campus facilities');
  }
  
  return cons;
}

/**
 * Compare multiple colleges
 */
export function compareColleges(colleges: College[]): any {
  const comparison = {
    colleges,
    comparison_metrics: {
      cutoffs: {} as Record<string, number[]>,
      placements: {} as Record<string, number[]>,
      fees: [] as number[],
      nirf_ranks: [] as (number | null)[],
      review_scores: [] as number[]
    },
    winner_by_metric: {} as Record<string, string>
  };
  
  // Populate comparison data
  colleges.forEach(college => {
    comparison.comparison_metrics.nirf_ranks.push(college.nirf_rank || null);
    
    if (college.placement_stats) {
      if (!comparison.comparison_metrics.placements['average']) {
        comparison.comparison_metrics.placements['average'] = [];
      }
      comparison.comparison_metrics.placements['average'].push(
        college.placement_stats.average_package
      );
    }
  });
  
  // Determine winners
  const bestNIRF = colleges.reduce((best, college) => {
    if (!best.nirf_rank) return college;
    if (!college.nirf_rank) return best;
    return college.nirf_rank < best.nirf_rank ? college : best;
  }, colleges[0]);
  comparison.winner_by_metric['NIRF Rank'] = bestNIRF.id;
  
  return comparison;
}

/**
 * Community & College Recommendation Types
 */

// Exam Types
export type ExamType = 'JEE' | 'KCET' | 'COMEDK' | 'NEET' | 'CET' | 'GATE' | 'CAT';

// Branch/Stream Types
export type BranchType = 
  | 'Computer Science' 
  | 'Information Technology'
  | 'Electronics & Communication'
  | 'Mechanical'
  | 'Civil'
  | 'Electrical'
  | 'Chemical'
  | 'Biotechnology'
  | 'Aerospace'
  | 'Medicine'
  | 'Pharmacy'
  | 'Management'
  | 'Other';

// College Type
export interface College {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  type: 'Government' | 'Private' | 'Autonomous' | 'Deemed';
  affiliation: string;
  established: number;
  courses: string[];
  cutoffs: Record<ExamType, Record<string, number>>; // exam -> branch -> cutoff
  nirf_rank?: number;
  autonomous: boolean;
  placement_stats?: PlacementStats;
  facilities: string[];
  website?: string;
  logo_url?: string;
}

export interface PlacementStats {
  highest_package: number;
  average_package: number;
  median_package: number;
  placement_percentage: number;
  top_recruiters: string[];
  year: number;
}

// Student Preferences
export interface StudentPreferences {
  exam_type: ExamType;
  score: number;
  rank?: number;
  branch_preferences: BranchType[];
  location_preferences: string[];
  college_type_preferences: ('Government' | 'Private' | 'Autonomous' | 'Deemed')[];
  min_placement_percentage?: number;
  max_fees?: number;
  campus_preference?: 'Urban' | 'Suburban' | 'Rural' | 'Any';
}

// Reddit Review
export interface RedditReview {
  id: string;
  college_id: string;
  college_name: string;
  post_id: string;
  post_title: string;
  post_url: string;
  author: string;
  content: string;
  created_utc: number;
  score: number; // upvotes
  num_comments: number;
  subreddit: string;
  flair?: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topics: string[]; // ['placements', 'faculty', 'infrastructure', etc.]
  batch_year?: number;
  course?: string;
  verified?: boolean;
}

// Review Summary
export interface ReviewSummary {
  college_id: string;
  total_reviews: number;
  average_sentiment: number; // -1 to 1
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
  };
  topic_ratings: Record<string, TopicRating>;
  recent_trend: 'improving' | 'declining' | 'stable';
  last_updated: number;
}

export interface TopicRating {
  topic: string;
  average_rating: number; // 0-5
  mention_count: number;
  recent_mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  key_points: string[];
}

// College Recommendation
export interface CollegeRecommendation {
  college: College;
  match_score: number; // 0-100
  predicted_admission_chance: number; // 0-100
  reasons: string[];
  review_summary: ReviewSummary;
  pros: string[];
  cons: string[];
  trending: boolean;
  highly_rated: boolean;
  recent_feedback: 'positive' | 'negative' | 'mixed' | 'none';
}

// Review Filters
export interface ReviewFilters {
  batch_years?: number[];
  courses?: string[];
  topics?: string[];
  sentiment?: ('positive' | 'negative' | 'neutral' | 'mixed')[];
  min_score?: number;
  verified_only?: boolean;
}

// Bookmarked College
export interface BookmarkedCollege {
  college_id: string;
  college_name: string;
  added_at: number;
  notes?: string;
  tags?: string[];
}

// College Comparison
export interface CollegeComparison {
  colleges: College[];
  comparison_metrics: {
    cutoffs: Record<string, number[]>;
    placements: Record<string, number[]>;
    fees: number[];
    nirf_ranks: (number | null)[];
    review_scores: number[];
  };
  winner_by_metric: Record<string, string>; // metric -> college_id
}

// AMA Request
export interface AMARequest {
  id: string;
  college_id: string;
  college_name: string;
  question: string;
  asker_id: string;
  created_at: number;
  status: 'pending' | 'answered' | 'expired';
  answers?: AMAAnswer[];
  upvotes: number;
}

export interface AMAAnswer {
  id: string;
  answerer_id: string;
  answerer_batch: string;
  answerer_course: string;
  content: string;
  created_at: number;
  upvotes: number;
  verified: boolean;
}

// Alert
export interface CollegeAlert {
  id: string;
  college_id: string;
  college_name: string;
  type: 'positive_feedback' | 'negative_feedback' | 'trending' | 'cutoff_change' | 'placement_update';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  created_at: number;
  read: boolean;
}

// Search History
export interface SearchHistory {
  id: string;
  user_id: string;
  preferences: StudentPreferences;
  recommendations: string[]; // college IDs
  created_at: number;
}

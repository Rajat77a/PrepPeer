export interface DimensionScore {
  label: string;
  value: number;
  max?: number;
  color?: string;
  reason?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  subtitle?: string;
  role?: string;
  companyType?: string;
  score: number;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  isYou?: boolean;
  sessions?: number;
  trend?: "up" | "down" | "flat";
  source?: "demo" | "real";
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  badge: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline?: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
}

export interface FeatureBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface SessionHistoryItem {
  id: string;
  date: string;
  role: string;
  companyType: string;
  score: number;
}

export interface ScoreTrendPoint {
  session: string;
  score: number;
}

export interface InterviewQuestion {
  id: number;
  text: string;
}

export interface QuestionScore {
  question: string;
  score: number;
}

export type QuestionReviewStatus =
  | "answered"
  | "ai"
  | "gibberish"
  | "skipped"
  | "autoSkipped";

export interface QuestionReview {
  question: string;
  prompt: string;
  answer?: string;
  score: number;
  status: QuestionReviewStatus;
  summary?: string;
  improvement?: string;
  reason?: string;
  modelAnswer?: string;
  evaluationToken?: string;
  detectionToken?: string;
}

export interface AISessionSummary {
  completionReason: "completed" | "autoSubmitted";
  overallSummary: string;
  needsImprovement: string[];
  strongestPart?: string;
  weakestPart?: string;
  keyTakeaways?: string[];
  questionReviews: QuestionReview[];
}

export interface SessionReport {
  name: string;
  role: string;
  companyType: string;
  source?: "account" | "demo";
  compositeScore: number;
  percentile: string;
  rankDelta: string;
  previousRank: number;
  currentRank: number;
  totalCandidates: number;
  dimensions: DimensionScore[];
  questionScores: QuestionScore[];
  summary?: AISessionSummary;
}

export interface FeedbackData {
  compositeScore: number;
  dimensions: DimensionScore[];
  modelAnswer: string;
}

export type RoleFilter = "SDE Fresher" | "SDE Experienced" | "MBA Finance";
export type CompanyFilter = "Product Company" | "Service Company" | "Startup";
export type TimeFilter = "This week" | "This month" | "All time";

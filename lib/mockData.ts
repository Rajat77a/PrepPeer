import type {
  DimensionScore,
  FeedbackData,
  HowItWorksStep,
  LeaderboardEntry,
  PricingPlan,
  SessionHistoryItem,
  SessionReport,
  ScoreTrendPoint,
  Testimonial,
} from "./types";

export const NAV_LINKS = [
  { label: "Home", href: "#home", sectionId: "home" },
  { label: "How it works", href: "#how-it-works", sectionId: "how-it-works" },
  { label: "Features", href: "#features", sectionId: "features" },
  {
    label: "Leaderboard",
    href: "#leaderboard-preview",
    sectionId: "leaderboard-preview",
  },
  {
    label: "In action",
    href: "#see-it-in-action",
    sectionId: "see-it-in-action",
  },
];

export const LANDING_SECTION_IDS = [
  "home",
  "how-it-works",
  "features",
  "leaderboard-preview",
  "scorecard",
  "testimonials",
  "see-it-in-action",
];

export const TRUSTED_LOGOS = [
  { name: "ZenZan", icon: "Z" },
  { name: "Sparkle", icon: "S" },
  { name: "Craftgram", icon: "C" },
  { name: "Pulse", icon: "P" },
  { name: "Swift", icon: "W" },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: 1,
    title: "Pick your profile",
    description:
      "Select your job role, experience level, and company type. PrepPeer tailors every question to your exact target.",
    tags: ["SDE", "MBA", "Consulting", "Company type"],
    image:
      "https://images.unsplash.com/photo-1521737852567-6949f5f9f2b2?w=440&h=280&fit=crop",
  },
  {
    number: 2,
    title: "AI interviews you",
    description:
      "Claude asks 5 real interview questions — behavioral, technical, situational — calibrated to your company type.",
    tags: ["Behavioral", "Technical", "Timed flow"],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=440&h=280&fit=crop",
  },
  {
    number: 3,
    title: "Get instant scoring",
    description:
      "Every answer is rated on Communication, Problem Solving, Specificity, and Confidence. With a model answer.",
    tags: ["4 dimensions", "Model answers", "Instant feedback"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=440&h=280&fit=crop",
  },
  {
    number: 4,
    title: "See your rank",
    description:
      "Your score is benchmarked against thousands of real candidates. See your percentile. See your rank move.",
    tags: ["Live leaderboard", "Percentile", "Rank delta"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=440&h=280&fit=crop",
  },
];

export const FEATURE_DIMENSIONS: DimensionScore[] = [
  { label: "Communication", value: 8.2 },
  { label: "Problem Solving", value: 6.5 },
  { label: "Specificity", value: 5.0 },
  { label: "Confidence", value: 7.4 },
];

export const MINI_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Arjun S.", score: 94, delta: "Top 3%", deltaType: "up" },
  { rank: 2, name: "Priya M.", score: 89 },
  {
    rank: 41,
    name: "You",
    score: 72,
    delta: "↑ from #67",
    deltaType: "up",
    isYou: true,
  },
  { rank: 42, name: "Karthik R.", score: 71 },
];

export const LEADERBOARD_PREVIEW: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Arjun S.",
    subtitle: "SDE Fresher",
    score: 94,
    delta: "↑ +5",
    deltaType: "up",
  },
  {
    rank: 2,
    name: "Priya M.",
    subtitle: "SDE Fresher",
    score: 89,
  },
  {
    rank: 15,
    name: "Sneha K.",
    subtitle: "SDE Fresher",
    score: 85,
    delta: "↑ +8",
    deltaType: "up",
  },
  {
    rank: 41,
    name: "You",
    subtitle: "SDE Fresher",
    score: 72,
    delta: "↑ +26 this session",
    deltaType: "up",
    isYou: true,
  },
  {
    rank: 42,
    name: "Karthik R.",
    subtitle: "SDE Fresher",
    score: 71,
    delta: "↓ -3",
    deltaType: "down",
  },
];

export const LEADERBOARD_STATS = [
  { value: "347", label: "SDE Freshers ranked" },
  { value: "Top 23%", label: "where most users land after 3 sessions" },
  { value: "2.4×", label: "rank improvement after 5 sessions" },
  { value: "4.8★", label: "average user satisfaction" },
];

export const SESSION_REPORT: SessionReport = {
  name: "Rahul D.",
  role: "Software Engineering",
  companyType: "Fresher · Product Company",
  compositeScore: 72,
  percentile: "Top 23%",
  rankDelta: "↑ Moved from #67 to #41",
  previousRank: 67,
  currentRank: 41,
  totalCandidates: 347,
  dimensions: [
    { label: "Communication", value: 8.2, color: "#0084FF" },
    { label: "Problem Solving", value: 6.5, color: "#319AFF" },
    { label: "Specificity", value: 5.0, color: "#FF6B3D" },
    { label: "Confidence", value: 7.4, color: "#0084FF" },
  ],
  questionScores: [
    { question: "Q1", score: 68 },
    { question: "Q2", score: 72 },
    { question: "Q3", score: 65 },
    { question: "Q4", score: 78 },
    { question: "Q5", score: 75 },
  ],
};

export const SCORECARD_BENEFITS = [
  {
    icon: "BarChart3",
    title: "Four-dimension scoring",
    description:
      "Not a single number. Communication, Problem Solving, Specificity, and Confidence — each scored separately with a one-line reason.",
  },
  {
    icon: "TrendingUp",
    title: "Weakness report",
    description:
      "See exactly which dimension drags your score down. PrepPeer identifies patterns across all 5 answers and tells you what to fix.",
  },
  {
    icon: "Share2",
    title: "One-tap share card",
    description:
      "Your rank and percentile on a public link. Built for LinkedIn previews and WhatsApp. Every share brings more benchmark data.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "I'd failed 3 interviews and had no idea why. PrepPeer told me my Specificity score was 4.2 — I never used concrete examples. Two weeks later I cleared Flipkart.",
    author: "Rahul S.",
    role: "B.Tech CSE, VIT",
    initials: "RS",
    avatarBg: "rgba(0,132,255,0.1)",
    avatarColor: "#0C447C",
    badge: "↑ #23 → #4 after 6 sessions",
  },
  {
    id: "2",
    quote:
      "The leaderboard is addictive. Seeing my rank move from #134 to #28 after practicing every day kept me going. Got my Deloitte offer last month.",
    author: "Priya M.",
    role: "MBA Finance, NMIMS",
    initials: "PM",
    avatarBg: "rgba(0,200,150,0.1)",
    avatarColor: "#00705A",
    badge: "↑ Top 8% this week",
  },
  {
    id: "3",
    quote:
      "Other apps give you generic feedback. PrepPeer told me my Confidence score drops on behavioral questions. Fixed it, cracked the Amazon L4 interview.",
    author: "Arjun K.",
    role: "SDE 2yr exp",
    initials: "AK",
    avatarBg: "rgba(255,190,61,0.1)",
    avatarColor: "#633806",
    badge: "↑ #41 → #1 SDE rank",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "No credit card · start in 2 minutes",
    tagline: "Enough to know if PrepPeer fits your prep style.",
    features: [
      "3 full mock interviews every month",
      "5 questions per session with timed flow",
      "Scores on Clarity, Structure, Confidence & Depth",
      "Your live rank vs SDE peers on the board",
      "Session recap highlighting what to fix next",
      "Upgrade anytime — your history stays saved",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    period: "Monthly · cancel when you land the offer",
    tagline: "For serious candidates who want daily reps and rank momentum.",
    featured: true,
    features: [
      "Unlimited mocks — practice until you're ready",
      "10 questions per session + model answers",
      "Weakness heatmap by question type",
      "Week-over-week rank delta tracking",
      "Shareable score card for LinkedIn & recruiters",
      "Priority AI feedback (faster turnaround)",
      "Early access to new company interview packs",
    ],
    cta: "Get Pro",
  },
  {
    id: "college",
    name: "College",
    price: "Custom",
    period: "Volume pricing for institutes",
    tagline: "Placement cells use this to see who's actually interview-ready.",
    features: [
      "Everything in Pro for every enrolled student",
      "Batch readiness dashboard for TPOs",
      "Bulk onboarding via college email domain",
      "Export shortlists ranked by interview score",
      "Custom packs: Amazon, Deloitte, consulting, etc.",
      "Dedicated onboarding call for your team",
    ],
    cta: "Contact us",
  },
];

export const FULL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Arjun S.", subtitle: "SDE Fresher", score: 94, sessions: 18, delta: "↑ +5", deltaType: "up", trend: "up" },
  { rank: 2, name: "Priya M.", subtitle: "SDE Fresher", score: 89, sessions: 15, delta: "↑ +2", deltaType: "up", trend: "up" },
  { rank: 3, name: "Sneha K.", subtitle: "SDE Fresher", score: 85, sessions: 12, delta: "↑ +8", deltaType: "up", trend: "up" },
  { rank: 4, name: "Vikram P.", subtitle: "SDE Fresher", score: 83, sessions: 10, trend: "flat" },
  { rank: 5, name: "Ananya R.", subtitle: "SDE Fresher", score: 81, sessions: 9, delta: "↓ -1", deltaType: "down", trend: "down" },
  { rank: 15, name: "Rohan T.", subtitle: "SDE Fresher", score: 76, sessions: 7, delta: "↑ +4", deltaType: "up", trend: "up" },
  { rank: 28, name: "Meera L.", subtitle: "SDE Fresher", score: 74, sessions: 6, trend: "up" },
  {
    rank: 41,
    name: "You",
    subtitle: "SDE Fresher",
    score: 72,
    sessions: 12,
    delta: "↑ +26",
    deltaType: "up",
    isYou: true,
    trend: "up",
  },
  { rank: 42, name: "Karthik R.", subtitle: "SDE Fresher", score: 71, sessions: 8, delta: "↓ -3", deltaType: "down", trend: "down" },
  { rank: 43, name: "Divya N.", subtitle: "SDE Fresher", score: 70, sessions: 5, trend: "flat" },
];

export const SCORE_TREND: ScoreTrendPoint[] = [
  { session: "S1", score: 52 },
  { session: "S2", score: 58 },
  { session: "S3", score: 61 },
  { session: "S4", score: 64 },
  { session: "S5", score: 68 },
  { session: "S6", score: 72 },
];

export const SESSION_HISTORY: SessionHistoryItem[] = [
  { id: "1", date: "May 18, 2026", role: "SDE Fresher", companyType: "Product Company", score: 72 },
  { id: "2", date: "May 15, 2026", role: "SDE Fresher", companyType: "Product Company", score: 68 },
  { id: "3", date: "May 12, 2026", role: "SDE Fresher", companyType: "Startup", score: 64 },
  { id: "4", date: "May 8, 2026", role: "SDE Fresher", companyType: "Product Company", score: 61 },
  { id: "5", date: "May 4, 2026", role: "SDE Fresher", companyType: "Service Company", score: 58 },
];

export const MOCK_FEEDBACK: FeedbackData = {
  compositeScore: 72,
  dimensions: [
    {
      label: "Communication",
      value: 8.2,
      reason:
        "Your answer was clear and structured but lacked a specific example with measurable outcome.",
    },
    {
      label: "Problem Solving",
      value: 6.5,
      reason: "You identified the problem well but didn't walk through your decision framework step by step.",
    },
    {
      label: "Specificity",
      value: 5.0,
      reason: "No concrete metrics, timeline, or team size mentioned — interviewers need specifics.",
    },
    {
      label: "Confidence",
      value: 7.4,
      reason: "Tone was assertive; closing could be stronger with a clear takeaway.",
    },
  ],
  modelAnswer:
    "In my final-year project, our API was failing under load with only two days before demo day. I didn't have full logs, so I set up quick profiling, identified a N+1 query pattern, and proposed a caching layer. I paired with a teammate to implement it — we cut response time from 2.1s to 180ms and shipped on time. I learned to make decisions with incomplete data by defining a 30-minute investigation window first.",
};

export const INTERVIEW_QUESTION =
  "Tell me about a time you had to solve a problem with incomplete information. What was your approach?";

// ─── Auth ───────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  college?: string;
  branch?: string;
  year?: number;
  cgpa?: number;
  skills?: string[];
}

// ─── Score ──────────────────────────────────────────────────────────────────
export type ReadinessLevel = 'Not Ready' | 'Almost Ready' | 'Ready to Apply';

export interface ScoreBreakdown {
  resume: number;
  skills: number;
  interview: number;
  academics?: number;
}

export interface ReadinessScore {
  readiness: number;
  level: string;
  resumeScore?: number;
  academicScore?: number;
  interviewScore?: number;
  recommendation?: string;
  calculatedAt?: string;
  breakdown?: ScoreBreakdown;
}

// ─── Analytics ──────────────────────────────────────────────────────────────
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Subject {
  name: string;
  score: number;
  maxScore: number;
  credits?: number;
}

export interface Analytics {
  risk: RiskLevel;
  readiness: number;
  resumeScore: number;
  interviewScore: number;
  averageInterviewScore: number;
  totalAttempts: number;
  weakSkills: string[];
  latestRecommendation?: string;
  progressHistory: { date: string; score: number }[];
  interviewHistory: { date: string; score: number }[];
}

// ─── Interview ───────────────────────────────────────────────────────────────
export type InterviewStatus = 'idle' | 'starting' | 'active' | 'paused' | 'ended';

export interface LiveMetrics {
  confidence: number;
  accuracy: number;
  fluency?: number;
  hint?: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'system-design';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewResult {
  id: string;
  date: string;
  role: string;
  scores: {
    technical: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  mistakes: { question: string; feedback: string }[];
  suggestions: string[];
  duration: number;
}

// ─── RAG & Semantic Similarity Types ─────────────────────────────────────────
export interface InterviewAnswerResult {
  score: number;              // Combined score
  llm_score?: number;         // LLM evaluation
  semantic_score?: number;    // Semantic similarity
  feedback: {
    good: string;
    missing: string;
    ideal: string;
    tip: string;
  };
  topic: string;
  difficulty: string;
}

export interface PersonalizedQuestionData {
  question: string;
  topic: string;
  difficulty: string;
  ideal_answer?: string;
  personalized?: boolean;           // Is this question personalized?
  resume_reference?: string;        // What resume section was referenced
}

export interface RAGResumeData {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  score: number;
  embeddings?: Record<string, number[]>;
}

export interface ResumeParsingStatus {
  status: 'idle' | 'uploading' | 'parsing' | 'generating_embeddings' | 'complete' | 'error';
  progress: number;
  message: string;
  data?: RAGResumeData;
  error?: string;
}

// ─── Interview V3 Types ──────────────────────────────────────────────────────
export type InterviewMode = 'RESUME_BASED' | 'COMPANY_SPECIFIC' | 'ROLE_BASED' | 'BRANCH_BASED' | 'TIME_BASED';
export type InterviewDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'FAANG';
export type InterviewPersona = 'FRIENDLY_HR' | 'STRICT_TECHNICAL' | 'STARTUP_FOUNDER' | 'FAANG_INTERVIEWER' | 'SENIOR_ARCHITECT';
export type RoundType = 'TECHNICAL' | 'HR' | 'BEHAVIORAL';
export type EyeContact = 'GOOD' | 'AVERAGE' | 'POOR';
export type Posture = 'STABLE' | 'UNSTABLE';
export type HiringVerdict = 'STRONG_HIRE' | 'CONSIDER' | 'REJECT';

export interface InterviewV3Config {
  companies: string[];
  roles: string[];
  branches: string[];
  difficulties: InterviewDifficulty[];
  personas: InterviewPersona[];
  durations: number[];
}

export interface InterviewV3Question {
  question: string;
  topic: string;
  difficulty: string;
  ideal?: string;
  source: string;
  company?: string;
  branch?: string;
}

export interface InterviewV3Session {
  id: number;
  userId: number;
  interviewMode: InterviewMode;
  company?: string;
  role?: string;
  branch?: string;
  duration?: number;
  difficulty: InterviewDifficulty;
  persona: InterviewPersona;
  roundType?: RoundType;
  status: string;
  questions: InterviewV3Question[];
  answers: Array<{
    questionIndex: number;
    question: string;
    answer: string;
    timeTakenSeconds: number;
    score: number;
    topic: string;
    difficulty: string;
    feedback: {
      good: string;
      missing: string;
      ideal: string;
      tip: string;
    };
  }>;
  totalScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt: string;
  completedAt?: string;
}

export interface FacialAnalytics {
  confidenceScore: number;
  eyeContact: EyeContact;
  emotion: string;
  posture: Posture;
  voiceClarity: number;
  timestamp: string;
}

export interface InterviewV3Report {
  interview: InterviewV3Session;
  finalScore: number;
  finalVerdict: HiringVerdict;
  performanceBreakdown: {
    communication: number;
    technical: number;
    confidence: number;
    eyeContact: number;
    problemSolving: number;
    clarity: number;
  };
  companyReadiness: {
    [company: string]: number;
  };
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
  facialAnalytics?: FacialAnalytics[];
  speechAnalytics?: {
    wordsPerMinute: number;
    fillerWords: number;
    pauseDuration: number;
    clarity: number;
  };
  starCompliance?: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
    score: number;
  };
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export interface Job {
  id: number;
  company: string;
  role: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Part-time' | 'Contract';
  match: number;
  minScore: number;
  salary?: string;
  skills: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  matchReason?: string;
  nextStep?: string;
  readinessLevel?: string;
  logo?: string;
  url: string;
  applyLink?: string;
  deadline?: string;
  isRecommended: boolean;
  experienceLevel?: string;
  description?: string;
  mode?: string;
}

// ─── Government Jobs ─────────────────────────────────────────────────────────
export type GovernmentJobCategory = 'CENTRAL_GOVT' | 'STATE_GOVT' | 'PSU' | 'BANKING' | 'RAILWAY' | 'DEFENCE';
export type EligibilityStatus = 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';

export interface GovernmentJob {
  id: number;
  code: string;
  title: string;
  organization: string;
  category: GovernmentJobCategory;
  eligibleBranches: string[];
  minCgpa?: number;
  examName?: string;
  applicationLink: string;
  examCycle?: string;
  salary?: string;
  eligibility?: string;
  tags?: string[];
  active: boolean;
}

export interface GovernmentJobRecommendation {
  job: GovernmentJob;
  matchScore: number;
  eligibilityStatus: EligibilityStatus;
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────
export interface RoadmapTask {
  id: string;
  week: number;
  task: string;
  description?: string;
  completed: boolean;
  category: 'skill' | 'project' | 'interview' | 'apply';
  resources?: { title: string; url: string }[];
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  cgpa: number;
  readiness: number;
  risk: RiskLevel;
  lastActive: string;
  interviewScore?: number;
}

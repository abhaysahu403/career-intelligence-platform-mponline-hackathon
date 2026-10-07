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
export type InterviewMode = 'RESUME_BASED' | 'COMPANY_SPECIFIC' | 'ROLE_BASED' | 'BRANCH_BASED' | 'TIME_BASED' | 'GOVERNMENT';
export type InterviewDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'FAANG';
export type InterviewPersona = 'FRIENDLY_HR' | 'STRICT_TECHNICAL' | 'STARTUP_FOUNDER' | 'FAANG_INTERVIEWER' | 'SENIOR_ARCHITECT';
export type RoundType = 'TECHNICAL' | 'HR_BEHAVIORAL' | 'GOVERNMENT';
export type GovernmentExamType = 'SSB' | 'UPSC' | 'BANK_PO' | 'SSC_RAILWAY' | 'RESEARCH_ORG';
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
  governmentExamTypes: GovernmentExamType[];
}

export interface InterviewV3Question {
  question: string;
  topic: string;
  difficulty: string;
  ideal?: string;
  source: string;
  company?: string;
  branch?: string;
  governmentExamType?: string;
}

export interface InterviewV3Session {
  id: number;
  userId: number;
  interviewMode: InterviewMode;
  company?: string;
  role?: string;
  governmentExamType?: GovernmentExamType;
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

// ─── Courses ─────────────────────────────────────────────────────────────────
export type CoursePlatformType = 'GOVERNMENT' | 'INTERNATIONAL' | 'INDIAN' | 'PAID';
export type CourseProgressStatus = 'SAVED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Course {
  id: number;
  code: string;
  title: string;
  platform: string;
  platformType: CoursePlatformType;
  url: string;
  skillsCovered: string[];
  branches: string[];
  durationWeeks?: number;
  cost: string;
  certification: boolean;
  certificationBody?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  rating?: number;
  governmentRecognized: boolean;
  tags?: string[];
  active: boolean;
}

export interface CourseRecommendationEntry {
  course: Course;
  matchedSkillsCount: number;
  matchScore: number;
}

export interface CourseRecommendations {
  startThisWeek: CourseRecommendationEntry[];
  nextMonth: CourseRecommendationEntry[];
  longTerm: CourseRecommendationEntry[];
  learningPathWeeks: number;
  currentReadiness: number;
  estimatedReadinessAfter: number;
}

export interface UserCourseProgress {
  id: number;
  userId: number;
  courseId: number;
  status: CourseProgressStatus;
  savedAt: string;
  updatedAt?: string;
}

// ─── Academic Profile ─────────────────────────────────────────────────────────
export interface AcademicProfile {
  userId: number;
  collegeName?: string;
  branch?: string;
  yearOfStudy?: number;
  graduationYear?: number;
  currentCgpa?: number;
  tenthPercentage?: number;
  tenthBoard?: string;
  twelfthPercentage?: number;
  twelfthStream?: string;
  activeBacklogs?: number;
  gapYear?: boolean;
  internshipsCount?: number;
  hackathonWins?: number;
  targetRoleType?: string;
  willingToRelocate?: boolean;
  academicScore: number;
  experienceScore: number;
}

export interface AcademicProfileCompleteness {
  completenessPercent: number;
  filledFields: number;
  totalFields: number;
  message: string;
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

// ─── Campus to Corporate ────────────────────────────────────────────────────────
export type CareerTargetType = 'PRIVATE_TECH' | 'GOVERNMENT' | 'PSU' | 'BANKING' | 'DEFENCE' | 'HIGHER_STUDIES' | 'ENTREPRENEURSHIP';

export interface CareerTarget {
  id: number;
  targetCode: string;
  name: string;
  targetType: CareerTargetType;
  minCgpa?: number;
  requiredSkills: string[];
  preferredSkills?: string[];
  interviewRounds?: number;
  avgPackageLpa?: number;
  hiringMonths?: string[];
  readinessRequired: number;
  preparationWeeks: number;
  active: boolean;
}

export interface SkillGapEntry {
  skill: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  required: boolean;
}

export interface ActionPlanMilestone {
  index: number;
  phase: string;
  title: string;
  description?: string;
  courseUrl?: string;
  completed: boolean;
}

export interface CampusToCorporateAnalysis {
  currentProfile: {
    branch?: string;
    cgpa?: number;
    yearOfStudy?: number;
    activeBacklogs?: number;
    skills: string[];
    readiness: number;
    technicalScore?: number;
    communicationScore?: number;
    domainScore?: number;
  };
  targetRequirements: {
    targetCode: string;
    name: string;
    type: CareerTargetType;
    minCgpa?: number;
    cgpaMet: boolean;
    requiredSkills: string[];
    preferredSkills?: string[];
    interviewRounds?: number;
    avgPackageLpa?: number;
    hiringMonths?: string[];
    readinessRequired: number;
  };
  gapAnalysis: SkillGapEntry[];
  gapPoints: number;
  actionPlan: ActionPlanMilestone[];
  readinessPercentage: number;
  estimatedDaysToReady: number;
  matchingJobsCount: number;
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

export interface BranchStat {
  branch: string;
  studentCount: number;
  avgReadiness: number;
  jobReadyCount: number;
  atRiskCount: number;
}

export interface CareerTrackListing {
  company: string;
  role: string;
  sourceUrl: string;
}

export interface CareerTrack {
  code: string;
  label: string;
  confidence?: number;
  reasoning: string;
  openPositions?: number;
  avgSalaryLpa?: number | null;
  sampleListings?: CareerTrackListing[];
}

export interface InstitutionOverview {
  totalStudents: number;
  avgReadiness: number;
  jobReadyCount: number;
  atRiskCount: number;
  branchStats: BranchStat[];
  atRiskStudents: StudentRecord[];
}

export interface SkillDemand {
  skill: string;
  demandCount: number;
  demandPct: number;
  studentsWithSkill: number;
  coveragePct: number;
  status: RiskLevel; // here HIGH means a high skill gap (low coverage), not high readiness
}

export interface SkillGapOverview {
  totalActiveJobs: number;
  totalStudents: number;
  topDemandedSkills: SkillDemand[];
  criticalGaps: SkillDemand[];
}

// ─── Resume Builder ─────────────────────────────────────────────────────────────
export type ResumeTemplateId = 'CLEAN_PROFESSIONAL' | 'MODERN_TECH' | 'EXECUTIVE';

export interface ResumeProjectInput {
  name: string;
  techStack: string;
  description: string;
  githubLink?: string;
}

export interface ResumeInternshipInput {
  company: string;
  duration: string;
  role: string;
  bullets: string[];
}

export interface ResumeHeader {
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  branch?: string;
  college?: string;
  cgpa?: number;
}

export interface ResumeEducationEntry {
  level: string;
  institution: string;
  score: string;
  year: string;
}

export interface ResumeContent {
  header: ResumeHeader;
  objective: string;
  education: ResumeEducationEntry[];
  skills: Record<string, string[]>;
  projects: (ResumeProjectInput & { description: string })[];
  experience: (ResumeInternshipInput & { bullets: string[] })[];
  achievements: string[];
  certifications: { name: string; authenticityScore: number }[];
}

export interface GeneratedResumeResult {
  templateId: ResumeTemplateId;
  content: ResumeContent;
  atsScore: number;
  atsFeedback: string[];
}

export interface PublicProfile {
  name: string;
  slug: string;
  collegeName?: string;
  branch?: string;
  graduationYear?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  skills: string[];
  readiness?: number;
  level?: string;
  certificationsCount: number;
  certificationNames: string[];
  hackathonWins?: number;
  internshipsCount?: number;
}

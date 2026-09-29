import axios from 'axios';
import Cookies from 'js-cookie';

// API Gateway (Spring Boot) — all backend calls go here
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ML Service (FastAPI) — direct ML calls
const ML_URL = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const mlApi = axios.create({
  baseURL: ML_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT from cookie and extract user info
api.interceptors.request.use((config) => {
  const token = Cookies.get('cip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
    // Decode JWT to extract userId, email, role, name
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) config.headers['X-User-Id'] = payload.userId;
      if (payload.sub) config.headers['X-User-Email'] = payload.sub; // 'sub' is the email
      if (payload.role) config.headers['X-User-Role'] = payload.role;
      if (payload.name) config.headers['X-User-Name'] = payload.name;
    } catch (e) {
      console.error('Failed to decode JWT:', e);
    }
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('cip_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Gateway routes: /auth/** → auth-service:8081
export const authApi = {
  login:     (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  signup:    (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/signup', data),
  me:        () => api.get('/auth/me'),
  logout:    () => api.post('/auth/logout'),
};

// ─── Student ──────────────────────────────────────────────────────────────────
// Gateway routes: /student/** → student-service:8082
export const studentApi = {
  getProfile:    () => api.get('/student/profile'),
  updateProfile: (data: unknown) => api.put('/student/profile', data),
  uploadResume:  (file: File) => {
    console.log('📤 [API] Starting resume upload:', file.name, file.size, 'bytes');
    const fd = new FormData();
    fd.append('file', file);
    // Note: userId is sent via X-User-Id header by the interceptor
    // Don't set Content-Type manually - let axios set it with boundary
    console.log('📤 [API] Sending FormData to /resume/upload');
    return api.post('/resume/upload', fd);
  },
  uploadResumeText: (text: string, fileName: string) => {
    console.log('📤 [API] Starting resume text upload:', fileName, text.length, 'chars');
    return api.post('/resume/upload-text', { text, fileName });
  },
};

// ─── Score ────────────────────────────────────────────────────────────────────
// Gateway routes: /score/** → score-service:8084
export const scoreApi = {
  get:    () => api.get('/score'),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
// Gateway routes: /analytics/** → analytics-service:8085
export const analyticsApi = {
  get:        () => api.get('/analytics'),
  getStudent: (studentId: string) => api.get(`/analytics/student/${studentId}`),
  getCareerAnalysis: (userId: number) => api.get(`/analytics/career/${userId}`),
  downloadProgress: () => api.get('/analytics/download/progress', { responseType: 'blob' }),
};

// ─── Interview ────────────────────────────────────────────────────────────────
// Gateway routes: /interview/** → interview-service:8086
export const interviewApi = {
  start:     (data: { jobRole: string; type?: string; numberOfQuestions?: number; questions?: unknown[] }) =>
    api.post('/interview/start', data),
  answer:    (data: {
    interviewId: number;
    questionIndex: number;
    question: string;
    answer: string;
    timeTakenSeconds?: number;
    score?: number;
    topic?: string;
    difficulty?: string;
    feedback?: unknown;
  }) => api.post('/interview/answer', data),
  end:       (interviewId: number) => api.post(`/interview/end?interviewId=${interviewId}`),
  getResult: (id: string) => api.get(`/interview/result/${id}`),
  history:   () => api.get('/interview/history'),
  // NEW: Hybrid endpoints (AI + Fallback)
  getNextQuestion: (interviewId: number) => api.get(`/interview/question/${interviewId}`),
  evaluateAnswer: (data: { question: string; answer: string; topic: string; ideal: string }) =>
    api.post('/interview/evaluate', data),
  
  // ─── V3 Interview System ────────────────────────────────────────────────────
  v3: {
    getConfig: () => api.get('/interview/v3/config'),
    getTips: (params?: { roundType?: string; difficulty?: string; duration?: number }) =>
      api.get('/interview/v3/tips', { params }),
    start: (data: {
      interviewMode: 'RESUME_BASED' | 'COMPANY_SPECIFIC' | 'ROLE_BASED' | 'BRANCH_BASED' | 'TIME_BASED';
      company?: string;
      role?: string;
      branch?: string;
      duration?: number;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'FAANG';
      persona?: 'FRIENDLY_HR' | 'STRICT_TECHNICAL' | 'STARTUP_FOUNDER' | 'FAANG_INTERVIEWER' | 'SENIOR_ARCHITECT';
      roundType?: 'TECHNICAL' | 'HR' | 'BEHAVIORAL';
    }) => api.post('/interview/v3/start', data),
    getSession: (id: number) => api.get(`/interview/v3/session/${id}`),
    // NEW: Get next question (dynamic for RESUME_BASED)
    getNextQuestion: (id: number) => api.get(`/interview/v3/${id}/next-question`),
    // NEW: Evaluate answer only
    evaluateAnswer: (id: number, data: {
      question: string;
      answer: string;
      topic: string;
      ideal: string;
    }) => api.post(`/interview/v3/${id}/evaluate`, data),
    // NEW: Submit and evaluate in one call (MAIN ENDPOINT)
    submitAndEvaluate: (id: number, data: {
      questionIndex: number;
      question: string;
      answer: string;
      topic: string;
      ideal: string;
      timeTaken: number;
    }) => api.post(`/interview/v3/${id}/submit-and-evaluate`, data),
    submitAnswer: (data: {
      interviewId: number;
      questionIndex: number;
      answer: string;
      timeTaken: number;
    }) => api.post('/interview/v3/answer', data),
    saveFacialAnalytics: (data: {
      interviewId: number;
      confidenceScore: number;
      eyeContact: 'GOOD' | 'AVERAGE' | 'POOR';
      emotion: string;
      posture: 'STABLE' | 'UNSTABLE';
      voiceClarity: number;
    }) => api.post('/interview/v3/analytics/facial', data),
    getReport: (id: string) => api.get(`/interview/v3/report/${id}`),
  },
};

// ─── Custom Interview ─────────────────────────────────────────────────────────
// Gateway routes: /custom-interview/** → custom interview endpoints
export const customInterviewApi = {
  // Faculty endpoints
  create: (data: {
    title: string;
    description?: string;
    durationMinutes?: number;
    difficulty?: string;
    questions: Array<{
      questionText: string;
      expectedAnswer?: string;
      topic?: string;
      difficulty?: string;
      points?: number;
    }>;
  }) => api.post('/custom-interview/create', data),
  
  getMyInterviews: () => api.get('/custom-interview/my-interviews'),
  
  getResults: (interviewId: number) => api.get(`/custom-interview/${interviewId}/results`),
  
  // Student endpoints
  joinByCode: (code: string) => api.get(`/custom-interview/join/${code}`),
  
  startAttempt: (data: { interviewCode: string }) => 
    api.post('/custom-interview/attempt/start', data),
  
  getNextQuestion: (attemptId: number) => 
    api.get(`/custom-interview/attempt/${attemptId}/next-question`),
  
  submitAnswer: (data: {
    attemptId: number;
    questionId: number;
    answerText: string;
    timeTakenSeconds: number;
  }) => api.post('/custom-interview/attempt/answer', data),
  
  completeAttempt: (attemptId: number) => 
    api.post(`/custom-interview/attempt/${attemptId}/complete`),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
// Gateway routes: /jobs/** → job-service:8087
export const jobsApi = {
  list:        (params?: { page?: number; size?: number }) =>
    api.get('/jobs', { params }),
  filter:      (params?: { type?: string; location?: string; experience?: string; domain?: string; limit?: number }) =>
    api.get('/jobs/filter', { params }),
  recommended: (params?: { readiness?: number; skills?: string[] }) => api.get('/jobs/recommended', { params }),
  getById:     (id: number) => api.get(`/jobs/${id}`),

  // ─── Government Jobs ──────────────────────────────────────────────────────
  government: {
    list:        (params?: { category?: string }) => api.get('/jobs/government', { params }),
    getById:     (id: number) => api.get(`/jobs/government/${id}`),
    recommended: (params?: { branch?: string; cgpa?: number; graduationYear?: number; preferences?: string[] }) =>
      api.get('/jobs/government/recommended', { params }),
  },
};

// ─── Roadmap / Recommendations ────────────────────────────────────────────────
// Gateway routes: /roadmap/**, /recommendations/** → recommendation-service:8088
export const roadmapApi = {
  get:          () => api.get('/roadmap'),
  downloadRoadmap: (data: { tasks: unknown[] }) => api.post('/analytics/download/roadmap', data, { responseType: 'blob' }),
};

// ─── Certificates ─────────────────────────────────────────────────────────────
// Gateway routes: /certificates/** → certificate-service (integrated in backend)
export const certificateApi = {
  upload: (file: File, userId: number) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', userId.toString());
    return api.post('/certificates/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  get: (id: number) => api.get(`/certificates/${id}`),
  getResult: (id: number) => api.get(`/certificates/${id}/result`),
  getUserCertificates: (userId: number, page: number, size: number) =>
    api.get(`/certificates/user/${userId}?page=${page}&size=${size}`),
};



// ─── ML Direct Endpoints ──────────────────────────────────────────────────────
// Calls FastAPI ML service directly (port 8000)
export const mlServiceApi = {
  analyzeResume: (data: { text: string; student_id: string; job_role?: string }) =>
    mlApi.post('/ml/resume/analyze', data),
  predictAcademic: (data: unknown) =>
    mlApi.post('/ml/predict', data),
  evaluateInterview: (data: {
    student_id: string;
    question: string;
    answer_text: string;
    expected_answer?: string;
    domain?: string;
    difficulty?: string;
  }) =>
    mlApi.post('/ml/interview/evaluate', data),
  generateInterviewQuestion: (data: {
    resume_data: Record<string, unknown>;
    job_role: string;
    previous_answers: Array<{
      question: string;
      answer: string;
      topic?: string;
      difficulty?: string;
      accuracy?: number;
    }>;
  }) =>
    mlApi.post('/ml/interview/question', data),
  coachInterviewAnswer: (data: {
    answer?: string;
    job_role: string;
    resume_skills: string[];
    question: string;
    expected_answer?: string;
    topic?: string;
    persona_mode?: string;
    user_query?: string;  // For chat mode
  }) =>
    mlApi.post('/ml/interview/coach', data),
  computeReadiness: (data: unknown) =>
    mlApi.post('/ml/readiness', data),
  recommend: (data: unknown) =>
    mlApi.post('/ml/recommend', data),
  
  // ─── Phase 1: Semantic Similarity ─────────────────────────────────────────
  generateEmbedding: (data: { text: string }) =>
    mlApi.post('/ml/embeddings/generate', data),
  
  calculateSimilarity: (data: { text1: string; text2: string }) =>
    mlApi.post('/ml/similarity/calculate', data),

  // ─── Phase 2: RAG Resume Parsing ──────────────────────────────────────────
  parseResumeWithRAG: (data: { text: string }) =>
    mlApi.post('/ml/resume/rag-parse', data),
  
  getResumeContext: (data: { resume_id: string; query: string }) =>
    mlApi.post('/ml/resume/context', data),
  
  generateResumeEmbeddings: (data: { sections: Record<string, string> }) =>
    mlApi.post('/ml/resume/embeddings', data),

  // ─── Phase 3: Enhanced Question Generation ────────────────────────────────
  generatePersonalizedQuestion: (data: {
    job_role: string;
    difficulty: string;
    previous_topics: string[];
    resume_summary?: string;
    resume_skills?: string[];
    resume_context?: string;
    use_resume_context?: boolean;
  }) =>
    mlApi.post('/ml/interview/question', data),
};

// WebSocket URL export
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

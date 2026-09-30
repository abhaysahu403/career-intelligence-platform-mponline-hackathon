'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { interviewApi } from '@/lib/api';
import { InterviewV3Config, InterviewMode, InterviewDifficulty, InterviewPersona, RoundType, GovernmentExamType } from '@/types';
import {
  FileText,
  Building2,
  Briefcase,
  GraduationCap,
  Clock,
  Target,
  Users,
  Sparkles,
  TrendingUp,
  Zap,
  Brain,
  Rocket,
  Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [config, setConfig] = useState<InterviewV3Config | null>(null);

  // Configuration state
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('RESUME_BASED');
  const [company, setCompany] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [governmentExamType, setGovernmentExamType] = useState<GovernmentExamType | ''>('');
  const [duration, setDuration] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('MEDIUM');
  const [persona, setPersona] = useState<InterviewPersona>('FRIENDLY_HR');
  const [roundType, setRoundType] = useState<RoundType>('TECHNICAL');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await interviewApi.v3.getConfig();
      setConfig(response.data.data);
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('Failed to load interview configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    // For HR and Behavioral rounds, we don't need specific mode - just use RESUME_BASED as default
    const finalInterviewMode = (roundType === 'HR' || roundType === 'BEHAVIORAL') 
      ? 'RESUME_BASED'  // Default mode for HR/Behavioral (backend will ignore this and use roundType)
      : interviewMode;

    // Validation - only validate if TECHNICAL mode with specific selections
    if (roundType === 'TECHNICAL') {
      if (finalInterviewMode === 'COMPANY_SPECIFIC' && !company) {
        toast.error('Please select a company for Company-Specific mode');
        return;
      }
      if (finalInterviewMode === 'ROLE_BASED' && !role) {
        toast.error('Please select a role for Role-Based mode');
        return;
      }
      if (finalInterviewMode === 'BRANCH_BASED' && !branch) {
        toast.error('Please select a branch for Branch-Based mode');
        return;
      }
      if (finalInterviewMode === 'GOVERNMENT' && !governmentExamType) {
        toast.error('Please select a government exam type');
        return;
      }
    }

    setStarting(true);
    try {
      const response = await interviewApi.v3.start({
        interviewMode: finalInterviewMode,
        company: roundType === 'TECHNICAL' && finalInterviewMode === 'COMPANY_SPECIFIC' ? company : undefined,
        role: roundType === 'TECHNICAL' && finalInterviewMode === 'ROLE_BASED' ? role : undefined,
        branch: roundType === 'TECHNICAL' && finalInterviewMode === 'BRANCH_BASED' ? branch : undefined,
        governmentExamType: roundType === 'TECHNICAL' && finalInterviewMode === 'GOVERNMENT' ? governmentExamType || undefined : undefined,
        duration: duration,
        difficulty,
        persona,
        roundType,
      });

      const interviewId = response.data.data.id;
      toast.success(`${roundType} Interview created successfully!`);
      router.push(`/interview/live?id=${interviewId}`);
    } catch (error: any) {
      console.error('Failed to start interview:', error);
      toast.error(error.response?.data?.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-gray-400">Loading interview configuration...</p>
        </div>
      </div>
    );
  }

  const interviewModes = [
    {
      id: 'RESUME_BASED' as InterviewMode,
      icon: FileText,
      title: 'Resume-Based',
      description: 'Questions based on your resume and experience',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'COMPANY_SPECIFIC' as InterviewMode,
      icon: Building2,
      title: 'Company-Specific',
      description: 'Real interview patterns from top companies',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'ROLE_BASED' as InterviewMode,
      icon: Briefcase,
      title: 'Role-Based',
      description: 'Questions tailored for specific job roles',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'BRANCH_BASED' as InterviewMode,
      icon: GraduationCap,
      title: 'Branch-Based',
      description: 'Domain-specific questions for your branch',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'GOVERNMENT' as InterviewMode,
      icon: Landmark,
      title: 'Government Exam',
      description: 'UPSC Personality Test, SSC Interview, Bank PO, SSB, DRDO/ISRO',
      color: 'from-amber-500 to-red-600',
    },
  ];

  const GOVERNMENT_EXAM_LABELS: Record<string, string> = {
    SSB: 'SSB (Defence) Personality Test',
    UPSC: 'UPSC Personality Test',
    BANK_PO: 'Bank PO Interview (IBPS/SBI)',
    SSC_RAILWAY: 'SSC Interview / Railway',
    RESEARCH_ORG: 'DRDO / ISRO / Research Org Interview',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#38BDF8] rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4ADE80] rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-[#38BDF8]" />
            AI Interview Intelligence
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-400">Configure your personalized interview experience</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Round Type Selection - PRIMARY CHOICE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 1: Choose Interview Round Type</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">This is the most important choice - it determines what type of questions you'll get</p>
              <div className="grid grid-cols-3 gap-4">
                {(['TECHNICAL', 'HR', 'BEHAVIORAL'] as RoundType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setRoundType(type)}
                    className={`py-6 px-6 rounded-xl font-bold text-lg transition-all ${
                      roundType === type
                        ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-lg shadow-[#38BDF8]/50 scale-105'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                  >
                    {type === 'TECHNICAL' && '💻 '}
                    {type === 'HR' && '👔 '}
                    {type === 'BEHAVIORAL' && '🧠 '}
                    {type}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">
                  {roundType === 'TECHNICAL' && '💻 Technical Round: Algorithms, System Design, Coding, Data Structures, API Design'}
                  {roundType === 'HR' && '👔 HR Round: Behavioral questions, STAR method, Strengths/Weaknesses, Career goals, Team fit'}
                  {roundType === 'BEHAVIORAL' && '🧠 Behavioral Round: Past experiences, Problem-solving, Teamwork, Leadership, Conflict resolution'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {roundType === 'TECHNICAL' && 'Same technical questions for everyone (unless you select Company-Specific below)'}
                  {roundType === 'HR' && 'Same HR questions for everyone (unless you select Company-Specific below)'}
                  {roundType === 'BEHAVIORAL' && 'Same behavioral questions for everyone (unless you select Company-Specific below)'}
                </p>
              </div>
            </motion.div>

            {/* Interview Mode Selection - ONLY FOR TECHNICAL ROUND */}
            {roundType === 'TECHNICAL' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#38BDF8]" />
                  Step 2: How do you want the {roundType.toLowerCase()} questions?
                </h2>
                <p className="text-slate-600 dark:text-gray-400 text-sm mb-3">
                  Choose the source of questions based on your interview preparation goal
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {interviewModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <motion.button
                        key={mode.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInterviewMode(mode.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                          interviewMode === mode.id
                            ? 'border-[#38BDF8] bg-[#38BDF8]/10'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mode.color} rounded-t-xl`}></div>
                        <Icon className={`w-8 h-8 mb-2 mx-auto ${interviewMode === mode.id ? 'text-[#38BDF8]' : 'text-slate-600 dark:text-gray-400'}`} />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{mode.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-gray-400">{mode.description}</p>
                      </motion.button>
                    );
                  })}
                  
                  {/* NEW: Custom Interview Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const code = prompt('Enter interview code (or leave empty to create new):');
                      if (code === null) return; // User cancelled
                      if (code.trim()) {
                        // Join existing interview
                        router.push(`/interview/join/${code.trim()}`);
                      } else {
                        // Create new custom interview
                        router.push('/faculty/create-interview');
                      }
                    }}
                    className="relative p-4 rounded-xl border-2 border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 hover:border-[#F59E0B]/50 transition-all text-center"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl"></div>
                    <Users className="w-8 h-8 mb-2 mx-auto text-[#F59E0B]" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Custom Interview</h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400">Your own questions or join by code</p>
                  </motion.button>
                </div>
                
                {/* Custom Interview Info */}
                <div className="mt-4 p-4 bg-gradient-to-r from-[#F59E0B]/10 to-[#F59E0B]/5 rounded-lg border border-[#F59E0B]/20">
                  <p className="text-sm text-slate-700 dark:text-gray-300 font-medium flex items-center gap-2">
                    <Users size={16} className="text-[#F59E0B]" />
                    <span><strong>Custom Interview:</strong> Create your own questions or join an interview created by your teacher/recruiter using a code</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Info message for HR and Behavioral */}
            {(roundType === 'HR' || roundType === 'BEHAVIORAL') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-[#38BDF8]" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {roundType === 'HR' ? 'General HR Interview' : 'General Behavioral Interview'}
                  </h3>
                </div>
                <p className="text-slate-700 dark:text-gray-300">
                  {roundType === 'HR'
                    ? 'You will get standard HR questions that are asked in all companies. These questions are the same for everyone and cover topics like strengths, weaknesses, motivation, and career goals.'
                    : 'You will get standard behavioral questions using the STAR method. These questions are the same for everyone and cover topics like teamwork, leadership, problem-solving, and conflict resolution.'}
                </p>
              </motion.div>
            )}

            {/* Dynamic Options Based on Mode - ONLY FOR TECHNICAL */}
            {roundType === 'TECHNICAL' && interviewMode === 'COMPANY_SPECIFIC' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Select Company</h3>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">Choose a company...</option>
                  {config?.companies.map((c) => (
                    <option key={c} value={c} className="bg-[#01030F]">{c}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {roundType === 'TECHNICAL' && interviewMode === 'ROLE_BASED' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Select Role</h3>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">Choose a role...</option>
                  {config?.roles.map((r) => (
                    <option key={r} value={r} className="bg-[#01030F]">{r}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {roundType === 'TECHNICAL' && interviewMode === 'BRANCH_BASED' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Select Branch</h3>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">Choose a branch...</option>
                  {config?.branches.map((b) => (
                    <option key={b} value={b} className="bg-[#01030F]">{b}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {roundType === 'TECHNICAL' && interviewMode === 'GOVERNMENT' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Select Government Exam</h3>
                <select
                  value={governmentExamType}
                  onChange={(e) => setGovernmentExamType(e.target.value as GovernmentExamType)}
                  className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="">Choose an exam type...</option>
                  {config?.governmentExamTypes.map((examType) => (
                    <option key={examType} value={examType} className="bg-[#01030F]">
                      {GOVERNMENT_EXAM_LABELS[examType] || examType}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Duration Selection - Simple */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#38BDF8]" />
                {roundType === 'TECHNICAL' ? 'Step 3:' : 'Step 2:'} Interview Duration
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {config?.durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                      duration === d
                        ? 'bg-[#38BDF8] text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-2">
                Duration determines number of questions (2 minutes per question)
              </p>
            </motion.div>

            {/* Difficulty Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#38BDF8]" />
                {roundType === 'TECHNICAL' ? 'Step 4:' : 'Step 3:'} Difficulty Level
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {config?.difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                      difficulty === d
                        ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Live Preview Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6 text-[#38BDF8]" />
                Interview Preview
              </h3>

              {/* Animated AI Avatar */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center animate-pulse">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-4 border-[#38BDF8]/30 animate-ping"></div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Round Type:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{roundType}</span>
                </div>
                {roundType === 'TECHNICAL' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-gray-400">Question Source:</span>
                    <span className="text-slate-900 dark:text-white font-semibold text-xs">{interviewMode.replace('_', ' ')}</span>
                  </div>
                )}
                {(roundType === 'HR' || roundType === 'BEHAVIORAL') && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-gray-400">Question Type:</span>
                    <span className="text-slate-900 dark:text-white font-semibold text-xs">General (Same for Everyone)</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Duration:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{duration} minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Questions:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{Math.floor(duration / 2)} questions</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Difficulty:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{difficulty}</span>
                </div>
              </div>

              {/* Animated Status */}
              <div className="bg-slate-50 dark:bg-white/10 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-[#4ADE80] mb-2">
                  <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">System Ready</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400">AI interviewer initialized and ready to begin</p>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartInterview}
                disabled={starting}
                className="w-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-900 dark:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {starting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    INITIALIZE AI INTERVIEW
                  </>
                )}
              </motion.button>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-[#4ADE80] mx-auto mb-1" />
                  <p className="text-xs text-slate-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">94%</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center">
                  <Zap className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
                  <p className="text-xs text-slate-600 dark:text-gray-400">Avg Score</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">87/100</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

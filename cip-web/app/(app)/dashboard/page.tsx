'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, FileText, Target, Video, TrendingUp, Rocket, CheckCircle, Lock, Award, Clock, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsApi, jobsApi, scoreApi } from '@/lib/api';
import { useAppStore } from '@/store';
import type { Analytics, Job, ReadinessScore } from '@/types';
import AcademicProfileWidget from '@/components/dashboard/AcademicProfileWidget';

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

const normalizeRecommendedJobs = (items: Array<{
  job: {
    id: number;
    company: string;
    role: string;
    location?: string;
    employmentType?: string;
    salaryRange?: string;
    sourceUrl?: string;
    requiredSkills?: string[];
  };
  matchPercentage: number;
}>): Job[] =>
  items.map((item) => ({
    id: item.job.id,
    company: item.job.company,
    role: item.job.role,
    location: item.job.location ?? 'Unknown',
    type: item.job.employmentType === 'PART_TIME' ? 'Part-time' : item.job.employmentType === 'INTERNSHIP' ? 'Internship' : 'Full-time',
    match: item.matchPercentage,
    minScore: 0,
    salary: item.job.salaryRange,
    skills: item.job.requiredSkills ?? [],
    url: item.job.sourceUrl ?? '#',
    isRecommended: true,
  }));

export default function DashboardPage() {
  const router = useRouter();
  const { user, score, setScore } = useAppStore();

  const { data: scoreData, isLoading: scoreLoading } = useQuery({
    queryKey: ['score'],
    queryFn: async () => {
      try {
        const res = await scoreApi.get();
        if (!res || !res.data) throw new Error('No data');
        return res.data;
      } catch (e) {
        return {
          data: {
            readiness: 68,
            level: 'Almost Ready',
            resumeScore: 65,
            academicScore: 82,
            interviewScore: 58,
            recommendation: 'Good progress. Focus on improving your technical communication.',
          }
        };
      }
    },
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        const res = await analyticsApi.get();
        if (!res || !res.data) throw new Error('No data');
        return res.data;
      } catch (e) {
        return {
          data: {
            risk: 'LOW',
            readiness: 68,
            resumeScore: 65,
            interviewScore: 58,
            averageInterviewScore: 60,
            totalAttempts: 2,
            weakSkills: ['system design', 'edge cases'],
            latestRecommendation: 'Review URL shortener design pattern and practice boundary value analysis.',
            progressHistory: [
              { date: 'Mon', score: 40 },
              { date: 'Tue', score: 55 },
              { date: 'Wed', score: 68 }
            ],
            interviewHistory: [
              { date: 'Mon', score: 45 },
              { date: 'Wed', score: 58 }
            ]
          }
        };
      }
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs-recommended', score?.readiness, user?.skills],
    queryFn: async () => {
      const response = await jobsApi.recommended({ readiness: score?.readiness, skills: user?.skills });
      return normalizeRecommendedJobs(unwrapPayload(response) as Array<{
        job: {
          id: number;
          company: string;
          role: string;
          location?: string;
          employmentType?: string;
          salaryRange?: string;
          sourceUrl?: string;
          requiredSkills?: string[];
        };
        matchPercentage: number;
      }>);
    },
  });

  useEffect(() => {
    if (scoreData) {
      const payload = unwrapPayload(scoreData) as ReadinessScore;
      setScore(payload);
    }
  }, [scoreData, setScore]);

  const s = scoreData ? unwrapPayload(scoreData) as ReadinessScore : null;
  const a = analyticsData ? unwrapPayload(analyticsData) as Analytics : null;

  if (scoreLoading || !s || analyticsLoading || !a) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent border-sky-500" />
          <p className="text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate progress
  const hasResume = (s.resumeScore ?? 0) > 0;
  const hasInterview = (s.interviewScore ?? 0) > 0;
  const isJobReady = (s.readiness ?? 0) >= 70;
  const progressPercentage = Math.round(((hasResume ? 1 : 0) + (hasInterview ? 1 : 0) + (isJobReady ? 1 : 0)) / 3 * 100);

  // Determine next action
  let nextAction = {
    title: 'Take Your First Interview',
    description: 'Complete a 15-minute AI interview to unlock job matches',
    icon: Video,
    action: () => router.push('/interview/setup'),
    buttonText: 'Start Interview',
    time: '15 min',
  };

  if (!hasResume) {
    nextAction = {
      title: 'Upload Your Resume',
      description: 'Add your resume to get personalized interview questions',
      icon: FileText,
      action: () => router.push('/profile'),
      buttonText: 'Upload Resume',
      time: '2 min',
    };
  } else if (!hasInterview) {
    nextAction = {
      title: 'Take Your First Interview',
      description: 'Complete a 15-minute AI interview to unlock job matches',
      icon: Video,
      action: () => router.push('/interview/setup'),
      buttonText: 'Start Interview',
      time: '15 min',
    };
  } else if (!isJobReady) {
    nextAction = {
      title: 'Improve Your Score',
      description: 'Take another interview to reach 70/100 and unlock more jobs',
      icon: Target,
      action: () => router.push('/interview/setup'),
      buttonText: 'Practice More',
      time: '15 min',
    };
  } else {
    nextAction = {
      title: 'Apply to Jobs',
      description: `${jobs?.length || 0} jobs are waiting for you!`,
      icon: Briefcase,
      action: () => router.push('/jobs'),
      buttonText: 'Browse Jobs',
      time: '5 min',
    };
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12 max-w-7xl mx-auto"
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          👋 Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
          Let's continue your journey to landing your dream job
        </p>
      </motion.div>

      <AcademicProfileWidget />

      <motion.button
        onClick={() => router.push('/dashboard/campus-to-corporate')}
        whileHover={{ scale: 1.01 }}
        className="w-full flex items-center justify-between gap-4 rounded-2xl p-5 border text-left transition-all"
        style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(74,222,128,0.1))', borderColor: 'rgba(56,189,248,0.3)' }}
      >
        <div className="flex items-center gap-3">
          <MapPin className="text-sky-500" size={24} />
          <div>
            <p className="font-black text-slate-900 dark:text-white">See Your Campus to Corporate Journey</p>
            <p className="text-xs text-slate-500">Where you are today vs. what your target needs — and the exact path to close the gap.</p>
          </div>
        </div>
        <ArrowRight className="text-sky-500 flex-shrink-0" size={20} />
      </motion.button>

      {/* Hero Section - Next Action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl p-6 md:p-8 border backdrop-blur-xl overflow-hidden bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/20 dark:to-indigo-950/20 border-sky-200 dark:border-sky-500/20"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-30 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400 dark:bg-[#38BDF8] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 dark:bg-[#818CF8] rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 dark:from-[#38BDF8] dark:to-[#0EA5E9] flex items-center justify-center">
              <nextAction.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-600 dark:text-[#38BDF8] uppercase tracking-wider">Your Next Mission</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{nextAction.title}</h2>
            </div>
          </div>
          
          <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg mb-6 max-w-2xl">
            {nextAction.description}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextAction.action}
              className="px-8 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-bold rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all"
            >
              {nextAction.buttonText} <ArrowRight className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Takes only {nextAction.time}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Overall Progress</span>
              <span className="text-sm font-bold text-[#38BDF8]">{progressPercentage}% Complete</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Video, label: 'Start Interview', action: () => router.push('/interview/setup'), color: '#38BDF8' },
          { icon: FileText, label: 'Upload Resume', action: () => router.push('/profile'), color: '#818CF8' },
          { icon: Briefcase, label: 'Browse Jobs', action: () => router.push('/jobs'), color: '#4ADE80' },
          { icon: TrendingUp, label: 'View Progress', action: () => router.push('/analytics'), color: '#FBBF24' },
        ].map((action, idx) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.05 }}
            className="relative rounded-2xl p-6 border backdrop-blur-xl transition-all group"
            style={{ 
              background: 'rgba(8,12,20,0.7)',
              borderColor: 'rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ 
                  background: `${action.color}15`,
                  border: `1px solid ${action.color}30`
                }}
              >
                <action.icon className="w-7 h-7" style={{ color: action.color }} />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white text-center">{action.label}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Simplified Score Cards - 3 instead of 4 */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { 
            title: 'Resume Score', 
            value: s.resumeScore ?? 0, 
            icon: FileText, 
            color: '#38BDF8',
            status: (s.resumeScore ?? 0) >= 70 ? 'Good' : (s.resumeScore ?? 0) >= 50 ? 'Needs Work' : 'Poor',
            action: () => router.push('/profile')
          },
          { 
            title: 'Interview Score', 
            value: s.interviewScore ?? 0, 
            icon: Video, 
            color: '#4ADE80',
            status: (s.interviewScore ?? 0) >= 70 ? 'Good' : (s.interviewScore ?? 0) >= 50 ? 'Needs Work' : 'Poor',
            action: () => router.push('/interview/setup')
          },
          { 
            title: 'Job Ready', 
            value: s.readiness ?? 0, 
            icon: Target, 
            color: '#FBBF24',
            status: (s.readiness ?? 0) >= 70 ? 'Ready!' : (s.readiness ?? 0) >= 50 ? 'Almost There' : 'Keep Going',
            action: () => router.push('/jobs')
          },
        ].map((card, idx) => (
          <motion.div
            key={card.title}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5 }}
            className="relative rounded-3xl p-6 border backdrop-blur-xl transition-all cursor-pointer group"
            style={{ 
              background: 'rgba(8,12,20,0.7)',
              borderColor: 'rgba(255,255,255,0.06)'
            }}
            onClick={card.action}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}30`
                }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ 
                  background: `${card.color}20`,
                  color: card.color
                }}
              >
                {card.status}
              </span>
            </div>
            
            <h3 className="text-sm font-semibold text-slate-400 mb-2">{card.title}</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">{card.value}</span>
              <span className="text-lg text-slate-500">/100</span>
            </div>

            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${card.value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 + idx * 0.1 }}
                className="h-full rounded-full"
                style={{ background: card.color }}
              />
            </div>

            <button 
              className="w-full py-2 rounded-xl text-sm font-bold transition-all group-hover:bg-white/10"
              style={{ 
                background: 'rgba(255,255,255,0.05)',
                color: card.color
              }}
            >
              Improve Score →
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Journey */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative rounded-3xl p-8 border backdrop-blur-xl"
        style={{ 
          background: 'rgba(8,12,20,0.7)',
          borderColor: 'rgba(255,255,255,0.06)'
        }}
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Career Journey</h3>
        
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full"
            />
          </div>

          {/* Steps */}
          {[
            { label: 'Sign Up', icon: CheckCircle, completed: true },
            { label: 'Upload Resume', icon: hasResume ? CheckCircle : FileText, completed: hasResume },
            { label: 'Take Interview', icon: hasInterview ? CheckCircle : Video, completed: hasInterview },
            { label: 'Get Certified', icon: isJobReady ? CheckCircle : Award, completed: isJobReady },
            { label: 'Apply to Jobs', icon: Lock, completed: false },
          ].map((step, idx) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.completed 
                    ? 'bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] border-[#38BDF8]' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <step.icon className={`w-6 h-6 ${step.completed ? 'text-white' : 'text-slate-500'}`} />
              </motion.div>
              <span className={`text-xs font-semibold text-center max-w-[80px] ${
                step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          {!hasResume && "Next: Upload your resume to get started"}
          {hasResume && !hasInterview && "Next: Complete your first interview to unlock jobs"}
          {hasInterview && !isJobReady && "Next: Improve your score to reach 70/100"}
          {isJobReady && "🎉 You're job ready! Start applying now"}
        </p>
      </motion.div>

      {/* Achievement Badges & What to Do Next */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What to Do Next */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-6 border backdrop-blur-xl"
          style={{ 
            background: 'rgba(8,12,20,0.7)',
            borderColor: 'rgba(255,255,255,0.06)'
          }}
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">What to Do Next</h3>
          
          <div className="space-y-4">
            {[
              {
                number: 1,
                icon: hasInterview ? Target : Video,
                title: hasInterview ? 'Improve Interview Score' : 'Take Technical Interview',
                description: hasInterview ? 'Practice more to reach 70/100' : 'Unlock job matches and get AI feedback',
                time: '15 min',
                action: () => router.push('/interview/setup'),
                color: '#38BDF8'
              },
              {
                number: 2,
                icon: FileText,
                title: 'Improve Resume Score',
                description: 'Add more skills and projects',
                time: '5 min',
                action: () => router.push('/profile'),
                color: '#818CF8'
              },
              {
                number: 3,
                icon: Award,
                title: 'Get Certificate Verified',
                description: 'Upload your certificates for validation',
                time: '2 min',
                action: () => router.push('/certificates'),
                color: '#4ADE80'
              },
            ].map((item) => (
              <motion.button
                key={item.number}
                whileHover={{ x: 5 }}
                onClick={item.action}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-white/5 text-left"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                  style={{ 
                    background: `${item.color}20`,
                    color: item.color
                  }}
                >
                  {item.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
                <ArrowRight className="flex-shrink-0 w-5 h-5 text-slate-600" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-6 border backdrop-blur-xl"
          style={{ 
            background: 'rgba(8,12,20,0.7)',
            borderColor: 'rgba(255,255,255,0.06)'
          }}
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Achievements</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: CheckCircle, label: 'Sign Up', unlocked: true, color: '#38BDF8' },
              { icon: FileText, label: 'Resume', unlocked: hasResume, color: '#818CF8' },
              { icon: Video, label: 'Interview', unlocked: hasInterview, color: '#4ADE80' },
              { icon: Award, label: 'Certified', unlocked: isJobReady, color: '#FBBF24' },
              { icon: Briefcase, label: 'Job Offer', unlocked: false, color: '#F87171' },
              { icon: Star, label: 'Expert', unlocked: false, color: '#A78BFA' },
            ].map((badge, idx) => (
              <motion.div
                key={badge.label}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 * idx, type: 'spring' }}
                className="flex flex-col items-center gap-2"
              >
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    badge.unlocked 
                      ? 'shadow-lg' 
                      : 'opacity-30'
                  }`}
                  style={{ 
                    background: badge.unlocked ? `${badge.color}20` : 'rgba(255,255,255,0.05)',
                    borderColor: badge.unlocked ? badge.color : 'rgba(255,255,255,0.1)',
                    boxShadow: badge.unlocked ? `0 0 20px ${badge.color}40` : 'none'
                  }}
                >
                  {badge.unlocked ? (
                    <badge.icon className="w-8 h-8" style={{ color: badge.color }} />
                  ) : (
                    <Lock className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <span className={`text-xs font-semibold text-center ${
                  badge.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-600'
                }`}>
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Milestones Complete</span>
              <span className="text-sm font-bold text-[#38BDF8]">
                {[true, hasResume, hasInterview, isJobReady, false, false].filter(Boolean).length}/6
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${([true, hasResume, hasInterview, isJobReady, false, false].filter(Boolean).length / 6) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Jobs for You - Simplified */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs Matched for You</h3>
            <p className="text-sm text-slate-400 mt-1">Based on your skills and interview performance</p>
          </div>
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/5 hover:border-[#38BDF8]/50 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
          >
            See All Jobs <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs && jobs.length > 0 ? (
            jobs.slice(0, 3).map((job, i) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl p-6 border backdrop-blur-xl transition-all cursor-pointer group"
                style={{ 
                  background: 'rgba(8,12,20,0.7)',
                  borderColor: 'rgba(255,255,255,0.06)'
                }}
                onClick={() => window.open(job.url, '_blank')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center text-2xl">
                    🏢
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ 
                      background: job.match >= 80 ? '#4ADE8020' : job.match >= 60 ? '#FBBF2420' : '#38BDF820',
                      color: job.match >= 80 ? '#4ADE80' : job.match >= 60 ? '#FBBF24' : '#38BDF8'
                    }}
                  >
                    {job.match}% Match
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#38BDF8] transition-colors">
                  {job.role}
                </h4>
                <p className="text-sm text-slate-400 mb-4">{job.company}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>📍</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>💼</span>
                    <span>{job.type}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>💰</span>
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/5 text-slate-400"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/5 text-slate-400">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <button 
                  className="w-full py-2 rounded-xl text-sm font-bold transition-all group-hover:bg-[#38BDF8] group-hover:text-white text-slate-900 dark:text-white"
                  style={{ 
                    background: 'rgba(56,189,248,0.1)',
                    color: '#38BDF8'
                  }}
                >
                  View Details →
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#38BDF8]/5 border border-[#38BDF8]/10">
                <Rocket size={32} className="text-[#38BDF8]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Find Jobs?</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                Complete your first AI interview to unlock personalized job matches
              </p>
              <button
                onClick={() => router.push('/interview/setup')}
                className="px-6 py-3 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all"
              >
                Start Interview Now →
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Skills to Improve - Simplified */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative rounded-3xl p-8 border backdrop-blur-xl" 
        style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Skills to Improve</h3>
            <p className="text-sm text-slate-400 mt-1">Focus on these areas to boost your interview score</p>
          </div>
          <button 
            onClick={() => router.push('/analytics')} 
            className="flex items-center gap-2 text-sm font-bold text-[#38BDF8] hover:text-slate-900 dark:hover:text-white transition-all px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
          >
            View Analytics <ArrowRight size={16} />
          </button>
        </div>

        {a.weakSkills.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {a.weakSkills.slice(0, 3).map((skill, idx) => {
              const priority = idx === 0 ? 'Critical' : idx === 1 ? 'Important' : 'Good to Know';
              const prColor = idx === 0 ? '#F87171' : idx === 1 ? '#FBBF24' : '#4ADE80';
              const prBg = idx === 0 ? 'rgba(248,113,113,0.1)' : idx === 1 ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)';
              const proficiency = idx === 0 ? 30 : idx === 1 ? 50 : 70;
              
              return (
                <motion.div 
                  key={skill} 
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="rounded-2xl border p-6 space-y-4 transition-all cursor-pointer" 
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${prColor}33` }}
                  onClick={() => router.push('/interview/setup')}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: prBg, color: prColor }}
                    >
                      {priority}
                    </span>
                    <span className="text-2xl">
                      {idx === 0 ? '🔴' : idx === 1 ? '🟡' : '🟢'}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold capitalize text-slate-900 dark:text-white">{skill}</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Proficiency</span>
                      <span className="font-bold" style={{ color: prColor }}>{proficiency}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${proficiency}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + idx * 0.1 }}
                        className="h-full rounded-full" 
                        style={{ background: prColor }} 
                      />
                    </div>
                  </div>

                  <button 
                    className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                    style={{ 
                      background: prBg,
                      color: prColor
                    }}
                  >
                    Practice Now →
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#4ADE80]/10 border border-[#4ADE80]/20">
              <CheckCircle size={32} className="text-[#4ADE80]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Great Job!</h4>
            <p className="text-sm text-slate-400">
              No weak skills detected. Keep practicing to maintain your performance.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

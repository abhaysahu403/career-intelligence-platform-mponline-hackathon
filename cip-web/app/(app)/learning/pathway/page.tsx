'use client';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, Award, Calendar, TrendingUp, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi, studentApi } from '@/lib/api';
import { useAppStore } from '@/store';
import { useT } from '@/lib/i18n';
import CourseCard from '@/components/ui/CourseCard';
import type { AcademicProfile, CourseRecommendations, CourseRecommendationEntry, UserCourseProgress } from '@/types';

const BRANCHES = [
  { value: 'CSE', label: 'CSE' },
  { value: 'IT', label: 'IT' },
  { value: 'ECE', label: 'ECE' },
  { value: 'EEE', label: 'EEE' },
  { value: 'MECH', label: 'MECH' },
  { value: 'CIVIL', label: 'CIVIL' },
  { value: 'ALL', label: 'All / Government Exam Prep (SSC, UPSC, Banking...)' },
  { value: 'Other', label: 'Other / Non-Engineering' },
];
const PREFERENCES = [
  { value: 'government_platform_first', label: 'Government Platforms First' },
  { value: 'fastest', label: 'Fastest to Complete' },
  { value: 'free_only', label: 'Free Only' },
];

export default function LearningPathwayPage() {
  const score = useAppStore(s => s.score);
  const queryClient = useQueryClient();
  const t = useT();

  const [skillGaps, setSkillGaps] = useState<string[]>(['System Design', 'SQL']);
  const [skillInput, setSkillInput] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [preference, setPreference] = useState('government_platform_first');

  // Personalize the default branch from the student's academic profile (year of study also
  // available on `academicProfile.yearOfStudy` for future fundamentals-vs-advanced filtering).
  useEffect(() => {
    (async () => {
      try {
        const response = await studentApi.academic.get();
        const profile = response.data?.data as AcademicProfile | undefined;
        if (profile?.branch) setBranch(profile.branch);
      } catch {
        // No academic profile yet — keep the default branch selection.
      }
    })();
  }, []);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skillGaps.includes(skill)) {
      setSkillGaps([...skillGaps, skill]);
      setSkillInput('');
    }
  };
  const removeSkill = (skill: string) => setSkillGaps(skillGaps.filter(s => s !== skill));

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['course-recommendations', skillGaps, branch, preference],
    queryFn: async () => {
      const response = await courseApi.recommend({
        skillGaps, branch: branch === 'Other' ? 'ALL' : branch, preference,
        currentReadiness: score?.readiness,
      });
      return (response.data?.data || null) as CourseRecommendations | null;
    },
  });

  const { data: govCertified } = useQuery({
    queryKey: ['courses-government-certified'],
    queryFn: async () => {
      const response = await courseApi.governmentCertified();
      return response.data?.data as { count: number } | undefined;
    },
  });

  const { data: pathway } = useQuery({
    queryKey: ['course-pathway'],
    queryFn: async () => {
      const response = await courseApi.getPathway();
      return (response.data?.data || []) as UserCourseProgress[];
    },
  });

  const savedCourseIds = new Set((pathway || []).map(p => p.courseId));

  const handleSave = async (courseId: number) => {
    try {
      await courseApi.save(courseId);
      toast.success('Added to your learning plan');
      queryClient.invalidateQueries({ queryKey: ['course-pathway'] });
    } catch {
      toast.error('Failed to save course');
    }
  };

  const renderGroup = (title: string, badge: string, entries: CourseRecommendationEntry[] | undefined) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
          {badge}
        </span>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      </div>
      {!entries || entries.length === 0 ? (
        <p className="text-sm text-slate-400">No courses in this bucket yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {entries.map(e => (
            <CourseCard key={e.course.id} course={e.course} matchScore={e.matchScore}
              onSave={handleSave} saved={savedCourseIds.has(e.course.id)} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-12 max-w-7xl">
      {/* Banner */}
      <div className="relative rounded-2xl p-6 border backdrop-blur-[20px] overflow-hidden bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, #38BDF8, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' }}>
            <GraduationCap className="text-white" size={26} />
          </div>
          <div>
            <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t('page.learning.title')}
            </h2>
            {govCertified && (
              <p className="text-sm font-bold text-amber-500 mt-1 flex items-center gap-1.5">
                <Award size={14} /> {govCertified.count} NPTEL & Government-Certified Courses Available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Skill gap input + preference */}
      <div className="relative rounded-2xl p-5 border backdrop-blur-[20px] space-y-4 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-sky-500" />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-500">Your Skill Gaps</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {skillGaps.map(s => (
            <span key={s} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              {s}
              <button onClick={() => removeSkill(s)}><X size={12} /></button>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="e.g. System Design"
            className="px-3 py-2 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          <button onClick={addSkill} className="px-4 py-2 rounded-xl text-sm font-bold border border-sky-500/30 text-sky-500">
            Add Gap
          </button>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              {BRANCHES.map(b => <option key={b.value} value={b.value} style={{ background: '#FFFFFF', color: '#0F172A' }}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Preference</label>
            <select value={preference} onChange={e => setPreference(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              {PREFERENCES.map(p => <option key={p.value} value={p.value} style={{ background: '#FFFFFF', color: '#0F172A' }}>{p.label}</option>)}
            </select>
          </div>
          <button onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' }}>
            Update Plan
          </button>
        </div>
      </div>

      {/* Readiness impact */}
      {recommendations && (
        <div className="relative rounded-2xl p-5 border backdrop-blur-[20px] flex items-center gap-4 bg-emerald-500/5 border-emerald-500/20">
          <TrendingUp className="text-emerald-500 flex-shrink-0" size={28} />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Completing these courses could improve your readiness score from{' '}
              <span className="text-emerald-500">{Math.round(recommendations.currentReadiness)}</span> to{' '}
              <span className="text-emerald-500">{Math.round(recommendations.estimatedReadinessAfter)}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar size={12} /> Estimated learning path: {recommendations.learningPathWeeks} weeks total
            </p>
          </div>
        </div>
      )}

      {/* Course groups */}
      {isLoading ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-3"></div>
          <p className="font-syne font-black text-slate-900 dark:text-white text-lg">Building your pathway...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderGroup('Start This Week', 'Highest Priority', recommendations?.startThisWeek)}
          {renderGroup('Next Month', 'Medium Priority', recommendations?.nextMonth)}
          {renderGroup('Long Term', 'Advanced', recommendations?.longTerm)}
        </div>
      )}
    </div>
  );
}

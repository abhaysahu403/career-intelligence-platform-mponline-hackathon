'use client';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  GraduationCap, Code2, BarChart3, Building2, CheckCircle2, Circle,
  Calendar, Target, Briefcase, TrendingUp, ArrowRight, MapPin,
} from 'lucide-react';
import { campusToCorporateApi } from '@/lib/api';
import type { CareerTarget, CareerTargetType, CampusToCorporateAnalysis } from '@/types';

const TYPE_LABELS: Record<CareerTargetType, string> = {
  PRIVATE_TECH: 'Private Tech Company',
  GOVERNMENT: 'Government Job',
  PSU: 'PSU',
  BANKING: 'Banking',
  DEFENCE: 'Defence',
  HIGHER_STUDIES: 'Higher Studies (GATE/CAT)',
  ENTREPRENEURSHIP: 'Entrepreneurship',
};
const TYPE_ORDER: CareerTargetType[] = ['PRIVATE_TECH', 'GOVERNMENT', 'PSU', 'BANKING', 'DEFENCE', 'HIGHER_STUDIES', 'ENTREPRENEURSHIP'];

const STATUS_COLOR: Record<string, string> = {
  GREEN: '#4ADE80',
  YELLOW: '#F59E0B',
  RED: '#EF4444',
};

export default function CampusToCorporatePage() {
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<CareerTargetType>('PRIVATE_TECH');
  const [targetCode, setTargetCode] = useState<string>('GOOGLE_SWE');

  const { data: allTargets } = useQuery({
    queryKey: ['career-targets-all'],
    queryFn: async () => {
      const response = await campusToCorporateApi.getTargets();
      return (response.data?.data || []) as CareerTarget[];
    },
  });

  const targetsByType = useMemo(() => {
    const grouped: Record<string, CareerTarget[]> = {};
    (allTargets || []).forEach(t => {
      grouped[t.targetType] = grouped[t.targetType] || [];
      grouped[t.targetType].push(t);
    });
    return grouped;
  }, [allTargets]);

  // Keep targetCode valid whenever the type changes
  useEffect(() => {
    const options = targetsByType[targetType];
    if (options && options.length > 0 && !options.some(t => t.targetCode === targetCode)) {
      setTargetCode(options[0].targetCode);
    }
  }, [targetType, targetsByType]);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['campus-to-corporate', targetCode],
    enabled: !!targetCode,
    queryFn: async () => {
      const response = await campusToCorporateApi.analyze(targetCode);
      return response.data?.data as CampusToCorporateAnalysis;
    },
  });

  const handleToggleMilestone = async (index: number, completed: boolean) => {
    try {
      await campusToCorporateApi.toggleMilestone(targetCode, index, completed);
      queryClient.invalidateQueries({ queryKey: ['campus-to-corporate', targetCode] });
    } catch {
      toast.error('Failed to update milestone');
    }
  };

  const completedCount = analysis?.actionPlan.filter(m => m.completed).length || 0;
  const totalMilestones = analysis?.actionPlan.length || 0;
  const currentReadiness = analysis?.currentProfile.readiness || 0;
  const targetReadiness = analysis?.targetRequirements.readinessRequired || 0;
  const bridgeFill = targetReadiness > 0 ? Math.min(100, (currentReadiness / targetReadiness) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 max-w-7xl">
      {/* Header + Target Selector */}
      <div className="relative rounded-2xl p-6 border backdrop-blur-[20px] overflow-hidden bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top left, #38BDF8, transparent 60%)' }} />
        <div className="relative">
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
            <MapPin className="text-sky-500" size={28} /> Campus to Corporate
          </h2>
          <p className="text-sm text-slate-500 mt-1">Your personalized journey from where you are to where you want to be.</p>

          <div className="flex flex-wrap gap-3 mt-4">
            <select value={targetType} onChange={e => setTargetType(e.target.value as CareerTargetType)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              {TYPE_ORDER.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <select value={targetCode} onChange={e => setTargetCode(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white min-w-[220px]">
              {(targetsByType[targetType] || []).map(t => (
                <option key={t.targetCode} value={t.targetCode}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading || !analysis ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-3"></div>
          <p className="font-syne font-black text-slate-900 dark:text-white text-lg">Mapping your journey...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={targetCode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Three Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* LEFT: Where You Are Today */}
              <div className="rounded-2xl p-5 border backdrop-blur-[20px] space-y-4 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Where You Are Today</h3>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-sky-500 flex items-center gap-1.5">
                    <GraduationCap size={13} /> Academic Standing
                  </p>
                  <Row label="CGPA" value={analysis.currentProfile.cgpa != null ? `${analysis.currentProfile.cgpa}/10` : '—'} />
                  <Row label="Branch" value={analysis.currentProfile.branch || '—'} />
                  <Row label="Year" value={analysis.currentProfile.yearOfStudy ? `Year ${analysis.currentProfile.yearOfStudy}` : '—'} />
                  <Row label="Backlogs" value={String(analysis.currentProfile.activeBacklogs ?? 0)} />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                    <Code2 size={13} /> Skills Snapshot
                  </p>
                  {analysis.currentProfile.skills.length === 0 ? (
                    <p className="text-xs text-slate-400">No skills on file yet — update your profile.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.currentProfile.skills.map(s => (
                        <span key={s} className="text-[9px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-1.5">
                    <BarChart3 size={13} /> Readiness Score
                  </p>
                  <Row label="Overall" value={`${Math.round(analysis.currentProfile.readiness)}/100`} />
                  <Row label="Technical" value={`${Math.round(analysis.currentProfile.technicalScore || 0)}/100`} />
                  <Row label="Communication" value={`${Math.round(analysis.currentProfile.communicationScore || 0)}/100`} />
                  <Row label="Domain" value={`${Math.round(analysis.currentProfile.domainScore || 0)}/100`} />
                </div>
              </div>

              {/* MIDDLE: The Gap (animated bridge) */}
              <div className="rounded-2xl p-5 border backdrop-blur-[20px] flex flex-col justify-between bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 text-center mb-4">The Gap</h3>

                <div className="flex items-center justify-between mb-2">
                  <div className="text-center">
                    <p className="text-3xl font-black text-sky-500">{Math.round(analysis.currentProfile.readiness)}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">You</p>
                  </div>
                  <ArrowRight className="text-slate-300 dark:text-white/20" size={20} />
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-500">{targetReadiness}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500 truncate max-w-[80px]">{analysis.targetRequirements.name.split(' ')[0]}</p>
                  </div>
                </div>

                {/* Bridge visual */}
                <div className="relative h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden my-4">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${bridgeFill}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Gap to close: <span className="text-red-500">{Math.round(analysis.gapPoints)} points</span>
                  </p>
                  <p className="text-xs text-slate-500">Time estimate: {analysis.estimatedDaysToReady} days</p>
                  <p className="text-xs text-slate-500">Actions needed: {totalMilestones}</p>
                </div>
              </div>

              {/* RIGHT: What Target Needs */}
              <div className="rounded-2xl p-5 border backdrop-blur-[20px] space-y-3 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Building2 size={13} /> What {analysis.targetRequirements.name.split(' — ')[0]} Needs
                </h3>
                <p className="text-sm font-black text-slate-900 dark:text-white">{analysis.targetRequirements.name}</p>

                <Row label="Required CGPA"
                  value={analysis.targetRequirements.minCgpa != null ? `${analysis.targetRequirements.minCgpa}+` : 'None'}
                  status={analysis.targetRequirements.cgpaMet ? 'GREEN' : 'RED'} />

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.gapAnalysis.filter(g => g.required).map(g => (
                      <span key={g.skill} className="text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ background: `${STATUS_COLOR[g.status]}20`, color: STATUS_COLOR[g.status] }}>
                        {g.status === 'GREEN' ? '✓' : '✗'} {g.skill}
                      </span>
                    ))}
                  </div>
                </div>

                {analysis.targetRequirements.interviewRounds != null && (
                  <Row label="Interview Rounds" value={String(analysis.targetRequirements.interviewRounds)} />
                )}
                {analysis.targetRequirements.avgPackageLpa != null && (
                  <Row label="Avg Package" value={`₹${analysis.targetRequirements.avgPackageLpa} LPA*`} />
                )}
                {analysis.targetRequirements.hiringMonths && (
                  <Row label="Hiring Season" value={analysis.targetRequirements.hiringMonths.join(', ')} />
                )}
                <p className="text-[9px] text-slate-400 italic">*Estimates for planning — verify on the official site.</p>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard icon={Calendar} label="Est. Days to Ready" value={analysis.estimatedDaysToReady} color="#38BDF8" />
              <MetricCard icon={Target} label="Skills Gap" value={analysis.gapAnalysis.filter(g => g.required && g.status === 'RED').length} color="#EF4444" />
              <MetricCard icon={CheckCircle2} label="Milestones Done" value={`${completedCount}/${totalMilestones}`} color="#4ADE80" />
              <MetricCard icon={Briefcase} label="Jobs Match" value={analysis.matchingJobsCount} color="#F59E0B" />
            </div>

            {/* 90-Day Action Plan Timeline */}
            <div className="rounded-2xl p-6 border backdrop-blur-[20px] space-y-6 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Your Action Plan</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analysis.actionPlan.map((m) => (
                  <motion.button
                    key={m.index}
                    onClick={() => handleToggleMilestone(m.index, !m.completed)}
                    whileHover={{ scale: 1.02 }}
                    className="text-left rounded-xl p-4 border transition-all"
                    style={{
                      borderColor: m.completed ? 'rgba(74,222,128,0.4)' : 'rgba(148,163,184,0.2)',
                      background: m.completed ? 'rgba(74,222,128,0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {m.completed ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Circle className="text-slate-400" size={18} />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">{m.phase}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{m.title}</p>
                    {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-white/5 text-sm font-bold">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle2 size={16} /> Completed: {completedCount}/{totalMilestones} milestones
                </span>
                <span className="flex items-center gap-1.5 text-sky-500">
                  <TrendingUp size={16} /> Readiness: {Math.round(analysis.currentProfile.readiness)}/100
                </span>
                {analysis.targetRequirements.hiringMonths && (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Calendar size={16} /> On track for: {analysis.targetRequirements.hiringMonths[0]} hiring season
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function Row({ label, value, status }: { label: string; value: string; status?: 'GREEN' | 'YELLOW' | 'RED' }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold" style={{ color: status ? STATUS_COLOR[status] : undefined }}>
        {value} {status === 'GREEN' && '✅'} {status === 'RED' && '❌'}
      </span>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl p-4 border backdrop-blur-[20px] text-center bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
      <Icon className="mx-auto mb-2" size={20} style={{ color }} />
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Radar, Briefcase, Users, AlertTriangle } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useT } from '@/lib/i18n';
import type { SkillGapOverview, RiskLevel } from '@/types';
import StatCard from '@/components/ui/StatCard';

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

// HIGH here means "high gap" (low cohort coverage of an in-demand skill), not high readiness
const gapColor = (status: RiskLevel) =>
  status === 'LOW' ? '#4ADE80' : status === 'MEDIUM' ? '#F59E0B' : '#EF4444';

export default function SkillGapPage() {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['skill-gap-overview'],
    queryFn: async () => unwrapPayload(await analyticsApi.skillGapOverview()) as SkillGapOverview,
  });

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent border-sky-500" />
          <p className="text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Aggregating market demand...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-100 dark:bg-sky/10 border border-sky-300 dark:border-sky/20 shadow-sm dark:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Radar size={24} className="text-sky-600 dark:text-sky" />
        </div>
        <div>
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t('page.skillGap.title')}
          </h2>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-500 mt-1">
            {t('page.skillGap.subtitle')}
          </p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard title="Active Job Postings" value={data.totalActiveJobs} icon={Briefcase} iconColor="#38BDF8" iconBg="rgba(56,189,248,0.15)" />
        <StatCard title="Cohort Size" value={data.totalStudents} icon={Users} iconColor="#0EA5E9" iconBg="rgba(14,165,233,0.15)" />
        <StatCard title="Critical Gaps" value={data.criticalGaps.length} icon={AlertTriangle} iconColor="#EF4444" iconBg="rgba(239,68,68,0.15)" />
      </div>

      {/* Top demanded skills vs. cohort coverage */}
      <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h3 className="mb-1 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Top Demanded Skills — Cohort Coverage</h3>
        <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400">% of students who already have each of the most-requested skills across active job postings</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.topDemandedSkills}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={70} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#38BDF8' }}
            />
            <Bar dataKey="coveragePct" radius={[8, 8, 0, 0]}>
              {data.topDemandedSkills.map((s) => (
                <Cell key={s.skill} fill={gapColor(s.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Critical gaps table */}
      <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h3 className="mb-1 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Critical Skill Gaps</h3>
        <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400">High industry demand, low cohort coverage — prioritize these in curriculum/training</p>

        {data.criticalGaps.length === 0 ? (
          <div className="py-10 text-center text-sm font-medium text-slate-500">No critical gaps right now.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                  <th className="pb-3 pr-4">Skill</th>
                  <th className="pb-3 pr-4">Jobs Requiring It</th>
                  <th className="pb-3 pr-4">Market Demand</th>
                  <th className="pb-3 pr-4">Cohort Coverage</th>
                  <th className="pb-3">Gap</th>
                </tr>
              </thead>
              <tbody>
                {data.criticalGaps.map((s) => (
                  <tr key={s.skill} className="border-b border-slate-100 dark:border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">{s.skill}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.demandCount}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.demandPct.toFixed(0)}%</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.studentsWithSkill} / {data.totalStudents} ({s.coveragePct.toFixed(0)}%)</td>
                    <td className="py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${gapColor(s.status)}20`, color: gapColor(s.status) }}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Building2, Users, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useT } from '@/lib/i18n';
import type { InstitutionOverview, RiskLevel } from '@/types';
import StatCard from '@/components/ui/StatCard';

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

const riskColor = (risk: RiskLevel) =>
  risk === 'LOW' ? '#4ADE80' : risk === 'MEDIUM' ? '#F59E0B' : '#EF4444';

const bandColor = (readiness: number) =>
  readiness >= 70 ? '#4ADE80' : readiness >= 50 ? '#F59E0B' : '#EF4444';

export default function InstitutionOverviewPage() {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['institution-overview'],
    queryFn: async () => unwrapPayload(await analyticsApi.institutionOverview()) as InstitutionOverview,
  });

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent border-sky-500" />
          <p className="text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Aggregating cohort data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-100 dark:bg-sky/10 border border-sky-300 dark:border-sky/20 shadow-sm dark:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Building2 size={24} className="text-sky-600 dark:text-sky" />
        </div>
        <div>
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t('page.facultyInstitution.title')}
          </h2>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-500 mt-1">
            {t('page.facultyInstitution.subtitle')}
          </p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Students" value={data.totalStudents} icon={Users} iconColor="#38BDF8" iconBg="rgba(56,189,248,0.15)" />
        <StatCard title="Avg Readiness" value={data.avgReadiness.toFixed(0)} icon={TrendingUp} iconColor="#0EA5E9" iconBg="rgba(14,165,233,0.15)" />
        <StatCard title="Job-Ready" value={data.jobReadyCount} icon={Target} iconColor="#4ADE80" iconBg="rgba(74,222,128,0.15)" />
        <StatCard title="At-Risk" value={data.atRiskCount} icon={AlertTriangle} iconColor="#EF4444" iconBg="rgba(239,68,68,0.15)" />
      </div>

      {/* Branch-wise readiness */}
      <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h3 className="mb-1 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Branch-wise Readiness</h3>
        <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400">Average readiness score per branch across the cohort</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.branchStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="branch" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#38BDF8' }}
            />
            <Bar dataKey="avgReadiness" radius={[8, 8, 0, 0]}>
              {data.branchStats.map((b) => (
                <Cell key={b.branch} fill={bandColor(b.avgReadiness)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* At-risk roster */}
      <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h3 className="mb-1 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">At-Risk Students</h3>
        <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400">Readiness below 50, sorted lowest first — prioritize outreach here</p>

        {data.atRiskStudents.length === 0 ? (
          <div className="py-10 text-center text-sm font-medium text-slate-500">No at-risk students right now.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">Branch</th>
                  <th className="pb-3 pr-4">Year</th>
                  <th className="pb-3 pr-4">CGPA</th>
                  <th className="pb-3 pr-4">Readiness</th>
                  <th className="pb-3 pr-4">Interview</th>
                  <th className="pb-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.atRiskStudents.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.branch}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.year ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.cgpa?.toFixed(1) ?? '—'}</td>
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">{s.readiness.toFixed(0)}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{s.interviewScore?.toFixed(0) ?? '—'}</td>
                    <td className="py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${riskColor(s.risk)}20`, color: riskColor(s.risk) }}
                      >
                        {s.risk}
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

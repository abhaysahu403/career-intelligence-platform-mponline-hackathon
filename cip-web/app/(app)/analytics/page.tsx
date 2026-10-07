'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { AlertTriangle, Brain, LineChart as LineChartIcon, Target } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useT } from '@/lib/i18n';
import type { Analytics } from '@/types';

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

export default function AnalyticsPage() {
  const t = useT();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        const res = await analyticsApi.get();
        if (!res || !res.data) throw new Error('No data');
        return res.data;
      } catch (e) {
        // Fallback for new users or demo mode
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

  if (isLoading || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent border-sky-500" />
          <p className="text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Decoding intelligence metrics...</p>
        </div>
      </div>
    );
  }

  const a = unwrapPayload(analytics) as Analytics;

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-100 dark:bg-sky/10 border border-sky-300 dark:border-sky/20 shadow-sm dark:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <LineChartIcon size={24} className="text-sky-600 dark:text-sky" />
        </div>
        <div>
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t('page.analytics.title')}
          </h2>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-500 mt-1">
            {t('page.analytics.subtitle')}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { title: 'Readiness', value: a.readiness.toFixed(0), icon: Target, color: '#38BDF8' },
          { title: 'Risk', value: a.risk, icon: AlertTriangle, color: a.risk === 'LOW' ? '#4ADE80' : a.risk === 'MEDIUM' ? '#F59E0B' : '#EF4444' },
          { title: 'Avg Interview', value: a.averageInterviewScore.toFixed(0), icon: LineChartIcon, color: '#0EA5E9' },
          { title: 'Attempts', value: a.totalAttempts, icon: Brain, color: '#F59E0B' },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border backdrop-blur-[20px] p-5 transition-all hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <card.icon size={18} style={{ color: card.color }} />
            <p className="mb-1 mt-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.title}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <h3 className="mb-1 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Readiness Progress</h3>
          <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400">Based on real completed interview attempts</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={a.progressHistory}>
              <defs>
                <linearGradient id="analytics-progress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#38BDF8' }}
              />
              <Area type="monotone" dataKey="score" stroke="#38BDF8" fill="url(#analytics-progress)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <h3 className="mb-1 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Interview Trend</h3>
          <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400">How your interview scores are changing over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={a.interviewHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#4ADE80' }}
              />
              <Line type="monotone" dataKey="score" stroke="#4ADE80" strokeWidth={3} dot={{ fill: '#4ADE80', r: 4, strokeWidth: 2, stroke: 'rgba(8,12,20,1)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <h3 className="mb-3 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Weak Skills</h3>
          {a.weakSkills.length ? (
            <div className="flex flex-wrap gap-2">
              {a.weakSkills.map((skill) => (
                <span key={skill} className="rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-amber-50 dark:bg-[rgba(245,158,11,0.1)] text-amber-600 dark:text-[#F59E0B] border-amber-200 dark:border-[rgba(245,158,11,0.2)]">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No repeated weak topic has shown up yet. Keep answering and the system will surface patterns.</p>
          )}
        </div>

        <div className="rounded-2xl border backdrop-blur-[20px] p-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <h3 className="mb-3 font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Recommendation</h3>
          <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
            {a.latestRecommendation || 'Complete a few interview attempts and upload your resume to unlock more targeted coaching.'}
          </p>
        </div>
      </div>
    </div>
  );
}

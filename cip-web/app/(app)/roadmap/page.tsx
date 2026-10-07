'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  BookOpen, FolderOpen, Video, Briefcase,
  ExternalLink, Trophy, Zap, AlertTriangle
} from 'lucide-react';
import { roadmapApi, analyticsApi } from '@/lib/api';
import { useAppStore } from '@/store';
import { useT } from '@/lib/i18n';
import type { RoadmapTask, Analytics } from '@/types';

const categoryConfig = {
  skill:     { icon: BookOpen,    color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  label: 'Skill' },
  project:   { icon: FolderOpen,  color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', label: 'Project' },
  interview: { icon: Video,       color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', label: 'Interview' },
  apply:     { icon: Briefcase,   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',label: 'Apply' },
} as const;

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

export default function RoadmapPage() {
  const qc = useQueryClient();
  const score = useAppStore(s => s.score);
  const t = useT();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1, 2]));

  const { data: tasks } = useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      try { 
        const payload: any = unwrapPayload(await roadmapApi.get());
        if (Array.isArray(payload)) return payload as RoadmapTask[];
        if (payload && typeof payload === 'object' && 'phases' in payload) {
          return payload.phases.map((p: any) => ({
             id: `phase-${p.phase}`,
             week: p.phase,
             task: p.title,
             description: `Topics: ${p.topics?.join(', ')}`,
             completed: p.completed ?? false,
             category: p.title.toLowerCase().includes('interview') ? 'interview' : 'skill',
             resources: payload.resources?.slice(0, 2) ?? []
          })) as RoadmapTask[];
        }
        return [];
      }
      catch (error) { 
        console.error('Failed to fetch roadmap:', error);
        return []; 
      }
    },
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await analyticsApi.get()).data,
  });
  const analytics = analyticsData ? unwrapPayload(analyticsData) as Analytics : null;

  // Weakness → study plan mapping
  const weaknessPlan: Record<string, { tasks: string[]; resources: { title: string; url: string }[] }> = {
    'time complexity': {
      tasks: ['Review Big-O notation fundamentals', 'Analyze complexity of 10 common algorithms', 'Practice explaining complexity in mock interviews'],
      resources: [{ title: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/' }],
    },
    'edge cases': {
      tasks: ['Always check null/empty inputs first', 'Practice boundary value analysis', 'Solve 5 problems focusing on edge cases'],
      resources: [{ title: 'LeetCode Edge Cases', url: 'https://leetcode.com/explore/' }],
    },
    'system design': {
      tasks: ['Study URL shortener design pattern', 'Practice drawing system diagrams', 'Take an AI interview focused on System Design'],
      resources: [{ title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }],
    },
    'database': {
      tasks: ['Review indexing & query optimization', 'Practice SQL joins and subqueries', 'Study database normalization'],
      resources: [{ title: 'SQL Practice', url: 'https://www.hackerrank.com/domains/sql' }],
    },
    'communication': {
      tasks: ['Use STAR method for behavioral questions', 'Practice structured answers: First → Then → Finally', 'Record yourself answering 3 questions'],
      resources: [{ title: 'STAR Method Guide', url: 'https://www.themuse.com/advice/star-interview-method' }],
    },
    'dsa': {
      tasks: ['Solve 5 Binary Tree problems (Easy → Medium)', 'Implement BFS and DFS from scratch', 'Study tree traversal patterns'],
      resources: [{ title: 'NeetCode 150', url: 'https://neetcode.io/practice' }],
    },
    'oop': {
      tasks: ['Review SOLID principles', 'Implement 3 design patterns', 'Practice explaining polymorphism and inheritance'],
      resources: [{ title: 'Refactoring Guru', url: 'https://refactoring.guru/design-patterns' }],
    },
  };

  const allTasks  = tasks ?? [];
  const completed = allTasks.filter(t => t.completed).length;
  const total     = allTasks.length;
  const pct       = total > 0 ? Math.round(completed / total * 100) : 0;

  const weeks = Array.from(new Set(allTasks.map(t => t.week))).sort((a, b) => a - b);

  const toggleWeek = (w: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
  };

  const handleToggle = (task: RoadmapTask) => {
    if (task.completed) return;
    // optimistic
    const updated = allTasks.map(t => t.id === task.id ? { ...t, completed: true } : t);
    qc.setQueryData(['roadmap'], updated);
    toast.success(`"${task.task}" completed! 🎉`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      {/* Progress overview */}
      <div className="rounded-[32px] p-6 border relative overflow-hidden backdrop-blur-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none rounded-full"
          style={{ background:'radial-gradient(circle,#38BDF8,transparent 70%)', transform:'translate(30%,-30%)' }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={24} className="text-amber-400" />
              <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {t('page.roadmap.title')}
              </h2>
            </div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mt-1">
              {t('page.roadmap.subtitle')}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full progress-animate"
                  style={{ width:`${pct}%`, background: 'linear-gradient(90deg, #38BDF8, #4ADE80)', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }} />
              </div>
              <span className="text-sm font-black tabular-nums text-slate-300">
                {completed}/{total}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="text-center flex-shrink-0">
              <p className="text-4xl font-black text-sky drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>{pct}%</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Complete</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const toast = (await import('react-hot-toast')).default;
                  toast.loading('Generating roadmap PDF...');
                  
                  const response = await roadmapApi.downloadRoadmap({ tasks: allTasks });
                  
                  const blob = new Blob([response.data], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `ai-roadmap-${new Date().toISOString().split('T')[0]}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  toast.dismiss();
                  toast.success('Roadmap downloaded! Open in browser and print to PDF.');
                } catch (error) {
                  const toast = (await import('react-hot-toast')).default;
                  toast.dismiss();
                  toast.error('Failed to generate roadmap. Please try again.');
                  console.error('Download error:', error);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Category stats */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Object.entries(categoryConfig).map(([cat, cfg]) => {
            const catTasks = allTasks.filter(t => t.category === cat);
            const done     = catTasks.filter(t => t.completed).length;
            return (
              <div key={cat} className="text-center p-2 rounded-xl border backdrop-blur-[10px] transition-all hover:-translate-y-1 bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]">
                <cfg.icon size={16} className="mx-auto mb-1" style={{ color: cfg.color }} />
                <p className="text-sm font-black text-slate-900 dark:text-white">{done}/{catTasks.length}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI-Detected Gaps → Dynamic Study Plan */}
      {analytics && analytics.weakSkills.length > 0 && (
        <div className="rounded-2xl border p-5 backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Dynamic Gap Study Plan
            </h3>
          </div>
          <div className="space-y-4">
            {analytics.weakSkills.slice(0, 3).map((skill, idx) => {
              const plan = weaknessPlan[skill.toLowerCase()] ?? {
                tasks: ['Practice this topic in your next interview session', 'Review fundamentals and core concepts'],
                resources: [],
              };
              const priority = idx === 0 ? 'HIGH' : idx === 1 ? 'MEDIUM' : 'LOW';
              const prColor = priority === 'HIGH' ? '#EF4444' : priority === 'MEDIUM' ? '#F59E0B' : '#38BDF8';
              const prBg = priority === 'HIGH' ? 'rgba(239,68,68,0.05)' : priority === 'MEDIUM' ? 'rgba(245,158,11,0.05)' : 'rgba(56,189,248,0.05)';
              return (
                <div key={skill} className="rounded-xl border p-4 shadow-lg transition-all hover:translate-x-1" style={{ borderColor: `${prColor}40`, background: prBg }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                      style={{ background: 'rgba(255,255,255,0.05)', color: prColor, border: `1px solid ${prColor}40` }}>
                      {priority}
                    </span>
                    <span className="text-sm font-black capitalize text-slate-900 dark:text-white">{skill}</span>
                  </div>
                  <div className="space-y-2 ml-1">
                    {plan.tasks.map(task => (
                      <div key={task} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: prColor, boxShadow: `0 0 8px ${prColor}` }} />
                        <span className="text-sm font-medium text-slate-300">{task}</span>
                      </div>
                    ))}
                  </div>
                  {plan.resources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {plan.resources.map(res => (
                        <a key={res.url} href={res.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-black uppercase tracking-widest transition-all hover:text-sky text-slate-600 dark:text-slate-400">
                          <ExternalLink size={12} />{res.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week-wise timeline */}
      <div className="space-y-3">
        {weeks.map(week => {
          const weekTasks = allTasks.filter(t => t.week === week);
          const weekDone  = weekTasks.filter(t => t.completed).length;
          const expanded  = expandedWeeks.has(week);
          const allDone   = weekDone === weekTasks.length;

          return (
            <div key={week} className={`rounded-2xl border overflow-hidden backdrop-blur-[20px] transition-all bg-white dark:bg-[rgba(8,12,20,0.7)] ${allDone ? '' : 'border-slate-200 dark:border-[rgba(255,255,255,0.06)]'}`}
              style={allDone ? { borderColor: 'rgba(74,222,128,0.3)' } : undefined}>
              {/* Week header */}
              <button onClick={() => toggleWeek(week)}
                className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
                style={{ textAlign:'left' }}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg border`}
                    style={allDone
                      ? { background:'rgba(74,222,128,0.1)', color:'#4ADE80', borderColor:'rgba(74,222,128,0.3)' }
                      : { background:'rgba(56,189,248,0.1)', color:'#38BDF8', borderColor:'rgba(56,189,248,0.3)' }}>
                    {allDone ? <CheckCircle2 size={20} /> : week}
                  </div>
                  <div>
                    <p className="font-syne font-black text-slate-900 dark:text-white text-base">Week {week}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{weekDone}/{weekTasks.length} tasks done</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-24 rounded-full overflow-hidden bg-slate-200 dark:bg-[rgba(255,255,255,0.05)]">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width:`${weekDone/weekTasks.length*100}%`, background: 'linear-gradient(90deg, #38BDF8, #4ADE80)', boxShadow: '0 0 10px rgba(56,189,248,0.3)' }} />
                  </div>
                  {expanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </div>
              </button>

              {/* Tasks */}
              {expanded && (
                <div className="border-t border-slate-200 dark:border-white/5 px-4 pb-4 pt-4 space-y-3 bg-slate-50 dark:bg-[rgba(255,255,255,0.01)]">
                  {weekTasks.map(task => {
                    const cfg = categoryConfig[task.category];
                    return (
                      <div key={task.id}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl ${task.completed ? '' : 'bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]'}`}
                        style={task.completed ? {
                          background: 'rgba(74,222,128,0.05)',
                          borderColor: 'rgba(74,222,128,0.2)',
                        } : undefined}
                        onClick={() => handleToggle(task)}>
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mt-1">
                          {task.completed
                            ? <CheckCircle2 size={20} className="text-mint" style={{ filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.5))' }} />
                            : <Circle size={20} className="text-slate-600 transition-colors hover:text-sky" />
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                              {task.task}
                            </p>
                            <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg flex-shrink-0 uppercase border tracking-widest"
                              style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>
                              <cfg.icon size={11} />
                              {cfg.label}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs mt-2 font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{task.description}</p>
                          )}
                          {task.resources && task.resources.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
                              {task.resources.map(res => (
                                <a key={res.url} href={res.url} target="_blank" rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-sky transition-colors">
                                  <ExternalLink size={12} />{res.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion nudge */}
      {pct < 100 && (
        <div className="rounded-2xl p-5 border backdrop-blur-[20px] flex items-start gap-4 transition-all hover:border-sky/40 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <Zap size={20} className="flex-shrink-0 mt-0.5 text-sky" style={{ filter: 'drop-shadow(0 0 5px rgba(56,189,248,0.5))' }} />
          <div>
            <p className="text-sm font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {total - completed} tasks remaining
            </p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Completing your roadmap can boost your readiness score by up to 25 points.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

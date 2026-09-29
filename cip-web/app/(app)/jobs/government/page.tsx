'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Landmark, Filter, X, Sparkles } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import GovernmentJobCard from '@/components/ui/GovernmentJobCard';
import JobsTabSwitcher from '@/components/ui/JobsTabSwitcher';
import type { GovernmentJob, GovernmentJobRecommendation } from '@/types';

const CATEGORIES = ['All Categories', 'CENTRAL_GOVT', 'STATE_GOVT', 'PSU', 'BANKING', 'RAILWAY', 'DEFENCE'];
const CATEGORY_LABELS: Record<string, string> = {
  'All Categories': 'All Categories',
  CENTRAL_GOVT: 'Central Government',
  STATE_GOVT: 'State Government',
  PSU: 'PSU',
  BANKING: 'Banking',
  RAILWAY: 'Railway',
  DEFENCE: 'Defence',
};
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL'];

export default function GovernmentJobsPage() {
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [branch, setBranch] = useState('CSE');
  const [cgpa, setCgpa] = useState(7.0);
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear());

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['government-jobs', categoryFilter],
    queryFn: async () => {
      const params = categoryFilter !== 'All Categories' ? { category: categoryFilter } : undefined;
      const response = await jobsApi.government.list(params);
      return (response.data?.data || []) as GovernmentJob[];
    },
  });

  const { data: recommended, isLoading: loadingRecommended, refetch: refetchRecommended } = useQuery({
    queryKey: ['government-jobs-recommended', branch, cgpa, graduationYear],
    queryFn: async () => {
      const response = await jobsApi.government.recommended({ branch, cgpa, graduationYear });
      return (response.data?.data || []) as GovernmentJobRecommendation[];
    },
  });

  const clearFilters = () => setCategoryFilter('All Categories');

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      <JobsTabSwitcher active="government" />

      {/* Banner */}
      <div className="relative rounded-2xl p-6 border backdrop-blur-[20px] overflow-hidden bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, #F59E0B, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
            <Landmark className="text-white" size={26} />
          </div>
          <div>
            <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Government Career Opportunities
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {loadingJobs ? 'Loading...' : `${jobs?.length ?? 0} listings across Central, State, PSU, Banking, Railway & Defence`}
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommended section */}
      <div className="relative rounded-2xl p-5 border backdrop-blur-[20px] space-y-4 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-sky-500" />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-500">AI Recommended For You</p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">CGPA</label>
            <input type="number" min={0} max={10} step={0.1} value={cgpa}
              onChange={e => setCgpa(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Graduation Year</label>
            <input type="number" value={graduationYear}
              onChange={e => setGraduationYear(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl text-sm font-bold border outline-none bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          </div>
          <button onClick={() => refetchRecommended()}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' }}>
            Get Recommendations
          </button>
        </div>

        {loadingRecommended ? (
          <div className="text-center py-8 text-sm text-slate-400">Finding your best matches...</div>
        ) : recommended && recommended.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recommended.slice(0, 5).map(rec => (
              <GovernmentJobCard key={rec.job.id} job={rec.job} matchScore={rec.matchScore} eligibilityStatus={rec.eligibilityStatus} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-4">No recommendations yet — set your branch/CGPA/graduation year above.</p>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className="px-3 py-2 rounded-xl text-xs font-bold border transition-all"
            style={categoryFilter === c
              ? { background: 'rgba(56,189,248,0.12)', borderColor: 'rgba(56,189,248,0.3)', color: '#38BDF8' }
              : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
        {categoryFilter !== 'All Categories' && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* All listings */}
      {loadingJobs ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-3"></div>
          <p className="font-syne font-black text-slate-900 dark:text-white text-lg">Loading government jobs...</p>
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <p className="font-syne font-black text-slate-900 dark:text-white text-lg">No listings in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map(job => <GovernmentJobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}

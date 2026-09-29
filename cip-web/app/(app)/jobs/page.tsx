'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Filter, Zap, X, Share2 } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import JobCard from '@/components/ui/JobCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import JobsTabSwitcher from '@/components/ui/JobsTabSwitcher';
import { useAppStore } from '@/store';
import type { Job } from '@/types';
import ShareReportModal from '@/components/ui/ShareReportModal';

const ROLES     = ['All Roles', 'Software', 'Engineer', 'Developer', 'Backend', 'Frontend', 'Full Stack', 'Data', 'DevOps', 'QA', 'Intern', 'Analyst'];
const LOCATIONS = ['All Locations', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Delhi', 'Pune', 'Mumbai', 'Chennai', 'Noida', 'Gurgaon', 'Remote', 'India'];
const TYPES     = ['All Types', 'Internship', 'Full-time', 'Part-time', 'Contract'];
const EXPERIENCE = ['All Levels', 'Fresher', 'Junior', 'Mid', 'Senior'];

export default function JobsPage() {
  const user = useAppStore(s => s.user);
  const score = useAppStore(s => s.score);
  const [search, setSearch]               = useState('');
  const [roleFilter, setRoleFilter]       = useState('All Roles');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [typeFilter, setTypeFilter]       = useState('All Types');
  const [experienceFilter, setExperienceFilter] = useState('All Levels');
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [minMatch, setMinMatch]           = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch recommended jobs (with full intelligence)
  const { data: recommendedJobs, isLoading: loadingRecommended } = useQuery({
    queryKey: ['jobs-recommended', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      try {
        const response = await jobsApi.recommended();
        const data = response.data?.data || response.data || [];
        
        console.log('📊 [Jobs] Recommended response:', data);
        
        return data.map((item: any) => ({
          id: item.jobId,
          company: item.company,
          role: item.jobTitle || item.role,
          location: item.location || 'Unknown',
          type: normalizeEmploymentType(item.employmentType),
          match: item.matchScore || 0,
          minScore: 0,
          salary: item.salaryRange,
          skills: item.matchedSkills || [],
          matchedSkills: item.matchedSkills || [],
          missingSkills: item.missingSkills || [],
          matchReason: item.reason,
          nextStep: item.nextStep,
          readinessLevel: item.readinessLevel,
          url: item.applyLink || item.sourceUrl || '#',
          applyLink: item.applyLink,
          isRecommended: true,
          experienceLevel: item.experienceLevel,
          description: item.description,
          mode: item.mode,
        } satisfies Job));
      } catch (error) {
        console.error('❌ [Jobs] Failed to fetch recommended:', error);
        return [] as Job[];
      }
    },
  });

  // Fetch all jobs (fallback for non-recommended)
  const { data: allJobs, isLoading: loadingAll } = useQuery({
    queryKey: ['jobs-all'],
    queryFn: async () => {
      try {
        const response = await jobsApi.list({ page: 0, size: 100 });
        const payload = response.data?.data || response.data || {};
        const items = payload.content || [];
        
        console.log('📊 [Jobs] All jobs response:', items.length, 'jobs');
        
        return items.map((item: any) => ({
          id: item.id,
          company: item.company,
          role: item.role,
          location: item.location || 'Unknown',
          type: normalizeEmploymentType(item.employmentType),
          match: 50, // Default match for non-recommended
          minScore: item.minimumReadinessScore || 0,
          salary: item.salaryRange,
          skills: item.requiredSkills || [],
          url: item.applyLink || item.sourceUrl || '#',
          applyLink: item.applyLink,
          isRecommended: false,
          experienceLevel: item.experienceLevel,
          description: item.description,
        } satisfies Job));
      } catch (error) {
        console.error('❌ [Jobs] Failed to fetch all jobs:', error);
        return [] as Job[];
      }
    },
  });

  // Merge jobs: prioritize recommended, then add non-recommended
  const recommendedIds = new Set((recommendedJobs || []).map((j: Job) => j.id));
  const nonRecommendedJobs = (allJobs || []).filter((j: Job) => !recommendedIds.has(j.id));
  const mergedJobs = [...(recommendedJobs || []), ...nonRecommendedJobs];

  console.log('📊 [Jobs] Merged:', mergedJobs.length, 'total (', recommendedJobs?.length, 'recommended +', nonRecommendedJobs.length, 'others)');

  // Apply filters with flexible matching
  const filtered = mergedJobs.filter(j => {
    // Only recommended filter
    if (onlyRecommended && !j.isRecommended) return false;
    
    // Role filter - flexible matching
    if (roleFilter !== 'All Roles') {
      const roleLower = j.role.toLowerCase();
      const filterLower = roleFilter.toLowerCase();
      
      // Check if role contains any part of the filter
      const roleWords = filterLower.split(' ');
      const roleMatch = roleWords.some(word => roleLower.includes(word));
      
      if (!roleMatch) return false;
    }
    
    // Location filter - flexible matching
    if (locationFilter !== 'All Locations') {
      const locationLower = j.location.toLowerCase();
      const filterLower = locationFilter.toLowerCase();
      
      // Match if location contains filter OR if it's remote
      const locationMatch = locationLower.includes(filterLower) || 
                           (filterLower === 'remote' && locationLower.includes('remote'));
      
      if (!locationMatch) return false;
    }
    
    // Type filter - exact match on normalized type
    if (typeFilter !== 'All Types') {
      if (j.type !== typeFilter) return false;
    }
    
    // Experience filter - flexible matching
    if (experienceFilter !== 'All Levels') {
      const expLower = (j.experienceLevel || '').toLowerCase();
      const filterLower = experienceFilter.toLowerCase();
      
      // Match if experience level contains filter
      const expMatch = expLower.includes(filterLower);
      
      if (!expMatch) return false;
    }
    
    // Match percentage filter
    if (minMatch > 0 && j.match < minMatch) return false;
    
    // Search filter - flexible matching
    if (search) {
      const searchLower = search.toLowerCase();
      const companyMatch = j.company.toLowerCase().includes(searchLower);
      const roleMatch = j.role.toLowerCase().includes(searchLower);
      const locationMatch = j.location.toLowerCase().includes(searchLower);
      
      if (!companyMatch && !roleMatch && !locationMatch) return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setSearch(''); 
    setRoleFilter('All Roles'); 
    setLocationFilter('All Locations');
    setTypeFilter('All Types'); 
    setExperienceFilter('All Levels');
    setMinMatch(0); 
    setOnlyRecommended(false);
  };
  
  const hasFilters = search || roleFilter !== 'All Roles' || locationFilter !== 'All Locations' ||
                     typeFilter !== 'All Types' || experienceFilter !== 'All Levels' || minMatch > 0 || onlyRecommended;

  const isLoading = loadingRecommended || loadingAll;

  // Debug info
  console.log('🔍 [Jobs Debug]', {
    total: mergedJobs.length,
    recommended: recommendedJobs?.length || 0,
    nonRecommended: nonRecommendedJobs.length,
    filtered: filtered.length,
    filters: {
      role: roleFilter,
      location: locationFilter,
      type: typeFilter,
      experience: experienceFilter,
      minMatch,
      onlyRecommended,
      search
    }
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      <JobsTabSwitcher active="private" />

      {/* Header + Score mini */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
            Job Magic Engine
          </h2>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mt-1">
            {isLoading ? 'Loading...' : `${filtered.length} opportunities matched • AI-powered recommendations`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Share Button */}
          {recommendedJobs && recommendedJobs.length > 0 && (
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 rounded-2xl border flex items-center gap-2 backdrop-blur-[20px] transition-all hover:border-sky/40 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)] text-slate-700 dark:text-slate-300 font-bold hover:bg-sky-500/10"
            >
              <Share2 size={18} />
              Share Jobs
            </button>
          )}
          {score && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border flex-shrink-0 backdrop-blur-[20px] transition-all hover:border-sky/40 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
              <ScoreCircle score={score.readiness} size={52} strokeWidth={6} showLevel={false} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Your Score</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{score.level}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl p-4 border backdrop-blur-[20px] space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        {/* Search + recommended toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search companies or roles…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all text-slate-900 dark:text-white placeholder-slate-500 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" />
          </div>
          <button onClick={() => setOnlyRecommended(!onlyRecommended)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex-shrink-0 shadow-sm"
            style={onlyRecommended
              ? { background:'rgba(56,189,248,0.1)', borderColor:'rgba(56,189,248,0.3)', color:'#38BDF8' }
              : { background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.1)', color:'#94A3B8' }}>
            <Zap size={15} className={onlyRecommended ? "text-sky" : "text-slate-500"} /> Only Recommended
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {ROLES.map(r => <option key={r} value={r} style={{ background: '#0F172A', color: '#F8FAFC' }}>{r}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {LOCATIONS.map(l => <option key={l} value={l} style={{ background: '#0F172A', color: '#F8FAFC' }}>{l}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {TYPES.map(t => <option key={t} value={t} style={{ background: '#0F172A', color: '#F8FAFC' }}>{t}</option>)}
          </select>
          <select value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {EXPERIENCE.map(e => <option key={e} value={e} style={{ background: '#0F172A', color: '#F8FAFC' }}>{e}</option>)}
          </select>
          <select value={minMatch} onChange={e => setMinMatch(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            <option value={0} style={{ background: '#0F172A', color: '#F8FAFC' }}>Any Match</option>
            <option value={60} style={{ background: '#0F172A', color: '#F8FAFC' }}>60%+ Match</option>
            <option value={75} style={{ background: '#0F172A', color: '#F8FAFC' }}>75%+ Match</option>
            <option value={85} style={{ background: '#0F172A', color: '#F8FAFC' }}>85%+ Match</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Jobs',     value: mergedJobs.length,                         color: '#38BDF8' },
          { label: 'Filtered',       value: filtered.length,                           color: '#4ADE80' },
          { label: 'Recommended',    value: filtered.filter(j=>j.isRecommended).length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl p-4 border backdrop-blur-[20px] text-center transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <p className="text-3xl font-black font-syne" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-black mt-1 text-slate-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky mx-auto mb-3"></div>
          <p className="font-syne font-black text-slate-900 dark:text-white text-lg">Loading jobs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <Filter size={32} className="mx-auto mb-3 text-sky" />
          <p className="font-syne font-black text-slate-900 dark:text-white text-lg">No jobs match your filters</p>
          <p className="text-sm mt-1 font-medium text-slate-400">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(job => (
            <div key={`${job.id}-${job.isRecommended ? 'rec' : 'all'}`} className="relative">
              <JobCard job={job} />
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <ShareReportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        reportType="jobs"
        reportData={{
          userId: Number(user?.id) || 1,
          jobIds: recommendedJobs?.map((j: any) => j.id) || []
        }}
      />
    </div>
  );
}

function normalizeEmploymentType(type?: string): 'Full-time' | 'Internship' | 'Part-time' | 'Contract' {
  if (!type) return 'Full-time';
  const lower = type.toLowerCase();
  if (lower.includes('intern')) return 'Internship';
  if (lower.includes('part')) return 'Part-time';
  if (lower.includes('contract') || lower.includes('freelance')) return 'Contract';
  return 'Full-time';
}

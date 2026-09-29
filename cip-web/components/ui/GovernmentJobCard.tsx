'use client';
import { MapPin, Calendar, ExternalLink, Award, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { GovernmentJob, EligibilityStatus } from '@/types';

interface Props {
  job: GovernmentJob;
  matchScore?: number;
  eligibilityStatus?: EligibilityStatus;
}

const CATEGORY_LABELS: Record<string, string> = {
  CENTRAL_GOVT: 'Central Government',
  STATE_GOVT: 'State Government',
  PSU: 'PSU',
  BANKING: 'Banking',
  RAILWAY: 'Railway',
  DEFENCE: 'Defence',
};

const STATUS_STYLE: Record<EligibilityStatus, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  ELIGIBLE: { color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', icon: CheckCircle2, label: 'Eligible' },
  PARTIALLY_ELIGIBLE: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: AlertCircle, label: 'Partially Eligible' },
  NOT_ELIGIBLE: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle, label: 'Not Eligible' },
};

export default function GovernmentJobCard({ job, matchScore, eligibilityStatus }: Props) {
  const isRecommended = matchScore !== undefined;
  const status = eligibilityStatus ? STATUS_STYLE[eligibilityStatus] : null;
  const StatusIcon = status?.icon;

  return (
    <div className="relative rounded-2xl p-5 border backdrop-blur-[20px] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-[rgba(8,12,20,0.7)]"
      style={{
        borderColor: isRecommended ? 'rgba(56,189,248,0.4)' : undefined,
        boxShadow: isRecommended
          ? '0 8px 30px -10px rgba(56,189,248,0.3), inset 0 0 30px rgba(56,189,248,0.1)'
          : '0 4px 15px -5px rgba(0,0,0,0.08)',
      }}
    >
      {isRecommended && matchScore !== undefined && matchScore >= 60 && (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full self-start"
          style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}>
          <Award size={11} /> Best Match
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-black shadow-lg"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}>
          {job.organization.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white truncate">{job.title}</p>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mt-0.5 truncate">{job.organization}</p>
        </div>
        {matchScore !== undefined && (
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}>
            {matchScore}% match
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
          {CATEGORY_LABELS[job.category] || job.category}
        </span>
        {job.examCycle && (
          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" />{job.examCycle}</span>
        )}
        {job.salary && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" />{job.salary}</span>}
      </div>

      {status && StatusIcon && (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl w-fit"
          style={{ background: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
          <StatusIcon size={12} /> {status.label}
        </div>
      )}

      {job.eligibility && (
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{job.eligibility}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(job.eligibleBranches || []).slice(0, 5).map(b => (
          <span key={b} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg text-slate-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            {b}
          </span>
        ))}
      </div>

      <a href={job.applicationLink} target="_blank" rel="noreferrer"
        className="mt-2 flex-1 flex justify-center items-center gap-2 py-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white hover:bg-sky-500/10 hover:border-sky-500/40"
        style={{ borderColor: 'rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.05)' }}>
        Apply on Official Site <ExternalLink size={14} />
      </a>
    </div>
  );
}

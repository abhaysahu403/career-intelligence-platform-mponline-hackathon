'use client';
import Link from 'next/link';
import { Briefcase, Landmark } from 'lucide-react';

export default function JobsTabSwitcher({ active }: { active: 'private' | 'government' }) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-2xl border w-fit bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
      <Link href="/jobs"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        style={active === 'private'
          ? { background: 'rgba(56,189,248,0.12)', color: '#38BDF8' }
          : { color: '#94A3B8' }}>
        <Briefcase size={14} /> Private Jobs
      </Link>
      <Link href="/jobs/government"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        style={active === 'government'
          ? { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }
          : { color: '#94A3B8' }}>
        <Landmark size={14} /> Government Jobs
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500 text-white">NEW</span>
      </Link>
    </div>
  );
}

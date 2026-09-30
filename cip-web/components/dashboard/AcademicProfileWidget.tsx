'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, ArrowRight, Award, Briefcase } from 'lucide-react';
import { studentApi, jobsApi } from '@/lib/api';
import type { AcademicProfile, AcademicProfileCompleteness } from '@/types';

export default function AcademicProfileWidget() {
  const { data: profile } = useQuery({
    queryKey: ['academic-profile-widget'],
    queryFn: async () => {
      try {
        const response = await studentApi.academic.get();
        return (response.data?.data || null) as AcademicProfile | null;
      } catch {
        return null;
      }
    },
  });

  const { data: completeness } = useQuery({
    queryKey: ['academic-completeness-widget'],
    queryFn: async () => {
      const response = await studentApi.academic.getCompleteness();
      return response.data?.data as AcademicProfileCompleteness | undefined;
    },
  });

  const { data: eligibleCount } = useQuery({
    queryKey: ['gov-jobs-eligible-count', profile?.branch, profile?.currentCgpa],
    enabled: !!(profile?.branch && profile?.currentCgpa),
    queryFn: async () => {
      const response = await jobsApi.government.eligibleCount(profile!.branch!, profile!.currentCgpa!);
      return response.data?.data?.eligibleCount as number | undefined;
    },
  });

  if (!profile) {
    return (
      <div className="rounded-2xl p-5 border backdrop-blur-[20px] flex items-center justify-between gap-4 bg-amber-500/5 border-amber-500/20">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-amber-500" size={24} />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Complete your Academic Profile</p>
            <p className="text-xs text-slate-500">Unlock personalized job matches, course recommendations, and eligibility checks.</p>
          </div>
        </div>
        <Link href="/profile/academic" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
          Start <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 border backdrop-blur-[20px] space-y-3 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-sky-500" size={18} />
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {profile.collegeName || 'Your College'} | {profile.branch} {profile.yearOfStudy}{profile.yearOfStudy === 1 ? 'st' : profile.yearOfStudy === 2 ? 'nd' : profile.yearOfStudy === 3 ? 'rd' : 'th'} Year
          </p>
        </div>
        <Link href="/profile/academic" className="text-xs font-bold text-sky-500">Edit</Link>
      </div>

      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
        <span>CGPA: {profile.currentCgpa?.toFixed(1)}/10</span>
        <span>10th: {profile.tenthPercentage}%</span>
        <span>12th: {profile.twelfthPercentage}%</span>
        <span className="flex items-center gap-1"><Briefcase size={12} /> {profile.internshipsCount} Internships</span>
        <span className="flex items-center gap-1"><Award size={12} /> {profile.hackathonWins} Hackathon Wins</span>
        <span>{profile.activeBacklogs || 0} Backlogs</span>
      </div>

      {eligibleCount !== undefined && (
        <div className="text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
          Your CGPA qualifies you for {eligibleCount} government jobs
        </div>
      )}

      {completeness && completeness.completenessPercent < 100 && (
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-amber-500" style={{ width: `${completeness.completenessPercent}%` }} />
        </div>
      )}
      {completeness && completeness.completenessPercent < 100 && (
        <p className="text-[11px] text-slate-500">{completeness.message}</p>
      )}
    </div>
  );
}

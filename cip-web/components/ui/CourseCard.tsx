'use client';
import { ExternalLink, Award, Clock, Star, BookmarkPlus, CheckCircle2 } from 'lucide-react';
import type { Course } from '@/types';

interface Props {
  course: Course;
  matchScore?: number;
  onSave?: (courseId: number) => void;
  saved?: boolean;
}

const PLATFORM_STYLE: Record<string, { border: string; badge: string }> = {
  GOVERNMENT: { border: 'border-amber-400/60', badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  INTERNATIONAL: { border: 'border-slate-200 dark:border-white/10', badge: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  INDIAN: { border: 'border-slate-200 dark:border-white/10', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  PAID: { border: 'border-slate-200 dark:border-white/10', badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
};

export default function CourseCard({ course, matchScore, onSave, saved }: Props) {
  const style = PLATFORM_STYLE[course.platformType] || PLATFORM_STYLE.INTERNATIONAL;

  return (
    <div className={`relative rounded-2xl p-5 border-2 backdrop-blur-[20px] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-[rgba(8,12,20,0.7)] ${style.border}`}>
      {course.governmentRecognized && (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full self-start bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <Award size={11} /> Government Certified
        </div>
      )}

      <div>
        <p className="font-black text-sm text-slate-900 dark:text-white leading-snug">{course.title}</p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-1">
          {course.platform}{course.certificationBody ? ` — ${course.certificationBody}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        {course.durationWeeks != null && (
          <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />{course.durationWeeks} weeks</span>
        )}
        <span className={`px-2.5 py-1 rounded-lg border ${style.badge}`}>{course.cost}</span>
        {course.rating != null && (
          <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400" />{course.rating.toFixed(1)}</span>
        )}
        {matchScore !== undefined && (
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">{matchScore}% match</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(course.skillsCovered || []).slice(0, 4).map(s => (
          <span key={s} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg text-slate-500 bg-slate-100 dark:bg-white/5">
            {s}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <a href={course.url} target="_blank" rel="noreferrer"
          className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white hover:bg-sky-500/10 hover:border-sky-500/40"
          style={{ borderColor: 'rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.05)' }}>
          Start Course <ExternalLink size={13} />
        </a>
        {onSave && (
          <button onClick={() => onSave(course.id)} disabled={saved}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-60"
            style={saved
              ? { borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }
              : { borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>
            {saved ? <CheckCircle2 size={14} /> : <BookmarkPlus size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, Linkedin, Award, Zap, GraduationCap, Briefcase, Trophy } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { PublicProfile } from '@/types';

export default function PublicProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    studentApi.getPublicProfile(slug)
      .then(res => setProfile(res.data?.data ?? null))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#000814] text-slate-900 dark:text-white">
        <p className="text-lg font-bold">This profile doesn't exist or isn't public.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#000814]">
        <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const readiness = Math.round(profile.readiness ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto rounded-[32px] border backdrop-blur-[20px] p-8 shadow-[0_8px_40px_-10px_rgba(56,189,248,0.25)] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky to-mint">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Career Intelligence Platform</span>
        </div>

        <h1 className="text-3xl font-syne font-black text-slate-900 dark:text-white mt-4">{profile.name}</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          {profile.branch ? `${profile.branch} · ` : ''}{profile.collegeName || 'Student'}
          {profile.graduationYear ? ` · Class of ${profile.graduationYear}` : ''}
        </p>

        <div className="flex items-center gap-4 mt-4">
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-sky transition-colors">
              <Linkedin size={20} />
            </a>
          )}
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-sky transition-colors">
              <Github size={20} />
            </a>
          )}
        </div>

        {/* Readiness score */}
        <div className="mt-8 rounded-2xl border p-6 bg-sky-50 dark:bg-[rgba(56,189,248,0.03)] border-sky-200 dark:border-[rgba(56,189,248,0.1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">Career Readiness</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-sky">{readiness}</span>
                <span className="text-sm font-black text-slate-400">/100</span>
              </div>
            </div>
            {profile.level && (
              <span className="text-xs px-3 py-1.5 rounded-xl font-black uppercase tracking-widest text-sky bg-sky-100 dark:bg-[rgba(56,189,248,0.1)] border border-sky-200 dark:border-[rgba(56,189,248,0.2)]">
                {profile.level}
              </span>
            )}
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sky to-mint" style={{ width: `${readiness}%` }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-2xl border p-4 text-center bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
            <Award size={16} className="mx-auto mb-1.5 text-mint" />
            <p className="text-xl font-black text-slate-900 dark:text-white">{profile.certificationsCount}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Certified</p>
          </div>
          <div className="rounded-2xl border p-4 text-center bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
            <Trophy size={16} className="mx-auto mb-1.5 text-amber-500 dark:text-amber-400" />
            <p className="text-xl font-black text-slate-900 dark:text-white">{profile.hackathonWins ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Hackathons</p>
          </div>
          <div className="rounded-2xl border p-4 text-center bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
            <Briefcase size={16} className="mx-auto mb-1.5 text-sky" />
            <p className="text-xl font-black text-slate-900 dark:text-white">{profile.internshipsCount ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Internships</p>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 flex items-center gap-1.5">
              <GraduationCap size={12} /> Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile.certificationNames?.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Validated Certifications</p>
            <ul className="space-y-1.5">
              {profile.certificationNames.map((c) => (
                <li key={c} className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Award size={13} className="text-mint flex-shrink-0" /> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
          Generated by Career Intelligence Platform
        </p>
      </motion.div>
    </div>
  );
}

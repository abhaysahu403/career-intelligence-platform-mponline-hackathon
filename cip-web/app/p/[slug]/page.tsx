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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-bold">This profile doesn't exist or isn't public.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const readiness = Math.round(profile.readiness ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-[20px] p-8 shadow-[0_8px_40px_-10px_rgba(56,189,248,0.25)]"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-400 to-emerald-400">
            <Zap size={18} className="text-slate-900" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Career Intelligence Platform</span>
        </div>

        <h1 className="text-3xl font-syne font-black text-white mt-4">{profile.name}</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          {profile.branch ? `${profile.branch} · ` : ''}{profile.collegeName || 'Student'}
          {profile.graduationYear ? ` · Class of ${profile.graduationYear}` : ''}
        </p>

        <div className="flex items-center gap-4 mt-4">
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
              <Linkedin size={20} />
            </a>
          )}
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
              <Github size={20} />
            </a>
          )}
        </div>

        {/* Readiness score */}
        <div className="mt-8 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Career Readiness</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-sky-400">{readiness}</span>
                <span className="text-sm font-black text-slate-400">/100</span>
              </div>
            </div>
            {profile.level && (
              <span className="text-xs px-3 py-1.5 rounded-xl font-black uppercase tracking-widest text-sky-400 bg-sky-400/10 border border-sky-400/20">
                {profile.level}
              </span>
            )}
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${readiness}%` }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <Award size={16} className="mx-auto mb-1.5 text-emerald-400" />
            <p className="text-xl font-black text-white">{profile.certificationsCount}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Certified</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <Trophy size={16} className="mx-auto mb-1.5 text-amber-400" />
            <p className="text-xl font-black text-white">{profile.hackathonWins ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Hackathons</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <Briefcase size={16} className="mx-auto mb-1.5 text-sky-400" />
            <p className="text-xl font-black text-white">{profile.internshipsCount ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Internships</p>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 flex items-center gap-1.5">
              <GraduationCap size={12} /> Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 border border-white/10">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile.certificationNames?.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Validated Certifications</p>
            <ul className="space-y-1.5">
              {profile.certificationNames.map((c) => (
                <li key={c} className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Award size={13} className="text-emerald-400 flex-shrink-0" /> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest font-black text-slate-500">
          Generated by Career Intelligence Platform
        </p>
      </motion.div>
    </div>
  );
}

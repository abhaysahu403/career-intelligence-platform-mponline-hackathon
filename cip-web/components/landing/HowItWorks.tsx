"use client";

import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Building2, TrendingUp, Star, Zap,
  Search, Filter, ChevronRight, CheckCircle2, Globe, Users
} from "lucide-react";

const jobMatches = [
  {
    role: "Software Engineer (SDE-1)",
    company: "Google",
    location: "Bangalore, India",
    type: "Full-time",
    match: 96,
    salary: "₹18–32 LPA",
    color: "#4ADE80",
    logo: "G",
    logoColor: "#4285F4",
    tags: ["DSA", "System Design", "Python"],
    verified: true,
  },
  {
    role: "ML Engineer Intern",
    company: "Microsoft",
    location: "Hyderabad (Remote ok)",
    type: "Internship",
    match: 91,
    salary: "₹60k/month",
    color: "#38BDF8",
    logo: "M",
    logoColor: "#00A4EF",
    tags: ["Python", "TensorFlow", "NLP"],
    verified: true,
  },
  {
    role: "Full Stack Developer",
    company: "Razorpay",
    location: "Remote",
    type: "Full-time",
    match: 87,
    salary: "₹12–20 LPA",
    color: "#818CF8",
    logo: "R",
    logoColor: "#2DD4BF",
    tags: ["React", "Node.js", "AWS"],
    verified: true,
  },
  {
    role: "Backend Developer Intern",
    company: "NPCI",
    location: "Mumbai",
    type: "Internship",
    match: 83,
    salary: "₹35k/month",
    color: "#34D399",
    logo: "N",
    logoColor: "#F59E0B",
    tags: ["Java", "Spring Boot", "SQL"],
    verified: true,
  },
];

const systemFeatures = [
  { icon: Search, label: "AI-Powered Matching", desc: "Matches live jobs against your skill DNA in real-time", color: "#38BDF8" },
  { icon: Filter, label: "Smart Filters", desc: "Filter by salary, location, role type, company tier & more", color: "#4ADE80" },
  { icon: TrendingUp, label: "Market Intelligence", desc: "Live salary benchmarks, hiring trends, and demand signals", color: "#818CF8" },
  { icon: Globe, label: "Pan-India + Remote", desc: "Jobs from startups to FAANG, internships to full-time roles", color: "#34D399" },
  { icon: Users, label: "Referral Engine", desc: "AI identifies your network connections at target companies", color: "#38BDF8" },
  { icon: Zap, label: "1-Click Apply", desc: "Auto-fill applications with your verified profile and resume", color: "#4ADE80" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] blur-[120px] rounded-full -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* LEFT: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border mb-6"
              style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.2)', boxShadow: '0 0 15px rgba(74,222,128,0.08)' }}
            >
              <Briefcase className="w-3.5 h-3.5 text-mint" />
              <span className="text-xs font-black text-mint uppercase tracking-widest">AI Job Intelligence</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-syne text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight"
            >
              Smart Job & Internship{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky to-mint">
                Recommendation
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10 font-medium"
            >
              Our AI cross-references your skill DNA, interview performance, and verified certificates
              against live private and government job postings — surfacing only roles that clear your
              readiness bar. No noise. Only real opportunities.
            </motion.p>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {systemFeatures.map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex gap-3 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 group bg-white/70 dark:bg-[rgba(8,12,20,0.6)]" style={{ borderColor: `${feat.color}18` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}25` }}>
                    <feat.icon className="w-4 h-4" style={{ color: feat.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5 tracking-tight">{feat.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/auth/signup"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest text-[#020617]"
              style={{
                background: 'linear-gradient(135deg, #38BDF8, #4ADE80)',
                boxShadow: '0 0 30px rgba(74,222,128,0.3)',
              }}
            >
              Explore Opportunities
              <ChevronRight className="w-4 h-4" />
            </motion.a>
          </div>

          {/* RIGHT: Live Job Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-4 rounded-[44px] blur-[50px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.1) 0%, rgba(56,189,248,0.06) 60%, transparent 100%)' }} />

            {/* Header bar */}
            <div className="relative rounded-[32px] overflow-hidden border mb-4 transition-all duration-500 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] bg-white/90 dark:bg-[rgba(8,12,20,0.85)]" style={{ backdropFilter: 'blur(40px)', borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 8px 30px -10px rgba(56,189,248,0.1), inset 0 0 20px rgba(56,189,248,0.05)' }}>
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'rgba(56,189,248,0.15)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-mint animate-pulse" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
                  <span className="text-[11px] font-black text-mint uppercase tracking-widest">AI Job Intelligence — LIVE</span>
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  194+ postings tracked
                </div>
              </div>

              {/* Search bar mock */}
              <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <Search className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600 font-medium flex-1">Software Engineer, ML, Full Stack...</span>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-black text-sky uppercase tracking-widest"
                  style={{ borderColor: 'rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.08)' }}>
                  <Filter className="w-3 h-3" />
                  Filters
                </div>
              </div>

              {/* Job cards */}
              <div className="p-4 space-y-3 max-h-[480px] overflow-hidden">
                {jobMatches.map((job, i) => (
                  <motion.div
                    key={job.company}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = job.color + '60';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${job.color}30, inset 0 0 10px ${job.color}10`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Company logo */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 border"
                      style={{ background: `${job.logoColor}18`, borderColor: `${job.logoColor}30`, color: job.logoColor }}>
                      {job.logo}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{job.role}</p>
                        {job.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-mint flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.5))' }} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Match + salary */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-lg leading-none mb-1" style={{ color: job.color, textShadow: `0 0 10px ${job.color}50` }}>
                        {job.match}%
                      </div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">match</div>
                      <div className="text-[10px] font-black text-slate-600 dark:text-slate-400">{job.salary}</div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{
                          background: job.type === 'Internship' ? 'rgba(56,189,248,0.12)' : 'rgba(74,222,128,0.12)',
                          color: job.type === 'Internship' ? '#38BDF8' : '#4ADE80',
                        }}>
                        {job.type}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-900 dark:text-white transition-colors flex-shrink-0" />
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t flex items-center justify-between"
                style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Showing 4 sample AI-matched opportunities</span>
                <span className="text-[10px] font-black text-sky uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:text-white transition-colors">View All →</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "194+", label: "Live Jobs", color: "#4ADE80" },
                { value: "89%", label: "Avg Match Rate", color: "#38BDF8" },
                { value: "₹28L", label: "Avg Package", color: "#818CF8" },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl border p-3 text-center bg-white dark:bg-[rgba(8,12,20,0.94)] shadow-lg shadow-slate-200/50 dark:shadow-none"
                  style={{ borderColor: 'rgba(148,163,184,0.2)', backdropFilter: 'blur(20px)' }}>
                  <p className="font-black text-xl leading-none mb-1" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}40` }}>
                    {stat.value}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

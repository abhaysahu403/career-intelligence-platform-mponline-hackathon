"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, ShieldCheck, Brain, Mic } from "lucide-react";

const floatingStats = [
  { label: "Match Score", value: "96%", color: "#4ADE80", glow: "rgba(74,222,128,0.3)", top: "4%" },
  { label: "Trust Level", value: "VERIFIED", color: "#38BDF8", glow: "rgba(56,189,248,0.3)", top: "36%" },
  { label: "Career Fit", value: "STRONG", color: "#4ADE80", glow: "rgba(74,222,128,0.5)", top: "56%" },
];

const pulseRings = [
  { delay: 0, size: 80 },
  { delay: 0.6, size: 120 },
  { delay: 1.2, size: 160 },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-10">
      {/* Ambient glow zones */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-sky/[0.08] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-mint/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT: Cinematic Headline ── */}
          <div>
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border bg-mint/10 dark:bg-mint/5 border-mint/30 dark:border-mint/20"
                style={{ boxShadow: '0 0 20px rgba(74,222,128,0.1)' }}>
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#4ADE80', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-mint font-mono-jetbrains text-[10px] font-black tracking-[0.3em] uppercase">LIVE</span>
                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold border-l border-mint/20 pl-3 uppercase tracking-widest">
                  AI Career Intelligence
                </span>
              </div>
            </motion.div>

            {/* Giant headline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <h1 className="font-syne leading-[0.95] mb-5 tracking-tighter">
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white">
                  From Campus
                </span>
                <span
                  className="block text-5xl md:text-6xl lg:text-7xl font-black mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #38BDF8 0%, #4ADE80 50%, #38BDF8 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 4s linear infinite',
                    filter: 'drop-shadow(0 0 30px rgba(74,222,128,0.3))',
                  }}
                >
                  to Career. Completely.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-lg mb-4 leading-relaxed"
            >
              AI-guided career paths, mock interviews, resume building, verified certificates, and real job + government postings — everything between graduation and your first offer.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-sm text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.35em] mb-7"
            >
              Built for students, scaled for institutions
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <motion.a
                href="/auth/signup"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest text-[#020617]"
                style={{
                  background: 'linear-gradient(135deg, #38BDF8, #4ADE80)',
                  boxShadow: '0 0 40px rgba(74,222,128,0.35), 0 0 80px rgba(56,189,248,0.15)',
                }}
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl transition-all hover:bg-white dark:hover:bg-slate-900/80"
              >
                <Play className="w-4 h-4 text-sky" />
                Watch Demo
              </motion.a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Brain, label: "AI Interview Engine", color: "#38BDF8" },
                { icon: ShieldCheck, label: "OCR Cert Validation", color: "#4ADE80" },
                { icon: Zap, label: "Live Readiness Score", color: "#818CF8" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Hero Image with Glass Overlay ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            {/* Glow halo behind image */}
            <div className="absolute -inset-8 rounded-[48px] blur-[60px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.18) 0%, rgba(56,189,248,0.08) 60%, transparent 100%)' }} />

            {/* Pulse rings */}
            {pulseRings.map((ring, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-mint/20 pointer-events-none"
                style={{ width: ring.size, height: ring.size }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, delay: ring.delay, repeat: Infinity, ease: "easeOut" }}
              />
            ))}

            {/* Main image card */}
            <div className="relative rounded-[32px] overflow-hidden border border-slate-300 dark:border-white/10 shadow-2xl dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
              {/* Real interview image from Unsplash */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-ai-interview.png"
                alt="AI Interview Session - Student with AI analysis overlay"
                className="w-full h-[380px] object-cover"
                style={{ filter: 'brightness(0.75) saturate(1.1)' }}
              />

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
              }} />

              {/* Blue AI scan line */}
              <motion.div
                className="absolute inset-x-0 h-[1px] pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)' }}
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              {/* Recording badge */}
              <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 dark:bg-black/70 backdrop-blur-md border border-mint/40 dark:border-mint/30">
                <motion.span
                  className="w-2 h-2 rounded-full bg-mint"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }}
                />
                <Mic className="w-3 h-3 text-mint" />
                <span className="text-[10px] font-black text-mint uppercase tracking-widest">Recording</span>
              </div>

              {/* Bottom glass info strip */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-900/95 dark:from-slate-950/95 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-black text-base">AI Interview Analysis</p>
                    <p className="text-slate-300 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">Software Engineer Role // Session Active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-mint font-black text-xl" style={{ textShadow: '0 0 10px rgba(74,222,128,0.5)' }}>94%</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold">Readiness</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            {floatingStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="absolute px-4 py-2.5 rounded-2xl border bg-slate-900/90 dark:bg-slate-950/85 backdrop-blur-xl"
                style={{
                  borderColor: `${stat.glow.replace('rgba', 'rgba').replace(/[\d.]+\)$/, '0.3)')}`,
                  boxShadow: `0 0 20px ${stat.glow}`,
                  top: stat.top,
                  left: i % 2 === 0 ? '-60px' : 'auto',
                  right: i % 2 === 1 ? '-60px' : 'auto',
                }}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.2 }}
              >
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="font-black text-lg leading-none" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}60` }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

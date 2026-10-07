"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Brain, ShieldCheck, Zap, Target } from "lucide-react";

const perks = [
  "Free forever plan — no credit card required",
  "Full access to all 8 AI modules",
  "Unlimited AI interview practice in beta",
  "Export reports and certificates",
];

const platformStats = [
  { icon: Brain, value: "250+", label: "Interview Question Bank", color: "#38BDF8" },
  { icon: ShieldCheck, value: "390+", label: "Certificate Institutions Verified", color: "#4ADE80" },
  { icon: Target, value: "194+", label: "Live Job & Govt. Postings", color: "#818CF8" },
  { icon: Zap, value: "10", label: "AI-Powered Modules", color: "#34D399" },
];

export default function CTA() {
  return (
    <section id="cta" className="py-28 px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.10) 0%, rgba(56,189,248,0.05) 60%, transparent 100%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Platform Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-24"
        >
          {platformStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="p-6 rounded-[28px] border text-center transition-all duration-500 cursor-default bg-white dark:bg-[rgba(8,12,20,0.94)] shadow-xl shadow-slate-200/50 dark:shadow-none"
              style={{
                backdropFilter: 'blur(40px)',
                borderColor: `${stat.color}20`,
                boxShadow: `0 15px 40px -10px rgba(0,0,0,0.1), inset 0 0 30px ${stat.color}06`,
              }}
            >
              <div className="absolute top-0 inset-x-0 h-[1px] rounded-t-[28px]"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}30, transparent)` }} />
              <stat.icon className="w-6 h-6 mx-auto mb-3" style={{ color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color}50)` }} />
              <p className="font-black text-2xl md:text-3xl mb-1" style={{ color: stat.color, textShadow: `0 0 15px ${stat.color}40` }}>
                {stat.value}
              </p>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main CTA Block ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Outer glow */}
          <div className="absolute -inset-8 rounded-[60px] blur-[80px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.14) 0%, rgba(56,189,248,0.05) 70%, transparent 100%)' }} />

          <div
            className="relative rounded-[48px] overflow-hidden border-2 text-center px-8 py-16 md:py-20 bg-white dark:bg-[rgba(5,8,18,0.96)] shadow-2xl shadow-slate-200/60 dark:shadow-none"
            style={{
              backdropFilter: 'blur(50px)',
              borderColor: 'rgba(74,222,128,0.25)',
              boxShadow: '0 0 100px -20px rgba(74,222,128,0.25), inset 0 0 60px rgba(74,222,128,0.03)',
            }}
          >
            {/* Top shimmer */}
            <div className="absolute top-0 inset-x-0 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.5), rgba(56,189,248,0.3), transparent)' }} />

            {/* Scanning line */}
            <motion.div
              className="absolute inset-x-0 h-[1px] pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)' }}
              animate={{ top: ['5%', '95%', '5%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border mb-8"
              style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.2)', boxShadow: '0 0 15px rgba(74,222,128,0.1)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-mint" />
              <span className="text-xs font-black text-mint uppercase tracking-[0.3em]">Start Free Today</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="font-syne font-black tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', lineHeight: 1.05 }}
            >
              <span className="text-slate-900 dark:text-white">Your AI Career Coach</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #38BDF8 0%, #4ADE80 50%, #38BDF8 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 4s linear infinite',
                }}
              >
                Is Waiting.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="text-slate-600 dark:text-slate-300 text-lg max-w-xl mx-auto mb-10 font-medium leading-relaxed"
            >
              Stop guessing your next step. Discover your path, practice with AI, close
              your skill gaps, and match to real opportunities — all in one place.
            </motion.p>

            {/* Perks */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-5 mb-12"
            >
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0"
                    style={{ filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.5))' }} />
                  {perk}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <motion.a
                href="/auth/signup"
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest text-[#020617]"
                style={{
                  background: 'linear-gradient(135deg, #38BDF8, #4ADE80)',
                  boxShadow: '0 0 50px rgba(74,222,128,0.4), 0 0 100px rgba(56,189,248,0.10)',
                }}
              >
                Start Free Interview
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-2 px-8 py-5 rounded-full font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white border transition-all bg-slate-100 dark:bg-[rgba(15,23,42,0.5)]"
                style={{
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(148,163,184,0.25)',
                }}
              >
                View Dashboard →
              </motion.a>
            </motion.div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

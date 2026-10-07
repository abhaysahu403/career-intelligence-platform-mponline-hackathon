"use client";

import { motion } from "framer-motion";
import { Building2, Radar, ArrowRight, Sparkles } from "lucide-react";

const panels = [
  {
    icon: Building2,
    title: "Institution Overview",
    description:
      "Cohort-wide readiness at a glance — branch-by-branch breakdown, job-ready counts, and an at-risk student roster faculty can act on immediately.",
    color: "#38BDF8",
    gradient: "from-sky/20 to-sky/5",
    bullets: ["Branch-wise readiness", "At-risk roster", "Real-time, no manual reporting"],
  },
  {
    icon: Radar,
    title: "Industry Requirement Dashboard",
    description:
      "Ranks real job-posting demand against how much of the cohort already has each skill — concrete curriculum gaps, not guesswork.",
    color: "#F87171",
    gradient: "from-red-400/20 to-red-400/5",
    bullets: ["Live job-market demand", "Cohort skill coverage", "Critical gap alerts"],
  },
];

export default function ForInstitutions() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-mint/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky/10 border border-sky/20 mb-5 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky" />
            <span className="text-xs font-black text-sky uppercase tracking-widest">
              Scaled for Institutions
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-syne text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4"
          >
            Personalized Guidance,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky to-mint">at Institution Scale</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#A1A1AA] text-lg max-w-2xl mx-auto"
          >
            Every student module feeds a faculty-facing view — no spreadsheets, no manual cohort tracking.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {panels.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -6 }}
              className="group relative p-7 rounded-[32px] bg-white dark:bg-[rgba(8,12,20,0.94)] border backdrop-blur-[40px] saturate-150 transition-all duration-500 overflow-hidden hover:-translate-y-2 shadow-xl shadow-slate-200/50 dark:shadow-none"
              style={{
                boxShadow: `0 8px 30px -10px ${p.color}30, inset 0 0 30px ${p.color}15`,
                borderColor: `${p.color}40`,
              }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${p.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`, boxShadow: `0 0 15px ${p.color}` }}
              />

              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `linear-gradient(135deg, ${p.color}30, ${p.color}10)`, border: `1px solid ${p.color}25` }}
                >
                  <p.icon className="w-6 h-6" style={{ color: p.color }} />
                </div>

                <h3 className="font-syne text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  {p.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-[#B0B0B8] leading-relaxed mb-4">
                  {p.description}
                </p>

                <ul className="space-y-1.5 mb-4">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9A9AA2]">
                      <span className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                      {b}
                    </li>
                  ))}
                </ul>

                <div
                  className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: p.color }}
                >
                  Explore dashboard
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

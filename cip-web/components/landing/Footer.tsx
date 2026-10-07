"use client";

import { motion } from "framer-motion";
import { Brain, Twitter, Github, Linkedin, Heart, Zap } from "lucide-react";

const footerLinks = {
  Product: ["Features", "How It Works", "Demo", "Pricing", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Resources: ["Documentation", "API", "Community", "Status", "Changelog"],
  Legal: ["Privacy", "Terms", "Security", "GDPR", "Cookies"],
};

export default function Footer() {
  return (
    <footer className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), rgba(74,222,128,0.4), transparent)' }} />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Top section */}
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #38BDF8, #4ADE80)', boxShadow: '0 0 15px rgba(74,222,128,0.3)' }}>
                <Brain className="w-5 h-5 text-[#020617]" />
              </div>
              <span className="font-syne text-xl font-black text-slate-900 dark:text-white tracking-tight">CIP</span>
              <span className="text-[9px] font-black text-mint border border-mint/30 px-1.5 py-0.5 rounded bg-mint/10 uppercase tracking-widest">
                BETA
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
              AI-powered career readiness platform for students and institutions.
            </p>
            {/* System status */}
            <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl border"
              style={{ background: 'rgba(74,222,128,0.06)', borderColor: 'rgba(74,222,128,0.15)' }}>
              <motion.span
                className="w-2 h-2 rounded-full bg-mint"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }}
              />
              <span className="text-[10px] font-black text-mint uppercase tracking-widest">All Systems Operational</span>
            </div>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Github, label: "GitHub" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#4B5563',
                  }}
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-5">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-300 transition-colors font-medium"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
            © 2026 CIP Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-widest">
            Built with{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" />
            </motion.span>
            and AI for students building their careers
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            style={{ color: '#38BDF8' }}>
            <Zap className="w-3.5 h-3.5" />
            Powered by CIP Intelligence v2.0
          </div>
        </div>
      </div>
    </footer>
  );
}

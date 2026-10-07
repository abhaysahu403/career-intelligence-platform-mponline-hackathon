"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#cta" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-black/20"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#"
          className="flex items-center gap-2.5 group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-sky to-mint flex items-center justify-center overflow-hidden shadow-lg shadow-sky/30">
            <Brain className="w-5 h-5 text-[#020617] relative z-10" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-syne text-xl font-bold text-slate-900 dark:text-white">
            CIP
          </span>
          <span className="hidden sm:block text-[10px] font-mono-jetbrains font-black tracking-widest text-mint border border-mint/30 px-2 py-0.5 rounded bg-mint/10 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
            BETA
          </span>
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-sky to-mint group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
            </motion.a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle variant="minimal" />
          <motion.a
            href="/auth/login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </motion.a>
          <motion.a
            href="/auth/signup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
          >
            Sign Up
          </motion.a>
          <motion.a
            href="/auth/signup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky to-mint text-[#020617] text-xs font-black shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all uppercase tracking-widest"
          >
            <Zap className="w-3.5 h-3.5" />
            Get Started
          </motion.a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white text-sm font-bold py-2 border-b border-slate-200 dark:border-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-sm font-bold text-slate-600 dark:text-gray-300">Theme</span>
                <ThemeToggle variant="minimal" />
              </div>
              
              {/* Sign In Button */}
              <a
                href="/auth/login"
                className="text-center px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </a>
              
              {/* Get Started Button */}
              <a
                href="/auth/signup"
                className="text-center px-5 py-3 rounded-xl bg-gradient-to-r from-sky to-mint text-[#020617] text-sm font-bold shadow-lg shadow-sky/30 hover:shadow-sky/50 transition-all flex items-center justify-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Zap className="w-4 h-4" />
                Get Started Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

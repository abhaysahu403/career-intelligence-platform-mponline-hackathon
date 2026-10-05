"use client";

import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    toggleTheme();
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
        isDark
          ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70'
          : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-sky-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
      <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </motion.button>
  );
}

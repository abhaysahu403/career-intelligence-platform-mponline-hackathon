'use client';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title:     string;
  value:     string | number;
  subtitle?: string;
  icon:      LucideIcon;
  iconColor?: string;
  iconBg?:   string;
  trend?:    { value: number; label: string };
  className?: string;
  onClick?:  () => void;
}

export default function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor = '#38BDF8', iconBg = 'rgba(56,189,248,0.15)',
  trend, className, onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={cn('relative rounded-2xl p-5 border backdrop-blur-[20px] transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]', onClick && 'cursor-pointer', className)}
      style={{
        boxShadow: '0 4px 15px -5px rgba(0,0,0,0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)';
        e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(56,189,248,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '0 4px 15px -5px rgba(0,0,0,0.3)';
      }}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-50"
        style={{ background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)' }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-lg"
            style={{
              background: trend.value >= 0 ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
              color:      trend.value >= 0 ? '#4ADE80' : '#EF4444',
            }}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-sm font-semibold mb-1 text-slate-500 dark:text-[#94A3B8]">{title}</p>
      <p className="text-2xl font-bold tabular-nums font-syne text-slate-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs mt-1 text-slate-500 dark:text-[#94A3B8]">{subtitle}</p>}
      {trend && <p className="text-xs mt-1 font-medium text-slate-500 dark:text-[#94A3B8]">{trend.label}</p>}
    </div>
  );
}

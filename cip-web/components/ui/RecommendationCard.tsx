'use client';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  cta?: string;
  onClick?: () => void;
  priority?: 'high' | 'medium' | 'low';
}
export default function RecommendationCard({ title, description, icon: Icon, cta = 'Take action', onClick, priority = 'medium' }: Props) {
  const colors = {
    high:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  icon: '#EF4444', dot: '#EF4444' },
    medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '#F59E0B', dot: '#F59E0B' },
    low:    { bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)',  icon: '#4ADE80', dot: '#4ADE80' },
  }[priority];

  return (
    <div className="relative rounded-2xl p-4 border backdrop-blur-[20px] flex items-start gap-3 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-[rgba(8,12,20,0.7)]"
      style={{
        borderColor: colors.border
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 25px -5px ${colors.dot}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${colors.dot}22` }}>
        <Icon size={16} style={{ color: colors.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold mb-0.5 text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">{description}</p>
        {onClick && (
          <button onClick={onClick}
            className="flex items-center gap-1 text-xs font-medium mt-2 hover:gap-2 transition-all"
            style={{ color: colors.icon }}>
            {cta} <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

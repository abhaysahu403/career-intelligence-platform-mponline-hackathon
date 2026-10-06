'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, Flame } from 'lucide-react';
import { useAppStore } from '@/store';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile':   'My Profile',
  '/analytics': 'Progress Tracking',
  '/interview': 'AI Interview Coach',
  '/jobs':      'Jobs & Internships',
  '/dashboard/certificates': 'Certificates',
  '/roadmap':   'Learning Roadmap',
  '/settings':  'Settings',
};

export default function Topbar() {
  const pathname      = usePathname();
  const { user, sidebarOpen, setSidebarOpen, score } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'CIP';

  // Interview streak (persisted via localStorage)
  const getStreak = () => {
    if (typeof window === 'undefined') return 0;
    const data = localStorage.getItem('cip_streak');
    if (!data) return 0;
    try {
      const { count, lastDate } = JSON.parse(data);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === today || lastDate === yesterday) return count;
      return 0;
    } catch { return 0; }
  };
  const streak = getStreak();

  // Smart notifications based on real state
  const notifications: Array<{ id: number; text: string; time: string; unread: boolean }> = [];
  if (score) {
    if (score.readiness >= 65) {
      notifications.push({ id: 1, text: '🎉 You are Ready to Apply! Check recommended jobs.', time: 'Now', unread: true });
    } else {
      notifications.push({ id: 1, text: `📈 Readiness at ${score.readiness}/100. ${Math.max(7, Math.round((65 - score.readiness) / 0.3))} days to ready.`, time: 'Today', unread: true });
    }
    if ((score.interviewScore ?? 0) < 50) {
      notifications.push({ id: 2, text: '🎤 Interview score is low. Practice to improve.', time: 'Suggestion', unread: true });
    }
    if ((score.resumeScore ?? 0) < 60) {
      notifications.push({ id: 3, text: '📄 Resume needs updating for better matching.', time: 'Suggestion', unread: true });
    }
  }
  if (streak >= 3) {
    notifications.push({ id: 4, text: `🔥 ${streak}-day interview streak! Keep it going!`, time: 'Streak', unread: true });
  }

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 flex items-center gap-4 px-4 md:px-8 h-20 border-b transition-all duration-300 bg-white/85 dark:bg-[rgba(8,12,20,0.85)] backdrop-blur-[30px] border-slate-200 dark:border-[rgba(255,255,255,0.06)]",
      sidebarOpen ? "left-0 md:left-[240px]" : "left-0 md:left-[72px]"
    )}>

      {/* Mobile sidebar toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-white/5 md:hidden text-slate-600 dark:text-[#64748B]">
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h1 className="text-xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
          {title}
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-2">
        {showSearch ? (
          <input autoFocus onBlur={() => setShowSearch(false)}
            placeholder="Search anything…"
            className="w-56 px-4 py-2 rounded-xl text-sm border transition-all focus:outline-none bg-white dark:bg-[rgba(255,255,255,0.02)] text-slate-900 dark:text-white border-slate-300 dark:border-white/10 focus:border-sky-500 dark:focus:border-sky/40 focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-sky/10" />
        ) : (
          <button onClick={() => setShowSearch(true)}
            className="p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#64748B]">
            <Search size={18} />
          </button>
        )}
      </div>

      <ThemeToggle variant="minimal" />

      {streak > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-amber-50 dark:bg-[rgba(245,158,11,0.05)] border-amber-200 dark:border-[rgba(245,158,11,0.2)]">
          <Flame size={16} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-black text-amber-400">{streak}</span>
        </div>
      )}

      <div className="relative">
        <button onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#64748B]">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-sky shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-full mt-4 w-80 rounded-[32px] border shadow-2xl z-50 overflow-hidden backdrop-blur-[30px] bg-white dark:bg-[rgba(8,12,20,0.95)] border-slate-200 dark:border-[rgba(255,255,255,0.08)]">
              <div className="px-6 py-4 border-b flex items-center justify-between border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Center</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest bg-sky-100 dark:bg-[rgba(56,189,248,0.1)] text-sky-600 dark:text-[#38BDF8]">
                  {notifications.filter(n => n.unread).length} new
                </span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-white/5 max-h-[400px] overflow-y-auto">
                {notifications.length ? notifications.map(n => (
                  <div key={n.id} className="px-6 py-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <div className="flex gap-4 items-start">
                      {n.unread && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-sky shadow-[0_0_10px_rgba(56,189,248,0.5)]" />}
                      <div className={n.unread ? '' : 'ml-4'}>
                        <p className="text-xs mb-1 font-bold leading-relaxed text-slate-900 dark:text-white" style={{ color: n.unread ? undefined : '#64748B' }}>{n.text}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#475569]">{n.time}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-10 text-xs font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-600">
                    No active notifications
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black cursor-pointer shadow-lg hover:shadow-sky/20 transition-all hover:-translate-y-0.5 bg-gradient-to-br from-sky to-mint text-white shadow-sky/30">
        {user?.name?.charAt(0).toUpperCase() ?? 'U'}
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAppStore } from '@/store';
import { authApi } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'faculty'>('student');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      const payload = response.data?.data ?? response.data;
      const token = payload?.token;
      const user = {
        id: payload?.userId,
        name: payload?.name,
        email: payload?.email,
        role: payload?.role || role
      };

      if (!token || !user.id) {
        throw new Error('Invalid auth response');
      }

      Cookies.set('cip_token', token, { expires: 7, sameSite: 'strict' });
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role?.toLowerCase() === 'faculty' ? '/admin' : '/dashboard');
    } catch {
      toast.error('Login failed. Check backend auth service or credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #4ADE80)' }}>
              <Zap size={20} className="text-slate-900 dark:text-white" />
            </div>
            <span className="text-xl font-bold font-syne text-slate-900 dark:text-white">CIP</span>
          </div>
          <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white font-syne">Welcome back</h1>
          <p className="text-sm font-medium text-[#94A3B8]">Sign in to your Career Intelligence Platform</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Built for Madhya Pradesh Students · Aligned with NEP 2020
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border backdrop-blur-[20px] p-6 transition-all duration-300 bg-white/90 dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_-10px_rgba(56,189,248,0.2)]"
          style={{
            boxShadow: 'var(--card-shadow, 0 8px 30px -10px rgba(56,189,248,0.15))'
          }}>
          
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
            style={{ background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)', boxShadow: '0 0 15px #38BDF8' }} />

          {/* Role Toggle */}
          <div className="mb-6 flex rounded-xl p-1 backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            {(['student', 'faculty'] as const).map((currentRole) => (
              <button
                key={currentRole}
                type="button"
                onClick={() => setRole(currentRole)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all duration-200"
                style={role === currentRole
                  ? { background: 'linear-gradient(135deg, #38BDF8, #4ADE80)', color: '#fff', boxShadow: '0 4px 15px rgba(56,189,248,0.3)' }
                  : { color: '#64748B' }}
              >
                {currentRole === 'student' ? <GraduationCap size={15} /> : <BookOpen size={15} />}
                {currentRole === 'student' ? 'Student' : 'Faculty'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-600 dark:text-[#94A3B8]">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@college.edu"
                className="w-full rounded-xl border px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] transition-all focus:outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10"
                onFocus={(e) => {
                  e.target.style.borderColor = '#38BDF8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && <p className="mt-1 text-xs font-bold text-[#EF4444]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-600 dark:text-[#94A3B8]">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border px-4 py-3 pr-11 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] transition-all focus:outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38BDF8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 transition-opacity hover:opacity-100 text-slate-600 dark:text-[#94A3B8]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs font-bold text-[#EF4444]">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs font-bold text-[#38BDF8] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-60 text-slate-900 dark:text-white"
              style={{
                background: 'linear-gradient(135deg, #38BDF8, #4ADE80)',
                boxShadow: '0 8px 20px -5px rgba(56,189,248,0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(56,189,248,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(56,189,248,0.4)';
              }}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm font-medium text-slate-600 dark:text-[#94A3B8]">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-sm font-bold text-[#38BDF8] hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

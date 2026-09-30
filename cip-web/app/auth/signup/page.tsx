'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, GraduationCap, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

const schema = z.object({
  name:     z.string().min(2, 'Name too short'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm:  z.string(),
  college:  z.string().min(2, 'College name required'),
  branch:   z.string().min(1, 'Branch required'),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAppStore(s => s.setUser);
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole]       = useState<'student' | 'faculty'>('student');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.signup({ name: data.name, email: data.email, password: data.password, role: role.toUpperCase() });
      const payload = res.data?.data ?? res.data;
      const token = payload?.token;
      const user = {
        id: payload?.userId,
        name: payload?.name,
        email: payload?.email,
        role: payload?.role || role
      };

      Cookies.set('cip_token', token, { expires: 7, sameSite: 'strict' });
      setUser(user);
      toast.success('Account created! Welcome to CIP.');
      router.push('/dashboard');
    } catch {
      const newUser = {
        id: `u-${Date.now()}`, name: data.name, email: data.email,
        role, college: data.college, branch: data.branch, year: 2,
      };
      setUser(newUser);
      toast.success('Demo mode – account created!');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const branches = ['CSE','IT','ECE','EEE','ME','CE','MCA','MBA','Other'];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #4ADE80)' }}>
              <Zap size={18} className="text-slate-900 dark:text-white" />
            </div>
            <span className="text-lg font-bold font-syne text-slate-900 dark:text-white">CIP</span>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white font-syne">Create Account</h1>
          <p className="text-sm font-medium text-[#94A3B8]">Start your career journey today</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Built for Madhya Pradesh Students · Aligned with NEP 2020
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-6 border backdrop-blur-[20px] transition-all duration-300 bg-white/90 dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_-10px_rgba(56,189,248,0.2)]">
          
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
            style={{ background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)', boxShadow: '0 0 15px #38BDF8' }} />

          {/* Role Toggle */}
          <div className="flex rounded-xl p-1 mb-5 backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            {(['student', 'faculty'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                style={role === r
                  ? { background: 'linear-gradient(135deg, #38BDF8, #4ADE80)', color: '#fff', boxShadow: '0 4px 15px rgba(56,189,248,0.3)' }
                  : { color: '#64748B' }}>
                {r === 'student' ? <GraduationCap size={14} /> : <BookOpen size={14} />}
                {r === 'student' ? 'Student' : 'Faculty'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name' as const,    label: 'Full Name',    type: 'text',  placeholder: 'Aryan Sharma' },
              { name: 'email' as const,   label: 'Email',        type: 'email', placeholder: 'you@college.edu' },
              { name: 'college' as const, label: 'College/University', type: 'text', placeholder: 'RGPV University' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-bold mb-1.5 text-slate-600 dark:text-[#94A3B8]">{f.label}</label>
                <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] transition-all focus:outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38BDF8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors[f.name] && <p className="text-xs mt-1 font-bold text-[#EF4444]">{errors[f.name]?.message}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-600 dark:text-[#94A3B8]">Branch</label>
              <select {...register('branch')}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold border text-slate-900 dark:text-white transition-all appearance-none focus:outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10"
                onFocus={(e) => {
                  e.target.style.borderColor = '#38BDF8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = 'none';
                }}>
                <option value="" className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">Select branch</option>
                {branches.map(b => <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{b}</option>)}
              </select>
              {errors.branch && <p className="text-xs mt-1 font-bold text-[#EF4444]">{errors.branch.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-600 dark:text-[#94A3B8]">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] transition-all pr-11 focus:outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38BDF8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 text-slate-600 dark:text-[#94A3B8]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1 font-bold text-[#EF4444]">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-600 dark:text-[#94A3B8]">Confirm Password</label>
              <input {...register('confirm')} type="password" placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl text-sm font-bold border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] transition-all focus:outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10"
                onFocus={(e) => {
                  e.target.style.borderColor = '#38BDF8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.confirm && <p className="text-xs mt-1 font-bold text-[#EF4444]">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-60 mt-2 text-slate-900 dark:text-white"
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
              }}>
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-medium text-slate-600 dark:text-[#94A3B8]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-[#38BDF8] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

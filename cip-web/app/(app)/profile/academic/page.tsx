'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { GraduationCap, ChevronRight, ChevronLeft, CheckCircle2, TrendingUp } from 'lucide-react';
import { studentApi, jobsApi, AcademicProfileInput } from '@/lib/api';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Other'];
const BOARDS = ['CBSE', 'MP Board', 'ICSE', 'Other'];
const STREAMS = ['Science', 'Commerce', 'Arts'];
const TARGET_ROLES = [
  { value: 'PRIVATE_TECH', label: 'Private Tech' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'PSU', label: 'PSU' },
  { value: 'BANKING', label: 'Banking' },
  { value: 'DEFENCE', label: 'Defence' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'ENTREPRENEURSHIP', label: 'Entrepreneurship' },
];

const TOTAL_STEPS = 3;

export default function AcademicProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<AcademicProfileInput>({
    // currentCgpa defaults to 5.5 (not a "great" score) so dragging the slider upward during a
    // demo crosses real eligibility thresholds (6.0, 6.5) and visibly grows the eligible-jobs count.
    collegeName: '', branch: 'CSE', yearOfStudy: 3, graduationYear: new Date().getFullYear() + 1,
    currentCgpa: 5.5, tenthPercentage: 80, tenthBoard: 'CBSE', twelfthPercentage: 75, twelfthStream: 'Science',
    activeBacklogs: 0, gapYear: false, internshipsCount: 0, hackathonWins: 0,
    targetRoleType: 'PRIVATE_TECH', willingToRelocate: true,
  });

  // Debounce the CGPA slider so we don't hammer the eligible-count endpoint on every pixel of drag.
  const [debouncedCgpa, setDebouncedCgpa] = useState(form.currentCgpa);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCgpa(form.currentCgpa), 300);
    return () => clearTimeout(timer);
  }, [form.currentCgpa]);

  const { data: eligibleCount } = useQuery({
    queryKey: ['gov-jobs-eligible-count-live', form.branch, debouncedCgpa],
    enabled: !!(form.branch && debouncedCgpa != null),
    queryFn: async () => {
      const response = await jobsApi.government.eligibleCount(form.branch!, debouncedCgpa!);
      return response.data?.data?.eligibleCount as number | undefined;
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await studentApi.academic.get();
        const data = response.data?.data;
        if (data) setForm(data);
      } catch {
        // No profile yet — start fresh with defaults.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (patch: Partial<AcademicProfileInput>) => setForm(prev => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await studentApi.academic.save(form);
      toast.success('Academic profile saved! Your readiness score has been recalculated.');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save academic profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <GraduationCap className="text-sky-500" size={28} />
        <h1 className="text-2xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-wide">
          Academic Profile
        </h1>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>

      <div className="rounded-2xl p-6 border backdrop-blur-[20px] space-y-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        {step === 1 && (
          <>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Basic Academic Profile</h2>
            <Field label="College Name">
              <input value={form.collegeName} onChange={e => update({ collegeName: e.target.value })}
                placeholder="e.g. SIRT Bhopal"
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            </Field>
            <Field label="Branch">
              <select value={form.branch} onChange={e => update({ branch: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Year of Study">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(y => (
                  <button key={y} onClick={() => update({ yearOfStudy: y })}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border ${form.yearOfStudy === y ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-200 dark:border-white/10 text-slate-500'}`}>
                    {y === 4 ? '4th+' : `${y}${y === 1 ? 'st' : y === 2 ? 'nd' : 'rd'}`}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Expected Graduation Year">
              <input type="number" value={form.graduationYear} onChange={e => update({ graduationYear: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            </Field>
            <Field label={`Current CGPA: ${form.currentCgpa?.toFixed(1)} / 10`}>
              <input type="range" min={0} max={10} step={0.1} value={form.currentCgpa}
                onChange={e => update({ currentCgpa: Number(e.target.value) })} className="w-full" />
            </Field>
            {eligibleCount !== undefined && (
              <div className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <TrendingUp size={16} />
                Your CGPA qualifies you for <span className="text-base">{eligibleCount}</span> government jobs in {form.branch}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Academic History</h2>
            <Field label={`10th Percentage: ${form.tenthPercentage}%`}>
              <input type="range" min={0} max={100} value={form.tenthPercentage}
                onChange={e => update({ tenthPercentage: Number(e.target.value) })} className="w-full" />
            </Field>
            <Field label="10th Board">
              <select value={form.tenthBoard} onChange={e => update({ tenthBoard: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label={`12th Percentage: ${form.twelfthPercentage}%`}>
              <input type="range" min={0} max={100} value={form.twelfthPercentage}
                onChange={e => update({ twelfthPercentage: Number(e.target.value) })} className="w-full" />
            </Field>
            <Field label="12th Stream">
              <select value={form.twelfthStream} onChange={e => update({ twelfthStream: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <ToggleField label="Any Active Backlogs?" checked={(form.activeBacklogs || 0) > 0}
              onChange={checked => update({ activeBacklogs: checked ? 1 : 0 })} />
            {(form.activeBacklogs || 0) > 0 && (
              <Field label="How many?">
                <input type="number" min={1} value={form.activeBacklogs} onChange={e => update({ activeBacklogs: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
              </Field>
            )}
            <ToggleField label="Gap Year?" checked={!!form.gapYear} onChange={checked => update({ gapYear: checked })} />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Achievements & Preferences</h2>
            <Field label="Internships Completed">
              <input type="number" min={0} value={form.internshipsCount} onChange={e => update({ internshipsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            </Field>
            <Field label="Hackathon Wins">
              <input type="number" min={0} value={form.hackathonWins} onChange={e => update({ hackathonWins: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            </Field>
            <Field label="Target Role Type">
              <select value={form.targetRoleType} onChange={e => update({ targetRoleType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                {TARGET_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
            <ToggleField label="Willing to Relocate?" checked={!!form.willingToRelocate} onChange={checked => update({ willingToRelocate: checked })} />
          </>
        )}
      </div>

      <div className="flex justify-between gap-3">
        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-40">
          <ChevronLeft size={16} /> Back
        </button>
        {step < TOTAL_STEPS ? (
          <button onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' }}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4ADE80, #22C55E)' }}>
            <CheckCircle2 size={16} /> {saving ? 'Saving...' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-white/10'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

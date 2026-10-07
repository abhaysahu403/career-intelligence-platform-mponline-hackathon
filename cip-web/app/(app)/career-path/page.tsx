'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, ArrowLeft, Briefcase, IndianRupee, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { careerPathApi, jobsApi, studentApi } from '@/lib/api';
import { useT } from '@/lib/i18n';
import type { AcademicProfile, CareerTrack } from '@/types';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL'];

const INTERESTS = [
  'Building software/apps',
  'Data & numbers',
  'Hardware & core engineering',
  'Stability & government service',
  'Finance & banking',
  'Infrastructure & systems',
  'Quality & precision',
];

const APTITUDE_QUESTIONS: { id: string; prompt: string; options: { key: string; label: string }[] }[] = [
  {
    id: 'q1',
    prompt: "A team project is falling behind — what's your instinct?",
    options: [
      { key: 'a', label: 'Dive in and start fixing/writing code myself' },
      { key: 'b', label: 'Pull the data/metrics to find exactly where it\'s stuck' },
      { key: 'c', label: 'Check the technical setup for a bottleneck' },
      { key: 'd', label: "Set up a fair process so everyone's work is tracked" },
    ],
  },
  {
    id: 'q2',
    prompt: "Pick the task you'd enjoy most this week:",
    options: [
      { key: 'a', label: 'Setting up servers/pipelines so deployments never break' },
      { key: 'b', label: 'Hunting for the one edge case that breaks everything' },
      { key: 'c', label: 'Reconciling numbers until they match exactly' },
      { key: 'd', label: 'Building a new feature end to end' },
    ],
  },
  {
    id: 'q3',
    prompt: "You're handed a messy spreadsheet of 10,000 rows. First move?",
    options: [
      { key: 'a', label: 'Write a script to find patterns and clean it' },
      { key: 'b', label: 'Build a small tool so others can explore it easily' },
      { key: 'c', label: 'Route it through the right official process' },
      { key: 'd', label: 'Check if it maps to a physical/mechanical system' },
    ],
  },
  {
    id: 'q4',
    prompt: 'What frustrates you most in a group project?',
    options: [
      { key: 'a', label: 'Bugs slipping through from poor testing' },
      { key: 'b', label: 'Things breaking in production with no monitoring' },
      { key: 'c', label: 'Sloppy, unaccountable handling of resources' },
      { key: 'd', label: 'Decisions made without looking at the data' },
    ],
  },
  {
    id: 'q5',
    prompt: 'Which work environment appeals to you most, long-term?',
    options: [
      { key: 'a', label: 'Stable, structured, serving the public' },
      { key: 'b', label: 'Hands-on with physical systems/machines' },
      { key: 'c', label: 'Fast-moving tech company building products' },
      { key: 'd', label: 'Behind-the-scenes keeping complex systems running' },
    ],
  },
];

export default function CareerPathDiscoveryPage() {
  const t = useT();
  const [branch, setBranch] = useState('CSE');
  const [interests, setInterests] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<CareerTrack[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await studentApi.academic.get();
        const profile = response.data?.data as AcademicProfile | undefined;
        if (profile?.branch) setBranch(profile.branch);
      } catch {
        // No academic profile yet — keep the default branch selection.
      }
    })();
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) :
      prev.length >= 3 ? prev : [...prev, interest]
    );
  };

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const canSubmit = !!branch && interests.length > 0 && Object.keys(answers).length === APTITUDE_QUESTIONS.length;

  const runDiscovery = async () => {
    setLoading(true);
    try {
      const aptitudeAnswers = APTITUDE_QUESTIONS.map((q) => ({ questionId: q.id, selectedOption: answers[q.id] }));
      const [discoverRes, statsRes] = await Promise.all([
        careerPathApi.discover({ branch, interests, aptitudeAnswers }),
        jobsApi.trackStats().catch(() => ({ data: { data: [] } })),
      ]);
      const discoveredTracks: CareerTrack[] = discoverRes.data?.data?.tracks ?? [];
      const statsByCode: Record<string, Partial<CareerTrack>> = {};
      for (const s of statsRes.data?.data ?? []) statsByCode[s.code] = s;

      setTracks(discoveredTracks.map((t) => ({ ...t, ...statsByCode[t.code] })));
    } catch {
      toast.error('Could not run career path discovery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setTracks(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-100 dark:bg-sky/10 border border-sky-300 dark:border-sky/20 shadow-sm dark:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Compass size={24} className="text-sky-600 dark:text-sky" />
        </div>
        <div>
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t('page.careerPath.title')}
          </h2>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-500 mt-1">
            {t('page.careerPath.subtitle')}
          </p>
        </div>
      </div>

      {!tracks && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border backdrop-blur-[20px] p-6 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-4">Your Branch</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {BRANCHES.map((b) => (
                <button key={b} onClick={() => setBranch(b)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    branch === b
                      ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border backdrop-blur-[20px] p-6 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-1">What draws you in?</h3>
            <p className="text-xs text-slate-500 mb-4">Pick up to 3</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTERESTS.map((interest) => (
                <button key={interest} onClick={() => toggleInterest(interest)}
                  className={`text-left px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    interests.includes(interest)
                      ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}>
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {APTITUDE_QUESTIONS.map((q) => (
            <div key={q.id} className="rounded-2xl border backdrop-blur-[20px] p-6 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
              <p className="font-bold text-sm text-slate-900 dark:text-white mb-3">{q.prompt}</p>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <button key={opt.key} onClick={() => selectAnswer(q.id, opt.key)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      answers[q.id] === opt.key
                        ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button onClick={runDiscovery} disabled={!canSubmit || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] disabled:opacity-40 shadow-lg transition-all">
              {loading ? 'Analyzing...' : 'Discover My Career Path'} <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {tracks && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-sky" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Your top-matched career tracks</p>
            </div>
            <button onClick={startOver}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <ArrowLeft size={14} /> Start Over
            </button>
          </div>
          {tracks.map((track) => (
            <div key={track.code} className="rounded-2xl border backdrop-blur-[20px] p-6 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-syne font-black text-xl text-slate-900 dark:text-white">{track.label}</h3>
                {track.confidence !== undefined && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(56,189,248,0.15)', color: '#38BDF8' }}>
                    {track.confidence}% match
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{track.reasoning}</p>
              <div className="flex flex-wrap gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                {track.openPositions !== undefined && (
                  <span className="flex items-center gap-1.5"><Briefcase size={14} />{track.openPositions} open positions (live)</span>
                )}
                {track.avgSalaryLpa != null && (
                  <span className="flex items-center gap-1.5"><IndianRupee size={14} />~{track.avgSalaryLpa} LPA avg</span>
                )}
              </div>
              {track.sampleListings && track.sampleListings.length > 0 && (
                <div className="space-y-2">
                  {track.sampleListings.map((listing, i) => (
                    <a key={i} href={listing.sourceUrl} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                      <span>{listing.role} — {listing.company}</span>
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

    </div>
  );
}

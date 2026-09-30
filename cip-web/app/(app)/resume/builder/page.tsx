'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText, Sparkles, Plus, Trash2, Download, CheckCircle2,
  AlertTriangle, XCircle, Wand2, GraduationCap,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { resumeBuilderApi } from '@/lib/api';
import type { GeneratedResumeResult, ResumeProjectInput, ResumeInternshipInput, ResumeTemplateId } from '@/types';

const TEMPLATES: { id: ResumeTemplateId; name: string; description: string; accent: string }[] = [
  { id: 'CLEAN_PROFESSIONAL', name: 'Clean Professional', description: 'Single column, ATS-optimized. Best for TCS, Infosys, government, banking.', accent: '#334155' },
  { id: 'MODERN_TECH', name: 'Modern Tech', description: 'Subtle blue accent, still ATS safe. Best for startups, mid-size tech.', accent: '#38BDF8' },
  { id: 'EXECUTIVE', name: 'Executive', description: 'Dark header bar, more spacing. Best for management, MBA applications.', accent: '#0F172A' },
];

const STEPS = ['Review Profile', 'Projects', 'Internships', 'Template', 'Preview & Download'];

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResumeResult | null>(null);
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('CLEAN_PROFESSIONAL');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [projects, setProjects] = useState<ResumeProjectInput[]>([
    { name: '', techStack: '', description: '', githubLink: '' },
  ]);
  const [internships, setInternships] = useState<ResumeInternshipInput[]>([]);
  const [improvingIndex, setImprovingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await resumeBuilderApi.getBuilder();
        const data = response.data?.data as GeneratedResumeResult | undefined;
        if (data) {
          setResult(data);
          setTemplateId(data.templateId);
        }
      } catch {
        // No resume generated yet — start fresh.
      }
    })();
  }, []);

  const handleAutoFill = async () => {
    setLoading(true);
    try {
      const response = await resumeBuilderApi.generate({ templateId, targetRole, projects: [], internships: [] });
      setResult(response.data?.data);
      toast.success('Auto-filled from your profile!');
      setStep(1);
    } catch {
      toast.error('Failed to auto-fill — make sure your academic profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  const addProject = () => setProjects([...projects, { name: '', techStack: '', description: '', githubLink: '' }]);
  const removeProject = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));
  const updateProject = (i: number, patch: Partial<ResumeProjectInput>) =>
    setProjects(projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const addInternship = () => setInternships([...internships, { company: '', duration: '', role: '', bullets: [''] }]);
  const removeInternship = (i: number) => setInternships(internships.filter((_, idx) => idx !== i));
  const updateInternship = (i: number, patch: Partial<ResumeInternshipInput>) =>
    setInternships(internships.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const handleImproveProject = async (i: number) => {
    if (!projects[i].description.trim()) {
      toast.error('Write a description first');
      return;
    }
    setImprovingIndex(i);
    try {
      const response = await resumeBuilderApi.improveSection('project', projects[i].description, targetRole);
      const improved = response.data?.data?.improved_content;
      if (improved) updateProject(i, { description: improved });
      toast.success('Improved with AI!');
    } catch {
      toast.error('AI improvement failed');
    } finally {
      setImprovingIndex(null);
    }
  };

  const handleGenerateFinal = async () => {
    setLoading(true);
    try {
      const response = await resumeBuilderApi.generate({
        templateId, targetRole,
        projects: projects.filter(p => p.name.trim()),
        internships: internships.filter(e => e.company.trim()),
      });
      setResult(response.data?.data);
      toast.success('Resume generated!');
      setStep(4);
    } catch {
      toast.error('Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 50;

    const line = (text: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 30]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const wrapped = doc.splitTextToSize(text, pageWidth - marginX * 2);
      doc.text(wrapped, marginX, y);
      y += wrapped.length * (size * 0.9) + 4;
    };
    const spacer = (h = 8) => { y += h; };
    const heading = (text: string) => {
      spacer(6);
      const accent = TEMPLATES.find(t => t.id === templateId)?.accent || '#334155';
      const [r, g, b] = hexToRgb(accent);
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(1);
      line(text.toUpperCase(), 11, true, [r, g, b]);
      doc.line(marginX, y - 8, pageWidth - marginX, y - 8);
      spacer(4);
    };

    const { header, objective, education, skills, projects: p, experience, achievements, certifications } = result.content;

    line(header.name || 'Student', 18, true);
    line(`${header.branch || ''}${header.college ? ' | ' + header.college : ''}${header.cgpa ? ' | CGPA: ' + header.cgpa : ''}`, 10);
    line([header.email, header.phone, header.linkedinUrl, header.githubUrl].filter(Boolean).join('  |  '), 9);

    heading('Career Objective');
    line(objective, 10);

    heading('Education');
    education.forEach(e => line(`${e.level} — ${e.institution || ''} — ${e.score} ${e.year ? '— ' + e.year : ''}`, 10));

    if (Object.keys(skills).length > 0) {
      heading('Skills');
      Object.entries(skills).forEach(([cat, list]) => {
        if (list.length) line(`${cat}: ${list.join(', ')}`, 10);
      });
    }

    if (p.length > 0) {
      heading('Projects');
      p.forEach(proj => {
        line(`${proj.name} (${proj.techStack})`, 10, true);
        line(proj.description, 9);
      });
    }

    if (experience.length > 0) {
      heading('Experience');
      experience.forEach(exp => {
        line(`${exp.role} — ${exp.company} (${exp.duration})`, 10, true);
        exp.bullets.forEach(b => line(`• ${b}`, 9));
      });
    }

    if (achievements.length > 0) {
      heading('Achievements');
      achievements.forEach(a => line(`• ${a}`, 9));
    }

    if (certifications.length > 0) {
      heading('Certifications');
      certifications.forEach(c => line(`• ${c.name}`, 9));
    }

    const fileName = `${(header.name || 'Student').replace(/\s+/g, '_')}_Resume_CIP.pdf`;
    doc.save(fileName);
    toast.success('Resume downloaded!');
  };

  const atsColor = (score: number) => (score >= 80 ? '#4ADE80' : score >= 60 ? '#F59E0B' : '#EF4444');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <FileText className="text-sky-500" size={28} />
        <h1 className="text-2xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-wide">
          AI Resume Builder
        </h1>
      </div>

      {/* Step tabs */}
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button key={label} onClick={() => setStep(i)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
            style={step === i
              ? { background: 'rgba(56,189,248,0.12)', borderColor: 'rgba(56,189,248,0.3)', color: '#38BDF8' }
              : { borderColor: 'rgba(148,163,184,0.2)', color: '#94A3B8' }}>
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6 border backdrop-blur-[20px] space-y-5 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">

        {/* Step 0: Review / Auto-fill */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Review Auto-Filled Data</h2>
            <p className="text-sm text-slate-500">We pull your header, education, skills, and achievements straight from your profile.</p>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Target Role</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            </div>
            <button onClick={handleAutoFill} disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' }}>
              <Sparkles size={16} /> {loading ? 'Auto-filling...' : 'Auto-fill from my profile'}
            </button>

            {result && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 space-y-1 text-sm">
                <p className="font-bold text-slate-900 dark:text-white">{result.content.header.name}</p>
                <p className="text-slate-500">{result.content.header.branch} | {result.content.header.college} | CGPA: {result.content.header.cgpa}</p>
                <p className="text-slate-500 italic">{result.content.objective}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Projects */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Add Your Projects</h2>
            {projects.map((p, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Project {i + 1}</span>
                  <button onClick={() => removeProject(i)}><Trash2 size={14} className="text-red-500" /></button>
                </div>
                <input value={p.name} onChange={e => updateProject(i, { name: e.target.value })} placeholder="Project name"
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                <input value={p.techStack} onChange={e => updateProject(i, { techStack: e.target.value })} placeholder="Tech stack (e.g. React, Node.js)"
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                <textarea value={p.description} onChange={e => updateProject(i, { description: e.target.value })}
                  placeholder="One line description (e.g. made a website for college attendance using face recognition)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                <input value={p.githubLink} onChange={e => updateProject(i, { githubLink: e.target.value })} placeholder="GitHub link (optional)"
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                <button onClick={() => handleImproveProject(i)} disabled={improvingIndex === i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 text-purple-500 disabled:opacity-60">
                  <Wand2 size={13} /> {improvingIndex === i ? 'Improving...' : 'Improve with AI'}
                </button>
              </div>
            ))}
            <button onClick={addProject} className="flex items-center gap-1.5 text-sm font-bold text-sky-500">
              <Plus size={16} /> Add another project
            </button>
          </div>
        )}

        {/* Step 2: Internships */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Internships / Experience (optional)</h2>
            {internships.map((e, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Internship {i + 1}</span>
                  <button onClick={() => removeInternship(i)}><Trash2 size={14} className="text-red-500" /></button>
                </div>
                <input value={e.company} onChange={ev => updateInternship(i, { company: ev.target.value })} placeholder="Company name"
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                <div className="flex gap-2">
                  <input value={e.role} onChange={ev => updateInternship(i, { role: ev.target.value })} placeholder="Role"
                    className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                  <input value={e.duration} onChange={ev => updateInternship(i, { duration: ev.target.value })} placeholder="Duration"
                    className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                </div>
                <textarea value={e.bullets[0] || ''} onChange={ev => updateInternship(i, { bullets: [ev.target.value] })}
                  placeholder="What did you work on?" rows={2}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
              </div>
            ))}
            <button onClick={addInternship} className="flex items-center gap-1.5 text-sm font-bold text-sky-500">
              <Plus size={16} /> Add internship
            </button>
          </div>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Pick a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplateId(t.id)}
                  className="text-left p-4 rounded-xl border-2 transition-all"
                  style={{ borderColor: templateId === t.id ? t.accent : 'rgba(148,163,184,0.2)' }}>
                  <div className="w-full h-2 rounded-full mb-3" style={{ background: t.accent }} />
                  <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                </button>
              ))}
            </div>
            <button onClick={handleGenerateFinal} disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' }}>
              <Sparkles size={16} /> {loading ? 'Generating...' : 'Generate Resume'}
            </button>
          </div>
        )}

        {/* Step 4: Preview + ATS + Download */}
        {step === 4 && result && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Preview & ATS Score</h2>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4ADE80, #22C55E)' }}>
                <Download size={16} /> Download PDF
              </button>
            </div>

            {/* ATS Score */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 space-y-2">
              <p className="text-sm font-black flex items-center gap-2" style={{ color: atsColor(result.atsScore) }}>
                <GraduationCap size={16} /> ATS Compatibility Score: {result.atsScore}/100
              </p>
              {result.atsFeedback.map((f, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  {f.startsWith('✅') ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" /> :
                   f.startsWith('⚠️') ? <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" /> :
                   <XCircle size={12} className="text-red-500 flex-shrink-0" />}
                  {f.replace(/^[✅⚠️❌]\s*/, '')}
                </p>
              ))}
            </div>

            {/* Simple preview */}
            <div className="p-6 rounded-xl border-2 bg-white text-slate-900" style={{ borderColor: TEMPLATES.find(t => t.id === templateId)?.accent }}>
              <p className="text-xl font-black">{result.content.header.name}</p>
              <p className="text-sm text-slate-600">{result.content.header.branch} | {result.content.header.college} | CGPA: {result.content.header.cgpa}</p>
              <p className="text-xs text-slate-500 mb-3">{[result.content.header.email, result.content.header.phone].filter(Boolean).join(' | ')}</p>
              <p className="text-sm italic mb-3">{result.content.objective}</p>
              {result.content.projects.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-1">Projects</p>
                  {result.content.projects.map((p, i) => (
                    <div key={i} className="mb-1">
                      <p className="text-sm font-bold">{p.name} ({p.techStack})</p>
                      <p className="text-xs text-slate-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

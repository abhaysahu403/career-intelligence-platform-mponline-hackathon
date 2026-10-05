'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CheckCircle2, FileText, GraduationCap, Plus, Save, Upload, User } from 'lucide-react';
import { studentApi, mlServiceApi } from '@/lib/api';
import { useAppStore } from '@/store';
import ParsingStatus from '@/components/resume/ParsingStatus';
import type { ResumeParsingStatus } from '@/types';

export default function ProfilePage() {
  const { user, setUser } = useAppStore();
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'skills' | 'academics'>('personal');
  
  // RAG Parsing Status
  const [parsingStatus, setParsingStatus] = useState<ResumeParsingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      college: user?.college ?? '',
      branch: user?.branch ?? '',
      year: user?.year ?? 3,
      cgpa: user?.cgpa ?? '',
      phone: '',
      linkedin: '',
      github: '',
    },
  });

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF resumes are supported.');
      return;
    }
    setResumeFile(file);
    toast.success('Resume selected. Save to upload.');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setNewSkill('');
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setUploading(true);
    
    try {
      // Upload resume if selected
      if (resumeFile) {
        // Step 1: Upload
        setParsingStatus({
          status: 'uploading',
          progress: 25,
          message: 'Uploading resume...'
        });
        
        try {
          // Import PDF extractor dynamically
          const { extractTextFromPDF } = await import('@/lib/pdfExtractor');
          
          // Extract text from PDF
          toast.loading('Extracting text from PDF...', { id: 'pdf-extract' });
          const resumeText = await extractTextFromPDF(resumeFile);
          toast.success('Text extracted successfully!', { id: 'pdf-extract' });

          // Step 2: Parse with RAG
          setParsingStatus({
            status: 'parsing',
            progress: 50,
            message: 'AI is parsing your resume with RAG...'
          });
          
          // Call ML service for RAG parsing
          const ragResponse = await mlServiceApi.parseResumeWithRAG({ text: resumeText });

          // Step 3: Generate Embeddings (already done by ML service)
          setParsingStatus({
            status: 'generating_embeddings',
            progress: 75,
            message: 'Generating semantic embeddings...'
          });
          
          // Simulate delay for UX
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Upload extracted text to backend
          const resumeResponse = await studentApi.uploadResumeText(resumeText, resumeFile.name);

          // Step 4: Complete
          setParsingStatus({
            status: 'complete',
            progress: 100,
            message: 'Resume processed successfully!',
            data: ragResponse.data
          });
          
          toast.success('Resume uploaded and processed with RAG!');
        } catch (resumeError) {
          console.error('❌ Resume upload failed:', resumeError);
          
          setParsingStatus({
            status: 'error',
            progress: 0,
            message: 'Failed to process resume',
            error: resumeError instanceof Error ? resumeError.message : 'Unknown error'
          });
          
          toast.error('Resume upload failed. Using profile data instead.');
          
          // Fallback: Generate resume from profile data
          try {
            const { generateResumeFromProfile } = await import('@/lib/pdfExtractor');
            const profileResumeText = generateResumeFromProfile({
              name: data.name as string,
              email: data.email as string,
              phone: data.phone as string,
              college: data.college as string,
              branch: data.branch as string,
              year: Number(data.year),
              cgpa: data.cgpa as string,
              skills: skills,
              linkedin: data.linkedin as string,
              github: data.github as string,
            });
            
            await studentApi.uploadResumeText(profileResumeText, 'profile-resume.txt');
            toast.success('Profile data saved as resume!');
          } catch (fallbackError) {
            console.error('❌ Fallback resume upload failed:', fallbackError);
          }
        }
      }
      
      // Transform frontend field names to backend field names
      const backendData = {
        phone: data.phone,
        institution: data.college, // college → institution
        department: data.branch,   // branch → department
        graduationYear: Number(data.year), // year → graduationYear
        linkedinUrl: data.linkedin,
        githubUrl: data.github,
        skills: skills,
        academicData: {
          cgpa: data.cgpa ? Number(data.cgpa) : null,
          degree: data.branch,
          specialization: data.branch,
        }
      };
      
      await studentApi.updateProfile(backendData);

      // Always update UI state
      setUser({ ...user!, ...data as object, year: Number(data.year), skills });
      setSaved(true);
      toast.success('Profile saved successfully!');
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('❌ Profile save failed:', e);
      toast.error('Failed to save profile. Please try again.');
    }

    setUploading(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'skills', label: 'Skills', icon: GraduationCap },
    { id: 'academics', label: 'Academics', icon: FileText },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black bg-gradient-to-br from-sky to-blue-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] flex-shrink-0"
          style={{ fontFamily: 'Plus Jakarta Sans,sans-serif' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{user?.branch} - {user?.college}</p>
        </div>
        <Link
          href="/profile/academic"
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
        >
          <GraduationCap size={15} /> Academic Profile
        </Link>
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1"
          style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#fff' }}
        >
          {saved ? <><CheckCircle2 size={15} /> Saved</> : uploading ? 'Saving...' : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      <div className="flex gap-2 rounded-2xl p-1.5 backdrop-blur-[20px] border bg-white/50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-sky-100 dark:bg-sky/10 text-sky-600 dark:text-sky border border-sky-300 dark:border-sky/20 shadow-sm dark:shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <div className="space-y-6 rounded-[32px] border backdrop-blur-[20px] p-8 shadow-xl bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-lg">Personal Information</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Aryan Sharma' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@college.edu' },
              { name: 'college', label: 'College', type: 'text', placeholder: 'RGPV University' },
              { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 9876543210' },
              { name: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'linkedin.com/in/aryan' },
              { name: 'github', label: 'GitHub URL', type: 'url', placeholder: 'github.com/aryan' },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-[10px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                <input
                  {...register(field.name as 'name')}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border px-4 py-3 text-sm font-medium placeholder-slate-500 focus:ring-2 focus:ring-sky/20 focus:border-sky/40 transition-all outline-none bg-white dark:bg-[rgba(15,23,42,0.6)] border-slate-200 dark:border-[rgba(255,255,255,0.1)] text-slate-900 dark:text-[#F1F5F9]"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="mb-2 block text-[10px] font-black text-slate-500 uppercase tracking-widest">Branch</label>
              <select
                {...register('branch')}
                className="w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:border-sky/40 transition-all bg-white dark:bg-[rgba(15,23,42,0.6)] border-slate-200 dark:border-[rgba(255,255,255,0.1)] text-slate-900 dark:text-[#F1F5F9]"
              >
                {['CSE', 'IT', 'ECE', 'ME', 'CE', 'MCA'].map((branch) => <option key={branch} value={branch} style={{ background: '#FFFFFF', color: '#0F172A' }}>{branch}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black text-slate-500 uppercase tracking-widest">Year</label>
              <select
                {...register('year')}
                className="w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:border-sky/40 transition-all bg-white dark:bg-[rgba(15,23,42,0.6)] border-slate-200 dark:border-[rgba(255,255,255,0.1)] text-slate-900 dark:text-[#F1F5F9]"
              >
                {[1, 2, 3, 4].map((year) => <option key={year} value={year} style={{ background: '#FFFFFF', color: '#0F172A' }}>Year {year}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black text-slate-500 uppercase tracking-widest">CGPA</label>
              <input
                {...register('cgpa')}
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:border-sky/40 transition-all bg-white dark:bg-[rgba(15,23,42,0.6)] border-slate-200 dark:border-[rgba(255,255,255,0.1)] text-slate-900 dark:text-[#F1F5F9]"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-6 rounded-[32px] border backdrop-blur-[20px] p-8 shadow-xl bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-lg">Technical Skills</h3>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-2 rounded-xl border border-sky/20 bg-sky/5 px-4 py-2 text-sm font-black text-sky shadow-[0_0_15px_rgba(56,189,248,0.05)]"
              >
                {skill}
                <button type="button" onClick={() => setSkills(skills.filter((item) => item !== skill))} className="ml-2 text-lg leading-none hover:text-slate-900 dark:hover:text-white transition-colors">
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())}
              placeholder="Add a new skill (e.g. Docker, Redux)"
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium placeholder-slate-500 outline-none focus:border-sky/40 transition-all bg-white dark:bg-[rgba(15,23,42,0.6)] border-slate-200 dark:border-[rgba(255,255,255,0.1)] text-slate-900 dark:text-[#F1F5F9]"
            />
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      )}

      {activeTab === 'academics' && (
        <div className="space-y-6">
          {/* Resume Upload Section */}
          <div className="rounded-[32px] border backdrop-blur-[20px] p-8 shadow-xl bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-lg mb-6">Upload Resume</h3>
            
            <div
              {...getRootProps()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragActive
                  ? 'border-sky bg-sky/5 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                  : 'border-slate-700 hover:border-sky/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky/10 border border-sky/20">
                  <Upload size={32} className="text-sky" />
                </div>
                {resumeFile ? (
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{resumeFile.name}</p>
                    <p className="text-sm text-slate-400">
                      {(resumeFile.size / 1024).toFixed(2)} KB • Click Save to upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-slate-400">or click to browse • PDF only • Max 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* RAG Parsing Status */}
            {parsingStatus.status !== 'idle' && (
              <div className="mt-6">
                <ParsingStatus
                  status={parsingStatus.status}
                  progress={parsingStatus.progress}
                  message={parsingStatus.message}
                  data={parsingStatus.data}
                  error={parsingStatus.error}
                />
              </div>
            )}

            <div className="mt-4 rounded-2xl p-4 border" style={{ background: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.2)' }}>
              <p className="text-xs text-sky font-medium">
                💡 <strong>Smart Upload with RAG:</strong> We'll extract text from your PDF and parse it using AI with semantic embeddings for personalized interview questions!
              </p>
            </div>
          </div>

          {/* Academic Snapshot */}
          <div className="rounded-[32px] border backdrop-blur-[20px] p-8 shadow-xl bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-lg">Academic Snapshot</h3>
              <span className="rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
                CGPA: {user?.cgpa ?? 'Not added'}
              </span>
            </div>
            <div className="rounded-2xl p-5 border bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]">
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                Keep your branch, year, and CGPA updated here so readiness scoring and job recommendations stay tied to your real profile.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

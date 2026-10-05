'use client';
// app/dashboard/certificates/upload/page.tsx

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { uploadCertificate, pollForResult } from '@/lib/api/certificates';
import { scoreApi } from '@/lib/api';
import { Upload, FileText, Search, Shield, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024;

type UploadStage = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // User ID — from auth context in production
  const userId = typeof window !== 'undefined'
    ? Number(localStorage.getItem('userId') || '1')
    : 1;

  const handleFile = useCallback((f: File) => {
    setError('');
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only PDF, JPG, and PNG files are supported.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File size must be under 10MB.');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setStage('uploading');
    setStatusMsg('Uploading certificate...');

    try {
      const scoreBefore = await scoreApi.get().then(
        (res) => res.data?.data?.readiness ?? res.data?.readiness ?? null
      ).catch(() => null);

      const resp = await uploadCertificate(file, userId);
      setStage('processing');
      setStatusMsg('Analyzing certificate with AI...');

      await pollForResult(
        resp.certificateId,
        (status) => {
          const msgs: Record<string, string> = {
            PENDING: 'Queued for processing...',
            PROCESSING: 'Running OCR, issuer check, and tampering detection...',
          };
          setStatusMsg(msgs[status] || 'Processing...');
        }
      );

      setStage('done');
      if (typeof scoreBefore === 'number') {
        const scoreAfter = await scoreApi.get().then(
          (res) => res.data?.data?.readiness ?? res.data?.readiness ?? null
        ).catch(() => null);
        if (typeof scoreAfter === 'number' && scoreAfter > scoreBefore) {
          toast.success(`+${Math.round(scoreAfter - scoreBefore)} Readiness Points! 🎯`);
        }
      }
      router.push(`/dashboard/certificates/${resp.certificateId}`);
    } catch (err: unknown) {
      setStage('error');
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStage('idle');
    setStatusMsg('');
    setError('');
  };

  const isLoading = stage === 'uploading' || stage === 'processing';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">Verify Certificate</h1>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Upload a PDF or image. Our AI will check authenticity in under 8 seconds.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative rounded-[32px] p-12 text-center transition-all duration-300 border-2 border-dashed backdrop-blur-[20px] ${
          dragOver 
            ? 'bg-sky/5 border-sky shadow-[0_0_30px_rgba(56,189,248,0.2)]' 
            : file 
              ? 'bg-mint/5 border-mint shadow-[0_0_30px_rgba(74,222,128,0.2)]' 
              : 'bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/4 hover:border-slate-300 dark:hover:border-white/20'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {!file ? (
          <div className="pointer-events-none">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all ${dragOver ? 'bg-sky/20 text-sky' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
              <Upload size={32} />
            </div>
            <p className="text-xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Drop your certificate here
            </p>
            <p className="text-sm mt-2 text-slate-500 dark:text-slate-500 font-medium tracking-wide">or click to browse your files</p>
            <p className="text-[10px] mt-4 text-slate-600 font-black uppercase tracking-widest">PDF, JPG, PNG · Max 10MB</p>
          </div>
        ) : (
          <div className="pointer-events-none">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-56 mx-auto rounded-2xl shadow-2xl mb-4 object-contain border border-slate-200 dark:border-white/10" />
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center bg-mint/10 border border-mint/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                <FileText size={32} className="text-mint" />
              </div>
            )}
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest">{file.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl flex items-start gap-3 border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-400" />
          <span className="text-sm font-bold text-red-400 uppercase tracking-widest">{error}</span>
        </div>
      )}

      {/* Status */}
      {isLoading && (
        <div className="mt-6 p-5 rounded-2xl border backdrop-blur-[20px]" style={{ background: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.1)' }}>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0 border-sky" />
            <span className="text-sm font-black text-sky uppercase tracking-widest">{statusMsg}</span>
          </div>
          <div className="mt-4 rounded-full h-1.5 overflow-hidden bg-slate-200 dark:bg-white/5">
            <div className={`h-full rounded-full transition-all duration-1000 bg-sky shadow-[0_0_10px_rgba(56,189,248,0.5)] ${stage === 'uploading' ? 'w-1/4' : 'w-3/4 animate-pulse'}`} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        {file && !isLoading && (
          <button
            onClick={reset}
            className="flex-1 py-4 px-6 font-black uppercase tracking-widest rounded-2xl border backdrop-blur-[20px] text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/5 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
          >
            Clear
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className={`flex-1 py-4 px-6 font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${
            !file || isLoading
              ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-white/5'
              : 'bg-gradient-to-r from-sky to-blue-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] hover:-translate-y-1'
          }`}
        >
          {isLoading ? 'Processing...' : 'Verify Certificate'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-12 grid grid-cols-3 gap-5 text-center text-[10px]">
        {[
          { icon: Search, label: 'OCR Extraction', color: 'text-indigo-400', bg: 'rgba(129,140,248,0.1)' },
          { icon: Shield, label: 'Issuer Validation', color: 'text-sky', bg: 'rgba(56,189,248,0.1)' },
          { icon: ShieldCheck, label: 'Tamper Detection', color: 'text-mint', bg: 'rgba(74,222,128,0.1)' },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-2xl border backdrop-blur-[20px] transition-all hover:-translate-y-1 bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]">
            <div className={`w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center`} style={{ background: item.bg }}>
              <item.icon size={20} className={item.color} />
            </div>
            <span className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

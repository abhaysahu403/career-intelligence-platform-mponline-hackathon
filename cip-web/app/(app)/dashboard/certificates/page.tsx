'use client';
// app/dashboard/certificates/page.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserCertificates, getScoreColor, deleteCertificate, CertificateSummary } from '@/lib/api/certificates';
import { Plus, ChevronRight, ShieldCheck, Clock, XCircle, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const PAGE_SIZE = 10;
  const userId = typeof window !== 'undefined'
    ? Number(localStorage.getItem('userId') || '1')
    : 1;

  useEffect(() => {
    load();
  }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUserCertificates(userId, page, PAGE_SIZE);
      setCertificates(data.certificates);
      setTotal(data.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const handleDelete = async (certId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to detail page
    
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    setDeleting(certId);
    try {
      await deleteCertificate(certId);
      toast.success('Certificate deleted successfully');
      // Refresh the list
      await load();
    } catch (err) {
      toast.error('Failed to delete certificate');
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'genuine': return { bg: 'rgba(16,185,129,0.1)', color: '#047857' };
      case 'likely genuine': return { bg: 'rgba(132,204,22,0.1)', color: '#4D7C0F' };
      case 'suspicious': return { bg: 'rgba(245,158,11,0.1)', color: '#B45309' };
      case 'likely fake': return { bg: 'rgba(249,115,22,0.1)', color: '#C2410C' };
      case 'fake': return { bg: 'rgba(239,68,68,0.1)', color: '#B91C1C' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">My Certificates</h1>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-400 font-medium">{total} certificate{total !== 1 ? 's' : ''} verified</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/certificates/upload')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1"
          style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#fff' }}
        >
          <Plus size={18} /> Verify New
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm mb-6 flex items-start gap-2 border font-medium" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
          <XCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[32px] h-20 animate-pulse bg-slate-100 dark:bg-[rgba(255,255,255,0.02)] border border-slate-200 dark:border-[rgba(255,255,255,0.05)]" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-24 rounded-[40px] border backdrop-blur-[30px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[28px] flex items-center justify-center bg-sky/5 border border-sky/10 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
            <ShieldCheck size={36} className="text-sky" />
          </div>
          <h3 className="text-xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">No certificates yet</h3>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-400 font-medium">Upload your first certificate to get started</p>
          <button
            onClick={() => router.push('/dashboard/certificates/upload')}
            className="mt-8 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] bg-gradient-to-r from-sky to-blue-600 text-slate-900 dark:text-white"
          >
            Verify a Certificate
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => {
            const sts = getStatusStyle(cert.authenticityStatus ?? '');
            return (
              <div
                key={cert.id}
                onClick={() => router.push(`/dashboard/certificates/${cert.id}`)}
                className="rounded-[32px] border backdrop-blur-[20px] p-5 flex items-center gap-5 cursor-pointer transition-all hover:shadow-2xl hover:border-sky/40 hover:-translate-y-1 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]"
              >
                {/* Score circle */}
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                  {cert.authenticityScore != null ? (
                    <div className="relative w-14 h-14">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke={getScoreColor(cert.authenticityScore)}
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - cert.authenticityScore / 100)}
                          strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 5px ${getScoreColor(cert.authenticityScore)}66)` }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono text-slate-900 dark:text-white">
                        {cert.authenticityScore}
                      </span>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border transition-all bg-slate-100 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]">
                      {cert.status === 'PROCESSING' ? <Clock size={20} className="text-sky animate-pulse" /> :
                       cert.status === 'FAILED' ? <XCircle size={20} className="text-red-400" /> :
                       <FileText size={20} className="text-slate-500 dark:text-slate-500" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm text-slate-900 dark:text-white">{cert.fileName}</p>
                  <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-500 font-medium tracking-wide uppercase">{formatDate(cert.createdAt)}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {cert.authenticityStatus ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                      style={{ background: sts.bg, color: sts.color, borderColor: `${sts.color}30` }}>
                      {cert.authenticityStatus}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                      style={{
                        background: cert.status === 'PROCESSING' ? 'rgba(56,189,248,0.1)' : cert.status === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                        color: cert.status === 'PROCESSING' ? '#38BDF8' : cert.status === 'FAILED' ? '#EF4444' : '#94A3B8',
                        borderColor: cert.status === 'PROCESSING' ? 'rgba(56,189,248,0.2)' : cert.status === 'FAILED' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'
                      }}>
                      {cert.status}
                    </span>
                  )}
                  {cert.confidenceLevel && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{cert.confidenceLevel} conf.</span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(cert.id, e)}
                  disabled={deleting === cert.id}
                  className="flex-shrink-0 p-2 rounded-xl border transition-all hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-50"
                  style={{ 
                    background: 'rgba(239,68,68,0.05)', 
                    borderColor: 'rgba(239,68,68,0.1)',
                    opacity: deleting === cert.id ? 0.5 : 1
                  }}
                  title="Delete certificate"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>

                <ChevronRight size={18} className="text-slate-600 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-6 py-2.5 rounded-xl border backdrop-blur-[20px] text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white disabled:opacity-20 transition-all hover:bg-slate-100 dark:hover:bg-white/5 bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]"
          >
            Previous
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Page <span className="text-slate-900 dark:text-white">{page + 1}</span> / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * PAGE_SIZE >= total}
            className="px-6 py-2.5 rounded-xl border backdrop-blur-[20px] text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white disabled:opacity-20 transition-all hover:bg-slate-100 dark:hover:bg-white/5 bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

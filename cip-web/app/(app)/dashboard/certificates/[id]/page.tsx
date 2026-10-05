'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCertificateResult, getScoreColor, type CertificateResult } from '@/lib/api/certificates';
import { ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle, XCircle, FileText, Calendar, Hash, Users, QrCode, Clock, Download, Share2 } from 'lucide-react';
import ShareReportModal from '@/components/ui/ShareReportModal';

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getCertificateResult(Number(params.id));
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load certificate details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'genuine': return { bg: 'rgba(34,197,94,0.12)', color: '#4ADE80', icon: ShieldCheck };
      case 'likely genuine': return { bg: 'rgba(132,204,22,0.12)', color: '#A3E635', icon: CheckCircle };
      case 'suspicious': return { bg: 'rgba(245,158,11,0.12)', color: '#FBBF24', icon: AlertTriangle };
      case 'likely fake': return { bg: 'rgba(249,115,22,0.12)', color: '#FB923C', icon: AlertTriangle };
      case 'fake': return { bg: 'rgba(239,68,68,0.12)', color: '#FCA5A5', icon: XCircle };
      default: return { bg: 'rgba(255,255,255,0.06)', color: '#A1A1AA', icon: FileText };
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#38BDF8', borderTopColor: 'transparent' }} />
            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Analyzing certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="rounded-[32px] border p-12 text-center backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)]" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <XCircle size={64} className="mx-auto mb-6 text-red-400" />
          <h3 className="text-2xl font-syne font-black mb-2 text-slate-900 dark:text-white uppercase tracking-widest">Load Failed</h3>
          <p className="text-sm font-bold text-red-400 uppercase tracking-widest">{error}</p>
          <button
            onClick={() => router.push('/dashboard/certificates')}
            className="mt-10 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#fff' }}
          >
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(result.status);
  const StatusIcon = statusStyle.icon;

  const compScores = result.componentScores || { ocr: 0, issuer: 0, id: 0, anti_tamper: 0 };
  const extracted = result.extractedData || { name: '', issuer: '', certificate_title: '', issue_date: '', certificate_id: '', registration_number: '', signatories: [], qr_code_data: '', ocr_confidence: 0 };
  const issuerVal = result.issuerValidation || { issuer_valid: false, issuer_confidence: 0, matched_name: '', issuer_type: '', matched_domain: '', accredited: false };
  const tamperRes = result.tamperingResult || { tampering_detected: false, tampering_score: 0, issues: [], method_scores: {} };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <ArrowLeft size={16} /> Back to Certificates
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all hover:bg-sky-500/10 hover:border-sky-500/30"
            style={{ background: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.1)', color: '#38BDF8' }}
          >
            <Share2 size={16} /> Share Report
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all hover:bg-slate-100 dark:hover:bg-white/5 bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] border-slate-200 dark:border-[rgba(255,255,255,0.05)] text-slate-900 dark:text-white"
          >
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="rounded-[40px] border p-10 relative overflow-hidden backdrop-blur-[30px] shadow-2xl bg-white dark:bg-[rgba(8,12,20,0.8)] border-slate-200 dark:border-[rgba(255,255,255,0.08)]">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20 bg-[radial-gradient(circle,#38BDF8,transparent_70%)] -translate-y-1/3 translate-x-1/3" />

        <div className="relative flex flex-col md:flex-row items-center gap-10">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="12" />
                <circle
                  cx="80" cy="80" r="70"
                  fill="none"
                  stroke={getScoreColor(result.authenticityScore)}
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - result.authenticityScore / 100)}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 15px ${getScoreColor(result.authenticityScore)}88)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black font-mono tracking-tighter" style={{ color: getScoreColor(result.authenticityScore) }}>
                  {result.authenticityScore}
                </span>
                <span className="text-[10px] mt-1 font-black uppercase tracking-widest text-slate-500">Authenticity</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-5">
              <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}40` }}>
                <StatusIcon size={16} />
                {result.status}
              </span>
              <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                {result.confidenceLevel} Confidence
              </span>
            </div>
            <h1 className="text-3xl font-syne font-black mb-3 text-slate-900 dark:text-white uppercase tracking-widest">
              {result.fileName}
            </h1>
            <p className="text-sm mb-6 font-medium text-slate-600 dark:text-slate-400">
              Verified on {new Date(result.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest justify-center md:justify-start text-slate-500">
              <Clock size={14} className="text-sky" />
              Engine processing: {result.processingTimeMs}ms
            </div>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="rounded-[32px] border backdrop-blur-[20px] p-8 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h2 className="text-sm font-syne font-black mb-6 text-slate-900 dark:text-white uppercase tracking-widest">
          Component Analysis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'OCR Extraction', score: compScores.ocr, color: '#818CF8' },
            { label: 'Issuer Check', score: compScores.issuer, color: '#38BDF8' },
            { label: 'Identity Proof', score: compScores.id, color: '#4ADE80' },
            { label: 'Forensics', score: compScores.anti_tamper, color: '#FBBF24' },
          ].map((comp) => (
            <div key={comp.label} className="rounded-2xl p-5 text-center border transition-all hover:bg-slate-100 dark:hover:bg-white/2 bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500">{comp.label}</p>
              <p className="text-4xl font-black font-mono tracking-tighter" style={{ color: comp.color }}>{comp.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Data */}
      <div className="rounded-[32px] border backdrop-blur-[20px] p-8 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h2 className="text-sm font-syne font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest">
          <FileText size={20} className="text-sky" />
          Data Extraction Insight
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: Users, label: 'Candidate Name', value: extracted.name },
            { icon: ShieldCheck, label: 'Issuing Authority', value: extracted.issuer },
            { icon: FileText, label: 'Certificate Title', value: extracted.certificate_title },
            { icon: Calendar, label: 'Issue Date', value: extracted.issue_date },
            { icon: Hash, label: 'Certificate ID', value: extracted.certificate_id },
            { icon: Hash, label: 'Reg Number', value: extracted.registration_number },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-slate-100 dark:hover:bg-white/2 bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky/10 border border-sky/20">
                <item.icon size={18} className="text-sky" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">{item.label}</p>
                <p className="text-sm font-black truncate text-slate-900 dark:text-white">
                  {item.value || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Signatories */}
        {extracted.signatories && extracted.signatories.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500">Signatories</p>
            <div className="flex flex-wrap gap-2">
              {extracted.signatories.map((sig, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-sky/10 text-sky border border-sky/20">
                  {sig}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Data */}
        {extracted.qr_code_data && (
          <div className="mt-6 p-5 rounded-2xl flex items-start gap-4 border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
            <QrCode size={20} className="flex-shrink-0 mt-0.5 text-sky" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">Embedded QR Metadata</p>
              <p className="text-xs font-mono break-all font-medium text-slate-600 dark:text-slate-400">
                {extracted.qr_code_data}
              </p>
            </div>
          </div>
        )}

        {/* OCR Confidence */}
        <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl border bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Extraction Precision:</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/5">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${extracted.ocr_confidence}%`, background: getScoreColor(extracted.ocr_confidence), boxShadow: `0 0 10px ${getScoreColor(extracted.ocr_confidence)}66` }} />
          </div>
          <span className="text-sm font-mono font-black" style={{ color: getScoreColor(extracted.ocr_confidence) }}>
            {extracted.ocr_confidence}%
          </span>
        </div>
      </div>

      {/* Issuer Validation */}
      <div className="rounded-[32px] border backdrop-blur-[20px] p-8 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h2 className="text-sm font-syne font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest">
          <ShieldCheck size={20} className="text-sky" />
          Issuer Validation Service
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-2xl border" 
            style={{ 
              background: issuerVal.issuer_valid ? 'rgba(74,222,128,0.05)' : 'rgba(239,68,68,0.05)', 
              borderColor: issuerVal.issuer_valid ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)' 
            }}>
            <span className={`text-xs font-black uppercase tracking-widest ${issuerVal.issuer_valid ? 'text-mint' : 'text-red-400'}`}>Official Issuer Check</span>
            <span className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest ${issuerVal.issuer_valid ? 'text-mint' : 'text-red-400'}`}>
              {issuerVal.issuer_valid ? <CheckCircle size={20} /> : <XCircle size={20} />}
              {issuerVal.issuer_valid ? 'Verified' : 'Unverified'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">Database Match</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{issuerVal.matched_name || '—'}</p>
            </div>
            <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">Entity Classification</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{issuerVal.issuer_type || '—'}</p>
            </div>
            <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">Digital Domain</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{issuerVal.matched_domain || '—'}</p>
            </div>
            <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">Accreditation Status</p>
              <p className={`text-sm font-black uppercase tracking-widest ${issuerVal.accredited ? 'text-mint' : 'text-red-400'}`}>
                {issuerVal.accredited ? 'Accredited' : 'Non-Accredited'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl border mt-4 bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Issuer Trust Factor:</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/5">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${issuerVal.issuer_confidence}%`, background: getScoreColor(issuerVal.issuer_confidence), boxShadow: `0 0 10px ${getScoreColor(issuerVal.issuer_confidence)}66` }} />
            </div>
            <span className="text-sm font-mono font-black" style={{ color: getScoreColor(issuerVal.issuer_confidence) }}>
              {issuerVal.issuer_confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Tampering Detection */}
      <div className="rounded-[32px] border backdrop-blur-[20px] p-8 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
        <h2 className="text-sm font-syne font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest">
          <AlertTriangle size={20} className="text-amber-400" />
          Forensic Tampering Detection
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-2xl border"
            style={{ 
              background: tamperRes.tampering_detected ? 'rgba(239,68,68,0.05)' : 'rgba(74,222,128,0.05)', 
              borderColor: tamperRes.tampering_detected ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)' 
            }}>
            <span className={`text-xs font-black uppercase tracking-widest ${tamperRes.tampering_detected ? 'text-red-400' : 'text-mint'}`}>Manipulation Check</span>
            <span className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest ${tamperRes.tampering_detected ? 'text-red-400' : 'text-mint'}`}>
              {tamperRes.tampering_detected ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
              {tamperRes.tampering_detected ? 'Detected' : 'Clear'}
            </span>
          </div>

          {tamperRes.issues && tamperRes.issues.length > 0 && (
            <div className="p-5 rounded-2xl border" style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-red-400">Forensic Flags:</p>
              <ul className="space-y-2">
                {tamperRes.issues.map((issue, idx) => (
                  <li key={idx} className="text-xs flex items-start gap-3 font-black text-red-400/80 uppercase tracking-widest">
                    <span className="text-red-500 select-none">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tamperRes.method_scores && Object.keys(tamperRes.method_scores).length > 0 && (
            <div className="space-y-4 mt-6 p-5 rounded-2xl border bg-slate-50 dark:bg-[rgba(255,255,255,0.01)] border-slate-200 dark:border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Method Analysis Scores:</p>
              {Object.entries(tamperRes.method_scores).map(([method, score]) => (
                <div key={method} className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0 w-36 text-slate-600 dark:text-slate-400">{method.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/5">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${score}%`, background: getScoreColor(score as number), boxShadow: `0 0 10px ${getScoreColor(score as number)}44` }} />
                  </div>
                  <span className="text-[10px] font-mono font-black w-8 text-right" style={{ color: getScoreColor(score as number) }}>
                    {score}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 p-4 rounded-2xl border mt-4 bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manipulation Index:</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/5">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${tamperRes.tampering_score}%`, background: getScoreColor(100 - tamperRes.tampering_score), boxShadow: `0 0 10px ${getScoreColor(100 - tamperRes.tampering_score)}66` }} />
            </div>
            <span className="text-sm font-mono font-black" style={{ color: getScoreColor(100 - tamperRes.tampering_score) }}>
              {tamperRes.tampering_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Reasons & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reasons */}
        {result.reasons && result.reasons.length > 0 && (
          <div className="rounded-[32px] border backdrop-blur-[20px] p-8 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[10px] font-black mb-5 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest">
              <CheckCircle size={16} className="text-mint" />
              Validation Merits
            </h3>
            <ul className="space-y-4">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="text-xs flex items-start gap-3 font-medium text-slate-600 dark:text-slate-400">
                  <span className="text-mint font-black">✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="rounded-[32px] border backdrop-blur-[20px] p-8 bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[10px] font-black mb-5 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest">
              <AlertTriangle size={16} className="text-amber-400" />
              System Warnings
            </h3>
            <ul className="space-y-4">
              {result.warnings.map((warning, idx) => (
                <li key={idx} className="text-xs flex items-start gap-3 font-medium text-slate-600 dark:text-slate-400">
                  <span className="text-amber-400 font-black">⚠</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareReportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        reportType="certificate"
        reportData={{
          userId: typeof window !== 'undefined' ? Number(localStorage.getItem('userId') || '1') : 1,
          certificateId: Number(params.id)
        }}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X, Mail, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'interview' | 'jobs' | 'certificate';
  reportData: {
    userId: number;
    interviewId?: number;
    certificateId?: number;
    jobIds?: number[];
  };
}

export default function ShareReportModal({ isOpen, onClose, reportType, reportData }: ShareReportModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const getTitle = () => {
    switch (reportType) {
      case 'interview': return '📊 Share Interview Report';
      case 'jobs': return '💼 Share Job Recommendations';
      case 'certificate': return '📜 Share Certificate Report';
    }
  };

  const getPlaceholderMessage = () => {
    switch (reportType) {
      case 'interview': 
        return 'Hi! I wanted to share my interview performance report with you. Please take a look!';
      case 'jobs': 
        return 'Check out these amazing job opportunities that match my skills!';
      case 'certificate': 
        return 'Here is my verified certificate. It has been validated by the CIP Platform.';
    }
  };

  const handleShare = async () => {
    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);

    try {
      let endpoint = '';
      let payload: any = {
        userId: reportData.userId,
        recipientEmail,
        recipientName: recipientName || undefined,
        message: message || undefined,
      };

      switch (reportType) {
        case 'interview':
          endpoint = '/email/share/interview-report';
          payload.interviewId = reportData.interviewId;
          break;
        case 'jobs':
          endpoint = '/email/share/job-recommendations';
          payload.jobIds = reportData.jobIds || null;
          break;
        case 'certificate':
          endpoint = '/email/share/certificate-report';
          payload.certificateId = reportData.certificateId;
          break;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${apiUrl}${endpoint}`, payload);

      if (response.data.success) {
        toast.success(`Report shared successfully with ${recipientEmail}!`);
        // Reset form
        setRecipientEmail('');
        setRecipientName('');
        setMessage('');
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to share report');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      toast.error(error.response?.data?.message || 'Failed to share report');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Recipient Name (Optional) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Recipient Name <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="John Recruiter"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Personal Message (Optional) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Personal Message <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={getPlaceholderMessage()}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none"
            />
          </div>

          {/* Info */}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3">
            <p className="text-xs text-sky-600 dark:text-sky-400">
              💡 The recipient will receive a professional email with your report. They don't need an account to view it.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={sending || !recipientEmail}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-sky-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

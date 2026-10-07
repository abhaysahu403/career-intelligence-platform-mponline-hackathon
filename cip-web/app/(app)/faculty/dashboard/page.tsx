'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Eye, Copy, Users, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { customInterviewApi } from '@/lib/api';
import { useT } from '@/lib/i18n';

interface Interview {
  id: number;
  title: string;
  description: string;
  interviewCode: string;
  durationMinutes: number;
  difficulty: string;
  status: string;
  totalQuestions: number;
  createdAt: string;
  shareLink: string;
}

export default function FacultyDashboardPage() {
  const router = useRouter();
  const t = useT();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = await customInterviewApi.getMyInterviews();
      setInterviews(response.data.data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const copyInterviewCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Interview code copied!');
  };

  const copyShareLink = (code: string) => {
    const link = `${window.location.origin}/interview/join/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{t('page.facultyDashboard.title')}</h1>
              <p className="text-gray-400">{t('page.facultyDashboard.subtitle')}</p>
            </div>
            <button
              onClick={() => router.push('/faculty/create-interview')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white rounded-lg hover:shadow-lg hover:shadow-[#38BDF8]/50 transition-all"
            >
              <Plus size={20} />
              Create New Interview
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center">
                <BarChart3 className="text-[#38BDF8]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Interviews</p>
                <p className="text-3xl font-bold text-white">{interviews.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center">
                <Users className="text-[#4ADE80]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Interviews</p>
                <p className="text-3xl font-bold text-white">
                  {interviews.filter(i => i.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <Clock className="text-[#F59E0B]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Questions</p>
                <p className="text-3xl font-bold text-white">
                  {interviews.reduce((sum, i) => sum + i.totalQuestions, 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Your Interviews</h2>
          
          {interviews.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-gray-400 mb-4">No interviews created yet</p>
              <button
                onClick={() => router.push('/faculty/create-interview')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#38BDF8] text-white rounded-lg hover:bg-[#0EA5E9] transition-colors"
              >
                <Plus size={20} />
                Create Your First Interview
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-[#38BDF8]/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{interview.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          interview.status === 'ACTIVE' 
                            ? 'bg-[#4ADE80]/10 text-[#4ADE80]' 
                            : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                      
                      {interview.description && (
                        <p className="text-gray-400 text-sm mb-4">{interview.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <Clock size={16} />
                          {interview.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-2">
                          <Users size={16} />
                          {interview.totalQuestions} questions
                        </span>
                        <span className="px-2 py-1 rounded bg-white/10">
                          {interview.difficulty}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                          <span className="text-gray-400 text-sm">Code:</span>
                          <span className="text-white font-mono font-bold">{interview.interviewCode}</span>
                          <button
                            onClick={() => copyInterviewCode(interview.interviewCode)}
                            className="text-[#38BDF8] hover:text-[#0EA5E9] transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => copyShareLink(interview.interviewCode)}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                        >
                          Copy Share Link
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/faculty/interview/${interview.id}/results`)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-[#0EA5E9] transition-colors"
                      >
                        <Eye size={16} />
                        View Results
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

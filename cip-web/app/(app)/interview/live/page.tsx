'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewApi, mlServiceApi, scoreApi } from '@/lib/api';
import { InterviewV3Session, FacialAnalytics } from '@/types';
import PreInterviewTips from '@/components/PreInterviewTips';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Send,
  Eye,
  Smile,
  TrendingUp,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  Lightbulb,
  Clock,
  Target,
  Sparkles,
  Brain,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InterviewTip {
  order: number;
  icon: string;
  title: string;
  description: string;
  voiceText: string;
}

interface PreInterviewTipsData {
  tips: InterviewTip[];
  welcomeMessage: string;
  estimatedDuration: number;
}

function LiveInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [tipsData, setTipsData] = useState<PreInterviewTipsData | null>(null);
  const [interview, setInterview] = useState<InterviewV3Session | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; message: string }>>([]);
  const readinessBeforeRef = useRef<number | null>(null);

  const celebrateReadinessGain = async () => {
    try {
      const res = await scoreApi.get();
      const after = res.data?.data?.readiness ?? res.data?.readiness;
      const before = readinessBeforeRef.current;
      if (typeof after === 'number' && typeof before === 'number' && after > before) {
        toast.success(`+${Math.round(after - before)} Readiness Points! 🎯`);
      }
    } catch {
      // Score refresh is a nice-to-have here — silently skip if it fails
    }
  };

  // Real-time analytics
  const [confidence, setConfidence] = useState(75);
  const [eyeContact, setEyeContact] = useState<'GOOD' | 'AVERAGE' | 'POOR'>('GOOD');
  const [voiceClarity, setVoiceClarity] = useState(85);
  const [emotion, setEmotion] = useState('CONFIDENT');
  const [posture, setPosture] = useState<'STABLE' | 'UNSTABLE'>('STABLE');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyticsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef<boolean>(false); // Track listening state in ref to avoid closure issues

  useEffect(() => {
    if (!interviewId) {
      toast.error('No interview ID provided');
      router.push('/interview/setup');
      return;
    }
    loadInterviewAndTips();
    scoreApi.get().then(res => {
      readinessBeforeRef.current = res.data?.data?.readiness ?? res.data?.readiness ?? null;
    }).catch(() => {});
    return () => {
      stopCamera();
      stopListening();
      if (analyticsIntervalRef.current) clearInterval(analyticsIntervalRef.current);
    };
  }, [interviewId]);

  const loadInterviewAndTips = async () => {
    try {
      // Fetch both interview session and tips in parallel for faster loading
      const [interviewResponse, tipsResponse] = await Promise.all([
        interviewApi.v3.getSession(parseInt(interviewId!)),
        interviewApi.v3.getTips({
          roundType: 'TECHNICAL', // Default, will be updated after interview loads
          difficulty: 'MEDIUM',
          duration: 30,
        })
      ]);
      
      const interviewData = interviewResponse.data.data;
      setInterview(interviewData);
      
      // If tips need to be refetched with actual interview data, do it in background
      if (interviewData.roundType !== 'TECHNICAL' || 
          interviewData.difficulty !== 'MEDIUM' || 
          interviewData.duration !== 30) {
        // Fetch updated tips in background without blocking
        interviewApi.v3.getTips({
          roundType: interviewData.roundType || 'TECHNICAL',
          difficulty: interviewData.difficulty || 'MEDIUM',
          duration: interviewData.duration || 30,
        }).then(response => {
          setTipsData(response.data.data);
        }).catch(err => {
          console.error('Failed to fetch updated tips:', err);
          // Keep default tips
        });
      } else {
        setTipsData(tipsResponse.data.data);
      }
      
      setLoading(false);
      toast.success('Interview loaded successfully!');
    } catch (error) {
      console.error('Failed to load interview:', error);
      toast.error('Failed to load interview');
      router.push('/interview/setup');
    }
  };

  const handleTipsComplete = async () => {
    setShowTips(false);
    // Start camera and mic after tips
    await startCamera();
    startListening();
    startAnalyticsTracking();
    toast.success('Interview started! Good luck!');
    
    // Auto-speak the first question
    speakQuestion(0);
  };

  const handleSkipTips = async () => {
    setShowTips(false);
    // Start camera and mic after skipping
    await startCamera();
    startListening();
    startAnalyticsTracking();
    toast('Tips skipped. Interview started!');
    
    // Auto-speak the first question
    speakQuestion(0);
  };

  const speakQuestion = (questionIndex: number) => {
    if (!speakerEnabled || !('speechSynthesis' in window)) return;
    
    const currentQ = interview?.questions?.[questionIndex];
    if (!currentQ) return;
    
    // Build question announcement
    let questionText = `Question ${questionIndex + 1}. ${currentQ.topic || 'General'} topic. `;
    questionText += currentQ.question;
    
    // Speak the question
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      toast.success('Camera enabled');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true; // Update ref
      setMicEnabled(true);
      toast.success('Microphone enabled - Start speaking');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + final);
        setInterimTranscript('');
        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          finalizeAnswer();
        }, 2500);
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast.error('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = () => {
      // Use ref instead of state to avoid closure issues
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognition.start(); // Restart if still listening
        } catch (e) {
          console.log('Could not restart recognition:', e);
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    // Set listening to false FIRST to prevent onend from restarting
    setIsListening(false);
    setMicEnabled(false);
    isListeningRef.current = false; // Update ref to stop restart loop
    
    if (recognitionRef.current) {
      // Remove event handlers to prevent any callbacks after stop
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onstart = null;
      
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
        console.log('Recognition already stopped');
      }
      recognitionRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const finalizeAnswer = async () => {
    if (!transcript.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    toast.success('Processing your answer...');
    
    // Stop listening while AI responds
    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }

    try {
      // Get current question details
      const currentQ = interview?.questions?.[currentQuestionIndex];
      
      // NEW: Use submitAndEvaluate endpoint for hybrid evaluation
      const evaluation = await interviewApi.v3.submitAndEvaluate(parseInt(interviewId!), {
        questionIndex: currentQuestionIndex,
        question: currentQ?.question || questionDisplay.question,
        answer: transcript,
        topic: currentQ?.topic || questionDisplay.topic,
        ideal: currentQ?.ideal || '',
        timeTaken: 0, // You can track this if needed
      });

      // Extract evaluation data
      const evalData = evaluation.data.data;
      const score = evalData.score || 0;
      const llmScore = evalData.llm_score || 0;
      const semanticScore = evalData.semantic_score || 0;
      const feedback = evalData.good || "Good answer!";
      const missing = evalData.missing || "";
      const tip = evalData.tip || "";
      const completed = evalData.completed || false;

      // Build comprehensive feedback message
      let feedbackMessage = `Your score: ${Math.round(score)} out of 100. `;
      if (feedback) feedbackMessage += feedback + ". ";
      if (missing) feedbackMessage += "However, " + missing + ". ";
      if (tip) feedbackMessage += tip + ".";
      
      // Speak the feedback if speaker is enabled
      if (speakerEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(feedbackMessage);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          // Move to next question after AI finishes speaking
          setTranscript('');
          setInterimTranscript('');
          
          // Check if interview is completed
          if (completed) {
            toast.success('Interview completed!');
          celebrateReadinessGain();
            celebrateReadinessGain();
            setTimeout(() => {
              router.push(`/interview/report/${interviewId}`);
            }, 2000);
          } else if (currentQuestionIndex < (interview?.questions?.length || 5) - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            // Speak the next question
            setTimeout(() => {
              speakQuestion(nextIndex);
            }, 1000);
            // Resume listening
            if (wasListening) {
              setTimeout(() => startListening(), 2000);
            }
          } else {
            // All questions answered
            toast.success('Interview completed!');
          celebrateReadinessGain();
            celebrateReadinessGain();
            setTimeout(() => {
              router.push(`/interview/report/${interviewId}`);
            }, 2000);
          }
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // If no speech synthesis, just move to next question
        setTranscript('');
        setInterimTranscript('');
        
        if (completed) {
          toast.success('Interview completed!');
          celebrateReadinessGain();
          setTimeout(() => {
            router.push(`/interview/report/${interviewId}`);
          }, 2000);
        } else if (currentQuestionIndex < (interview?.questions?.length || 5) - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          // Speak the next question
          setTimeout(() => {
            speakQuestion(nextIndex);
          }, 1000);
          // Resume listening
          if (wasListening) {
            setTimeout(() => startListening(), 2000);
          }
        } else {
          toast.success('Interview completed!');
          celebrateReadinessGain();
          setTimeout(() => {
            router.push(`/interview/report/${interviewId}`);
          }, 2000);
        }
      }
      
      // Show success toast with scores
      toast.success(`Answer evaluated! Score: ${Math.round(score)}/100 (LLM: ${Math.round(llmScore)}, Semantic: ${Math.round(semanticScore)})`);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
      
      // Resume listening on error
      if (wasListening) {
        setTimeout(() => startListening(), 500);
      }
    }
  };

  const startAnalyticsTracking = () => {
    // Simulate real-time analytics updates
    analyticsIntervalRef.current = setInterval(() => {
      // Randomly update metrics for demo
      setConfidence((prev) => Math.max(60, Math.min(95, prev + (Math.random() - 0.5) * 10)));
      setVoiceClarity((prev) => Math.max(70, Math.min(98, prev + (Math.random() - 0.5) * 8)));
      
      // Randomly change eye contact
      const eyeOptions: Array<'GOOD' | 'AVERAGE' | 'POOR'> = ['GOOD', 'GOOD', 'AVERAGE', 'GOOD'];
      setEyeContact(eyeOptions[Math.floor(Math.random() * eyeOptions.length)]);

      // Save analytics to backend periodically
      saveAnalytics();
    }, 3000);
  };

  const saveAnalytics = async () => {
    if (!interviewId) return;
    try {
      await interviewApi.v3.saveFacialAnalytics({
        interviewId: parseInt(interviewId),
        confidenceScore: confidence,
        eyeContact,
        emotion,
        posture,
        voiceClarity,
      });
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatHistory((prev) => [...prev, { role: 'user', message: userMessage }]);
    setChatMessage('');
    
    try {
      // Call ML service to get AI response - CHAT MODE
      const response = await mlServiceApi.coachInterviewAnswer({
        user_query: userMessage,  // User's chat question
        question: questionDisplay.question,  // Current interview question
        answer: transcript || '',  // User's answer so far (if any)
        job_role: interview?.role || 'Software Engineer',
        resume_skills: [],
        topic: questionDisplay.topic,
        persona_mode: interview?.persona || 'FRIENDLY_HR',
      });
      
      // Extract reply from response
      const aiResponse = response.data.reply || response.data.message || 'I understand your question. Let me help you with that...';
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', message: aiResponse },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', message: 'I understand your question. Let me help you with that...' },
      ]);
    }
  };

  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview?')) {
      stopCamera();
      stopListening();
      if (analyticsIntervalRef.current) clearInterval(analyticsIntervalRef.current);
      router.push(`/interview/report/${interviewId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400 text-lg font-semibold mb-2">Initializing interview environment...</p>
          <p className="text-slate-500 dark:text-gray-500 text-sm">Loading questions and preparing AI interviewer</p>
        </div>
      </div>
    );
  }

  // Show tips modal before interview starts
  if (showTips && tipsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617]">
        <PreInterviewTips
          tips={tipsData.tips}
          welcomeMessage={tipsData.welcomeMessage}
          onComplete={handleTipsComplete}
          onSkip={handleSkipTips}
        />
      </div>
    );
  }

  // Get current question from interview session
  const currentQuestion = interview?.questions?.[currentQuestionIndex] || {
    question: 'Loading question...',
    topic: 'General',
    difficulty: 'MEDIUM',
  };

  const questionDisplay = {
    question: currentQuestion.question,
    topic: currentQuestion.topic,
    difficulty: currentQuestion.difficulty,
    questionNumber: currentQuestionIndex + 1,
    totalQuestions: interview?.questions?.length || 5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#38BDF8] rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4ADE80] rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-slate-900 dark:text-white font-semibold">LIVE INTERVIEW</span>
              </div>
              <div className="text-gray-400 text-sm">
                Question {questionDisplay.questionNumber} of {questionDisplay.totalQuestions}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-2 rounded-lg transition-all ${
                  cameraEnabled ? 'bg-[#38BDF8] text-white' : 'bg-white/10 text-gray-400'
                }`}
              >
                {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className={`p-2 rounded-lg transition-all ${
                  micEnabled ? 'bg-[#38BDF8] text-white' : 'bg-white/10 text-gray-400'
                }`}
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setSpeakerEnabled(!speakerEnabled)}
                className={`p-2 rounded-lg transition-all ${
                  speakerEnabled ? 'bg-[#38BDF8] text-white' : 'bg-white/10 text-gray-400'
                }`}
              >
                {speakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={handleEndInterview}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-all"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - New Layout */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          {/* Left: User Video Feed with Overlaid Analytics */}
          <div className="space-y-3 flex flex-col h-full overflow-y-auto">
            {/* Camera Feed with Overlaid Analytics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative bg-black rounded-2xl overflow-hidden border-4 flex-shrink-0 ${
                eyeContact === 'GOOD'
                  ? 'border-green-500'
                  : eyeContact === 'AVERAGE'
                  ? 'border-yellow-500'
                  : 'border-red-500'
              }`}
              style={{ height: '420px' }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <VideoOff className="w-20 h-20 text-gray-600" />
                </div>
              )}
              
              {/* Recording Indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-slate-900 dark:text-white text-sm font-semibold">REC</span>
              </div>

              {/* Overlaid Analytics - Top Left Corner */}
              <div className="absolute top-3 left-3 grid grid-cols-2 gap-2">
                {/* Confidence */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/70 backdrop-blur-md rounded-lg border border-white/20 p-2 min-w-[100px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-xs">Confidence</span>
                    <TrendingUp className="w-3 h-3 text-[#4ADE80]" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(confidence)}%</div>
                </motion.div>

                {/* Eye Contact */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-black/70 backdrop-blur-md rounded-lg border border-white/20 p-2 min-w-[100px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-xs">Eye Contact</span>
                    <Eye className="w-3 h-3 text-[#38BDF8]" />
                  </div>
                  <div className={`text-lg font-bold ${
                    eyeContact === 'GOOD' ? 'text-green-400' : eyeContact === 'AVERAGE' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {eyeContact}
                  </div>
                </motion.div>

                {/* Voice Clarity */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/70 backdrop-blur-md rounded-lg border border-white/20 p-2 min-w-[100px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-xs">Voice Clarity</span>
                    <Volume2 className="w-3 h-3 text-[#F59E0B]" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(voiceClarity)}%</div>
                </motion.div>

                {/* Emotion */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/70 backdrop-blur-md rounded-lg border border-white/20 p-2 min-w-[100px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-xs">Emotion</span>
                    <Smile className="w-3 h-3 text-[#EC4899]" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{emotion}</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Live Transcript Below Camera */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#38BDF8]" />
                  Live Transcript
                </h3>
                {isListening && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Listening...
                  </div>
                )}
              </div>
              <div className="bg-black/30 rounded-lg p-3 flex-1 overflow-y-auto">
                <p className="text-slate-900 dark:text-white text-sm leading-relaxed">
                  {transcript}
                  <span className="text-gray-400 italic">{interimTranscript}</span>
                  {!transcript && !interimTranscript && (
                    <span className="text-gray-500">Start speaking to see your answer here...</span>
                  )}
                </p>
              </div>
              {transcript && (
                <button
                  onClick={finalizeAnswer}
                  className="mt-3 w-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-slate-900 dark:text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Submit Answer
                </button>
              )}
            </motion.div>
          </div>

          {/* Right: AI Interviewer Section */}
          <div className="space-y-3 overflow-y-auto h-full">
            {/* AI Avatar - Compact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-[#38BDF8]/20 to-[#0EA5E9]/20 backdrop-blur-xl rounded-2xl border border-[#38BDF8]/30 p-6 flex flex-col items-center justify-center flex-shrink-0"
              style={{ height: '280px' }}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center shadow-2xl"
                >
                  <Brain className="w-16 h-16 text-slate-900 dark:text-white" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-[#38BDF8]/50"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-[#38BDF8]/30"
                ></motion.div>
              </div>
              <p className="text-slate-900 dark:text-white text-lg font-semibold mt-4">AI Interviewer</p>
              <p className="text-gray-400 text-sm">Listening & Analyzing...</p>
            </motion.div>

            {/* Question Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-slate-900 dark:text-white text-sm font-semibold">
                    Question {questionDisplay.questionNumber}/{questionDisplay.totalQuestions}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-[#38BDF8]/20 text-[#38BDF8] rounded-full">
                    {questionDisplay.topic}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full">
                    {questionDisplay.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-slate-900 dark:text-white text-sm leading-relaxed">{questionDisplay.question}</p>
            </motion.div>

            {/* AI Feedback */}
            <AnimatePresence>
              {transcript.length > 50 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 flex-shrink-0"
                >
                  <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-[#4ADE80]" />
                    Live AI Feedback
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-300">Good explanation of REST principles</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-300">Missing GraphQL advantages discussion</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-300">Tip: Use STAR framework for structure</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Chat Assistant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden flex-shrink-0"
            >
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-slate-900 dark:text-white text-sm font-semibold">AI Chat Assistant</span>
                </div>
                <motion.div
                  animate={{ rotate: chatOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className="w-4 h-4 text-gray-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {chatOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-3 space-y-2 max-h-[150px] overflow-y-auto">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                              msg.role === 'user'
                                ? 'bg-[#38BDF8] text-white'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-white/10 flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Ask a question..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#38BDF8]"
                      />
                      <button
                        onClick={handleSendChat}
                        className="p-2 bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-lg transition-all"
                      >
                        <Send className="w-3 h-3 text-slate-900 dark:text-white" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#000814] dark:via-[#01030F] dark:to-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading interview...</p>
        </div>
      </div>
    }>
      <LiveInterviewContent />
    </Suspense>
  );
}

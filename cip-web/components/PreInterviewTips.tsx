'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, CheckCircle, Sparkles, Lightbulb } from 'lucide-react';

interface InterviewTip {
  order: number;
  icon: string;
  title: string;
  description: string;
  voiceText: string;
}

interface PreInterviewTipsProps {
  tips: InterviewTip[];
  welcomeMessage: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function PreInterviewTips({ tips, welcomeMessage, onComplete, onSkip }: PreInterviewTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(-1); // -1 = welcome message
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSkipped, setIsSkipped] = useState(false); // Track if user skipped
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasStartedRef = useRef(false); // Prevent multiple starts

  useEffect(() => {
    // Auto-start with welcome message only once
    if (!hasStartedRef.current && !isSkipped) {
      hasStartedRef.current = true;

      const timer = setTimeout(() => {
        if (voiceEnabled && 'speechSynthesis' in window) {
          speakText(welcomeMessage);
        } else {
          // If voice not supported, just advance after delay
          advanceToNextTip();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        // Cleanup: stop all audio when component unmounts
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const speakText = (text: string) => {
    if (isSkipped) {
      return;
    }

    if (!voiceEnabled || !('speechSynthesis' in window)) {
      setTimeout(() => {
        advanceToNextTip();
      }, 2000);
      return;
    }

    // Cancel any ongoing speech first
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      
      // Wait a bit for cancellation to complete
      setTimeout(() => {
        startSpeaking(text);
      }, 100);
    } else {
      startSpeaking(text);
    }
  };

  const startSpeaking = (text: string) => {
    if (isSkipped) {
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
      // Advance after speech ends (unless skipped)
      if (!isSkipped) {
        advanceToNextTip();
      }
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPlaying(false);
      // Advance on error (unless skipped)
      if (!isSkipped) {
        advanceToNextTip();
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const advanceToNextTip = () => {
    if (isSkipped) {
      return;
    }

    // Calculate next index
    const nextIndex = currentTipIndex + 1;

    if (nextIndex >= tips.length) {
      // All instructions completed - start interview
      setTimeout(() => {
        onComplete();
      }, 1000);
      return;
    }
    
    // Move to next instruction
    setTimeout(() => {
      setCurrentTipIndex(nextIndex);
      
      // Speak the next instruction after state updates
      setTimeout(() => {
        if (voiceEnabled && 'speechSynthesis' in window && !isSkipped) {
          speakText(tips[nextIndex].voiceText);
        } else if (!voiceEnabled && !isSkipped) {
          // If voice disabled but not skipped, continue auto-advancing
          advanceToNextTip();
        }
      }, 200);
    }, 1500); // 1.5 second pause between instructions
  };

  const handleSkip = () => {
    // Set skipped flag to stop all operations
    setIsSkipped(true);
    
    // Stop all speech synthesis immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear the utterance reference
    if (utteranceRef.current) {
      utteranceRef.current = null;
    }
    
    // Stop speaking state
    setIsSpeaking(false);
    setIsPlaying(false);
    
    // Call onSkip to start interview immediately
    onSkip();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      // Disable voice
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setVoiceEnabled(false);
      setIsSpeaking(false);
      setIsPlaying(false);
    } else {
      // Enable voice
      setVoiceEnabled(true);
      // Speak current tip
      if (currentTipIndex === -1) {
        speakText(welcomeMessage);
      } else if (currentTipIndex >= 0 && currentTipIndex < tips.length) {
        speakText(tips[currentTipIndex].voiceText);
      }
    }
  };

  const currentTip = currentTipIndex >= 0 ? tips[currentTipIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] rounded-3xl border-2 border-[#38BDF8]/30 shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#38BDF8] rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#4ADE80] rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-[#38BDF8]/20 to-[#0EA5E9]/20 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pre-Interview Instructions</h2>
                <p className="text-sm text-gray-400">Essential guidance for your success</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-all ${
                  voiceEnabled ? 'bg-[#38BDF8] text-white' : 'bg-white/10 text-gray-400'
                }`}
                title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSkip}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
                title="Skip tips"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8">
          <AnimatePresence mode="wait">
            {currentTipIndex === -1 ? (
              // Welcome Message
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">Welcome!</h3>
                <p className="text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
                  {welcomeMessage}
                </p>
                {isSpeaking && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-[#38BDF8]">
                    <div className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">AI is speaking...</span>
                  </div>
                )}
                {/* Manual Next Button */}
                <button
                  onClick={() => {
                    if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                    setIsSpeaking(false);
                    advanceToNextTip();
                  }}
                  className="mt-6 px-6 py-2 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white rounded-lg font-semibold transition-all"
                >
                  Next →
                </button>
              </motion.div>
            ) : currentTip ? (
              // Individual Tip
              <motion.div
                key={`tip-${currentTip.order}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="py-6"
              >
                <div className="flex items-start gap-6">
                  {/* Tip Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#38BDF8]/20 to-[#0EA5E9]/20 border-2 border-[#38BDF8]/30 flex items-center justify-center">
                      <span className="text-4xl">{currentTip.icon}</span>
                    </div>
                  </div>

                  {/* Tip Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full">
                        Instruction {currentTip.order} of {tips.length}
                      </span>
                      {isSpeaking && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Speaking...</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{currentTip.title}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">{currentTip.description}</p>
                    
                    {/* Manual Next Button */}
                    <button
                      onClick={() => {
                        if (window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                        }
                        setIsSpeaking(false);
                        advanceToNextTip();
                      }}
                      className="mt-4 px-6 py-2 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white rounded-lg font-semibold transition-all"
                    >
                      {currentTipIndex < tips.length - 1 ? 'Next Instruction →' : 'Start Interview →'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              {tips.map((tip, index) => (
                <div
                  key={tip.order}
                  className={`transition-all ${
                    index < currentTipIndex
                      ? 'w-8 h-2 bg-green-500 rounded-full'
                      : index === currentTipIndex
                      ? 'w-12 h-2 bg-[#38BDF8] rounded-full'
                      : 'w-8 h-2 bg-white/20 rounded-full'
                  }`}
                ></div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400">
              {currentTipIndex === -1
                ? 'Preparing instructions...'
                : currentTipIndex < tips.length
                ? `Instruction ${currentTipIndex + 1} of ${tips.length}`
                : 'All instructions completed!'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 bg-white/5 border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Instructions will help you perform better</span>
            </div>
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              Skip All Instructions
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

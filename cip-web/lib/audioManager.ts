/**
 * Audio Manager for Interview System
 * Prevents audio repetition and manages TTS playback
 */

export class InterviewAudioManager {
  private currentAudio: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private hasPlayedQuestion: boolean = false;
  private hasPlayedFeedback: boolean = false;

  constructor() {
    // Stop any existing speech when page loads
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Play question text once
   */
  async playQuestion(questionText: string): Promise<void> {
    // Prevent multiple plays of same question
    if (this.hasPlayedQuestion) {
      return;
    }

    // Check if speech synthesis is available
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech synthesis not available");
      return;
    }

    // Stop any existing audio
    this.stopAudio();

    try {
      const utterance = new SpeechSynthesisUtterance(questionText);
      
      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Set voice (prefer female voice if available)
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Set up event handlers
      utterance.onstart = () => {
        this.isPlaying = true;
        this.hasPlayedQuestion = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        this.isPlaying = false;
      };

      this.currentAudio = utterance;
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error("Failed to play question audio:", error);
    }
  }

  /**
   * Play feedback text once
   */
  async playFeedback(feedbackText: string): Promise<void> {
    // Prevent multiple plays of same feedback
    if (this.hasPlayedFeedback) {
      return;
    }

    // Check if speech synthesis is available
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech synthesis not available");
      return;
    }

    // Don't play if question is still playing
    if (this.isPlaying) {
      setTimeout(() => this.playFeedback(feedbackText), 1000);
      return;
    }

    try {
      // Clean feedback text for better TTS
      const cleanFeedback = this.cleanTextForTTS(feedbackText);
      
      const utterance = new SpeechSynthesisUtterance(cleanFeedback);
      
      // Configure voice settings for feedback
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Set voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        this.hasPlayedFeedback = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
      };

      utterance.onerror = (event) => {
        console.error("Feedback speech synthesis error:", event.error);
        this.isPlaying = false;
      };

      this.currentAudio = utterance;
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error("Failed to play feedback audio:", error);
    }
  }

  /**
   * Stop all audio playback
   */
  stopAudio(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.currentAudio = null;
  }

  /**
   * Reset audio state for next question
   */
  resetForNextQuestion(): void {
    this.hasPlayedQuestion = false;
    this.hasPlayedFeedback = false;
    this.stopAudio();
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Check if question has been played
   */
  getHasPlayedQuestion(): boolean {
    return this.hasPlayedQuestion;
  }

  /**
   * Check if feedback has been played
   */
  getHasPlayedFeedback(): boolean {
    return this.hasPlayedFeedback;
  }

  /**
   * Clean text for better TTS pronunciation
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remove emojis and special characters
      .replace(/[✅💡📝🎯❌⚠️]/g, '')
      // Replace newlines with pauses
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, '. ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Remove markdown-style formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Clean up punctuation
      .replace(/\.\s*\./g, '.')
      .trim();
  }

  /**
   * Initialize voices (call this on component mount)
   */
  initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve();
        } else {
          // Voices not loaded yet, wait a bit
          setTimeout(loadVoices, 100);
        }
      };

      // Some browsers load voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    });
  }

  /**
   * Cleanup when component unmounts
   */
  cleanup(): void {
    this.stopAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = null;
    }
  }
}

// Singleton instance for global use
let audioManagerInstance: InterviewAudioManager | null = null;

export const getAudioManager = (): InterviewAudioManager => {
  if (!audioManagerInstance) {
    audioManagerInstance = new InterviewAudioManager();
  }
  return audioManagerInstance;
};

export const resetAudioManager = (): void => {
  if (audioManagerInstance) {
    audioManagerInstance.cleanup();
  }
  audioManagerInstance = null;
};
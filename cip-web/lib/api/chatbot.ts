// Chatbot API Service
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ChatMessage {
  id?: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  messageType?: 'TEXT' | 'SUGGESTION' | 'ACTION' | 'ERROR';
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  sessionId: number;
  sessionType: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
  startedAt: string;
  isActive: boolean;
  context?: Record<string, any>;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  sessionId: number;
  messageId: number;
  suggestions?: string[];
  metadata?: Record<string, any>;
  tokensUsed?: number;
  responseTimeMs?: number;
  timestamp: string;
}

export interface StartSessionRequest {
  sessionType: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
  context?: Record<string, any>;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: number;
  sessionType?: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
  context?: Record<string, any>;
}

export interface MessageHistoryResponse {
  sessionId: number;
  messages: ChatMessage[];
  totalMessages: number;
  sessionType: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
}

export interface SuggestionsResponse {
  sessionType: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
  suggestions: string[];
  context?: Record<string, any>;
}

export interface RateLimitInfo {
  remainingPerMinute: number;
  remainingPerHour: number;
  remainingPerDay: number;
  limitPerMinute: number;
  limitPerHour: number;
  limitPerDay: number;
}

class ChatBotAPI {
  private getHeaders() {
    const userId = localStorage.getItem('userId') || '1';
    const token = Cookies.get('cip_token');
    return {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Start a new chat session
   */
  async startSession(request: StartSessionRequest): Promise<ChatSession> {
    const response = await axios.post(
      `${API_BASE_URL}/chatbot/session/start`,
      request,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Send a message to global chatbot
   */
  async sendGlobalMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/chatbot/global/message`,
      request,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Send a message to interview chatbot
   */
  async sendInterviewMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/chatbot/interview/message`,
      request,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Send a message to job chatbot
   */
  async sendJobMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/chatbot/job/message`,
      request,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Send a message to certificate chatbot
   */
  async sendCertificateMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/chatbot/certificate/message`,
      request,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Send a message to analytics chatbot
   */
  async sendAnalyticsMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/chatbot/analytics/message`,
      request,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Send a message based on session type
   */
  async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const sessionType = request.sessionType || 'GLOBAL';
    
    switch (sessionType) {
      case 'INTERVIEW':
        return this.sendInterviewMessage(request);
      case 'JOB':
        return this.sendJobMessage(request);
      case 'CERTIFICATE':
        return this.sendCertificateMessage(request);
      case 'ANALYTICS':
        return this.sendAnalyticsMessage(request);
      default:
        return this.sendGlobalMessage(request);
    }
  }

  /**
   * Get chat history for a session
   */
  async getHistory(sessionId: number): Promise<MessageHistoryResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/chatbot/session/${sessionId}/history`,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * End a chat session
   */
  async endSession(sessionId: number): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/chatbot/session/${sessionId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get suggestions for quick actions
   */
  async getSuggestions(
    type: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS' = 'GLOBAL'
  ): Promise<SuggestionsResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/chatbot/suggestions?type=${type}`,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Submit feedback for a message
   */
  async submitFeedback(
    messageId: number,
    rating: number,
    feedbackType?: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT' | 'INAPPROPRIATE',
    comment?: string
  ): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/chatbot/feedback`,
      { messageId, rating, feedbackType, comment },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get rate limit info
   */
  async getRateLimitInfo(): Promise<RateLimitInfo> {
    const response = await axios.get(
      `${API_BASE_URL}/chatbot/rate-limit`,
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/chatbot/health`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
}

export const chatBotAPI = new ChatBotAPI();

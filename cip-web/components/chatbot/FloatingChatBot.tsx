'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { chatBotAPI, ChatMessage, ChatResponse } from '@/lib/api/chatbot';
import toast from 'react-hot-toast';

interface FloatingChatBotProps {
  sessionType?: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
  context?: Record<string, any>;
}

export default function FloatingChatBot({ 
  sessionType = 'GLOBAL',
  context 
}: FloatingChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load suggestions when chat opens
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  // Initialize session when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession();
    }
  }, [isOpen]);

  const initializeSession = async () => {
    try {
      const session = await chatBotAPI.startSession({
        sessionType,
        context,
      });
      setSessionId(session.sessionId);
      
      // Load history if session exists
      if (session.sessionId) {
        const history = await chatBotAPI.getHistory(session.sessionId);
        setMessages(history.messages);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to start chat session');
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatBotAPI.getSuggestions(sessionType);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await chatBotAPI.sendMessage({
        message: text,
        sessionId: sessionId || undefined,
        sessionType,
        context,
      });

      // Update session ID if it's a new session
      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: response.messageId,
        role: 'ASSISTANT',
        content: response.message,
        createdAt: response.timestamp,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Show error message in chat
      const errorMessage: ChatMessage = {
        role: 'ASSISTANT',
        content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        messageType: 'ERROR',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleFeedback = async (messageId: number, isPositive: boolean) => {
    try {
      await chatBotAPI.submitFeedback(
        messageId,
        isPositive ? 5 : 1,
        isPositive ? 'HELPFUL' : 'NOT_HELPFUL'
      );
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getChatTitle = () => {
    switch (sessionType) {
      case 'INTERVIEW':
        return 'Interview Coach';
      case 'JOB':
        return 'Career Advisor';
      case 'CERTIFICATE':
        return 'Certificate Assistant';
      case 'ANALYTICS':
        return 'Analytics Expert';
      default:
        return 'CIP AI Assistant';
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          aria-label="Open AI assistant chat"
        >
          <span className="relative flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
            <Sparkles className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600"></span>
          </span>
          <span className="font-bold text-sm whitespace-nowrap">Ask AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          } flex flex-col border border-gray-200 dark:border-gray-700`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-7 h-7 bg-white/20 rounded-full">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-semibold">{getChatTitle()}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start a conversation!</p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'USER'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : message.messageType === 'ERROR'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Feedback buttons for assistant messages */}
                      {message.role === 'ASSISTANT' && message.id && message.messageType !== 'ERROR' && (
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleFeedback(message.id!, true)}
                            className="text-xs hover:text-green-600 transition-colors"
                            aria-label="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id!, false)}
                            className="text-xs hover:text-red-600 transition-colors"
                            aria-label="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && messages.length === 0 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

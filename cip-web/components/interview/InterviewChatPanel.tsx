"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface InterviewChatPanelProps {
  question: string;
  lastUserAnswer: string;
}

export default function InterviewChatPanel({ question, lastUserAnswer }: InterviewChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "I'm your AI Follow-up Coach. Have any questions about your feedback or the topic?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userQuery }]);
    setIsLoading(true);

    try {
      const mlUrl = process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000";
      const response = await fetch(`${mlUrl}/ml/interview/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question,
          answer: lastUserAnswer,
          user_query: userQuery
        })
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden mt-6 shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900 text-sm">Interactive AI Interview Mentor</h3>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[250px] min-h-[150px] custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm font-medium ${
              msg.role === "user" 
                ? "bg-blue-600 text-white rounded-br-sm shadow-sm" 
                : "bg-slate-50 text-slate-700 rounded-bl-sm border border-slate-200 shadow-sm"
            }`}>
              {msg.text}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-50 rounded-bl-sm border border-slate-200 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask why your answer was wrong, or for a better explanation..."
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-all shadow-sm flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

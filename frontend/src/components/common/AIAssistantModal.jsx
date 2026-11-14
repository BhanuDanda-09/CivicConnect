// ==============================================================================
// AI Civic Assistant Modal (AIAssistantModal.jsx)
// Interactive citizen companion for guidance, categorization, SLAs, and emergency routing
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertTriangle, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function AIAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am your CivicConnect AI Assistant. How can I help you today? You can describe a municipal issue, check resolution stages, or ask about public services across India.',
      quickLinks: [
        { label: 'Report Grievance', url: '/citizen/submit-complaint' },
        { label: 'Track Existing Grievance', url: '/track' },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentLang, t } = useLanguage();

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText = null) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isTyping) return;

    // Append citizen message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await aiAPI.assistant({
        query: textToSend,
        language: currentLang,
      });

      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        const aiMsg = {
          sender: 'ai',
          title: d.title,
          text: d.answer,
          quickLinks: d.quickLinks || [],
          isEmergency: d.topic === 'emergency',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('No answer received');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'CivicConnect manages civic infrastructure issues. For life-threatening emergencies, please call 112 immediately. For municipal complaints, you can file a report through our citizen portal.',
          quickLinks: [
            { label: 'Submit Grievance', url: '/citizen/submit-complaint' },
            { label: 'Track Grievance', url: '/track' },
          ],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_PROMPTS = [
    'How do I report a pothole?',
    'What does UNDER_VERIFICATION mean?',
    'What is the SLA timeline?',
    'How to track my complaint?',
    'Emergency helpline 112',
  ];

  return (
    <>
      {/* 1. Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white font-bold text-xs ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        aria-label="Open Civic AI Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
        </div>
        <span className="tracking-wide">AI Civic Assistant</span>
      </button>

      {/* 2. Chatbot Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[600px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  CivicConnect AI Assistant
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-mono">BETA</span>
                </h3>
                <p className="text-[11px] text-sky-100">National Civic Advisory & Guidance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Emergency Safety Banner */}
          <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200/60 dark:border-amber-900/60 flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-200 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="leading-tight">
              Life-safety emergency? Dial <strong>112</strong> immediately.
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : m.isEmergency
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-bl-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {m.title && <p className="font-bold text-[11px] uppercase tracking-wider">{m.title}</p>}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Quick Link Pills */}
                {m.quickLinks && m.quickLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {m.quickLinks.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        to={link.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span>Civic Assistant is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question or describe an issue..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

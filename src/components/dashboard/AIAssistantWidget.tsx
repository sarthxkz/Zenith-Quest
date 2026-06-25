'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Greetings, Explorer. I am Zenith, your orbital assistant. Need recommendations for stargazing teammates, cosmic project ideas, or ISS tracking times?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.response || 'I encountered a telemetry drift. Could you retry?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to establish a secure link. Please check your uplink connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    { label: 'Recommend Teammates 🧑‍🚀', query: 'Recommend collaborators for my project' },
    { label: 'Suggest Project Ideas 🌌', query: 'Suggest project ideas for space guide' },
    { label: 'Track ISS Orbit satellites 🛰️', query: 'When is the next ISS pass?' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 sm:w-96 h-[480px] rounded-2xl glass border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-4 select-text"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#050816]/80 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm shadow shadow-purple-500/25">
                  🧠
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Zenith AI Link</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-semibold">COSMIC TELEMETRY ONLINE</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 hover:border-purple-500/20 hover:bg-white/5 text-slate-400 hover:text-white transition cursor-none"
              >
                ✕
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#030014]/40 scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-purple-600/90 text-white rounded-tr-none border border-purple-500/30'
                        : 'bg-slate-900/95 border border-white/5 text-slate-200 rounded-tl-none font-light'
                    }`}
                  >
                    {/* Render simple markdown lists nicely */}
                    {m.content.split('\n').map((line, lIdx) => {
                      if (line.startsWith('* ') || line.startsWith('- ')) {
                        return <li key={lIdx} className="ml-3 list-disc mt-0.5">{line.substring(2)}</li>;
                      }
                      if (line.startsWith('### ')) {
                        return <h5 key={lIdx} className="font-semibold text-slate-100 mt-2 mb-1">{line.substring(4)}</h5>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={lIdx} className="ml-3 list-decimal mt-0.5">{line.replace(/^\d+\.\s*/, '')}</li>;
                      }
                      return <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>{line}</p>;
                    })}
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 mt-1 px-1">{m.time}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/50 border border-white/5 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-white/5 bg-[#050816]/70 flex flex-col gap-1.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Suggested Queries</span>
                <div className="flex flex-wrap gap-1">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.query)}
                      className="text-[10px] text-slate-300 hover:text-purple-300 bg-white/5 border border-white/5 hover:border-purple-500/20 px-2.5 py-1 rounded-lg transition-all cursor-none"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-white/10 bg-[#050816]/90 flex items-center gap-2 relative z-10"
            >
              <input
                type="text"
                placeholder="Ask Zenith about orbit telemetry..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/5 hover:border-white/10 focus:border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder-slate-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 text-white flex items-center justify-center transition-colors cursor-none flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Capsule trigger button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center cursor-none relative border border-white/10 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl group-hover:rotate-12 transition-transform duration-300">🧠</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
      </motion.button>
    </div>
  );
}

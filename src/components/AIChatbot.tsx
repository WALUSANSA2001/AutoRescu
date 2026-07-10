import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    { role: 'model', content: "Hello! I am AutoRescue AI, your intelligent emergency dispatch assistant. If you are stranded or experiencing a vehicle breakdown in Uganda, type your situation or choose a shortcut below. Please remember to stay safe and stand clear of passing traffic!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInput('');

    const updatedMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/autorescue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', content: data.text }]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (e) {
      console.error(e);
      // Fallback response
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "I am having minor communication issues, but my global dispatchers have logged your position. If this is a life-threatening crisis, please dial 999 immediately. Otherwise, keep your hazard warning lights active." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 md:w-96 h-[480px] bg-[#0C0E12]/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Luxury bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400" />
            
            {/* Chatbot Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" /> AutoRescue AI
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold">24/7 Smart Emergency Dispatcher</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Message Box */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role !== 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.role === 'user' 
                      ? "bg-orange-600 text-white rounded-tr-none font-medium" 
                      : "bg-white/5 text-slate-200 rounded-tl-none border border-white/5"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-0.5 animate-pulse">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested quick inputs */}
            {messages.length === 1 && (
              <div className="p-3 bg-black/40 border-t border-white/5 space-y-1.5 text-xs">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Quick Diagnostics:</span>
                {[
                  "My radiator is leaking white smoke",
                  "How to lay hazards on Entebbe road?",
                  "I locked my car keys inside"
                ].map((txt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(txt)}
                    className="w-full text-left p-2 bg-white/5 rounded-xl border border-white/5 hover:border-orange-500/30 hover:bg-white/10 text-slate-300 font-bold text-[10px] transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    {txt}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 bg-[#090B0E] border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Describe your breakdown situation..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white transition-all shadow-md shadow-orange-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-4 rounded-full shadow-lg shadow-orange-600/30 hover:shadow-orange-500/40 transition-all flex items-center gap-2 border border-orange-400/20"
          >
            <Bot className="w-5 h-5 text-white" />
            <span className="text-xs font-black uppercase tracking-wider hidden md:inline">AutoRescue AI</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

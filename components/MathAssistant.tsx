
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getMathExplanation } from '../services/geminiService';
import { ChatMessage } from '../types';

const MathAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis ton tuteur de maths IA. En quoi puis-je t\'aider aujourd\'hui ?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = useCallback((state: boolean) => {
    setIsOpen(state);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleToggle(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleToggle]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const explanation = await getMathExplanation('Programme de 4ième', input);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: explanation || "Oups, je n'ai pas pu répondre. Réessaie !", 
      timestamp: new Date() 
    }]);
  }, [input, isTyping]);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {isOpen ? (
        <div 
          className="bg-white w-80 sm:w-96 h-[550px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-black/5"
          role="dialog"
          aria-labelledby="assistant-header"
        >
          <div className="bg-blue-700 p-5 text-white flex justify-between items-center shadow-lg shrink-0 relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-xl shadow-inner" aria-hidden="true">π</div>
              <div>
                <h4 id="assistant-header" className="font-black text-sm tracking-tight leading-none mb-1">MathÉlite IA</h4>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
                  <p className="text-[9px] text-blue-50 font-black uppercase tracking-widest">En ligne</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleToggle(false)}
              type="button"
              className="text-white hover:bg-white/20 w-11 h-11 rounded-full transition-all active:scale-90 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white bg-blue-600/50"
              aria-label="Fermer l'assistant"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
            role="log"
            aria-live="polite"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-700 text-white rounded-tr-none font-medium' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm space-x-1.5 flex items-center" aria-label="L'assistant réfléchit">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all">
              <label htmlFor="chat-input" className="sr-only">Ta question</label>
              <input 
                ref={inputRef}
                id="chat-input"
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pose ta question..."
                className="flex-1 text-sm bg-transparent border-none px-4 py-3 focus:ring-0 outline-none font-medium placeholder:text-slate-500 text-slate-800"
              />
              <button 
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                aria-label="Envoyer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          onClick={() => handleToggle(true)}
          className="bg-blue-600 text-white w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 group relative"
          aria-label="Ouvrir l'assistant"
          aria-expanded="false"
        >
          <span className="text-3xl" aria-hidden="true">🤖</span>
          <span className="absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full border-4 border-white animate-pulse" aria-hidden="true"></span>
        </button>
      )}
    </div>
  );
};

export default MathAssistant;

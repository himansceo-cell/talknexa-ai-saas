import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Mic, Volume2, Loader2, Activity, BrainCircuit } from 'lucide-react';
import { auth } from '../firebase';
import axios from 'axios';

import { useUI } from '../context/UIContext';

const Assistant = () => {
  const { assistantOpen: isOpen, toggleAssistant, closeAssistant } = useUI();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState([
    { 
      role: 'assistant', 
      text: "Greetings. I am the TalkNexa Intelligence. Your concierge operations are currently running at peak efficiency. How can I assist you today?" 
    }
  ]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setIsTyping(true);
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/assistant/chat`, 
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { text } = response.data;
      setChat(prev => [...prev, { role: 'assistant', text: text }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'assistant', text: "I apologize, but my neural bridge is experiencing temporary interference. Please check your network connectivity." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 40, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="mb-8 w-[450px] glass-effect-heavy shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] border border-white/10"
          >
            {/* Header */}
            <div className="px-8 py-8 flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 text-on-primary relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <BrainCircuit size={24} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-manrope font-black text-lg tracking-tight leading-none mb-1">The Soul.</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                    <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] opacity-70">Neural Link Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={closeAssistant} 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scrollbar-hide scroll-smooth"
            >
              {chat.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-6 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-surface-container-low/50 text-on-surface border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-low/50 p-6 rounded-[1.5rem] rounded-tl-none border border-white/5 flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary/60">Processing Logic</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-surface-container-lowest/50 border-t border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-2 pl-6 rounded-3xl focus-within:border-primary/30 focus-within:bg-white/[0.05] transition-all group">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire with the concierge..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-on-surface-variant/30"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!message.trim() || isTyping}
                  className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <Send size={20} strokeWidth={2.5} />
                </motion.button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 opacity-20 group-focus-within:opacity-40 transition-opacity">
                <Activity size={10} />
                <span className="text-[0.5rem] font-black uppercase tracking-[0.3em]">Quantum Encrypted Tunnel</span>
                <Activity size={10} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        layoutId="assistant-toggle"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleAssistant}
        className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-500 relative group overflow-hidden ${
          isOpen ? 'bg-on-surface text-surface' : 'bg-primary text-on-primary'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <Sparkles size={28} className="animate-pulse" />}
        
        {/* Unread indicator or notification could go here */}
      </motion.button>
    </div>
  );
};

export default Assistant;


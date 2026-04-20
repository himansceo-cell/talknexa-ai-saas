import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Mic, Volume2 } from 'lucide-react';

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', text: 'Good evening. I am TalkNexa Intelligence. How may I assist with your concierge operations?' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChat([...chat, { role: 'user', text: message }]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        text: 'I am processing that. Currently, all systems are optimal and your WhatsApp uplink is stable.' 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-96 bg-surface-container-lowest border border-outline-variant shadow-2xl rounded-[0.5rem] overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-primary text-on-primary">
              <div className="flex items-center gap-3">
                <Sparkles size={20} />
                <span className="font-manrope font-bold tracking-tight">TalkNexa Intelligence</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-[0.25rem] text-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary/5 text-on-surface border border-primary/10' 
                    : 'bg-surface-container-low text-on-surface-variant'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <Mic size={20} strokeWidth={1.5} />
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask TalkNexa..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                />
                <button 
                  onClick={handleSend}
                  className="p-2 text-primary hover:opacity-70 transition-opacity"
                >
                  <Send size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          isOpen ? 'bg-on-surface text-surface' : 'bg-primary text-on-primary'
        }`}
      >
        {isOpen ? <Volume2 size={24} /> : <Sparkles size={24} />}
      </motion.button>
    </div>
  );
};

export default Assistant;

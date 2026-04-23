import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Sparkles } from 'lucide-react';
import Assistant from './Assistant';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex bg-surface min-h-screen text-on-surface">
      <Sidebar />
      
      <main className="flex-1 ml-80 relative">
        {/* Editorial Header */}
        <header className="px-12 py-10 flex justify-between items-center sticky top-0 z-[100] bg-surface/80 backdrop-blur-3xl border-b border-white/[0.03]">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.displayName || 'Biz'}&background=4f46e5&color=fff&bold=true&size=128`} 
                alt="Profile" 
                className="h-14 w-14 rounded-[1.25rem] object-cover ring-2 ring-primary/20 ring-offset-4 ring-offset-surface shadow-2xl shadow-primary/20"
              />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-surface shadow-lg" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-manrope font-extrabold tracking-tight">
                  {new Date().getHours() < 12 ? 'Good Morning,' : 'Good Afternoon,'} <span className="text-primary italic">{user?.displayName?.split(' ')[0] || 'Partner'}</span>
                </h1>
                <Sparkles className="text-primary/40 animate-pulse" size={20} />
              </div>
              <p className="text-on-surface-variant text-sm font-medium mt-1 opacity-70">
                Your AI concierge is currently <span className="text-green-400 font-bold">Optimizing</span> your schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] px-6 py-3 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all group">
              <Search size={18} className="text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Find a client..." 
                className="bg-transparent border-none outline-none text-sm placeholder:text-on-surface-variant/30 w-56 font-medium" 
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all"
            >
              <Bell size={22} strokeWidth={2} />
              <div className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-surface shadow-lg shadow-primary/20" />
            </motion.button>
          </div>
        </header>

        <div className="px-12 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <Assistant />
    </div>
  );
};

export default Layout;


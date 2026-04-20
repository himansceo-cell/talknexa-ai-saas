import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import Assistant from './Assistant';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-72">
        {/* Editorial Header */}
        <header className="px-12 py-8 flex justify-between items-start border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {new Date().getHours() < 12 ? 'Good Morning,' : 'Good Afternoon,'} <span className="text-primary italic font-manrope">{user?.displayName?.split(' ')[0] || 'Partner'}</span>
            </h1>
            <p className="text-on-surface-variant text-[0.875rem] mt-1 font-medium italic">
              Your concierge has processed <span className="text-primary font-bold">12 bookings</span> today.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-surface-container px-4 py-2 rounded-[0.25rem] text-on-surface-variant focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Search size={16} />
              <input type="text" placeholder="Search clients..." className="bg-transparent border-none outline-none text-sm placeholder:text-on-surface-variant/50 w-48" />
            </div>
            
            <button className="text-on-surface-variant hover:text-primary transition-colors relative">
              <Bell size={20} strokeWidth={1.5} />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full border-2 border-surface" />
            </button>

            <div className="h-10 w-10 rounded-full bg-surface-container border border-outline-variant overflow-hidden shadow-sm">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.displayName || 'Biz'}&background=2a14b4&color=fff&bold=true`} 
                  alt="Profile" 
                />
            </div>
          </div>
        </header>

        <div className="px-12 py-10">
          {children}
        </div>
      </main>
      <Assistant />
    </div>
  );
};

export default Layout;

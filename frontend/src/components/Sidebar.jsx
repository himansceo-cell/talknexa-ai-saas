import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare,
  Users,
  Activity,
  Zap,
  CreditCard
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

import logo from '../assets/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Concierge', icon: <LayoutDashboard size={20} strokeWidth={1.5} />, path: '/' },
    { name: 'AI Training', icon: <Zap size={20} strokeWidth={1.5} />, path: '/settings' },
    { name: 'Billing', icon: <CreditCard size={20} strokeWidth={1.5} />, path: '/billing' },
  ];

  return (
    <div className="h-screen w-72 bg-surface-container-low flex flex-col fixed left-0 top-0 border-r border-outline-variant/5">
      <div className="p-10">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src={logo} alt="TalkNexa Logo" className="w-12 h-12 rounded-2xl object-cover relative z-10 shadow-2xl shadow-primary/20" />
          </div>
          <div className="text-on-surface font-manrope font-extrabold text-2xl tracking-tighter leading-none">
            Talk<span className="text-primary">Nexa</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                isActive
                  ? 'bg-primary/5 text-primary shadow-sm shadow-primary/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.02]'
              }`
            }
          >
            <span className="relative z-10 transition-transform group-hover:scale-110 duration-500">
              {item.icon}
            </span>
            <span className="relative z-10 text-[0.9rem] font-bold tracking-tight">
              {item.name}
            </span>
            
            {/* Active Indicator Glow */}
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full transition-transform duration-500 origin-left ${
                  isActive ? 'scale-y-100' : 'scale-y-0'
                }`
              }
            />
          </NavLink>
        ))}
      </nav>

      <div className="p-8 space-y-6">
        <div className="p-6 bg-surface-container rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[0.6rem] font-black text-primary uppercase tracking-[0.2em] mb-3">Concierge Status</p>
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-40" />
            </div>
            <span className="text-[0.85rem] font-bold text-on-surface leading-none">Active & Ready</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-8 py-4 text-on-surface-variant hover:text-red-500 transition-all group bg-transparent hover:bg-red-500/5 rounded-2xl font-bold text-sm"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Safe Exit</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


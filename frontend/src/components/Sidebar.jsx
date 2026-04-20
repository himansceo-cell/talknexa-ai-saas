import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare,
  Users
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
    { name: 'Concierge', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, path: '/' },
    { name: 'Appointments', icon: <Calendar size={18} strokeWidth={1.5} />, path: '/appointments' },
    { name: 'Client List', icon: <Users size={18} strokeWidth={1.5} />, path: '/customers' },
    { name: 'Queue', icon: <Calendar size={18} strokeWidth={1.5} />, path: '/' },
    { name: 'Network', icon: <Users size={18} strokeWidth={1.5} />, path: '/network' },
    { name: 'Train AI', icon: <Settings size={18} strokeWidth={1.5} />, path: '/settings' },
  ];

  return (
    <div className="h-screen w-72 bg-surface-container-low flex flex-col fixed left-0 top-0">
      <div className="p-8">
        <div className="flex items-center gap-4">
          <img src={logo} alt="TalkNexa Logo" className="w-10 h-10 rounded-full object-cover shadow-lg shadow-primary/10" />
          <div className="text-on-surface font-manrope font-extrabold text-xl tracking-tighter">
            Talk<span className="text-primary">Nexa</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3.5 rounded-[0.25rem] transition-all duration-300 group ${
                isActive
                  ? 'bg-surface-container-lowest text-primary shadow-[0_4px_12px_rgba(42,20,180,0.05)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            <span className="transition-colors group-hover:text-primary">
              {item.icon}
            </span>
            <span className="text-[0.875rem] font-medium tracking-tight">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="p-6 bg-surface-container rounded-[0.25rem] mb-6">
          <p className="text-[0.7rem] font-bold text-primary uppercase tracking-[0.1em] mb-2">Concierge Status</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[0.8rem] font-medium text-on-surface leading-none">Active & Ready</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-6 py-3 text-on-surface-variant hover:text-red-500 transition-all group"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-[0.875rem] font-medium">Safe Exit</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

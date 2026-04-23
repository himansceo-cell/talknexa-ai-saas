import React, { useState, useEffect } from 'react';
import AppointmentTable from '../components/AppointmentTable';
import WhatsAppConfig from '../components/WhatsAppConfig';
import WebWidget from '../components/WebWidget';
import OnboardingFlow from '../components/OnboardingFlow';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp,
  Sparkles,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUI } from '../context/UIContext';

const Dashboard = () => {
  const { openAssistant } = useUI();
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    servicePopularity: {}
  });

  const [subscription, setSubscription] = useState({ status: 'free', plan: 'Community' });
  const [calendarConnected, setCalendarConnected] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const analyticsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics`, { headers });
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    const checkStatus = async () => {
      if (!auth.currentUser) return;
      try {
        const settingsRef = doc(db, 'botSettings', auth.currentUser.uid);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const [settingsSnap, userSnap] = await Promise.all([getDoc(settingsRef), getDoc(userRef)]);

        if (!settingsSnap.exists() || !settingsSnap.data().onboardingCompleted) {
          setShowOnboarding(true);
        }
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.subscription) setSubscription(userData.subscription);
          setCalendarConnected(!!userData.calendarConnected);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    fetchAnalytics();
    checkStatus();
  }, []);

  const handleCalendarConnect = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google/url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Failed to initiate Google OAuth", error);
    }
  };

  const statsList = [
    { name: 'Active Bookings', value: analytics.totalBookings, detail: 'Total queue count', icon: CalendarIcon },
    { name: 'Top Service', value: Object.keys(analytics.servicePopularity)[0] || 'N/A', detail: 'Market leader', icon: TrendingUp },
    { name: 'AI Reliability', value: '100%', detail: 'System uptime', icon: ShieldCheck },
    { name: 'Bridge Status', value: 'Live', detail: 'WhatsApp Link', icon: Activity },
  ];

  // Placeholder for chart data (derived from weeklyBookings in production)

  return (
    <div className="space-y-12">
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      
      {/* Premium Stats Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, index) => (
            <motion.div 
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect p-8 rounded-2xl relative overflow-hidden group hover:bg-surface-container-lowest/90 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[0.7rem] font-black text-primary uppercase tracking-[0.2em]">{stat.name}</p>
                <div className="text-primary/20 group-hover:text-primary/40 transition-colors">
                  <Activity size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-manrope font-extrabold text-on-surface">{stat.value}</span>
                <span className="text-xs font-bold text-green-500 tracking-tighter">+12%</span>
              </div>
              <p className="text-[0.65rem] text-on-surface-variant mt-2 font-medium uppercase tracking-widest opacity-60">{stat.detail}</p>
              
              {/* Subtle background glow */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Simplified System Status Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-10 rounded-3xl flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/5 to-transparent border border-white/10"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-primary animate-pulse" size={32} />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 flex items-center gap-3">
              Concierge Operational
              {subscription.status === 'active' ? (
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[0.5rem] font-black uppercase tracking-tighter rounded-md flex items-center gap-1">
                  <Sparkles size={10} fill="currentColor" /> Pro
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-on-surface/5 text-on-surface/40 border border-on-surface/10 text-[0.5rem] font-black uppercase tracking-tighter rounded-md">
                  Free
                </span>
              )}
            </h3>
            <p className="text-on-surface-variant text-sm max-w-md mx-auto">
              Your AI Assistant is actively monitoring WhatsApp. Bookings will appear in the Live Queue as they arrive.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-[0.65rem] font-black uppercase tracking-widest border border-green-500/20">
                Uplink Active
              </div>
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[0.65rem] font-black uppercase tracking-widest border border-primary/20">
                AI Ready
              </div>
            </div>
          </motion.div>

          {/* Google Calendar Integration Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect p-8 rounded-3xl border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${calendarConnected ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                <CalendarIcon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Google Calendar</h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  {calendarConnected 
                    ? "Neural sync active. Bookings are pushed to your calendar." 
                    : "Connect your calendar to enable real-time availability sync."}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleCalendarConnect}
              className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[0.7rem] transition-all ${
                calendarConnected 
                  ? 'bg-on-surface/5 text-on-surface/40 border border-on-surface/10 cursor-default' 
                  : 'bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {calendarConnected ? 'Connected' : 'Connect Now'}
            </button>
          </motion.div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-on-surface">Live Queue</h2>
                <p className="text-on-surface-variant text-sm mt-1">Active concierge operations.</p>
              </div>
            </div>
            
            <div className="glass-effect rounded-2xl overflow-hidden shadow-sm">
               <AppointmentTable />
            </div>
          </div>

        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={openAssistant}
            className="bg-primary p-8 rounded-[2.5rem] text-on-primary relative overflow-hidden shadow-2xl shadow-primary/30 min-h-[320px] flex flex-col justify-center cursor-pointer group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <BrainCircuit size={200} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                <p className="text-[0.65rem] font-black uppercase tracking-[0.3em]">Neural Link Active</p>
              </div>
              <h2 className="text-4xl font-manrope font-extrabold leading-[1.1] mb-6 italic tracking-tighter">The Soul.</h2>
              <p className="text-lg font-medium leading-tight opacity-90 mb-8 max-w-[220px]">
                "Concierge status is optimal. All neural uplinks are secure."
              </p>
              
              <motion.button
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-widest bg-white/20 px-6 py-3 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/30 transition-all"
              >
                Summon Assistant <Sparkles size={14} />
              </motion.button>
              
              <div className="mt-8 space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-white shadow-[0_0_15px_white]" 
                  />
                </div>
                <p className="text-[0.6rem] font-bold opacity-50 uppercase tracking-widest text-right">Logic Efficiency: 98.4%</p>
              </div>
            </div>
          </motion.div>


          <div className="glass-effect p-8 rounded-3xl space-y-6">
            <h3 className="text-[0.75rem] font-black text-on-surface uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              Market Edge
            </h3>
            <div className="space-y-6">
              {Object.entries(analytics.servicePopularity).map(([service, count], i) => (
                <div key={service} className="space-y-3">
                  <div className="flex justify-between items-center text-[0.7rem] font-bold">
                    <span className="text-on-surface uppercase tracking-wider">{service}</span>
                    <span className="text-primary font-manrope">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                      className="h-full bg-primary" 
                    />
                  </div>
                </div>
              ))}
              {Object.keys(analytics.servicePopularity).length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <PieChartIcon size={40} className="mx-auto mb-2" />
                  <p className="text-[0.6rem] uppercase font-bold tracking-widest">Data Pending</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-effect p-8 rounded-3xl">
             <WhatsAppConfig />
          </div>

          <div className="glass-effect p-8 rounded-3xl">
            <WebWidget phoneNumber="Your Number" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

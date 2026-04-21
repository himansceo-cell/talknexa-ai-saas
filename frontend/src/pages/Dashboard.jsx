import React, { useState, useEffect } from 'react';
import AppointmentTable from '../components/AppointmentTable';
import WhatsAppConfig from '../components/WhatsAppConfig';
import WebWidget from '../components/WebWidget';
import { auth } from '../firebase';
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
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    servicePopularity: {},
    weeklyBookings: []
  });

  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    recentPayments: [],
    paymentCount: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [analyticsRes, paymentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payments/stats`, { headers })
        ]);

        setAnalytics(analyticsRes.data);
        setPaymentStats(paymentRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchAnalytics();
  }, []);

  const statsList = [
    { name: 'Total Revenue', value: `$${paymentStats.totalRevenue.toFixed(2)}`, detail: 'Settled funds', icon: DollarSign },
    { name: 'Active Bookings', value: analytics.totalBookings, detail: 'Total queue count', icon: CalendarIcon },
    { name: 'Top Service', value: Object.keys(analytics.servicePopularity)[0] || 'N/A', detail: 'Market leader', icon: TrendingUp },
    { name: 'AI Reliability', value: '100%', detail: 'System uptime', icon: ShieldCheck },
  ];

  // Placeholder for chart data (derived from weeklyBookings in production)
  const chartData = [
    { name: 'Mon', bookings: 4 },
    { name: 'Tue', bookings: 7 },
    { name: 'Wed', bookings: 5 },
    { name: 'Thu', bookings: 9 },
    { name: 'Fri', bookings: 12 },
    { name: 'Sat', bookings: 8 },
    { name: 'Sun', bookings: 15 },
  ];

  return (
    <div className="space-y-12">
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
          {/* Main Chart Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-8 rounded-3xl h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Growth Insight</h3>
                <p className="text-on-surface-variant text-xs mt-1">Acquisition trends over the last 7 days.</p>
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                <span className="text-[0.65rem] font-bold uppercase text-on-surface-variant">Confirmed Bookings</span>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a14b4" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2a14b4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#6b7280' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#2a14b4" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorBookings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-on-surface">Financial Ledger</h2>
                <p className="text-on-surface-variant text-sm mt-1">Cross-referenced Stripe transactions.</p>
              </div>
            </div>
            
            <div className="glass-effect rounded-2xl overflow-hidden p-6">
              <div className="space-y-4">
                {paymentStats.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${payment.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{payment.customer}</p>
                        <p className="text-[0.6rem] text-on-surface-variant uppercase font-black tracking-widest">{payment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-manrope font-black text-on-surface">${payment.amount.toFixed(2)}</p>
                      <p className={`text-[0.6rem] uppercase font-bold ${payment.paymentStatus === 'paid' ? 'text-green-500' : 'text-on-surface-variant opacity-50'}`}>
                        {payment.paymentStatus}
                      </p>
                    </div>
                  </div>
                ))}
                {paymentStats.recentPayments.length === 0 && (
                  <div className="text-center py-8 opacity-30 italic text-xs font-bold uppercase tracking-widest">
                    No recent transactions found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-primary p-8 rounded-3xl text-on-primary relative overflow-hidden shadow-2xl shadow-primary/30 min-h-[280px] flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={180} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={12} className="animate-pulse" />
                <p className="text-[0.65rem] font-black uppercase tracking-[0.25em]">Neural Link Active</p>
              </div>
              <h2 className="text-3xl font-manrope font-extrabold leading-[1.1] mb-6 italic">The Soul.</h2>
              <p className="text-lg font-medium leading-tight opacity-90 mb-8 max-w-[200px]">
                "Concierge status is optimal. All uplinks secure."
              </p>
              <div className="h-1.5 w-full bg-white/10 rounded-full mb-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-white shadow-[0_0_15px_white]" 
                />
              </div>
              <p className="text-[0.6rem] font-bold opacity-50 uppercase tracking-widest">Logic Efficiency: 98.4%</p>
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

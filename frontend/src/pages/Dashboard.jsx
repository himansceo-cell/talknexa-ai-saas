import React from 'react';
import AppointmentTable from '../components/AppointmentTable';
import WhatsAppConfig from '../components/WhatsAppConfig';
import { 
  BarChart3, 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    { name: 'Total Bookings', value: '42', detail: '+12% this week' },
    { name: 'Client Network', value: '128', detail: '8 new today' },
    { name: 'AI Efficiency', value: '94%', detail: 'Automated response' },
    { name: 'Hours Saved', value: '18h', detail: 'Manual triage' },
  ];

  return (
    <div className="space-y-12">
      {/* Editorial Stats Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-y border-outline-variant/10 py-10">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`px-8 ${index !== 3 ? 'md:border-r border-outline-variant/10' : ''}`}
            >
              <p className="text-[0.75rem] font-bold text-primary uppercase tracking-[0.1em] mb-4">{stat.name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-manrope font-extrabold text-on-surface">{stat.value}</span>
              </div>
              <p className="text-[0.75rem] text-on-surface-variant mt-2 font-medium italic">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Appointments Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-on-surface">Queue</h2>
              <p className="text-on-surface-variant text-sm mt-1">Live status of your concierge bookings.</p>
            </div>
            <button className="text-primary font-bold text-[0.75rem] uppercase tracking-widest hover:underline underline-offset-8">
              Analysis View
            </button>
          </div>
          
          <div className="bg-surface-container-low rounded-[0.25rem] overflow-hidden">
             <AppointmentTable />
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-6 italic font-manrope">The Soul.</h2>
            <div className="bg-primary p-8 rounded-[0.25rem] text-on-primary relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Sparkles size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <p className="text-[0.75rem] font-extrabold uppercase tracking-widest mb-4 opacity-70">Active Logic</p>
                <p className="text-xl font-manrope font-bold leading-tight mb-8">
                  "Your concierge is currently optimized for friendly appointments."
                </p>
                <div className="h-1 w-full bg-white/20 rounded-full mb-2">
                  <div className="h-full w-2/3 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
                <p className="text-[0.65rem] font-medium opacity-70">Intelligence Pulse: Normal</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[0.75rem] font-bold text-on-surface uppercase tracking-[0.1em]">WhatsApp Uplink</h3>
            <div className="bg-surface-container-low p-6 rounded-[0.25rem]">
               <WhatsAppConfig />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

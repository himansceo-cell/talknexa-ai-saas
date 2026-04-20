import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar as CalendarIcon, CheckCircle, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentTable = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore listener error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-on-surface-variant text-sm font-medium italic">Scanning your queue...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <CalendarIcon size={24} className="text-on-surface-variant/40" />
        </div>
        <h3 className="text-xl font-manrope font-bold text-on-surface">The queue is silent.</h3>
        <p className="text-on-surface-variant text-sm mt-2 max-w-xs leading-relaxed">
          Once your concierge starts securing bookings via WhatsApp, they will appear right here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-[0.1em] px-8 py-4 mb-2">
        <div className="col-span-2">Client</div>
        <div>Service</div>
        <div>Timing</div>
        <div className="text-right">Status</div>
      </div>
      
      <div className="space-y-1">
        <AnimatePresence>
          {appointments.map((appt, index) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group grid grid-cols-5 items-center px-8 py-4 bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer rounded-[0.25rem]"
            >
              <div className="col-span-2 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-manrope font-extrabold text-sm border border-primary/10">
                  {appt.customerName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-manrope font-bold text-on-surface leading-none mb-1">{appt.customerName}</p>
                  <p className="text-[0.75rem] text-on-surface-variant font-medium">{appt.customerPhone}</p>
                </div>
              </div>

              <div>
                <span className="text-[0.75rem] font-bold text-primary uppercase tracking-tighter bg-primary/5 px-2 py-1 rounded">
                  {appt.service}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-manrope font-bold text-on-surface">
                  {appt.date}
                </span>
                <span className="text-[0.7rem] text-on-surface-variant font-medium uppercase tracking-wider">
                  {appt.time}
                </span>
              </div>

              <div className="flex items-center justify-end gap-6 text-right">
                <div className="flex items-center gap-2 text-green-600 bg-green-500/5 px-3 py-1.5 rounded-full">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider">
                    {appt.status || "Confirmed"}
                  </span>
                </div>
                <button className="text-on-surface-variant hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppointmentTable;

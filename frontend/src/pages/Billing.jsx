import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Billing = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState({ status: 'free', plan: 'Community' });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().subscription) {
          setSubscription(userSnap.data().subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/billing/create-checkout`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Billing error:", error);
      alert("Failed to initiate secure checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/billing/customer-portal`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Portal error:", error);
      alert("Could not open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary/40">Accessing Vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24">
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 text-[0.65rem] font-black uppercase tracking-widest"
        >
          <ShieldCheck size={14} />
          Secure Billing Portal
        </motion.div>
        <h1 className="text-6xl font-manrope font-black text-on-surface tracking-tight">
          Select Your <span className="text-primary">Power Level</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-medium opacity-70">
          Scaling your business shouldn't be complicated. Choose the plan that fits your current trajectory.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect p-10 rounded-[2.5rem] border border-white/5 space-y-8 flex flex-col"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-on-surface opacity-60">Community</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-on-surface">$0</span>
              <span className="text-on-surface-variant font-bold text-sm">/forever</span>
            </div>
          </div>

          <ul className="space-y-4 flex-1">
            {[
              '3 Free Bookings',
              '1 WhatsApp Connection',
              'Basic AI Responses',
              'Community Support'
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                <CheckCircle2 size={18} className="text-primary/40" />
                {feature}
              </li>
            ))}
          </ul>

          <button 
            disabled 
            className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-on-surface-variant font-black uppercase text-xs tracking-widest cursor-default"
          >
            {subscription.status === 'free' ? 'Current Plan' : 'Standard Access'}
          </button>
        </motion.div>

        {/* Pro Plan */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/30 space-y-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Zap size={120} strokeWidth={1} />
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-on-primary">Professional</h3>
              <span className="px-2 py-0.5 bg-white/20 text-white text-[0.5rem] font-black uppercase tracking-widest rounded-md">Popular</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-on-primary">$49</span>
              <span className="text-on-primary/70 font-bold text-sm">/month</span>
            </div>
          </div>

          <ul className="space-y-4 flex-1 relative z-10">
            {[
              'Unlimited Bookings',
              'Advanced Persona Engine',
              'Google Calendar Sync',
              'Priority Concierge Logic',
              '24/7 Neural Uptime'
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium text-on-primary">
                <CheckCircle2 size={18} className="text-white/40" />
                {feature}
              </li>
            ))}
          </ul>

          {subscription.status === 'active' ? (
            <button 
              onClick={handleManage}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-white text-primary font-black uppercase text-xs tracking-widest hover:shadow-xl transition-all relative z-10 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Manage Subscription'}
            </button>
          ) : (
            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-on-surface text-surface font-black uppercase text-xs tracking-widest hover:shadow-xl transition-all relative z-10 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  Scale Operations <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>

      <footer className="max-w-2xl mx-auto text-center space-y-6">
        <div className="flex items-center justify-center gap-8 opacity-40">
          <CreditCard size={32} />
          <div className="h-8 w-px bg-on-surface/20" />
          <ShieldCheck size={32} />
        </div>
        <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-[0.2em] leading-relaxed">
          Powered by Stripe. All transactions are encrypted with 256-bit SSL. 
          Cancel or switch plans at any time from your management portal.
        </p>
      </footer>
    </div>
  );
};

export default Billing;

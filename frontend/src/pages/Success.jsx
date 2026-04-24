import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti!
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-effect-heavy p-12 rounded-[3rem] text-center max-w-xl w-full border border-primary/20 shadow-2xl shadow-primary/10"
      >
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30">
          <CheckCircle2 size={48} className="text-on-primary" />
        </div>
        
        <h1 className="text-4xl font-manrope font-black text-on-surface mb-4 tracking-tight">
          Welcome to <span className="text-primary italic">Pro Status.</span>
        </h1>
        
        <p className="text-on-surface-variant font-medium text-lg mb-10 opacity-70 leading-relaxed">
          Your payment was successful and your neural uplink has been upgraded to the Professional Tier. 
          Advanced AI features and unlimited bookings are now active.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <Sparkles className="text-primary mx-auto mb-2" size={20} />
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">Priority Logic</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <Sparkles className="text-primary mx-auto mb-2" size={20} />
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">Voice Processing</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="group w-full py-5 bg-on-surface text-surface rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:shadow-xl transition-all"
        >
          Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

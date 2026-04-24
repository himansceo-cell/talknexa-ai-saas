import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-effect-heavy p-12 rounded-[3rem] text-center max-w-xl w-full border border-white/5 shadow-2xl"
      >
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <XCircle size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-4xl font-manrope font-black text-on-surface mb-4 tracking-tight">
          Checkout <span className="text-red-500 italic">Interrupted.</span>
        </h1>
        
        <p className="text-on-surface-variant font-medium text-lg mb-10 opacity-70 leading-relaxed">
          The subscription process was not completed. No charges were made. 
          If you encountered a technical issue, please try again or contact support.
        </p>

        <button 
          onClick={() => navigate('/billing')}
          className="group w-full py-5 bg-surface-container-high text-on-surface rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-surface-container-highest transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Billing
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;

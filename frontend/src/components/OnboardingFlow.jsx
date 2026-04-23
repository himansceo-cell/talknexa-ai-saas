import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Bot, 
  ListChecks, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Stethoscope, 
  Briefcase, 
  Scissors, 
  LayoutGrid
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const OnboardingFlow = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({
    businessName: '',
    businessType: '',
    tone: 'Professional & Formal',
    services: ''
  });
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const INDUSTRIES = [
    { id: 'Clinical', name: 'Clinical / Medical', icon: Stethoscope, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Barbershop', name: 'Barber Shop / Salon', icon: Scissors, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'Corporate', name: 'Corporate / Office', icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'General', name: 'Other Business', icon: LayoutGrid, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const TONES = [
    { id: 'Friendly & Warm', desc: 'Approachable and kind, great for service industries.' },
    { id: 'Professional & Formal', desc: 'Trustworthy and precise, ideal for medical or corporate.' },
    { id: 'Minimal & Efficient', desc: 'Quick and to the point, perfect for busy professionals.' },
  ];

  const nextStep = () => {
    if (step === 1 && !settings.businessName) {
      setError("We need a name to start the uplink.");
      return;
    }
    if (step === 2 && !settings.businessType) {
      setError("Please select your industry type.");
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };
  
  const prevStep = () => {
    setError(null);
    setStep(s => s - 1);
  };

  const handleComplete = async () => {
    if (!currentUser) {
      setError("Authentication lost. Please log in again.");
      return;
    }

    if (!settings.services) {
      setError("Please list at least one service for the AI to handle.");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      console.log("Saving onboarding settings for user:", currentUser.uid);
      const docRef = doc(db, 'botSettings', currentUser.uid);
      
      await setDoc(docRef, {
        ...settings,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid
      }, { merge: true });
      
      console.log("Settings saved successfully.");
      setIsSuccess(true);
      
      // Call onComplete after a delay to show success state
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          console.warn("onComplete prop not found in OnboardingFlow");
          // Fallback: window refresh if the parent state doesn't update
          window.location.reload();
        }
      }, 1500);
    } catch (err) {
      console.error("Error saving onboarding:", err);
      setError(`Transmission Error: ${err.message || 'Check connection'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-surface/90 backdrop-blur-3xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-surface-container-low border border-outline-variant/20 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
      >
        {/* Progress Navigation */}
        <div className="flex border-b border-outline-variant/10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 relative h-2">
              <motion.div 
                initial={false}
                animate={{ 
                  backgroundColor: i <= step ? 'var(--md-sys-color-primary)' : 'rgba(255,255,255,0.05)',
                  opacity: i <= step ? 1 : 0.5
                }}
                className="absolute inset-0 transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="p-12">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 animate-pulse" />
                  <div className="w-32 h-32 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 relative z-10 border border-green-500/20">
                    <CheckCircle2 size={64} />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl font-manrope font-extrabold text-on-surface tracking-tight">Uplink Success</h3>
                  <p className="text-on-surface-variant mt-4 text-lg font-medium max-w-md mx-auto">
                    Your AI Concierge has been personalized and is now ready to manage your appointments.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                          <Building2 size={24} />
                        </div>
                        <h2 className="text-3xl font-manrope font-extrabold text-on-surface">The Identity</h2>
                      </div>
                      <p className="text-on-surface-variant text-lg">Let's start by giving your AI assistant its business name.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-primary uppercase tracking-[0.25em]">Business Name</label>
                      <input 
                        type="text" 
                        value={settings.businessName}
                        autoFocus
                        onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                        placeholder="e.g., Nexa Elite Barbers"
                        className="w-full bg-surface-container-high p-6 rounded-2xl border border-outline-variant/10 focus:border-primary outline-none text-2xl font-bold text-on-surface transition-all placeholder:opacity-20"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                          <Bot size={24} />
                        </div>
                        <h2 className="text-3xl font-manrope font-extrabold text-on-surface">Industry Specialization</h2>
                      </div>
                      <p className="text-on-surface-variant text-lg">Select your industry so we can tune the AI's protocols.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind.id}
                          onClick={() => {
                            setSettings({...settings, businessType: ind.id});
                            setError(null);
                          }}
                          className={`p-6 rounded-3xl border-2 text-left transition-all group flex flex-col gap-6 relative overflow-hidden ${
                            settings.businessType === ind.id 
                            ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/10' 
                            : 'bg-surface-container-high border-transparent hover:border-primary/30'
                          }`}
                        >
                          <div className={`w-14 h-14 ${ind.bg} ${ind.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <ind.icon size={28} />
                          </div>
                          <div>
                            <span className={`font-extrabold text-lg ${settings.businessType === ind.id ? 'text-primary' : 'text-on-surface'}`}>
                              {ind.name}
                            </span>
                            {settings.businessType === ind.id && (
                              <motion.div layoutId="check" className="absolute top-6 right-6 text-primary">
                                <CheckCircle2 size={24} />
                              </motion.div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                          <Sparkles size={24} />
                        </div>
                        <h2 className="text-3xl font-manrope font-extrabold text-on-surface">Communication Tone</h2>
                      </div>
                      <p className="text-on-surface-variant text-lg">How should your assistant sound to your clients?</p>
                    </div>
                    <div className="space-y-4">
                      {TONES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSettings({...settings, tone: t.id})}
                          className={`p-6 rounded-2xl border-2 text-left transition-all w-full flex items-center justify-between ${
                            settings.tone === t.id 
                            ? 'bg-primary/5 border-primary' 
                            : 'bg-surface-container-high border-transparent hover:border-primary/20'
                          }`}
                        >
                          <div className="space-y-1">
                            <p className={`font-extrabold ${settings.tone === t.id ? 'text-primary' : 'text-on-surface'}`}>{t.id}</p>
                            <p className="text-sm text-on-surface-variant font-medium opacity-60">{t.desc}</p>
                          </div>
                          {settings.tone === t.id && <CheckCircle2 size={24} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                          <ListChecks size={24} />
                        </div>
                        <h2 className="text-3xl font-manrope font-extrabold text-on-surface">Service Portfolio</h2>
                      </div>
                      <p className="text-on-surface-variant text-lg">Define the services your clients can book via WhatsApp.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10">
                        <textarea 
                          value={settings.services}
                          onChange={(e) => setSettings({...settings, services: e.target.value})}
                          placeholder="e.g. Classic Haircut - $30&#10;Consultation - Free&#10;Teeth Whitening - $150"
                          rows={6}
                          className="w-full bg-transparent outline-none text-on-surface font-bold text-lg placeholder:opacity-20 resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <Sparkles size={16} className="text-primary" />
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">Tip: List one service per line for optimal AI parsing.</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        {!isSuccess && (
          <div className="p-10 bg-surface-container-lowest/50 border-t border-outline-variant/10 flex justify-between items-center">
            <button 
              onClick={prevStep}
              disabled={step === 1 || saving}
              className="btn-premium"
            >
              Back
            </button>
            
            <button 
              onClick={step === 4 ? handleComplete : nextStep}
              disabled={saving}
              className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 group active:scale-95"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent" />
                  Establishing Uplink
                </>
              ) : (
                <>
                  {step === 4 ? "Complete Uplink" : "Next Phase"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;

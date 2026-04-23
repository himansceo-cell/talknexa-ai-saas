import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Bot, Building2, MessageSquare, ListChecks, Sparkles, CheckCircle2, AlertCircle, Send, User, BrainCircuit } from 'lucide-react';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    businessName: '',
    businessType: 'General',
    tone: 'Friendly & Warm',
    specialInstructions: '',
    services: '',
  });

  const [testMessages, setTestMessages] = useState([
    { role: 'model', parts: [{ text: 'Greetings! I am Nexa, your specialized AI concierge. Update your settings and talk to me here to test my persona!' }] }
  ]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'botSettings', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', text: '' });
    
    try {
      await setDoc(doc(db, 'botSettings', currentUser.uid), {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setStatus({ type: 'success', text: 'Assistant consciousness updated successfully.' });
      setTimeout(() => setStatus({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setStatus({ type: 'error', text: 'Neural link failed. Please verify your connection.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  const handleTestChat = async (e) => {
    e.preventDefault();
    if (!testInput.trim() || testLoading) return;

    const newMessage = { role: 'user', parts: [{ text: testInput }] };
    setTestMessages(prev => [...prev, newMessage]);
    setTestInput('');
    setTestLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/bot/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          message: testInput,
          history: testMessages,
          context: settings
        })
      });

      const data = await response.json();
      if (data.reply) {
        setTestMessages(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
      }
    } catch (error) {
      console.error("Test chat failed:", error);
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-primary/40">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[0.6rem] font-black uppercase tracking-widest rounded-full border border-primary/20">System Config</span>
            <Sparkles className="text-primary/40 animate-pulse" size={16} />
          </div>
          <h1 className="text-5xl font-manrope font-extrabold text-on-surface tracking-tight">Assistant <span className="text-primary">Specialization</span></h1>
          <p className="text-on-surface-variant mt-3 text-lg font-medium opacity-70">Fine-tune the neural pathways and behavioral constraints of your concierge.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Identity & Core Logic */}
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect p-10 rounded-[2.5rem] border border-white/[0.03] space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Building2 size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Core Identity</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-primary uppercase tracking-widest ml-1">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={settings.businessName}
                    onChange={handleChange}
                    placeholder="e.g., Nexa Barber Shop"
                    className="w-full bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] focus:border-primary/50 outline-none text-on-surface transition-all font-medium"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-primary uppercase tracking-widest ml-1">Industry Segment</label>
                  <select
                    name="businessType"
                    value={settings.businessType}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] focus:border-primary/50 outline-none text-on-surface transition-all font-medium appearance-none"
                  >
                    <option value="General">General Business</option>
                    <option value="Medical Clinic">Medical Clinic</option>
                    <option value="Barber Shop">Barber Shop / Salon</option>
                    <option value="Corporate">Corporate Office</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect p-10 rounded-[2.5rem] border border-white/[0.03] space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Bot size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Behavioral Tone</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {['Friendly & Warm', 'Professional & Formal', 'Minimal & Efficient'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, tone: t }))}
                    className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      settings.tone === t 
                        ? 'bg-primary border-primary text-on-primary shadow-xl shadow-primary/20' 
                        : 'bg-white/[0.03] border-white/[0.05] text-on-surface-variant hover:border-primary/30'
                    }`}
                  >
                    <span className="font-bold">{t}</span>
                    {settings.tone === t && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Logic & Offerings */}
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect p-10 rounded-[2.5rem] border border-white/[0.03] space-y-8 h-full flex flex-col"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <ListChecks size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Service Portfolio</h2>
              </div>
              
              <div className="flex-1 flex flex-col space-y-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[0.7rem] font-black text-primary uppercase tracking-widest ml-1 text-xs">Knowledge Base (Offerings)</label>
                  <textarea
                    name="services"
                    value={settings.services}
                    onChange={handleChange}
                    placeholder="e.g., Classic Haircut - $30&#10;Beard Sculpting - $25"
                    className="w-full bg-white/[0.03] p-6 rounded-3xl border border-white/[0.05] focus:border-primary/50 outline-none text-on-surface transition-all font-medium resize-none h-full min-h-[300px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-primary uppercase tracking-widest ml-1 text-xs">Operational Directives</label>
                  <textarea
                    name="specialInstructions"
                    value={settings.specialInstructions}
                    onChange={handleChange}
                    placeholder="e.g., Always mention our 20% first-time discount."
                    rows={3}
                    className="w-full bg-white/[0.03] p-6 rounded-3xl border border-white/[0.05] focus:border-primary/50 outline-none text-on-surface transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        </div>

        {/* Live Persona Preview Panel */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-[2.5rem] border border-white/[0.03] overflow-hidden flex flex-col h-[600px] shadow-2xl"
        >
          <div className="p-8 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary animate-pulse">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-on-surface">Persona Preview</h2>
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary/60">Live Consciousness Simulation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-[0.65rem] font-black uppercase tracking-tighter text-on-surface/40">Neural Link Active</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {testMessages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-white/[0.05] text-on-surface border border-white/[0.05] rounded-tl-none'
                }`}>
                  {msg.parts[0].text}
                </div>
              </motion.div>
            ))}
            {testLoading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.05] p-5 rounded-3xl rounded-tl-none flex gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleTestChat} className="p-6 bg-black/20 border-t border-white/[0.05]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Talk to your AI bot..."
                className="w-full bg-white/[0.03] p-5 pr-16 rounded-2xl border border-white/[0.05] focus:border-primary/50 outline-none text-on-surface transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={testLoading || !testInput.trim()}
                className="absolute right-3 p-3 bg-primary text-on-primary rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[0.55rem] text-center mt-3 text-on-surface/30 font-bold uppercase tracking-[0.2em]">
              This simulates how a customer sees your bot on WhatsApp
            </p>
          </form>
        </motion.section>

        <div className="flex flex-col items-end gap-6 pt-8">
          <AnimatePresence>
            {status.text && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                  status.type === 'success' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {status.text}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-12 py-6 rounded-3xl font-black uppercase tracking-[0.25em] flex items-center gap-4 hover:shadow-[0_20px_50px_rgba(42,20,180,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 group"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent"></div>
            ) : (
              <>
                <Save size={20} className="group-hover:rotate-12 transition-transform" />
                Synchronize Specialization
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;


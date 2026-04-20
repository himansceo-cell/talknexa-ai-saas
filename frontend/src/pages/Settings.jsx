import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Save, Bot, Building2, MessageSquare, ListChecks } from 'lucide-react';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    businessName: '',
    businessType: 'General',
    tone: 'Friendly',
    specialInstructions: '',
    services: '',
  });

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
    setMessage({ type: '', text: '' });
    
    try {
      await setDoc(doc(db, 'botSettings', currentUser.uid), settings);
      setMessage({ type: 'success', text: 'Assistant trained successfully! ✅' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-manrope font-extrabold text-on-surface">Assistant Training</h1>
        <p className="text-on-surface-variant mt-2">Define your concierge's personality and business knowledge.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Identity */}
        <section className="bg-surface-container-low p-8 rounded-[0.25rem] border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-on-surface">Business Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[0.75rem] font-bold text-primary uppercase tracking-widest">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                placeholder="e.g., Nexa Barber Shop"
                className="w-full bg-surface-container p-4 rounded-[0.25rem] border border-outline-variant/20 focus:border-primary outline-none text-on-surface transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[0.75rem] font-bold text-primary uppercase tracking-widest">Business Type</label>
              <select
                name="businessType"
                value={settings.businessType}
                onChange={handleChange}
                className="w-full bg-surface-container p-4 rounded-[0.25rem] border border-outline-variant/20 focus:border-primary outline-none text-on-surface transition-all appearance-none"
              >
                <option value="General">General Business</option>
                <option value="Medical Clinic">Medical Clinic</option>
                <option value="Barber Shop">Barber Shop / Salon</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Legal Services">Legal Services</option>
              </select>
            </div>
          </div>
        </section>

        {/* Persona & Tone */}
        <section className="bg-surface-container-low p-8 rounded-[0.25rem] border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-on-surface">Concierge Persona</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.75rem] font-bold text-primary uppercase tracking-widest">Interaction Tone</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Friendly & Warm', 'Professional & Formal', 'Minimal & Efficient'].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, tone }))}
                    className={`p-4 rounded-[0.25rem] border text-sm font-medium transition-all ${
                      settings.tone === tone 
                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[0.75rem] font-bold text-primary uppercase tracking-widest">Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={settings.specialInstructions}
                onChange={handleChange}
                placeholder="e.g., Mention our 20% discount for first-time visits. Always ask if they need parking."
                rows={4}
                className="w-full bg-surface-container p-4 rounded-[0.25rem] border border-outline-variant/20 focus:border-primary outline-none text-on-surface transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* Knowledge Base */}
        <section className="bg-surface-container-low p-8 rounded-[0.25rem] border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <ListChecks className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-on-surface">Knowledge Base (Services)</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-[0.75rem] font-bold text-primary uppercase tracking-widest">Available Services & Prices</label>
            <textarea
              name="services"
              value={settings.services}
              onChange={handleChange}
              placeholder="e.g., Haircut - $30, Beard Trim - $20, Full Grooming - $45"
              rows={6}
              className="w-full bg-surface-container p-4 rounded-[0.25rem] border border-outline-variant/20 focus:border-primary outline-none text-on-surface transition-all resize-none"
            />
            <p className="text-[0.65rem] text-on-surface-variant italic">List your services exactly as you want the bot to describe them.</p>
          </div>
        </section>

        {message.text && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-[0.25rem] text-sm font-medium ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-10 py-4 rounded-[0.25rem] font-bold uppercase tracking-widest flex items-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary"></div>
            ) : (
              <Save size={18} />
            )}
            Save Training Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

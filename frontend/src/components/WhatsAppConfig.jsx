import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { QrCode, CheckCircle, RefreshCw, AlertCircle, Smartphone, Power } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

const WhatsAppConfig = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, disconnected, scanning, authenticated, ready
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.emit('join', user.uid);

    newSocket.on('qr', (dataUrl) => {
      setQrCode(dataUrl);
      setStatus('scanning');
    });

    newSocket.on('status', (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'ready') setQrCode(null);
    });

    checkStatus();
    
    // Safety timeout: if we're still loading after 5 seconds, force it to disconnected
    // so the user can at least see the "Initialize" button.
    const timeout = setTimeout(() => {
      setStatus(prev => prev === 'loading' ? 'disconnected' : prev);
    }, 5000);

    return () => {
      newSocket.disconnect();
      clearTimeout(timeout);
    };
  }, [user]);

  const checkStatus = async () => {
    console.log("Checking WhatsApp status at:", `${BACKEND_URL}/api/whatsapp/status`);
    try {
      const testRes = await axios.get(`${BACKEND_URL}/api/test`);
      console.log("Public test endpoint reached:", testRes.data);
      
      const idToken = await user.getIdToken();
      const response = await axios.get(`${BACKEND_URL}/api/whatsapp/status`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setStatus(response.data.status);
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      // If we can't reach the backend or there's an error, default to disconnected
      // so the user can at least try to initialize.
      setStatus('disconnected');
    }
  };

  const startSession = async () => {
    setStatus('initializing');
    try {
      const idToken = await user.getIdToken();
      await axios.post(`${BACKEND_URL}/api/whatsapp/start`, {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
    } catch (error) {
      console.error("Error starting WhatsApp session:", error);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[0.75rem] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Uplink Interface</h3>
        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
          status === 'ready' ? 'bg-green-500/10 text-green-600' : 'bg-on-surface-variant/10 text-on-surface-variant'
        }`}>
          {status}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {status === 'disconnected' || status === 'auth_failure' || status === 'error' ? (
          <motion.div 
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-10 bg-surface-container rounded-[0.25rem]"
          >
            <div className="w-12 h-12 bg-on-surface-variant/5 text-on-surface-variant/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone size={24} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-manrope font-bold text-on-surface mb-6">Uplink is currently offline.</p>
            <button 
              onClick={startSession}
              className="btn-premium mx-auto"
            >
              Initialize Connection
            </button>
          </motion.div>
        ) : status === 'scanning' && qrCode ? (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-[0.75rem] font-bold text-primary uppercase tracking-widest mb-6">Authentication Required</p>
            <div className="p-6 bg-white rounded-[0.25rem] shadow-2xl shadow-primary/10 inline-block">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 mix-blend-multiply" />
            </div>
            <div className="mt-8 space-y-2">
              <p className="text-[0.7rem] text-on-surface-variant font-medium">1. Open WhatsApp on your phone</p>
              <p className="text-[0.7rem] text-on-surface-variant font-medium">2. Tap Menu or Settings &gt; Linked Devices</p>
              <p className="text-[0.7rem] text-on-surface-variant font-medium">3. Point your phone to this screen</p>
            </div>
          </motion.div>
        ) : status === 'ready' || status === 'authenticated' ? (
          <motion.div 
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10 shadow-[0_0_20px_rgba(42,20,180,0.1)]">
              <CheckCircle size={32} strokeWidth={1.5} />
            </div>
            <p className="text-xl font-manrope font-extrabold text-on-surface mb-2 italic">Secured.</p>
            <p className="text-sm text-on-surface-variant font-medium max-w-[200px] mx-auto">Your AI concierge is actively monitoring your WhatsApp portal.</p>
            
            <button 
              onClick={startSession}
              className="mt-8 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mx-auto hover:text-primary transition-colors"
            >
              <RefreshCw size={12} strokeWidth={2} />
              Re-initialize Session
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-[0.75rem] font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Syncing Engine...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8 border-t border-outline-variant/10">
        <div className="flex items-start gap-4">
          <AlertCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[0.7rem] text-on-surface-variant font-medium leading-relaxed italic">
            Keep your device connected to ensure 24/7 coverage. The Concierge operates via an encrypted cloud bridge for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig;

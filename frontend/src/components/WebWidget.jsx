import React, { useState } from 'react';
import { MessageSquare, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WebWidget = ({ phoneNumber }) => {
  const [copied, setCopied] = useState(false);
  const cleanPhone = phoneNumber?.replace(/\D/g, '');
  
  const embedCode = `
<!-- TalkNexa WhatsApp Widget -->
<a href="https://wa.me/${cleanPhone}?text=Hi!%20I'd%20like%20to%20book%20an%20appointment." 
   style="position:fixed;bottom:20px;left:20px;background:#25D366;color:white;padding:12px 20px;border-radius:50px;text-decoration:none;font-family:sans-serif;font-weight:bold;display:flex;align-items:center;gap:10px;box-shadow:0 10px 25px rgba(0,0,0,0.1);z-index:9999;" 
   target="_blank">
   <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" height="20" />
   Book on WhatsApp
</a>
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-[0.25rem] space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <MessageSquare size={24} />
        </div>
        <div>
          <h4 className="font-bold text-on-surface">Web Widget</h4>
          <p className="text-xs text-on-surface-variant">Drive traffic from your website to WhatsApp.</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest">Your Embed Code</p>
        <div className="bg-surface-container-high p-4 rounded-[0.25rem] relative group">
          <pre className="text-[0.6rem] text-on-surface-variant overflow-x-auto font-mono leading-relaxed">
            {embedCode.trim()}
          </pre>
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-primary text-on-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-[0.6rem] text-on-surface-variant italic">
          Copy this code and paste it before the &lt;/body&gt; tag on your website.
        </p>
      </div>
    </div>
  );
};

export default WebWidget;

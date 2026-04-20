import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserPlus, Mail, Lock, Building, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import logo from '../assets/logo.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.businessName });

      await setDoc(doc(db, 'users', user.uid), {
        email: formData.email,
        businessName: formData.businessName,
        phoneNumber: formData.phoneNumber,
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding/Editorial */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block"
        >
          <div className="flex items-center gap-4 text-primary font-manrope font-extrabold text-2xl mb-12">
            <img src={logo} alt="TalkNexa" className="w-10 h-10 rounded-full object-cover shadow-lg shadow-primary/10" />
            <div className="tracking-tighter">
              <span className="text-on-surface">Talk</span>Nexa
            </div>
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.1] text-on-surface mb-6">
            The future of <br />
            <span className="text-primary italic">client booking</span> <br />
            is fluid.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed mb-8">
            Impeccably organized AI-powered appointment management for modern business owners.
          </p>
          
          <div className="flex gap-4">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <div className="h-1 w-4 bg-primary/20 rounded-full" />
            <div className="h-1 w-4 bg-primary/20 rounded-full" />
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest p-8 md:p-12 rounded-[0.25rem] shadow-none md:shadow-[0_32px_64px_rgba(25,28,29,0.05)] border border-outline-variant"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-on-surface">Start your concierge.</h2>
            <p className="text-on-surface-variant mt-2">Zero-config AI booking setup in minutes.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-[0.25rem] text-sm mb-6 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-1.5">
              <label className="text-[0.75rem] font-medium text-on-surface-variant ml-1">Business Name</label>
              <input
                name="businessName"
                type="text"
                required
                className="input-field"
                placeholder="e.g. Nova Wellness Center"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.75rem] font-medium text-on-surface-variant ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.75rem] font-medium text-on-surface-variant ml-1">Business WhatsApp</label>
              <input
                name="phoneNumber"
                type="tel"
                required
                className="input-field"
                placeholder="+1 234 567 8900"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.75rem] font-medium text-on-surface-variant ml-1">Secure Password</label>
              <input
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-indigo w-full mt-6"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-on-surface-variant">
              Already using TalkNexa?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;

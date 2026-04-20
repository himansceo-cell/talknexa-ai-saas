import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
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
            Welcome back to <br />
            <span className="text-primary italic">intelligence.</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed mb-8">
            Your concierge is waiting. Sign in to view your appointments and manage your AI settings.
          </p>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest p-8 md:p-12 rounded-[0.25rem] shadow-none md:shadow-[0_32px_64px_rgba(25,28,29,0.05)] border border-outline-variant"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-on-surface">Sign In.</h2>
            <p className="text-on-surface-variant mt-2">Manage your AI concierge dashboard.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-[0.25rem] text-sm mb-6 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-[0.75rem] font-medium text-on-surface-variant ml-1">Email address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.75rem] font-medium text-on-surface-variant ml-1">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-on-surface-variant">
              New to TalkNexa?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

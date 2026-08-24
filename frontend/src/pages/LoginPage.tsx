import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Background3D } from '../components/Background3D.js';
import { LightningEntrance } from '../components/LightningEntrance.js';
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        if (res.data.data.user.role === 'CREATOR') {
          navigate('/creator');
        } else if (res.data.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'customer' | 'creator' | 'admin') => {
    if (role === 'customer') {
      setEmail('jordan@buyer.com');
      setPassword('Password123!');
    } else if (role === 'creator') {
      setEmail('alex@forgeflow.dev');
      setPassword('Password123!');
    } else {
      setEmail('admin@productforge.io');
      setPassword('Password123!');
    }
  };

  return (
    <div className="relative min-h-[88vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Page Load Lightning Entrance Animation (1.2s overlay) */}
      <LightningEntrance />

      {/* Full-Screen 3D Atmosphere Background */}
      <Background3D variant="BUYER" />

      {/* Subtle Dark/Blue Transparent Overlay over entire background */}
      <div className="absolute inset-0 bg-[#060913]/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Centered Transparent Glassmorphism Login Card */}
      <div className="relative z-10 glass-login-card w-full max-w-md p-8 sm:p-10 space-y-6 overflow-hidden">
        
        {/* Subtle Ambient Light Spotlights */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/90 to-cyan-400/90 border border-white/40 flex items-center justify-center mx-auto shadow-glow-cyan">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-200/80 font-light">Sign in to your ProductForge account</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 relative z-10">
          <span className="text-[10px] text-slate-200/80 font-mono block uppercase text-center tracking-wider font-semibold">
            Quick Demo Auto-Fill:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer')}
              className="py-2 px-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-bold text-white text-center transition-all shadow-sm"
            >
              🛍️ Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('creator')}
              className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-300/40 text-xs font-bold text-amber-200 text-center transition-all shadow-sm"
            >
              👨‍💻 Creator
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-300/40 text-xs font-bold text-emerald-200 text-center transition-all shadow-sm"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/40 text-xs text-red-200 font-medium relative z-10 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          <div>
            <label className="text-white/90 font-semibold block mb-1.5 text-xs">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input-transparent font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-white/90 font-semibold block mb-1.5 text-xs">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input-transparent font-medium"
                required
              />
            </div>
          </div>

          {/* Translucent Glowing Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 glass-btn-glow font-bold text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-200/80 relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-300 hover:text-white underline font-bold transition-colors">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
};

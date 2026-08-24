import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Background3D } from '../components/Background3D.js';
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
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Background3D variant="BUYER" />

      <div className="relative z-10 glass-panel-3d w-full max-w-md rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-glow-indigo">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your ProductForge account</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
          <span className="text-[10px] text-slate-400 font-mono block uppercase text-center tracking-wider">
            Quick Demo Auto-Fill:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer')}
              className="py-2 px-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-xs font-semibold text-cyan-300 text-center transition-all shadow-sm"
            >
              🛍️ Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('creator')}
              className="py-2 px-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-xs font-semibold text-amber-300 text-center transition-all shadow-sm"
            >
              👨‍💻 Creator
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2 px-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-xs font-semibold text-emerald-300 text-center transition-all shadow-sm"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-200 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl glass-input-3d text-white font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-200 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl glass-input-3d text-white font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-bold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

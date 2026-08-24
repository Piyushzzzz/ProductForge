import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { Background3D } from '../components/Background3D.js';
import { LightningEntrance } from '../components/LightningEntrance.js';
import { Layers, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        if (role === 'CREATOR') {
          navigate('/creator');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[88vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Page Load Lightning Entrance Animation */}
      <LightningEntrance />

      {/* Full-Screen 3D Atmosphere Background */}
      <Background3D variant="BUYER" />

      {/* Subtle Overlay */}
      <div className="absolute inset-0 bg-[#060913]/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Centered Transparent Glassmorphism Card */}
      <div className="relative z-10 glass-login-card w-full max-w-md p-8 sm:p-10 space-y-6 overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/90 to-cyan-400/90 border border-white/40 flex items-center justify-center mx-auto shadow-glow-cyan">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">Join ProductForge</h2>
          <p className="text-xs text-slate-200/80 font-light">Create an account as a buyer or software creator</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/40 text-xs text-red-200 font-medium relative z-10 backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          {/* Persona Role Selection */}
          <div>
            <label className="text-white/90 font-semibold block mb-1.5 text-xs">I want to:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  role === 'CUSTOMER'
                    ? 'bg-white/20 border-cyan-400 shadow-glow-cyan text-white font-bold'
                    : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/15'
                }`}
              >
                <span className="font-bold text-white block">🛍️ Buy Software</span>
                <span className="text-[10px] text-slate-300">Discover tools & SaaS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  role === 'CREATOR'
                    ? 'bg-white/20 border-cyan-400 shadow-glow-cyan text-white font-bold'
                    : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/15'
                }`}
              >
                <span className="font-bold text-white block">👨‍💻 Sell & Publish</span>
                <span className="text-[10px] text-slate-300">Manage releases & lifecycle</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-white/90 font-semibold block mb-1.5 text-xs">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input-transparent font-medium"
                required
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 glass-btn-glow font-bold text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-200/80 relative z-10">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-300 hover:text-white underline font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

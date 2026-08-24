import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { Background3D } from '../components/Background3D.js';
import { Layers, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Background3D variant="BUYER" />

      <div className="relative z-10 glass-panel-3d w-full max-w-md rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto shadow-glow-indigo">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Join ProductForge</h2>
          <p className="text-xs text-slate-400">Create an account as a buyer or software creator</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Persona Role Selection */}
          <div>
            <label className="text-slate-200 font-semibold block mb-1.5">I want to:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  role === 'CUSTOMER'
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-glow-indigo'
                    : 'bg-slate-950/80 border-white/10 hover:border-white/20 text-slate-400'
                }`}
              >
                <span className="font-bold text-white block">🛍️ Buy Software</span>
                <span className="text-[10px] text-slate-400">Discover tools & SaaS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  role === 'CREATOR'
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-glow-indigo'
                    : 'bg-slate-950/80 border-white/10 hover:border-white/20 text-slate-400'
                }`}
              >
                <span className="font-bold text-white block">👨‍💻 Sell & Publish</span>
                <span className="text-[10px] text-slate-400">Manage releases & lifecycle</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-200 font-semibold block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl glass-input-3d text-white font-medium"
                required
              />
            </div>
          </div>

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
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

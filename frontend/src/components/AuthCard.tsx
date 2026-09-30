import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { 
  Layers, Lock, Mail, User, ArrowRight, ArrowLeft, Sparkles, 
  ShieldCheck, Cpu, Zap, Package, Key, Activity, CheckCircle2 
} from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
}

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname.includes('register') ? 'register' : initialMode
  );

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CUSTOMER');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Sync mode with browser back/forward navigation
  useEffect(() => {
    if (location.pathname.includes('register') && mode !== 'register') {
      setMode('register');
    } else if (location.pathname.includes('login') && mode !== 'login') {
      setMode('login');
    }
  }, [location.pathname]);

  const switchMode = (newMode: 'login' | 'register') => {
    if (newMode === mode) return;
    setMode(newMode);
    setLoginError(null);
    setRegError(null);
    window.history.replaceState(null, '', newMode === 'register' ? '/register' : '/login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
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
      setLoginError(err.response?.data?.error?.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;

    setRegLoading(true);
    setRegError(null);
    try {
      const res = await api.post('/auth/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole
      });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        if (regRole === 'CREATOR') {
          navigate('/creator');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setRegError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'customer' | 'creator' | 'admin') => {
    if (role === 'customer') {
      setLoginEmail('jordan@buyer.com');
      setLoginPassword('Password123!');
    } else if (role === 'creator') {
      setLoginEmail('alex@forgeflow.dev');
      setLoginPassword('Password123!');
    } else {
      setLoginEmail('admin@productforge.io');
      setLoginPassword('Password123!');
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-[#060B18] bg-tech-grid">
      {/* ─── OPTION A: DYNAMIC NEON PIPELINE AMBIENCE ─── */}
      
      {/* Neon Atmosphere Glow 1 (Top Left / Right) */}
      <div 
        className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ease-in-out ${
          isLogin 
            ? 'top-[-80px] left-[-80px] bg-cyan-500/25' 
            : 'top-[-60px] right-[-60px] bg-purple-600/30'
        }`} 
      />

      {/* Neon Atmosphere Glow 2 (Bottom Right / Left) */}
      <div 
        className={`absolute w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none transition-all duration-1000 ease-in-out ${
          isLogin 
            ? 'bottom-[-100px] right-[-100px] bg-indigo-600/30' 
            : 'bottom-[-100px] left-[-100px] bg-amber-500/20'
        }`} 
      />

      {/* Decorative Circuit Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-slate-600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" strokeWidth="0.5" />
            <circle cx="60" cy="0" r="1.5" className={isLogin ? 'fill-cyan-400' : 'fill-purple-400'} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Subtle Depth Overlay */}
      <div className="absolute inset-0 bg-[#060B18]/50 backdrop-blur-[1px] pointer-events-none" />

      {/* ─── DUAL-SIDED SLIDING CONTAINER ─── */}
      <div className="relative z-10 w-full max-w-4xl min-h-[620px] rounded-3xl border border-white/15 bg-slate-950/70 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col md:flex-row transition-all duration-500">
        
        {/* ============================================================ */}
        {/* LEFT SIDE: SIGN IN FORM                                      */}
        {/* ============================================================ */}
        <div 
          className={`w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between transition-all duration-700 ease-in-out ${
            isLogin 
              ? 'opacity-100 translate-x-0 pointer-events-auto z-10' 
              : 'opacity-0 md:opacity-30 md:-translate-x-12 pointer-events-none z-0 hidden md:flex'
          }`}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Authentication Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                Sign In
              </h2>
              <p className="text-xs text-slate-400">
                Enter your credentials to access your dashboard & software products
              </p>
            </div>

            {/* Quick Demo Autofill Bar */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
              <span className="text-[10px] text-cyan-300/80 font-mono block uppercase text-center tracking-wider font-semibold">
                ⚡ Quick Demo Auto-Fill:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer')}
                  className="py-1.5 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/10 text-[11px] font-bold text-slate-200 text-center transition-all cursor-pointer hover:text-white"
                >
                  🛍️ Buyer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('creator')}
                  className="py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-[11px] font-bold text-amber-300 text-center transition-all cursor-pointer"
                >
                  👨‍💻 Creator
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 text-center transition-all cursor-pointer"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-medium">
                {loginError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-xs">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-xs">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loginLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Switch Link */}
          <div className="pt-4 text-center md:hidden">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-cyan-300 font-bold underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDE: SIGN UP FORM                                     */}
        {/* ============================================================ */}
        <div 
          className={`w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between transition-all duration-700 ease-in-out ${
            !isLogin 
              ? 'opacity-100 translate-x-0 pointer-events-auto z-10' 
              : 'opacity-0 md:opacity-30 md:translate-x-12 pointer-events-none z-0 hidden md:flex'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> New Account Registration
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-400">
                Join ProductForge as a customer or software creator
              </p>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-medium">
                {regError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {/* Persona Selector */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-xs">I want to:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegRole('CUSTOMER')}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      regRole === 'CUSTOMER'
                        ? 'bg-purple-600/20 border-purple-400 shadow-glow-purple text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-bold text-white block text-xs">🛍️ Buy Software</span>
                    <span className="text-[10px] text-slate-400">Discover tools & SaaS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('CREATOR')}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      regRole === 'CREATOR'
                        ? 'bg-amber-500/20 border-amber-400 shadow-glow-amber text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-bold text-white block text-xs">👨‍💻 Sell & Publish</span>
                    <span className="text-[10px] text-slate-400">Releases & telemetry</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-xs">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Alex Mercer"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-purple-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-xs">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-purple-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-xs">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-purple-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {regLoading ? 'Registering...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Switch Link */}
          <div className="pt-4 text-center md:hidden">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-purple-300 font-bold underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SLIDING OVERLAY PANEL (DESKTOP)                              */}
        {/* Shifts position between Left (SignUp) and Right (SignIn)     */}
        {/* Shifts colors between Cyan/Indigo and Violet/Amber           */}
        {/* ============================================================ */}
        <div 
          className={`hidden md:flex absolute top-0 bottom-0 w-1/2 z-20 transition-all duration-700 ease-in-out p-10 flex-col justify-between text-white overflow-hidden ${
            isLogin 
              ? 'left-1/2 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 border-l border-cyan-500/30' 
              : 'left-0 bg-gradient-to-br from-purple-950 via-slate-950 to-amber-950 border-r border-amber-500/30'
          }`}
        >
          {/* Ambient Glow Inside Overlay */}
          <div 
            className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isLogin ? 'bg-cyan-500/30' : 'bg-purple-500/30'
            }`} 
          />
          <div 
            className={`absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isLogin ? 'bg-indigo-500/30' : 'bg-amber-500/25'
            }`} 
          />

          {/* Top Branding / Mode Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-700 ${
                  isLogin 
                    ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-cyan-500/30' 
                    : 'bg-gradient-to-tr from-purple-600 to-amber-500 shadow-purple-500/30'
                }`}
              >
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-sm font-display tracking-wider">ProductForge</span>
            </div>

            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
              {isLogin ? 'BUYER & MAKER' : 'CREATOR CLOUD'}
            </span>
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 space-y-6">
            {isLogin ? (
              /* ─── WHEN SITTING ON RIGHT (PROMPTING TO REGISTER) ─── */
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-extrabold font-display leading-tight">
                  New to ProductForge?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm font-light">
                  Join hundreds of software creators and engineers discovering, licensing, and deploying verified SemVer releases, developer tools, and microservices.
                </p>

                <div className="space-y-2 pt-2 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Instant Cryptographic License Key Issuance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SemVer Automated Binary Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Protected Cloud Entitlements</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-cyan-400/50 hover:border-cyan-300 text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer group"
                  >
                    <span>Create An Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              /* ─── WHEN SITTING ON LEFT (PROMPTING TO LOGIN) ─── */
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-extrabold font-display leading-tight">
                  Welcome Back Creator!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm font-light">
                  Already forged software on the platform? Sign in to monitor your release lifecycles, manage GitHub repository sync, and inspect live revenue telemetry.
                </p>

                <div className="space-y-2 pt-2 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-Time Sales & Revenue Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>GitHub Release Synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Customer Entitlements Management</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-purple-400/50 hover:border-purple-300 text-white font-bold text-xs shadow-glow-purple transition-all flex items-center gap-2 cursor-pointer group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Return to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security / Architecture Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>ProductForge Core v2.2</span>
            <span>Modular Monolith Architecture</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthCard;

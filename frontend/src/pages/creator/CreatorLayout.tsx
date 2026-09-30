import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Background3D } from '../../components/Background3D.js';
import { 
  LayoutDashboard, Package, PlusCircle, ShoppingCart, BarChart3, 
  Github, Settings, LogOut, Layers, Sparkles, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { GitHubConnectionStatus } from '../../types/index.js';

interface CreatorLayoutProps {
  children: React.ReactNode;
}

export const CreatorLayout: React.FC<CreatorLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [ghStatus, setGhStatus] = useState<GitHubConnectionStatus | null>(null);

  useEffect(() => {
    fetchGitHubStatus();
  }, []);

  const fetchGitHubStatus = async () => {
    try {
      const res = await api.get('/github/status');
      if (res.data.success) {
        setGhStatus(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  const navItems = [
    { label: 'Overview', path: '/creator/dashboard', icon: LayoutDashboard },
    { label: 'My Products', path: '/creator/products', icon: Package },
    { label: 'Create Product', path: '/creator/products/new', icon: PlusCircle },
    { label: 'Orders & Sales', path: '/creator/orders', icon: ShoppingCart },
    { label: 'Analytics', path: '/creator/analytics', icon: BarChart3 }
  ];

  return (
    <div className="relative min-h-screen bg-[#070C18] text-slate-100 selection:bg-indigo-500 selection:text-white flex">
      {/* 3D WebGL Background */}
      <Background3D variant="CREATOR" />

      {/* Sidebar */}
      <aside className="relative z-20 w-64 border-r border-slate-800/80 bg-[#0B1326]/90 backdrop-blur-xl flex flex-col justify-between hidden md:flex min-h-screen">
        <div className="p-6 space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-glow-indigo flex items-center justify-center">
              <div className="w-full h-full bg-[#0B1326] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-sm font-display text-white tracking-wide">ProductForge</h2>
              <p className="text-[10px] text-cyan-400 font-mono font-medium">CREATOR CONTROL CENTER</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/creator/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-glow-indigo'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                </Link>
              );
            })}
          </nav>

          <hr className="border-slate-800/80" />

          {/* GitHub Connection Badge */}
          <div className="glass-panel-3d p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-cyan-400" /> GitHub Account
              </span>
              {ghStatus?.isConnected ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-medium border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-medium border border-amber-500/20">
                  Not Linked
                </span>
              )}
            </div>
            {ghStatus?.isConnected ? (
              <p className="text-[10px] text-slate-400 font-mono truncate">
                @{ghStatus.connection?.githubUsername}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">
                Link GitHub to sync releases & automated deployments.
              </p>
            )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070C18]/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Mobile Bar */}
        <header className="md:hidden border-b border-slate-800 bg-[#0B1326]/90 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white">ProductForge Creator</span>
          </div>
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="p-2 text-slate-400 hover:text-white">
                <item.icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};

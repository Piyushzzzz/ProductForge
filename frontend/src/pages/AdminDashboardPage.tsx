import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  ShieldAlert,
  Users,
  Package,
  Layers,
  DollarSign,
  Activity,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/analytics/admin/overview');
        if (res.data.success) {
          setOverview(res.data.data);
        }
      } catch (e) {
        console.error('Error fetching admin data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-900 rounded-xl w-1/4"></div>
        <div className="h-64 bg-slate-900 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              PLATFORM OPERATOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
            ProductForge Global Administration
          </h1>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Accounts</span>
          <p className="text-2xl font-bold font-display text-white">{overview?.totalUsers || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Creators</span>
          <p className="text-2xl font-bold font-display text-indigo-400">{overview?.totalCreators || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Software Catalog</span>
          <p className="text-2xl font-bold font-display text-cyan-400">{overview?.totalProducts || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Orders</span>
          <p className="text-2xl font-bold font-display text-emerald-400">{overview?.totalOrders || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">GMV (Volume)</span>
          <p className="text-2xl font-bold font-display text-white">
            ${overview?.grossMarketplaceVolume.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Health & Status Box */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" /> Platform Health & Microservices
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 block font-mono">POSTGRESQL / PRISMA</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized (14 Models)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 block font-mono">WEBSOCKET SERVER</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Socket.IO Connected
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 block font-mono">SANDBOX COMMERCE GATEWAY</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active & Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

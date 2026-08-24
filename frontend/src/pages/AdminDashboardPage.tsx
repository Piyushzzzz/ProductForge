import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Background3D } from '../components/Background3D.js';
import { Admin3DGlobe } from '../components/Admin3DGlobe.js';
import { TiltCard } from '../components/TiltCard.js';
import { 
  ShieldCheck, Activity, Users, Package, DollarSign, Server, Key, AlertTriangle, CheckCircle2, Sparkles, Lock 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<{
    totalUsers: number;
    totalCreators: number;
    totalProducts: number;
    totalOrders: number;
    totalGMV: number;
    activeEntitlements: number;
    systemHealth: string;
    recentUsers: any[];
    recentProducts: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/admin/overview');
      if (res.data.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D WebGL Background — ADMIN Variant (Emerald & Crimson) */}
      <Background3D variant="ADMIN" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-3d border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-glow-emerald mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> ProductForge Global Cyber Command
            </div>
            <h1 className="text-3xl font-extrabold font-display text-white">Platform Administrator Control Center</h1>
            <p className="text-xs text-slate-400">System health monitoring, catalog oversight, user roles, and GMV telemetry</p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            System Status: 100% Operational
          </div>
        </div>

        {/* 3D Node Globe & Top Security Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left: 3D Command Globe */}
          <div className="glass-panel-3d rounded-3xl p-6 border border-emerald-500/20 flex flex-col items-center text-center space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono">
              <Server className="w-4 h-4 text-emerald-400" /> Live Cluster Security Sphere
            </div>
            <Admin3DGlobe />
            <p className="text-[11px] text-slate-400 font-mono">
              Real-time node telemetry & cryptographic entitlement verification
            </p>
          </div>

          {/* Right: 4 3D Command Stat Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TiltCard>
              <div className="glass-panel-3d rounded-2xl p-5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Gross Platform GMV</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-white">
                  ${overview ? overview.totalGMV.toFixed(2) : '0.00'}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All sandbox transactions verified
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Total Platform Users</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-cyan-300">
                  {overview ? overview.totalUsers : 0}
                </p>
                <p className="text-[10px] text-slate-400">
                  {overview ? overview.totalCreators : 0} registered creators
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Active Software Licenses</span>
                  <Key className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-indigo-300">
                  {overview ? overview.activeEntitlements : 0}
                </p>
                <p className="text-[10px] text-indigo-400 font-medium">Active entitlement keys</p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Catalog Digital Products</span>
                  <Package className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-white">
                  {overview ? overview.totalProducts : 0}
                </p>
                <p className="text-[10px] text-slate-400">Across all categories</p>
              </div>
            </TiltCard>
          </div>

        </div>

        {/* Global Catalog Overview Table */}
        <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" /> Global Product Catalog Oversight
            </h3>
            <span className="text-xs text-slate-400 font-mono">Catalog Admin View</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Creator</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Lifecycle Status</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {(!overview?.recentProducts || overview.recentProducts.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  overview.recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-white">{p.title}</td>
                      <td className="p-3 text-slate-400">{p.creator?.name}</td>
                      <td className="p-3 text-cyan-300">{p.category?.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">{p._count?.orderItems || 0}</td>
                      <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Account Moderation Registry */}
        <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Platform User Account Registry
            </h3>
            <span className="text-xs text-slate-400 font-mono">User Moderation</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Platform Role</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {(!overview?.recentUsers || overview.recentUsers.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  overview.recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-white">{u.name}</td>
                      <td className="p-3 text-slate-400">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : u.role === 'CREATOR'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-900 text-slate-300 border border-white/10'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

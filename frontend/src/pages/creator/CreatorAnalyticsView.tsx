import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { BarChart3, Activity, Download, Key, DollarSign, Package } from 'lucide-react';
import { TelemetryChart } from '../../components/TelemetryChart.js';

export const CreatorAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-xs gap-2">
        <Activity className="w-4 h-4 animate-spin text-cyan-400" />
        <span>Calculating creator telemetry analytics...</span>
      </div>
    );
  }

  const overview = analytics?.overview || {
    views: 0,
    downloads: 0,
    purchases: 0,
    revenue: 0,
    conversionRate: '0.00%'
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white">Platform Analytics & Telemetry</h1>
        <p className="text-xs text-slate-400">Deep telemetry insight into product view conversions, downloads, and revenue performance</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel-3d rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Marketplace Views</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-300">{overview.views.toLocaleString()}</p>
        </div>

        <div className="glass-panel-3d rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Completed Purchases</span>
            <Key className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-indigo-300">{overview.purchases.toLocaleString()}</p>
        </div>

        <div className="glass-panel-3d rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Package Downloads</span>
            <Download className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">{overview.downloads.toLocaleString()}</p>
        </div>

        <div className="glass-panel-3d rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-300">₹{overview.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="glass-panel-3d rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-display">Per-Product Performance Analytics</h3>
        {analytics?.productBreakdown && analytics.productBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] font-mono border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-3 px-4">Product Title</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Purchases</th>
                  <th className="py-3 px-4 text-right">Downloads</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {analytics.productBreakdown.map((p: any) => (
                  <tr key={p.productId} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">{p.title}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{p.views}</td>
                    <td className="py-3.5 px-4 text-right text-indigo-300">{p.purchases}</td>
                    <td className="py-3.5 px-4 text-right text-purple-300">{p.downloads}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">₹{p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-8 text-center">No telemetry data recorded yet.</p>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { TiltCard } from '../../components/TiltCard.js';
import { TelemetryChart } from '../../components/TelemetryChart.js';
import { 
  DollarSign, Download, Key, Package, Plus, Sparkles, Activity, 
  ArrowUpRight, ShieldCheck, CheckCircle2, FileText, ShoppingCart
} from 'lucide-react';

export const CreatorDashboardView: React.FC = () => {
  const [data, setData] = useState<{
    summary: {
      totalProducts: number;
      publishedProducts: number;
      totalCustomers: number;
      totalOrders: number;
      totalRevenue: number;
      totalDownloads: number;
    };
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      productName: string;
      customerName: string;
      customerEmail: string;
      price: number;
      status: string;
      createdAt: string;
    }>;
  } | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/creator/dashboard'),
        api.get('/creator/analytics')
      ]);

      if (dashRes.data.success) setData(dashRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-xs gap-2">
        <Activity className="w-4 h-4 animate-spin text-cyan-400" />
        <span>Loading Creator Metrics...</span>
      </div>
    );
  }

  const summary = data?.summary || {
    totalProducts: 0,
    publishedProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalDownloads: 0
  };

  return (
    <div className="space-y-8">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-3d border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-glow-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ProductForge Creator Studio
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Creator Dashboard</h1>
          <p className="text-xs text-slate-400">Live telemetry, revenue metrics, and order streams</p>
        </div>

        <Link
          to="/creator/products/new"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Software Product
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <TiltCard>
          <div className="glass-panel-3d rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold font-mono text-white">
              ₹{summary.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Sandbox
            </p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-panel-3d rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Products</span>
              <Package className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold font-mono text-indigo-300">
              {summary.totalProducts}
            </p>
            <p className="text-[10px] text-slate-400">
              {summary.publishedProducts} Published
            </p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-panel-3d rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Customers</span>
              <Key className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold font-mono text-cyan-300">
              {summary.totalCustomers}
            </p>
            <p className="text-[10px] text-cyan-400 font-medium">Active Entitlements</p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-panel-3d rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Orders</span>
              <ShoppingCart className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold font-mono text-white">
              {summary.totalOrders}
            </p>
            <p className="text-[10px] text-slate-400">Completed Sales</p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-panel-3d rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Downloads</span>
              <Download className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold font-mono text-purple-300">
              {summary.totalDownloads}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Installer Packages</p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-panel-3d rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Conversion</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold font-mono text-emerald-300">
              {analytics?.overview?.conversionRate || '0.00%'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Views to Purchase</p>
          </div>
        </TiltCard>
      </div>

      {/* Telemetry Breakdown & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Analytics Breakdown Table */}
        <div className="lg:col-span-2 glass-panel-3d rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Software Product Performance
            </h3>
            <Link to="/creator/products" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {analytics?.productBreakdown && analytics.productBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold text-right">Views</th>
                    <th className="py-3 px-4 font-semibold text-right">Purchases</th>
                    <th className="py-3 px-4 font-semibold text-right">Downloads</th>
                    <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {analytics.productBreakdown.map((p: any) => (
                    <tr key={p.productId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-cyan-400" />
                        <Link to={`/creator/products/${p.productId}`} className="hover:text-cyan-300 underline underline-offset-2">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300">{p.views.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right text-indigo-300 font-semibold">{p.purchases}</td>
                      <td className="py-3.5 px-4 text-right text-purple-300">{p.downloads}</td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">₹{p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-600" />
              <p>No product performance data yet.</p>
              <Link to="/creator/products/new" className="text-indigo-400 hover:underline">
                + Create your first software product
              </Link>
            </div>
          )}
        </div>

        {/* Recent Orders List */}
        <div className="glass-panel-3d rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" /> Recent Sales
            </h3>
            <Link to="/creator/orders" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              All Orders
            </Link>
          </div>

          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{order.productName}</p>
                    <p className="text-[10px] text-slate-400">{order.customerName} • #{order.orderNumber}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-400">₹{order.price.toLocaleString()}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              <p>No orders received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Product, ProductStatus } from '../types/index.js';
import { LifecycleBadge } from '../components/LifecycleBadge.js';
import { TelemetryChart } from '../components/TelemetryChart.js';
import { Lifecycle3DPipeline } from '../components/Lifecycle3DPipeline.js';
import { Background3D } from '../components/Background3D.js';
import { TiltCard } from '../components/TiltCard.js';
import { 
  Plus, Edit, Upload, Key, DollarSign, Download, Package, Activity, 
  Sparkles, Layers, ArrowUpRight, ShieldCheck, FileText, CheckCircle2 
} from 'lucide-react';

export const CreatorDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalRevenue: number;
    totalDownloads: number;
    totalProducts: number;
    activeLicenses: number;
    monthlyRevenueTimeline: { date: string; value: number }[];
    monthlyDownloadsTimeline: { date: string; value: number }[];
  } | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  // New Release Modal State
  const [selectedProductForRelease, setSelectedProductForRelease] = useState<Product | null>(null);
  const [versionNumber, setVersionNumber] = useState('v1.0.0');
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, analyticsRes, custRes] = await Promise.all([
        api.get('/products/creator/my-products'),
        api.get('/analytics/creator/summary'),
        api.get('/entitlements/creator/customers')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) {
      console.error('Failed to load creator studio data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRelease) return;

    setPublishing(true);
    try {
      const releaseRes = await api.post(`/releases/products/${selectedProductForRelease.id}`, {
        versionNumber,
        releaseTitle,
        releaseNotes
      });

      if (releaseRes.data.success && fileToUpload) {
        const versionId = releaseRes.data.data.id;
        const formData = new FormData();
        formData.append('file', fileToUpload);

        await api.post(`/releases/${versionId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('Release successfully published and customer notifications broadcasted!');
      setSelectedProductForRelease(null);
      setFileToUpload(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Release publish failed.');
    } finally {
      setPublishing(false);
    }
  };

  // Compute status counts for 3D pipeline
  const statusCounts = {
    DRAFT: products.filter(p => p.status === 'DRAFT').length,
    BETA: products.filter(p => p.status === 'BETA').length,
    PUBLISHED: products.filter(p => p.status === 'PUBLISHED').length,
    ARCHIVED: products.filter(p => p.status === 'ARCHIVED').length
  };

  const filteredProducts = filterStatus === 'ALL'
    ? products
    : products.filter(p => p.status === filterStatus);

  return (
    <div className="relative min-h-screen">
      {/* 3D WebGL Background */}
      <Background3D />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-3d border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-glow-cyan mb-2">
              <Sparkles className="w-3.5 h-3.5" /> ProductForge Creator Studio
            </div>
            <h1 className="text-3xl font-extrabold font-display text-white">Software Lifecycle Studio</h1>
            <p className="text-xs text-slate-400">Manage releases, view telemetry analytics, and issue customer licenses</p>
          </div>

          <Link
            to="/creator/products/new"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Create New Digital Product
          </Link>
        </div>

        {/* Top 4 Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <TiltCard>
            <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Gross Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                ${analytics ? analytics.totalRevenue.toFixed(2) : '0.00'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Real-time sandbox payouts
              </p>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Binary Downloads</span>
                <Download className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-cyan-300">
                {analytics ? analytics.totalDownloads : 0}
              </p>
              <p className="text-[10px] text-slate-400">Entitlement verified streams</p>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Customer Licenses</span>
                <Key className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-indigo-300">
                {analytics ? analytics.activeLicenses : 0}
              </p>
              <p className="text-[10px] text-indigo-400 font-medium">PF-XXXX-XXXX issued</p>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Products</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                {analytics ? analytics.totalProducts : 0}
              </p>
              <p className="text-[10px] text-slate-400">Drafts & Live catalog</p>
            </div>
          </TiltCard>
        </div>

        {/* Telemetry Revenue & Download Graphs */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TiltCard>
              <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" /> Monthly Revenue Timeline ($)
                  </h3>
                  <span className="text-[10px] text-indigo-400 font-mono">Live Ingestion</span>
                </div>
                <TelemetryChart data={analytics.monthlyRevenueTimeline} color="#6366F1" />
              </div>
            </TiltCard>

            <TiltCard>
              <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" /> Monthly Binary Downloads
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">Live Ingestion</span>
                </div>
                <TelemetryChart data={analytics.monthlyDownloadsTimeline} color="#22D3EE" />
              </div>
            </TiltCard>
          </div>
        )}

        {/* 3D Interactive Lifecycle Pipeline */}
        <div className="glass-panel-3d rounded-3xl p-6 border border-white/10">
          <Lifecycle3DPipeline
            activeStatus={filterStatus}
            onStatusChange={(st) => setFilterStatus(st)}
            counts={statusCounts}
          />
        </div>

        {/* Product Catalog List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display">Your Software Catalog</h3>
            <span className="text-xs text-slate-400">Showing {filteredProducts.length} products</span>
          </div>

          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="glass-panel-3d rounded-2xl p-8 text-center text-xs text-slate-400">
                No products found in stage <span className="font-mono text-cyan-300">{filterStatus}</span>.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="glass-panel-3d rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex-shrink-0">
                      <img src={product.logoUrl} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm font-display">{product.title}</h4>
                        <LifecycleBadge status={product.status} />
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{product.tagline}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                        <span>Category: {product.category?.name}</span>
                        <span>•</span>
                        <span>Orders: {product._count?.orderItems || 0}</span>
                        <span>•</span>
                        <span>Entitlements: {product._count?.entitlements || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => setSelectedProductForRelease(product)}
                      className="px-3 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" /> Publish Release
                    </button>

                    <Link
                      to={`/creator/products/${product.id}/edit`}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer License Key Registry */}
        <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> Customer License Entitlement Registry
            </h3>
            <span className="text-xs text-slate-400 font-mono">{customers.length} Active Licenses</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Licensed Product</th>
                  <th className="p-3">License Key</th>
                  <th className="p-3">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      No licenses issued yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-white">{c.customerName}</td>
                      <td className="p-3 text-slate-400">{c.customerEmail}</td>
                      <td className="p-3 text-indigo-300">{c.productTitle}</td>
                      <td className="p-3 text-cyan-300 font-mono font-bold">{c.licenseKey}</td>
                      <td className="p-3 text-slate-500">{new Date(c.grantedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Release Publisher Modal */}
      {selectedProductForRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-3d w-full max-w-lg rounded-3xl p-6 border border-white/15 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white font-display">
                Publish Release for {selectedProductForRelease.title}
              </h3>
              <button
                onClick={() => setSelectedProductForRelease(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishRelease} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">SemVer Version Number</label>
                <input
                  type="text"
                  placeholder="v1.1.0"
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input-3d text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Release Title</label>
                <input
                  type="text"
                  placeholder="Major Feature Update & Performance Boost"
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input-3d text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Release Notes & Changelog</label>
                <textarea
                  rows={3}
                  placeholder="- Added WebSocket notification pipeline&#10;- Fixed entitlement access bug"
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input-3d text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Upload Binary Asset (.zip, .exe, .tar.gz)</label>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 rounded-xl glass-input-3d text-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProductForRelease(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-glow-indigo transition-all"
                >
                  {publishing ? 'Publishing...' : 'Publish Release & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

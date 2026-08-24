import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { LifecycleBadge } from '../components/LifecycleBadge.js';
import { TelemetryChart } from '../components/TelemetryChart.js';
import {
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Download,
  Users,
  Eye,
  Settings,
  GitBranch,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Sparkles,
  Edit,
  Upload
} from 'lucide-react';

export const CreatorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics' | 'customers' | 'releases'>('pipeline');
  const [loading, setLoading] = useState<boolean>(true);

  // New release modal state
  const [showReleaseModal, setShowReleaseModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [releaseVersion, setReleaseVersion] = useState<string>('v1.3.0');
  const [releaseTitle, setReleaseTitle] = useState<string>('');
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [releaseChangelog, setReleaseChangelog] = useState<string>('');
  const [releaseFile, setReleaseFile] = useState<File | null>(null);
  const [submittingRelease, setSubmittingRelease] = useState<boolean>(false);

  const fetchCreatorData = async () => {
    setLoading(true);
    try {
      const [prodRes, analyticsRes, custRes] = await Promise.all([
        api.get('/products/my-products'),
        api.get('/analytics/creator/summary'),
        api.get('/entitlements/creator/customers')
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
        if (prodRes.data.data.length > 0) {
          setSelectedProductId(prodRes.data.data[0].id);
        }
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (custRes.data.success) {
        setCustomers(custRes.data.data);
      }
    } catch (e) {
      console.error('Error fetching creator dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const handleUpdateStatus = async (productId: string, newStatus: ProductStatus) => {
    try {
      const res = await api.patch(`/products/${productId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchCreatorData();
      }
    } catch (e) {
      alert('Failed to update product status.');
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !releaseVersion || !releaseTitle) return;

    setSubmittingRelease(true);
    try {
      const res = await api.post(`/products/${selectedProductId}/releases`, {
        versionNumber: releaseVersion,
        releaseTitle,
        releaseNotes,
        changelog: releaseChangelog
      });

      if (res.data.success) {
        const versionId = res.data.data.id;
        // Upload file if selected
        if (releaseFile) {
          const formData = new FormData();
          formData.append('file', releaseFile);
          await api.post(`/releases/${versionId}/files`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        setShowReleaseModal(false);
        setReleaseTitle('');
        setReleaseNotes('');
        setReleaseChangelog('');
        setReleaseFile(null);
        fetchCreatorData();
      }
    } catch (e) {
      alert('Failed to create release.');
    } finally {
      setSubmittingRelease(false);
    }
  };

  // Group products by lifecycle state for pipeline
  const draftProducts = products.filter((p) => p.status === 'DRAFT');
  const betaProducts = products.filter((p) => p.status === 'BETA');
  const publishedProducts = products.filter((p) => p.status === 'PUBLISHED');
  const archivedProducts = products.filter((p) => p.status === 'ARCHIVED');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-900 rounded-xl w-1/4"></div>
        <div className="h-96 bg-slate-900 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
              CREATOR STUDIO
            </span>
            <span className="text-xs text-slate-400">• {products.length} Total Software Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
            Product Lifecycle Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReleaseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-cyanGlow transition-all flex items-center gap-1.5"
          >
            <GitBranch className="w-4 h-4" /> Publish Release
          </button>
          <Link
            to="/creator/products/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-cyan-300" /> New Product
          </Link>
        </div>
      </div>

      {/* Top Stat Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-display text-white">
            ${analytics?.totalRevenue.toLocaleString() || '0.00'}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium mt-1 block">Verified Marketplace Sales</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Total Customers</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black font-display text-white">
            {analytics?.totalPurchases || 0}
          </p>
          <span className="text-[10px] text-indigo-300 font-medium mt-1 block">Active License Holders</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Binary Downloads</span>
            <Download className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black font-display text-cyan-400">
            {analytics?.totalDownloads || 0}
          </p>
          <span className="text-[10px] text-cyan-300 font-medium mt-1 block">Protected Delivery Streams</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-display text-amber-400">
            {analytics?.conversionRate || '0.0%'}
          </p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            {analytics?.totalViews || 0} Telemetry Impressions
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Product Lifecycle Pipeline
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Revenue & Telemetry Charts
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'customers'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Customer License Entitlements ({customers.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT LIFECYCLE PIPELINE (Design B Studio Matrix) */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Column 1: DRAFT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <span className="text-xs font-mono font-bold text-amber-400">1. DRAFT ({draftProducts.length})</span>
              <span className="text-[10px] text-slate-500">In Development</span>
            </div>

            <div className="space-y-3">
              {draftProducts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No draft products
                </div>
              ) : (
                draftProducts.map((p) => (
                  <div key={p.id} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                      <Link to={`/creator/products/${p.id}/edit`} className="text-slate-400 hover:text-white">
                        <Edit className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{p.tagline}</p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'BETA')}
                        className="text-[10px] font-semibold text-indigo-300 hover:underline"
                      >
                        Promote to Beta →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: BETA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
              <span className="text-xs font-mono font-bold text-indigo-400">2. BETA ({betaProducts.length})</span>
              <span className="text-[10px] text-slate-500">Testing & Feedback</span>
            </div>

            <div className="space-y-3">
              {betaProducts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No beta products
                </div>
              ) : (
                betaProducts.map((p) => (
                  <div key={p.id} className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                      <Link to={`/creator/products/${p.id}/edit`} className="text-slate-400 hover:text-white">
                        <Edit className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{p.tagline}</p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'DRAFT')}
                        className="text-[10px] text-slate-500 hover:text-slate-400"
                      >
                        ← Revert
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'PUBLISHED')}
                        className="text-[10px] font-semibold text-emerald-400 hover:underline"
                      >
                        Publish Live →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: PUBLISHED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
              <span className="text-xs font-mono font-bold text-emerald-400">3. PUBLISHED ({publishedProducts.length})</span>
              <span className="text-[10px] text-slate-500">Live on Market</span>
            </div>

            <div className="space-y-3">
              {publishedProducts.map((p) => (
                <div key={p.id} className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                    <Link to={`/products/${p.slug}`} className="text-slate-400 hover:text-cyan-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{p.totalPurchases} sales</span>
                    <span className="text-amber-400">★ {p.averageRating}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'ARCHIVED')}
                      className="text-[10px] text-slate-500 hover:text-red-400"
                    >
                      Archive
                    </button>
                    <Link
                      to={`/creator/products/${p.id}/edit`}
                      className="text-[10px] font-semibold text-cyan-400 hover:underline"
                    >
                      Manage Releases →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: ARCHIVED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-500/30">
              <span className="text-xs font-mono font-bold text-slate-400">4. ARCHIVED ({archivedProducts.length})</span>
              <span className="text-[10px] text-slate-500">End-of-Life</span>
            </div>

            <div className="space-y-3">
              {archivedProducts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No archived products
                </div>
              ) : (
                archivedProducts.map((p) => (
                  <div key={p.id} className="glass-panel p-4 rounded-2xl border border-white/10 opacity-70 space-y-2">
                    <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'DRAFT')}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Restore to Draft
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & TELEMETRY CHARTS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          <TelemetryChart data={analytics.telemetryTimeline} />
        </div>
      )}

      {/* TAB 3: CUSTOMER LICENSE ENTITLEMENTS TABLE */}
      {activeTab === 'customers' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden">
          <h3 className="text-base font-bold font-display text-white mb-4">
            Customer License Registry
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Software Product</th>
                  <th className="pb-3">License Plan</th>
                  <th className="pb-3">License Key</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-medium text-white flex items-center gap-2">
                      <img
                        src={c.customer?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + c.customer?.name}
                        alt=""
                        className="w-6 h-6 rounded-full border border-white/10"
                      />
                      <span>{c.customer?.name}</span>
                    </td>
                    <td className="py-3.5 text-slate-300">{c.product?.title}</td>
                    <td className="py-3.5 font-mono text-cyan-300">{c.orderItem?.pricingPlan?.name || 'Standard'}</td>
                    <td className="py-3.5 font-mono text-indigo-300 bg-slate-900/60 px-2 py-0.5 rounded border border-white/5 inline-block">
                      {c.licenseKey}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Release Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border border-white/10 animate-in fade-in">
            <h3 className="text-lg font-bold font-display text-white mb-1">
              Publish New Version Release
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Distribute updates, attach software binaries, and push notifications to customers.
            </p>

            <form onSubmit={handleCreateRelease} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Software Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.title} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Version Number (SemVer)</label>
                  <input
                    type="text"
                    value={releaseVersion}
                    onChange={(e) => setReleaseVersion(e.target.value)}
                    placeholder="e.g. v1.3.0"
                    className="w-full p-2.5 rounded-xl glass-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Release Title</label>
                  <input
                    type="text"
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    placeholder="e.g. Performance & Security Patch"
                    className="w-full p-2.5 rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Release Notes</label>
                <textarea
                  rows={2}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Summary of improvements for users..."
                  className="w-full p-2.5 rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Changelog (Markdown)</label>
                <textarea
                  rows={3}
                  value={releaseChangelog}
                  onChange={(e) => setReleaseChangelog(e.target.value)}
                  placeholder="- ✨ Added new feature&#10;- ⚡ Improved latency&#10;- 🐛 Fixed bug"
                  className="w-full p-2.5 rounded-xl glass-input font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Upload Binary / ZIP Asset</label>
                <input
                  type="file"
                  onChange={(e) => setReleaseFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 rounded-xl glass-input text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRelease}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-glow"
                >
                  {submittingRelease ? 'Publishing...' : 'Publish Release Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

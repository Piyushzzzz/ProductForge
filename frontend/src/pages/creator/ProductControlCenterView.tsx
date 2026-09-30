import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Product, ProductStatus, PricingPlan, ProductVersion, GitHubRepo, GitHubRelease } from '../../types/index.js';
import { LifecycleBadge } from '../../components/LifecycleBadge.js';
import { 
  Package, Settings, DollarSign, Layers, Github, Upload, Key, BarChart3, 
  Plus, Edit, Check, ArrowLeft, RefreshCw, AlertCircle, ExternalLink, Download, FileText, CheckCircle2, Trash2,
  RotateCcw, GitCompare, History, ShieldAlert, AlertTriangle, ArrowRight, ShieldCheck, FileCode
} from 'lucide-react';

export const ProductControlCenterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'edit' | 'pricing' | 'releases' | 'github' | 'files' | 'customers' | 'analytics'
  >('overview');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    tagline: '',
    description: '',
    demoUrl: '',
    githubRepo: '',
    logoUrl: '',
    bannerUrl: ''
  });

  // Pricing Plan form state
  const [newPlan, setNewPlan] = useState({
    name: 'Pro Plan',
    type: 'ONE_TIME',
    price: 999,
    interval: 'NONE',
    features: 'Full Access, Free Updates, Source Code'
  });
  const [addingPlan, setAddingPlan] = useState(false);

  // Release form state
  const [newRelease, setNewRelease] = useState({
    versionNumber: 'v1.0.0',
    releaseTitle: 'Initial Release',
    releaseNotes: 'Performance updates and core feature set.',
    isBeta: false
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [creatingRelease, setCreatingRelease] = useState(false);

  // Rollback state
  const [rollbackTarget, setRollbackTarget] = useState<ProductVersion | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [rollingBack, setRollingBack] = useState(false);

  // GitHub state
  const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
  const [ghReleases, setGhReleases] = useState<GitHubRelease[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [syncingGh, setSyncingGh] = useState(false);
  const [ghError, setGhError] = useState('');

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        const prod = res.data.data;
        setProduct(prod);
        setEditForm({
          title: prod.title || '',
          tagline: prod.tagline || '',
          description: prod.description || '',
          demoUrl: prod.demoUrl || '',
          githubRepo: prod.githubRepo || '',
          logoUrl: prod.logoUrl || '',
          bannerUrl: prod.bannerUrl || ''
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: ProductStatus) => {
    if (!product) return;
    try {
      const res = await api.patch(`/products/${product.id}/status`, { status: newStatus });
      if (res.data.success) {
        setProduct(prev => prev ? { ...prev, status: newStatus } : null);
        setSuccess(`Product status changed to ${newStatus}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Status update failed.');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      const res = await api.put(`/products/${product.id}`, editForm);
      if (res.data.success) {
        setProduct(res.data.data);
        setSuccess('Product details updated successfully.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Update failed.');
    }
  };

  const handleAddPricingPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setAddingPlan(true);
    try {
      const featureList = newPlan.features.split(',').map(f => f.trim()).filter(Boolean);
      const res = await api.post(`/products/${product.id}/pricing`, {
        name: newPlan.name,
        type: newPlan.type,
        price: Number(newPlan.price),
        interval: newPlan.interval,
        features: featureList
      });

      if (res.data.success) {
        setSuccess('Pricing plan added.');
        fetchProductDetails();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add pricing plan.');
    } finally {
      setAddingPlan(false);
    }
  };

  const handleDeletePricingPlan = async (planId: string) => {
    if (!product) return;
    try {
      await api.delete(`/products/${product.id}/pricing/${planId}`);
      setSuccess('Pricing plan removed.');
      fetchProductDetails();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete plan.');
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setCreatingRelease(true);
    try {
      const releaseRes = await api.post(`/releases/products/${product.id}`, newRelease);
      if (releaseRes.data.success) {
        const versionId = releaseRes.data.data.id;
        if (fileToUpload) {
          const formData = new FormData();
          formData.append('file', fileToUpload);
          await api.post(`/releases/${versionId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        setSuccess('Release published successfully.');
        setFileToUpload(null);
        fetchProductDetails();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to publish release.');
    } finally {
      setCreatingRelease(false);
    }
  };

  const handleRollback = async () => {
    if (!product || !rollbackTarget) return;
    setRollingBack(true);
    try {
      const res = await api.post(`/releases/products/${product.id}/rollback`, {
        targetVersionId: rollbackTarget.id,
        reason: rollbackReason || 'Rolled back to stable version by developer.'
      });
      if (res.data.success) {
        setSuccess(`Successfully rolled back to release ${rollbackTarget.versionNumber}! Customer downloads have been switched.`);
        setRollbackTarget(null);
        setRollbackReason('');
        fetchProductDetails();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Rollback failed.');
    } finally {
      setRollingBack(false);
    }
  };

  const getSemVerDiff = (baseVer: string, targetVer: string) => {
    const parse = (v: string) => {
      const clean = (v || '').replace(/^v/i, '').trim();
      const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
      return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
    };
    const b = parse(baseVer);
    const t = parse(targetVer);
    if (t.major > b.major) return { type: 'MAJOR', label: 'Major Overhaul', color: 'rose', desc: 'Significant architectural update or potential breaking changes' };
    if (t.major < b.major) return { type: 'DOWNGRADE', label: 'Reversion / Downgrade', color: 'amber', desc: 'Lower major version number' };
    if (t.minor > b.minor) return { type: 'MINOR', label: 'Feature Update', color: 'cyan', desc: 'New backwards-compatible feature set' };
    if (t.minor < b.minor) return { type: 'DOWNGRADE', label: 'Minor Downgrade', color: 'amber', desc: 'Lower minor version number' };
    if (t.patch > b.patch) return { type: 'PATCH', label: 'Patch Release', color: 'emerald', desc: 'Bug fixes, optimizations, and performance improvements' };
    if (t.patch < b.patch) return { type: 'DOWNGRADE', label: 'Patch Downgrade', color: 'amber', desc: 'Lower patch version number' };
    return { type: 'SAME', label: 'Identical Tag', color: 'slate', desc: 'Same version number as current release' };
  };

  // GitHub integration actions
  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    setGhError('');
    try {
      const res = await api.get('/github/repositories');
      if (res.data.success) {
        setUserRepos(res.data.data);
      }
    } catch (err: any) {
      setGhError(err.response?.data?.error?.message || 'GitHub not connected or failed to load repos.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleConnectRepo = async (repo: GitHubRepo) => {
    if (!product) return;
    try {
      const res = await api.post(`/github/products/${product.id}/connect`, {
        repoId: repo.id,
        owner: repo.owner,
        repoName: repo.name,
        url: repo.htmlUrl,
        defaultBranch: repo.defaultBranch
      });
      if (res.data.success) {
        setProduct(res.data.data);
        setSuccess(`Connected repository ${repo.fullName}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to connect repository.');
    }
  };

  const handleSyncGitHub = async () => {
    if (!product) return;
    setSyncingGh(true);
    try {
      const res = await api.post(`/github/products/${product.id}/sync`);
      if (res.data.success) {
        setSuccess(`GitHub releases synchronized successfully! (${res.data.data.syncedCount} new releases)`);
        fetchProductDetails();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to sync GitHub releases.');
    } finally {
      setSyncingGh(false);
    }
  };

  // Fetch Customers tab
  const fetchCustomers = async () => {
    if (!product) return;
    setLoadingCustomers(true);
    try {
      const res = await api.get(`/creator/products/${product.id}/customers`);
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'github') fetchGitHubRepos();
    if (activeTab === 'customers') fetchCustomers();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
        <span>Loading Product Control Center...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link to="/creator/products" className="text-xs text-indigo-400 hover:underline">
          Return to My Products
        </Link>
      </div>
    );
  }

  const latestVersion = product.versions && product.versions.length > 0 ? product.versions[0] : null;

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/creator/products')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{product.title}</h1>
                <LifecycleBadge status={product.status} />
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                  {latestVersion ? latestVersion.versionNumber : 'v0.0.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">{product.tagline}</p>
            </div>
          </div>

          {/* Quick Lifecycle Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.status !== 'PUBLISHED' && (
              <button
                onClick={() => handleStatusChange('PUBLISHED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-glow-emerald"
              >
                Publish Product
              </button>
            )}

            {product.status === 'PUBLISHED' && (
              <button
                onClick={() => handleStatusChange('UNPUBLISHED')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all"
              >
                Unpublish
              </button>
            )}

            {product.status !== 'ARCHIVED' && (
              <button
                onClick={() => handleStatusChange('ARCHIVED')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Purchases</span>
            <span className="font-bold text-white text-base">{product.totalPurchases}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Active Entitlements</span>
            <span className="font-bold text-cyan-300 text-base">{product._count?.entitlements || 0}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">GitHub Repo</span>
            <span className="font-bold text-indigo-300 text-base truncate block">{product.githubRepo || 'Not Linked'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Category</span>
            <span className="font-bold text-purple-300 text-base">{product.category?.name || 'General'}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Control Center Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 font-mono text-xs">
        {[
          { key: 'overview', label: 'Overview', icon: Package },
          { key: 'edit', label: 'Product Details', icon: Settings },
          { key: 'pricing', label: 'Pricing Plans', icon: DollarSign },
          { key: 'releases', label: 'Releases', icon: Layers },
          { key: 'github', label: 'GitHub Sync', icon: Github },
          { key: 'files', label: 'Files', icon: Upload },
          { key: 'customers', label: 'Customers', icon: Key },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white font-bold border-t-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel-3d rounded-2xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white font-display">Description</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            <div className="glass-panel-3d rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-display">Version Release History</h3>
              {product.versions && product.versions.length > 0 ? (
                <div className="space-y-3">
                  {product.versions.map((ver) => (
                    <div key={ver.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-300">{ver.versionNumber}</span>
                          <span className="text-white font-sans font-semibold">{ver.releaseTitle}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">{ver.releaseNotes}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ver.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No releases published yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-panel-3d rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-display">Quick Management</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span>Configure Pricing Plans</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => setActiveTab('releases')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span>Create New Release</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </button>
                <button
                  onClick={() => setActiveTab('github')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span>GitHub Repository Settings</span>
                  <Github className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT DETAILS TAB */}
      {activeTab === 'edit' && (
        <form onSubmit={handleUpdateProduct} className="glass-panel-3d rounded-3xl p-8 border border-slate-800 space-y-6 max-w-3xl">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Product Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tagline</label>
            <input
              type="text"
              required
              value={editForm.tagline}
              onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              required
              rows={6}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Demo URL</label>
              <input
                type="url"
                value={editForm.demoUrl}
                onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">GitHub Repo (owner/repo)</label>
              <input
                type="text"
                value={editForm.githubRepo}
                onChange={(e) => setEditForm({ ...editForm, githubRepo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo"
          >
            Save Changes
          </button>
        </form>
      )}

      {/* 3. PRICING PLANS TAB */}
      {activeTab === 'pricing' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.pricingPlans && product.pricingPlans.length > 0 ? (
              product.pricingPlans.map((plan) => {
                const featuresList = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
                return (
                  <div key={plan.id} className="glass-panel-3d rounded-2xl p-6 border border-slate-800 space-y-4 relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-cyan-400 uppercase">{plan.type}</span>
                        <button
                          onClick={() => handleDeletePricingPlan(plan.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-lg font-bold text-white font-display mt-1">{plan.name}</h4>
                      <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                        ₹{plan.price.toLocaleString()}
                        {plan.interval !== 'NONE' && <span className="text-xs text-slate-400 font-sans">/{plan.interval.toLowerCase()}</span>}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-300">
                        {Array.isArray(featuresList) && featuresList.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 col-span-3">No pricing plans created yet. Add one below!</p>
            )}
          </div>

          {/* Add New Pricing Plan Form */}
          <form onSubmit={handleAddPricingPlan} className="glass-panel-3d rounded-3xl p-8 border border-slate-800 space-y-6 max-w-2xl">
            <h3 className="text-sm font-bold text-white font-display">+ Add Pricing Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developer License"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Pricing Model</label>
                <select
                  value={newPlan.type}
                  onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="FREE">FREE</option>
                  <option value="ONE_TIME">ONE_TIME</option>
                  <option value="RECURRING">RECURRING (Subscription)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Price (INR ₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {newPlan.type === 'RECURRING' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Billing Interval</label>
                  <select
                    value={newPlan.interval}
                    onChange={(e) => setNewPlan({ ...newPlan, interval: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Features (Comma separated)</label>
              <input
                type="text"
                placeholder="Full Access, Source Code, Priority Support"
                value={newPlan.features}
                onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={addingPlan}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo"
            >
              {addingPlan ? 'Saving Plan...' : 'Create Pricing Plan'}
            </button>
          </form>
        </div>
      )}

      {/* 4. RELEASES TAB */}
      {/* 4. RELEASES & LIFECYCLE MANAGEMENT TAB */}
      {activeTab === 'releases' && (() => {
        const currentActiveVersion = product.versions?.find(v => v.isCurrent && !v.isRolledBack) || product.versions?.find(v => v.isCurrent);
        const semverAnalysis = currentActiveVersion 
          ? getSemVerDiff(currentActiveVersion.versionNumber, newRelease.versionNumber)
          : { type: 'INITIAL', label: 'Initial Release', color: 'emerald', desc: 'First version published for this product' };

        const currentFile = currentActiveVersion?.files?.[0];
        const newFileSize = fileToUpload?.size || 0;
        const currentFileSize = currentFile?.fileSize || 0;
        const sizeDelta = fileToUpload && currentFile ? (newFileSize - currentFileSize) : null;

        const formatSize = (bytes: number) => {
          if (!bytes || bytes === 0) return '0 B';
          const k = 1024;
          const sizes = ['B', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        return (
          <div className="space-y-8 max-w-4xl">
            {/* Active Release Status Bar */}
            <div className="p-4 rounded-2xl bg-[#0B1326]/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <span className="text-xs text-slate-400 font-mono">Current Live Commercial Release:</span>
                  <p className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    {currentActiveVersion ? (
                      <>
                        <span className="text-cyan-400">{currentActiveVersion.versionNumber}</span> — {currentActiveVersion.releaseTitle}
                        <span className="text-[10px] text-slate-400 font-sans">
                          (Published {new Date(currentActiveVersion.publishedAt).toLocaleDateString()})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500">No releases published yet</span>
                    )}
                  </p>
                </div>
              </div>

              {currentFile && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">Active Customer Download</span>
                  <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 justify-end">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    {currentFile.fileName} ({formatSize(currentFile.fileSize)})
                  </span>
                </div>
              )}
            </div>

            {/* Create Release Form with Live Version Comparison */}
            <form onSubmit={handleCreateRelease} className="glass-panel-3d rounded-3xl p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">+ Publish Next Version</h3>
                  <p className="text-xs text-slate-400">Release updates, automatically compare changes, and deliver binaries</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-mono text-indigo-300">
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>SemVer & Diff Analysis Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">New Version Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v1.1.0 or v2.0.0"
                    value={newRelease.versionNumber}
                    onChange={(e) => setNewRelease({ ...newRelease, versionNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Release Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Performance Enhancements & New API"
                    value={newRelease.releaseTitle}
                    onChange={(e) => setNewRelease({ ...newRelease, releaseTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Release Notes / Changelog *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail added features, fixed bugs, and breaking updates..."
                  value={newRelease.releaseNotes}
                  onChange={(e) => setNewRelease({ ...newRelease, releaseNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    Attach New Version Binary (.zip, .tar.gz, .exe, .dmg)
                  </span>
                  {fileToUpload && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {fileToUpload.name} ({formatSize(fileToUpload.size)})
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              {/* Version Comparison / Diff Preview Card */}
              {currentActiveVersion && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <GitCompare className="w-3.5 h-3.5" /> Version Comparison Analysis
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentActiveVersion.versionNumber} → {newRelease.versionNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        semverAnalysis.type === 'MAJOR' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        semverAnalysis.type === 'MINOR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        semverAnalysis.type === 'PATCH' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {semverAnalysis.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {semverAnalysis.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-500/20 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">Current Active Release</span>
                      <span className="font-mono text-slate-200 font-semibold">{currentActiveVersion.versionNumber}</span>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentActiveVersion.releaseTitle}</p>
                      {currentFile && (
                        <p className="text-[10px] text-cyan-400 font-mono mt-1">Package: {formatSize(currentFile.fileSize)}</p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-900/40 border border-indigo-500/40">
                      <span className="text-[10px] text-indigo-300 font-mono block">Upcoming Release</span>
                      <span className="font-mono text-cyan-300 font-semibold">{newRelease.versionNumber || 'vNext'}</span>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">{newRelease.releaseTitle || 'Untitled Release'}</p>
                      {fileToUpload ? (
                        <p className="text-[10px] text-emerald-400 font-mono mt-1">
                          Package: {formatSize(newFileSize)} {sizeDelta !== null && `(${sizeDelta >= 0 ? '+' : ''}${formatSize(Math.abs(sizeDelta))})`}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic mt-1">No new binary attached</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={creatingRelease}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{creatingRelease ? 'Publishing & Comparing...' : 'Publish Commercial Release'}</span>
              </button>
            </form>

            {/* Release History & Version Rollback Controls */}
            <div className="glass-panel-3d rounded-3xl p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" /> Release Lifecycle History & Rollback Controls
                  </h3>
                  <p className="text-xs text-slate-400">
                    If an update causes regressions or bugs, you can instantly roll back to any previous stable version
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {product.versions?.length || 0} Total Releases
                </span>
              </div>

              {product.versions && product.versions.length > 0 ? (
                <div className="space-y-4">
                  {product.versions.map((ver) => {
                    const isLive = ver.isCurrent && !ver.isRolledBack;
                    const isRolled = ver.isRolledBack;

                    return (
                      <div
                        key={ver.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isLive
                            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glow-emerald'
                            : isRolled
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold font-mono text-cyan-300">
                              {ver.versionNumber}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {ver.releaseTitle}
                            </span>

                            {isLive && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold font-mono uppercase flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Active / Live
                              </span>
                            )}

                            {isRolled && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Rolled Back
                              </span>
                            )}

                            {!isLive && !isRolled && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                                Stable Past Version
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {new Date(ver.publishedAt).toLocaleDateString()}
                            </span>

                            {/* Rollback Action Button */}
                            {!isLive && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRollbackTarget(ver);
                                  setRollbackReason(`Reverting from ${currentActiveVersion?.versionNumber || 'latest'} to stable release ${ver.versionNumber}.`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                                title="Roll back to this stable version"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Roll Back to this Version</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rollback Warning Alert if applicable */}
                        {isRolled && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                            <div>
                              <p className="font-semibold">Version Rolled Back by Developer</p>
                              <p className="text-[11px] text-amber-200/80">
                                {ver.rollbackReason || 'Deactivated due to reported issues. Customers were routed to a stable version.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Release Notes */}
                        <div className="mt-3 text-xs text-slate-300 font-mono bg-slate-950/40 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                          {ver.releaseNotes}
                        </div>

                        {/* Attached Files */}
                        {ver.files && ver.files.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {ver.files.map((file) => (
                              <div key={file.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-[11px] font-mono">
                                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-slate-200 font-semibold">{file.fileName}</span>
                                <span className="text-slate-500">({formatSize(file.fileSize)})</span>
                                <span className="text-[9px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                                  SHA: {file.checksum?.slice(0, 10)}...
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No commercial releases created for this product yet.</p>
              )}
            </div>

            {/* Rollback Confirmation Modal */}
            {rollbackTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="glass-panel-3d rounded-3xl p-6 border border-amber-500/40 max-w-lg w-full space-y-5 bg-[#0B1326] shadow-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-display">
                        Roll Back to Release {rollbackTarget.versionNumber}?
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        This action will immediately deactivate release{' '}
                        <strong className="text-rose-400 font-mono">{currentActiveVersion?.versionNumber || 'current'}</strong>{' '}
                        and restore{' '}
                        <strong className="text-emerald-400 font-mono">{rollbackTarget.versionNumber}</strong> as the live version for all customers.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-200">
                      Rollback Reason (Sent to Entitled Customers & Logged to Telemetry)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Critical runtime regression discovered in production. Restoring verified stable build."
                      value={rollbackReason}
                      onChange={(e) => setRollbackReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Customer library download links will instantly route to {rollbackTarget.versionNumber}.</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={rollingBack}
                      onClick={() => setRollbackTarget(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={rollingBack}
                      onClick={handleRollback}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${rollingBack ? 'animate-spin' : ''}`} />
                      <span>{rollingBack ? 'Rolling Back...' : `Confirm Rollback to ${rollbackTarget.versionNumber}`}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. GITHUB SYNC TAB */}
      {activeTab === 'github' && (
        <div className="space-y-8 max-w-4xl">
          {/* Current Connection Status */}
          <div className="glass-panel-3d rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Github className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Connected GitHub Repository</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {product.githubRepo ? product.githubRepo : 'No repository linked to this product.'}
                  </p>
                </div>
              </div>

              {product.githubRepo && (
                <button
                  onClick={handleSyncGitHub}
                  disabled={syncingGh}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingGh ? 'animate-spin' : ''}`} />
                  <span>{syncingGh ? 'Syncing Releases...' : 'Sync GitHub Releases'}</span>
                </button>
              )}
            </div>

            {product.lastSyncedAt && (
              <p className="text-[10px] text-slate-500 font-mono">
                Last Synced: {new Date(product.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Select Authorized Repository */}
          <div className="glass-panel-3d rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-display">Authorized Repositories from GitHub Account</h3>

            {ghError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                {ghError}
              </div>
            )}

            {loadingRepos ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Fetching user repositories from GitHub REST API...</span>
              </div>
            ) : userRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {userRepos.map((repo) => {
                  const isSelected = product.githubRepo === repo.fullName;
                  return (
                    <div
                      key={repo.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-white font-mono truncate">{repo.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{repo.description || 'No description'}</p>
                      </div>

                      <button
                        onClick={() => handleConnectRepo(repo)}
                        disabled={isSelected}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo'
                        }`}
                      >
                        {isSelected ? 'Connected ✓' : 'Select Repo'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No GitHub repositories retrieved or OAuth token unlinked.</p>
            )}
          </div>
        </div>
      )}

      {/* 6. FILES TAB */}
      {activeTab === 'files' && (
        <div className="glass-panel-3d rounded-3xl p-8 border border-slate-800 space-y-4 max-w-4xl">
          <h3 className="text-sm font-bold text-white font-display">Product Installer Packages</h3>
          {product.versions && product.versions.length > 0 ? (
            <div className="space-y-3">
              {product.versions.map((ver) => (
                <div key={ver.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400 font-mono">{ver.versionNumber} - {ver.releaseTitle}</span>
                    <span className="text-[10px] text-slate-500">{new Date(ver.publishedAt).toLocaleDateString()}</span>
                  </div>
                  {ver.files && ver.files.length > 0 ? (
                    <div className="space-y-1">
                      {ver.files.map((file) => (
                        <div key={file.id} className="p-2.5 rounded-lg bg-slate-800/60 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-200">{file.fileName} ({(file.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                          <span className="text-[10px] text-cyan-400">{file.mimeType}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">No binary file attached to this version.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No product release versions available.</p>
          )}
        </div>
      )}

      {/* 7. CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="glass-panel-3d rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-display">Licensed Customers</h3>
          {loadingCustomers ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Fetching customer entitlement records...</span>
            </div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 text-[11px] font-mono border-b border-slate-800 uppercase">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">License Key</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-sans font-semibold text-white">{c.customerName}</td>
                      <td className="py-3 px-4 text-slate-400">{c.customerEmail}</td>
                      <td className="py-3 px-4 text-cyan-300">{c.licenseKey}</td>
                      <td className="py-3 px-4 text-indigo-300">{c.planName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{new Date(c.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No customer licenses issued for this product yet.</p>
          )}
        </div>
      )}

      {/* 8. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="glass-panel-3d rounded-3xl p-6 border border-slate-800 space-y-4 max-w-4xl">
          <h3 className="text-sm font-bold text-white font-display">Product Telemetry</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-sans">Total Views</span>
              <p className="text-xl font-bold text-white">1,240</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-sans">Purchases</span>
              <p className="text-xl font-bold text-indigo-300">{product.totalPurchases}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-sans">Downloads</span>
              <p className="text-xl font-bold text-purple-300">45</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-sans">Entitlements</span>
              <p className="text-xl font-bold text-cyan-300">{product._count?.entitlements || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

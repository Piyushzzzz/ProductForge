import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Background3D } from '../components/Background3D.js';
import { Admin3DGlobe } from '../components/Admin3DGlobe.js';
import { TiltCard } from '../components/TiltCard.js';
import { 
  ShieldCheck, Activity, Users, Package, DollarSign, Server, Key, 
  AlertTriangle, CheckCircle2, Sparkles, UserPlus, UserMinus, ShieldAlert,
  Search, Filter, Trash2, RotateCcw, AlertCircle, X, ArrowRight, ExternalLink,
  Plus, Layers, FolderPlus
} from 'lucide-react';
import { AddCategoryModal } from '../components/AddCategoryModal.js';
import { CategoryIcon } from '../components/CategoryIcon.js';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'catalog' | 'users' | 'categories'>('telemetry');

  // Telemetry Overview State
  const [overview, setOverview] = useState<{
    totalUsers: number;
    totalCreators: number;
    totalProducts: number;
    totalOrders: number;
    totalGMV?: number;
    grossMarketplaceVolume?: number;
    activeEntitlements: number;
    systemHealth: string;
    recentUsers: any[];
    recentProducts: any[];
  } | null>(null);

  // Catalog & Fraud Scanner State
  const [catalogData, setCatalogData] = useState<{
    products: any[];
    stats: {
      totalProducts: number;
      highRiskCount: number;
      mediumRiskCount: number;
      cleanCount: number;
    };
  } | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  // Users & Admin Management State
  const [usersData, setUsersData] = useState<{
    users: any[];
    metrics: {
      totalUsers: number;
      adminCount: number;
      creatorCount: number;
      customerCount: number;
    };
  } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Categories State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);

  // Modal States
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // Takedown Confirmation Modal State
  const [takedownProduct, setTakedownProduct] = useState<any | null>(null);
  const [takedownReason, setTakedownReason] = useState('Detected malicious binary / fraudulent listing');
  const [submittingTakedown, setSubmittingTakedown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'catalog') fetchCatalogWithFraudAnalysis();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

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

  const fetchCatalogWithFraudAnalysis = async () => {
    try {
      const res = await api.get('/admin/products');
      if (res.data.success) {
        setCatalogData(res.data.data);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to fetch catalog security scan.');
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategoriesList(res.data.data);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to fetch categories.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (cat._count?.products > 0) {
      setActionError(`Cannot delete category "${cat.name}" because it contains ${cat._count.products} associated product(s).`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      const res = await api.delete(`/categories/${cat.id}`);
      if (res.data.success) {
        setActionSuccess(`Category "${cat.name}" successfully deleted.`);
        fetchCategories();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to delete category.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { search: userSearch || undefined, role: roleFilter !== 'ALL' ? roleFilter : undefined }
      });
      if (res.data.success) {
        setUsersData(res.data.data);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to fetch users registry.');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdmin(true);
    setActionError(null);
    try {
      const res = await api.post('/admin/users/create-admin', newAdminForm);
      if (res.data.success) {
        setActionSuccess(`New Administrator "${res.data.data.name}" added successfully.`);
        setAddAdminModalOpen(false);
        setNewAdminForm({ name: '', email: '', password: '' });
        fetchUsers();
        fetchAdminOverview();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to create administrator.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    setActionError(null);
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setActionSuccess(`Updated ${userName}'s role to ${newRole}.`);
        fetchUsers();
        fetchAdminOverview();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to update user role.');
    }
  };

  const handleExecuteTakedown = async () => {
    if (!takedownProduct) return;
    setSubmittingTakedown(true);
    setActionError(null);
    try {
      const res = await api.post(`/admin/products/${takedownProduct.id}/takedown`, {
        reason: takedownReason
      });
      if (res.data.success) {
        setActionSuccess(`Product "${takedownProduct.title}" has been removed and delisted.`);
        setTakedownProduct(null);
        fetchCatalogWithFraudAnalysis();
        fetchAdminOverview();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Takedown execution failed.');
    } finally {
      setSubmittingTakedown(false);
    }
  };

  const handleRestoreProduct = async (productId: string, title: string) => {
    setActionError(null);
    try {
      const res = await api.post(`/admin/products/${productId}/restore`);
      if (res.data.success) {
        setActionSuccess(`Product "${title}" has been restored to the marketplace.`);
        fetchCatalogWithFraudAnalysis();
        fetchAdminOverview();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to restore product.');
    }
  };

  const filteredCatalog = (catalogData?.products || []).filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          p.creator?.name?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="relative min-h-screen">
      {/* 3D WebGL Background — ADMIN Variant */}
      <Background3D variant="ADMIN" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-3d border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-glow-emerald mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> ProductForge Global Cyber Command
            </div>
            <h1 className="text-3xl font-extrabold font-display text-white">Platform Administrator Control Center</h1>
            <p className="text-xs text-slate-400">Security intelligence, admin management, and fraud takedown engine</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddAdminModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-emerald flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add New Admin
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              100% Operational
            </div>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          {[
            { id: 'telemetry', label: 'Telemetry & System Health', icon: Activity },
            { id: 'catalog', label: 'Catalog & Fraud Scanner', icon: ShieldAlert },
            { id: 'users', label: 'Admin & User Registry', icon: Users },
            { id: 'categories', label: 'Marketplace Categories', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-mono text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: TELEMETRY & SYSTEM HEALTH ─── */}
        {activeTab === 'telemetry' && (
          <div className="space-y-8 animate-in fade-in">
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

              {/* Right: 4 Stat Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TiltCard>
                  <div className="glass-panel-3d rounded-2xl p-5 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                      <span>Gross Platform Volume (GMV)</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-white">
                      ₹{overview?.totalGMV !== undefined ? overview.totalGMV.toLocaleString() : (overview?.grossMarketplaceVolume !== undefined ? overview.grossMarketplaceVolume.toLocaleString() : '0')}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sandbox order stream verified
                    </p>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                      <span>Registered Users</span>
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-cyan-300">
                      {overview ? overview.totalUsers : 0}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {overview ? overview.totalCreators : 0} creators registered
                    </p>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                      <span>Active Customer Licenses</span>
                      <Key className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-indigo-300">
                      {overview ? overview.activeEntitlements : 0}
                    </p>
                    <p className="text-[10px] text-indigo-400 font-medium">Active PF-XXXX keys</p>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="glass-panel-3d rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                      <span>Live Catalog Software</span>
                      <Package className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-white">
                      {overview ? overview.totalProducts : 0}
                    </p>
                    <p className="text-[10px] text-slate-400">Across verified categories</p>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: CATALOG & FRAUD SCANNER ─── */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Risk Indicators Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-panel-3d rounded-2xl p-4 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Catalog</span>
                <p className="text-2xl font-bold font-mono text-white">
                  {catalogData?.stats?.totalProducts || 0}
                </p>
              </div>

              <div className="glass-panel-3d rounded-2xl p-4 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> High Risk / Malicious
                </span>
                <p className="text-2xl font-bold font-mono text-rose-300">
                  {catalogData?.stats?.highRiskCount || 0}
                </p>
              </div>

              <div className="glass-panel-3d rounded-2xl p-4 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase">Moderate Suspicion</span>
                <p className="text-2xl font-bold font-mono text-amber-300">
                  {catalogData?.stats?.mediumRiskCount || 0}
                </p>
              </div>

              <div className="glass-panel-3d rounded-2xl p-4 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Verified Clean</span>
                <p className="text-2xl font-bold font-mono text-emerald-300">
                  {catalogData?.stats?.cleanCount || 0}
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel-3d p-4 rounded-2xl border border-white/10">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products or creators..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Risk Level:</span>
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      riskFilter === lvl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Table with Fraud Scanner */}
            <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">Software Product</th>
                      <th className="p-3">Creator</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Fraud Risk Score</th>
                      <th className="p-3">Detected Risk Factors</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {filteredCatalog.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No products found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCatalog.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-white block text-sm font-sans">{prod.title}</span>
                            <span className="text-[10px] text-slate-500">Slug: {prod.slug}</span>
                          </td>

                          <td className="p-3 text-slate-300 font-sans">
                            {prod.creator?.name || 'Unknown'}
                            <span className="text-[10px] text-slate-500 block font-mono">{prod.creator?.email}</span>
                          </td>

                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              prod.isDelisted
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : prod.status === 'PUBLISHED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-900 text-slate-300 border border-white/10'
                            }`}>
                              {prod.status}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                prod.riskLevel === 'HIGH'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : prod.riskLevel === 'MEDIUM'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              }`}>
                                {prod.fraudScore}% Risk
                              </span>
                            </div>
                          </td>

                          <td className="p-3 max-w-xs">
                            {prod.riskFactors && prod.riskFactors.length > 0 ? (
                              <ul className="space-y-1 text-[10px] text-rose-300 font-sans">
                                {prod.riskFactors.map((rf: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-rose-400" />
                                    <span>{rf}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[11px] text-emerald-400 font-medium">✓ Verified Clean</span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            {!prod.isDelisted ? (
                              <button
                                onClick={() => setTakedownProduct(prod)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" /> Take Down
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreProduct(prod.id, prod.title)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Restore
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: ADMIN & USER REGISTRY ─── */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            {/* User Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-panel-3d rounded-2xl p-4 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Accounts</span>
                <p className="text-2xl font-bold font-mono text-white">
                  {usersData?.metrics?.totalUsers || 0}
                </p>
              </div>

              <div className="glass-panel-3d rounded-2xl p-4 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Active Admins</span>
                <p className="text-2xl font-bold font-mono text-emerald-300">
                  {usersData?.metrics?.adminCount || 0}
                </p>
              </div>

              <div className="glass-panel-3d rounded-2xl p-4 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase">Creators</span>
                <p className="text-2xl font-bold font-mono text-amber-300">
                  {usersData?.metrics?.creatorCount || 0}
                </p>
              </div>

              <div className="glass-panel-3d rounded-2xl p-4 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Customers / Buyers</span>
                <p className="text-2xl font-bold font-mono text-cyan-300">
                  {usersData?.metrics?.customerCount || 0}
                </p>
              </div>
            </div>

            {/* User Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel-3d p-4 rounded-2xl border border-white/10">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Role:</span>
                {['ALL', 'ADMIN', 'CREATOR', 'CUSTOMER'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      roleFilter === r
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Platform Role</th>
                      <th className="p-3">Registered Date</th>
                      <th className="p-3 text-right">Role Management Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {(!usersData?.users || usersData.users.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      usersData.users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-semibold text-white font-sans">{u.name}</td>
                          <td className="p-3 text-slate-300">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : u.role === 'CREATOR'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.role !== 'ADMIN' ? (
                                <button
                                  onClick={() => handleRoleChange(u.id, 'ADMIN', u.name)}
                                  className="px-3 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3 h-3" /> Make Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRoleChange(u.id, 'CREATOR', u.name)}
                                  className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-bold border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1"
                                  title="Demote administrator to creator role"
                                >
                                  <UserMinus className="w-3 h-3" /> Remove Admin
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: MARKETPLACE CATEGORIES ─── */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-3d p-6 rounded-3xl border border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white font-display">Marketplace Category Architecture</h3>
                <p className="text-xs text-slate-400 mt-1">Manage discovery taxonomies, slugs, and associated product metrics</p>
              </div>

              <button
                type="button"
                onClick={() => setAddCategoryModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-emerald transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Marketplace Category</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel-3d p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono">Total Categories</p>
                  <p className="text-2xl font-bold text-white mt-1">{categoriesList.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-panel-3d p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono">Active (With Products)</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {categoriesList.filter((c) => (c._count?.products || 0) > 0).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-panel-3d p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono">Unused Categories</p>
                  <p className="text-2xl font-bold text-slate-400 mt-1">
                    {categoriesList.filter((c) => (c._count?.products || 0) === 0).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-3 glass-panel-3d px-4 py-3 rounded-2xl border border-white/10 max-w-md">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search categories by name, slug, description..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Categories Table */}
            <div className="glass-panel-3d rounded-3xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="py-4 px-6 font-semibold">Category</th>
                      <th className="py-4 px-6 font-semibold">Slug</th>
                      <th className="py-4 px-6 font-semibold">Description</th>
                      <th className="py-4 px-6 font-semibold">Products</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categoriesLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Loading marketplace categories...
                        </td>
                      </tr>
                    ) : categoriesList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No categories found. Click "+ Add Marketplace Category" to create one.
                        </td>
                      </tr>
                    ) : (
                      categoriesList
                        .filter((c) => {
                          const q = categorySearch.toLowerCase().trim();
                          if (!q) return true;
                          return (
                            c.name?.toLowerCase().includes(q) ||
                            c.slug?.toLowerCase().includes(q) ||
                            c.description?.toLowerCase().includes(q)
                          );
                        })
                        .map((cat) => (
                          <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6 font-sans">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-cyan-400">
                                  <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-white">{cat.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-cyan-400">{cat.slug}</td>
                            <td className="py-4 px-6 font-sans text-slate-400 max-w-xs truncate">
                              {cat.description || 'No description provided'}
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 text-[11px]">
                                {cat._count?.products ?? 0} active
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                disabled={(cat._count?.products || 0) > 0}
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={(cat._count?.products || 0) > 0 ? "Cannot delete category with active products" : "Delete empty category"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── MODAL: ADD NEW ADMIN ─── */}
      {addAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-3d w-full max-w-md rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setAddAdminModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">Add Platform Administrator</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create a new user with full platform administrative oversight privileges.
                </p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Security Officer"
                    value={newAdminForm.name}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="security@productforge.io"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddAdminModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdmin}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-emerald cursor-pointer disabled:opacity-50"
                  >
                    {submittingAdmin ? 'Creating...' : 'Create Admin Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CONFIRM TAKEDOWN ─── */}
      {takedownProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-3d w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setTakedownProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-display">Confirm Malicious Product Takedown</h3>
                <p className="text-xs text-slate-300 mt-1">
                  You are taking down <span className="text-white font-bold">"{takedownProduct.title}"</span>. This will immediately delist the product from the public marketplace and notify the creator.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Takedown Reason / Violation Details</label>
                <textarea
                  rows={3}
                  value={takedownReason}
                  onChange={(e) => setTakedownReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTakedownProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingTakedown}
                  onClick={handleExecuteTakedown}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {submittingTakedown ? 'Processing Takedown...' : 'Execute Immediate Takedown'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD NEW CATEGORY ─── */}
      <AddCategoryModal
        isOpen={addCategoryModalOpen}
        onClose={() => setAddCategoryModalOpen(false)}
        onSuccess={(newCat) => {
          setActionSuccess(`Marketplace category "${newCat.name}" successfully created!`);
          fetchCategories();
        }}
      />

    </div>
  );
};

export default AdminDashboardPage;

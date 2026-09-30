import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Product, ProductStatus } from '../../types/index.js';
import { LifecycleBadge } from '../../components/LifecycleBadge.js';
import { 
  Package, Plus, Search, Filter, ExternalLink, Settings, DollarSign, 
  Layers, Github, ArrowRight, Activity, ShieldCheck
} from 'lucide-react';

export const MyProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load creator products', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">My Software Products</h1>
          <p className="text-xs text-slate-400">Manage releases, configure pricing models, and monitor customer access</p>
        </div>

        <Link
          to="/creator/products/new"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Product
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B1326]/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title or tagline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['ALL', 'DRAFT', 'BETA', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-glow-indigo'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-xs gap-2">
          <Activity className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Fetching authenticated creator products...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const latestVersion = product.versions && product.versions.length > 0 ? product.versions[0] : null;
            const pricingCount = product.pricingPlans?.length || 0;
            const customerCount = product._count?.entitlements || 0;

            return (
              <div
                key={product.id}
                className="glass-panel-3d rounded-2xl p-6 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <LifecycleBadge status={product.status} />
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {latestVersion ? latestVersion.versionNumber : 'No Releases'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg font-display text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{product.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Customers</span>
                    <span className="font-bold text-slate-200">{customerCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Pricing Plans</span>
                    <span className="font-bold text-indigo-300">{pricingCount} Plans</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to={`/creator/products/${product.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-glow-indigo"
                  >
                    <Settings className="w-3.5 h-3.5" /> Manage
                  </Link>
                  <Link
                    to={`/products/${product.slug}`}
                    target="_blank"
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Public
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel-3d rounded-3xl p-12 text-center border border-slate-800 space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">No software products found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search || filterStatus !== 'ALL'
                ? 'Try clearing your search filters or status tags.'
                : 'Create your first software product and start selling on ProductForge marketplace.'}
            </p>
          </div>
          <Link
            to="/creator/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-glow-indigo hover:from-indigo-500 hover:to-cyan-400 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Product
          </Link>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Product, Category } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { CheckoutModal } from '../components/CheckoutModal.js';
import { Background3D } from '../components/Background3D.js';
import { Hero3DShowcase } from '../components/Hero3DShowcase.js';
import { Search, Filter, Sparkles, Layers, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/marketplace/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { sortBy };
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;

      const res = await api.get('/marketplace/products', { params });
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D Interactive WebGL Background */}
      <Background3D />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-16">
        
        {/* 3D Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-6">
          <div className="space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-3d border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-glow-indigo">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              ProductForge 3D Live Digital Product Studio
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight text-white tracking-tight">
              Software Releases & <br />
              <span className="text-gradient-cyan-indigo">Digital Product Lifecycle</span>
            </h1>

            <p className="text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Discover, license, and deploy developer tools, SaaS templates, microservices, and CLI utilities with cryptographic entitlement verification and live release engineering.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto lg:mx-0">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search SaaS, APIs, CLI tools, UI kits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-28 py-4 rounded-2xl glass-input-3d text-white placeholder-slate-400 text-sm shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow-indigo transition-all"
              >
                Search
              </button>
            </form>

            {/* Trust Badges */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographic License Keys</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-cyan-400" /> SemVer Asset Streams</span>
            </div>
          </div>

          {/* Interactive 3D Hero Showcase Cube */}
          <div className="w-full">
            <Hero3DShowcase />
          </div>
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel-3d p-4 rounded-2xl border border-white/10">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-cyan-400 shadow-glow-indigo'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                All Products
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-cyan-400 shadow-glow-indigo'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
              <Filter className="w-4 h-4 text-indigo-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest Releases</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="glass-panel-3d rounded-3xl p-6 h-80 animate-pulse space-y-4">
                  <div className="h-40 bg-slate-800/60 rounded-2xl" />
                  <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel-3d rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search query or selecting a different category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickBuy={(prod) => setCheckoutProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
    </div>
  );
};

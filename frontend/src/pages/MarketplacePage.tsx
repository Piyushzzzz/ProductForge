import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { CheckoutModal } from '../components/CheckoutModal.js';
import { Search, Sparkles, SlidersHorizontal, ArrowUpDown, Filter, Terminal, ShieldCheck, Zap } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [loading, setLoading] = useState<boolean>(true);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortBy) params.sortBy = sortBy;

      const [prodRes, catRes] = await Promise.all([
        api.get('/marketplace/products', { params }),
        api.get('/marketplace/categories')
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data.products);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
    } catch (e) {
      console.error('Error loading marketplace:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 px-4 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-cyan-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Curated Software, SaaS & Developer Tools
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
            Build, Distribute & Scale <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Digital Software Products
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A developer-first lifecycle marketplace. Access production-ready SaaS starters, microservice APIs, CLI automations, and UI design libraries.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SaaS, APIs, CLI tools, UI kits, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-glow transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category Pills & Filters Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'glass-panel text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Software
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'glass-panel text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input text-xs px-3 py-2 rounded-xl text-slate-200 cursor-pointer"
            >
              <option value="popular" className="bg-slate-900 text-white">Most Popular</option>
              <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
              <option value="newest" className="bg-slate-900 text-white">Newest Releases</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-panel h-64 rounded-2xl animate-pulse p-6"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl mt-8">
            <p className="text-slate-400 text-sm">No products found matching your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickBuy={(prod) => setCheckoutProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          selectedPlan={null}
          onClose={() => setCheckoutProduct(null)}
          onSuccess={() => {
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

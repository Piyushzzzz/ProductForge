import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Category, ProductStatus } from '../types/index.js';
import { AddCategoryModal } from '../components/AddCategoryModal.js';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const CreatorProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ProductStatus>('DRAFT');
  const [demoUrl, setDemoUrl] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Pricing Plans
  const [pricingPlans, setPricingPlans] = useState<Array<{
    name: string;
    type: string;
    price: number;
    interval: string;
    features: string[];
  }>>([
    {
      name: 'Standard License',
      type: 'ONE_TIME',
      price: 49,
      interval: 'NONE',
      features: ['Full Source Code', '1 Year Updates', 'Discord Support']
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get('/marketplace/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.data);
          if (catRes.data.data.length > 0 && !categoryId) {
            setCategoryId(catRes.data.data[0].id);
          }
        }

        if (!isNew && id) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.data.success) {
            const p = prodRes.data.data;
            setTitle(p.title);
            setTagline(p.tagline);
            setDescription(p.description);
            setCategoryId(p.categoryId);
            setStatus(p.status);
            setDemoUrl(p.demoUrl || '');
            setGithubRepo(p.githubRepo || '');
            setLogoUrl(p.logoUrl || '');
            setBannerUrl(p.bannerUrl || '');
          }
        }
      } catch (e) {
        console.error('Error loading form:', e);
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tagline || !description || !categoryId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isNew) {
        const res = await api.post('/products', {
          title,
          tagline,
          description,
          categoryId,
          status,
          demoUrl,
          githubRepo,
          logoUrl,
          bannerUrl,
          pricingPlans
        });
        if (res.data.success) {
          navigate('/creator');
        }
      } else {
        const res = await api.put(`/products/${id}`, {
          title,
          tagline,
          description,
          categoryId,
          status,
          demoUrl,
          githubRepo,
          logoUrl,
          bannerUrl
        });
        if (res.data.success) {
          navigate('/creator');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Link to="/creator" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Creator Studio
      </Link>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            {isNew ? 'Create New Software Product' : 'Edit Software Product'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure metadata, pricing tiers, and lifecycle state.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Product Title *</label>
              <input
                type="text"
                placeholder="e.g. InvoicePro SaaS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-white font-medium"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">Category *</label>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Category</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-white"
                required
              >
                {categories.length === 0 ? (
                  <option value="">No categories available - Click "+ Add Category"</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Tagline (One-sentence pitch) *</label>
            <input
              type="text"
              placeholder="e.g. Modern billing and customer portal with Stripe integration"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-white"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Full Description & Architecture *</label>
            <textarea
              rows={6}
              placeholder="Describe your software architecture, dependencies, installation steps, and included features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Lifecycle State</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full p-3 rounded-xl glass-input text-white"
              >
                <option value="DRAFT" className="bg-slate-900">DRAFT</option>
                <option value="BETA" className="bg-slate-900">BETA</option>
                <option value="PUBLISHED" className="bg-slate-900">PUBLISHED</option>
                <option value="ARCHIVED" className="bg-slate-900">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Live Demo URL</label>
              <input
                type="url"
                placeholder="https://demo.example.com"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">GitHub Repository</label>
              <input
                type="url"
                placeholder="https://github.com/user/repo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              to="/creator"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-glow flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={(newCat) => {
          setCategories(prev => {
            const exists = prev.some(c => c.id === newCat.id);
            return exists ? prev : [...prev, newCat];
          });
          setCategoryId(newCat.id);
        }}
      />
    </div>
  );
};

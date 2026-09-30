import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Category } from '../../types/index.js';
import { AddCategoryModal } from '../../components/AddCategoryModal.js';
import { 
  Package, Plus, Sparkles, ArrowLeft, Check, Layers, Image as ImageIcon, 
  Globe, Github, FileText, AlertCircle, Upload, FileCode
} from 'lucide-react';

export const CreateProductView: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    categoryId: '',
    productType: 'SaaS',
    demoUrl: '',
    githubRepo: '',
    logoUrl: '',
    bannerUrl: ''
  });

  // Initial Release & Package File State
  const [includeInitialRelease, setIncludeInitialRelease] = useState(true);
  const [initialVersion, setInitialVersion] = useState('v1.0.0');
  const [initialReleaseTitle, setInitialReleaseTitle] = useState('v1.0.0 Initial Release');
  const [initialReleaseNotes, setInitialReleaseNotes] = useState('First production-ready package release with core features.');
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [productStatus, setProductStatus] = useState<'DRAFT' | 'BETA' | 'PUBLISHED'>('DRAFT');

  const productTypes = [
    'SaaS',
    'Desktop Software',
    'Browser Extension',
    'API',
    'Plugin',
    'Developer Tool',
    'CLI Tool',
    'SDK',
    'Template',
    'Starter Kit',
    'Other Software'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      try {
        const fallback = await api.get('/marketplace/categories');
        if (fallback.data.success) {
          setCategories(fallback.data.data);
          if (fallback.data.data.length > 0 && !formData.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: fallback.data.data[0].id }));
          }
        }
      } catch (e) {
        console.error('Failed fallback categories', e);
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.tagline || !formData.description || !formData.categoryId) {
      setError('Title, tagline, description, and category are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/products', {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        categoryId: formData.categoryId,
        demoUrl: formData.demoUrl || undefined,
        githubRepo: formData.githubRepo || undefined,
        logoUrl: formData.logoUrl || undefined,
        bannerUrl: formData.bannerUrl || undefined,
        status: productStatus
      });

      if (res.data.success) {
        const newProduct = res.data.data;

        // If creator specified an initial release, create and attach it immediately
        if (includeInitialRelease && initialVersion) {
          try {
            const releaseRes = await api.post(`/releases/products/${newProduct.id}`, {
              versionNumber: initialVersion,
              releaseTitle: initialReleaseTitle || `Release ${initialVersion}`,
              releaseNotes: initialReleaseNotes || 'Initial software package.',
              isBeta: productStatus === 'BETA'
            });

            if (releaseRes.data.success && initialFile) {
              const versionId = releaseRes.data.data.id;
              const formDataFile = new FormData();
              formDataFile.append('file', initialFile);
              await api.post(`/releases/${versionId}/upload`, formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            }
          } catch (relErr) {
            console.error('Initial release attachment warning:', relErr);
          }
        }

        navigate(`/creator/products/${newProduct.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/creator/products')}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">Create New Digital Product</h1>
          <p className="text-xs text-slate-400">Initialize product listing in DRAFT mode</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel-3d rounded-3xl p-8 border border-slate-800 space-y-6">
        
        {/* Product Name & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. InvoicePro Engine"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tagline *</label>
            <input
              type="text"
              required
              placeholder="e.g. Next-gen automated invoicing SaaS for devs"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Product Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Product Type</label>
            <select
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
            >
              {productTypes.map(pt => (
                <option key={pt} value={pt} className="bg-[#0B1326] text-white">{pt}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Marketplace Category *</label>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Category</span>
              </button>
            </div>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
            >
              {loadingCategories ? (
                <option value="">Loading categories...</option>
              ) : categories.length === 0 ? (
                <option value="">No categories available - Click "+ Add Category"</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#0B1326] text-white">
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Full Description *</label>
          <textarea
            required
            rows={5}
            placeholder="Describe your software product features, architecture, requirements, and documentation links..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Assets & URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Demo URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://demo.invoicepro.io"
              value={formData.demoUrl}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-cyan-400" /> GitHub Repository (e.g. owner/repo)
            </label>
            <input
              type="text"
              placeholder="developer/invoice-pro"
              value={formData.githubRepo}
              onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Logo Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Banner Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Lifecycle Status & Initial Package Release Card */}
        <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" /> Initial Software Release & Direct .ZIP Upload
              </h3>
              <p className="text-xs text-slate-400">
                Instantly attach v1.0.0 and upload the product package binary during creation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300 font-semibold">Initial Status:</label>
              <select
                value={productStatus}
                onChange={(e) => setProductStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/40 text-xs font-semibold text-cyan-300 focus:outline-none"
              >
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="BETA">BETA (Early Access)</option>
                <option value="PUBLISHED">PUBLISHED (Live)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-indigo-500/20">
            <input
              type="checkbox"
              id="includeInitial"
              checked={includeInitialRelease}
              onChange={(e) => setIncludeInitialRelease(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
            />
            <label htmlFor="includeInitial" className="text-xs text-slate-200 font-semibold cursor-pointer">
              Create initial version release with direct binary/zip upload now
            </label>
          </div>

          {includeInitialRelease && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Initial Version Tag *</label>
                  <input
                    type="text"
                    required={includeInitialRelease}
                    placeholder="e.g. v1.0.0"
                    value={initialVersion}
                    onChange={(e) => setInitialVersion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Release Title *</label>
                  <input
                    type="text"
                    required={includeInitialRelease}
                    placeholder="e.g. v1.0.0 Initial Stable Release"
                    value={initialReleaseTitle}
                    onChange={(e) => setInitialReleaseTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Release Notes / Changelog</label>
                <textarea
                  rows={3}
                  placeholder="Describe what is included in this initial release..."
                  value={initialReleaseNotes}
                  onChange={(e) => setInitialReleaseNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    Upload Product Package (.zip, .tar.gz, .exe, .dmg)
                  </span>
                  {initialFile && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Selected: {initialFile.name} ({(initialFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </label>
                <div className="p-4 rounded-xl border border-dashed border-indigo-500/40 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-300 font-semibold">Attach Product Binary or Archive</p>
                      <p className="text-[10px] text-slate-500 font-mono">Permitted: .zip, .tar.gz, .exe, .msi, .dmg, .vsix, .nupkg</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => setInitialFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-indigo-600 file:to-cyan-600 file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/creator/products')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-glow-indigo transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Creating Draft...' : 'Save Draft & Continue'}
            <Check className="w-4 h-4" />
          </button>
        </div>
      </form>

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={(newCat) => {
          setCategories(prev => {
            const exists = prev.some(c => c.id === newCat.id);
            return exists ? prev : [...prev, newCat];
          });
          setFormData(prev => ({ ...prev, categoryId: newCat.id }));
        }}
      />
    </div>
  );
};

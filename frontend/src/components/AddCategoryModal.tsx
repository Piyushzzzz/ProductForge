import React, { useState } from 'react';
import { api } from '../services/api.js';
import { Category } from '../types/index.js';
import { CategoryIcon } from './CategoryIcon.js';
import { Plus, X, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'AI / Innovation' },
  { name: 'Cpu', label: 'Compute / Hardware' },
  { name: 'Cloud', label: 'SaaS / Cloud' },
  { name: 'Server', label: 'APIs / Backend' },
  { name: 'Terminal', label: 'CLI / Scripts' },
  { name: 'Layout', label: 'UI / Design' },
  { name: 'Puzzle', label: 'Plugins / Addons' },
  { name: 'Box', label: 'Starters / Packages' },
  { name: 'Shield', label: 'Security / Auth' },
  { name: 'Database', label: 'Data / Analytics' },
  { name: 'Code', label: 'SDKs / Libraries' },
  { name: 'Globe', label: 'Web / Networking' },
  { name: 'Zap', label: 'Real-time / Events' },
  { name: 'Layers', label: 'Frameworks' }
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/categories', {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon
      });

      if (res.data.success) {
        onSuccess(res.data.data);
        setName('');
        setDescription('');
        setSelectedIcon('Sparkles');
        onClose();
      } else {
        setError(res.data.error?.message || 'Failed to create category.');
      }
    } catch (err: any) {
      console.error('Error creating category:', err);
      const msg = err.response?.data?.error?.message || err.message || 'Failed to create category.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg glass-panel-3d rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-indigo">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Add Marketplace Category</h2>
              <p className="text-xs text-slate-400">Introduce a new product category to the marketplace catalog</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI & Machine Learning, DevOps, Mobile SDKs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of what digital products belong in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Category Icon</label>
              <span className="text-[10px] text-slate-400 font-mono">Selected: {selectedIcon}</span>
            </div>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-xl bg-slate-950/60 border border-white/5 scrollbar-thin">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  title={icon.label}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedIcon === icon.name
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-glow-indigo border border-cyan-400'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <CategoryIcon iconName={icon.name} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Badge */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">Marketplace Preview:</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-white text-xs font-semibold shadow-glow-cyan">
              <CategoryIcon iconName={selectedIcon} className="w-3.5 h-3.5 text-cyan-400" />
              <span>{name.trim() || 'Category Name'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

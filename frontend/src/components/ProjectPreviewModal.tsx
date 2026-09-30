import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.js';
import { LifecycleBadge } from './LifecycleBadge.js';
import { 
  X, ExternalLink, Github, Star, ShieldCheck, Download, 
  Sparkles, Check, ArrowRight, Layers, Eye, Globe
} from 'lucide-react';

interface ProjectPreviewModalProps {
  product: Product;
  onClose: () => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({
  product,
  onClose,
  onQuickBuy
}) => {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const latestVersion = product.versions && product.versions.length > 0 ? product.versions[0] : null;
  const lowestPrice = product.pricingPlans && product.pricingPlans.length > 0
    ? Math.min(...product.pricingPlans.map(p => p.price))
    : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="glass-panel-3d w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/15 shadow-2xl overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl text-slate-300 hover:text-white bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-all cursor-pointer"
          title="Close Preview (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Banner Preview */}
        <div className="relative h-64 sm:h-72 bg-slate-900 overflow-hidden border-b border-white/10">
          <img
            src={product.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1326] via-[#0B1326]/50 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <LifecycleBadge status={product.status} />
            {product.category && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Action Links on Banner */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-cyan-500/90 hover:bg-cyan-400 text-[#0B1326] font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" /> Launch Live Demo <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {product.githubRepo && (
              <a
                href={product.githubUrl || `https://github.com/${product.githubRepo}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-medium text-xs border border-white/20 transition-all flex items-center gap-1.5 backdrop-blur-md"
              >
                <Github className="w-3.5 h-3.5" /> Repository
              </a>
            )}
          </div>

          {/* Product Logo Thumbnail */}
          <div className="absolute -bottom-4 left-6 w-16 h-16 rounded-2xl bg-indigo-950 border-2 border-white/20 overflow-hidden shadow-xl">
            <img
              src={product.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 pt-7">
          {/* Title & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Interactive Project Preview
                </span>
              </div>
              <h2 className="text-2xl font-extrabold font-display text-white mt-1">
                {product.title}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {product.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {product.averageRating ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.averageRating.toFixed(1)}</span>
                  <span className="text-slate-500 font-normal">({product.totalReviews})</span>
                </div>
              ) : null}

              {latestVersion && (
                <div className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold">
                  {latestVersion.versionNumber}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              About This Project
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Releases / Technical Details */}
          {latestVersion && (
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-cyan-400 font-bold">Latest Release: {latestVersion.versionNumber} - {latestVersion.releaseTitle}</span>
                <span>{new Date(latestVersion.publishedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                {latestVersion.releaseNotes}
              </p>
            </div>
          )}

          {/* Pricing Plans Preview */}
          {product.pricingPlans && product.pricingPlans.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Available License Plans
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.pricingPlans.map((plan) => {
                  const featuresList = typeof plan.features === 'string'
                    ? (plan.features.startsWith('[') ? JSON.parse(plan.features) : plan.features.split(','))
                    : plan.features;

                  return (
                    <div 
                      key={plan.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs font-display">{plan.name}</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          ₹{plan.price.toLocaleString()}
                          {plan.interval !== 'NONE' && <span className="text-[10px] text-slate-400 font-sans">/{plan.interval.toLowerCase()}</span>}
                        </span>
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-400">
                        {Array.isArray(featuresList) && featuresList.slice(0, 3).map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{f.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to={`/products/${product.slug}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-cyan-400" /> Open Full Project Page
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                Close
              </button>

              {onQuickBuy && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onQuickBuy(product);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow-indigo transition-all flex items-center justify-center gap-1.5"
                >
                  Buy License (₹{lowestPrice.toLocaleString()}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

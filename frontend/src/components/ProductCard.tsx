import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.js';
import { Star, ExternalLink, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { LifecycleBadge } from './LifecycleBadge.js';

export const ProductCard: React.FC<{ product: Product; onQuickBuy?: (product: Product) => void }> = ({
  product,
  onQuickBuy
}) => {
  const currentVersion = product.versions && product.versions.length > 0 ? product.versions[0] : null;
  const lowestPrice =
    product.pricingPlans && product.pricingPlans.length > 0
      ? Math.min(...product.pricingPlans.map((p) => p.price))
      : 29;

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between glass-panel-hover group relative overflow-hidden">
      {/* Subtle glowing corner */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>

      <div>
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/5 text-cyan-400 border border-white/10">
            {product.category?.name || 'Software'}
          </span>
          <LifecycleBadge status={product.status} />
        </div>

        {/* Product Title & Avatar */}
        <div className="flex items-start gap-3.5 mb-3">
          <img
            src={product.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
            alt={product.title}
            className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-slate-900 shrink-0"
          />
          <div>
            <Link
              to={`/products/${product.slug}`}
              className="font-display font-semibold text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-1"
            >
              {product.title}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              {currentVersion && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                  {currentVersion.versionNumber}
                </span>
              )}
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'}</span>
                <span className="text-slate-500">({product.totalReviews})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {product.tagline}
        </p>
      </div>

      {/* Footer: Price & Actions */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Starting at</span>
          <span className="text-lg font-bold font-display text-white">
            ${lowestPrice.toFixed(0)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1"
          >
            Details <ArrowRight className="w-3 h-3" />
          </Link>
          {onQuickBuy && (
            <button
              onClick={() => onQuickBuy(product)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

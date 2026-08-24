import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.js';
import { LifecycleBadge } from './LifecycleBadge.js';
import { TiltCard } from './TiltCard.js';
import { Star, ShieldCheck, ArrowRight, Download, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickBuy?: (product: Product) => void;
  onCategoryClick?: (categoryId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickBuy, onCategoryClick }) => {
  const lowestPrice = product.pricingPlans && product.pricingPlans.length > 0
    ? Math.min(...product.pricingPlans.map(p => p.price))
    : 0;

  return (
    <TiltCard maxTilt={10} scale={1.02}>
      <div className="glass-panel-3d rounded-3xl p-5 border border-white/10 flex flex-col justify-between h-full space-y-4 group">
        
        {/* Banner Image with 3D Depth Layer */}
        <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group-hover:border-indigo-500/40 transition-colors">
          <img
            src={product.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1326] via-[#0B1326]/40 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <LifecycleBadge status={product.status} />
            {product.category && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCategoryClick && product.category) onCategoryClick(product.category.id);
                }}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 hover:text-white transition-all cursor-pointer"
              >
                {product.category.name}
              </button>
            )}
          </div>

          {/* Product Logo Thumbnail */}
          <div className="absolute -bottom-3 left-4 w-12 h-12 rounded-2xl bg-indigo-950 border border-white/20 overflow-hidden shadow-lg shadow-black/50">
            <img
              src={product.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="pt-2 space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display group-hover:text-cyan-300 transition-colors line-clamp-1">
              {product.title}
            </h3>
            {product.averageRating ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.averageRating.toFixed(1)}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">New</span>
            )}
          </div>

          <p className="text-xs text-slate-300 font-medium line-clamp-1">{product.tagline}</p>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        {/* Latest Version & SemVer Tag */}
        {product.versions && product.versions.length > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="text-indigo-400 font-semibold">Latest Release: {product.versions[0].versionNumber}</span>
            <span className="flex items-center gap-1 text-slate-500 text-[10px]">
              <Download className="w-3 h-3" /> {product._count?.entitlements || 0} downloads
            </span>
          </div>
        )}

        {/* Footer Price & Action Buttons */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting at</span>
            <span className="text-lg font-bold font-mono text-white text-gradient-cyan-indigo">
              ${lowestPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product.slug}`}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="View Product Architecture"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {onQuickBuy && (
              <button
                type="button"
                onClick={() => onQuickBuy(product)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all flex items-center gap-1.5"
              >
                Buy Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </TiltCard>
  );
};

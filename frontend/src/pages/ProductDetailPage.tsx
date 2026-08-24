import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { LifecycleBadge } from '../components/LifecycleBadge.js';
import { CheckoutModal } from '../components/CheckoutModal.js';
import { Background3D } from '../components/Background3D.js';
import { TiltCard } from '../components/TiltCard.js';
import { 
  Star, Download, ExternalLink, Github, ShieldCheck, CheckCircle2, 
  Terminal, FileCode, Clock, MessageSquare, ArrowLeft, Sparkles 
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/marketplace/products/${slug}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !comment) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating,
        comment
      });
      if (res.data.success) {
        setComment('');
        fetchProduct();
      }
    } catch (err: any) {
      setReviewError(err.response?.data?.error?.message || 'Review submission failed.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#060913] flex items-center justify-center text-xs text-slate-400">Loading Product Architecture...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-red-400 text-sm font-semibold">{error || 'Product not found'}</div>
        <Link to="/" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 3D WebGL Background */}
      <Background3D />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-10">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace Catalog
        </Link>

        {/* Top Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Box */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel-3d rounded-3xl p-8 border border-white/10 space-y-6">
              
              {/* Title & Badge Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-white/20 overflow-hidden shadow-lg flex-shrink-0">
                    <img src={product.logoUrl} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{product.title}</h1>
                    <p className="text-xs text-cyan-400 font-medium">{product.tagline}</p>
                  </div>
                </div>

                <LifecycleBadge status={product.status} />
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-light">{product.description}</p>

              {/* Creator & Links Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <img
                    src={product.creator?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Alex'}
                    alt={product.creator?.name}
                    className="w-6 h-6 rounded-full border border-white/20"
                  />
                  <span>Created by <strong className="text-white">{product.creator?.name}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  {product.demoUrl && (
                    <a
                      href={product.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                  {product.githubRepo && (
                    <a
                      href={product.githubRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-slate-300 hover:underline"
                    >
                      <Github className="w-3.5 h-3.5" /> GitHub Repo
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Pricing & Checkout Card */}
          <TiltCard>
            <div className="glass-panel-3d rounded-3xl p-7 border border-white/15 space-y-6 h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-slate-400">License Entitlement</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Instant Access
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting Price</span>
                  <p className="text-3xl font-extrabold font-mono text-white text-gradient-cyan-indigo">
                    ${product.pricingPlans && product.pricingPlans.length > 0 ? product.pricingPlans[0].price.toFixed(2) : '29.00'}
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Cryptographic License Key (`PF-XXXX-XXXX`)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>SHA-256 Verified Binary Releases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Full Source Code & Updates</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glow-indigo transition-all flex items-center justify-center gap-2"
              >
                Acquire License Entitlement <ShieldCheck className="w-4 h-4" />
              </button>

            </div>
          </TiltCard>

        </div>

        {/* Release Version Changelogs Timeline */}
        <div className="glass-panel-3d rounded-3xl p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Release Version Changelogs & Downloads
            </h3>
            <span className="text-xs text-slate-400 font-mono">SemVer History</span>
          </div>

          <div className="space-y-4">
            {(!product.versions || product.versions.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-4">No published releases yet for this product.</p>
            ) : (
              product.versions.map((ver) => (
                <div key={ver.id} className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                        {ver.versionNumber}
                      </span>
                      <h4 className="font-bold text-white text-xs">{ver.releaseTitle}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(ver.publishedAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap pl-2 border-l-2 border-indigo-500/40">{ver.releaseNotes}</p>

                  {/* Version Binary Files */}
                  {ver.files && ver.files.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {ver.files.map((file) => (
                        <div key={file.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/20 text-xs font-mono text-indigo-300">
                          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{file.fileName}</span>
                          <span className="text-[10px] text-slate-500">({(file.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="glass-panel-3d rounded-3xl p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" /> Verified Customer Reviews
            </h3>
            {product.averageRating && (
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> {product.averageRating.toFixed(1)} / 5.0
              </span>
            )}
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
            <span className="text-xs text-slate-300 font-medium block">Post a Verified Review</span>

            {reviewError && (
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {reviewError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 focus:outline-none"
                >
                  <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="Share your experience using this digital software..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 rounded-xl glass-input-3d text-white text-xs"
              required
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo"
            >
              {submittingReview ? 'Posting...' : 'Post Review'}
            </button>
          </form>

          {/* Review List */}
          <div className="space-y-3">
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-4">No reviews yet. Be the first verified buyer to leave a review!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.customer?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Customer'}
                        alt={rev.customer?.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs font-semibold text-white">{rev.customer?.name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <CheckoutModal
          product={product}
          onClose={() => setCheckoutModalOpen(false)}
        />
      )}
    </div>
  );
};

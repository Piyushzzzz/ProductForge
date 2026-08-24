import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, PricingPlan, Review } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CheckoutModal } from '../components/CheckoutModal.js';
import { LifecycleBadge } from '../components/LifecycleBadge.js';
import {
  Star,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  GitBranch,
  FileCode,
  MessageSquare,
  ArrowLeft,
  Key
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [hasEntitlement, setHasEntitlement] = useState<boolean>(false);

  // Review submission state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchProductDetails = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await api.get(`/marketplace/products/${slug}`);
      if (res.data.success) {
        const prod = res.data.data;
        setProduct(prod);
        if (prod.pricingPlans && prod.pricingPlans.length > 0) {
          setSelectedPlan(prod.pricingPlans[0]);
        }

        // Check if current user has entitlement
        if (user) {
          try {
            const entRes = await api.get(`/entitlements/verify/${prod.id}`);
            if (entRes.data.success && entRes.data.data.hasAccess) {
              setHasEntitlement(true);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      console.error('Error fetching product:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [slug, user]);

  const handleDownloadRelease = async (fileId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      // Trigger protected download
      window.open(`http://localhost:5000/api/files/${fileId}/download?token=${localStorage.getItem('productforge_token')}`, '_blank');
    } catch (e) {
      alert('Unable to download file.');
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !commentInput.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: ratingInput,
        comment: commentInput.trim()
      });

      if (res.data.success) {
        setCommentInput('');
        fetchProductDetails();
      }
    } catch (err: any) {
      setReviewError(err.response?.data?.error?.message || 'Failed to submit review. You must own this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-10 bg-slate-900 rounded-xl w-1/3"></div>
        <div className="h-64 bg-slate-900 rounded-3xl"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-white">Product not found.</h2>
        <Link to="/" className="mt-4 inline-block text-xs text-indigo-400 hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const currentVersion = product.versions && product.versions.length > 0 ? product.versions[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* Main Hero Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
          <div className="flex items-start gap-5">
            <img
              src={product.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
              alt={product.title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/10 bg-slate-900 shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-cyan-400 border border-indigo-500/30">
                  {product.category?.name}
                </span>
                <LifecycleBadge status={product.status} />
                {currentVersion && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-white/10">
                    Latest: {currentVersion.versionNumber}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {product.title}
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {product.tagline}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'}</span>
                  <span className="text-slate-500">({product.totalReviews} verified reviews)</span>
                </div>
                <span>•</span>
                <span>{product.totalPurchases} customers</span>
                <span>•</span>
                <span>By {product.creator?.name || 'Verified Creator'}</span>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {hasEntitlement ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> You own this product
                </span>
                <Link
                  to="/library"
                  className="w-full block py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow transition-all"
                >
                  Open in My Library
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" /> Purchase License ($
                {selectedPlan?.price.toFixed(0) || '29'})
              </button>
            )}

            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Live Preview / Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Description & Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Release History & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description & Overview */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" /> Product Overview & Architecture
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
              {product.description}
            </div>
          </div>

          {/* Release History & Version Downloads */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" /> Release Changelogs & Version History
            </h3>

            <div className="space-y-4">
              {product.versions && product.versions.length > 0 ? (
                product.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                          {ver.versionNumber}
                        </span>
                        <span className="text-sm font-semibold text-white">{ver.releaseTitle}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(ver.publishedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{ver.releaseNotes}</p>

                    {ver.changelog && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] font-mono text-slate-300 whitespace-pre-line">
                        {ver.changelog}
                      </div>
                    )}

                    {ver.files && ver.files.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {ver.files.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleDownloadRelease(file.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                              hasEntitlement
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            {file.fileName} ({(file.fileSize / 1024 / 1024).toFixed(1)} MB)
                            {!hasEntitlement && <span className="text-[10px] text-amber-400 ml-1">(License Required)</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No releases published yet.</p>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" /> Verified Customer Reviews
              </h3>
              <span className="text-xs text-slate-400">
                Avg Rating: {product.averageRating > 0 ? product.averageRating.toFixed(1) : '5.0'} / 5.0
              </span>
            </div>

            {/* Write Review Form (For Entitled Buyers) */}
            {hasEntitlement && (
              <form onSubmit={handlePostReview} className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                <h4 className="text-xs font-semibold text-white">Leave a Verified Customer Review</h4>
                {reviewError && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">{reviewError}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= ratingInput ? 'fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="Share your technical experience with this software package..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow"
                >
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.customer?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + rev.customer?.name}
                          alt=""
                          className="w-7 h-7 rounded-full border border-white/10"
                        />
                        <div>
                          <span className="text-xs font-semibold text-white">{rev.customer?.name}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded ml-2 border border-emerald-500/20">
                            Verified Buyer
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Pricing Tier Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 sticky top-24 space-y-6">
            <h3 className="text-base font-bold font-display text-white">License & Pricing Tiers</h3>

            <div className="space-y-3">
              {product.pricingPlans?.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                const features: string[] = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-glow'
                        : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{plan.name}</span>
                      <span className="text-base font-extrabold font-display text-cyan-400">
                        ${plan.price.toFixed(0)}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5">
                      {features.map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-cyan-300" /> Instant Sandbox Checkout ($
              {selectedPlan?.price.toFixed(0) || '29'})
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          product={product}
          selectedPlan={selectedPlan}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setHasEntitlement(true);
            fetchProductDetails();
          }}
        />
      )}
    </div>
  );
};

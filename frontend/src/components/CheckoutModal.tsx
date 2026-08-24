import React, { useState } from 'react';
import { Product, PricingPlan } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, CheckCircle2, Sparkles, CreditCard, Key, ArrowRight } from 'lucide-react';

export const CheckoutModal: React.FC<{
  product: Product;
  selectedPlan: PricingPlan | null;
  onClose: () => void;
  onSuccess: (entitlement: any) => void;
}> = ({ product, selectedPlan, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedEntitlement, setCompletedEntitlement] = useState<any | null>(null);

  const plan = selectedPlan || (product.pricingPlans && product.pricingPlans[0]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!plan) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/orders/checkout', {
        productId: product.id,
        pricingPlanId: plan.id
      });

      if (res.data.success) {
        setCompletedEntitlement(res.data.data.entitlement);
        onSuccess(res.data.data.entitlement);
      } else {
        setError(res.data.error?.message || 'Checkout failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {completedEntitlement ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-white">Purchase Successful!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your license entitlement has been verified and provisioned.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Software Product:</span>
                <span className="font-semibold text-white">{product.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">License Key:</span>
                <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {completedEntitlement.licenseKey}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Access Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE ENTITLEMENT
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/library');
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
              >
                Go to My Library <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Instant Sandbox Checkout</h3>
                <p className="text-xs text-slate-400">Instant digital access & cryptographic license key</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Product Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">{product.title}</span>
                <span className="text-xs font-mono font-semibold text-cyan-400">{plan?.name}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-slate-400">Total Price (USD):</span>
                <span className="text-xl font-bold font-display text-white">${plan?.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Sandbox Notice */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2.5 mb-5 text-xs text-cyan-300">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <div>
                <p className="font-semibold text-white">University Sandbox Simulator</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Test transaction simulator is active. No real credit card or bank credentials required.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Simulating Payment & Generating License...</span>
              ) : (
                <>
                  <Key className="w-4 h-4 text-cyan-300" /> Confirm & Activate Access ($
                  {plan?.price.toFixed(2)})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

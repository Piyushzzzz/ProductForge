import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Entitlement } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  FolderLock,
  Download,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  GitBranch,
  Star
} from 'lucide-react';

export const CustomerLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entitlements/my-library');
      if (res.data.success) {
        setEntitlements(res.data.data);
      }
    } catch (e) {
      console.error('Error loading library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const copyToClipboard = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (fileId: string) => {
    window.open(
      `http://localhost:5000/api/files/${fileId}/download?token=${localStorage.getItem('productforge_token')}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-900 rounded-xl w-1/4"></div>
        <div className="h-64 bg-slate-900 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              ENTITLED ASSETS
            </span>
            <span className="text-xs text-slate-400">• {entitlements.length} Owned Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
            My Purchased Digital Products
          </h1>
        </div>

        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          Explore More Software
        </Link>
      </div>

      {/* Entitlements Grid */}
      {entitlements.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl space-y-4">
          <FolderLock className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No products in your library yet.</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse the marketplace to discover SaaS boilerplates, dev tools, and software APIs.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entitlements.map((ent) => {
            const product = ent.product;
            const currentVersion = product.versions && product.versions.length > 0 ? product.versions[0] : null;

            return (
              <div
                key={ent.id}
                className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top: Status & Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-slate-900"
                      />
                      <div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="font-bold text-sm text-white hover:text-indigo-400 transition-colors"
                        >
                          {product.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Plan: {ent.orderItem?.pricingPlan?.name || 'Standard License'}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> ACTIVE LICENSE
                    </span>
                  </div>

                  {/* License Key Box */}
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-mono">LICENSE KEY</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {ent.licenseKey}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ent.licenseKey)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
                      title="Copy Key"
                    >
                      {copiedKey === ent.licenseKey ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Latest Release & Files */}
                  {currentVersion && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-400" /> Latest Release ({currentVersion.versionNumber})
                        </span>
                        <span className="text-[10px] text-slate-400">{currentVersion.releaseTitle}</span>
                      </div>

                      {currentVersion.files && currentVersion.files.length > 0 ? (
                        <div className="space-y-1.5">
                          {currentVersion.files.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => handleDownload(file.id)}
                              className="w-full py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 hover:text-white text-xs font-medium border border-indigo-500/30 transition-all flex items-center justify-between"
                            >
                              <span className="flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5 text-cyan-400" /> {file.fileName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">No binary file attached yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Links */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <Link
                    to={`/products/${product.slug}`}
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View Product Page <ExternalLink className="w-3 h-3" />
                  </Link>

                  <span className="text-[10px] text-slate-500">
                    Acquired {new Date(ent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

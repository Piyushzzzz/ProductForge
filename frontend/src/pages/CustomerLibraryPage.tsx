import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Entitlement } from '../types/index.js';
import { Background3D } from '../components/Background3D.js';
import { TiltCard } from '../components/TiltCard.js';
import { Key, Download, Copy, Check, ShieldCheck, Sparkles, Layers, FileCode, AlertTriangle } from 'lucide-react';

export const CustomerLibraryPage: React.FC = () => {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entitlements/my-library');
      if (res.data.success) {
        setEntitlements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load entitlements library', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Download failed.');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D WebGL Background */}
      <Background3D />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-10">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-3d border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-glow-indigo mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Customer Digital Vault
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Your Licensed Software Library</h1>
          <p className="text-xs text-slate-400">Access active license keys, stream verified binaries, and manage software entitlements</p>
        </div>

        {/* License Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="glass-panel-3d rounded-3xl p-6 h-64 animate-pulse space-y-4">
                <div className="h-6 bg-slate-800/60 rounded w-1/2" />
                <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                <div className="h-10 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : entitlements.length === 0 ? (
          <div className="glass-panel-3d rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No active software entitlements</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore the Marketplace catalog to acquire software license keys and developer tools.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entitlements.map((ent) => {
              const product = ent.product;
              const latestVersion = product?.versions && product.versions.length > 0 
                ? (product.versions.find(v => v.isCurrent && !v.isRolledBack) || product.versions.find(v => v.isCurrent) || product.versions[0]) 
                : null;
              const rolledBackVersion = product?.versions?.find(v => v.isRolledBack);

              return (
                <TiltCard key={ent.id}>
                  <div className="glass-panel-3d rounded-3xl p-6 border border-white/10 space-y-5 h-full flex flex-col justify-between">
                    
                    <div className="space-y-4">
                      {/* Product Header */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex-shrink-0">
                          <img src={product?.logoUrl} alt={product?.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base font-display">{product?.title}</h3>
                          <span className="text-xs text-cyan-400 font-medium">{product?.tagline}</span>
                        </div>
                      </div>

                      {/* License Key Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" /> License Key
                          </span>
                          <span>Granted {new Date(ent.grantedAt || ent.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <code className="text-sm font-mono font-bold text-cyan-300 tracking-wider">
                            {ent.licenseKey}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ent.licenseKey)}
                            className="p-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 transition-colors"
                            title="Copy License Key"
                          >
                            {copiedKey === ent.licenseKey ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Version & Download Files */}
                      {latestVersion && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-indigo-400 font-semibold block">
                              Active Binary Release: {latestVersion.versionNumber} ({latestVersion.releaseTitle})
                            </span>
                            {rolledBackVersion && (
                              <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono">
                                <AlertTriangle className="w-3 h-3 text-amber-400" /> Stabilized Release
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {latestVersion.files && latestVersion.files.length > 0 ? (
                              latestVersion.files.map((file) => (
                                <button
                                  key={file.id}
                                  type="button"
                                  onClick={() => handleDownloadFile(file.id, file.fileName)}
                                  className="w-full p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between transition-colors group"
                                >
                                  <span className="flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-cyan-400" /> {file.fileName}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-300 group-hover:text-white">
                                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Asset
                                  </span>
                                </button>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 italic block">No downloadable binary files attached yet.</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: <strong className="text-emerald-400">{ent.status}</strong></span>
                      <span>Plan: <strong className="text-white">{ent.pricingPlan?.name || 'Standard License'}</strong></span>
                    </div>

                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

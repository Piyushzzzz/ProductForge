import React from 'react';
import { Layers, Github, Terminal, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#060E20]/90 backdrop-blur-md mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-glow">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">ProductForge</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Cloud-Based Digital Product Marketplace and Lifecycle Management Platform. Engineered for universities, software engineers, and digital toolmakers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Back-End Engineering Project
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>M1: Authentication & RBAC</li>
              <li>M2: Lifecycle State Engine</li>
              <li>M3: Marketplace Discovery</li>
              <li>M4: Release Versioning</li>
              <li>M5: Protected Binary Delivery</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
              Commerce & Telemetry
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>M6: Sandbox Order Checkout</li>
              <li>M7: Instant Entitlements & Keys</li>
              <li>M8: Verified Customer Reviews</li>
              <li>M9: Telemetry & Analytics</li>
              <li>M10: Real-Time WebSocket Alerts</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 ProductForge Platform. Academic Back-end Engineering Submission.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with TypeScript, Prisma, PostgreSQL & React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

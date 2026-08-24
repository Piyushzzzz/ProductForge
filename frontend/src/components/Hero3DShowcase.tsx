import React, { useState } from 'react';
import { Layers, ShieldCheck, Zap, Sparkles, Terminal, Activity } from 'lucide-react';

export const Hero3DShowcase: React.FC = () => {
  const [rotation, setRotation] = useState({ x: 12, y: -15 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setRotation({
      x: (-y / rect.height) * 25 + 10,
      y: (x / rect.width) * 25 - 15
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 12, y: -15 });
  };

  return (
    <div className="relative w-full max-w-lg mx-auto py-8 perspective-1200">
      {/* Ambient Neon Backglow Spheres */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-600/30 rounded-full blur-[90px] animate-pulse-glow pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-cyan-500/25 rounded-full blur-[90px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* 3D Isometric Card Stack */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d'
        }}
        className="relative z-10 glass-panel-3d rounded-3xl p-7 border border-white/15 shadow-2xl space-y-6 cursor-grab active:cursor-grabbing"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow-indigo">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-display">InvoicePro Cloud Billing</h3>
              <p className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live SemVer v1.2.0
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Entitled
          </span>
        </div>

        {/* Dynamic Telemetry Metric Cards in 3D Depth */}
        <div className="grid grid-cols-2 gap-3" style={{ transform: 'translateZ(45px)' }}>
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Monthly MRR</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-lg font-bold font-mono text-white">$14,280</p>
            <p className="text-[10px] text-emerald-400 font-medium">↑ +24.8% this month</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>License Keys Issued</span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-lg font-bold font-mono text-cyan-300">1,492</p>
            <p className="text-[10px] text-slate-400">PF-8A92-491F</p>
          </div>
        </div>

        {/* 3D Code Terminal Preview */}
        <div 
          className="p-3.5 rounded-2xl bg-[#070C1A] border border-white/10 font-mono text-[11px] text-slate-300 space-y-1.5 shadow-inner"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> CLI Download Stream
            </span>
            <span>SHA-256 Verified</span>
          </div>
          <p className="text-indigo-400">$ npx productforge-cli install @invoicepro/billing</p>
          <p className="text-slate-400">✔ Verified entitlement key PF-8A92-491F</p>
          <p className="text-emerald-400">✔ Streamed 4.8MB binary artifact in 240ms</p>
        </div>

        {/* Floating Action Badge */}
        <div className="flex items-center justify-between pt-1" style={{ transform: 'translateZ(75px)' }}>
          <div className="flex -space-x-2">
            {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'].map((src, idx) => (
              <img key={idx} src={src} alt="Buyer Avatar" className="w-7 h-7 rounded-full border-2 border-[#0B1326] object-cover" />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            492 Verified Buyers
          </span>
        </div>
      </div>
    </div>
  );
};

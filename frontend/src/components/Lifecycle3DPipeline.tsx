import React from 'react';
import { ProductStatus } from '../types/index.js';
import { FileEdit, TestTube, Rocket, Archive, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface Lifecycle3DPipelineProps {
  activeStatus: ProductStatus | 'ALL';
  onStatusChange: (status: ProductStatus | 'ALL') => void;
  counts: Record<string, number>;
}

export const Lifecycle3DPipeline: React.FC<Lifecycle3DPipelineProps> = ({
  activeStatus,
  onStatusChange,
  counts
}) => {
  const stages = [
    {
      id: 'DRAFT',
      title: '1. Draft Studio',
      desc: 'Schema & Pricing Config',
      icon: FileEdit,
      color: 'from-slate-600 to-slate-800',
      glow: 'shadow-glow-slate',
      badge: 'text-slate-300 bg-slate-800/80 border-slate-700'
    },
    {
      id: 'BETA',
      title: '2. Beta Sandbox',
      desc: 'Early Access & Testing',
      icon: TestTube,
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-glow-amber',
      badge: 'text-amber-300 bg-amber-950/80 border-amber-600/40'
    },
    {
      id: 'PUBLISHED',
      title: '3. Live Market',
      desc: 'Active Sales & Entitlements',
      icon: Rocket,
      color: 'from-indigo-500 via-cyan-500 to-emerald-500',
      glow: 'shadow-glow-cyan',
      badge: 'text-cyan-300 bg-indigo-950/80 border-cyan-500/40'
    },
    {
      id: 'ARCHIVED',
      title: '4. Archived',
      desc: 'Legacy Maintenance',
      icon: Archive,
      color: 'from-slate-700 to-zinc-900',
      glow: 'shadow-glow-zinc',
      badge: 'text-slate-400 bg-slate-900/80 border-slate-800'
    }
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> 3D Live Software Lifecycle Pipeline
          </h3>
          <p className="text-xs text-slate-400">Filter your products by their active software release lifecycle stage</p>
        </div>

        <button
          onClick={() => onStatusChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeStatus === 'ALL'
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          View All ({Object.values(counts).reduce((a, b) => a + b, 0)})
        </button>
      </div>

      {/* 3D Stage Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 perspective-1000">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStatus === stage.id;
          const count = counts[stage.id] || 0;

          return (
            <div key={stage.id} className="relative group">
              {/* Connector Arrow for desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>
              )}

              <button
                type="button"
                onClick={() => onStatusChange(stage.id as ProductStatus)}
                style={{
                  transform: isSelected ? 'translateZ(20px) scale(1.02)' : 'translateZ(0px)',
                  transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                className={`w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden glass-panel-3d ${
                  isSelected
                    ? 'border-cyan-400 shadow-glow-cyan bg-indigo-950/80'
                    : 'border-white/10 hover:border-white/20 hover:bg-slate-900/70'
                }`}
              >
                {/* Glowing Stage Header Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stage.badge}`}>
                    {count}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm mb-0.5 font-display flex items-center gap-1.5">
                  {stage.title}
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </h4>
                <p className="text-[11px] text-slate-400">{stage.desc}</p>

                {/* Selected Stage Light Bar */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

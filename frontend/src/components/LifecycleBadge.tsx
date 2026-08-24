import React from 'react';
import { ProductStatus } from '../types/index.js';

export const LifecycleBadge: React.FC<{ status: ProductStatus }> = ({ status }) => {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          PUBLISHED
        </span>
      );
    case 'BETA':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          BETA
        </span>
      );
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          DRAFT
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          ARCHIVED
        </span>
      );
    default:
      return null;
  }
};

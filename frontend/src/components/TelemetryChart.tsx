import React from 'react';

export interface TelemetryPoint {
  date?: string;
  month?: string;
  value?: number;
  revenue?: number;
  downloads?: number;
}

export const TelemetryChart: React.FC<{ data: TelemetryPoint[]; color?: string }> = ({ data, color = '#6366F1' }) => {
  if (!data || data.length === 0) return null;

  const points = data.map(d => ({
    label: d.date || d.month || '',
    val: d.value !== undefined ? d.value : (d.revenue !== undefined ? d.revenue : (d.downloads || 0))
  }));

  const maxVal = Math.max(...points.map((p) => p.val), 10);

  return (
    <div className="space-y-4">
      <div className="h-36 flex items-end gap-2 pt-6">
        {points.map((p, i) => {
          const heightPercent = Math.max(12, Math.round((p.val / maxVal) * 100));
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="w-full bg-slate-900/60 rounded-lg h-28 flex items-end p-1 relative">
                <div
                  style={{ height: `${heightPercent}%`, backgroundColor: color }}
                  className="w-full rounded group-hover:brightness-125 transition-all relative shadow-glow"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none whitespace-nowrap z-20">
                    {p.val}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

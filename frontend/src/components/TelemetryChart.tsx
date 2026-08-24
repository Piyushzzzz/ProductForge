import React from 'react';

interface TelemetryPoint {
  month: string;
  revenue: number;
  downloads: number;
}

export const TelemetryChart: React.FC<{ data: TelemetryPoint[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  const maxDownloads = Math.max(...data.map((d) => d.downloads), 10);

  return (
    <div className="space-y-6">
      {/* Revenue Graph Bar/Line Visualizer */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400">Monthly Gross Revenue</h4>
            <p className="text-xl font-bold font-display text-white mt-0.5">
              ${data[data.length - 1]?.revenue.toLocaleString()}
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            +18.4% this month
          </span>
        </div>

        {/* SVG Sparkline Curve */}
        <div className="h-32 flex items-end gap-3 pt-6">
          {data.map((d, i) => {
            const heightPercent = Math.max(15, Math.round((d.revenue / maxRevenue) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-900/60 rounded-lg h-24 flex items-end p-1 relative">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:brightness-125 transition-all relative"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none whitespace-nowrap">
                      ${d.revenue}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downloads Trend Graph */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400">Binary Artifact Downloads</h4>
            <p className="text-xl font-bold font-display text-cyan-400 mt-0.5">
              {data[data.length - 1]?.downloads.toLocaleString()} downloads
            </p>
          </div>
          <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Verified Releases
          </span>
        </div>

        <div className="h-28 flex items-end gap-3 pt-4">
          {data.map((d, i) => {
            const heightPercent = Math.max(15, Math.round((d.downloads / maxDownloads) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-900/60 rounded-lg h-20 flex items-end p-1 relative">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded bg-gradient-to-t from-cyan-600 to-emerald-400 group-hover:brightness-125 transition-all relative"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[10px] font-mono text-emerald-300 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none whitespace-nowrap">
                      {d.downloads} dl
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { ShoppingCart, Search, Filter, Activity, ArrowUpRight } from 'lucide-react';

export const CreatorOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch creator orders', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          o.productTitle.toLowerCase().includes(search.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white">Creator Sales & Orders</h1>
        <p className="text-xs text-slate-400">Order transaction history and billing audit trail across all your software products</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B1326]/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, product, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          {['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-glow-indigo'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel-3d rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
            <Activity className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Loading orders stream...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] font-mono border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredOrders.map((o) => (
                  <tr key={o.orderItemId} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-cyan-300 font-bold">#{o.orderNumber}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">{o.productTitle}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">{o.customerName}</td>
                    <td className="py-3.5 px-4 text-indigo-300">{o.planName}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{o.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 text-xs">
            <ShoppingCart className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>No orders found matching filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

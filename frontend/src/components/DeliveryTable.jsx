import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Filter, Package, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DeliveryTable({
  orders = [],
  onAddOrder,
  onEditOrder,
  onDeleteOrder,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#0C1322] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080E1A]">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, consignment ID, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0F172A] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#0F172A] border border-slate-700/80 rounded-xl focus:outline-hidden text-slate-200 font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {onAddOrder && (
          <button
            onClick={onAddOrder}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Order</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#080E1A]/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Customer & Location</th>
              <th className="py-3.5 px-4">Payload (Kg / M³)</th>
              <th className="py-3.5 px-4">Package Category</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Vehicle</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  {loading ? 'Loading delivery consignments...' : 'No delivery orders match the selected search criteria.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.orderId || order.id} className="hover:bg-[#111B2E]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {order.orderId || order.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{order.customer}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{order.address}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200 font-mono">{order.weightKg} kg</div>
                    <div className="text-[11px] text-slate-400 font-mono">{order.volumeM3} m³</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2.5 py-1 rounded-lg bg-[#0F172A] text-slate-300 font-semibold border border-slate-800">
                      {(order.packageType || 'parcel').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.priority} type="priority" />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {order.assignedTruckId ? (
                      <span className="text-cyan-300 font-mono text-[11px] bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        {order.assignedTruckId}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {onEditOrder && (
                      <button
                        onClick={() => onEditOrder(order)}
                        title="Edit Consignment"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteOrder && (
                      <button
                        onClick={() => onDeleteOrder(order.orderId || order.id)}
                        title="Delete Consignment"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-[#080E1A]/90 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
        <span>Showing {filteredOrders.length} of {orders.length} consignments</span>
        <span className="text-[11px] font-mono text-cyan-400">CVRP Multi-Constraint Bin Packed</span>
      </div>
    </div>
  );
}

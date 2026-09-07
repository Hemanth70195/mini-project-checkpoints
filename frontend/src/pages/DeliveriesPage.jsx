/**
 * DeliveriesPage.jsx
 * 
 * Shipment & Consignment Dispatch Management.
 * Features:
 * - Summary KPI cards (Total, In Transit, Delivered, Urgent)
 * - Search & status filtering
 * - Add & Edit delivery order modal with full coordinate & capacity validation
 * - REST API CRUD operations (GET, POST, PUT, DELETE /api/orders)
 */

import React, { useState, useEffect } from 'react';
import { Plus, X, Package, Check, AlertCircle, RefreshCw, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Topbar from '../components/Topbar';
import DeliveryTable from '../components/DeliveryTable';
import StatCard from '../components/StatCard';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../services/api';

export default function DeliveriesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customer: '',
    address: '',
    lat: 12.9716,
    lng: 77.5946,
    weightKg: 25,
    volumeM3: 0.25,
    packageType: 'small_parcel',
    priority: 1,
    description: ''
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenAddModal = () => {
    setEditingOrder(null);
    setFormData({
      customer: '',
      address: '',
      lat: 12.95 + (Math.random() * 0.1),
      lng: 77.55 + (Math.random() * 0.15),
      weightKg: 30,
      volumeM3: 0.3,
      packageType: 'small_parcel',
      priority: 1,
      description: ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customer: order.customer || '',
      address: order.address || '',
      lat: order.lat || 12.9716,
      lng: order.lng || 77.5946,
      weightKg: order.weightKg || 10,
      volumeM3: order.volumeM3 || 0.1,
      packageType: order.packageType || 'small_parcel',
      priority: order.priority || 1,
      description: order.description || '',
      status: order.status || 'pending'
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete consignment '${orderId}'?`)) {
      return;
    }
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => (o.orderId || o.id) !== orderId));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer || !formData.address) {
      setError('Customer name and delivery address are required.');
      return;
    }

    try {
      if (editingOrder) {
        const id = editingOrder.orderId || editingOrder.id;
        const res = await updateOrder(id, formData);
        if (res.success) {
          setOrders((prev) =>
            prev.map((o) => ((o.orderId || o.id) === id ? res.data : o))
          );
          setModalOpen(false);
        }
      } else {
        const res = await createOrder(formData);
        if (res.success) {
          setOrders((prev) => [res.data, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const totalOrders = orders.length;
  const inTransitOrders = orders.filter(o => o.status === 'in_transit' || o.status === 'assigned').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const urgentOrders = orders.filter(o => o.priority === 3).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900">
      <Topbar
        title="Delivery Order Management"
        subtitle="Manage customer consignments, dimensional constraints, and priorities"
        onRefresh={loadOrders}
        isRefreshing={loading}
        actions={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Consignment</span>
          </button>
        }
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Consignments"
            value={totalOrders}
            subtext="Registered orders"
            icon={Package}
            accentColor="indigo"
          />
          <StatCard
            title="Dispatched / Transit"
            value={inTransitOrders}
            subtext="Allocated to fleet"
            icon={Layers}
            accentColor="blue"
          />
          <StatCard
            title="Completed Deliveries"
            value={deliveredOrders}
            subtext="Signed e-receipts"
            icon={CheckCircle2}
            accentColor="emerald"
          />
          <StatCard
            title="Urgent Priority"
            value={urgentOrders}
            subtext="Expedited priority tier"
            icon={ShieldAlert}
            accentColor="rose"
          />
        </div>

        {/* Consignments Table */}
        <DeliveryTable
          orders={orders}
          loading={loading}
          onAddOrder={handleOpenAddModal}
          onEditOrder={handleOpenEditModal}
          onDeleteOrder={handleDelete}
        />
      </main>

      {/* Add / Edit Delivery Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">
                  {editingOrder ? 'Edit Consignment' : 'New Delivery Consignment'}
                </h3>
                <p className="text-xs text-slate-500">Specify package weight, volume, and coordinates</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Customer / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems Campus Gate 2"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Delivery Destination Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outer Ring Road, Marathahalli, Bengaluru"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={formData.volumeM3}
                    onChange={(e) => setFormData({ ...formData, volumeM3: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Category</label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="small_parcel">Small Parcel</option>
                    <option value="electronics">Electronics</option>
                    <option value="appliances">Appliances</option>
                    <option value="apparel">Apparel & Textiles</option>
                    <option value="furniture">Furniture</option>
                    <option value="heavy_machinery">Heavy Machinery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority Tier</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-pointer"
                  >
                    <option value={1}>Tier 1 (Standard)</option>
                    <option value={2}>Tier 2 (Medium)</option>
                    <option value={3}>Tier 3 (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">GPS Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">GPS Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {editingOrder ? 'Update Consignment' : 'Save & Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

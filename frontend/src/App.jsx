import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import DeliveriesPage from './pages/DeliveriesPage';
import FleetPage from './pages/FleetPage';
import OptimizationPage from './pages/OptimizationPage';
import TrackingPage from './pages/TrackingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DriverApp from './pages/DriverApp';

/**
 * AdminLayout
 * Encapsulates the dark sidebar and main dashboard scrollable content area.
 */
function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin Operations Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="optimization" element={<OptimizationPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Driver Mobile Cab Application (standalone responsive view) */}
      <Route path="/driver" element={<DriverApp />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

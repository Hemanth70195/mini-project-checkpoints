import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Navigation,
  Package,
  Truck,
  BarChart3,
  Smartphone,
  Radio,
  Zap,
  Activity,
  Layers,
  MapPin
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Sidebar() {
  const { isConnected } = useSocket();

  const navItems = [
    { to: '/admin', label: 'Command Center', icon: LayoutDashboard, end: true, badge: 'Hub' },
    { to: '/admin/optimization', label: 'AI Optimizer', icon: Cpu, badge: 'CVRP' },
    { to: '/admin/tracking', label: 'Live Radar', icon: Navigation, badge: '60fps' },
    { to: '/admin/deliveries', label: 'Shipments', icon: Package },
    { to: '/admin/fleet', label: 'Fleet Hub', icon: Truck },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 bg-[#070C16] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800/90 shrink-0 z-30 select-none shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-b from-[#0C1424] to-[#070C16]">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base leading-tight tracking-tight flex items-center gap-1.5">
              OptiFleet <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-cyan-300 font-bold border border-cyan-500/30 tracking-wider">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Fleet Logistics</p>
          </div>
        </Link>
      </div>

      {/* Operations Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
          Fleet Operations
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#0F172A] border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-medium">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-6">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            Driver & Field Terminal
          </p>
          <Link
            to="/driver"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Driver Cab App</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40">
              Interactive
            </span>
          </Link>
        </div>
      </nav>

      {/* Bottom Telemetry & Status Hub */}
      <div className="p-4 border-t border-slate-800/80 bg-[#05080F]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Live Telemetry
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            {isConnected ? 'ONLINE' : 'STANDBY'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-1">
          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="truncate">Hub: Yeshwanthpur FC (BLR)</span>
        </div>
      </div>
    </aside>
  );
}

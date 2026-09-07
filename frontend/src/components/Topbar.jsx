import React from 'react';
import { MapPin, Sparkles, Radio, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Topbar({ title, subtitle, actions, onRefresh = null, isRefreshing = false }) {
  const { isConnected } = useSocket();

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
            Enterprise Fleet
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Depot / Hub Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Hub: <strong className="text-slate-900 font-semibold">Yeshwanthpur FC (BLR)</strong></span>
        </div>

        {/* AI Engine Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Simulated Annealing Active</span>
        </div>

        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className={isConnected ? 'text-emerald-700' : 'text-rose-700'}>
            {isConnected ? 'LIVE 60 FPS' : 'STANDBY'}
          </span>
        </div>

        {/* Optional quick refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Dynamic actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

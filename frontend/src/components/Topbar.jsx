import React from 'react';
import { MapPin, Sparkles, Radio, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Topbar({ title, subtitle, actions, onRefresh = null, isRefreshing = false }) {
  const { isConnected } = useSocket();

  return (
    <header className="bg-[#090F1C]/90 backdrop-blur-md border-b border-slate-800/90 px-6 sm:px-8 py-3.5 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 shadow-lg">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{title}</h2>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-cyan-300 font-bold border border-cyan-500/20">
            v1.0-ENTERPRISE
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Depot / Hub Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 shadow-inner">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-medium">Depot: <strong className="text-white">Yeshwanthpur FC (BLR)</strong></span>
        </div>

        {/* AI Engine Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-semibold">Simulated Annealing Engine Active</span>
        </div>

        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
            {isConnected ? 'LIVE 60 FPS' : 'OFFLINE'}
          </span>
        </div>

        {/* Optional quick refresh button if passed */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        {/* Dynamic actions passed by each page */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

import React from 'react';
import { Truck, Navigation, Fuel, Clock, CheckCircle2, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';

const BORDER_COLORS = [
  'border-indigo-500',
  'border-cyan-500',
  'border-emerald-500',
  'border-amber-500',
  'border-purple-500',
  'border-pink-500'
];

const TEXT_COLORS = [
  'text-indigo-400',
  'text-cyan-400',
  'text-emerald-400',
  'text-amber-400',
  'text-purple-400',
  'text-pink-400'
];

export default function RouteCard({ trip, truckIndex = 0 }) {
  const borderColor = BORDER_COLORS[truckIndex % BORDER_COLORS.length];
  const textColor = TEXT_COLORS[truckIndex % TEXT_COLORS.length];
  const waypoints = trip.routeWaypoints || [];

  return (
    <div className={`bg-[#0C1322] rounded-2xl border border-slate-800 shadow-md overflow-hidden border-l-4 ${borderColor} transition-all hover:border-slate-700`}>
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#080E1A]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800/80 text-white border border-slate-700/60">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{trip.truckName || trip.truckId}</h4>
            <p className="text-[11px] text-slate-400 font-mono">Trip: {trip.tripId}</p>
          </div>
        </div>
        <StatusBadge status={trip.status || 'planned'} />
      </div>

      <div className="p-4 space-y-3.5">
        {/* Metric Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#080E1A] p-2.5 rounded-xl border border-slate-800/90">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3 text-indigo-400" /> Loop
            </div>
            <div className="font-black text-white mt-1">{trip.totalDistanceKm} km</div>
          </div>
          <div className="bg-[#080E1A] p-2.5 rounded-xl border border-slate-800/90">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
              <Fuel className="w-3 h-3 text-amber-400" /> Fuel
            </div>
            <div className="font-black text-amber-400 mt-1">{trip.estimatedFuelLitres || 0} L</div>
          </div>
          <div className="bg-[#080E1A] p-2.5 rounded-xl border border-slate-800/90">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> Time
            </div>
            <div className="font-black text-emerald-400 mt-1">{trip.estimatedDurationMinutes || 0}m</div>
          </div>
        </div>

        {/* Waypoint Timeline */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Stops Sequence ({waypoints.length})</span>
            <span className="text-[10px] font-mono text-cyan-400">Closed-Loop</span>
          </div>

          {waypoints.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center italic bg-[#080E1A] rounded-xl border border-slate-800">
              Vehicle on standby at central depot (no assigned stops).
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {/* Central Depot Start */}
              <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-[#080E1A] p-2 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                  D
                </span>
                <span className="font-semibold text-slate-300 truncate">Depot (Yeshwanthpur Center)</span>
              </div>

              {waypoints.map((wp, idx) => (
                <div
                  key={wp.orderId || idx}
                  className="flex items-center justify-between gap-2 text-xs bg-[#090F1C] p-2 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{wp.customer}</div>
                      <div className="text-[10px] text-slate-400 truncate">{wp.address}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-cyan-300">{wp.weightKg} kg</span>
                  </div>
                </div>
              ))}

              {/* Central Depot Return */}
              <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-[#080E1A] p-2 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                  D
                </span>
                <span className="font-semibold text-slate-300 truncate">Return to Central Depot</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

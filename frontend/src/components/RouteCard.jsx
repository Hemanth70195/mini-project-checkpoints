import React from 'react';
import { Truck, Navigation, Fuel, Clock, CheckCircle2, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';

const BORDER_COLORS = [
  'border-indigo-500',
  'border-sky-500',
  'border-emerald-500',
  'border-amber-500',
  'border-purple-500',
  'border-pink-500'
];

export default function RouteCard({ trip, truckIndex = 0 }) {
  const borderColor = BORDER_COLORS[truckIndex % BORDER_COLORS.length];
  const waypoints = trip.routeWaypoints || [];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden border-l-4 ${borderColor} transition-all hover:shadow-sm`}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{trip.truckName || trip.truckId}</h4>
            <p className="text-[11px] text-slate-500 font-mono">Trip ID: {trip.tripId}</p>
          </div>
        </div>
        <StatusBadge status={trip.status || 'planned'} />
      </div>

      <div className="p-4 space-y-3.5">
        {/* Metric Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3 text-indigo-600" /> Loop
            </div>
            <div className="font-bold text-slate-900 mt-1">{trip.totalDistanceKm} km</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
              <Fuel className="w-3 h-3 text-amber-600" /> Est. Fuel
            </div>
            <div className="font-bold text-slate-900 mt-1">{trip.estimatedFuelLitres || 0} L</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" /> Duration
            </div>
            <div className="font-bold text-slate-900 mt-1">{trip.estimatedDurationMinutes || 0}m</div>
          </div>
        </div>

        {/* Waypoint Timeline */}
        <div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Stops Sequence ({waypoints.length})</span>
            <span className="text-[10px] font-mono text-indigo-600">Closed-Loop</span>
          </div>

          {waypoints.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center italic bg-slate-50 rounded-xl border border-slate-100">
              Vehicle on standby at central depot (no assigned stops).
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {/* Central Depot Start */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  D
                </span>
                <span className="font-semibold text-slate-800 truncate">Depot (Yeshwanthpur Center)</span>
              </div>

              {waypoints.map((wp, idx) => (
                <div
                  key={wp.orderId || idx}
                  className="flex items-center justify-between gap-2 text-xs bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">{wp.customer}</div>
                      <div className="text-[10px] text-slate-500 truncate">{wp.address}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-slate-700">{wp.weightKg} kg</span>
                  </div>
                </div>
              ))}

              {/* Central Depot Return */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  D
                </span>
                <span className="font-semibold text-slate-800 truncate">Return to Central Depot</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

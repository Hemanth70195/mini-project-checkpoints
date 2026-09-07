import React from 'react';
import { Truck as TruckIcon, User, Fuel, Gauge } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TruckTable({
  trucks = [],
  truckLocations = {},
  onSelectTruck,
  selectedTruckId = null
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Fleet Vehicle Telematics & Inventory</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time load capacity limits, fuel economy, and driver assignments</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 font-bold text-slate-700 border border-slate-200">
          {trucks.length} Vehicles in Fleet
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Truck Model & ID</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Driver Assigned</th>
              <th className="py-3 px-4">Payload Limits</th>
              <th className="py-3 px-4">Mileage & Fuel</th>
              <th className="py-3 px-4">Live Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trucks.map((truck) => {
              const truckId = truck.truckId || truck.id;
              const telemetry = truckLocations[truckId] || {};
              const isSelected = selectedTruckId === truckId;

              return (
                <tr
                  key={truckId}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    isSelected ? 'bg-indigo-50/40 border-l-2 border-indigo-600' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
                        <TruckIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{truck.name}</div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">{truckId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={truck.type} type="truckType" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{truck.driver?.name || 'Staff Driver'}</span>
                    </div>
                    {truck.driver?.phone && (
                      <div className="text-[11px] text-slate-500 ml-5 font-mono">{truck.driver.phone}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 text-slate-700">
                      <div>
                        <span className="text-slate-400 text-[11px]">Weight: </span>
                        <strong className="text-slate-900 font-mono">{truck.maxWeightKg} kg</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Volume: </span>
                        <strong className="text-slate-900 font-mono">{truck.maxVolumeM3} m³</strong>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span>{truck.baseMileageKmPerLitre} km/L</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 mt-0.5 font-medium">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      <span>{telemetry.fuelPercent !== undefined ? `${telemetry.fuelPercent}%` : `${truck.fuelCapacityLitres}L Tank`}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={telemetry.status || truck.status || 'idle'} />
                    {telemetry.speedKmh > 0 && (
                      <div className="text-[11px] font-bold text-indigo-600 mt-1 font-mono">
                        {telemetry.speedKmh} km/h
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {onSelectTruck && (
                      <button
                        onClick={() => onSelectTruck(truckId)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

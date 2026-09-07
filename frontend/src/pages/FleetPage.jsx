/**
 * FleetPage.jsx
 * 
 * Fleet Hub & Vehicle Telematics Management.
 * Centered around the prominent selected-truck visualization (inspired by Reference Image 6):
 * - Large hero TruckVisualizer at the center/hero section
 * - Vehicle fleet cards grid showing capacities, drivers, and fuel
 * - Detailed fleet specification table
 */

import React, { useState, useEffect } from 'react';
import { Truck as TruckIcon, User, Fuel, Gauge, Shield, RefreshCw, Layers } from 'lucide-react';
import Topbar from '../components/Topbar';
import TruckTable from '../components/TruckTable';
import TruckVisualizer from '../components/TruckVisualizer';
import StatusBadge from '../components/StatusBadge';
import { getTrucks, getTrips } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function FleetPage() {
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('TRUCK_MED_01');
  const [loading, setLoading] = useState(true);

  const { truckLocations } = useSocket();

  const loadFleetData = async () => {
    try {
      setLoading(true);
      const [trkRes, trpRes] = await Promise.all([getTrucks(), getTrips()]);
      const trkList = trkRes.data || [];
      setTrucks(trkList);
      setTrips(trpRes.data || []);
      if (trkList.length > 0 && !selectedTruckId) {
        setSelectedTruckId(trkList[0].truckId || trkList[0].id);
      }
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleetData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14] text-slate-100">
      <Topbar
        title="Fleet Vehicle Hub"
        subtitle="Manage vehicle capacity limits, fuel efficiency profiles, and driver assignments"
        onRefresh={loadFleetData}
        isRefreshing={loading}
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Hero Section: Central Prominent Truck Visualizer (Reference Image 6) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Active Vehicle Telemetry & Inspection
            </h3>
            <span className="text-xs font-mono text-cyan-400">Select any vehicle to inspect</span>
          </div>
          <TruckVisualizer
            trucks={trucks}
            selectedTruckId={selectedTruckId}
            onSelectTruck={(id) => setSelectedTruckId(id)}
            truckLocations={truckLocations}
            trips={trips}
          />
        </div>

        {/* Fleet Cards Grid for all vehicles */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Fleet Inventory & Load Distribution
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trucks.map((truck) => {
              const truckId = truck.truckId || truck.id;
              const telemetry = truckLocations[truckId] || {};
              const assignedTrip = trips.find(t => t.truckId === truckId);
              const isSelected = selectedTruckId === truckId;

              const loadWeight = assignedTrip?.totalWeightKg || 0;
              const loadVol = assignedTrip?.totalVolumeM3 || 0;
              const weightPercent = Math.min(100, Math.round((loadWeight / truck.maxWeightKg) * 100));
              const volumePercent = Math.min(100, Math.round((loadVol / truck.maxVolumeM3) * 100));

              return (
                <div
                  key={truckId}
                  onClick={() => setSelectedTruckId(truckId)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-950/40'
                      : 'bg-[#0C1322] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {truckId}
                        </span>
                        <h4 className="font-black text-white text-base mt-2">{truck.name}</h4>
                      </div>
                      <StatusBadge status={telemetry.status || truck.status || 'idle'} />
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Shield className="w-3.5 h-3.5 text-indigo-400" /> Class
                        </span>
                        <StatusBadge status={truck.type} type="truckType" />
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-indigo-400" /> Driver
                        </span>
                        <span className="font-semibold text-white">{truck.driver?.name || 'Staff Driver'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Gauge className="w-3.5 h-3.5 text-sky-400" /> Mileage
                        </span>
                        <span className="font-mono text-slate-200">{truck.baseMileageKmPerLitre} km/L</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Fuel className="w-3.5 h-3.5 text-amber-400" /> Fuel Level
                        </span>
                        <span className="font-bold text-amber-400">
                          {telemetry.fuelPercent !== undefined ? `${telemetry.fuelPercent}%` : `${truck.fuelCapacityLitres}L`}
                        </span>
                      </div>
                    </div>

                    {/* Utilization Meters */}
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Weight Load</span>
                          <strong className="text-white font-mono">{loadWeight} / {truck.maxWeightKg} kg ({weightPercent}%)</strong>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              weightPercent > 90 ? 'bg-amber-400' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${weightPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Volume Load</span>
                          <strong className="text-white font-mono">{loadVol} / {truck.maxVolumeM3} m³ ({volumePercent}%)</strong>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              volumePercent > 90 ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${volumePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between font-mono">
                    <span>Stops: {assignedTrip?.routeWaypoints?.length || 0}</span>
                    <span>Loop: {assignedTrip?.totalDistanceKm || 0} km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Fleet Table */}
        <TruckTable
          trucks={trucks}
          truckLocations={truckLocations}
          selectedTruckId={selectedTruckId}
          onSelectTruck={(id) => setSelectedTruckId(id)}
        />
      </main>
    </div>
  );
}

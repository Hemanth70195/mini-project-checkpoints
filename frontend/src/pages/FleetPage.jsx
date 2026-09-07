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
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Vehicle Telemetry & Inspection
            </h3>
            <span className="text-xs font-mono text-indigo-600 font-semibold">Select any vehicle to inspect</span>
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/20 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                          {truckId}
                        </span>
                        <h4 className="font-black text-slate-900 text-base mt-2">{truck.name}</h4>
                      </div>
                      <StatusBadge status={telemetry.status || truck.status || 'idle'} />
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Shield className="w-3.5 h-3.5 text-indigo-600" /> Class
                        </span>
                        <StatusBadge status={truck.type} type="truckType" />
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-indigo-600" /> Driver
                        </span>
                        <span className="font-semibold text-slate-900">{truck.driver?.name || 'Staff Driver'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Gauge className="w-3.5 h-3.5 text-teal-600" /> Mileage
                        </span>
                        <span className="font-mono text-slate-700">{truck.baseMileageKmPerLitre} km/L</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Fuel className="w-3.5 h-3.5 text-amber-600" /> Fuel Level
                        </span>
                        <span className="font-bold text-amber-700">
                          {telemetry.fuelPercent !== undefined ? `${telemetry.fuelPercent}%` : `${truck.fuelCapacityLitres}L`}
                        </span>
                      </div>
                    </div>

                    {/* Utilization Meters */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-500 mb-1">
                          <span>Weight Load</span>
                          <strong className="text-slate-900 font-mono">{loadWeight} / {truck.maxWeightKg} kg ({weightPercent}%)</strong>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              weightPercent > 90 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${weightPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-500 mb-1">
                          <span>Volume Load</span>
                          <strong className="text-slate-900 font-mono">{loadVol} / {truck.maxVolumeM3} m³ ({volumePercent}%)</strong>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              volumePercent > 90 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${volumePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-mono">
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

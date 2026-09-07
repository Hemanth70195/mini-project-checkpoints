/**
 * TrackingPage.jsx
 * 
 * Live Real-Time Fleet Radar & GPS Telemetry Dashboard.
 * Professional 3-Column Layout:
 * - Left: Fleet / Vehicle List with status and speed
 * - Center: Large interactive geospatial radar map
 * - Right: Selected truck telemetry HUD & Socket.IO drop-off activity feed
 * 
 * Preserves existing Socket.IO listeners (admin:truck-location & admin:delivery-status)
 * and controls the backend Autonomous Route Simulator.
 */

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Radio,
  Play,
  Square,
  Truck,
  Gauge,
  Compass,
  Clock,
  Activity,
  CheckCircle2,
  Fuel,
  MapPin,
  User,
  Phone,
  Shield,
  Layers
} from 'lucide-react';

import Topbar from '../components/Topbar';
import MapViewer from '../components/MapViewer';
import StatusBadge from '../components/StatusBadge';
import { getOrders, getTrucks, getTrips } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function TrackingPage() {
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('TRUCK_MINI_01');
  const [simulating, setSimulating] = useState(false);

  const {
    isConnected,
    truckLocations,
    recentEvents,
    startSimulator,
    stopSimulator
  } = useSocket();

  useEffect(() => {
    async function loadData() {
      try {
        const [ordRes, trkRes, trpRes] = await Promise.all([
          getOrders(),
          getTrucks(),
          getTrips()
        ]);
        setOrders(ordRes.data || []);
        const trkList = trkRes.data || [];
        setTrucks(trkList);
        setTrips(trpRes.data || []);
        if (trkList.length > 0 && !selectedTruckId) {
          setSelectedTruckId(trkList[0].truckId || trkList[0].id);
        }
      } catch (err) {
        console.error('Failed to load tracking data:', err);
      }
    }
    loadData();
  }, []);

  const handleToggleSimulation = async () => {
    if (simulating) {
      await stopSimulator(selectedTruckId);
      setSimulating(false);
    } else {
      setSimulating(true);
      const res = await startSimulator(selectedTruckId, 400);
      if (!res.success) {
        alert('Could not start simulator: ' + (res.error || 'Server error'));
        setSimulating(false);
      }
    }
  };

  const activeTelemetry = truckLocations[selectedTruckId] || {};
  const currentTruck = trucks.find(t => (t.truckId || t.id) === selectedTruckId) || trucks[0];
  const assignedTrip = trips.find(t => t.truckId === selectedTruckId);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900">
      <Topbar
        title="Live Fleet Radar & Telematics"
        subtitle="Real-time WebSocket GPS telemetry stream broadcast from field driver cabs"
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Status & Autonomous Simulator Control Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}>
              <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Socket.IO Telemetry Stream: {isConnected ? 'Active & Receiving' : 'Standby'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {isConnected ? '60 FPS DYNAMIC' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Subscribed to <code className="text-indigo-600 font-mono font-semibold">admin:truck-location</code> & <code className="text-indigo-600 font-mono font-semibold">admin:delivery-status</code>
              </p>
            </div>
          </div>

          {/* Autonomous Route Simulator Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedTruckId}
              onChange={(e) => {
                setSelectedTruckId(e.target.value);
                setSimulating(false);
              }}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              {trucks.map((t) => (
                <option key={t.truckId || t.id} value={t.truckId || t.id}>
                  {t.name} ({t.truckId || t.id})
                </option>
              ))}
            </select>

            <button
              onClick={handleToggleSimulation}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                simulating
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {simulating ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Simulator</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Live Demo Simulator</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-Column Professional Fleet Tracking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Fleet / Vehicle List (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Fleet Radar ({trucks.length})</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Select to track</span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {trucks.map((truck) => {
                const truckId = truck.truckId || truck.id;
                const telemetry = truckLocations[truckId] || {};
                const isSelected = selectedTruckId === truckId;
                const isMoving = telemetry.speedKmh > 0 || truck.status === 'in_transit';

                return (
                  <div
                    key={truckId}
                    onClick={() => {
                      setSelectedTruckId(truckId);
                      setSimulating(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400/80 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{truck.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{truckId}</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                      <StatusBadge status={telemetry.status || truck.status || 'idle'} />
                      <span className="font-mono text-indigo-700 font-bold">
                        {telemetry.speedKmh ? `${telemetry.speedKmh} km/h` : '0 km/h'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER: Large Interactive Radar Map (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Geospatial Fleet Radar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time GPS coordinate pings update without reloading</p>
              </div>
              {activeTelemetry.speedKmh > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Activity className="w-3.5 h-3.5 animate-spin" /> Moving at {activeTelemetry.speedKmh} km/h
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[580px]">
              <MapViewer
                orders={orders}
                trucks={trucks}
                trips={trips}
                truckLocations={truckLocations}
                selectedTruckId={selectedTruckId}
                height="580px"
              />
            </div>
          </div>

          {/* RIGHT: Selected Truck Details & Live Event Activity Log (3 Cols) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            {/* Selected Truck Telematics Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">
                      {currentTruck?.name || selectedTruckId}
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-600 font-semibold">{selectedTruckId}</span>
                  </div>
                </div>
                <StatusBadge status={activeTelemetry.status || currentTruck?.status || 'idle'} />
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" /> Speed
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {activeTelemetry.speedKmh ? `${activeTelemetry.speedKmh} km/h` : '0 km/h'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-teal-600" /> Heading
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {activeTelemetry.heading !== undefined ? `${activeTelemetry.heading}°` : '0°'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">GPS Latitude:</span>
                  <span className="font-mono font-bold text-slate-800">{activeTelemetry.latitude?.toFixed(5) || '13.0280'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">GPS Longitude:</span>
                  <span className="font-mono font-bold text-slate-800">{activeTelemetry.longitude?.toFixed(5) || '77.5409'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Driver Assigned:</span>
                  <span className="font-semibold text-slate-900">{currentTruck?.driver?.name || 'Staff Driver'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Fuel Level:</span>
                  <span className="font-bold text-amber-700">{activeTelemetry.fuelPercent || 85}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Remaining Route:</span>
                  <span className="font-bold text-emerald-700">{assignedTrip?.totalDistanceKm || 38.6} km</span>
                </div>
              </div>
            </div>

            {/* Real-Time Drop-off Events Stream */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex-1">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Live Delivery Activity Log</h4>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {recentEvents.length === 0 ? (
                  <div className="text-xs text-slate-400 py-6 text-center italic bg-slate-50 rounded-xl border border-slate-200/70">
                    Awaiting real-time drop-off confirmations...
                  </div>
                ) : (
                  recentEvents.map((ev, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-slate-700"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-700 font-mono">{ev.orderId}</span>
                        <span className="text-[10px] text-emerald-800 font-bold uppercase">
                          {ev.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Completed by {ev.truckId} • {new Date(ev.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

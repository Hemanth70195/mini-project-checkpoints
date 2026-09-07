/**
 * DriverApp.jsx
 * 
 * Mobile & Tablet Driver In-Cab Assistant & Navigation Terminal.
 * Inspired by Reference Images 2 & 5:
 * - Automotive cockpit digital HUD with speedometer, heading, and live GPS status
 * - Embedded in-cab route map showing current position & delivery stops
 * - Next waypoint navigation card with customer, address, cargo payload
 * - Driver Rest recommendation (Highway Oasis) & Fuel station recommendation (Indian Oil Plaza)
 * - Field driver action controls: "Mark Arrived", "Mark Delivered", and Autonomous GPS simulation
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Navigation,
  Fuel,
  Clock,
  CheckCircle2,
  Play,
  Square,
  MapPin,
  AlertTriangle,
  Coffee,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  Map as MapIcon,
  Phone,
  Package
} from 'lucide-react';

import MapViewer from '../components/MapViewer';
import StatusBadge from '../components/StatusBadge';
import { getTrucks, getTrips, getOrders } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function DriverApp() {
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('TRUCK_MINI_01');
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showMap, setShowMap] = useState(true);

  const {
    isConnected,
    truckLocations,
    emitDeliveryStatus,
    startSimulator,
    stopSimulator
  } = useSocket();

  useEffect(() => {
    async function load() {
      try {
        const [trkRes, trpRes, ordRes] = await Promise.all([
          getTrucks(),
          getTrips(),
          getOrders()
        ]);
        setTrucks(trkRes.data || []);
        setTrips(trpRes.data || []);
        setOrders(ordRes.data || []);
      } catch (err) {
        console.error('Failed to load driver app data:', err);
      }
    }
    load();
  }, []);

  const currentTruck = trucks.find(t => (t.truckId || t.id) === selectedTruckId);
  const currentTrip = trips.find(t => t.truckId === selectedTruckId) || trips[0];
  const telemetry = truckLocations[selectedTruckId] || {};

  const waypoints = currentTrip?.routeWaypoints || [];
  const activeWaypoint = waypoints[currentWaypointIdx] || waypoints[0];

  const handleStartTrip = async () => {
    setIsSimulating(true);
    setFeedbackMsg('Autonomous navigation started. Transmitting live GPS pings...');
    const res = await startSimulator(selectedTruckId, 400);
    if (!res.success) {
      setIsSimulating(false);
      setFeedbackMsg('Failed to start trip simulator: ' + (res.error || 'Server error'));
    }
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleStopTrip = async () => {
    await stopSimulator(selectedTruckId);
    setIsSimulating(false);
    setFeedbackMsg('Trip simulation paused.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleMarkArrived = () => {
    if (!activeWaypoint) return;
    setFeedbackMsg(`Arrived at ${activeWaypoint.customer}. Vehicle secured for offload.`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleMarkDelivered = () => {
    if (!activeWaypoint) return;
    emitDeliveryStatus({
      orderId: activeWaypoint.orderId,
      truckId: selectedTruckId,
      status: 'delivered',
      notes: 'Customer signed e-receipt on driver mobile terminal'
    });

    setFeedbackMsg(`Consignment ${activeWaypoint.orderId} marked as DELIVERED!`);
    setTimeout(() => setFeedbackMsg(''), 3500);

    if (currentWaypointIdx < waypoints.length - 1) {
      setCurrentWaypointIdx(prev => prev + 1);
    }
  };

  const fuelPercent = telemetry.fuelPercent !== undefined ? telemetry.fuelPercent : 85;
  const progressPercent = waypoints.length > 0 
    ? Math.round(((currentWaypointIdx) / waypoints.length) * 100) 
    : 0;

  // Single trip for the driver map
  const driverTrips = currentTrip ? [currentTrip] : [];
  const driverTrucks = currentTruck ? [currentTruck] : [];

  return (
    <div className="min-h-screen bg-[#050912] text-slate-100 flex flex-col items-center justify-start p-2 sm:p-6 font-sans select-none">
      <div className="w-full max-w-lg bg-[#0A101D] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[92vh]">
        {/* Automotive Cockpit Top Bar */}
        <header className="p-4 bg-[#080D18]/95 border-b border-slate-800/90 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Center</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {isConnected ? 'GPS CONNECTED' : 'OFFLINE'}
            </span>
          </div>
        </header>

        {/* Truck Selector & Driver Header */}
        <div className="p-4 bg-gradient-to-b from-[#0D1527] to-[#0A101D] border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-300 shadow-inner">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <select
                  value={selectedTruckId}
                  onChange={(e) => {
                    setSelectedTruckId(e.target.value);
                    setCurrentWaypointIdx(0);
                    setIsSimulating(false);
                  }}
                  className="bg-[#070C16] text-white font-black text-sm border border-slate-700 rounded-xl px-2.5 py-1 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  {trucks.map((t) => (
                    <option key={t.truckId || t.id} value={t.truckId || t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span>Driver:</span>
                  <strong className="text-slate-200">{currentTruck?.driver?.name || 'Ramesh Kumar'}</strong>
                </p>
              </div>
            </div>

            <StatusBadge status={isSimulating ? 'in_transit' : 'idle'} />
          </div>

          {/* Feedback Toast Banner */}
          {feedbackMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Scrollable Cockpit Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Digital Speedometer & Automotive Gauges HUD */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-[#070C16] p-3 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Speed</div>
              <div className="text-2xl font-black text-white mt-0.5 font-mono">
                {telemetry.speedKmh ? `${telemetry.speedKmh}` : '0'} <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </div>
            </div>

            <div className="bg-[#070C16] p-3 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Fuel</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5 font-mono">
                {fuelPercent}%
              </div>
            </div>

            <div className="bg-[#070C16] p-3 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Remaining</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">
                {currentTrip?.totalDistanceKm || 38.6} <span className="text-[10px] font-normal text-slate-400">km</span>
              </div>
            </div>
          </div>

          {/* In-Cab Interactive Route Map (Inspired by Reference Images 2 & 5) */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#070C16] shadow-lg">
            <div className="p-2.5 bg-[#080D18] border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>In-Cab Route Navigation</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live GPS Radar</span>
            </div>

            <div className="h-48 w-full">
              <MapViewer
                orders={orders}
                trucks={driverTrucks}
                trips={driverTrips}
                truckLocations={truckLocations}
                selectedTruckId={selectedTruckId}
                height="192px"
              />
            </div>
          </div>

          {/* Current Waypoint Navigation Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-[#0B1322] to-[#070C16] border border-indigo-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> Next Destination Stop
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
                Stop {currentWaypointIdx + 1} of {waypoints.length}
              </span>
            </div>

            {activeWaypoint ? (
              <div className="space-y-2 mt-1">
                <h3 className="text-lg font-black text-white leading-snug tracking-tight">
                  {activeWaypoint.customer}
                </h3>
                <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{activeWaypoint.address}</span>
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#070C16] p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Consignment</span>
                    <div className="font-mono text-cyan-300 font-black text-sm">{activeWaypoint.orderId}</div>
                  </div>
                  <div className="bg-[#070C16] p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Cargo Payload</span>
                    <div className="font-bold text-white text-sm">{activeWaypoint.weightKg} kg ({activeWaypoint.volumeM3} m³)</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center italic">
                All scheduled consignments delivered! Return to Yeshwanthpur Central Depot.
              </div>
            )}
          </div>

          {/* Route Progress Stepper */}
          <div className="bg-[#070C16] p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Trip Route Completion</span>
              <strong className="text-cyan-400 font-mono">{progressPercent}% Completed</strong>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Rest Stop Recommendation & Fuel Station Advisory */}
          <div className="space-y-2.5">
            {/* Rest Recommendation */}
            <div className="bg-[#070C16] border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-bold">Driver Rest Recommendation</strong>
                <p className="text-slate-400 mt-0.5">
                  Nelamangala Highway Oasis (Exit 22) - Secure multi-axle truck parking, shower lounge, and dining.
                </p>
              </div>
            </div>

            {/* Fuel Station Advisory */}
            <div className="bg-[#070C16] border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-bold">Fuel Station Recommendation</strong>
                <p className="text-slate-400 mt-0.5">
                  Indian Oil Highway Plaza (3.2 km ahead) - High-speed diesel dispensers & DEF fluids available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Driver Controller Footer */}
        <div className="p-4 bg-[#080D18] border-t border-slate-800 space-y-2.5 sticky bottom-0 z-20">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleMarkArrived}
              disabled={!activeWaypoint}
              className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Mark Arrived</span>
            </button>

            <button
              onClick={handleMarkDelivered}
              disabled={!activeWaypoint}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Delivered</span>
            </button>
          </div>

          <button
            onClick={isSimulating ? handleStopTrip : handleStartTrip}
            className={`w-full py-3.5 rounded-2xl font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isSimulating
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/30'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>PAUSE GPS SIMULATION</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START TRIP (AUTONOMOUS GPS)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

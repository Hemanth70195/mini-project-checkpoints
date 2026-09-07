/**
 * TruckVisualizer.jsx
 * 
 * High-fidelity Vehicle Showcase & Telematics Visualizer.
 * Inspired by the vehicle-focused presentation from Reference Images 1 & 6:
 * - Clean enterprise vehicle profile illustrations for Mini Van, Medium Duty Box, & Heavy Container.
 * - Interactive cargo load visualization (weight & volume utilization progress).
 * - Clean operational parameter cards arranged around the vehicle (Capacity, Fuel, Speed, Distance).
 * - Interactive vehicle selector tabs.
 */

import React from 'react';
import {
  Truck,
  Gauge,
  Fuel,
  Navigation,
  User,
  Phone,
  Package,
  CheckCircle2,
  Shield,
  Activity,
  Layers,
  Radio
} from 'lucide-react';
import StatusBadge from './StatusBadge';

// Clean CAD-like SVG Illustrations for each fleet vehicle class
function TruckIllustration({ type = 'medium', color = '#4F46E5', loadPercent = 50 }) {
  const fillHeight = Math.min(100, Math.max(8, loadPercent));

  if (type === 'mini') {
    // Sleek Express Delivery Van
    return (
      <svg
        viewBox="0 0 540 210"
        className="w-full h-auto max-h-48 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="miniBodyLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="cargoFillLight" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Soft Shadow */}
        <ellipse cx="270" cy="188" rx="210" ry="10" fill="#64748B" opacity="0.18" />

        {/* Cargo Compartment Body */}
        <path
          d="M 65 65 Q 65 52 78 52 L 340 52 L 340 160 L 65 160 Z"
          fill="url(#miniBodyLight)"
          stroke="#94A3B8"
          strokeWidth="2"
        />

        {/* Cargo Bay Visualization Fill Indicator */}
        <g clipPath="url(#cargoClipMiniLight)">
          <clipPath id="cargoClipMiniLight">
            <rect x="74" y="60" width="255" height="88" rx="4" />
          </clipPath>
          <rect x="74" y="60" width="255" height="88" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
          <rect
            x="74"
            y={148 - (88 * (fillHeight / 100))}
            width="255"
            height={88 * (fillHeight / 100)}
            fill="url(#cargoFillLight)"
          />
          <line x1="138" y1="60" x2="138" y2="148" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
          <line x1="202" y1="60" x2="202" y2="148" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
          <line x1="266" y1="60" x2="266" y2="148" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
          <text x="202" y="110" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" letterSpacing="0.5">
            CARGO LOAD: {Math.round(loadPercent)}%
          </text>
        </g>

        {/* Driver Cab */}
        <path
          d="M 340 52 L 380 52 Q 425 62 445 100 L 475 120 Q 488 130 488 145 L 488 160 L 340 160 Z"
          fill="url(#miniBodyLight)"
          stroke="#94A3B8"
          strokeWidth="2"
        />

        {/* Windshield */}
        <path d="M 365 60 L 395 60 Q 425 70 436 100 L 365 100 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />

        {/* Headlight */}
        <polygon points="475,130 486,135 480,143 470,140" fill="#38BDF8" stroke="#0284C7" />

        {/* Side Racing Stripe */}
        <path d="M 85 135 L 450 135" stroke={color} strokeWidth="3" strokeLinecap="round" />

        {/* Front Wheel */}
        <circle cx="415" cy="160" r="26" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
        <circle cx="415" cy="160" r="12" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="415" cy="160" r="4" fill="#4F46E5" />

        {/* Rear Wheel */}
        <circle cx="130" cy="160" r="26" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
        <circle cx="130" cy="160" r="12" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="130" cy="160" r="4" fill="#4F46E5" />
      </svg>
    );
  }

  if (type === 'large') {
    // BharatBenz Heavy Container
    return (
      <svg
        viewBox="0 0 600 220"
        className="w-full h-auto max-h-48 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lrgBodyLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="lrgCargoFill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4338CA" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Soft Shadow */}
        <ellipse cx="300" cy="195" rx="260" ry="12" fill="#64748B" opacity="0.2" />

        {/* Chassis Frame */}
        <rect x="50" y="152" width="495" height="12" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />

        {/* Large Freight Container */}
        <rect x="40" y="42" width="370" height="115" rx="6" fill="url(#lrgBodyLight)" stroke="#94A3B8" strokeWidth="2" />

        {/* Container Internal Cargo Visualizer */}
        <g clipPath="url(#cargoClipLrgLight)">
          <clipPath id="cargoClipLrgLight">
            <rect x="48" y="48" width="354" height="103" rx="4" />
          </clipPath>
          <rect x="48" y="48" width="354" height="103" fill="#F1F5F9" stroke="#CBD5E1" />
          <rect
            x="48"
            y={151 - (103 * (fillHeight / 100))}
            width="354"
            height={103 * (fillHeight / 100)}
            fill="url(#lrgCargoFill)"
          />
          {[...Array(11)].map((_, i) => (
            <line
              key={i}
              x1={75 + i * 30}
              y1="48"
              x2={75 + i * 30}
              y2="151"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
          ))}
          <text x="225" y="105" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" letterSpacing="0.5">
            CONTAINER LOAD: {Math.round(loadPercent)}%
          </text>
        </g>

        {/* Sleeper Cab */}
        <path
          d="M 425 46 L 510 46 Q 540 50 550 80 L 560 120 L 560 164 L 425 164 Z"
          fill="url(#lrgBodyLight)"
          stroke="#94A3B8"
          strokeWidth="2"
        />

        {/* Windshield & Sun Visor */}
        <path d="M 465 54 L 510 54 Q 532 60 540 88 L 465 88 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />
        <rect x="460" y="48" width="60" height="5" rx="1" fill="#4F46E5" />

        {/* Front Grille */}
        <rect x="542" y="120" width="20" height="34" rx="2" fill="#334155" />

        {/* Multi-Axle Wheels */}
        <circle cx="505" cy="168" r="24" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
        <circle cx="505" cy="168" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="105" cy="168" r="24" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
        <circle cx="105" cy="168" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="160" cy="168" r="24" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
        <circle cx="160" cy="168" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="365" cy="168" r="24" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
        <circle cx="365" cy="168" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      </svg>
    );
  }

  // Default: Titan Medium Duty Box Truck (Reference Images 1 & 6)
  return (
    <svg
      viewBox="0 0 560 215"
      className="w-full h-auto max-h-48 drop-shadow-sm"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="medBodyLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="medCargoFill" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="280" cy="190" rx="230" ry="11" fill="#64748B" opacity="0.2" />

      {/* Heavy Chassis Frame */}
      <rect x="60" y="148" width="435" height="12" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />

      {/* Rigid Box Cargo Container */}
      <rect x="50" y="48" width="310" height="106" rx="5" fill="url(#medBodyLight)" stroke="#94A3B8" strokeWidth="2" />

      {/* Cargo Compartment Visualizer Fill */}
      <g clipPath="url(#cargoClipMedLight)">
        <clipPath id="cargoClipMedLight">
          <rect x="58" y="55" width="294" height="92" rx="3" />
        </clipPath>
        <rect x="58" y="55" width="294" height="92" fill="#F8FAFC" stroke="#CBD5E1" />
        <rect
          x="58"
          y={147 - (92 * (fillHeight / 100))}
          width="294"
          height={92 * (fillHeight / 100)}
          fill="url(#medCargoFill)"
        />
        <line x1="130" y1="55" x2="130" y2="147" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
        <line x1="205" y1="55" x2="205" y2="147" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
        <line x1="280" y1="55" x2="280" y2="147" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
        <text x="205" y="105" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" letterSpacing="0.5">
          CAPACITY LOAD: {Math.round(loadPercent)}%
        </text>
      </g>

      {/* Aerodynamic Cab Roof Fairing Deflector */}
      <path d="M 365 48 L 415 48 L 365 72 Z" fill="#E2E8F0" stroke="#94A3B8" />

      {/* Driver Cab */}
      <path
        d="M 365 72 L 438 72 Q 468 78 482 106 L 495 135 L 495 160 L 365 160 Z"
        fill="url(#medBodyLight)"
        stroke="#94A3B8"
        strokeWidth="2"
      />

      {/* Windshield */}
      <path d="M 395 78 L 438 78 Q 462 84 469 110 L 395 110 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />

      {/* Side Door Window */}
      <rect x="375" y="82" width="16" height="26" rx="2" fill="#0F172A" />

      {/* Front Projector Headlight */}
      <rect x="482" y="122" width="14" height="26" rx="2" fill="#334155" />
      <polygon points="488,126 498,130 494,138 484,134" fill="#38BDF8" stroke="#0284C7" />

      {/* Wheels */}
      <circle cx="445" cy="162" r="25" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
      <circle cx="445" cy="162" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="445" cy="162" r="4" fill="#2563EB" />

      <circle cx="120" cy="162" r="25" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
      <circle cx="120" cy="162" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="120" cy="162" r="4" fill="#2563EB" />

      <circle cx="180" cy="162" r="25" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
      <circle cx="180" cy="162" r="11" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="180" cy="162" r="4" fill="#2563EB" />
    </svg>
  );
}

export default function TruckVisualizer({
  trucks = [],
  selectedTruckId = null,
  onSelectTruck = () => {},
  truckLocations = {},
  trips = []
}) {
  if (!trucks || trucks.length === 0) return null;

  const activeTruck = trucks.find(t => (t.truckId || t.id) === selectedTruckId) || trucks[0];
  const truckId = activeTruck.truckId || activeTruck.id;
  const telemetry = truckLocations[truckId] || {};
  const assignedTrip = trips.find(t => t.truckId === truckId);

  // Compute realistic loads from assigned trip
  const loadWeight = assignedTrip?.totalWeightKg || 0;
  const loadVolume = assignedTrip?.totalVolumeM3 || 0;
  const weightPercent = Math.min(100, Math.round((loadWeight / activeTruck.maxWeightKg) * 100));
  const volumePercent = Math.min(100, Math.round((loadVolume / activeTruck.maxVolumeM3) * 100));
  const primaryLoadPercent = Math.max(weightPercent, volumePercent);

  // Fuel level
  const fuelPercent = telemetry.fuelPercent !== undefined
    ? telemetry.fuelPercent
    : activeTruck.currentFuelLitres
    ? Math.round((activeTruck.currentFuelLitres / activeTruck.fuelCapacityLitres) * 100)
    : 72;

  const speedKmh = telemetry.speedKmh || 0;
  const remainingDistKm = assignedTrip?.totalDistanceKm || 38.6;
  const deliveryCount = assignedTrip?.routeWaypoints?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Top Selector Bar (Vehicle tabs) */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <Truck className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Vehicle Telemetry
          </span>
        </div>

        {/* Tab Pills for all trucks */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {trucks.map((t) => {
            const tId = t.truckId || t.id;
            const isSelected = tId === truckId;
            const tTelemetry = truckLocations[tId] || {};
            const isMoving = tTelemetry.speedKmh > 0 || t.status === 'in_transit';

            return (
              <button
                key={tId}
                onClick={() => onSelectTruck(tId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{t.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono opacity-80">({tId})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Vehicle Showcase Area */}
      <div className="p-5 lg:p-6 flex flex-col space-y-5">
        {/* Header: Truck Name, ID, Class, and Status */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {truckId}
              </span>
              <StatusBadge status={activeTruck.type} type="truckType" />
              <StatusBadge status={telemetry.status || activeTruck.status || 'idle'} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1.5">
              {activeTruck.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Driver: <strong className="text-slate-800 font-semibold">{activeTruck.driver?.name || 'Staff Driver'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600"><Phone className="w-3 h-3 text-slate-400" /> {activeTruck.driver?.phone || '+91 98450 11223'}</span>
            </p>
          </div>

          {/* Real-time motion badge */}
          <div className="flex items-center gap-2">
            {speedKmh > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>EN ROUTE • {speedKmh} KM/H</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                <span>STANDBY</span>
              </div>
            )}
          </div>
        </div>

        {/* Central Clean Truck Profile Visualizer */}
        <div className="py-2 px-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-center min-h-[150px]">
          <TruckIllustration
            type={activeTruck.type}
            loadPercent={primaryLoadPercent}
            color="#4F46E5"
          />
        </div>

        {/* 4 Core Parameter Cards (Capacity, Fuel, Speed, Remaining) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Capacity Card */}
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Capacity Load</span>
              <Package className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {primaryLoadPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {loadWeight} kg / {activeTruck.maxWeightKg} kg
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  primaryLoadPercent > 90 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${primaryLoadPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Fuel Card */}
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Fuel Level</span>
              <Fuel className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {fuelPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {Math.round((fuelPercent / 100) * activeTruck.fuelCapacityLitres)}L / {activeTruck.fuelCapacityLitres}L Tank
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  fuelPercent < 25 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Speed / Odometer */}
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Speedometer</span>
              <Gauge className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {speedKmh} <span className="text-xs font-normal text-slate-500">km/h</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              Base: {activeTruck.baseMileageKmPerLitre} km/L
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              GPS: {telemetry.latitude?.toFixed(4) || '13.0280'}
            </div>
          </div>

          {/* 4. Remaining Distance & Deliveries */}
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Route Remaining</span>
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {remainingDistKm} <span className="text-xs font-normal text-slate-500">km</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {deliveryCount} Delivery Stops
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              Trip: {assignedTrip?.tripId || 'TRIP_ACTIVE'}
            </div>
          </div>
        </div>

        {/* Dual Utilization Breakdown (Weight vs Volume Meters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex justify-between text-slate-600 mb-1.5">
              <span className="font-semibold text-slate-800">Weight Load Utilization</span>
              <strong className="text-indigo-600 font-mono">{weightPercent}% ({loadWeight} / {activeTruck.maxWeightKg} kg)</strong>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${weightPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex justify-between text-slate-600 mb-1.5">
              <span className="font-semibold text-slate-800">Volumetric Space Utilization</span>
              <strong className="text-sky-600 font-mono">{volumePercent}% ({loadVolume} / {activeTruck.maxVolumeM3} m³)</strong>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

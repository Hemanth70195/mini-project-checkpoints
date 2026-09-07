/**
 * TruckVisualizer.jsx
 * 
 * High-fidelity Vehicle Showcase & Telematics Visualizer.
 * Inspired by Reference Images 1 & 6:
 * - Dynamic SVG truck illustrations tailored for Mini Van, Medium Duty Box, & Heavy Container.
 * - Interactive cargo load visualization (weight & volume utilization progress).
 * - Real-time telemetry HUD: speed, fuel gauge, driver profile, odometer, remaining distance.
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
  ArrowUpRight,
  Radio
} from 'lucide-react';
import StatusBadge from './StatusBadge';

// Detailed SVG Illustrations for each fleet vehicle class
function TruckIllustration({ type = 'medium', color = '#6366F1', loadPercent = 50 }) {
  // Visual fill height for cargo bay (from 0 to 100%)
  const fillHeight = Math.min(100, Math.max(8, loadPercent));

  if (type === 'mini') {
    // Sleek Express Delivery Van
    return (
      <svg
        viewBox="0 0 540 220"
        className="w-full h-auto max-h-52 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="miniBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="cargoFillGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4338CA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        {/* Vehicle Shadow & Ground Grid */}
        <ellipse cx="270" cy="195" rx="220" ry="14" fill="#000" opacity="0.6" filter="blur(6px)" />

        {/* Cargo Compartment Body */}
        <path
          d="M 60 70 Q 60 55 75 55 L 340 55 L 340 165 L 60 165 Z"
          fill="url(#miniBodyGrad)"
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Cargo Bay Visualization Fill Indicator */}
        <g clipPath="url(#cargoClipMini)">
          <clipPath id="cargoClipMini">
            <rect x="70" y="65" width="260" height="90" rx="6" />
          </clipPath>
          <rect x="70" y="65" width="260" height="90" fill="#0B1320" stroke="#1E293B" strokeWidth="1.5" />
          {/* Fill level representation */}
          <rect
            x="70"
            y={155 - (90 * (fillHeight / 100))}
            width="260"
            height={90 * (fillHeight / 100)}
            fill="url(#cargoFillGrad)"
            opacity="0.85"
          />
          {/* Isometric internal parcel grid lines */}
          <line x1="135" y1="65" x2="135" y2="155" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
          <line x1="200" y1="65" x2="200" y2="155" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
          <line x1="265" y1="65" x2="265" y2="155" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
          <text x="200" y="115" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="bold" letterSpacing="1">
            CARGO LOAD: {Math.round(loadPercent)}%
          </text>
        </g>

        {/* Sleek Aerodynamic Cab */}
        <path
          d="M 340 55 L 380 55 Q 425 65 445 105 L 475 125 Q 490 135 490 150 L 490 165 L 340 165 Z"
          fill="url(#miniBodyGrad)"
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Windshield */}
        <path
          d="M 365 65 L 395 65 Q 425 75 438 105 L 365 105 Z"
          fill="url(#windshieldGrad)"
          stroke="#38BDF8"
          strokeWidth="1.5"
        />

        {/* Side Passenger Window */}
        <rect x="350" y="70" width="10" height="35" rx="2" fill="#0F172A" />

        {/* LED Headlight Accent */}
        <polygon points="475,135 488,140 480,148 468,144" fill="#38BDF8" filter="drop-shadow(0 0 8px #38BDF8)" />

        {/* Side Racing Accent Decal */}
        <path d="M 90 140 L 450 140" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <path d="M 120 146 L 430 146" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />

        {/* Front Wheel */}
        <circle cx="415" cy="165" r="28" fill="url(#wheelGrad)" stroke="#64748B" strokeWidth="3" />
        <circle cx="415" cy="165" r="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="415" cy="165" r="5" fill="#E2E8F0" />

        {/* Rear Wheel */}
        <circle cx="130" cy="165" r="28" fill="url(#wheelGrad)" stroke="#64748B" strokeWidth="3" />
        <circle cx="130" cy="165" r="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="130" cy="165" r="5" fill="#E2E8F0" />
      </svg>
    );
  }

  if (type === 'large') {
    // BharatBenz Heavy Container Long Hauler
    return (
      <svg
        viewBox="0 0 600 230"
        className="w-full h-auto max-h-52 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="containerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0B1320" />
            <stop offset="100%" stopColor="#040812" />
          </linearGradient>
          <linearGradient id="largeFillGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="heavyWheel" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="300" cy="205" rx="270" ry="16" fill="#000" opacity="0.65" filter="blur(7px)" />

        {/* Chassis Rail */}
        <rect x="50" y="160" width="500" height="14" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />

        {/* Heavy Commercial Freight Container */}
        <rect x="40" y="45" width="370" height="120" rx="8" fill="url(#containerGrad)" stroke="#334155" strokeWidth="2.5" />

        {/* Container Internal Cargo Visualizer */}
        <g clipPath="url(#cargoClipLrg)">
          <clipPath id="cargoClipLrg">
            <rect x="48" y="52" width="354" height="106" rx="5" />
          </clipPath>
          <rect x="48" y="52" width="354" height="106" fill="#080E1A" />
          {/* Fill representation */}
          <rect
            x="48"
            y={158 - (106 * (fillHeight / 100))}
            width="354"
            height={106 * (fillHeight / 100)}
            fill="url(#largeFillGrad)"
            opacity="0.85"
          />
          {/* Container Corrugated Ribs */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1={75 + i * 28}
              y1="52"
              x2={75 + i * 28}
              y2="158"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />
          ))}
          <text x="225" y="110" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" letterSpacing="1">
            FREIGHT UTILIZATION: {Math.round(loadPercent)}%
          </text>
        </g>

        {/* Sleeper Cab */}
        <path
          d="M 425 50 L 515 50 Q 545 55 555 85 L 565 130 L 565 174 L 425 174 Z"
          fill="url(#containerGrad)"
          stroke="#475569"
          strokeWidth="2.5"
        />

        {/* Windshield & Sun Visor */}
        <path d="M 470 58 L 515 58 Q 538 65 545 95 L 470 95 Z" fill="#38BDF8" fillOpacity="0.35" stroke="#38BDF8" strokeWidth="1.5" />
        <rect x="465" y="52" width="60" height="6" rx="2" fill="#6366F1" />

        {/* Side Door & Window */}
        <rect x="435" y="65" width="28" height="30" rx="3" fill="#0F172A" stroke="#334155" />

        {/* Heavy Bumper & Grille */}
        <rect x="545" y="130" width="22" height="38" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
        <line x1="548" y1="138" x2="563" y2="138" stroke="#94A3B8" strokeWidth="2" />
        <line x1="548" y1="145" x2="563" y2="145" stroke="#94A3B8" strokeWidth="2" />
        <line x1="548" y1="152" x2="563" y2="152" stroke="#94A3B8" strokeWidth="2" />

        {/* High-power LED Headlamp */}
        <polygon points="555,145 570,147 568,155 553,153" fill="#38BDF8" filter="drop-shadow(0 0 10px #38BDF8)" />

        {/* Heavy Multi-Axle Wheels */}
        {/* Cab Front Wheel */}
        <circle cx="510" cy="178" r="26" fill="url(#heavyWheel)" stroke="#64748B" strokeWidth="3.5" />
        <circle cx="510" cy="178" r="12" fill="#0F172A" stroke="#A855F7" strokeWidth="2" />
        {/* Container Tandem Axle Rear 1 */}
        <circle cx="105" cy="178" r="26" fill="url(#heavyWheel)" stroke="#64748B" strokeWidth="3.5" />
        <circle cx="105" cy="178" r="12" fill="#0F172A" stroke="#A855F7" strokeWidth="2" />
        {/* Container Tandem Axle Rear 2 */}
        <circle cx="165" cy="178" r="26" fill="url(#heavyWheel)" stroke="#64748B" strokeWidth="3.5" />
        <circle cx="165" cy="178" r="12" fill="#0F172A" stroke="#A855F7" strokeWidth="2" />
        {/* Container Tandem Axle Mid */}
        <circle cx="370" cy="178" r="26" fill="url(#heavyWheel)" stroke="#64748B" strokeWidth="3.5" />
        <circle cx="370" cy="178" r="12" fill="#0F172A" stroke="#A855F7" strokeWidth="2" />
      </svg>
    );
  }

  // Default: Titan Medium Duty Box Truck (Reference Image 1 & 6)
  return (
    <svg
      viewBox="0 0 560 220"
      className="w-full h-auto max-h-52 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="medBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#040814" />
        </linearGradient>
        <linearGradient id="medCargoGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="medWheel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="280" cy="195" rx="240" ry="14" fill="#000" opacity="0.6" filter="blur(6px)" />

      {/* Heavy Chassis Frame */}
      <rect x="60" y="152" width="440" height="12" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />

      {/* Rigid Box Cargo Container */}
      <rect x="50" y="50" width="310" height="110" rx="6" fill="url(#medBodyGrad)" stroke="#334155" strokeWidth="2.5" />

      {/* Cargo Compartment Visualizer Fill */}
      <g clipPath="url(#cargoClipMed)">
        <clipPath id="cargoClipMed">
          <rect x="58" y="58" width="294" height="94" rx="4" />
        </clipPath>
        <rect x="58" y="58" width="294" height="94" fill="#0A111D" />
        {/* Fill level representation */}
        <rect
          x="58"
          y={152 - (94 * (fillHeight / 100))}
          width="294"
          height={94 * (fillHeight / 100)}
          fill="url(#medCargoGrad)"
          opacity="0.85"
        />
        {/* Section divider lines */}
        <line x1="130" y1="58" x2="130" y2="152" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
        <line x1="205" y1="58" x2="205" y2="152" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
        <line x1="280" y1="58" x2="280" y2="152" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
        <text x="205" y="110" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" letterSpacing="1">
          CAPACITY LOAD: {Math.round(loadPercent)}%
        </text>
      </g>

      {/* Aerodynamic Cab Roof Fairing Deflector */}
      <path d="M 365 50 L 415 50 L 365 75 Z" fill="#1E293B" stroke="#475569" />

      {/* Driver Cab */}
      <path
        d="M 365 75 L 440 75 Q 470 80 485 110 L 498 140 L 498 164 L 365 164 Z"
        fill="url(#medBodyGrad)"
        stroke="#475569"
        strokeWidth="2.5"
      />

      {/* Windshield */}
      <path d="M 395 82 L 440 82 Q 465 88 472 115 L 395 115 Z" fill="#38BDF8" fillOpacity="0.35" stroke="#38BDF8" strokeWidth="1.5" />

      {/* Side Door Glass */}
      <rect x="375" y="85" width="16" height="28" rx="2" fill="#0F172A" stroke="#334155" />

      {/* Front Grille & Projector Headlight */}
      <rect x="485" y="125" width="14" height="28" rx="3" fill="#1E293B" stroke="#64748B" />
      <polygon points="492,130 502,134 498,142 488,138" fill="#38BDF8" filter="drop-shadow(0 0 8px #38BDF8)" />

      {/* Fuel Tank Mounted Beneath Chassis */}
      <rect x="230" y="156" width="65" height="18" rx="4" fill="#334155" stroke="#64748B" />
      <circle cx="240" cy="165" r="3" fill="#F59E0B" />

      {/* Wheels */}
      {/* Front Cab Wheel */}
      <circle cx="445" cy="170" r="27" fill="url(#medWheel)" stroke="#64748B" strokeWidth="3" />
      <circle cx="445" cy="170" r="13" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="445" cy="170" r="5" fill="#E2E8F0" />
      {/* Rear Box Wheels */}
      <circle cx="120" cy="170" r="27" fill="url(#medWheel)" stroke="#64748B" strokeWidth="3" />
      <circle cx="120" cy="170" r="13" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="120" cy="170" r="5" fill="#E2E8F0" />
      <circle cx="180" cy="170" r="27" fill="url(#medWheel)" stroke="#64748B" strokeWidth="3" />
      <circle cx="180" cy="170" r="13" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="180" cy="170" r="5" fill="#E2E8F0" />
    </svg>
  );
}

export default function TruckVisualizer({
  trucks = [],
  selectedTruckId = null,
  onSelectTruck = () => {},
  truckLocations = {},
  trips = [],
  compact = false
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
    <div className="bg-[#0C1322] rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden flex flex-col">
      {/* Top Selector Bar (Vehicle tabs) */}
      <div className="p-3.5 bg-[#090E1A] border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <Truck className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-[#111B2E] text-slate-400 hover:text-slate-200 hover:bg-[#16233B] border border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{t.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono opacity-70">({tId})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Vehicle Showcase Area */}
      <div className="p-5 lg:p-6 flex flex-col space-y-5">
        {/* Header: Truck Name, ID, Class, and Status */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {truckId}
              </span>
              <StatusBadge status={activeTruck.type} type="truckType" />
              <StatusBadge status={telemetry.status || activeTruck.status || 'idle'} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mt-1.5">
              {activeTruck.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Driver: <strong className="text-slate-200">{activeTruck.driver?.name || 'Staff Driver'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {activeTruck.driver?.phone || '+91 98450 11223'}</span>
            </p>
          </div>

          {/* Real-time motion badge */}
          <div className="flex items-center gap-2">
            {speedKmh > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
                <Activity className="w-4 h-4 animate-spin" />
                <span>EN ROUTE • {speedKmh} KM/H</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span>TELEMETRY STANDBY</span>
              </div>
            )}
          </div>
        </div>

        {/* Central Truck Vector Visualizer */}
        <div className="relative py-2 px-4 rounded-xl bg-gradient-to-b from-[#090F1C] to-[#0D1525] border border-slate-800 flex items-center justify-center min-h-[160px] overflow-hidden">
          {/* Subtle radar background grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <TruckIllustration
            type={activeTruck.type}
            loadPercent={primaryLoadPercent}
            color="#6366F1"
          />
        </div>

        {/* 4 Core Telematics Cards Grid (Capacity, Fuel, Speed, Remaining) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Capacity Card */}
          <div className="p-3.5 rounded-xl bg-[#090E1A] border border-slate-800/90 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Capacity Load</span>
              <Package className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {primaryLoadPercent}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {loadWeight} kg / {activeTruck.maxWeightKg} kg
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  primaryLoadPercent > 90 ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${primaryLoadPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Fuel Card */}
          <div className="p-3.5 rounded-xl bg-[#090E1A] border border-slate-800/90 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Fuel Level</span>
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {fuelPercent}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {Math.round((fuelPercent / 100) * activeTruck.fuelCapacityLitres)}L / {activeTruck.fuelCapacityLitres}L Tank
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  fuelPercent < 25 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Speed / Odometer */}
          <div className="p-3.5 rounded-xl bg-[#090E1A] border border-slate-800/90 relative overflow-hidden group hover:border-sky-500/40 transition-colors">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Telemetry Speed</span>
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {speedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Base: {activeTruck.baseMileageKmPerLitre} km/L
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              GPS Lat: {telemetry.latitude?.toFixed(4) || '13.0280'}
            </div>
          </div>

          {/* 4. Remaining Distance & Deliveries */}
          <div className="p-3.5 rounded-xl bg-[#090E1A] border border-slate-800/90 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Route Remaining</span>
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {remainingDistKm} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {deliveryCount} Delivery Stops
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              Trip: {assignedTrip?.tripId || 'TRIP_ACTIVE'}
            </div>
          </div>
        </div>

        {/* Dual Utilization Breakdown (Weight vs Volume Meters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-lg bg-[#090E1A]/80 border border-slate-800/60">
            <div className="flex justify-between text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300">Gravimetric Weight Load</span>
              <strong className="text-indigo-400">{weightPercent}% ({loadWeight} / {activeTruck.maxWeightKg} kg)</strong>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${weightPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#090E1A]/80 border border-slate-800/60">
            <div className="flex justify-between text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300">Volumetric Cargo Space</span>
              <strong className="text-sky-400">{volumePercent}% ({loadVolume} / {activeTruck.maxVolumeM3} m³)</strong>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

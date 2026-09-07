/**
 * MapViewer.jsx
 * 
 * Interactive Geospatial Fleet Visualizer using React-Leaflet.
 * Renders:
 * - Central Logistics Depot (Yeshwanthpur)
 * - Customer Delivery Stops (color-coded by priority & delivered state)
 * - Live-moving GPS trucks with directional heading
 * - Multi-truck closed-loop route polylines with interactive selection highlighting
 * - Standard OpenStreetMap tiles by default with CartoDB Dark toggle
 */

import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers } from 'lucide-react';

// Distinct palette for multi-truck routes
const ROUTE_COLORS = [
  '#4F46E5', // Indigo (Truck 1)
  '#0284C7', // Sky Blue (Truck 2)
  '#10B981', // Emerald (Truck 3)
  '#D97706', // Amber (Truck 4)
  '#8B5CF6', // Purple (Truck 5)
  '#EC4899'  // Pink (Truck 6)
];

// Custom Leaflet DivIcon Generators (Zero external PNG dependency)
function createDepotIcon() {
  return L.divIcon({
    className: 'custom-depot-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: #F59E0B;
          opacity: 0.3;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          background: #1E293B;
          color: #FCD34D;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 2px solid #F59E0B;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
}

function createDeliveryIcon(order, index) {
  const isDelivered = order.status === 'delivered';
  const bg = isDelivered
    ? '#10B981'
    : order.priority === 3
    ? '#EF4444'
    : order.priority === 2
    ? '#3B82F6'
    : '#64748B';

  return L.divIcon({
    className: 'custom-delivery-marker',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      ">
        ${isDelivered ? '✓' : index || '•'}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
}

function createTruckIcon(truck, telemetry, color = '#4F46E5') {
  const heading = telemetry?.heading || 0;
  const isMoving = telemetry?.speedKmh > 0 || truck.status === 'in_transit';

  return L.divIcon({
    className: 'custom-truck-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isMoving ? `
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: ${color};
            opacity: 0.3;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          position: relative;
          background: ${color};
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${heading}deg);
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          transition: transform 0.35s ease;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
}

// Controller to smoothly pan & fit bounds
function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export default function MapViewer({
  depot = { lat: 13.0280, lng: 77.5409, name: 'Yeshwanthpur Central Fulfillment Center' },
  orders = [],
  trucks = [],
  trips = [],
  truckLocations = {},
  selectedTruckId = null,
  height = '540px'
}) {
  const [mapTheme, setMapTheme] = useState('streets'); // 'streets' | 'dark'
  const defaultCenter = [depot.lat, depot.lng];

  // Calculate bounding box for all points
  const bounds = useMemo(() => {
    const pts = [[depot.lat, depot.lng]];
    orders.forEach(o => {
      if (o.lat && o.lng) pts.push([Number(o.lat), Number(o.lng)]);
    });
    trucks.forEach(t => {
      const loc = truckLocations[t.truckId || t.id] || t.currentLocation;
      if (loc && loc.lat && loc.lng) pts.push([Number(loc.lat), Number(loc.lng)]);
    });
    return pts.length > 1 ? pts : null;
  }, [depot, orders, trucks, truckLocations]);

  // Build polylines from trips
  const routePolylines = useMemo(() => {
    return trips.map((trip, idx) => {
      const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
      if (!trip.routeWaypoints || trip.routeWaypoints.length === 0) return null;

      // Closed loop: Depot -> Waypoints -> Depot
      const points = [
        [depot.lat, depot.lng],
        ...trip.routeWaypoints.map(w => [Number(w.lat), Number(w.lng)]),
        [depot.lat, depot.lng]
      ];

      return {
        tripId: trip.tripId,
        truckId: trip.truckId,
        truckName: trip.truckName || `Truck ${idx + 1}`,
        color,
        points,
        totalDistanceKm: trip.totalDistanceKm,
        totalWeightKg: trip.totalWeightKg,
        estimatedDurationMinutes: trip.estimatedDurationMinutes
      };
    }).filter(Boolean);
  }, [trips, depot]);

  return (
    <div
      style={{ height }}
      className="w-full relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-100"
    >
      {/* Map Theme Toggle */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          onClick={() => setMapTheme(mapTheme === 'streets' ? 'dark' : 'streets')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/95 text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          title="Toggle Navigation Map Theme"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>{mapTheme === 'streets' ? 'Standard OpenStreetMap' : 'Dark Navigation'}</span>
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {mapTheme === 'streets' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {bounds && <MapBoundsUpdater bounds={bounds} />}

        {/* 1. Central Logistics Depot Marker */}
        {depot && (
          <Marker position={[depot.lat, depot.lng]} icon={createDepotIcon()}>
            <Popup>
              <div className="p-1 min-w-[210px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    CENTRAL DEPOT
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">HQ-BLR</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{depot.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Coordinates: {depot.lat.toFixed(4)}, {depot.lng.toFixed(4)}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
                  <span>CVRP Central Hub</span>
                  <span className="text-emerald-600 font-semibold">Active Capacity</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Customer Delivery Markers */}
        {orders.map((order, idx) => {
          if (!order.lat || !order.lng) return null;
          return (
            <Marker
              key={order.orderId || order.id || idx}
              position={[Number(order.lat), Number(order.lng)]}
              icon={createDeliveryIcon(order, idx + 1)}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {order.orderId || order.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status || 'Pending'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-1.5">{order.customer}</h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{order.address}</p>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400">Weight:</span> <strong className="text-slate-700">{order.weightKg} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Volume:</span> <strong className="text-slate-700">{order.volumeM3} m³</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Priority:</span> <strong className="text-slate-700">Tier {order.priority}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Assigned:</span> <strong className="text-indigo-600 font-mono">{order.assignedTruckId || 'Unassigned'}</strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Optimized Route Polylines */}
        {routePolylines.map((route) => {
          const isSelected = selectedTruckId && selectedTruckId === route.truckId;
          const isOtherSelected = selectedTruckId && selectedTruckId !== route.truckId;

          return (
            <Polyline
              key={route.tripId || route.truckId}
              positions={route.points}
              pathOptions={{
                color: route.color,
                weight: isSelected ? 6 : 4,
                opacity: isOtherSelected ? 0.3 : 0.85,
                dashArray: isSelected ? undefined : '6, 6'
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h5 className="font-bold text-sm" style={{ color: route.color }}>{route.truckName}</h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {route.truckId}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Distance:</span>
                      <strong className="text-slate-800">{route.totalDistanceKm} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payload Load:</span>
                      <strong className="text-slate-800">{route.totalWeightKg || 0} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Duration:</span>
                      <strong className="text-emerald-600 font-semibold">{route.estimatedDurationMinutes || 0} mins</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    Closed loop from Yeshwanthpur FC
                  </p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 4. Live Truck Markers with Directional Heading */}
        {trucks.map((truck, idx) => {
          const telemetry = truckLocations[truck.truckId || truck.id] || {};
          const lat = telemetry.latitude || truck.currentLocation?.lat || depot.lat;
          const lng = telemetry.longitude || truck.currentLocation?.lng || depot.lng;
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];

          return (
            <Marker
              key={truck.truckId || truck.id}
              position={[Number(lat), Number(lng)]}
              icon={createTruckIcon(truck, telemetry, color)}
            >
              <Popup>
                <div className="p-1 min-w-[210px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h4 className="font-bold text-sm text-slate-900">{truck.name}</h4>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {truck.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{truck.truckId || truck.id}</p>

                  <div className="mt-2 space-y-1 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Live Status:</span>
                      <strong className="capitalize text-emerald-600">{telemetry.status || truck.status || 'Idle'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Speed:</span>
                      <strong className="text-indigo-600">{telemetry.speedKmh ? `${telemetry.speedKmh} km/h` : 'Stationary'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver:</span>
                      <strong className="text-slate-800">{truck.driver?.name || 'Staff Driver'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Capacity:</span>
                      <strong className="text-slate-800">{truck.maxWeightKg} kg / {truck.maxVolumeM3} m³</strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

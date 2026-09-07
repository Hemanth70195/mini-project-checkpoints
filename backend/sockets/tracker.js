/**
 * tracker.js
 * 
 * Socket.IO Real-Time Fleet Tracking & Telemetry Hub.
 * Handles:
 * 1. Live Driver GPS Pings (driver:location -> admin:truck-location)
 * 2. Real-Time Delivery Status Updates (driver:delivery-status)
 * 3. Connection / Disconnection lifecycle & room management
 * 4. Built-in Autonomous Demo Route Simulator for moving trucks along optimized paths.
 */

import { interpolatePoints, calculateBearing } from '../algorithms/haversine.js';
import inMemoryStore from '../data/inMemoryStore.js';
import Truck from '../models/Truck.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import Trip from '../models/Trip.js';
import { isMongoActive } from '../config/db.js';

// Registry of active simulation timers: truckId -> NodeJS.Timeout
const activeSimulators = new Map();

/**
 * Validates incoming driver GPS location payload.
 * 
 * @param {Object} data
 * @returns {{ valid: boolean, error?: string, normalized?: Object }}
 */
export function validateLocationPayload(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload must be a non-null object' };
  }

  const truckId = data.truckId || data.id;
  if (!truckId) {
    return { valid: false, error: 'Missing required field: truckId' };
  }

  const lat = data.latitude !== undefined ? Number(data.latitude) : Number(data.lat);
  const lng = data.longitude !== undefined ? Number(data.longitude) : Number(data.lng);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return { valid: false, error: `Invalid latitude: ${data.latitude || data.lat}. Must be between -90 and 90.` };
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    return { valid: false, error: `Invalid longitude: ${data.longitude || data.lng}. Must be between -180 and 180.` };
  }

  const speedKmh = Number(data.speedKmh || data.speed) || 0;
  const heading = Number(data.heading) || 0;
  const fuelPercent = data.fuelPercent !== undefined ? Number(data.fuelPercent) : undefined;
  const currentWaypointIndex = Number(data.currentWaypointIndex) || 0;

  return {
    valid: true,
    normalized: {
      truckId: String(truckId),
      latitude: lat,
      longitude: lng,
      speedKmh: Math.max(0, speedKmh),
      heading: (heading + 360) % 360,
      fuelPercent: fuelPercent !== undefined ? Math.max(0, Math.min(100, fuelPercent)) : undefined,
      currentWaypointIndex,
      status: data.status || 'in_transit',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Updates truck location in the active database or in-memory persistence store.
 */
async function updateTruckLocation(normalized) {
  const { truckId, latitude, longitude, status } = normalized;

  if (isMongoActive()) {
    try {
      await Truck.findOneAndUpdate(
        { truckId },
        {
          currentLocation: { lat: latitude, lng: longitude },
          status
        }
      );
    } catch (err) {
      console.warn(`[SOCKET] Mongo truck location update failed for ${truckId}:`, err.message);
    }
  }

  // Always keep in-memory store in sync
  inMemoryStore.updateTruck(truckId, {
    currentLocation: { lat: latitude, lng: longitude },
    status
  });
}

/**
 * Updates order delivery status in database / inMemoryStore.
 */
async function updateDeliveryStatus(orderId, truckId, status) {
  if (isMongoActive()) {
    try {
      await DeliveryOrder.findOneAndUpdate(
        { orderId },
        { status, assignedTruckId: truckId }
      );
    } catch (err) {
      console.warn(`[SOCKET] Mongo order status update failed for ${orderId}:`, err.message);
    }
  }

  inMemoryStore.updateOrder(orderId, {
    status,
    assignedTruckId: truckId
  });
}

/**
 * Initializes Socket.IO event listeners and tracking infrastructure.
 * 
 * @param {import('socket.io').Server} io
 */
export function setupSocketTracker(io) {

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);

    // Client joins room
    socket.on('join:admin', () => {
      socket.join('admins');
      console.log(`[SOCKET] Socket ${socket.id} joined 'admins' room`);
      socket.emit('admin:joined', { message: 'Successfully subscribed to fleet telemetry' });
    });

    socket.on('join:driver', ({ truckId }) => {
      if (truckId) {
        socket.join('drivers');
        socket.join(`truck:${truckId}`);
        console.log(`[SOCKET] Socket ${socket.id} joined driver channel for truck '${truckId}'`);
        socket.emit('driver:joined', { truckId, message: `Connected as driver for ${truckId}` });
      }
    });

    // -------------------------------------------------------------
    // EVENT 1: driver:location
    // -------------------------------------------------------------
    socket.on('driver:location', async (data, ackCallback) => {
      const validation = validateLocationPayload(data);

      if (!validation.valid) {
        console.warn(`[SOCKET] Rejected invalid location from ${socket.id}:`, validation.error);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: false, error: validation.error });
        }
        return;
      }

      const telemetry = validation.normalized;

      // 1. Update database state
      await updateTruckLocation(telemetry);

      // 2. Broadcast updated position to admin command center
      // Emits both to 'admins' room and globally to prevent missed events
      io.to('admins').emit('admin:truck-location', telemetry);
      io.emit('admin:truck-location', telemetry);

      if (typeof ackCallback === 'function') {
        ackCallback({ success: true, timestamp: telemetry.timestamp });
      }
    });

    // -------------------------------------------------------------
    // EVENT 2: driver:delivery-status
    // -------------------------------------------------------------
    socket.on('driver:delivery-status', async (data, ackCallback) => {
      if (!data || !data.orderId || !data.status) {
        if (typeof ackCallback === 'function') {
          ackCallback({ success: false, error: 'Missing orderId or status' });
        }
        return;
      }

      const { orderId, truckId, status, notes } = data;
      console.log(`[SOCKET] Order '${orderId}' marked as '${status}' by truck '${truckId}'`);

      await updateDeliveryStatus(orderId, truckId, status);

      const statusPayload = {
        orderId,
        truckId: truckId || 'UNKNOWN',
        status,
        notes: notes || '',
        timestamp: new Date().toISOString()
      };

      // Broadcast update to admin dashboard
      io.to('admins').emit('admin:delivery-status', statusPayload);
      io.emit('admin:delivery-status', statusPayload);

      if (typeof ackCallback === 'function') {
        ackCallback({ success: true, timestamp: statusPayload.timestamp });
      }
    });

    // -------------------------------------------------------------
    // EVENT 3: simulator:start & simulator:stop
    // -------------------------------------------------------------
    socket.on('simulator:start', async (params, ackCallback) => {
      const truckId = params?.truckId || 'TRUCK_MINI_01';
      const intervalMs = Number(params?.intervalMs) || 400; // Fast ticks for responsive demo
      const result = await startRouteSimulation(io, truckId, intervalMs);

      if (typeof ackCallback === 'function') {
        ackCallback(result);
      }
    });

    socket.on('simulator:stop', ({ truckId }, ackCallback) => {
      const stopped = stopRouteSimulation(truckId);
      if (typeof ackCallback === 'function') {
        ackCallback({ success: true, stopped });
      }
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Autonomous Demo Route Simulator.
 * Simulates a truck moving continuously along its planned waypoints
 * without requiring real physical GPS hardware.
 * 
 * @param {import('socket.io').Server} io
 * @param {string} truckId - ID of truck to simulate
 * @param {number} intervalMs - Tick frequency in milliseconds
 * @returns {Promise<{ success: boolean, message: string, totalPoints?: number }>}
 */
export async function startRouteSimulation(io, truckId, intervalMs = 400) {
  // Stop existing simulation for this truck if running
  stopRouteSimulation(truckId);

  // 1. Locate planned trip for this truck
  let trip = null;
  if (isMongoActive()) {
    trip = await Trip.findOne({ truckId }).sort({ createdAt: -1 });
  }
  if (!trip) {
    const allTrips = inMemoryStore.getTrips();
    trip = allTrips.find(t => t.truckId === truckId) || allTrips[0];
  }

  // If no trip exists, build a sample route from demo orders
  let waypoints = [];
  const depot = inMemoryStore.getDepot();

  if (trip && trip.routeWaypoints && trip.routeWaypoints.length > 0) {
    waypoints = [
      { lat: trip.depot.lat, lng: trip.depot.lng, isDepot: true },
      ...trip.routeWaypoints.map(w => ({ lat: w.lat, lng: w.lng, orderId: w.orderId, customer: w.customer })),
      { lat: trip.depot.lat, lng: trip.depot.lng, isDepot: true }
    ];
  } else {
    // Fallback route using first 3 orders
    const orders = inMemoryStore.getOrders().slice(0, 3);
    waypoints = [
      { lat: depot.lat, lng: depot.lng, isDepot: true },
      ...orders.map(o => ({ lat: o.lat, lng: o.lng, orderId: o.orderId, customer: o.customer })),
      { lat: depot.lat, lng: depot.lng, isDepot: true }
    ];
  }

  // 2. Generate smooth interpolated coordinate trajectory
  const fullTrajectory = [];
  const STEPS_PER_LEG = 6;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const interpolated = interpolatePoints(from, to, STEPS_PER_LEG);
    
    // Attach waypoint metadata to the arrival point
    interpolated.forEach((pt, pIdx) => {
      const isDestination = (pIdx === interpolated.length - 1);
      fullTrajectory.push({
        lat: Number(pt.lat.toFixed(6)),
        lng: Number(pt.lng.toFixed(6)),
        targetOrderId: isDestination && to.orderId ? to.orderId : null,
        targetCustomer: isDestination && to.customer ? to.customer : null,
        isDepotArrival: isDestination && to.isDepot,
        waypointIndex: i + 1
      });
    });
  }

  let currentIndex = 0;
  console.log(`[SIMULATOR] Starting autonomous simulation for ${truckId} (${fullTrajectory.length} steps)...`);

  const timer = setInterval(async () => {
    if (currentIndex >= fullTrajectory.length) {
      console.log(`[SIMULATOR] Truck ${truckId} reached final depot. Simulation completed.`);
      stopRouteSimulation(truckId);

      // Emit completed status
      const completedTelemetry = {
        truckId,
        latitude: depot.lat,
        longitude: depot.lng,
        speedKmh: 0,
        heading: 0,
        status: 'idle',
        currentWaypointIndex: waypoints.length,
        timestamp: new Date().toISOString()
      };
      await updateTruckLocation(completedTelemetry);
      io.emit('admin:truck-location', completedTelemetry);
      return;
    }

    const currentPt = fullTrajectory[currentIndex];
    const nextPt = fullTrajectory[Math.min(currentIndex + 1, fullTrajectory.length - 1)];
    const heading = calculateBearing(currentPt, nextPt);

    const telemetry = {
      truckId,
      latitude: currentPt.lat,
      longitude: currentPt.lng,
      speedKmh: 42.5, // Simulated 42.5 km/h transit speed
      heading: Math.round(heading),
      status: 'in_transit',
      currentWaypointIndex: currentPt.waypointIndex,
      timestamp: new Date().toISOString()
    };

    // Update state and broadcast
    await updateTruckLocation(telemetry);
    io.emit('admin:truck-location', telemetry);

    // If reached a customer delivery stop, automatically mark delivered
    if (currentPt.targetOrderId) {
      await updateDeliveryStatus(currentPt.targetOrderId, truckId, 'delivered');
      io.emit('admin:delivery-status', {
        orderId: currentPt.targetOrderId,
        truckId,
        status: 'delivered',
        customer: currentPt.targetCustomer,
        timestamp: new Date().toISOString()
      });
    }

    currentIndex++;
  }, intervalMs);

  activeSimulators.set(truckId, timer);

  return {
    success: true,
    truckId,
    totalPoints: fullTrajectory.length,
    message: `Simulator active for ${truckId}`
  };
}

/**
 * Stops an active route simulation for a truck.
 */
export function stopRouteSimulation(truckId) {
  if (activeSimulators.has(truckId)) {
    clearInterval(activeSimulators.get(truckId));
    activeSimulators.delete(truckId);
    console.log(`[SIMULATOR] Stopped simulation for ${truckId}`);
    return true;
  }
  return false;
}

/**
 * Stops all running simulators (for server shutdown/cleanup).
 */
export function stopAllSimulators() {
  for (const [truckId, timer] of activeSimulators.entries()) {
    clearInterval(timer);
  }
  activeSimulators.clear();
}

/**
 * sockets.test.js
 * 
 * Automated Integration Tests for Socket.IO Real-Time Tracking:
 * 1. Connection lifecycle (Admin and Driver clients connect and join rooms)
 * 2. Driver GPS Pings (driver:location -> Socket.IO -> admin:truck-location)
 * 3. Payload validation (rejects invalid latitude/longitude or missing truckId)
 * 4. Delivery Status Updates (driver:delivery-status -> Socket.IO -> admin:delivery-status)
 * 5. Autonomous Demo Route Simulator (emits continuous GPS updates along route)
 */

import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { io as ClientIO } from 'socket.io-client';
import { httpServer, io } from '../server.js';
import inMemoryStore from '../data/inMemoryStore.js';
import { stopAllSimulators } from '../sockets/tracker.js';

const SOCKET_PORT = 5088;
const SOCKET_URL = `http://localhost:${SOCKET_PORT}`;

let adminClient;
let driverClient;

before(async () => {
  inMemoryStore.reset();
  await new Promise((resolve) => {
    httpServer.listen(SOCKET_PORT, () => {
      resolve();
    });
  });

  // Connect Admin Socket Client
  adminClient = ClientIO(SOCKET_URL, {
    transports: ['websocket'],
    forceNew: true
  });

  // Connect Driver Socket Client
  driverClient = ClientIO(SOCKET_URL, {
    transports: ['websocket'],
    forceNew: true
  });

  await Promise.all([
    new Promise((res) => adminClient.on('connect', res)),
    new Promise((res) => driverClient.on('connect', res))
  ]);

  // Join rooms
  adminClient.emit('join:admin');
  driverClient.emit('join:driver', { truckId: 'TRUCK_MINI_01' });
  await new Promise((r) => setTimeout(r, 100));
});

after(async () => {
  stopAllSimulators();
  if (adminClient) adminClient.disconnect();
  if (driverClient) driverClient.disconnect();
  await new Promise((resolve) => httpServer.close(resolve));
});

describe('Phase 3 Socket.IO Real-Time Tracking Test Suite', () => {

  // Test 1: Connection & Rooms
  it('should establish WebSocket connections for both Admin and Driver clients', () => {
    assert.strictEqual(adminClient.connected, true, 'Admin client must be connected');
    assert.strictEqual(driverClient.connected, true, 'Driver client must be connected');
  });

  // Test 2: Driver GPS Telemetry Pipeline (Driver -> Server -> Admin)
  it('should broadcast driver:location to admin:truck-location in real-time', async () => {
    const testLocation = {
      truckId: 'TRUCK_MINI_01',
      latitude: 12.9716,
      longitude: 77.5946,
      speedKmh: 45.2,
      heading: 180,
      fuelPercent: 88,
      currentWaypointIndex: 2
    };

    const receivedPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for admin:truck-location')), 3000);
      adminClient.once('admin:truck-location', (telemetry) => {
        clearTimeout(timeout);
        resolve(telemetry);
      });
    });

    // Driver emits location
    driverClient.emit('driver:location', testLocation);

    const receivedTelemetry = await receivedPromise;
    assert.strictEqual(receivedTelemetry.truckId, 'TRUCK_MINI_01');
    assert.strictEqual(receivedTelemetry.latitude, 12.9716);
    assert.strictEqual(receivedTelemetry.longitude, 77.5946);
    assert.strictEqual(receivedTelemetry.speedKmh, 45.2);
    assert.strictEqual(receivedTelemetry.heading, 180);
    assert.strictEqual(receivedTelemetry.fuelPercent, 88);
    assert.ok(receivedTelemetry.timestamp);

    // Verify in-memory store was updated
    const truck = inMemoryStore.getTruckById('TRUCK_MINI_01');
    assert.strictEqual(truck.currentLocation.lat, 12.9716);
    assert.strictEqual(truck.currentLocation.lng, 77.5946);
  });

  // Test 3: Location Validation
  it('should reject invalid GPS location coordinates with error acknowledgment', async () => {
    const invalidPayload = {
      truckId: 'TRUCK_MINI_01',
      latitude: 999.0, // Invalid latitude (> 90)
      longitude: 77.5946
    };

    const ack = await new Promise((resolve) => {
      driverClient.emit('driver:location', invalidPayload, (response) => {
        resolve(response);
      });
    });

    assert.strictEqual(ack.success, false);
    assert.ok(ack.error.includes('Invalid latitude'));
  });

  // Test 4: Delivery Status Flow (Driver -> Server -> Admin)
  it('should broadcast driver:delivery-status to admin:delivery-status and update order', async () => {
    const statusUpdate = {
      orderId: 'ORD_001',
      truckId: 'TRUCK_MINI_01',
      status: 'delivered',
      notes: 'Customer signed delivery receipt'
    };

    const receivedPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for admin:delivery-status')), 3000);
      adminClient.once('admin:delivery-status', (payload) => {
        clearTimeout(timeout);
        resolve(payload);
      });
    });

    // Driver emits delivery status change
    driverClient.emit('driver:delivery-status', statusUpdate);

    const receivedPayload = await receivedPromise;
    assert.strictEqual(receivedPayload.orderId, 'ORD_001');
    assert.strictEqual(receivedPayload.truckId, 'TRUCK_MINI_01');
    assert.strictEqual(receivedPayload.status, 'delivered');
    assert.strictEqual(receivedPayload.notes, 'Customer signed delivery receipt');

    // Verify order status in store
    const order = inMemoryStore.getOrderById('ORD_001');
    assert.strictEqual(order.status, 'delivered');
  });

  // Test 5: Autonomous Demo Route Simulator
  it('should run autonomous route simulator and stream moving coordinates to admin', async () => {
    const simulatedPoints = [];

    const telemetryCollector = (data) => {
      if (data.truckId === 'TRUCK_MINI_01') {
        simulatedPoints.push(data);
      }
    };

    adminClient.on('admin:truck-location', telemetryCollector);

    // Start simulation with fast 100ms ticks
    const startAck = await new Promise((resolve) => {
      adminClient.emit('simulator:start', { truckId: 'TRUCK_MINI_01', intervalMs: 100 }, resolve);
    });

    assert.strictEqual(startAck.success, true);
    assert.ok(startAck.totalPoints > 0);

    // Wait for at least 3 simulation ticks
    await new Promise((r) => setTimeout(r, 450));

    // Stop simulation
    const stopAck = await new Promise((resolve) => {
      adminClient.emit('simulator:stop', { truckId: 'TRUCK_MINI_01' }, resolve);
    });

    assert.strictEqual(stopAck.success, true);
    adminClient.off('admin:truck-location', telemetryCollector);

    // Verify we received moving GPS updates
    assert.ok(simulatedPoints.length >= 2, `Expected >= 2 telemetry points, got ${simulatedPoints.length}`);
    const p1 = simulatedPoints[0];
    const p2 = simulatedPoints[simulatedPoints.length - 1];
    assert.ok(p1.latitude !== p2.latitude || p1.longitude !== p2.longitude, 'Coordinates must move over time');
  });
});

/**
 * api.test.js
 * 
 * Comprehensive Automated Tests for the Phase 2 REST API:
 * - Health Check
 * - Orders CRUD (GET, POST, PUT, DELETE)
 * - Trucks (GET, GET /:id)
 * - POST /api/optimize End-to-End Execution
 * - Trips (GET, GET /:id)
 */

import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import inMemoryStore from '../data/inMemoryStore.js';

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
let serverInstance = null;

before(async () => {
  inMemoryStore.reset();
  return new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, () => {
      resolve();
    });
  });
});

after(async () => {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
});

describe('Phase 2 REST API Test Suite', () => {

  // 1. Health Endpoint
  it('GET /api/health - should return server health and status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'online');
    assert.ok(body.mode);
    assert.ok(body.fleetCount >= 4);
    assert.ok(body.ordersCount >= 15);
  });

  // 2. Trucks Endpoint
  it('GET /api/trucks - should retrieve all fleet trucks', async () => {
    const res = await fetch(`${BASE_URL}/api/trucks`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.strictEqual(body.data.length, 4);

    const miniTruck = body.data.find(t => t.type === 'mini');
    assert.ok(miniTruck, 'Fleet must include mini trucks');
    assert.strictEqual(miniTruck.maxWeightKg, 1000);
  });

  it('GET /api/trucks/:id - should retrieve a specific truck', async () => {
    const res = await fetch(`${BASE_URL}/api/trucks/TRUCK_LRG_01`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.type, 'large');
    assert.strictEqual(body.data.maxWeightKg, 12000);
  });

  it('GET /api/trucks/:id - should return 404 for invalid truck ID', async () => {
    const res = await fetch(`${BASE_URL}/api/trucks/NON_EXISTENT_TRUCK`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 3. Orders Endpoints
  it('GET /api/orders - should retrieve demo delivery orders', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 15);
  });

  it('GET /api/orders/:id - should retrieve single order by ID', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/ORD_001`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.orderId, 'ORD_001');
    assert.ok(body.data.customer.includes('Infosys'));
  });

  it('POST /api/orders - should validate and reject invalid coordinates or missing fields', async () => {
    // Missing customer and address
    const res1 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 12.9, lng: 77.6, weightKg: 10, volumeM3: 0.1 })
    });
    assert.strictEqual(res1.status, 400);

    // Invalid latitude (> 90)
    const res2 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: 'Test', address: 'Test', lat: 150.0, lng: 77.6, weightKg: 10, volumeM3: 0.1 })
    });
    assert.strictEqual(res2.status, 400);
  });

  it('POST /api/orders - should successfully create a valid new order', async () => {
    const newOrderPayload = {
      customer: 'Microsoft R&D Center',
      address: 'Outer Ring Road, Bellandur',
      lat: 12.9260,
      lng: 77.6762,
      weightKg: 55,
      volumeM3: 0.45,
      packageType: 'electronics',
      priority: 2,
      description: 'Azure Cloud Edge Server Kits'
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrderPayload)
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.customer, newOrderPayload.customer);
    assert.strictEqual(body.data.weightKg, 55);
    assert.ok(body.data.orderId);
  });

  it('PUT /api/orders/:id - should update order details', async () => {
    const updatePayload = {
      priority: 3,
      description: 'Updated Urgent Priority Medical Supplies'
    };

    const res = await fetch(`${BASE_URL}/api/orders/ORD_014`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.priority, 3);
    assert.strictEqual(body.data.description, updatePayload.description);
  });

  it('DELETE /api/orders/:id - should delete an order', async () => {
    // Create a temporary order to delete
    const tempRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: 'Temporary Customer',
        address: 'MG Road, Bangalore',
        lat: 12.9750,
        lng: 77.6050,
        weightKg: 10,
        volumeM3: 0.1
      })
    });
    const tempBody = await tempRes.json();
    const tempId = tempBody.data.orderId;

    // Delete it
    const delRes = await fetch(`${BASE_URL}/api/orders/${tempId}`, { method: 'DELETE' });
    assert.strictEqual(delRes.status, 200);
    const delBody = await delRes.json();
    assert.strictEqual(delBody.success, true);

    // Confirm it's gone
    const checkRes = await fetch(`${BASE_URL}/api/orders/${tempId}`);
    assert.strictEqual(checkRes.status, 404);
  });

  // 4. POST /api/optimize (End-to-End Engine Execution)
  it('POST /api/optimize - should run CVRP & Simulated Annealing pipeline end-to-end', async () => {
    const res = await fetch(`${BASE_URL}/api/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        options: {
          initialTemperature: 600.0,
          minTemperature: 0.05,
          coolingRate: 0.985,
          iterationsPerTemp: 30,
          maxStagnantSteps: 400
        }
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);

    const data = body.data;
    assert.ok(data.initialDistance > 0, 'Initial distance must be > 0');
    assert.ok(data.optimizedDistance > 0, 'Optimized distance must be > 0');
    assert.ok(
      data.optimizedDistance <= data.initialDistance,
      `Optimized distance (${data.optimizedDistance}) must be <= initial distance (${data.initialDistance})`
    );

    assert.ok(data.iterations > 0);
    assert.ok(Array.isArray(data.truckAssignments));
    assert.strictEqual(data.truckAssignments.length, 4);

    assert.ok(Array.isArray(data.trips));
    assert.strictEqual(data.trips.length, 4);

    // Verify summary metrics exist and are positive
    assert.ok(data.summary.totalOrdersAssigned >= 15);
    assert.ok(data.summary.totalTrucksDispatched > 0);
    assert.ok(data.summary.fuelSavedLitres >= 0);
    assert.ok(data.summary.moneySavedInr >= 0);
  });

  // 5. Trips Endpoints
  it('GET /api/trips - should return generated trips after optimization', async () => {
    const res = await fetch(`${BASE_URL}/api/trips`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.strictEqual(body.data.length, 4);

    const activeTrip = body.data.find(t => t.routeWaypoints && t.routeWaypoints.length > 0);
    assert.ok(activeTrip, 'At least one trip must contain delivery waypoints');
    assert.ok(activeTrip.totalDistanceKm > 0);
    assert.ok(activeTrip.estimatedFuelLitres >= 0);
    assert.ok(activeTrip.routeWaypoints[0].customer);
  });

  it('GET /api/trips/:id - should return single trip details', async () => {
    const tripsRes = await fetch(`${BASE_URL}/api/trips`);
    const tripsBody = await tripsRes.json();
    const firstTrip = tripsBody.data[0];

    const res = await fetch(`${BASE_URL}/api/trips/${firstTrip.tripId}`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.tripId, firstTrip.tripId);
  });
});

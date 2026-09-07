/**
 * algorithms.test.js
 * 
 * Comprehensive unit tests for the core algorithmic modules:
 * 1. Haversine Distance & Bearing Utilities
 * 2. N x N Distance Matrix Generation (Symmetry, Reflexivity, Lookups)
 * 3. Multi-Constraint Truck Allocation (Package Classification & Bin-Packing)
 * 4. CVRP Initial Route Solver (Clarke-Wright Savings)
 * 5. Simulated Annealing Route Optimizer (Energy Minimization & Feasibility)
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { 
  haversineDistance, 
  calculateRouteDistance as haversineRouteDist, 
  calculateBearing, 
  interpolatePoints 
} from '../algorithms/haversine.js';

import { 
  buildDistanceMatrix, 
  getDistance, 
  findNearestNeighbor 
} from '../algorithms/distanceMatrix.js';

import { 
  classifyPackage, 
  canFitInTruck, 
  allocateOrdersToTrucks, 
  TRUCK_TYPES 
} from '../algorithms/truckAllocation.js';

import { 
  calculateRouteDistance, 
  calculateFleetDistance, 
  validateRouteFeasibility, 
  clarkeWrightSavings 
} from '../algorithms/cvrp.js';

import { 
  simulatedAnnealingOptimize, 
  evaluateSolutionEnergy 
} from '../algorithms/simulatedAnnealing.js';

import { DEMO_SCENARIOS } from '../data/demoData.js';

// ==========================================
// TEST SUITE 1: HAVERSINE DISTANCE UTILITIES
// ==========================================
describe('Module 1: Haversine Formula & Geodesic Utilities', () => {
  const blrCenter = { lat: 12.9716, lng: 77.5946 };
  const ecity = { lat: 12.8452, lng: 77.6602 };
  const ny = { lat: 40.7128, lng: -74.0060 };
  const london = { lat: 51.5074, lng: -0.1278 };

  it('should return 0 distance when coordinates are identical', () => {
    const dist = haversineDistance(blrCenter, blrCenter);
    assert.strictEqual(dist, 0.0, 'Distance between identical points must be 0');
  });

  it('should exhibit strict symmetry d(A, B) === d(B, A)', () => {
    const dAB = haversineDistance(blrCenter, ecity);
    const dBA = haversineDistance(ecity, blrCenter);
    assert.strictEqual(dAB, dBA, 'Haversine distance must be symmetric');
    assert.ok(dAB > 14.0 && dAB < 16.0, `Expected ~15 km between Bangalore and E-City, got ${dAB.toFixed(2)} km`);
  });

  it('should accurately calculate global geodesic benchmark (NY to London ~5570 km)', () => {
    const dist = haversineDistance(ny, london);
    // Accepted geodesic distance is ~5570 km (allow within 0.5% margin)
    assert.ok(dist > 5540 && dist < 5600, `Expected ~5570 km, got ${dist.toFixed(2)} km`);
  });

  it('should convert units properly (km to meters and miles)', () => {
    const distKm = haversineDistance(blrCenter, ecity, 'km');
    const distM = haversineDistance(blrCenter, ecity, 'm');
    const distMi = haversineDistance(blrCenter, ecity, 'miles');

    assert.ok(Math.abs(distM - (distKm * 1000)) < 0.01);
    assert.ok(Math.abs(distMi - (distKm * 0.621371)) < 0.01);
  });

  it('should calculate cumulative route distance across multiple points', () => {
    const waypoints = [blrCenter, ecity, blrCenter];
    const singleLeg = haversineDistance(blrCenter, ecity);
    const roundTrip = haversineRouteDist(waypoints);

    assert.ok(Math.abs(roundTrip - (singleLeg * 2)) < 0.0001);
  });

  it('should calculate initial compass bearing within valid range [0, 360)', () => {
    const bearing = calculateBearing(blrCenter, ecity);
    assert.ok(bearing >= 0 && bearing < 360, `Bearing must be [0, 360), got ${bearing}`);
  });

  it('should interpolate smooth intermediate coordinates correctly', () => {
    const steps = 5;
    const interpolated = interpolatePoints(blrCenter, ecity, steps);
    assert.strictEqual(interpolated.length, steps + 1);
    assert.strictEqual(interpolated[0].lat, blrCenter.lat);
    assert.strictEqual(interpolated[steps].lat, ecity.lat);
  });
});

// ==========================================
// TEST SUITE 2: DISTANCE MATRIX GENERATOR
// ==========================================
describe('Module 2: Distance Matrix Adjacency Graph', () => {
  const scenario = DEMO_SCENARIOS.BANGALORE_HUB;
  const sampleLocations = [scenario.depot, ...scenario.orders.slice(0, 5)];
  const N = sampleLocations.length;

  it('should construct an N x N matrix with correct dimensions', () => {
    const matrixData = buildDistanceMatrix(sampleLocations);
    assert.strictEqual(matrixData.size, N);
    assert.strictEqual(matrixData.matrix.length, N);
    for (let i = 0; i < N; i++) {
      assert.strictEqual(matrixData.matrix[i].length, N);
    }
  });

  it('should guarantee reflexivity: matrix[i][i] === 0 for all i', () => {
    const { matrix } = buildDistanceMatrix(sampleLocations);
    for (let i = 0; i < N; i++) {
      assert.strictEqual(matrix[i][i], 0.0, `Self-distance matrix[${i}][${i}] must be zero`);
    }
  });

  it('should guarantee symmetry: matrix[i][j] === matrix[j][i] for all i, j', () => {
    const { matrix } = buildDistanceMatrix(sampleLocations);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        assert.strictEqual(matrix[i][j], matrix[j][i], `Matrix must be symmetric at (${i}, ${j})`);
      }
    }
  });

  it('should satisfy metric triangle inequality: d(i, k) <= d(i, j) + d(j, k)', () => {
    const { matrix } = buildDistanceMatrix(sampleLocations);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          const direct = matrix[i][k];
          const indirect = matrix[i][j] + matrix[j][k];
          assert.ok(
            direct <= indirect + 1e-6,
            `Triangle inequality violated: d(${i}, ${k}) = ${direct} > ${indirect}`
          );
        }
      }
    }
  });

  it('should support O(1) distance queries and index lookups', () => {
    const matrixData = buildDistanceMatrix(sampleLocations);
    const depotIdx = matrixData.idToIndex.get(String(scenario.depot.id));
    assert.strictEqual(depotIdx, 0);

    const dist = getDistance(matrixData.matrix, 0, 1);
    assert.ok(dist > 0, 'Distance between depot and customer must be positive');
  });

  it('should find nearest unvisited neighbor correctly', () => {
    const { matrix } = buildDistanceMatrix(sampleLocations);
    const unvisited = new Set([1, 2, 3]);
    const nearest = findNearestNeighbor(matrix, 0, unvisited);

    assert.ok(nearest !== null);
    assert.ok(unvisited.has(nearest.nearestIndex));
    // Verify it is indeed minimal among unvisited
    for (const cand of unvisited) {
      assert.ok(nearest.distance <= matrix[0][cand]);
    }
  });
});

// ==========================================
// TEST SUITE 3: MULTI-CONSTRAINT ALLOCATION
// ==========================================
describe('Module 3: Multi-Constraint Truck Allocation & Classification', () => {
  const scenario = DEMO_SCENARIOS.BANGALORE_HUB;

  it('should classify packages into appropriate logistics categories', () => {
    assert.strictEqual(classifyPackage(5000, 15.0), 'heavy_machinery');
    assert.strictEqual(classifyPackage(400, 3.5), 'furniture');
    assert.strictEqual(classifyPackage(45, 0.4), 'appliances');
    assert.strictEqual(classifyPackage(5, 0.05), 'small_parcel');
  });

  it('should reject incompatible assignments (e.g. heavy machinery in mini van)', () => {
    const miniTruck = {
      type: 'mini',
      maxWeightKg: 1000,
      maxVolumeM3: 6.0,
      currentWeightKg: 0,
      currentVolumeM3: 0
    };
    const heavyOrder = {
      id: 'ORD_HEAVY',
      weightKg: 4200,
      volumeM3: 14.0,
      packageType: 'heavy_machinery'
    };

    const fitCheck = canFitInTruck(heavyOrder, miniTruck);
    assert.strictEqual(fitCheck.compatible, false);
  });

  it('should reject allocations exceeding weight capacity limit', () => {
    const miniTruck = {
      type: 'mini',
      maxWeightKg: 1000,
      maxVolumeM3: 6.0,
      currentWeightKg: 950,
      currentVolumeM3: 2.0
    };
    const parcel = {
      id: 'ORD_OVER',
      weightKg: 80,
      volumeM3: 0.5,
      packageType: 'small_parcel'
    };

    const fitCheck = canFitInTruck(parcel, miniTruck);
    assert.strictEqual(fitCheck.compatible, false);
    assert.ok(fitCheck.reason.includes('Weight limit exceeded'));
  });

  it('should allocate all scenario orders adhering to truck limits', () => {
    const { allocations, unassignedOrders, truckSummaries } = allocateOrdersToTrucks(
      scenario.orders,
      scenario.trucks
    );

    assert.strictEqual(unassignedOrders.length, 0, 'All orders should be successfully allocated');
    assert.strictEqual(truckSummaries.length, scenario.trucks.length);

    // Verify every truck respects weight and volume thresholds
    for (const summary of truckSummaries) {
      assert.ok(
        summary.totalWeightKg <= summary.maxWeightKg,
        `Truck ${summary.truckId} weight ${summary.totalWeightKg} exceeded ${summary.maxWeightKg}`
      );
      assert.ok(
        summary.totalVolumeM3 <= summary.maxVolumeM3,
        `Truck ${summary.truckId} volume ${summary.totalVolumeM3} exceeded ${summary.maxVolumeM3}`
      );
    }
  });
});

// ==========================================
// TEST SUITE 4: CVRP INITIAL ROUTING
// ==========================================
describe('Module 4: CVRP Clarke-Wright Savings Routing', () => {
  const scenario = DEMO_SCENARIOS.BANGALORE_HUB;
  const allLocations = [scenario.depot, ...scenario.orders];
  const matrixData = buildDistanceMatrix(allLocations);

  it('should generate non-empty routes visiting all delivery stops', () => {
    const result = clarkeWrightSavings(
      scenario.orders,
      scenario.trucks,
      scenario.depot,
      matrixData
    );

    assert.ok(result.routes.length > 0, 'Must produce routes for fleet');
    assert.strictEqual(result.unservicedOrderIndices.length, 0, 'No order should be dropped');

    // Count unique stops visited
    const visitedIndices = new Set();
    for (const route of result.routes) {
      for (const idx of route) {
        assert.ok(!visitedIndices.has(idx), `Customer index ${idx} visited more than once!`);
        visitedIndices.add(idx);
      }
    }

    assert.strictEqual(visitedIndices.size, scenario.orders.length);
  });

  it('should accurately calculate single-truck route distance with return to depot', () => {
    const sampleRoute = [1, 2, 3];
    const totalDist = calculateRouteDistance(sampleRoute, matrixData.matrix, 0);

    // Sum of legs: 0->1 + 1->2 + 2->3 + 3->0
    const expected = 
      matrixData.matrix[0][1] + 
      matrixData.matrix[1][2] + 
      matrixData.matrix[2][3] + 
      matrixData.matrix[3][0];

    assert.ok(Math.abs(totalDist - expected) < 1e-6);
  });

  it('should compute total fleet distance across all active routes', () => {
    const routes = [[1, 2], [3, 4]];
    const fleetDist = calculateFleetDistance(routes, matrixData.matrix, 0);
    const r1Dist = calculateRouteDistance(routes[0], matrixData.matrix, 0);
    const r2Dist = calculateRouteDistance(routes[1], matrixData.matrix, 0);

    assert.ok(Math.abs(fleetDist - (r1Dist + r2Dist)) < 1e-6);
  });
});

// ==========================================
// TEST SUITE 5: SIMULATED ANNEALING OPTIMIZER
// ==========================================
describe('Module 5: Simulated Annealing Route Optimization Engine', () => {
  const scenario = DEMO_SCENARIOS.BANGALORE_HUB;
  const allLocations = [scenario.depot, ...scenario.orders];
  const matrixData = buildDistanceMatrix(allLocations);

  // Generate initial solution via Clarke-Wright
  const initialSol = clarkeWrightSavings(
    scenario.orders,
    scenario.trucks,
    scenario.depot,
    matrixData
  );

  const indexToOrderMap = new Map();
  scenario.orders.forEach(o => {
    const idx = matrixData.idToIndex.get(String(o.id));
    indexToOrderMap.set(idx, o);
  });

  it('should evaluate solution energy and detect capacity overflows', () => {
    const evalResult = evaluateSolutionEnergy(
      initialSol.routes,
      matrixData.matrix,
      0,
      indexToOrderMap,
      scenario.trucks
    );

    assert.ok(evalResult.rawDistance > 0);
    assert.strictEqual(evalResult.isFeasible, true);
    assert.strictEqual(evalResult.energy, evalResult.rawDistance, 'No penalty when feasible');
  });

  it('should run Simulated Annealing and achieve equal or lower travel distance', () => {
    const optimizationResult = simulatedAnnealingOptimize({
      initialRoutes: initialSol.routes,
      distanceMatrix: matrixData.matrix,
      depotIndex: 0,
      indexToOrderMap,
      trucks: scenario.trucks,
      options: {
        initialTemperature: 500.0,
        minTemperature: 0.1,
        coolingRate: 0.95,
        iterationsPerTemp: 25,
        maxStagnantSteps: 300
      }
    });

    assert.ok(
      optimizationResult.bestDistance <= optimizationResult.initialDistance,
      `Optimized distance (${optimizationResult.bestDistance}) must be <= initial (${optimizationResult.initialDistance})`
    );

    assert.ok(optimizationResult.iterations > 0);
    assert.ok(optimizationResult.history.length > 0);
    assert.ok(optimizationResult.executionTimeMs > 0);

    // Verify all original stops are preserved in the optimized routes (no loss or duplication)
    const initialStopsCount = initialSol.routes.reduce((sum, r) => sum + r.length, 0);
    const optimizedStopsCount = optimizationResult.bestRoutes.reduce((sum, r) => sum + r.length, 0);
    assert.strictEqual(optimizedStopsCount, initialStopsCount, 'All customer stops must be preserved');

    const optimizedStopsSet = new Set();
    for (const route of optimizationResult.bestRoutes) {
      for (const stop of route) {
        assert.ok(!optimizedStopsSet.has(stop), `Duplicate stop ${stop} found in routes!`);
        optimizedStopsSet.add(stop);
      }
    }
  });
});

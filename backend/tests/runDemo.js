/**
 * runDemo.js
 * 
 * End-to-End Pipeline Execution Demo for College Presentation.
 * Runs:
 * 1. Haversine Matrix Generation
 * 2. Multi-Constraint Truck Allocation (CVRP)
 * 3. Clarke-Wright Savings Initial Routing
 * 4. Simulated Annealing Optimization Loop
 * 5. Formatted Performance Metrics & Complexity Analysis
 */

import { buildDistanceMatrix } from '../algorithms/distanceMatrix.js';
import { allocateOrdersToTrucks } from '../algorithms/truckAllocation.js';
import { clarkeWrightSavings, calculateFleetDistance } from '../algorithms/cvrp.js';
import { simulatedAnnealingOptimize } from '../algorithms/simulatedAnnealing.js';
import { DEMO_SCENARIOS } from '../data/demoData.js';

console.log('================================================================================');
console.log('  AI-BASED MULTI-TRUCK SMART DELIVERY & ROUTE OPTIMIZATION PIPELINE DEMO');
console.log('================================================================================\n');

const scenario = DEMO_SCENARIOS.BANGALORE_HUB;
console.log(`[SCENARIO] Selected: ${scenario.name}`);
console.log(`[DEPOT]    ${scenario.depot.name} (${scenario.depot.lat}, ${scenario.depot.lng})`);
console.log(`[FLEET]    ${scenario.trucks.length} Trucks Available`);
console.log(`[ORDERS]   ${scenario.orders.length} Delivery Stops to Schedule\n`);

// -------------------------------------------------------------
// STEP 1: DISTANCE MATRIX GENERATION
// -------------------------------------------------------------
console.log('--- [STEP 1: O(N^2) Geodesic Adjacency Matrix Construction] ---');
const t0 = performance.now();
const allLocations = [scenario.depot, ...scenario.orders];
const matrixData = buildDistanceMatrix(allLocations);
const t1 = performance.now();
console.log(` Matrix Dimension : ${matrixData.size} x ${matrixData.size} cells (${matrixData.size * matrixData.size} distances)`);
console.log(` Build Time       : ${(t1 - t0).toFixed(3)} ms`);
console.log(` Memory Complexity: O(N^2) contiguous typed Float64Array (cache-aligned)`);
console.log(` Lookup Time      : O(1) constant time edge-cost retrieval\n`);

// -------------------------------------------------------------
// STEP 2: MULTI-CONSTRAINT BIN-PACKING (TRUCK ALLOCATION)
// -------------------------------------------------------------
console.log('--- [STEP 2: Multi-Constraint Truck Allocation (BPP)] ---');
const { truckSummaries, unassignedOrders } = allocateOrdersToTrucks(scenario.orders, scenario.trucks);
truckSummaries.forEach(s => {
  console.log(` Truck [${s.truckId}] (${s.name}):`);
  console.log(`   Orders Assigned: ${s.orderCount}`);
  console.log(`   Weight Load    : ${s.totalWeightKg} / ${s.maxWeightKg} kg (${s.weightUtilizationPercent}%)`);
  console.log(`   Volume Load    : ${s.totalVolumeM3} / ${s.maxVolumeM3} m³ (${s.volumeUtilizationPercent}%)`);
});
if (unassignedOrders.length > 0) {
  console.log(` Unassigned Orders: ${unassignedOrders.length}`);
} else {
  console.log(` Status: All ${scenario.orders.length} orders successfully accommodated within fleet capacity limits!\n`);
}

// -------------------------------------------------------------
// STEP 3: CLARKE-WRIGHT SAVINGS INITIAL CVRP SOLUTION
// -------------------------------------------------------------
console.log('--- [STEP 3: Clarke-Wright Savings Initial Route Generation] ---');
const cwStart = performance.now();
const cwResult = clarkeWrightSavings(scenario.orders, scenario.trucks, scenario.depot, matrixData);
const cwEnd = performance.now();
const initialFleetDist = calculateFleetDistance(cwResult.routes, matrixData.matrix, 0);

console.log(` Initial Routes Formed: ${cwResult.routes.length}`);
console.log(` Initial Total Distance: ${initialFleetDist.toFixed(2)} km`);
console.log(` Savings Computation  : ${(cwEnd - cwStart).toFixed(3)} ms\n`);

// -------------------------------------------------------------
// STEP 4: SIMULATED ANNEALING META-HEURISTIC OPTIMIZATION
// -------------------------------------------------------------
console.log('--- [STEP 4: Simulated Annealing Meta-Heuristic Convergence] ---');
const indexToOrderMap = new Map();
scenario.orders.forEach(o => {
  const idx = matrixData.idToIndex.get(String(o.id));
  indexToOrderMap.set(idx, o);
});

const saResult = simulatedAnnealingOptimize({
  initialRoutes: cwResult.routes,
  distanceMatrix: matrixData.matrix,
  depotIndex: 0,
  indexToOrderMap,
  trucks: scenario.trucks,
  options: {
    initialTemperature: 1000.0,
    minTemperature: 0.05,
    coolingRate: 0.985,
    iterationsPerTemp: 40,
    maxStagnantSteps: 600
  }
});

console.log(` Optimization Runtime  : ${saResult.executionTimeMs.toFixed(2)} ms`);
console.log(` Total Iterations Run  : ${saResult.iterations}`);
console.log(` Initial Route Distance: ${saResult.initialDistance.toFixed(2)} km`);
console.log(` Optimized Distance    : ${saResult.bestDistance.toFixed(2)} km`);
console.log(` Net Distance Saved    : ${saResult.distanceSaved.toFixed(2)} km`);
console.log(` Efficiency Improvement: ${saResult.percentageSaved.toFixed(1)}%`);

// Fuel and Cost Analysis
const DIESEL_PRICE_INR_PER_LITRE = 92.0;
const AVG_FLEET_MILEAGE_KMPL = 8.5;
const fuelSavedLitres = (saResult.distanceSaved / AVG_FLEET_MILEAGE_KMPL);
const moneySavedInr = fuelSavedLitres * DIESEL_PRICE_INR_PER_LITRE;
const co2SavedKg = fuelSavedLitres * 2.68; // 2.68 kg CO2 per litre of diesel

console.log('\n--- [BUSINESS & ENVIRONMENTAL IMPACT] ---');
console.log(` Fuel Saved            : ${fuelSavedLitres.toFixed(1)} Litres`);
console.log(` Fuel Cost Saved       : Rs. ${moneySavedInr.toFixed(0)}`);
console.log(` Carbon Footprint Cut  : ${co2SavedKg.toFixed(1)} kg CO2\n`);

console.log('--- [FINAL OPTIMIZED FLEET ROUTE DISPATCH] ---');
saResult.bestRoutes.forEach((route, truckIdx) => {
  const truck = scenario.trucks[truckIdx] || { name: `Truck ${truckIdx + 1}` };
  if (route.length === 0) {
    console.log(` ${truck.name}:`);
    console.log(`   [STATUS] Standby / Reserve Fleet at Central Depot`);
  } else {
    const stopNames = route.map(nodeIdx => {
      const order = indexToOrderMap.get(nodeIdx);
      return order ? `${order.customer} (${order.packageType})` : `Node ${nodeIdx}`;
    });
    console.log(` ${truck.name}:`);
    console.log(`   Depot -> ${stopNames.join(' -> ')} -> Depot`);
  }
});

console.log('\n================================================================================');
console.log('  PIPELINE EXECUTION COMPLETED SUCCESSFULLY');
console.log('================================================================================');

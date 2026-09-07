/**
 * cvrp.js
 * 
 * Capacitated Vehicle Routing Problem (CVRP) Core Solver.
 * 
 * Implements Heterogeneous Fleet CVRP (HFVRP):
 * Combines Cluster-First (Multi-Constraint Bin-Packing) with
 * Route-Second (Clarke-Wright Savings & TSP Nearest-Neighbor)
 * to generate a valid, high-efficiency initial feasible solution.
 * 
 * Mathematical Definition of CVRP:
 * Let G = (V, E) be a complete graph where:
 *   V = {0, 1, ..., N} with 0 being the central depot and 1..N being delivery stops.
 *   Each vertex i has demands (weight w_i, volume v_i).
 *   Each edge (i, j) has travel cost c_ij = distance(i, j).
 *   Fleet of K vehicles with capacities (W_k, V_k).
 * 
 * Objective:
 *   Minimize Total Cost = Σ Σ c_ij * x_ijk
 * Subject to:
 *   - Each customer visited exactly once.
 *   - Σ w_i <= W_k for each truck k.
 *   - Σ v_i <= V_k for each truck k.
 *   - All routes begin and end at depot 0.
 * 
 * C++ DSA Analogy:
 * Heterogeneous CVRP with strict vehicle constraints is solved via:
 * 1) Cluster: std::sort + Best-Fit Bin Packing O(N log N + N * K)
 * 2) Route: Clarke-Wright Savings O(M^2 log M) per vehicle cluster
 * This avoids assigning specialized loads (e.g. heavy machinery) to invalid vehicles
 * and guarantees 100% feasibility of the initial routing state.
 */

import { getDistance } from './distanceMatrix.js';
import { allocateOrdersToTrucks, TRUCK_TYPES } from './truckAllocation.js';

/**
 * Computes the total travel distance of a single truck route.
 * Route starts at depot (index 0), visits all stops in order, and returns to depot.
 * 
 * Route format: [stopIndex1, stopIndex2, ..., stopIndexM]
 * Cycle: Depot -> stopIndex1 -> ... -> stopIndexM -> Depot
 * 
 * Time Complexity: O(M) where M is route length.
 * 
 * @param {Array<number>} route - Array of location indices
 * @param {Array<Array<number>>} distanceMatrix - N x N matrix
 * @param {number} depotIndex - Index of depot (default 0)
 * @returns {number} Total route distance in km
 */
export function calculateRouteDistance(route, distanceMatrix, depotIndex = 0) {
  if (!Array.isArray(route) || route.length === 0) {
    return 0.0;
  }

  let totalDist = 0.0;
  // Leg from depot to first stop
  totalDist += getDistance(distanceMatrix, depotIndex, route[0]);

  // Legs between consecutive stops
  for (let i = 0; i < route.length - 1; i++) {
    totalDist += getDistance(distanceMatrix, route[i], route[i + 1]);
  }

  // Leg from last stop back to depot
  totalDist += getDistance(distanceMatrix, route[route.length - 1], depotIndex);

  return totalDist;
}

/**
 * Calculates total travel distance across all truck routes in the fleet.
 * 
 * @param {Array<Array<number>>} routes - Array of routes per truck
 * @param {Array<Array<number>>} distanceMatrix - N x N matrix
 * @param {number} depotIndex - Depot index
 * @returns {number} Sum of all truck route distances
 */
export function calculateFleetDistance(routes, distanceMatrix, depotIndex = 0) {
  let fleetDistance = 0.0;
  for (const route of routes) {
    fleetDistance += calculateRouteDistance(route, distanceMatrix, depotIndex);
  }
  return fleetDistance;
}

/**
 * Verifies if a given route satisfies capacity limits for a specific truck.
 * 
 * @param {Array<number>} route - Array of node indices
 * @param {Map<number, Object>} indexToOrderMap - Maps node index to order object
 * @param {Object} truck - Truck specifications
 * @returns {{ feasible: boolean, totalWeight: number, totalVolume: number, violation?: string }}
 */
export function validateRouteFeasibility(route, indexToOrderMap, truck) {
  const spec = TRUCK_TYPES[truck.type?.toUpperCase()] || truck;
  const maxW = truck.maxWeightKg || spec.maxWeightKg || 1000;
  const maxV = truck.maxVolumeM3 || spec.maxVolumeM3 || 6.0;

  let totalWeight = 0;
  let totalVolume = 0;

  for (const nodeIdx of route) {
    const order = indexToOrderMap.get(nodeIdx);
    if (order) {
      // Check package type compatibility
      if (spec.allowedPackageTypes && order.packageType) {
        if (!spec.allowedPackageTypes.includes(order.packageType)) {
          return {
            feasible: false,
            totalWeight,
            totalVolume,
            violation: `Order ${order.id} type '${order.packageType}' incompatible with truck '${truck.name}'`
          };
        }
      }
      totalWeight += order.weightKg || 0;
      totalVolume += order.volumeM3 || 0;
    }
  }

  if (totalWeight > maxW) {
    return {
      feasible: false,
      totalWeight,
      totalVolume,
      violation: `Weight capacity exceeded: ${totalWeight} kg > ${maxW} kg`
    };
  }

  if (totalVolume > maxV) {
    return {
      feasible: false,
      totalWeight,
      totalVolume,
      violation: `Volume capacity exceeded: ${totalVolume.toFixed(2)} m³ > ${maxV} m³`
    };
  }

  return { feasible: true, totalWeight, totalVolume };
}

/**
 * Optimizes the route ordering for a single cluster of stops assigned to a vehicle
 * using Clarke-Wright Savings and 2-Opt local refinement.
 * 
 * @param {Array<number>} stopIndices - Node indices assigned to this vehicle
 * @param {Array<Array<number>>} matrix - Distance matrix
 * @param {number} depotIndex - Depot index
 * @returns {Array<number>} Ordered route sequence
 */
function routeSingleVehicleCluster(stopIndices, matrix, depotIndex) {
  if (stopIndices.length <= 1) {
    return [...stopIndices];
  }

  if (stopIndices.length === 2) {
    const [a, b] = stopIndices;
    const dist1 = getDistance(matrix, depotIndex, a) + getDistance(matrix, a, b) + getDistance(matrix, b, depotIndex);
    const dist2 = getDistance(matrix, depotIndex, b) + getDistance(matrix, b, a) + getDistance(matrix, a, depotIndex);
    return dist1 <= dist2 ? [a, b] : [b, a];
  }

  // 1. Clarke-Wright Savings on the cluster stops
  const savings = [];
  for (let i = 0; i < stopIndices.length; i++) {
    const u = stopIndices[i];
    const d0u = getDistance(matrix, depotIndex, u);
    for (let j = i + 1; j < stopIndices.length; j++) {
      const v = stopIndices[j];
      const d0v = getDistance(matrix, depotIndex, v);
      const duv = getDistance(matrix, u, v);
      savings.push({ u, v, saving: d0u + d0v - duv });
    }
  }

  savings.sort((a, b) => b.saving - a.saving);

  let activePaths = stopIndices.map(idx => [idx]);

  for (const s of savings) {
    const pIdxU = activePaths.findIndex(p => p.includes(s.u));
    const pIdxV = activePaths.findIndex(p => p.includes(s.v));

    if (pIdxU === -1 || pIdxV === -1 || pIdxU === pIdxV) continue;

    const pathU = activePaths[pIdxU];
    const pathV = activePaths[pIdxV];

    const uIsFirst = pathU[0] === s.u;
    const uIsLast = pathU[pathU.length - 1] === s.u;
    const vIsFirst = pathV[0] === s.v;
    const vIsLast = pathV[pathV.length - 1] === s.v;

    if ((uIsFirst || uIsLast) && (vIsFirst || vIsLast)) {
      let merged = null;
      if (uIsLast && vIsFirst) {
        merged = [...pathU, ...pathV];
      } else if (uIsFirst && vIsLast) {
        merged = [...pathV, ...pathU];
      } else if (uIsLast && vIsLast) {
        merged = [...pathU, ...pathV.slice().reverse()];
      } else if (uIsFirst && vIsFirst) {
        merged = [...pathU.slice().reverse(), ...pathV];
      }

      if (merged) {
        activePaths[pIdxU] = merged;
        activePaths.splice(pIdxV, 1);
      }
    }
  }

  // Concatenate any remaining sub-paths
  let orderedRoute = [];
  for (const path of activePaths) {
    orderedRoute.push(...path);
  }

  // 2-Opt local refinement to untangle any crossed edges in the cluster route
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 50) {
    improved = false;
    iterations++;
    for (let i = 0; i < orderedRoute.length - 1; i++) {
      for (let j = i + 1; j < orderedRoute.length; j++) {
        // Compare current edge costs vs reversed edge costs
        const prevNode = i === 0 ? depotIndex : orderedRoute[i - 1];
        const nextNode = j === orderedRoute.length - 1 ? depotIndex : orderedRoute[j + 1];

        const nodeI = orderedRoute[i];
        const nodeJ = orderedRoute[j];

        const currentCost = getDistance(matrix, prevNode, nodeI) + getDistance(matrix, nodeJ, nextNode);
        const reversedCost = getDistance(matrix, prevNode, nodeJ) + getDistance(matrix, nodeI, nextNode);

        if (reversedCost < currentCost - 1e-6) {
          // Perform 2-Opt reverse
          const segment = orderedRoute.slice(i, j + 1).reverse();
          orderedRoute.splice(i, segment.length, ...segment);
          improved = true;
        }
      }
    }
  }

  return orderedRoute;
}

/**
 * Clarke and Wright's Savings Algorithm & Heterogeneous Fleet CVRP Solver.
 * 
 * 1. Clusters orders to trucks respecting multi-constraint limits (weight, volume, vehicle type).
 * 2. Orders each truck's route using Clarke-Wright Savings & 2-Opt local search.
 * 3. Guarantees 100% feasibility and zero dropped orders when fleet capacity suffices.
 * 
 * @param {Array<Object>} orders - Orders with coordinates
 * @param {Array<Object>} trucks - Fleet of trucks
 * @param {Object} depot - Depot object { id, lat, lng }
 * @param {Object} distanceMatrixData - { matrix, idToIndex }
 * @returns {{
 *   routes: Array<Array<number>>, // node indices per truck
 *   truckAssignments: Array<Object>,
 *   unservicedOrderIndices: Array<number>
 * }}
 */
export function clarkeWrightSavings(orders, trucks, depot, distanceMatrixData) {
  const { matrix, idToIndex } = distanceMatrixData;
  const depotIndex = idToIndex.get(String(depot.id));

  const indexToOrderMap = new Map();
  orders.forEach(o => {
    const idx = idToIndex.get(String(o.id));
    indexToOrderMap.set(idx, o);
  });

  // Step 1: Cluster-first via Multi-Constraint Truck Allocation
  const { allocations, unassignedOrders } = allocateOrdersToTrucks(orders, trucks);

  const routes = [];
  const truckAssignments = [];

  for (const truck of trucks) {
    const assignedOrders = allocations.get(truck.id) || [];
    if (assignedOrders.length === 0) {
      routes.push([]);
      truckAssignments.push({
        truckId: truck.id,
        name: truck.name,
        type: truck.type,
        routeIndices: [],
        totalDistanceKm: 0.0,
        totalWeightKg: 0,
        totalVolumeM3: 0.0
      });
      continue;
    }

    // Extract node indices
    const clusterIndices = assignedOrders.map(o => idToIndex.get(String(o.id)));

    // Step 2: Route-second via Clarke-Wright Savings on truck's cluster
    const optimizedClusterRoute = routeSingleVehicleCluster(clusterIndices, matrix, depotIndex);

    const routeDistance = Number(calculateRouteDistance(optimizedClusterRoute, matrix, depotIndex).toFixed(2));
    const feasibility = validateRouteFeasibility(optimizedClusterRoute, indexToOrderMap, truck);

    routes.push(optimizedClusterRoute);
    truckAssignments.push({
      truckId: truck.id,
      name: truck.name,
      type: truck.type,
      routeIndices: optimizedClusterRoute,
      totalDistanceKm: routeDistance,
      totalWeightKg: feasibility.totalWeight,
      totalVolumeM3: Number(feasibility.totalVolume.toFixed(2))
    });
  }

  const unservicedOrderIndices = unassignedOrders.map(o => idToIndex.get(String(o.id)));

  return {
    routes,
    truckAssignments,
    unservicedOrderIndices
  };
}

/**
 * simulatedAnnealing.js
 * 
 * Simulated Annealing (SA) Meta-Heuristic Route Optimizer for CVRP.
 * 
 * Physical Analogy & Theory:
 * Inspired by metallurgy annealing: Heating a material and slowly cooling it
 * allows atoms to settle into a minimum energy crystalline lattice.
 * In combinatorial optimization:
 * - State S: Multi-truck route assignment [[stop1, stop2], [stop3, stop4], ...]
 * - Energy E(S): Total travel distance + constraint violation penalties
 * - Temperature T: Controls probability of accepting uphill (inferior) solutions
 * 
 * Acceptance Criterion (Metropolis-Hastings):
 * If ΔE = E(new) - E(curr) < 0:
 *   Accept always (Greedy descent)
 * Else:
 *   Accept with probability P = exp(-ΔE / T)
 * 
 * At high T: High exploration (escapes local minima by accepting suboptimal moves).
 * At low T:  High exploitation (converges onto the global/near-global optimum).
 * 
 * C++ DSA Analogy:
 * - State representation: std::vector<std::vector<int>> routes;
 * - 2-Opt Move: std::reverse(route.begin() + i, route.begin() + j + 1);
 * - Fast pseudo-random generation: std::uniform_real_distribution<double> dist(0.0, 1.0);
 * - Deep copying state during transitions: route copies avoid pointer alias bugs.
 */

import { getDistance } from './distanceMatrix.js';
import { calculateRouteDistance, validateRouteFeasibility } from './cvrp.js';
import { TRUCK_TYPES } from './truckAllocation.js';

/**
 * Deep clones multi-truck route state.
 * In C++, equivalent to vector copy constructor: auto copy = routes;
 * 
 * @param {Array<Array<number>>} routes
 * @returns {Array<Array<number>>}
 */
function cloneRoutes(routes) {
  return routes.map(r => r.slice());
}

/**
 * Evaluates the total energy (objective function) of a solution state.
 * Includes distance and soft penalty coefficients for capacity overflow.
 * 
 * E(S) = Σ distance(R_k) + λ_w * Σ overflow_w + λ_v * Σ overflow_v
 * 
 * @param {Array<Array<number>>} routes
 * @param {Array<Array<number>>} matrix
 * @param {number} depotIndex
 * @param {Map<number, Object>} indexToOrderMap
 * @param {Array<Object>} trucks
 * @returns {{ energy: number, rawDistance: number, isFeasible: boolean }}
 */
export function evaluateSolutionEnergy(routes, matrix, depotIndex, indexToOrderMap, trucks) {
  let rawDistance = 0.0;
  let penalty = 0.0;
  let isFeasible = true;

  const PENALTY_WEIGHT_PER_KG = 50.0;
  const PENALTY_VOLUME_PER_M3 = 500.0;
  const PENALTY_INCOMPATIBLE = 100000.0;

  for (let k = 0; k < routes.length; k++) {
    const route = routes[k];
    const truck = trucks[k] || trucks[0];

    // Travel distance component
    rawDistance += calculateRouteDistance(route, matrix, depotIndex);

    // Capacity & compatibility verification
    if (indexToOrderMap && truck) {
      const check = validateRouteFeasibility(route, indexToOrderMap, truck);
      if (!check.feasible) {
        isFeasible = false;
        if (check.violation && check.violation.includes('incompatible')) {
          penalty += PENALTY_INCOMPATIBLE;
        }
        const maxW = truck.maxWeightKg || 1000;
        const maxV = truck.maxVolumeM3 || 6.0;
        const weightOverflow = Math.max(0, check.totalWeight - maxW);
        const volumeOverflow = Math.max(0, check.totalVolume - maxV);
        penalty += (weightOverflow * PENALTY_WEIGHT_PER_KG) + (volumeOverflow * PENALTY_VOLUME_PER_M3);
      }
    }
  }

  return {
    energy: rawDistance + penalty,
    rawDistance,
    isFeasible
  };
}

/**
 * Checks if a stop can categorically fit into a truck based on packageType.
 */
function isPackageCompatible(nodeIdx, truck, indexToOrderMap) {
  if (!indexToOrderMap || !truck) return true;
  const order = indexToOrderMap.get(nodeIdx);
  if (!order) return true;

  const spec = TRUCK_TYPES[truck.type?.toUpperCase()] || truck;
  if (spec.allowedPackageTypes && order.packageType) {
    return spec.allowedPackageTypes.includes(order.packageType);
  }
  return true;
}

/**
 * Perturbation Operator 1: 2-Opt Inversion (Intra-route)
 * Reverses the order of stops between index i and j within the same truck route.
 * Eliminates intersecting / self-crossing paths. Always 100% capacity-feasible!
 * 
 * @param {Array<Array<number>>} routes
 * @returns {Array<Array<number>>} Modified routes
 */
function apply2OptMove(routes) {
  const nextRoutes = cloneRoutes(routes);
  const validRouteIndices = [];
  for (let k = 0; k < nextRoutes.length; k++) {
    if (nextRoutes[k].length >= 2) validRouteIndices.push(k);
  }

  if (validRouteIndices.length === 0) return nextRoutes;

  const chosenRouteIdx = validRouteIndices[Math.floor(Math.random() * validRouteIndices.length)];
  const route = nextRoutes[chosenRouteIdx];

  const i = Math.floor(Math.random() * (route.length - 1));
  const j = i + 1 + Math.floor(Math.random() * (route.length - i - 1));

  // Reverse subarray from i to j (in-place reverse)
  let left = i;
  let right = j;
  while (left < right) {
    const temp = route[left];
    route[left] = route[right];
    route[right] = temp;
    left++;
    right--;
  }

  return nextRoutes;
}

/**
 * Perturbation Operator 2: Swap Move (Intra-route or Inter-route)
 * Swaps two stops randomly selected.
 * If cross-truck, verifies vehicle category compatibility.
 */
function applySwapMove(routes, trucks, indexToOrderMap) {
  const nextRoutes = cloneRoutes(routes);
  const nonEmptyTrucks = [];
  for (let k = 0; k < nextRoutes.length; k++) {
    if (nextRoutes[k].length > 0) nonEmptyTrucks.push(k);
  }

  if (nonEmptyTrucks.length === 0) return nextRoutes;

  const truckA = nonEmptyTrucks[Math.floor(Math.random() * nonEmptyTrucks.length)];
  const truckB = nonEmptyTrucks[Math.floor(Math.random() * nonEmptyTrucks.length)];

  const routeA = nextRoutes[truckA];
  const routeB = nextRoutes[truckB];

  const posA = Math.floor(Math.random() * routeA.length);
  const posB = Math.floor(Math.random() * routeB.length);

  const nodeA = routeA[posA];
  const nodeB = routeB[posB];

  // If swapping between different trucks, check category compatibility
  if (truckA !== truckB && trucks && indexToOrderMap) {
    const tA = trucks[truckA];
    const tB = trucks[truckB];
    if (!isPackageCompatible(nodeA, tB, indexToOrderMap) || !isPackageCompatible(nodeB, tA, indexToOrderMap)) {
      // Incompatible types, fallback to intra-route 2-opt
      return apply2OptMove(routes);
    }
  }

  // Swap
  routeA[posA] = nodeB;
  routeB[posB] = nodeA;

  return nextRoutes;
}

/**
 * Perturbation Operator 3: Relocate Move (Shift)
 * Moves a stop from one truck route into a different truck route.
 */
function applyRelocateMove(routes, trucks, indexToOrderMap) {
  const nextRoutes = cloneRoutes(routes);
  const sourceTrucks = [];
  for (let k = 0; k < nextRoutes.length; k++) {
    if (nextRoutes[k].length > 0) sourceTrucks.push(k);
  }

  if (sourceTrucks.length === 0 || nextRoutes.length < 2) return nextRoutes;

  const fromTruck = sourceTrucks[Math.floor(Math.random() * sourceTrucks.length)];
  let toTruck = Math.floor(Math.random() * nextRoutes.length);
  while (toTruck === fromTruck && nextRoutes.length > 1) {
    toTruck = Math.floor(Math.random() * nextRoutes.length);
  }

  const fromRoute = nextRoutes[fromTruck];
  const toRoute = nextRoutes[toTruck];

  const removePos = Math.floor(Math.random() * fromRoute.length);
  const candidateNode = fromRoute[removePos];

  // Check category compatibility with destination truck
  if (trucks && indexToOrderMap) {
    const destTruck = trucks[toTruck];
    if (!isPackageCompatible(candidateNode, destTruck, indexToOrderMap)) {
      return apply2OptMove(routes);
    }
  }

  const [removedNode] = fromRoute.splice(removePos, 1);
  const insertPos = Math.floor(Math.random() * (toRoute.length + 1));
  toRoute.splice(insertPos, 0, removedNode);

  return nextRoutes;
}

/**
 * Generates a perturbed neighbor solution using stochastic operator selection.
 * 
 * Operator Probabilities:
 * - 2-Opt:    50% (preserves feasibility, untangles crossed paths)
 * - Swap:     30% (stop exchange)
 * - Relocate: 20% (load balancing)
 */
function getNeighborState(routes, trucks, indexToOrderMap) {
  const rand = Math.random();
  if (rand < 0.50) {
    return apply2OptMove(routes);
  } else if (rand < 0.80) {
    return applySwapMove(routes, trucks, indexToOrderMap);
  } else {
    return applyRelocateMove(routes, trucks, indexToOrderMap);
  }
}

/**
 * Simulated Annealing Optimizer for Multi-Truck CVRP.
 * 
 * @param {Object} params
 * @param {Array<Array<number>>} params.initialRoutes - Starting solution
 * @param {Array<Array<number>>} params.distanceMatrix - Adjacency matrix
 * @param {number} params.depotIndex - Index of central depot (default 0)
 * @param {Map<number, Object>} params.indexToOrderMap - Order lookups
 * @param {Array<Object>} params.trucks - Fleet configurations
 * @param {Object} [params.options] - SA hyper-parameters
 * @returns {{
 *   bestRoutes: Array<Array<number>>,
 *   initialDistance: number,
 *   bestDistance: number,
 *   distanceSaved: number,
 *   percentageSaved: number,
 *   iterations: number,
 *   history: Array<{ temperature: number, currentCost: number, bestCost: number }>,
 *   executionTimeMs: number
 * }}
 */
export function simulatedAnnealingOptimize({
  initialRoutes,
  distanceMatrix,
  depotIndex = 0,
  indexToOrderMap,
  trucks,
  options = {}
}) {
  const startTime = performance.now();

  const {
    initialTemperature = 1000.0,
    minTemperature = 0.05,
    coolingRate = 0.985,
    iterationsPerTemp = 40,
    maxStagnantSteps = 600
  } = options;

  let currentRoutes = cloneRoutes(initialRoutes);
  let currentEval = evaluateSolutionEnergy(currentRoutes, distanceMatrix, depotIndex, indexToOrderMap, trucks);

  let bestRoutes = cloneRoutes(currentRoutes);
  let bestEnergy = currentEval.energy;
  let bestDistance = currentEval.rawDistance;
  const initialDistance = currentEval.rawDistance;

  let temperature = initialTemperature;
  let totalIterations = 0;
  let stagnantSteps = 0;

  const history = [];
  history.push({
    temperature: Number(temperature.toFixed(2)),
    currentCost: Number(currentEval.rawDistance.toFixed(2)),
    bestCost: Number(bestDistance.toFixed(2))
  });

  while (temperature > minTemperature && stagnantSteps < maxStagnantSteps) {
    for (let i = 0; i < iterationsPerTemp; i++) {
      totalIterations++;

      // 1. Generate neighbor state through perturbation
      const candidateRoutes = getNeighborState(currentRoutes, trucks, indexToOrderMap);
      const candidateEval = evaluateSolutionEnergy(
        candidateRoutes,
        distanceMatrix,
        depotIndex,
        indexToOrderMap,
        trucks
      );

      // 2. Compute Energy Delta ΔE
      const deltaE = candidateEval.energy - currentEval.energy;

      // 3. Metropolis Criterion
      let accept = false;
      if (deltaE < 0) {
        // Strict improvement -> accept immediately
        accept = true;
      } else {
        // Worse solution -> accept with probability P = exp(-ΔE / T)
        const acceptanceProbability = Math.exp(-deltaE / temperature);
        if (Math.random() < acceptanceProbability) {
          accept = true;
        }
      }

      if (accept) {
        currentRoutes = candidateRoutes;
        currentEval = candidateEval;

        // Check if new global best found (must be feasible)
        if (candidateEval.isFeasible && candidateEval.rawDistance < bestDistance) {
          bestRoutes = cloneRoutes(candidateRoutes);
          bestEnergy = candidateEval.energy;
          bestDistance = candidateEval.rawDistance;
          stagnantSteps = 0; // Reset stagnation counter
        }
      } else {
        stagnantSteps++;
      }
    }

    // Cooling schedule: Geometric reduction T = α * T
    temperature *= coolingRate;

    // Record progress snapshot every few temperature steps
    if (totalIterations % (iterationsPerTemp * 2) === 0) {
      history.push({
        temperature: Number(temperature.toFixed(2)),
        currentCost: Number(currentEval.rawDistance.toFixed(2)),
        bestCost: Number(bestDistance.toFixed(2))
      });
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
  const distanceSaved = Number(Math.max(0, initialDistance - bestDistance).toFixed(2));
  const percentageSaved = initialDistance > 0 
    ? Number(((distanceSaved / initialDistance) * 100).toFixed(1))
    : 0;

  return {
    bestRoutes,
    initialDistance: Number(initialDistance.toFixed(2)),
    bestDistance: Number(bestDistance.toFixed(2)),
    distanceSaved,
    percentageSaved,
    iterations: totalIterations,
    history,
    executionTimeMs
  };
}

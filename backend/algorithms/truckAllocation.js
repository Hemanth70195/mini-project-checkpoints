/**
 * truckAllocation.js
 * 
 * Multi-constraint truck allocation and package classification engine.
 * Solves the multi-dimensional Bin Packing Problem (BPP) with domain-specific
 * logistics constraints (weight, volume, vehicle capability, and fuel economy).
 * 
 * C++ DSA Analogy:
 * 1) Multi-dimensional Knapsack / Bin Packing is NP-Hard.
 * 2) We implement First-Fit Decreasing (FFD) / Best-Fit Decreasing (BFD) heuristics:
 *    - Orders are sorted using a custom comparator (like C++ std::sort with lambda)
 *      by composite load score: Score = (weight / maxW) + (volume / maxV).
 *    - Trucks are chosen to minimize operating cost and fuel burn by favoring
 *      the most efficient vehicle class capable of transporting the cargo.
 */

// Predefined Truck Category Profiles
export const TRUCK_TYPES = {
  MINI: {
    type: 'mini',
    name: 'Mini Van / Light Commercial',
    maxWeightKg: 1000,
    maxVolumeM3: 6.0,
    baseMileageKmPerLitre: 14.0,
    fuelCapacityLitres: 50,
    allowedPackageTypes: ['small_parcel', 'electronics', 'documents', 'apparel']
  },
  MEDIUM: {
    type: 'medium',
    name: 'Medium Duty Box Truck',
    maxWeightKg: 3500,
    maxVolumeM3: 18.0,
    baseMileageKmPerLitre: 8.5,
    fuelCapacityLitres: 120,
    allowedPackageTypes: ['small_parcel', 'electronics', 'documents', 'apparel', 'furniture', 'appliances']
  },
  LARGE: {
    type: 'large',
    name: 'Heavy Duty Container Truck',
    maxWeightKg: 12000,
    maxVolumeM3: 50.0,
    baseMileageKmPerLitre: 4.5,
    fuelCapacityLitres: 300,
    allowedPackageTypes: ['small_parcel', 'electronics', 'documents', 'apparel', 'furniture', 'appliances', 'heavy_machinery', 'bulk_industrial']
  }
};

/**
 * Classifies package category based on physical weight and volume.
 * 
 * @param {number} weightKg - Weight in kilograms
 * @param {number} volumeM3 - Volume in cubic meters
 * @returns {string} Package category key
 */
export function classifyPackage(weightKg, volumeM3) {
  if (weightKg > 3500 || volumeM3 > 18.0) {
    return 'heavy_machinery';
  }
  if (weightKg > 200 || volumeM3 > 2.0) {
    return 'furniture';
  }
  if (weightKg > 20 || volumeM3 > 0.3) {
    return 'appliances';
  }
  return 'small_parcel';
}

/**
 * Checks if an order can physically and categorically fit into a truck.
 * 
 * @param {Object} order - Order with weightKg, volumeM3, packageType
 * @param {Object} truck - Truck with current loads and limits
 * @returns {{ compatible: boolean, reason?: string }}
 */
export function canFitInTruck(order, truck) {
  const currentWeight = truck.currentWeightKg || 0;
  const currentVolume = truck.currentVolumeM3 || 0;

  const pkgType = order.packageType || classifyPackage(order.weightKg, order.volumeM3);
  const truckSpec = TRUCK_TYPES[truck.type?.toUpperCase()] || truck;

  // 1. Check category permission (e.g. heavy machinery cannot go in a mini van)
  if (truckSpec.allowedPackageTypes && !truckSpec.allowedPackageTypes.includes(pkgType)) {
    return {
      compatible: false,
      reason: `Package type '${pkgType}' is not allowed in truck type '${truck.type}'`
    };
  }

  // 2. Multi-dimensional capacity bounds check
  const newWeight = currentWeight + order.weightKg;
  if (newWeight > truck.maxWeightKg) {
    return {
      compatible: false,
      reason: `Weight limit exceeded: ${newWeight} kg > ${truck.maxWeightKg} kg`
    };
  }

  const newVolume = currentVolume + order.volumeM3;
  if (newVolume > truck.maxVolumeM3) {
    return {
      compatible: false,
      reason: `Volume limit exceeded: ${newVolume.toFixed(2)} m³ > ${truck.maxVolumeM3} m³`
    };
  }

  return { compatible: true };
}

/**
 * Returns rank of truck type for fuel efficiency matching.
 * mini (rank 1) -> medium (rank 2) -> large (rank 3)
 */
function getTruckClassRank(type) {
  if (type === 'mini') return 1;
  if (type === 'medium') return 2;
  return 3;
}

/**
 * Multi-Constraint Greedy Truck Allocation Heuristic.
 * 
 * Algorithm Workflow:
 * 1. Categorize any unclassified orders.
 * 2. Sort orders in descending order of constraint demand (heaviest & highest priority first).
 * 3. For each order, prefer the most fuel-efficient truck class that can accommodate it,
 *    balancing load across vehicles of that class.
 * 
 * Time Complexity: O(M * log M + M * K) where M = orders, K = trucks.
 * Space Complexity: O(M + K).
 * 
 * @param {Array<Object>} orders - List of delivery orders
 * @param {Array<Object>} trucks - Available fleet of trucks
 * @returns {{
 *   allocations: Map<string, Array<Object>>, // truckId -> orders array
 *   unassignedOrders: Array<Object>,
 *   truckSummaries: Array<Object>
 * }}
 */
export function allocateOrdersToTrucks(orders, trucks) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return { allocations: new Map(), unassignedOrders: [], truckSummaries: [] };
  }
  if (!Array.isArray(trucks) || trucks.length === 0) {
    return { allocations: new Map(), unassignedOrders: [...orders], truckSummaries: [] };
  }

  // Clone trucks to avoid mutating input state
  const fleetState = trucks.map(truck => {
    const spec = TRUCK_TYPES[truck.type?.toUpperCase()] || {};
    return {
      ...truck,
      maxWeightKg: truck.maxWeightKg || spec.maxWeightKg || 1000,
      maxVolumeM3: truck.maxVolumeM3 || spec.maxVolumeM3 || 6.0,
      baseMileageKmPerLitre: truck.baseMileageKmPerLitre || spec.baseMileageKmPerLitre || 10.0,
      currentWeightKg: 0,
      currentVolumeM3: 0,
      assignedOrders: []
    };
  });

  // Normalize and score orders
  const preparedOrders = orders.map(order => {
    const weight = Number(order.weightKg) || 10;
    const volume = Number(order.volumeM3) || 0.1;
    const packageType = order.packageType || classifyPackage(weight, volume);
    return {
      ...order,
      weightKg: weight,
      volumeM3: volume,
      packageType,
      sortKey: (order.priority || 1) * 10000 + weight + (volume * 100)
    };
  });

  // Sort descending (heaviest/highest priority first)
  preparedOrders.sort((a, b) => b.sortKey - a.sortKey);

  const unassignedOrders = [];

  for (const order of preparedOrders) {
    let bestTruckIndex = -1;
    let bestRank = Infinity;
    let minLoadRatio = Infinity;

    // Evaluate all trucks:
    // Rule 1: Must be compatible (fitCheck.compatible === true)
    // Rule 2: Prefer smaller, fuel-efficient truck class (mini before med before large)
    // Rule 3: Within same class, balance workload across trucks
    for (let i = 0; i < fleetState.length; i++) {
      const truck = fleetState[i];
      const fitCheck = canFitInTruck(order, truck);

      if (fitCheck.compatible) {
        const truckRank = getTruckClassRank(truck.type);
        const currentLoadRatio = (truck.currentWeightKg / truck.maxWeightKg) + (truck.currentVolumeM3 / truck.maxVolumeM3);

        if (truckRank < bestRank) {
          bestRank = truckRank;
          minLoadRatio = currentLoadRatio;
          bestTruckIndex = i;
        } else if (truckRank === bestRank) {
          if (currentLoadRatio < minLoadRatio) {
            minLoadRatio = currentLoadRatio;
            bestTruckIndex = i;
          }
        }
      }
    }

    if (bestTruckIndex !== -1) {
      const chosenTruck = fleetState[bestTruckIndex];
      chosenTruck.assignedOrders.push(order);
      chosenTruck.currentWeightKg += order.weightKg;
      chosenTruck.currentVolumeM3 += order.volumeM3;
    } else {
      unassignedOrders.push(order);
    }
  }

  // Format results
  const allocations = new Map();
  const truckSummaries = fleetState.map(truck => {
    allocations.set(truck.id, truck.assignedOrders);
    return {
      truckId: truck.id,
      name: truck.name,
      type: truck.type,
      orderCount: truck.assignedOrders.length,
      totalWeightKg: truck.currentWeightKg,
      maxWeightKg: truck.maxWeightKg,
      weightUtilizationPercent: Number(((truck.currentWeightKg / truck.maxWeightKg) * 100).toFixed(1)),
      totalVolumeM3: Number(truck.currentVolumeM3.toFixed(2)),
      maxVolumeM3: truck.maxVolumeM3,
      volumeUtilizationPercent: Number(((truck.currentVolumeM3 / truck.maxVolumeM3) * 100).toFixed(1))
    };
  });

  return {
    allocations,
    unassignedOrders,
    truckSummaries
  };
}

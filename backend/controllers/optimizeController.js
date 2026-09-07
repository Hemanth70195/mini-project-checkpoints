/**
 * optimizeController.js
 * 
 * End-to-End Fleet Optimization Controller.
 * Connects directly to the Phase 1 Algorithmic Core:
 * - Haversine Distance
 * - N x N Adjacency Distance Matrix
 * - Multi-Constraint Truck Allocation (Bin Packing)
 * - CVRP Clarke-Wright Savings
 * - Simulated Annealing Meta-Heuristic
 */

import { buildDistanceMatrix, getDistance } from '../algorithms/distanceMatrix.js';
import { clarkeWrightSavings, calculateRouteDistance, calculateFleetDistance } from '../algorithms/cvrp.js';
import { simulatedAnnealingOptimize } from '../algorithms/simulatedAnnealing.js';

import Truck from '../models/Truck.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import Trip from '../models/Trip.js';
import inMemoryStore from '../data/inMemoryStore.js';
import { isMongoActive } from '../config/db.js';

/**
 * POST /api/optimize
 * 
 * Executes full fleet route optimization.
 * Accepts optional orders, trucks, depot, and SA hyper-parameters.
 * Falls back to active database / in-memory records if omitted.
 */
export async function optimizeRoutes(req, res, next) {
  try {
    const startTime = performance.now();
    let { orders, trucks, depot, options } = req.body;

    // 1. Resolve Delivery Orders
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      if (isMongoActive()) {
        orders = await DeliveryOrder.find({ status: { $ne: 'delivered' } });
        if (orders.length === 0) {
          orders = await DeliveryOrder.find({});
        }
      } else {
        orders = inMemoryStore.getOrders({ status: 'pending' });
        if (orders.length === 0) {
          orders = inMemoryStore.getOrders();
        }
      }
    }

    // 2. Resolve Fleet Trucks
    if (!trucks || !Array.isArray(trucks) || trucks.length === 0) {
      if (isMongoActive()) {
        trucks = await Truck.find({});
      } else {
        trucks = inMemoryStore.getTrucks();
      }
    }

    // 3. Resolve Central Depot
    if (!depot || !depot.lat || !depot.lng) {
      depot = inMemoryStore.getDepot();
    }

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No delivery orders available to optimize'
      });
    }

    if (!trucks || trucks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No trucks available in fleet to assign routes'
      });
    }

    // Normalize Orders
    const normalizedOrders = orders.map((o, idx) => ({
      id: String(o.orderId || o.id || `ORD_${idx + 1}`),
      orderId: String(o.orderId || o.id || `ORD_${idx + 1}`),
      customer: o.customer || `Customer ${idx + 1}`,
      address: o.address || 'Address Unspecified',
      lat: Number(o.lat),
      lng: Number(o.lng),
      weightKg: Number(o.weightKg) || 10,
      volumeM3: Number(o.volumeM3) || 0.1,
      packageType: o.packageType || 'small_parcel',
      priority: Number(o.priority) || 1,
      description: o.description || ''
    }));

    // Normalize Trucks
    const normalizedTrucks = trucks.map((t, idx) => ({
      id: String(t.truckId || t.id || `TRUCK_${idx + 1}`),
      truckId: String(t.truckId || t.id || `TRUCK_${idx + 1}`),
      name: t.name || `Truck ${idx + 1}`,
      type: t.type || 'mini',
      maxWeightKg: Number(t.maxWeightKg) || 1000,
      maxVolumeM3: Number(t.maxVolumeM3) || 6.0,
      baseMileageKmPerLitre: Number(t.baseMileageKmPerLitre) || 10.0,
      fuelCapacityLitres: Number(t.fuelCapacityLitres) || 100,
      currentFuelLitres: Number(t.currentFuelLitres) || 100,
      driver: t.driver || { name: 'Staff Driver', phone: '' }
    }));

    const normalizedDepot = {
      id: String(depot.id || 'DEPOT_01'),
      name: depot.name || 'Central Logistics Depot',
      lat: Number(depot.lat),
      lng: Number(depot.lng),
      type: 'depot'
    };

    // -------------------------------------------------------------
    // ALGORITHM PIPELINE EXECUTION (PHASE 1 INTEGRATION)
    // -------------------------------------------------------------

    // Step 1: Build N x N Geodesic Distance Matrix
    const allLocations = [normalizedDepot, ...normalizedOrders];
    const matrixData = buildDistanceMatrix(allLocations);

    // Step 2: Initial Feasible Solution via Clarke-Wright Savings
    const initialCwResult = clarkeWrightSavings(
      normalizedOrders,
      normalizedTrucks,
      normalizedDepot,
      matrixData
    );

    // Map node index to order
    const indexToOrderMap = new Map();
    normalizedOrders.forEach(o => {
      const idx = matrixData.idToIndex.get(String(o.id));
      indexToOrderMap.set(idx, o);
    });

    // Step 3: Simulated Annealing Meta-Heuristic Optimization
    const saResult = simulatedAnnealingOptimize({
      initialRoutes: initialCwResult.routes,
      distanceMatrix: matrixData.matrix,
      depotIndex: 0,
      indexToOrderMap,
      trucks: normalizedTrucks,
      options: options || {
        initialTemperature: 1000.0,
        minTemperature: 0.05,
        coolingRate: 0.985,
        iterationsPerTemp: 40,
        maxStagnantSteps: 600
      }
    });

    // -------------------------------------------------------------
    // POST-PROCESSING: ROUTE DETAILS, FUEL & TRIP GENERATION
    // -------------------------------------------------------------
    const trips = [];
    const truckAssignments = [];
    const ordersToUpdate = [];

    const AVERAGE_SPEED_KMH = 35.0; // Realistic urban/suburban logistics transit speed
    const DIESEL_PRICE_INR = 92.0;

    saResult.bestRoutes.forEach((routeIndices, truckIndex) => {
      const truck = normalizedTrucks[truckIndex] || {
        id: `TRUCK_${truckIndex + 1}`,
        name: `Truck ${truckIndex + 1}`,
        type: 'mini',
        baseMileageKmPerLitre: 10.0
      };

      const routeDistanceKm = Number(
        calculateRouteDistance(routeIndices, matrixData.matrix, 0).toFixed(2)
      );

      // Extract waypoints
      const waypoints = [];
      let totalWeight = 0;
      let totalVolume = 0;

      routeIndices.forEach((nodeIdx, seqIdx) => {
        const order = indexToOrderMap.get(nodeIdx);
        if (order) {
          totalWeight += order.weightKg;
          totalVolume += order.volumeM3;
          waypoints.push({
            orderId: order.id,
            customer: order.customer,
            address: order.address,
            lat: order.lat,
            lng: order.lng,
            weightKg: order.weightKg,
            volumeM3: order.volumeM3,
            packageType: order.packageType,
            sequenceIndex: seqIdx + 1,
            status: 'pending'
          });

          ordersToUpdate.push({
            orderId: order.id,
            assignedTruckId: truck.id,
            status: 'assigned'
          });
        }
      });

      // Dynamic payload-adjusted fuel burn formula:
      // Burn Rate = Base Mileage * (1 + 0.3 * (Current Weight / Max Weight))
      const weightRatio = truck.maxWeightKg > 0 ? (totalWeight / truck.maxWeightKg) : 0;
      const effectiveMileage = truck.baseMileageKmPerLitre / (1 + 0.3 * weightRatio);
      const estimatedFuelLitres = routeDistanceKm > 0
        ? Number((routeDistanceKm / effectiveMileage).toFixed(2))
        : 0.0;

      // Estimated duration: transit time + 8 mins per delivery stop
      const transitMinutes = (routeDistanceKm / AVERAGE_SPEED_KMH) * 60;
      const serviceMinutes = waypoints.length * 8;
      const estimatedDurationMinutes = Math.round(transitMinutes + serviceMinutes);

      const tripId = `TRIP_${truck.id}_${Date.now().toString().slice(-6)}`;
      const tripData = {
        tripId,
        truckId: truck.id,
        truckName: truck.name,
        truckType: truck.type,
        status: waypoints.length > 0 ? 'planned' : 'completed',
        depot: normalizedDepot,
        routeWaypoints: waypoints,
        totalDistanceKm: routeDistanceKm,
        totalWeightKg: totalWeight,
        totalVolumeM3: Number(totalVolume.toFixed(2)),
        estimatedFuelLitres,
        estimatedDurationMinutes,
        startTime: new Date()
      };

      trips.push(tripData);

      truckAssignments.push({
        truckId: truck.id,
        name: truck.name,
        type: truck.type,
        driver: truck.driver,
        orderCount: waypoints.length,
        totalWeightKg: totalWeight,
        maxWeightKg: truck.maxWeightKg,
        weightUtilizationPercent: Number(((totalWeight / truck.maxWeightKg) * 100).toFixed(1)),
        totalVolumeM3: Number(totalVolume.toFixed(2)),
        maxVolumeM3: truck.maxVolumeM3,
        volumeUtilizationPercent: Number(((totalVolume / truck.maxVolumeM3) * 100).toFixed(1)),
        totalDistanceKm: routeDistanceKm,
        estimatedFuelLitres,
        estimatedDurationMinutes
      });
    });

    // -------------------------------------------------------------
    // PERSISTENCE: SAVE TRIPS & UPDATE ORDER ASSIGNMENTS
    // -------------------------------------------------------------
    if (isMongoActive()) {
      await Trip.deleteMany({ status: 'planned' }); // Clear old planned trips
      await Trip.insertMany(trips);

      for (const update of ordersToUpdate) {
        await DeliveryOrder.findOneAndUpdate(
          { orderId: update.orderId },
          { status: update.status, assignedTruckId: update.assignedTruckId }
        );
      }
    } else {
      inMemoryStore.saveTrips(trips);
      for (const update of ordersToUpdate) {
        inMemoryStore.updateOrder(update.orderId, {
          status: update.status,
          assignedTruckId: update.assignedTruckId
        });
      }
    }

    // Business Impact Metrics
    const initialDistance = saResult.initialDistance;
    const optimizedDistance = saResult.bestDistance;
    const distanceSaved = saResult.distanceSaved;
    const improvementPercentage = saResult.percentageSaved;

    const avgFleetMileage = 8.5;
    const fuelSavedLitres = Number((distanceSaved / avgFleetMileage).toFixed(2));
    const moneySavedInr = Math.round(fuelSavedLitres * DIESEL_PRICE_INR);
    const co2CutKg = Number((fuelSavedLitres * 2.68).toFixed(2));

    const totalPipelineTimeMs = Number((performance.now() - startTime).toFixed(2));

    return res.json({
      success: true,
      message: 'Multi-truck route optimization completed successfully',
      data: {
        initialDistance,
        optimizedDistance,
        distanceSaved,
        improvementPercentage,
        iterations: saResult.iterations,
        executionTimeMs: saResult.executionTimeMs,
        totalPipelineTimeMs,
        depot: normalizedDepot,
        truckAssignments,
        optimizedRoutes: saResult.bestRoutes,
        trips,
        summary: {
          totalOrdersAssigned: ordersToUpdate.length,
          totalTrucksDispatched: trips.filter(t => t.routeWaypoints.length > 0).length,
          fuelSavedLitres,
          moneySavedInr,
          co2CutKg
        },
        convergenceHistory: saResult.history
      }
    });
  } catch (error) {
    next(error);
  }
}

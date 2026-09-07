/**
 * inMemoryStore.js
 * 
 * Zero-Setup In-Memory Persistence Layer.
 * Seeded from DEMO_SCENARIOS to guarantee zero demo failures during college presentations
 * when local MongoDB is not running or Atlas IP whitelist is blocked.
 */

import { DEMO_SCENARIOS } from './demoData.js';

class InMemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    const scenario = DEMO_SCENARIOS.BANGALORE_HUB;
    this.depot = { ...scenario.depot };

    // Deep clone demo trucks
    this.trucks = scenario.trucks.map(t => ({
      ...t,
      truckId: t.id,
      status: 'idle',
      currentLocation: { lat: scenario.depot.lat, lng: scenario.depot.lng },
      driver: { name: t.driver || 'Staff Driver', phone: t.phone || '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Deep clone demo orders
    this.orders = scenario.orders.map(o => ({
      ...o,
      orderId: o.id,
      status: 'pending',
      assignedTruckId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    this.trips = [];
  }

  // --- Orders CRUD ---
  getOrders(filter = {}) {
    let result = [...this.orders];
    if (filter.status) {
      result = result.filter(o => o.status === filter.status);
    }
    if (filter.assignedTruckId) {
      result = result.filter(o => o.assignedTruckId === filter.assignedTruckId);
    }
    return result;
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id || o.orderId === id || o._id === id) || null;
  }

  createOrder(orderData) {
    const newId = orderData.orderId || orderData.id || `ORD_${String(this.orders.length + 1).padStart(3, '0')}`;
    const newOrder = {
      ...orderData,
      id: newId,
      orderId: newId,
      status: orderData.status || 'pending',
      assignedTruckId: orderData.assignedTruckId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  updateOrder(id, updateData) {
    const index = this.orders.findIndex(o => o.id === id || o.orderId === id || o._id === id);
    if (index === -1) return null;

    const existing = this.orders[index];
    const updated = {
      ...existing,
      ...updateData,
      id: existing.id,
      orderId: existing.orderId,
      updatedAt: new Date().toISOString()
    };
    this.orders[index] = updated;
    return updated;
  }

  deleteOrder(id) {
    const index = this.orders.findIndex(o => o.id === id || o.orderId === id || o._id === id);
    if (index === -1) return false;
    this.orders.splice(index, 1);
    return true;
  }

  // --- Trucks ---
  getTrucks() {
    return [...this.trucks];
  }

  getTruckById(id) {
    return this.trucks.find(t => t.id === id || t.truckId === id || t._id === id) || null;
  }

  updateTruck(id, updateData) {
    const index = this.trucks.findIndex(t => t.id === id || t.truckId === id || t._id === id);
    if (index === -1) return null;

    const existing = this.trucks[index];
    const updated = {
      ...existing,
      ...updateData,
      id: existing.id,
      truckId: existing.truckId,
      updatedAt: new Date().toISOString()
    };
    this.trucks[index] = updated;
    return updated;
  }

  // --- Trips ---
  getTrips() {
    return [...this.trips];
  }

  getTripById(id) {
    return this.trips.find(t => t.id === id || t.tripId === id || t._id === id) || null;
  }

  saveTrips(tripsArray) {
    this.trips = [...tripsArray];
    return this.trips;
  }

  // --- Depot ---
  getDepot() {
    return { ...this.depot };
  }
}

export const inMemoryStore = new InMemoryStore();
export default inMemoryStore;

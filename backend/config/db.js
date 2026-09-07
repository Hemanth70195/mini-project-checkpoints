/**
 * db.js
 * 
 * MongoDB Connection Handler with Auto-Fallback to In-Memory DEMO_MODE.
 * Ensures the Express application never crashes if local MongoDB is stopped
 * or MongoDB Atlas credentials are missing.
 */

import mongoose from 'mongoose';
import Truck from '../models/Truck.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import inMemoryStore from '../data/inMemoryStore.js';

let isConnectedToMongo = false;

export function isMongoActive() {
  return isConnectedToMongo && mongoose.connection.readyState === 1;
}

/**
 * Seeds MongoDB collections with demo data if they are currently empty.
 */
async function seedMongoIfEmpty() {
  try {
    const truckCount = await Truck.countDocuments();
    if (truckCount === 0) {
      console.log('[DB] Seeding MongoDB with initial demo trucks...');
      const demoTrucks = inMemoryStore.getTrucks().map(t => ({
        truckId: t.id || t.truckId,
        name: t.name,
        type: t.type,
        maxWeightKg: t.maxWeightKg,
        maxVolumeM3: t.maxVolumeM3,
        baseMileageKmPerLitre: t.baseMileageKmPerLitre,
        fuelCapacityLitres: t.fuelCapacityLitres,
        currentFuelLitres: t.currentFuelLitres,
        status: t.status || 'idle',
        driver: t.driver || { name: 'Staff Driver', phone: '' }
      }));
      await Truck.insertMany(demoTrucks);
    }

    const orderCount = await DeliveryOrder.countDocuments();
    if (orderCount === 0) {
      console.log('[DB] Seeding MongoDB with initial demo delivery orders...');
      const demoOrders = inMemoryStore.getOrders().map(o => ({
        orderId: o.id || o.orderId,
        customer: o.customer,
        address: o.address,
        lat: o.lat,
        lng: o.lng,
        weightKg: o.weightKg,
        volumeM3: o.volumeM3,
        packageType: o.packageType,
        priority: o.priority,
        status: 'pending',
        description: o.description || ''
      }));
      await DeliveryOrder.insertMany(demoOrders);
    }
  } catch (seedErr) {
    console.warn('[DB] Warning during seed check:', seedErr.message);
  }
}

/**
 * Connects to MongoDB with quick timeout fallback.
 * 
 * @param {string} [uri] - Optional connection URI
 * @returns {Promise<boolean>} True if connected to MongoDB, false if in DEMO_MODE
 */
export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_logistics_db';

  try {
    // Attempt connection with a strict 3-second serverSelectionTimeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });

    isConnectedToMongo = true;
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);

    // Seed database if empty
    await seedMongoIfEmpty();
    return true;
  } catch (error) {
    isConnectedToMongo = false;
    console.log(`[DB] MongoDB unavailable (${error.message}).`);
    console.log(`[DB] === DEMO_MODE ACTIVE: Utilizing In-Memory Persistence Layer ===`);
    return false;
  }
}

export default connectDB;

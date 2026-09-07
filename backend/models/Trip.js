/**
 * Trip.js
 * Mongoose Schema & Model for Dispatched Multi-Truck Delivery Trips
 */

import mongoose from 'mongoose';

const WaypointSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    customer: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    volumeM3: { type: Number, required: true },
    packageType: { type: String, default: 'small_parcel' },
    sequenceIndex: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'failed'],
      default: 'pending'
    }
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    truckId: {
      type: String,
      required: true,
      index: true
    },
    truckName: {
      type: String,
      default: ''
    },
    truckType: {
      type: String,
      default: 'mini'
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    depot: {
      id: { type: String, default: 'DEPOT_01' },
      name: { type: String, default: 'Central Fulfillment Hub' },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    routeWaypoints: [WaypointSchema],
    totalDistanceKm: {
      type: Number,
      required: true,
      default: 0.0
    },
    totalWeightKg: {
      type: Number,
      default: 0
    },
    totalVolumeM3: {
      type: Number,
      default: 0.0
    },
    estimatedFuelLitres: {
      type: Number,
      default: 0.0
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 0
    },
    startTime: {
      type: Date
    },
    completedTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
export default Trip;

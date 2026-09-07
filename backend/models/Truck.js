/**
 * Truck.js
 * Mongoose Schema & Model for Fleet Vehicles
 */

import mongoose from 'mongoose';

const TruckSchema = new mongoose.Schema(
  {
    truckId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['mini', 'medium', 'large'],
      required: true,
      default: 'mini'
    },
    maxWeightKg: {
      type: Number,
      required: true,
      min: 100
    },
    maxVolumeM3: {
      type: Number,
      required: true,
      min: 1.0
    },
    baseMileageKmPerLitre: {
      type: Number,
      required: true,
      default: 10.0
    },
    fuelCapacityLitres: {
      type: Number,
      required: true,
      default: 100
    },
    currentFuelLitres: {
      type: Number,
      default: function() {
        return this.fuelCapacityLitres;
      }
    },
    status: {
      type: String,
      enum: ['idle', 'in_transit', 'refueling', 'maintenance'],
      default: 'idle'
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number }
    },
    driver: {
      name: { type: String, default: 'Unassigned' },
      phone: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

export const Truck = mongoose.models.Truck || mongoose.model('Truck', TruckSchema);
export default Truck;

/**
 * DeliveryOrder.js
 * Mongoose Schema & Model for Customer Delivery Orders
 */

import mongoose from 'mongoose';

const DeliveryOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customer: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0.1
    },
    volumeM3: {
      type: Number,
      required: true,
      min: 0.01
    },
    packageType: {
      type: String,
      enum: [
        'small_parcel',
        'electronics',
        'apparel',
        'appliances',
        'furniture',
        'heavy_machinery',
        'bulk_industrial'
      ],
      default: 'small_parcel'
    },
    priority: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending'
    },
    assignedTruckId: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const DeliveryOrder = mongoose.models.DeliveryOrder || mongoose.model('DeliveryOrder', DeliveryOrderSchema);
export default DeliveryOrder;

/**
 * orderController.js
 * 
 * REST API Controllers for Delivery Orders.
 * Supports dual-mode persistence (MongoDB + In-Memory Fallback).
 */

import DeliveryOrder from '../models/DeliveryOrder.js';
import inMemoryStore from '../data/inMemoryStore.js';
import { isMongoActive } from '../config/db.js';
import { classifyPackage } from '../algorithms/truckAllocation.js';

/**
 * GET /api/orders
 * Retrieves all delivery orders (supports query filters: ?status=pending)
 */
export async function getOrders(req, res, next) {
  try {
    const { status, assignedTruckId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTruckId) filter.assignedTruckId = assignedTruckId;

    if (isMongoActive()) {
      const orders = await DeliveryOrder.find(filter).sort({ createdAt: -1 });
      return res.json({
        success: true,
        source: 'mongodb',
        count: orders.length,
        data: orders
      });
    }

    const orders = inMemoryStore.getOrders(filter);
    return res.json({
      success: true,
      source: 'in_memory_demo',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Retrieves a single order by ID
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const order = await DeliveryOrder.findOne({
        $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
      if (!order) {
        return res.status(404).json({ success: false, message: `Order '${id}' not found` });
      }
      return res.json({ success: true, source: 'mongodb', data: order });
    }

    const order = inMemoryStore.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: `Order '${id}' not found` });
    }
    return res.json({ success: true, source: 'in_memory_demo', data: order });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders
 * Creates a new delivery order with input validation
 */
export async function createOrder(req, res, next) {
  try {
    const {
      orderId,
      customer,
      address,
      lat,
      lng,
      weightKg,
      volumeM3,
      packageType,
      priority,
      description
    } = req.body;

    // Validation
    if (!customer || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer and address are required'
      });
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180'
      });
    }

    const parsedWeight = Number(weightKg);
    const parsedVolume = Number(volumeM3);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid weight: weightKg must be a positive number'
      });
    }
    if (isNaN(parsedVolume) || parsedVolume <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volume: volumeM3 must be a positive number'
      });
    }

    const autoPackageType = packageType || classifyPackage(parsedWeight, parsedVolume);
    const newOrderId = orderId || `ORD_${Date.now().toString().slice(-4)}`;

    const orderPayload = {
      orderId: newOrderId,
      id: newOrderId,
      customer: String(customer).trim(),
      address: String(address).trim(),
      lat: parsedLat,
      lng: parsedLng,
      weightKg: parsedWeight,
      volumeM3: parsedVolume,
      packageType: autoPackageType,
      priority: Math.max(1, Math.min(3, Number(priority) || 1)),
      status: 'pending',
      assignedTruckId: null,
      description: description ? String(description).trim() : ''
    };

    if (isMongoActive()) {
      const created = await DeliveryOrder.create(orderPayload);
      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: 'Order created successfully',
        data: created
      });
    }

    const created = inMemoryStore.createOrder(orderPayload);
    return res.status(201).json({
      success: true,
      source: 'in_memory_demo',
      message: 'Order created successfully in Demo Mode',
      data: created
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orders/:id
 * Updates an existing delivery order
 */
export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Numerical sanity
    if (updateData.weightKg !== undefined) updateData.weightKg = Number(updateData.weightKg);
    if (updateData.volumeM3 !== undefined) updateData.volumeM3 = Number(updateData.volumeM3);
    if (updateData.lat !== undefined) updateData.lat = Number(updateData.lat);
    if (updateData.lng !== undefined) updateData.lng = Number(updateData.lng);

    if (isMongoActive()) {
      const updated = await DeliveryOrder.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        updateData,
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: `Order '${id}' not found` });
      }
      return res.json({ success: true, source: 'mongodb', data: updated });
    }

    const updated = inMemoryStore.updateOrder(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Order '${id}' not found` });
    }
    return res.json({ success: true, source: 'in_memory_demo', data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/orders/:id
 * Deletes a delivery order
 */
export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const deleted = await DeliveryOrder.findOneAndDelete({
        $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
      if (!deleted) {
        return res.status(404).json({ success: false, message: `Order '${id}' not found` });
      }
      return res.json({ success: true, message: `Order '${id}' deleted successfully` });
    }

    const success = inMemoryStore.deleteOrder(id);
    if (!success) {
      return res.status(404).json({ success: false, message: `Order '${id}' not found` });
    }
    return res.json({ success: true, message: `Order '${id}' deleted successfully` });
  } catch (error) {
    next(error);
  }
}

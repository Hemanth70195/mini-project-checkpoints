/**
 * tripController.js
 * 
 * REST API Controllers for Generated & Active Multi-Truck Delivery Trips.
 * Supports dual-mode persistence (MongoDB + In-Memory Fallback).
 */

import Trip from '../models/Trip.js';
import inMemoryStore from '../data/inMemoryStore.js';
import { isMongoActive } from '../config/db.js';

/**
 * GET /api/trips
 * Retrieves all planned and active trips
 */
export async function getTrips(req, res, next) {
  try {
    const { status, truckId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (truckId) filter.truckId = truckId;

    if (isMongoActive()) {
      const trips = await Trip.find(filter).sort({ createdAt: -1 });
      return res.json({
        success: true,
        source: 'mongodb',
        count: trips.length,
        data: trips
      });
    }

    let trips = inMemoryStore.getTrips();
    if (status) trips = trips.filter(t => t.status === status);
    if (truckId) trips = trips.filter(t => t.truckId === truckId);

    return res.json({
      success: true,
      source: 'in_memory_demo',
      count: trips.length,
      data: trips
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trips/:id
 * Retrieves a single trip by tripId or _id
 */
export async function getTripById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const trip = await Trip.findOne({
        $or: [{ tripId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
      if (!trip) {
        return res.status(404).json({ success: false, message: `Trip '${id}' not found` });
      }
      return res.json({ success: true, source: 'mongodb', data: trip });
    }

    const trip = inMemoryStore.getTripById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: `Trip '${id}' not found` });
    }
    return res.json({ success: true, source: 'in_memory_demo', data: trip });
  } catch (error) {
    next(error);
  }
}

/**
 * truckController.js
 * 
 * REST API Controllers for Fleet Trucks.
 * Supports dual-mode persistence (MongoDB + In-Memory Fallback).
 */

import Truck from '../models/Truck.js';
import inMemoryStore from '../data/inMemoryStore.js';
import { isMongoActive } from '../config/db.js';

/**
 * GET /api/trucks
 * Retrieves all trucks in the fleet with active status and capacities
 */
export async function getTrucks(req, res, next) {
  try {
    if (isMongoActive()) {
      const trucks = await Truck.find({}).sort({ truckId: 1 });
      return res.json({
        success: true,
        source: 'mongodb',
        count: trucks.length,
        data: trucks
      });
    }

    const trucks = inMemoryStore.getTrucks();
    return res.json({
      success: true,
      source: 'in_memory_demo',
      count: trucks.length,
      data: trucks
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trucks/:id
 * Retrieves a single truck by ID
 */
export async function getTruckById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const truck = await Truck.findOne({
        $or: [{ truckId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
      if (!truck) {
        return res.status(404).json({ success: false, message: `Truck '${id}' not found` });
      }
      return res.json({ success: true, source: 'mongodb', data: truck });
    }

    const truck = inMemoryStore.getTruckById(id);
    if (!truck) {
      return res.status(404).json({ success: false, message: `Truck '${id}' not found` });
    }
    return res.json({ success: true, source: 'in_memory_demo', data: truck });
  } catch (error) {
    next(error);
  }
}

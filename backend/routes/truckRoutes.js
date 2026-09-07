/**
 * truckRoutes.js
 * Express router for Truck endpoints
 */

import { Router } from 'express';
import { getTrucks, getTruckById } from '../controllers/truckController.js';

const router = Router();

router.route('/')
  .get(getTrucks);

router.route('/:id')
  .get(getTruckById);

export default router;

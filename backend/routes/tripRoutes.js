/**
 * tripRoutes.js
 * Express router for Trip endpoints
 */

import { Router } from 'express';
import { getTrips, getTripById } from '../controllers/tripController.js';

const router = Router();

router.route('/')
  .get(getTrips);

router.route('/:id')
  .get(getTripById);

export default router;

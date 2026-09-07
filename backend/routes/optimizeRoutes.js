/**
 * optimizeRoutes.js
 * Express router for Route Optimization endpoint
 */

import { Router } from 'express';
import { optimizeRoutes } from '../controllers/optimizeController.js';

const router = Router();

router.post('/', optimizeRoutes);

export default router;

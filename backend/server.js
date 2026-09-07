/**
 * server.js
 * 
 * Express & Socket.IO Real-Time Server for AI-Based Multi-Truck Delivery System.
 */

import http from 'node:http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB, isMongoActive } from './config/db.js';
import inMemoryStore from './data/inMemoryStore.js';
import { setupSocketTracker } from './sockets/tracker.js';

import orderRoutes from './routes/orderRoutes.js';
import truckRoutes from './routes/truckRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import optimizeRoutes from './routes/optimizeRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export const app = express();
export const httpServer = http.createServer(app);

// Attach Socket.IO server with CORS enabled
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO tracking listeners
setupSocketTracker(io);

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check & system status route
app.get('/api/health', (req, res) => {
  const mongoActive = isMongoActive();
  res.json({
    status: 'online',
    system: 'AI Multi-Truck Route Optimizer API',
    mode: mongoActive ? 'MongoDB Connected' : 'DEMO_MODE (In-Memory Active)',
    database: mongoActive ? 'mongodb' : 'in_memory_demo',
    socketsConnected: io.engine.clientsCount,
    fleetCount: inMemoryStore.getTrucks().length,
    ordersCount: inMemoryStore.getOrders().length,
    tripsCount: inMemoryStore.getTrips().length,
    timestamp: new Date().toISOString()
  });
});

// Root informational route
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Based Multi-Truck Smart Delivery and Route Optimization System API',
    version: '1.0.0',
    realtime: 'Socket.IO Active',
    endpoints: {
      health: 'GET /api/health',
      orders: 'GET, POST /api/orders, PUT, DELETE /api/orders/:id',
      trucks: 'GET /api/trucks, GET /api/trucks/:id',
      trips: 'GET /api/trips, GET /api/trips/:id',
      optimize: 'POST /api/optimize'
    }
  });
});

// Mount API routes
app.use('/api/orders', orderRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/optimize', optimizeRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export async function startServer(port = PORT) {
  await connectDB();
  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.log(`[SERVER] Logistics API & Socket.IO Server running on port ${port}`);
      console.log(`[SERVER] Health check: http://localhost:${port}/api/health`);
      resolve({ app, httpServer, io });
    });
  });
}

// Auto-start if executed directly from terminal
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('server.js')) {
  startServer();
}

export default app;

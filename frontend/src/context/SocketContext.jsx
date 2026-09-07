/**
 * SocketContext.jsx
 * 
 * Central React Context Provider for Socket.IO Real-Time Telemetry.
 * Manages live truck positions, delivery events, and autonomous simulator controls.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [truckLocations, setTruckLocations] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.IO (via Vite proxy or same-origin)
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET] Connected to real-time server with ID:', socket.id);
      setIsConnected(true);
      socket.emit('join:admin');
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected from real-time server:', reason);
      setIsConnected(false);
    });

    // Real-Time Event 1: admin:truck-location
    socket.on('admin:truck-location', (telemetry) => {
      if (telemetry && telemetry.truckId) {
        setTruckLocations((prev) => ({
          ...prev,
          [telemetry.truckId]: {
            ...telemetry,
            receivedAt: new Date().toISOString()
          }
        }));
      }
    });

    // Real-Time Event 2: admin:delivery-status
    socket.on('admin:delivery-status', (event) => {
      if (event && event.orderId) {
        setRecentEvents((prev) => [event, ...prev.slice(0, 19)]);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('admin:truck-location');
      socket.off('admin:delivery-status');
      socket.disconnect();
    };
  }, []);

  // Send Driver Location ping
  const emitDriverLocation = (payload) => {
    if (socketRef.current) {
      socketRef.current.emit('driver:location', payload);
    }
  };

  // Send Delivery Status update
  const emitDeliveryStatus = (payload) => {
    if (socketRef.current) {
      socketRef.current.emit('driver:delivery-status', payload);
    }
  };

  // Control Autonomous Route Simulator
  const startSimulator = (truckId = 'TRUCK_MINI_01', intervalMs = 400) => {
    return new Promise((resolve) => {
      if (socketRef.current) {
        socketRef.current.emit('simulator:start', { truckId, intervalMs }, (res) => {
          resolve(res);
        });
      } else {
        resolve({ success: false, error: 'Socket not connected' });
      }
    });
  };

  const stopSimulator = (truckId = 'TRUCK_MINI_01') => {
    return new Promise((resolve) => {
      if (socketRef.current) {
        socketRef.current.emit('simulator:stop', { truckId }, (res) => {
          resolve(res);
        });
      } else {
        resolve({ success: false });
      }
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        truckLocations,
        recentEvents,
        emitDriverLocation,
        emitDeliveryStatus,
        startSimulator,
        stopSimulator
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;

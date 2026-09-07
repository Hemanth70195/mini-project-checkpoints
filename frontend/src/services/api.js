/**
 * api.js
 * 
 * Frontend REST API Client using Axios.
 * Connects directly to the existing Express backend endpoints.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Orders API
export const getOrders = (params) => api.get('/orders', { params }).then(r => r.data);
export const getOrderById = (id) => api.get(`/orders/${id}`).then(r => r.data);
export const createOrder = (orderData) => api.post('/orders', orderData).then(r => r.data);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData).then(r => r.data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(r => r.data);

// Trucks API
export const getTrucks = () => api.get('/trucks').then(r => r.data);
export const getTruckById = (id) => api.get(`/trucks/${id}`).then(r => r.data);

// Optimization Engine API
export const optimizeRoutes = (payload = {}) => api.post('/optimize', payload).then(r => r.data);

// Trips API
export const getTrips = (params) => api.get('/trips', { params }).then(r => r.data);
export const getTripById = (id) => api.get(`/trips/${id}`).then(r => r.data);

// System Health API
export const getHealth = () => api.get('/health').then(r => r.data);

export default api;

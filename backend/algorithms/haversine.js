/**
 * haversine.js
 * 
 * Computes great-circle distances between GPS coordinates on a spherical Earth.
 * 
 * C++ DSA Analogy:
 * In C++, computing transcendental functions (sin, cos, atan2) repeatedly inside 
 * an inner optimization loop is computationally expensive due to FPU cycles.
 * Therefore, we compute these distances once to populate an N x N adjacency matrix,
 * transforming repeated O(transcendental) operations into O(1) memory lookups
 * (equivalent to accessing matrix[i][j] via pointer arithmetic).
 */

const EARTH_RADIUS_KM = 6371.0088; // WGS-84 Mean Earth Radius in km
const TO_RADIANS = Math.PI / 180.0;
const TO_DEGREES = 180.0 / Math.PI;

/**
 * Validates coordinate object or tuple.
 * Accepts { lat, lng } or { latitude, longitude } or [lat, lng].
 * 
 * @param {Object|Array} coord
 * @returns {{lat: number, lng: number}}
 */
export function normalizeCoord(coord) {
  if (!coord) {
    throw new Error('Invalid coordinate: null or undefined');
  }
  if (Array.isArray(coord)) {
    return { lat: Number(coord[0]), lng: Number(coord[1]) };
  }
  const lat = coord.lat !== undefined ? coord.lat : coord.latitude;
  const lng = coord.lng !== undefined ? coord.lng : (coord.lon !== undefined ? coord.lon : coord.longitude);
  
  if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng)) {
    throw new Error(`Invalid coordinate values: ${JSON.stringify(coord)}`);
  }
  return { lat, lng };
}

/**
 * Calculates the great-circle distance between two points on the Earth surface.
 * 
 * Mathematical Formulation:
 * a = sin²(Δφ/2) + cos(φ₁) * cos(φ₂) * sin²(Δλ/2)
 * c = 2 * atan2(√a, √(1−a))
 * d = R * c
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 * 
 * @param {Object|Array} coord1 - Starting point {lat, lng}
 * @param {Object|Array} coord2 - Destination point {lat, lng}
 * @param {string} unit - 'km' (default) or 'm' or 'miles'
 * @returns {number} Distance in specified unit
 */
export function haversineDistance(coord1, coord2, unit = 'km') {
  const p1 = normalizeCoord(coord1);
  const p2 = normalizeCoord(coord2);

  // If same coordinates, distance is zero
  if (p1.lat === p2.lat && p1.lng === p2.lng) {
    return 0.0;
  }

  const dLat = (p2.lat - p1.lat) * TO_RADIANS;
  const dLng = (p2.lng - p1.lng) * TO_RADIANS;
  const lat1Rad = p1.lat * TO_RADIANS;
  const lat2Rad = p2.lat * TO_RADIANS;

  const sinHalfLat = Math.sin(dLat / 2.0);
  const sinHalfLng = Math.sin(dLng / 2.0);

  const a = sinHalfLat * sinHalfLat +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            sinHalfLng * sinHalfLng;

  // Clamp 'a' to [0, 1] to prevent floating-point precision domain errors in Math.sqrt
  const clampedA = Math.max(0.0, Math.min(1.0, a));
  const c = 2.0 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1.0 - clampedA));
  const distanceKm = EARTH_RADIUS_KM * c;

  if (unit === 'm') return distanceKm * 1000.0;
  if (unit === 'miles') return distanceKm * 0.621371;
  return distanceKm;
}

/**
 * Calculates the total cumulative distance along an ordered sequence of waypoints.
 * Analogous to accumulating weights along a directed path in a graph:
 * Total = Σ weight(v_i, v_{i+1})
 * 
 * Time Complexity: O(M) where M is the number of waypoints.
 * 
 * @param {Array<Object>} waypoints - Array of coordinates
 * @param {string} unit - 'km' | 'm' | 'miles'
 * @returns {number} Cumulative distance
 */
export function calculateRouteDistance(waypoints, unit = 'km') {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return 0.0;
  }
  let totalDistance = 0.0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += haversineDistance(waypoints[i], waypoints[i + 1], unit);
  }
  return totalDistance;
}

/**
 * Calculates initial forward compass bearing in degrees (0° to 360°)
 * from point 1 to point 2.
 * 
 * @param {Object} coord1 - Source {lat, lng}
 * @param {Object} coord2 - Target {lat, lng}
 * @returns {number} Bearing in degrees [0, 360)
 */
export function calculateBearing(coord1, coord2) {
  const p1 = normalizeCoord(coord1);
  const p2 = normalizeCoord(coord2);

  const lat1 = p1.lat * TO_RADIANS;
  const lat2 = p2.lat * TO_RADIANS;
  const dLng = (p2.lng - p1.lng) * TO_RADIANS;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const initialBearing = Math.atan2(y, x) * TO_DEGREES;
  return (initialBearing + 360.0) % 360.0; // Normalize to [0, 360)
}

/**
 * Interpolates points between two coordinates (for smooth driver simulation).
 * 
 * @param {Object} start - Starting coordinate
 * @param {Object} end - Ending coordinate
 * @param {number} steps - Number of intermediate steps
 * @returns {Array<{lat: number, lng: number}>}
 */
export function interpolatePoints(start, end, steps = 10) {
  const p1 = normalizeCoord(start);
  const p2 = normalizeCoord(end);
  const points = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      lat: p1.lat + t * (p2.lat - p1.lat),
      lng: p1.lng + t * (p2.lng - p1.lng)
    });
  }
  return points;
}

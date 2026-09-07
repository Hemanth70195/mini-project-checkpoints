/**
 * distanceMatrix.js
 * 
 * Generates an N x N distance adjacency matrix from an array of geographic locations.
 * 
 * C++ DSA Analogy:
 * In C++, an adjacency matrix for a dense complete graph (K_N) is typically represented as:
 * 1) Flat array: double dist[N * N] where index = i * N + j (Cache-friendly row-major order)
 * 2) 2D vector:  std::vector<std::vector<double>> dist(N, std::vector<double>(N, 0.0))
 * 
 * Graph Properties:
 * - Time Complexity to Build: O(N²) where N = total locations (depot + deliveries).
 * - Space Complexity: O(N²) memory storage.
 * - Lookup Complexity: O(1) constant time edge-cost retrieval during optimization.
 * - Symmetry: dist[i][j] == dist[j][i] (undirected metric space obeying triangle inequality).
 * - Reflexivity: dist[i][i] == 0.0.
 */

import { haversineDistance } from './haversine.js';

/**
 * Constructs an N x N distance matrix from an array of location objects.
 * 
 * @param {Array<Object>} locations - Array of objects containing { id, lat, lng }
 * @param {string} unit - 'km' (default) | 'm' | 'miles'
 * @returns {{
 *   matrix: Array<Array<number>>,
 *   idToIndex: Map<string, number>,
 *   indexToId: Array<string>,
 *   size: number
 * }}
 */
export function buildDistanceMatrix(locations, unit = 'km') {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error('Cannot build distance matrix: locations array is empty or invalid.');
  }

  const N = locations.length;
  
  // Fast hash map lookup: id -> index (Analogous to C++ std::unordered_map<std::string, size_t>)
  const idToIndex = new Map();
  const indexToId = new Array(N);

  for (let i = 0; i < N; i++) {
    const loc = locations[i];
    const id = loc.id !== undefined ? String(loc.id) : `node_${i}`;
    idToIndex.set(id, i);
    indexToId[i] = id;
  }

  // Pre-allocate N x N matrix (V8 optimizes fixed-size arrays into contiguous double arrays)
  const matrix = new Array(N);
  for (let i = 0; i < N; i++) {
    matrix[i] = new Float64Array(N); // High-performance typed array (contiguous C++ double array)
  }

  // Exploit symmetry: dist(i, j) == dist(j, i) to cut haversine calculations in half!
  // Loop runs N * (N - 1) / 2 iterations instead of N^2.
  for (let i = 0; i < N; i++) {
    matrix[i][i] = 0.0;
    const locA = locations[i];

    for (let j = i + 1; j < N; j++) {
      const locB = locations[j];
      const dist = haversineDistance(locA, locB, unit);
      matrix[i][j] = dist;
      matrix[j][i] = dist; // Symmetric assignment
    }
  }

  return {
    matrix,
    idToIndex,
    indexToId,
    size: N
  };
}

/**
 * Constant-time O(1) edge lookup helper.
 * 
 * @param {Array<Array<number>>|Array<Float64Array>} matrix
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {number} Distance between node i and node j
 */
export function getDistance(matrix, fromIndex, toIndex) {
  return matrix[fromIndex][toIndex];
}

/**
 * Finds the nearest unvisited neighbor from a current node index.
 * Analogous to a single step of Prim's Algorithm or Nearest Neighbor TSP Heuristic.
 * 
 * Time Complexity: O(U) where U is the size of unvisitedSet (at most O(N)).
 * 
 * @param {Array<Array<number>>} matrix
 * @param {number} currentIndex
 * @param {Set<number>} unvisitedSet - Set of unvisited node indices
 * @returns {{ nearestIndex: number, distance: number } | null}
 */
export function findNearestNeighbor(matrix, currentIndex, unvisitedSet) {
  if (!unvisitedSet || unvisitedSet.size === 0) {
    return null;
  }

  let minDistance = Infinity;
  let nearestIndex = -1;

  for (const candidateIndex of unvisitedSet) {
    const dist = matrix[currentIndex][candidateIndex];
    if (dist < minDistance) {
      minDistance = dist;
      nearestIndex = candidateIndex;
    }
  }

  return nearestIndex !== -1 ? { nearestIndex, distance: minDistance } : null;
}

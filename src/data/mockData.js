// src/data/mockData.js

// All initial mock data is now managed by backend/data.json file.
// The initial data arrays have been removed from here.

// Helper to generate unique IDs (might still be used for temporary IDs before backend assignment)
export const generateId = (prefix) => {
  // Very basic, for in-memory only if used before backend ID assignment
  return prefix + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
};
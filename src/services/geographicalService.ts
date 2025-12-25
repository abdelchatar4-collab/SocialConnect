/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Geographical Service
Re-exports all functions from modular files for backward compatibility
*/

// Core exports
export type { GeographicalSector } from './geographicalCore';

export {
  GEOGRAPHICAL_STORAGE_KEY,
  getAllSectors,
  getSectorByName,
  getStreetsBySector,
  findSectorByStreet,
  resetGeographicalData,
  resetInitializationFlag,
  ensureDefaultGeographicalData,
  searchStreets,
  exportGeographicalData,
  importGeographicalData,
} from './geographicalCore';

// Sector CRUD operations
export {
  addSector,
  updateSector,
  deleteSector,
} from './geographicalSectorOps';

// Street CRUD operations
export {
  addStreetToSector,
  updateStreetInSector,
  deleteStreetFromSector,
  moveStreetToSector,
} from './geographicalStreetOps';

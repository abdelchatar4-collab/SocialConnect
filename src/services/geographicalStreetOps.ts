/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Geographical Street CRUD Operations
Extracted from geographicalService.ts for maintainability
*/

import { getAllSectors, notifyGeographicalDataChange, GEOGRAPHICAL_STORAGE_KEY } from './geographicalCore';

/** Ajoute une rue à un secteur */
export function addStreetToSector(sectorName: string, streetName: string): boolean {
    try {
        if (!streetName.trim()) return false;
        const allSectors = getAllSectors();
        const sectorIndex = allSectors.findIndex(s => s.name === sectorName);
        if (sectorIndex === -1) return false;
        if (allSectors[sectorIndex].streets.includes(streetName.trim())) return false;

        allSectors[sectorIndex].streets.push(streetName.trim());
        allSectors[sectorIndex].streets.sort((a, b) => a.localeCompare(b));
        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la rue:', error);
        return false;
    }
}

/** Met à jour le nom d'une rue dans un secteur */
export function updateStreetInSector(sectorName: string, oldStreetName: string, newStreetName: string): boolean {
    try {
        if (!newStreetName.trim()) return false;
        const allSectors = getAllSectors();
        const sectorIndex = allSectors.findIndex(s => s.name === sectorName);
        if (sectorIndex === -1) return false;

        const streetIndex = allSectors[sectorIndex].streets.indexOf(oldStreetName);
        if (streetIndex === -1) return false;
        if (allSectors[sectorIndex].streets.includes(newStreetName.trim()) && newStreetName.trim() !== oldStreetName) return false;

        allSectors[sectorIndex].streets[streetIndex] = newStreetName.trim();
        allSectors[sectorIndex].streets.sort((a, b) => a.localeCompare(b));
        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la rue:', error);
        return false;
    }
}

/** Supprime une rue d'un secteur */
export function deleteStreetFromSector(sectorName: string, streetName: string): boolean {
    try {
        const allSectors = getAllSectors();
        const sectorIndex = allSectors.findIndex(s => s.name === sectorName);
        if (sectorIndex === -1) return false;

        const originalLength = allSectors[sectorIndex].streets.length;
        allSectors[sectorIndex].streets = allSectors[sectorIndex].streets.filter(st => st !== streetName);
        if (allSectors[sectorIndex].streets.length === originalLength) return false;

        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la rue:', error);
        return false;
    }
}

/** Déplace une rue d'un secteur à un autre */
export function moveStreetToSector(streetName: string, fromSector: string, toSector: string): boolean {
    try {
        const deleteSuccess = deleteStreetFromSector(fromSector, streetName);
        if (!deleteSuccess) return false;

        const addSuccess = addStreetToSector(toSector, streetName);
        if (!addSuccess) {
            addStreetToSector(fromSector, streetName);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erreur lors du déplacement de la rue:', error);
        return false;
    }
}

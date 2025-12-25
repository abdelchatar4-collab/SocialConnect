/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Geographical Sector CRUD Operations
Extracted from geographicalService.ts for maintainability
*/

import {
    GeographicalSector, getAllSectors, notifyGeographicalDataChange, GEOGRAPHICAL_STORAGE_KEY
} from './geographicalCore';

/** Ajoute un nouveau secteur */
export function addSector(sectorName: string): boolean {
    try {
        if (!sectorName.trim()) return false;
        const allSectors = getAllSectors();
        if (allSectors.some(sector => sector.name === sectorName.trim())) return false;

        allSectors.push({ name: sectorName.trim(), streets: [] });
        allSectors.sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du secteur:', error);
        return false;
    }
}

/** Met à jour le nom d'un secteur */
export function updateSector(oldName: string, newName: string): boolean {
    try {
        if (!newName.trim()) return false;
        const allSectors = getAllSectors();
        const sectorIndex = allSectors.findIndex(s => s.name === oldName);
        if (sectorIndex === -1) return false;
        if (allSectors.some(s => s.name === newName.trim() && s.name !== oldName)) return false;

        allSectors[sectorIndex].name = newName.trim();
        allSectors.sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du secteur:', error);
        return false;
    }
}

/** Supprime un secteur et toutes ses rues */
export function deleteSector(sectorName: string): boolean {
    try {
        const allSectors = getAllSectors();
        const filteredSectors = allSectors.filter(s => s.name !== sectorName);
        if (filteredSectors.length === allSectors.length) return false;

        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(filteredSectors));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du secteur:', error);
        return false;
    }
}

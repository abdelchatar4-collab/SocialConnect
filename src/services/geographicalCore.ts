/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Geographical Service Core
Contains core functions and exports - refactored from original file
*/

import mappingData from '@/config/mapping.json';

export interface GeographicalSector {
    name: string;
    streets: string[];
}

export const GEOGRAPHICAL_STORAGE_KEY = 'app_geographical_data';
const GEOGRAPHICAL_INIT_FLAG_KEY = 'app_geographical_initialized';

function convertMappingToSectors(): GeographicalSector[] {
    const sectors: GeographicalSector[] = [];
    for (const [sectorName, streets] of Object.entries(mappingData)) {
        sectors.push({ name: sectorName, streets: Array.isArray(streets) ? streets : [] });
    }
    return sectors.sort((a, b) => a.name.localeCompare(b.name));
}

const defaultGeographicalData: GeographicalSector[] = convertMappingToSectors();

export function notifyGeographicalDataChange() {
    window.dispatchEvent(new CustomEvent('geographical-data-changed'));
}

function normalizeString(str: string): string {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

/** Récupère tous les secteurs géographiques */
export function getAllSectors(): GeographicalSector[] {
    try {
        const savedData = localStorage.getItem(GEOGRAPHICAL_STORAGE_KEY);
        const isInitialized = localStorage.getItem(GEOGRAPHICAL_INIT_FLAG_KEY);

        if (!savedData) {
            ensureDefaultGeographicalData();
            localStorage.setItem(GEOGRAPHICAL_INIT_FLAG_KEY, 'true');
            return JSON.parse(localStorage.getItem(GEOGRAPHICAL_STORAGE_KEY) || '[]');
        }

        if (!isInitialized) {
            ensureDefaultGeographicalData();
            localStorage.setItem(GEOGRAPHICAL_INIT_FLAG_KEY, 'true');
        }

        return JSON.parse(savedData);
    } catch (error) {
        console.error('Erreur lors de la récupération des secteurs:', error);
        return defaultGeographicalData;
    }
}

/** Récupère un secteur par son nom */
export function getSectorByName(name: string): GeographicalSector | undefined {
    return getAllSectors().find(s => s.name === name);
}

/** Récupère toutes les rues d'un secteur */
export function getStreetsBySector(sectorName: string): string[] {
    const sector = getSectorByName(sectorName);
    return sector ? sector.streets : [];
}

/** Trouve le secteur d'une rue */
export function findSectorByStreet(streetName: string): string | null {
    const allSectors = getAllSectors();
    for (const sector of allSectors) {
        if (sector.streets.includes(streetName)) return sector.name;
        const normalizedStreet = normalizeString(streetName);
        if (sector.streets.find(st => normalizeString(st) === normalizedStreet)) return sector.name;
    }
    return null;
}

/** Réinitialise les données géographiques */
export function resetGeographicalData(): boolean {
    try {
        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(defaultGeographicalData));
        localStorage.setItem(GEOGRAPHICAL_INIT_FLAG_KEY, 'true');
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        return false;
    }
}

/** Réinitialise le flag d'initialisation */
export function resetInitializationFlag(): boolean {
    try {
        localStorage.removeItem(GEOGRAPHICAL_INIT_FLAG_KEY);
        return true;
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du flag:', error);
        return false;
    }
}

/** Vérifie et met à jour les données manquantes */
export function ensureDefaultGeographicalData(): boolean {
    try {
        const savedData = localStorage.getItem(GEOGRAPHICAL_STORAGE_KEY);
        let currentData: GeographicalSector[] = savedData ? JSON.parse(savedData) : [];
        let hasChanges = false;

        for (const defaultSector of defaultGeographicalData) {
            const existingSector = currentData.find(s => s.name === defaultSector.name);
            if (!existingSector) {
                currentData.push(defaultSector);
                hasChanges = true;
            } else {
                for (const street of defaultSector.streets) {
                    if (!existingSector.streets.includes(street)) {
                        existingSector.streets.push(street);
                        hasChanges = true;
                    }
                }
                if (hasChanges) existingSector.streets.sort((a, b) => a.localeCompare(b));
            }
        }

        if (hasChanges) {
            currentData.sort((a, b) => a.name.localeCompare(b.name));
            localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(currentData));
            notifyGeographicalDataChange();
        }
        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification des données:', error);
        return false;
    }
}

/** Recherche de rues avec autocomplétion */
export function searchStreets(query: string, limit: number = 10): Array<{ street: string, sector: string }> {
    if (!query.trim()) return [];
    const allSectors = getAllSectors();
    const results: Array<{ street: string, sector: string }> = [];
    const normalizedQuery = normalizeString(query);

    for (const sector of allSectors) {
        for (const street of sector.streets) {
            const normalizedStreet = normalizeString(street);
            if (normalizedStreet.startsWith(normalizedQuery) || normalizedStreet.includes(normalizedQuery)) {
                results.push({ street, sector: sector.name });
            }
            if (results.length >= limit) break;
        }
        if (results.length >= limit) break;
    }
    return results;
}

/** Exporte toutes les données géographiques */
export function exportGeographicalData(): GeographicalSector[] {
    return getAllSectors();
}

/** Importe des données géographiques */
export function importGeographicalData(data: GeographicalSector[]): boolean {
    try {
        if (!Array.isArray(data)) return false;
        for (const sector of data) {
            if (!sector.name || !Array.isArray(sector.streets)) return false;
        }

        const sortedData = data.map(s => ({
            ...s,
            streets: [...s.streets].sort((a, b) => a.localeCompare(b))
        })).sort((a, b) => a.name.localeCompare(b.name));

        localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(sortedData));
        notifyGeographicalDataChange();
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
        return false;
    }
}

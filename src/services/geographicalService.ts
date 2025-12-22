/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import mappingData from '@/config/mapping.json';

/**
 * Interface qui définit un secteur géographique avec ses rues
 */
export interface GeographicalSector {
  name: string;
  streets: string[];
}

// Clés utilisées pour stocker les données géographiques dans le localStorage
const GEOGRAPHICAL_STORAGE_KEY = 'app_geographical_data';
const GEOGRAPHICAL_INIT_FLAG_KEY = 'app_geographical_initialized';

/**
 * Convertit les données du mapping.json en format GeographicalSector
 */
function convertMappingToSectors(): GeographicalSector[] {
  const sectors: GeographicalSector[] = [];

  for (const [sectorName, streets] of Object.entries(mappingData)) {
    sectors.push({
      name: sectorName,
      streets: Array.isArray(streets) ? streets : []
    });
  }

  return sectors.sort((a, b) => a.name.localeCompare(b.name));
}

// Données par défaut basées sur mapping.json
const defaultGeographicalData: GeographicalSector[] = convertMappingToSectors();

/**
 * Récupère tous les secteurs géographiques
 */
export function getAllSectors(): GeographicalSector[] {
  try {
    const savedData = localStorage.getItem(GEOGRAPHICAL_STORAGE_KEY);
    const isInitialized = localStorage.getItem(GEOGRAPHICAL_INIT_FLAG_KEY);

    if (!savedData) {
      // Première utilisation : initialiser avec les données par défaut
      ensureDefaultGeographicalData();
      localStorage.setItem(GEOGRAPHICAL_INIT_FLAG_KEY, 'true');
      return JSON.parse(localStorage.getItem(GEOGRAPHICAL_STORAGE_KEY) || '[]');
    }

    if (!isInitialized) {
      // Migration pour les utilisateurs existants : ajouter les données manquantes une seule fois
      ensureDefaultGeographicalData();
      localStorage.setItem(GEOGRAPHICAL_INIT_FLAG_KEY, 'true');
    }

    return JSON.parse(savedData);
  } catch (error) {
    console.error('Erreur lors de la récupération des secteurs géographiques:', error);
    return defaultGeographicalData;
  }
}

/**
 * Récupère un secteur spécifique par son nom
 */
export function getSectorByName(name: string): GeographicalSector | undefined {
  const allSectors = getAllSectors();
  return allSectors.find(sector => sector.name === name);
}

/**
 * Récupère toutes les rues d'un secteur spécifique
 */
export function getStreetsBySector(sectorName: string): string[] {
  const sector = getSectorByName(sectorName);
  return sector ? sector.streets : [];
}

/**
 * Trouve le secteur d'une rue donnée
 */
export function findSectorByStreet(streetName: string): string | null {
  const allSectors = getAllSectors();

  for (const sector of allSectors) {
    // Recherche exacte
    if (sector.streets.includes(streetName)) {
      return sector.name;
    }

    // Recherche insensible à la casse et aux accents
    const normalizedStreet = normalizeString(streetName);
    const foundStreet = sector.streets.find(street =>
      normalizeString(street) === normalizedStreet
    );

    if (foundStreet) {
      return sector.name;
    }
  }

  return null;
}

/**
 * Normalise une chaîne pour la recherche (supprime accents, casse, espaces)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ajoute un nouveau secteur
 */
// Ajouter cette fonction pour notifier les changements
function notifyGeographicalDataChange() {
  window.dispatchEvent(new CustomEvent('geographical-data-changed'));
}

// Modifier toutes les fonctions qui modifient le localStorage pour inclure la notification
export function addSector(sectorName: string): boolean {
  try {
    if (!sectorName.trim()) return false;

    const allSectors = getAllSectors();

    // Vérifier si le secteur existe déjà
    if (allSectors.some(sector => sector.name === sectorName.trim())) {
      return false;
    }

    // Ajouter le nouveau secteur
    allSectors.push({
      name: sectorName.trim(),
      streets: []
    });

    // Trier par nom
    allSectors.sort((a, b) => a.name.localeCompare(b.name));

    // Sauvegarder
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));

    // Notifier le changement
    notifyGeographicalDataChange();

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du secteur:', error);
    return false;
  }
}

/**
 * Met à jour le nom d'un secteur
 */
export function updateSector(oldName: string, newName: string): boolean {
  try {
    if (!newName.trim()) return false;

    const allSectors = getAllSectors();
    const sectorIndex = allSectors.findIndex(sector => sector.name === oldName);

    if (sectorIndex === -1) return false;

    // Vérifier si le nouveau nom existe déjà
    if (allSectors.some(sector => sector.name === newName.trim() && sector.name !== oldName)) {
      return false;
    }

    // Mettre à jour le nom
    allSectors[sectorIndex].name = newName.trim();

    // Trier par nom
    allSectors.sort((a, b) => a.name.localeCompare(b.name));

    // Sauvegarder
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
    notifyGeographicalDataChange(); // Ajouter cette ligne
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du secteur:', error);
    return false;
  }
}

/**
 * Supprime un secteur et toutes ses rues
 */
export function deleteSector(sectorName: string): boolean {
  try {
    const allSectors = getAllSectors();
    const filteredSectors = allSectors.filter(sector => sector.name !== sectorName);

    if (filteredSectors.length === allSectors.length) {
      return false; // Secteur non trouvé
    }

    // Sauvegarder
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(filteredSectors));
    notifyGeographicalDataChange(); // Ajouter cette ligne
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du secteur:', error);
    return false;
  }
}

/**
 * Ajoute une rue à un secteur
 */
export function addStreetToSector(sectorName: string, streetName: string): boolean {
  try {
    if (!streetName.trim()) return false;

    const allSectors = getAllSectors();
    const sectorIndex = allSectors.findIndex(sector => sector.name === sectorName);

    if (sectorIndex === -1) return false;

    // Vérifier si la rue existe déjà dans ce secteur
    if (allSectors[sectorIndex].streets.includes(streetName.trim())) {
      return false;
    }

    // Ajouter la rue
    allSectors[sectorIndex].streets.push(streetName.trim());

    // Trier les rues par ordre alphabétique
    allSectors[sectorIndex].streets.sort((a, b) => a.localeCompare(b));

    // Sauvegarder
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
    notifyGeographicalDataChange(); // Ajouter cette ligne
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la rue:', error);
    return false;
  }
}

/**
 * Met à jour le nom d'une rue dans un secteur
 */
export function updateStreetInSector(sectorName: string, oldStreetName: string, newStreetName: string): boolean {
  try {
    if (!newStreetName.trim()) return false;

    const allSectors = getAllSectors();
    const sectorIndex = allSectors.findIndex(sector => sector.name === sectorName);

    if (sectorIndex === -1) return false;

    const streetIndex = allSectors[sectorIndex].streets.indexOf(oldStreetName);
    if (streetIndex === -1) return false;

    // Vérifier si le nouveau nom existe déjà dans ce secteur
    if (allSectors[sectorIndex].streets.includes(newStreetName.trim()) && newStreetName.trim() !== oldStreetName) {
      return false;
    }

    // Mettre à jour la rue
    allSectors[sectorIndex].streets[streetIndex] = newStreetName.trim();

    // Trier les rues par ordre alphabétique
    allSectors[sectorIndex].streets.sort((a, b) => a.localeCompare(b));

    // Sauvegarder
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
    notifyGeographicalDataChange(); // Ajouter cette ligne
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la rue:', error);
    return false;
  }
}

/**
 * Supprime une rue d'un secteur
 */
export function deleteStreetFromSector(sectorName: string, streetName: string): boolean {
  try {
    const allSectors = getAllSectors();
    const sectorIndex = allSectors.findIndex(sector => sector.name === sectorName);

    if (sectorIndex === -1) return false;

    // Filtrer pour retirer la rue
    const originalLength = allSectors[sectorIndex].streets.length;
    allSectors[sectorIndex].streets = allSectors[sectorIndex].streets.filter(
      street => street !== streetName
    );

    if (allSectors[sectorIndex].streets.length === originalLength) {
      return false; // Rue non trouvée
    }

    // Sauvegarder
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(allSectors));
    notifyGeographicalDataChange(); // Ajouter cette ligne
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la rue:', error);
    return false;
  }
}

/**
 * Déplace une rue d'un secteur à un autre
 */
export function moveStreetToSector(streetName: string, fromSector: string, toSector: string): boolean {
  try {
    // Supprimer de l'ancien secteur
    const deleteSuccess = deleteStreetFromSector(fromSector, streetName);
    if (!deleteSuccess) return false;

    // Ajouter au nouveau secteur
    const addSuccess = addStreetToSector(toSector, streetName);
    if (!addSuccess) {
      // En cas d'échec, remettre la rue dans l'ancien secteur
      addStreetToSector(fromSector, streetName);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors du déplacement de la rue:', error);
    return false;
  }
}

/**
 * Réinitialise les données géographiques avec les valeurs par défaut
 */
export function resetGeographicalData(): boolean {
  try {
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(defaultGeographicalData));
    localStorage.setItem(GEOGRAPHICAL_INIT_FLAG_KEY, 'true');
    notifyGeographicalDataChange(); // Ajouter cette ligne
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des données géographiques:', error);
    return false;
  }
}

/**
 * Réinitialise le flag d'initialisation pour forcer une nouvelle vérification des données par défaut
 */
export function resetInitializationFlag(): boolean {
  try {
    localStorage.removeItem(GEOGRAPHICAL_INIT_FLAG_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du flag d\'initialisation:', error);
    return false;
  }
}

/**
 * Vérifie et met à jour les données manquantes dans le localStorage
 */
export function ensureDefaultGeographicalData(): boolean {
  try {
    const savedData = localStorage.getItem(GEOGRAPHICAL_STORAGE_KEY);
    let currentData: GeographicalSector[] = [];

    if (savedData) {
      currentData = JSON.parse(savedData);
    }

    // Vérifier si des secteurs par défaut sont manquants
    let hasChanges = false;

    for (const defaultSector of defaultGeographicalData) {
      const existingSector = currentData.find(sector => sector.name === defaultSector.name);
      if (!existingSector) {
        currentData.push(defaultSector);
        hasChanges = true;
      } else {
        // Vérifier si des rues sont manquantes dans le secteur existant
        for (const defaultStreet of defaultSector.streets) {
          if (!existingSector.streets.includes(defaultStreet)) {
            existingSector.streets.push(defaultStreet);
            hasChanges = true;
          }
        }
        // Trier les rues
        if (hasChanges) {
          existingSector.streets.sort((a, b) => a.localeCompare(b));
        }
      }
    }

    // Trier les secteurs par nom
    if (hasChanges) {
      currentData.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Sauvegarder si des changements ont été apportés
    // Sauvegarder si des changements ont été apportés
    if (hasChanges) {
      localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(currentData));
      notifyGeographicalDataChange(); // Ajouter cette ligne
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification des données géographiques par défaut:', error);
    return false;
  }
}

/**
 * Recherche de rues avec autocomplétion
 */
export function searchStreets(query: string, limit: number = 10): Array<{ street: string, sector: string }> {
  if (!query.trim()) return [];

  const allSectors = getAllSectors();
  const results: Array<{ street: string, sector: string }> = [];
  const normalizedQuery = normalizeString(query);

  for (const sector of allSectors) {
    for (const street of sector.streets) {
      const normalizedStreet = normalizeString(street);

      // Recherche par début de chaîne
      if (normalizedStreet.startsWith(normalizedQuery)) {
        results.push({ street, sector: sector.name });
      }
      // Recherche par contenu
      else if (normalizedStreet.includes(normalizedQuery)) {
        results.push({ street, sector: sector.name });
      }

      if (results.length >= limit) break;
    }
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Exporte toutes les données géographiques
 */
export function exportGeographicalData(): GeographicalSector[] {
  return getAllSectors();
}

/**
 * Importe des données géographiques
 */
export function importGeographicalData(data: GeographicalSector[]): boolean {
  try {
    // Valider les données
    if (!Array.isArray(data)) return false;

    for (const sector of data) {
      if (!sector.name || !Array.isArray(sector.streets)) {
        return false;
      }
    }

    // Trier les données
    const sortedData = data.map(sector => ({
      ...sector,
      streets: [...sector.streets].sort((a, b) => a.localeCompare(b))
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Sauvegarder les données triées
    localStorage.setItem(GEOGRAPHICAL_STORAGE_KEY, JSON.stringify(sortedData));
    notifyGeographicalDataChange(); // Ajouter cette ligne

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation des données géographiques:', error);
    return false;
  }
}

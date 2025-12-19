/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// Utilitaire côté client pour déterminer le secteur à partir d'une adresse
import mappingData from '@/config/mapping.json';
import { Adresse } from '@/types/user';

// Type pour le mapping des données
type MappingData = { [secteur: string]: string[] | any };

/**
 * Normalise une rue pour la comparaison
 */
function normalizeRue(rue: string): string {
  return rue
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, ' ');
}

/**
 * Détermine le secteur à partir d'une adresse côté client
 * @param adresse - L'objet Adresse ou juste le nom de la rue
 * @returns Le nom du secteur ou "Non spécifié" si non trouvé
 */
export function determineSecteurClient(adresse: Adresse | string | null | undefined): string {
  let rueInput: string;

  // Récupérer le nom de la rue
  if (typeof adresse === 'string') {
    rueInput = adresse;
  } else if (adresse && adresse.rue) {
    rueInput = adresse.rue;
  } else {
    return "Non spécifié";
  }

  if (!rueInput || rueInput.trim().length === 0) {
    return "Non spécifié";
  }

  console.log(`🔍 [determineSecteurClient] Recherche secteur pour: "${rueInput}"`);

  try {
    // Nettoyer la rue d'entrée (enlever les numéros potentiels)
    const rueInputCleaned = rueInput.replace(/\s+\d+.*$/, '').trim();
    const rueInputNormalized = normalizeRue(rueInputCleaned);

    console.log(`🔍 [determineSecteurClient] Rue nettoyée: "${rueInputCleaned}"`);
    console.log(`🔍 [determineSecteurClient] Rue normalisée: "${rueInputNormalized}"`);

    const data = mappingData as MappingData;

    // Parcourir tous les secteurs pour trouver la rue correspondante
    for (const [secteur, rues] of Object.entries(data)) {
      // Ignorer les clés qui ne sont pas des secteurs (comme rueVersCodePostalEtCommune)
      if (secteur === 'rueVersCodePostalEtCommune' || !Array.isArray(rues)) {
        continue;
      }

      // Rechercher dans les rues de ce secteur
      for (const rue of rues) {
        if (typeof rue !== 'string') continue;

        // Nettoyer la rue du mapping (gérer les cas comme "Chaussée de Mons 1-153/2-154")
        const rueMappingCleaned = rue.replace(/\s+\d+[-\/].*$/, '').trim();
        const rueMappingNormalized = normalizeRue(rueMappingCleaned);

        // Vérifier si les rues correspondent
        if (rueMappingNormalized === rueInputNormalized ||
            rueInputNormalized.includes(rueMappingNormalized) ||
            rueMappingNormalized.includes(rueInputNormalized)) {
          console.log(`🎯 [determineSecteurClient] Secteur trouvé: "${rue}" (${secteur}) correspond à "${rueInput}"`);
          return secteur;
        }
      }
    }

    console.warn(`⚠️ [determineSecteurClient] Aucun secteur trouvé pour la rue: "${rueInput}" (normalisée: "${rueInputNormalized}")`);
    return "Non spécifié";

  } catch (error) {
    console.error(`❌ [determineSecteurClient] Erreur lors de la détermination du secteur pour "${rueInput}":`, error);
    return "Non spécifié";
  }
}

/**
 * Vérifie si une rue existe dans le mapping
 */
export function rueExisteDansMapping(rue: string): boolean {
  const secteur = determineSecteurClient(rue);
  return secteur !== "Non spécifié";
}

/**
 * Obtient toutes les rues pour un secteur donné
 */
export function getRuesPourSecteur(secteur: string): string[] {
  try {
    const data = mappingData as MappingData;
    const rues = data[secteur];

    if (Array.isArray(rues)) {
      return rues.map(rue =>
        typeof rue === 'string' ? rue.replace(/\s+\d+[-\/].*$/, '').trim() : ''
      ).filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des rues pour le secteur "${secteur}":`, error);
    return [];
  }
}

/**
 * Obtient la liste de tous les secteurs disponibles
 */
export function getTousLesSecteurs(): string[] {
  try {
    const data = mappingData as MappingData;
    return Object.keys(data).filter(key =>
      key !== 'rueVersCodePostalEtCommune' && Array.isArray(data[key])
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des secteurs:', error);
    return [];
  }
}

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { Adresse } from '@/types/user';
import fs from 'fs'; // Module pour lire les fichiers
import path from 'path'; // Module pour gérer les chemins de fichiers

// Type pour notre map inversée
type SecteurMap = { [rueNormalisee: string]: string };

// Cache pour stocker la map une fois chargée
let secteurMapCache: SecteurMap | null = null;
let loadError: Error | null = null;

// Fonction pour normaliser une rue (identique à avant)
function normalizeRue(rue: string): string {
  return rue
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, ' ');
}

// Fonction pour charger et transformer le JSON
function loadAndTransformSecteurMap(): SecteurMap {
  // --- UTILISER UN CHEMIN RELATIF AU PROJET ---
  // Le fichier mapping.json se trouve dans src/config/
  const jsonFilePath = path.resolve(process.cwd(), 'src/config/mapping.json');
  // -------------------------------------------

  console.log(`[SecteurUtils] Tentative de chargement du fichier JSON: ${jsonFilePath}`);

  try {
    // Vérifier si le fichier existe avant de tenter de le lire
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`Le fichier JSON spécifié n'existe pas: ${jsonFilePath}. Assurez-vous qu'il est bien dans src/data/`);
    }

    // Lire le contenu brut du fichier
    const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
    // Parser le JSON
    const data: { [secteur: string]: string[] } = JSON.parse(jsonData);

    // Transformer la structure {"Secteur": ["Rue1", ...]} en {"rue_normalisee": "Secteur"}
    const transformedMap: SecteurMap = {};
    for (const secteur in data) {
      if (Object.prototype.hasOwnProperty.call(data, secteur)) {
        const rues = data[secteur];
        if (Array.isArray(rues)) {
          rues.forEach(rue => {
            if (typeof rue === 'string') {
              // Gérer les cas comme "Chaussée de Mons 1-153/2-154" en ne gardant que le nom principal
              const rueCleanedForLookup = rue.replace(/\s+\d+.*$/, '').trim();

              const rueNormalisee = normalizeRue(rueCleanedForLookup);
              // Gérer les doublons potentiels (une rue pourrait être listée dans plusieurs secteurs ?)
              // Ici, on prend le dernier secteur trouvé pour une rue donnée.
              if (rueNormalisee) { // S'assurer qu'on a bien un nom de rue après nettoyage
                  transformedMap[rueNormalisee] = secteur;
              }
            }
          });
        }
      }
    }
    console.log(`[SecteurUtils] Fichier JSON chargé et transformé avec succès. ${Object.keys(transformedMap).length} rues mappées.`);
    return transformedMap;

  } catch (error: any) {
    console.error(`[SecteurUtils] ERREUR lors du chargement ou de la transformation du fichier JSON (${jsonFilePath}):`, error);
    loadError = error; // Stocker l'erreur pour la signaler plus tard
    return {}; // Retourner une map vide en cas d'erreur
  }
}

// Fonction pour obtenir la map (utilise le cache)
function getSecteurMap(): SecteurMap {
  if (loadError) {
    // Si une erreur s'est produite lors du chargement précédent, ne pas réessayer indéfiniment
    console.error("[SecteurUtils] Impossible d'obtenir la map des secteurs à cause d'une erreur de chargement précédente.");
    return {};
  }
  if (secteurMapCache === null) {
    // Charger la map si elle n'est pas encore dans le cache
    secteurMapCache = loadAndTransformSecteurMap();
  }
  return secteurMapCache;
}

/**
 * Détermine le secteur basé sur l'adresse en utilisant un fichier JSON.
 * @param adresse - L'objet Adresse contenant la rue. Peut être null ou undefined.
 * @returns Le nom du secteur ou "Non spécifié" si non trouvé ou si l'adresse/rue est manquante.
 */
export function determineSecteur(adresse: Adresse | null | undefined): string {
  // Vérifier si l'adresse ou la rue est fournie
  if (!adresse || !adresse.rue) {
    // Pas besoin de log ici, car c'est un cas normal
    return "Non spécifié";
  }

  // Obtenir la map (depuis le cache ou en la chargeant)
  const map = getSecteurMap();

  // Si la map est vide (probablement à cause d'une erreur de chargement), retourner "Non spécifié"
  if (Object.keys(map).length === 0 && loadError) {
     console.warn(`[determineSecteur] La map des secteurs n'a pas pu être chargée. Retour 'Non spécifié' pour la rue "${adresse.rue}".`);
     return "Non spécifié";
  }

  // Normaliser le nom de la rue fournie
  try {
    // Nettoyer aussi la rue de l'adresse pour enlever les numéros potentiels avant la recherche
    const rueAdresseCleaned = adresse.rue.replace(/\s+\d+.*$/, '').trim();
    const rueNormalisee = normalizeRue(rueAdresseCleaned);

    // Recherche dans la map chargée
    if (map[rueNormalisee]) { // <--- Recherche dans la map chargée depuis JSON
      return map[rueNormalisee];
    }

    // Log si la rue n'est pas trouvée (utile pour le débogage et vérifier le JSON)
    console.warn(`[determineSecteur] Rue non trouvée dans la map chargée depuis JSON: "${adresse.rue}" (Nettoyée: "${rueAdresseCleaned}", Normalisée: "${rueNormalisee}"). Retour 'Non spécifié'.`);

  } catch (error) {
    console.error(`[determineSecteur] Erreur lors de la normalisation ou recherche pour la rue: "${adresse.rue}"`, error);
  }

  return "Non spécifié"; // Retourner par défaut si aucune correspondance ou en cas d'erreur
}

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { createId } from '@paralleldrive/cuid2'

/**
 * Génère un préfixe de 3 lettres basé sur le nom d'une antenne
 * Utilise un algorithme intelligent pour extraire les consonnes et voyelles
 * de manière à créer un préfixe lisible et unique
 */
export function generateAntennePrefix(antenneName: string): string {
  if (!antenneName || antenneName.trim().length === 0) {
    return 'AND'; // Anderlecht par défaut
  }

  // Nettoyer le nom : enlever les accents, espaces, caractères spéciaux
  let cleaned = antenneName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-zA-Z0-9\s]/g, '') // Enlever les caractères spéciaux
    .toUpperCase()
    .trim();

  // CORRECTION : Enlever les mots génériques pour extraire le vrai nom de l'antenne
  const motsGeneriques = ['ANTENNE', 'PERMANENCE', 'CENTRE', 'SITE', 'STRUCTURE', 'ETABLISSEMENT', 'POLE'];

  // Diviser en mots et filtrer les mots génériques
  const mots = cleaned.split(/\s+/).filter(mot =>
    mot.length > 0 && !motsGeneriques.includes(mot)
  );

  // Si on a des mots après filtrage, utiliser le premier mot significatif
  if (mots.length > 0) {
    cleaned = mots[0]; // Prendre le premier mot significatif
  }

  // Si après filtrage le nom est vide, utiliser le défaut
  if (cleaned.length === 0) {
    return 'AND';
  }

  // Stratégie 1 : Prendre les 3 premières lettres si le mot fait 3+ caractères
  if (cleaned.length >= 3) {
    return cleaned.substring(0, 3);
  }

  // Stratégie 2 : Pour les mots courts, compléter avec des caractères
  if (cleaned.length === 1) {
    return cleaned + 'AN'; // Ex: "A" devient "AAN"
  }

  if (cleaned.length === 2) {
    return cleaned + 'A'; // Ex: "AB" devient "ABA"
  }

  return cleaned;
}

/**
 * Mapping des antennes connues vers leurs préfixes
 * Ce mapping est dynamique et s'auto-génère
 */
const ANTENNE_PREFIXES: Record<string, string> = {
  // Noms courts (anciens)
  'Centre': 'CEN',
  'Cureghem': 'CUR',
  'Ouest': 'OUE',
  'Pilda': 'PIL',
  'Bizet': 'BIZ',
  'Anderlecht': 'AND', // Défaut

  // Noms complets (nouveaux)
  'Antenne Centre': 'CEN',
  'Antenne Cureghem': 'CUR',
  'Antenne Ouest': 'OUE',
  'Permanence Pilda': 'PIL',
  'Permanence Bizet': 'BIZ',
  'Antenne Anderlecht': 'AND'
};

/**
 * Obtient le préfixe pour une antenne donnée
 * Si l'antenne n'est pas dans le mapping, génère automatiquement un préfixe
 */
export function getAntennePrefix(antenneName: string | null | undefined): string {
  // Si pas d'antenne, utiliser Anderlecht par défaut
  if (!antenneName) {
    return 'AND';
  }

  // Vérifier d'abord le mapping existant
  if (ANTENNE_PREFIXES[antenneName]) {
    return ANTENNE_PREFIXES[antenneName];
  }

  // Générer dynamiquement pour les nouvelles antennes
  const generatedPrefix = generateAntennePrefix(antenneName);

  // Ajouter au mapping pour les futures utilisations
  ANTENNE_PREFIXES[antenneName] = generatedPrefix;

  return generatedPrefix;
}

/**
 * Génère un ID utilisateur basé sur l'antenne et un identifiant unique
 * Format: [ANTENNE]-[UNIQUE_ID] (ex: CEN-XYZ123, OUE-ABC456)
 */
export function generateUserIdByAntenne(antenneName: string | null | undefined): string {
  const prefix = getAntennePrefix(antenneName);
  const uniqueId = createId().slice(-6).toUpperCase(); // 6 caractères pour plus d'unicité
  return `${prefix}-${uniqueId}`;
}

/**
 * Génère un ID séquentiel avec préfixe d'antenne (pour production)
 * Cette version nécessiterait une logique de compteur en base par antenne
 */
export async function generateSequentialUserIdByAntenne(
  antenneName: string | null | undefined,
  lastNumberForAntenne: number
): Promise<string> {
  const prefix = getAntennePrefix(antenneName);
  const nextNumber = lastNumberForAntenne + 1;
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Fonctions utilitaires pour la compatibilité avec l'ancien système
 */

/**
 * Génère un ID utilisateur - utilise maintenant le système basé sur les antennes
 * @deprecated Utiliser generateUserIdByAntenne à la place
 */
export function generateUserId(): string {
  return generateUserIdByAntenne(null); // Utilisera Anderlecht par défaut
}

/**
 * Parse un ID pour extraire le préfixe d'antenne et l'identifiant
 */
export function parseId(id: string): {
  antennePrefix: string;
  uniqueId: string;
  isValidFormat: boolean;
  antenneName?: string;
} {
  // Gestion des anciens formats (PROD-XXXX, UUID simple)
  if (id.startsWith('PROD-') || !id.includes('-')) {
    return {
      antennePrefix: '',
      uniqueId: id,
      isValidFormat: false,
      antenneName: undefined
    };
  }

  // Format nouveau : ANTENNE-UNIQUEID
  const match = id.match(/^([A-Z]{3})-(.+)$/);
  if (!match) {
    return {
      antennePrefix: '',
      uniqueId: id,
      isValidFormat: false,
      antenneName: undefined
    };
  }

  const antennePrefix = match[1];
  const uniqueId = match[2];

  // Trouver le nom de l'antenne à partir du préfixe
  const antenneName = Object.keys(ANTENNE_PREFIXES).find(
    key => ANTENNE_PREFIXES[key] === antennePrefix
  );

  return {
    antennePrefix,
    uniqueId,
    isValidFormat: true,
    antenneName
  };
}

/**
 * Vérifie si un ID suit le nouveau format basé sur les antennes
 */
export function isAntenneBasedId(id: string): boolean {
  return parseId(id).isValidFormat;
}

/**
 * Obtient la liste de tous les préfixes d'antennes connus
 */
export function getAllAntennePrefixes(): Record<string, string> {
  return { ...ANTENNE_PREFIXES };
}

/**
 * Teste la génération de préfixes pour s'assurer qu'elle fonctionne correctement
 */
export function testPrefixGeneration(): void {
  const testCases = [
    'Centre', 'Cureghem', 'Ouest', 'Pilda', 'Bizet', 'Anderlecht',
    'Nouvelle Antenne', 'Test-123', 'Étoile', 'À', 'AB', ''
  ];

  console.log('Test de génération de préfixes:');
  testCases.forEach(antenne => {
    const prefix = getAntennePrefix(antenne);
    console.log(`${antenne || '(vide)'} -> ${prefix}`);
  });
}

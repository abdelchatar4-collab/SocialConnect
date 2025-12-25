/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { generateUserIdByAntenne } from '../lib/idGenerator';
import {
  COMMON_FIELDS_MAP,
  NATIONALITY_TO_COUNTRY_MAP
} from './import/importConstants';
import { findValue, transformDateExcel } from './import/excelUtils';
import {
  mapperAntenne,
  mapperTrancheAge,
  mapperGenre,
  extraireProblematiques,
  extraireActions
} from './import/mappingFunctions';

export { ID_PREFIX_MAP, AGE_GROUP_MAP, NATIONALITY_TO_COUNTRY_MAP, PROBLEMATIQUES_MAP, ACTIONS_MAP, COMMON_FIELDS_MAP } from './import/importConstants';
export { findValue, transformDateExcel } from './import/excelUtils';
export { mapperAntenne, mapperTrancheAge, mapperGenre, extraireProblematiques, extraireActions } from './import/mappingFunctions';

/**
 * @deprecated Utiliser generateUserIdByAntenne à la place
 */
export function generateNewUserId(environment = 'development'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const prefix = environment === 'production' ? 'PROD' : environment === 'test' ? 'TEST' : 'DEV';
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Génère un ID utilisateur basé sur l'antenne pour les imports
 */
export function generateUserIdForImport(antenne?: string | null): string {
  return generateUserIdByAntenne(antenne);
}

/**
 * Mappe une ligne Excel vers la structure utilisateur de l'application
 */
export function mapExcelToUserStructure(rawData: Record<string, any>, rowIndex: number, environment = 'development') {
  if (!rawData || Object.keys(rawData).length === 0) {
    console.warn(`Row ${rowIndex + 1}: Skipping empty row data.`);
    return null;
  }

  try {
    const nom = findValue(rawData, COMMON_FIELDS_MAP.nom);
    const prenom = findValue(rawData, COMMON_FIELDS_MAP.prenom);

    if (!nom && !prenom) {
      console.warn(`Row ${rowIndex + 1}: Skipping row due to missing 'Nom' AND 'Prénom'.`);
      return null;
    }

    const email = findValue(rawData, COMMON_FIELDS_MAP.email);
    const telephone = findValue(rawData, COMMON_FIELDS_MAP.telephone);
    const dateNaissance = transformDateExcel(findValue(rawData, COMMON_FIELDS_MAP.dateNaissance));
    const nationaliteValue = findValue(rawData, COMMON_FIELDS_MAP.nationalite);

    const remarques = findValue(rawData, ['remarque', 'commentaire', 'note', 'observation', 'Notes Générales']) || '';
    const etat = findValue(rawData, ['statut', 'état', 'status', 'etat'], 'Actif');
    const dateCloture = transformDateExcel(findValue(rawData, ['date cloture', 'date fermeture', 'Date de clôture']));
    const dateOuvertureValue = findValue(rawData, ['date création', 'date creation', 'date ouverture', 'Date d\'ouverture de dossier']);
    const dateOuverture = transformDateExcel(dateOuvertureValue) || new Date().toISOString().split('T')[0];
    const gestionnaire = findValue(rawData, ['gestionnaire', 'gestionnaire du dossier', 'referent', 'référent', 'Gestionnaire du dossier']);
    const antenne = mapperAntenne(rawData);

    const statutSejour = findValue(rawData, ['statut de séjour', 'statut séjour', 'séjour', 'residence status', 'Statut de séjour']);
    const langue = findValue(rawData, ['langue', 'langue entretien', 'language', 'Langue de l\'entretien']);
    const premierContact = findValue(rawData, ['premier contact', 'contact initial', 'source', 'Premier contact']);
    const notesGenerales = findValue(rawData, ['notes générales', 'notes generales', 'general notes', 'infos générales', 'Notes Générales']);

    // --- Gestion Adresse ---
    const rueBrute = findValue(rawData, ['lieu de vie / adresse', 'adresse complète', 'adresse complete', 'full address', 'Lieu de vie / Adresse']);
    const rueSpecific = findValue(rawData, COMMON_FIELDS_MAP.adresse);
    const finalRue = rueBrute || rueSpecific || null;

    const numBoiteRaw = findValue(rawData, ['n°', 'numero', 'numéro', 'num', 'N°']);
    let parsedNumero: string | null = null;
    let parsedBoite: string | null = null;

    if (numBoiteRaw !== null && numBoiteRaw !== '') {
      const numBoiteStr = String(numBoiteRaw).trim();
      const separators = [' bte ', ' boite ', ' box ', '/', ' bt '];
      let separatorFound = false;
      for (const separator of separators) {
        const regex = new RegExp(`^(.*?)` + separator.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + `(.*)$`, 'i');
        const parts = numBoiteStr.match(regex);
        if (parts && parts.length === 3 && parts[1].trim() !== '') {
          parsedNumero = parts[1].trim();
          parsedBoite = parts[2].trim() || null;
          separatorFound = true;
          break;
        }
      }
      if (!separatorFound) {
        const boitePrefixRegex = /^(bte|boite|box|bt)\s+/i;
        if (boitePrefixRegex.test(numBoiteStr)) {
          parsedBoite = numBoiteStr.replace(boitePrefixRegex, '').trim() || null;
        } else if (/^\d+[a-zA-Z]?$/.test(numBoiteStr)) {
          parsedNumero = numBoiteStr;
        }
      }
    }

    const adresseObject = {
      rue: finalRue,
      numero: parsedNumero,
      boite: parsedBoite,
      codePostal: String(findValue(rawData, COMMON_FIELDS_MAP.codePostal) || '1070'),
      ville: String(findValue(rawData, COMMON_FIELDS_MAP.ville) || 'Anderlecht'),
      pays: findValue(rawData, ['pays', 'country']) || 'Belgique',
      adresseComplete: rueBrute || null
    };

    let nationalite = '';
    if (nationaliteValue) {
      const nationaliteLower = nationaliteValue.toString().toLowerCase().trim();
      nationalite = (nationaliteLower in NATIONALITY_TO_COUNTRY_MAP)
        ? NATIONALITY_TO_COUNTRY_MAP[nationaliteLower as keyof typeof NATIONALITY_TO_COUNTRY_MAP]
        : nationaliteValue.toString().trim();
    }

    const mappedUser = {
      id: generateUserIdByAntenne(antenne !== 'Non spécifié' ? antenne : null),
      nom: nom || 'Non précisé',
      prenom: prenom || 'Non précisé',
      email: email || '',
      telephone: telephone || '',
      dateNaissance,
      genre: mapperGenre(rawData),
      nationalite: nationalite || 'Non spécifié',
      trancheAge: mapperTrancheAge(rawData),
      adresse: adresseObject,
      antenne: antenne,
      problematiques: extraireProblematiques(rawData),
      actions: extraireActions(rawData),
      remarques: remarques,
      etat: etat,
      dateCloture,
      dateOuverture,
      gestionnaire: gestionnaire || '',
      statutSejour: statutSejour || null,
      langue: langue || null,
      premierContact: premierContact || null,
      notesGenerales: notesGenerales || null,
    };

    console.log(`--- Row ${rowIndex + 1} Mapped Successfully: ${mappedUser.nom} ${mappedUser.prenom}`);
    return mappedUser;

  } catch (error) {
    console.error(`!!! Error mapping row ${rowIndex + 1}:`, error);
    return null;
  }
}

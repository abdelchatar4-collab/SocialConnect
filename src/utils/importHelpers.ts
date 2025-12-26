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
export { findValue, transformDateExcel, parseCellValue } from './import/excelUtils';
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
export function mapExcelToUserStructure(rawData: Record<string, any>, rowIndex: number, customMapping?: Record<string, string>, environment = 'development') {
  if (!rawData || Object.keys(rawData).length === 0) {
    console.warn(`Row ${rowIndex + 1}: Skipping empty row data.`);
    return null;
  }

  // Utiliser le mapping personnalisé s'il existe, sinon utiliser les mots-clés par défaut
  const getMap = (field: string) => {
    if (customMapping && customMapping[field]) return [customMapping[field]];
    return COMMON_FIELDS_MAP[field as keyof typeof COMMON_FIELDS_MAP] || [field];
  };

  try {
    const nom = findValue(rawData, getMap('nom'));
    const prenom = findValue(rawData, getMap('prenom'));

    if (!nom && !prenom) {
      console.warn(`Row ${rowIndex + 1}: Skipping row due to missing 'Nom' AND 'Prénom'.`);
      return null;
    }

    const email = findValue(rawData, getMap('email'));
    const telephone = findValue(rawData, getMap('telephone'));
    const dateNaissance = transformDateExcel(findValue(rawData, getMap('dateNaissance')));
    const nationaliteValue = findValue(rawData, getMap('nationalite'));

    // Gestion Remarques + Mediation specific fields
    const baseRemarques = findValue(rawData, getMap('remarques')) || '';
    const typeConflit = findValue(rawData, getMap('typeConflit'));
    const issue = findValue(rawData, getMap('issue'));

    let remarques = baseRemarques;
    const notesMediation = [];
    if (typeConflit) notesMediation.push(`Conflit: ${typeConflit}`);
    if (issue) notesMediation.push(`Issue: ${issue}`);

    if (notesMediation.length > 0) {
      const mediationStr = notesMediation.join(" | ");
      remarques = remarques ? `${remarques} | ${mediationStr}` : mediationStr;
    }

    const etat = findValue(rawData, getMap('etat'), 'Actif');
    const dateCloture = transformDateExcel(findValue(rawData, getMap('dateCloture')));
    const dateOuvertureValue = findValue(rawData, getMap('dateOuverture'));
    const dateOuverture = transformDateExcel(dateOuvertureValue) || new Date().toISOString().split('T')[0];
    const gestionnaire = findValue(rawData, getMap('gestionnaire'));

    // Antenne: priorité au mapping, sinon détection automatique
    const antenneHeader = customMapping?.antenne;
    const antenne = antenneHeader ? (rawData[antenneHeader] || 'Non spécifié') : mapperAntenne(rawData);

    const statutSejour = findValue(rawData, getMap('statutSejour'));
    const langue = findValue(rawData, getMap('langue'));
    const premierContact = findValue(rawData, getMap('premierContact'));
    const notesGenerales = findValue(rawData, getMap('notesGenerales'));

    // --- Gestion Adresse ---
    const rueSpecific = findValue(rawData, getMap('adresse'));
    const finalRue = rueSpecific || findValue(rawData, ['lieu de vie / adresse', 'adresse complète', 'adresse complete', 'full address', 'Lieu de vie / Adresse']) || null;

    const numMapped = findValue(rawData, getMap('numero'));
    const numBoiteRaw = numMapped || findValue(rawData, ['n°', 'numero', 'numéro', 'num', 'N°', 'Noms et N° de rue']);

    const adresseObject = {
      rue: finalRue,
      numero: null as string | null,
      boite: null as string | null,
      codePostal: String(findValue(rawData, getMap('codePostal')) || '1070'),
      ville: String(findValue(rawData, getMap('ville')) || 'Anderlecht'),
      pays: findValue(rawData, ['pays', 'country']) || 'Belgique',
      adresseComplete: finalRue
    };

    // Re-calcul du numéro et boite si possible (si pas déjà mappé explicitement)
    if (numBoiteRaw !== null && numBoiteRaw !== '') {
      const numBoiteStr = String(numBoiteRaw).trim();
      const separators = [' bte ', ' boite ', ' box ', '/', ' bt '];
      let separatorFound = false;
      for (const separator of separators) {
        const regex = new RegExp(`^(.*?)` + separator.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + `(.*)$`, 'i');
        const parts = numBoiteStr.match(regex);
        if (parts && parts.length === 3 && parts[1].trim() !== '') {
          adresseObject.numero = parts[1].trim();
          adresseObject.boite = parts[2].trim() || null;
          separatorFound = true;
          break;
        }
      }
      if (!separatorFound) {
        const boitePrefixRegex = /^(bte|boite|box|bt)\s+/i;
        if (boitePrefixRegex.test(numBoiteStr)) {
          adresseObject.boite = numBoiteStr.replace(boitePrefixRegex, '').trim() || null;
        } else if (/^\d+[a-zA-Z]?$/.test(numBoiteStr)) {
          adresseObject.numero = numBoiteStr;
        }
      }
    }

    let nationalite = '';
    if (nationaliteValue) {
      const nationaliteLower = nationaliteValue.toString().toLowerCase().trim();
      nationalite = (nationaliteLower in NATIONALITY_TO_COUNTRY_MAP)
        ? NATIONALITY_TO_COUNTRY_MAP[nationaliteLower as keyof typeof NATIONALITY_TO_COUNTRY_MAP]
        : nationaliteValue.toString().trim();
    }

    // Genre: priorité au mapping
    const genreHeader = customMapping?.genre;
    const genre = mapperGenre(rawData, genreHeader);

    const mappedUser = {
      id: generateUserIdByAntenne(antenne !== 'Non spécifié' ? antenne : null),
      nom: nom || 'Non précisé',
      prenom: prenom || 'Non précisé',
      email: email || '',
      telephone: telephone || '',
      dateNaissance,
      genre: genre,
      nationalite: nationalite || 'Non spécifié',
      trancheAge: mapperTrancheAge(rawData, customMapping?.trancheAge),
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

      // Nouveaux champs exhaustifs
      informationImportante: findValue(rawData, getMap('informationImportante')) || null,
      partenaire: findValue(rawData, getMap('partenaire')) || null,
      situationProfessionnelle: findValue(rawData, getMap('situationProfessionnelle')) || null,
      revenus: findValue(rawData, getMap('revenus')) || null,
      secteur: findValue(rawData, getMap('secteur')) || null,

      // PrevExp Suite
      hasPrevExp: !!(findValue(rawData, getMap('prevExpDateReception')) || findValue(rawData, getMap('prevExpDecision'))),
      prevExpDateReception: transformDateExcel(findValue(rawData, getMap('prevExpDateReception'))),
      prevExpDateRequete: transformDateExcel(findValue(rawData, getMap('prevExpDateRequete'))),
      prevExpDateVad: transformDateExcel(findValue(rawData, getMap('prevExpDateVad'))),
      prevExpDecision: findValue(rawData, getMap('prevExpDecision')) || null,
      prevExpCommentaire: findValue(rawData, getMap('prevExpCommentaire')) || null,
      prevExpAideJuridique: findValue(rawData, getMap('prevExpAideJuridique')) || null,
      prevExpDateAudience: transformDateExcel(findValue(rawData, getMap('prevExpDateAudience'))),
      prevExpDateExpulsion: transformDateExcel(findValue(rawData, getMap('prevExpDateExpulsion'))),
      prevExpDateJugement: transformDateExcel(findValue(rawData, getMap('prevExpDateJugement'))),
      prevExpDateSignification: transformDateExcel(findValue(rawData, getMap('prevExpDateSignification'))),
      prevExpDemandeCpas: findValue(rawData, getMap('prevExpDemandeCpas')) || null,
      prevExpEtatLogement: findValue(rawData, getMap('prevExpEtatLogement')) || null,
      prevExpMaintienLogement: findValue(rawData, getMap('prevExpMaintienLogement')) || null,
      prevExpMotifRequete: findValue(rawData, getMap('prevExpMotifRequete')) || null,
      prevExpNegociationProprio: findValue(rawData, getMap('prevExpNegociationProprio')) || null,
      prevExpNombreChambre: findValue(rawData, getMap('prevExpNombreChambre')) || null,
      prevExpSolutionRelogement: findValue(rawData, getMap('prevExpSolutionRelogement')) || null,
      prevExpTypeFamille: findValue(rawData, getMap('prevExpTypeFamille')) || null,
      prevExpTypeRevenu: findValue(rawData, getMap('prevExpTypeRevenu')) || null,
      prevExpDossierOuvert: findValue(rawData, getMap('prevExpDossierOuvert')) || null,

      // Mediation Suite
      mediationType: findValue(rawData, getMap('mediationType')) || null,
      mediationDemandeur: findValue(rawData, getMap('mediationDemandeur')) || null,
      mediationPartieAdverse: findValue(rawData, getMap('mediationPartieAdverse')) || null,
      mediationStatut: findValue(rawData, getMap('mediationStatut')) || null,
      mediationDescription: findValue(rawData, getMap('mediationDescription')) || null,
    };

    console.log(`--- Row ${rowIndex + 1} Mapped Successfully: ${mappedUser.nom} ${mappedUser.prenom}`);
    return mappedUser;

  } catch (error) {
    console.error(`!!! Error mapping row ${rowIndex + 1}:`, error);
    return null;
  }
}

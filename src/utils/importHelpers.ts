/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { parseISO, isValid, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { generateUserIdByAntenne } from '../lib/idGenerator';

// -------------- CONSTANTES --------------

// Préfixes pour les IDs générés (utilisé par generateNewUserId - DEPRECATED)
export const ID_PREFIX_MAP = {
  development: 'DEV',
  test: 'TEST',
  production: 'PROD'
};

// Mapping des tranches d'âge
export const AGE_GROUP_MAP = {
  "0-17": "Mineur",
  "18-25": "Jeune adulte",
  "26-40": "Adulte",
  "41-65": "Adulte mûr",
  "65+": "Senior"
};

// Mapping des nationalités vers les pays
export const NATIONALITY_TO_COUNTRY_MAP = {
  "français": "France", "française": "France", "francais": "France", "francaise": "France", "fr": "France",
  "belge": "Belgique", "belgique": "Belgique", "be": "Belgique",
  "suisse": "Suisse", "ch": "Suisse",
  "italien": "Italie", "italienne": "Italie", "italie": "Italie", "it": "Italie",
  "allemand": "Allemagne", "allemande": "Allemagne", "allemagne": "Allemagne", "de": "Allemagne",
  "espagnol": "Espagne", "espagnole": "Espagne", "espagne": "Espagne", "es": "Espagne",
  "portugais": "Portugal", "portugaise": "Portugal", "portugal": "Portugal", "pt": "Portugal",
  "marocain": "Maroc", "marocaine": "Maroc", "maroc": "Maroc", "ma": "Maroc",
  "algérien": "Algérie", "algérienne": "Algérie", "algerien": "Algérie", "algerienne": "Algérie", "algerie": "Algérie", "algérie": "Algérie", "dz": "Algérie",
  "tunisien": "Tunisie", "tunisienne": "Tunisie", "tunisie": "Tunisie", "tn": "Tunisie"
  // Ajoutez d'autres nationalités si nécessaire
};

// --- MODIFICATION: Ajout des problématiques basées sur l'en-tête ---
// Ajout de variations en minuscules sans accents pour plus de robustesse
export const PROBLEMATIQUES_MAP = {
  'Administratif': ['Administratif', 'administratif'],
  'Addiction': ['Addiction', 'addiction'],
  'CPAS': ['CPAS', 'cpas'],
  'Juridique': ['Juridique', 'juridique'],
  'Suivi post-pénitentiaire/ IPPJ': ['Suivi post-pénitentiaire/ IPPJ', 'suivi post penitentiaire ippj'],
  'Demande hébergement/ logement ou logement précaire': ['Demande hébergement/ logement ou logement précaire', 'demande hebergement logement ou logement precaire'],
  'Famille/Couple': ['Famille/Couple', 'famille couple'],
  'Scolarité': ['Scolarité', 'scolarite'],
  'ISP': ['ISP', 'isp'],
  'Problème Santé (physique ou mentale)': ['Problème Santé (physique ou mentale)', 'probleme sante physique ou mentale'],
  'Dettes/ Factures': ['Dettes/ Factures', 'dettes factures'],
  'Séjour': ['Séjour', 'sejour'],
  'Sans-abrisme (en rue/ squat)': ['Sans-abrisme (en rue/ squat)', 'sans abrisme en rue squat'],
  'Autres Problématiques': ['Autres', 'autres']
};

// --- MODIFICATION: Ajout des actions basées sur l'en-tête ---
// Ajout de variations en minuscules sans accents pour plus de robustesse
export const ACTIONS_MAP = {
  'Écoute et soutien': { columns: ['Écoute et soutien', 'ecoute et soutien'] },
  'Prise de rdv': { columns: ['Prise de rdv (dans une antenne)', 'prise de rdv dans une antenne'] },
  'Accompagnement Physique': { columns: ['Acc. Physique', 'acc physique'] },
  'Information': { columns: ['Informer (retour volontaire, …)', 'informer retour volontaire'] },
  'Orientation': { columns: ['Orientation', 'orientation'] },
  'Soutien administratif': { columns: ['Soutien administratif (dont AMU)', 'soutien administratif dont amu'] },
  'Autres Actions': { columns: ['Autre', 'autre'] }
};

export const COMMON_FIELDS_MAP = {
  'nom': ['nom', 'name', 'lastname', 'nom de famille', 'nom famille', 'nom naissance', 'Nom'],
  'prenom': ['prénom', 'prenom', 'firstname', 'first name', 'prénom usuel', 'prenom usuel', 'Prénom'],
  'email': ['email', 'mail', 'courriel', 'e-mail', 'adresse mail', 'adresse email', 'mel', 'Mail'],
  'telephone': ['téléphone', 'telephone', 'tel', 'tél', 'phone', 'mobile', 'portable', 'numéro téléphone', 'num tel', 'numéro de téléphone', 'Téléphone'],
  'dateNaissance': ['date de naissance', 'naissance', 'date naissance', 'birth date', 'birthdate', 'ddn', 'né le', 'nee le', 'Date de naissance'],
  'nationalite': ['nationalité', 'nationalite', 'pays d\'origine', 'pays origine', 'pays naissance', 'origin country', 'Nationalité'],
  'adresse': ['adresse', 'address', 'rue', 'street', 'adresse postale', 'ligne adresse 1'],
  'codePostal': ['code postal', 'cp', 'zip', 'postal code', 'codepostal'],
  'ville': ['ville', 'city', 'commune', 'town', 'localité', 'localite']
};

// -------------- FONCTIONS UTILITAIRES --------------

/**
 * Trouve la valeur dans rawData correspondant à l'une des clés possibles.
 * @param {Record<string, any>} rawData - L'objet de données brutes de la ligne Excel.
 * @param {string[]} keys - Tableau de clés possibles (insensible à la casse et aux espaces).
 * @param {any} defaultValue - Valeur à retourner si aucune clé n'est trouvée.
 * @returns {any} La valeur trouvée ou la valeur par défaut.
 */
function findValue(rawData: Record<string, any>, keys: string[], defaultValue: any = ''): any {
  if (!rawData) return defaultValue;

  // --- MODIFICATION: Normalisation plus robuste des clés (insensible casse, accents, espaces multiples) ---
  const normalizeKey = (key: string): string =>
    key
      .toLowerCase()
      .trim()
      .normalize("NFD") // Séparer les caractères de base et les diacritiques
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les diacritiques (accents)
      .replace(/\s+/g, ' '); // Remplacer les espaces multiples par un seul

  const normalizedKeys = keys.map(normalizeKey);

  for (const rawKey in rawData) {
    const normalizedRawKey = normalizeKey(rawKey);
    if (normalizedKeys.includes(normalizedRawKey)) {
      const value = rawData[rawKey];
      return value !== null && value !== undefined ? value : defaultValue;
    }
  }
  return defaultValue;
}

export function transformDateExcel(value: string | number | null | undefined): string | null {
  if (!value) return null;
  try {
    if (typeof value === 'number') {
      if (value > 0 && value < 2958466) { // Basic check for Excel serial date range
        const dateInfo = XLSX.SSF.parse_date_code(value);
        if (dateInfo && dateInfo.y && dateInfo.m !== undefined && dateInfo.d) {
          const utcDate = new Date(Date.UTC(dateInfo.y, dateInfo.m - 1, dateInfo.d));
          if (!isNaN(utcDate.getTime())) {
            return format(utcDate, 'yyyy-MM-dd');
          }
        }
      }
    }
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (!trimmedValue) return null; // Handle empty strings

      // Attempt common formats
      const formatsToTry = [
        // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD (ISO-like)
        { regex: /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/, order: 'YMD' },
        // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY (French/Belgian)
        { regex: /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/, order: 'DMY' },
        // M/D/YY, M-D-YY (US short date)
        { regex: /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/, order: 'MDY_short' },
        // YY-MM-DD (Year-Month-Day with 2-digit year)
        { regex: /^(\d{2})[-/.](\d{1,2})[-/.](\d{1,2})$/, order: 'YMD_short' },
      ];

      for (const formatConfig of formatsToTry) {
        const match = trimmedValue.match(formatConfig.regex);
        if (match) {
          let yearStr: string, monthStr: string, dayStr: string;
          if (formatConfig.order === 'YMD') {
            [ , yearStr, monthStr, dayStr ] = match;
          } else if (formatConfig.order === 'DMY') {
            [ , dayStr, monthStr, yearStr ] = match;
          } else if (formatConfig.order === 'MDY_short') {
            [ , monthStr, dayStr, yearStr ] = match;
            yearStr = (parseInt(yearStr) < 70 ? '20' : '19') + yearStr; // Heuristique pour année à 2 chiffres
          } else if (formatConfig.order === 'YMD_short') {
            [ , yearStr, monthStr, dayStr ] = match;
            yearStr = (parseInt(yearStr) < 70 ? '20' : '19') + yearStr; // Heuristique pour année à 2 chiffres
          } else {
            continue; // Should not happen
          }

          // Basic validation of components
          const pDay = parseInt(dayStr);
          const pMonth = parseInt(monthStr);
          const pYear = parseInt(yearStr);

          if (pDay >= 1 && pDay <= 31 && pMonth >= 1 && pMonth <= 12 && pYear > 1900 && pYear < 2100) {
            const formattedDate = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
            const parsed = parseISO(formattedDate);
            if (isValid(parsed)) return formattedDate;
          }
        }
      }
      // Fallback: try direct parsing if it looks somewhat like a date string
      // This is a last resort for less common or ambiguous formats.
      try {
        const parsed = parseISO(trimmedValue);
        if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
      } catch (parseError) { /* ignore if direct parseISO fails */ }
    }
  } catch (e) {
    console.warn(`Error transforming date value: ${value}`, e);
    return null; // Return null on error
  }
  console.warn("Could not parse date:", value);
  return null; // Return null if no format matched or on error
}

export function mapperAntenne(rawData: Record<string, any>): string {
  const possibleKeys = [
    'antenne', 'centre', 'site', 'structure', 'établissement', 'pôle',
    'antenne spécifique', 'Antenne'
  ];
  const antenneValue = findValue(rawData, possibleKeys, null);
  return antenneValue ? antenneValue.toString().trim() : 'Non spécifié';
}

export function mapperTrancheAge(rawData: Record<string, any>): string {
  let age: number | null = null;
  const ageKeys = ['age', 'âge', 'Age'];
  const birthDateKeys = COMMON_FIELDS_MAP.dateNaissance;
  const trancheAgeKeys = ['Tranche d\'âge', 'tranche age', 'tranche d age'];

  const ageValue = findValue(rawData, ageKeys, null);
  if (ageValue !== null && ageValue !== '' && !isNaN(parseInt(String(ageValue)))) {
    age = parseInt(String(ageValue));
  }

  if (age === null) {
    const birthDateStr = transformDateExcel(findValue(rawData, birthDateKeys));
    if (birthDateStr) {
      const birthDate = parseISO(birthDateStr);
      if (isValid(birthDate)) {
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
    }
  }

  if (age !== null && age >= 0) {
    if (age < 18) return AGE_GROUP_MAP["0-17"];
    if (age <= 25) return AGE_GROUP_MAP["18-25"];
    if (age <= 40) return AGE_GROUP_MAP["26-40"];
    if (age <= 65) return AGE_GROUP_MAP["41-65"];
    return AGE_GROUP_MAP["65+"];
  }

  const trancheAgeDirecte = findValue(rawData, trancheAgeKeys, null);
  if (trancheAgeDirecte) {
    const trancheNormalisee = trancheAgeDirecte.toString().trim();
    if (trancheNormalisee in AGE_GROUP_MAP) return AGE_GROUP_MAP[trancheNormalisee as keyof typeof AGE_GROUP_MAP];
    const matchingValue = Object.values(AGE_GROUP_MAP).find(val => val.toLowerCase() === trancheNormalisee.toLowerCase());
    if (matchingValue) return matchingValue;
  }

  return "Non spécifié";
}

export function mapperGenre(rawData: Record<string, any>): string {
  const possibleKeys = ['genre', 'sexe', 'gender', 'civilité', 'civilite', 'Genre'];
  const maleValues = ['m', 'h', 'homme', 'male', 'masculin', 'mr', 'monsieur', '1(m)', '1']; // Ajout de '1(m)' et '1'
  const femaleValues = ['f', 'femme', 'female', 'féminin', 'mme', 'madame', 'mlle', 'mademoiselle', '2(f)', '2']; // Ajout de '2(f)' et '2'
  const otherValues = ['autre', 'other', 'non-binaire', 'nb', 'non précisé', 'non specifie'];
  const genreValue = findValue(rawData, possibleKeys, null);
  if (genreValue) {
    const valueLower = genreValue.toString().toLowerCase().trim();
    if (maleValues.includes(valueLower)) return 'Homme';
    if (femaleValues.includes(valueLower)) return 'Femme';
    if (otherValues.includes(valueLower)) return 'Autre';
  }
  return 'Non spécifié';
}

export function extraireProblematiques(rawData: Record<string, any>): { type: string; description: string; dateSignalement: string }[] {
  const problematiques: { type: string; description: string; dateSignalement: string }[] = [];
  if (!rawData) return problematiques;
  const negativeValues = ['non', 'no', 'faux', 'false', '0', '']; // Include empty string

  for (const key in PROBLEMATIQUES_MAP) {
    const possibleColumns = PROBLEMATIQUES_MAP[key as keyof typeof PROBLEMATIQUES_MAP];
    const value = findValue(rawData, possibleColumns, ''); // Default to empty string
    const valueStr = value?.toString().trim().toLowerCase();

    console.log(`[Debug Problematique] Type: ${key}, Raw Value: '${value}', Normalized Value: '${valueStr}'`);

    if (valueStr && !negativeValues.includes(valueStr)) {
      let description = value.toString().trim();
      if (['oui', 'vrai', 'true', 'x', '1', 'yes'].includes(valueStr)) {
        description = key;
      }
      problematiques.push({
        type: key,
        description: description,
        dateSignalement: new Date().toISOString().split('T')[0] // Add required dateSignalement field
      });
    }
  }
  return problematiques;
}

export function extraireActions(rawData: Record<string, any>): { type: string; date: string; description: string }[] {
  const actions: { type: string; date: string; description: string }[] = [];
  if (!rawData) return actions;
  const negativeValues = ['non', 'no', 'faux', 'false', '0', '']; // Include empty string

  for (const type in ACTIONS_MAP) {
    const config = ACTIONS_MAP[type as keyof typeof ACTIONS_MAP];
    const value = findValue(rawData, config.columns, ''); // Default to empty string
    const valueStr = value?.toString().trim().toLowerCase();

    console.log(`[Debug Action] Type: ${type}, Raw Value: '${value}', Normalized Value: '${valueStr}'`);

    if (valueStr && !negativeValues.includes(valueStr)) {
      let actionDate: string | null = null;
      // Simple date finding logic (can be expanded)
      actionDate = transformDateExcel(findValue(rawData, ['date', 'date action', 'date intervention'], null));

      let description = value.toString().trim();
      if (['oui', 'vrai', 'true', 'x', '1', 'yes'].includes(valueStr)) {
        description = type;
      }
      // Use current date if no date found, as per Prisma schema DateTime (required)
      actions.push({ type, date: actionDate || new Date().toISOString(), description: description });
    }
  }
  return actions;
}

/**
 * @deprecated Utiliser generateUserIdByAntenne à la place
 */
export function generateNewUserId(environment = 'development'): string {
  // Pour la compatibilité temporaire, utilisons encore l'ancien système pour les imports
  // TODO: Migrer vers generateUserIdByAntenne() quand l'antenne sera disponible au moment de l'import
  const prefix = ID_PREFIX_MAP[environment as keyof typeof ID_PREFIX_MAP] || 'DEV';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Génère un ID utilisateur basé sur l'antenne pour les imports
 */
export function generateUserIdForImport(antenne?: string | null): string {
  return generateUserIdByAntenne(antenne);
}

// --- MODIFICATION: Ajout de rowIndex et try...catch ---
export function mapExcelToUserStructure(rawData: Record<string, any>, rowIndex: number, environment = 'development') {

  if (!rawData || Object.keys(rawData).length === 0) {
    console.warn(`Row ${rowIndex + 1}: Skipping empty row data.`);
    return null;
  }

  try {
    const nom = findValue(rawData, COMMON_FIELDS_MAP.nom);
    const prenom = findValue(rawData, COMMON_FIELDS_MAP.prenom);

    // --- AJOUT: Vérification minimale (Nom ou Prénom doit être présent) ---
    if (!nom && !prenom) {
      console.warn(`Row ${rowIndex + 1}: Skipping row due to missing 'Nom' AND 'Prénom'. Raw:`, JSON.stringify(rawData));
      return null;
    }

    const email = findValue(rawData, COMMON_FIELDS_MAP.email);
    const telephone = findValue(rawData, COMMON_FIELDS_MAP.telephone);
    const dateNaissanceValue = findValue(rawData, COMMON_FIELDS_MAP.dateNaissance);
    const dateNaissance = transformDateExcel(dateNaissanceValue); // Peut retourner null
    const nationaliteValue = findValue(rawData, COMMON_FIELDS_MAP.nationalite);

    const remarques = findValue(rawData, ['remarque', 'commentaire', 'note', 'observation', 'Notes Générales']) || ''; // Ajout Notes Générales ici aussi?
    const etat = findValue(rawData, ['statut', 'état', 'status', 'etat'], 'Actif'); // Utiliser 'etat' comme clé
    const dateClotureValue = findValue(rawData, ['date cloture', 'date fermeture', 'Date de clôture']);
    const dateCloture = transformDateExcel(dateClotureValue); // Peut retourner null
    const dateOuvertureValue = findValue(rawData, ['date création', 'date creation', 'date ouverture', 'Date d\'ouverture de dossier']);
    // Utiliser la date actuelle comme fallback si la date d'ouverture est invalide ou manquante
    const dateOuverture = transformDateExcel(dateOuvertureValue) || new Date().toISOString().split('T')[0];
    const gestionnaire = findValue(rawData, ['gestionnaire', 'gestionnaire du dossier', 'referent', 'référent', 'Gestionnaire du dossier']);
    const antenne = mapperAntenne(rawData);

    const statutSejour = findValue(rawData, ['statut de séjour', 'statut séjour', 'séjour', 'residence status', 'Statut de séjour']);
    const langue = findValue(rawData, ['langue', 'langue entretien', 'language', 'Langue de l\'entretien']);
    const premierContact = findValue(rawData, ['premier contact', 'contact initial', 'source', 'Premier contact']);
    const notesGenerales = findValue(rawData, ['notes générales', 'notes generales', 'general notes', 'infos générales', 'Notes Générales']); // Garder séparé de remarques?
    // Le champ 'secteur' n'est plus extrait directement du fichier Excel, il sera déterminé par l'adresse.
    // Suppression des logs de débogage pour le secteur ici.

    // Log la valeur brute de la langue extraite par findValue
    const rawLangueValue = findValue(rawData, ['langue', 'langue entretien', 'language', 'Langue de l\'entretien']);
    console.log(`[Mapping Debug] Row ${rowIndex + 1}: Raw Langue value from findValue:`, rawLangueValue);

    // --- Gestion Adresse ---
    const rueBrute = findValue(rawData, ['lieu de vie / adresse', 'adresse complète', 'adresse complete', 'full address', 'Lieu de vie / Adresse']);
    const rueSpecific = findValue(rawData, COMMON_FIELDS_MAP.adresse);
    const finalRue = rueBrute || rueSpecific || null;

    const numBoiteRaw = findValue(rawData, ['n°', 'numero', 'numéro', 'num', 'N°']);
    let parsedNumero: string | null = null;
    let parsedBoite: string | null = null;
    if (numBoiteRaw !== null && numBoiteRaw !== '') {
      const numBoiteStr = String(numBoiteRaw).trim();
      const separators = [' bte ', ' boite ', ' box ', '/', ' bt ']; // Espace avant/après important
      let separatorFound = false;
      for (const separator of separators) {
        const regex = new RegExp(`^(.*?)` + separator.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + `(.*)$`, 'i');
        const parts = numBoiteStr.match(regex);
        if (parts && parts.length === 3 && parts[1].trim() !== '') { // Assurer qu'il y a qqc avant le séparateur
          parsedNumero = parts[1].trim();
          parsedBoite = parts[2].trim() || null; // Mettre null si la partie boite est vide
          separatorFound = true;
          break;
        }
      }
      if (!separatorFound) {
        const boitePrefixRegex = /^(bte|boite|box|bt)\s+/i;
        if (boitePrefixRegex.test(numBoiteStr)) {
          parsedBoite = numBoiteStr.replace(boitePrefixRegex, '').trim() || null;
          // parsedNumero reste null
        } else if (/^\d+[a-zA-Z]?$/.test(numBoiteStr)) { // Numéro simple (15, 15B)
          parsedNumero = numBoiteStr;
          // parsedBoite reste null
        } else {
          // Cas incertain: contient des lettres/chiffres mais pas de format clair
          // Mettre dans numéro par défaut? Ou laisser null? Prudence: laisser null si pas sûr.
          // Ou mettre dans rueBrute si elle est vide?
          // Pour l'instant, on ne met rien si on ne sait pas parser.
          console.warn(`Row ${rowIndex + 1}: Could not reliably parse Numero/Boite from '${numBoiteStr}'. Leaving Numero/Boite null.`);
          // Alternative: Mettre dans numéro
          // parsedNumero = numBoiteStr;
        }
      }
      // Nettoyage final
      if (parsedNumero === '') parsedNumero = null;
      if (parsedBoite === '') parsedBoite = null;
    }

    let codePostal = findValue(rawData, COMMON_FIELDS_MAP.codePostal) || null;
    let ville = findValue(rawData, COMMON_FIELDS_MAP.ville) || null;
    // Fallbacks seulement si explicitement null/vide après recherche
    if (!codePostal) codePostal = '1070';
    if (!ville) ville = 'Anderlecht';
    const pays = findValue(rawData, ['pays', 'country']) || 'Belgique';

    const adresseObject = {
      rue: finalRue,
      numero: parsedNumero,
      boite: parsedBoite,
      codePostal: codePostal ? String(codePostal) : null,
      ville: ville ? String(ville) : null,
      pays: pays,
      adresseComplete: rueBrute || null
    };
    // --- Fin Gestion Adresse ---

    let nationalite = '';
    if (nationaliteValue) {
      const nationaliteLower = nationaliteValue.toString().toLowerCase().trim();
      nationalite = (nationaliteLower in NATIONALITY_TO_COUNTRY_MAP)
        ? NATIONALITY_TO_COUNTRY_MAP[nationaliteLower as keyof typeof NATIONALITY_TO_COUNTRY_MAP]
        : nationaliteValue.toString().trim();
    }

    const problematiques = extraireProblematiques(rawData);
    const actions = extraireActions(rawData);

    const mappedUser = {
      id: generateUserIdByAntenne(antenne !== 'Non spécifié' ? antenne : null),
      nom: nom || 'Non précisé',
      prenom: prenom || 'Non précisé',
      email: email || '',
      telephone: telephone || '',
      dateNaissance: dateNaissance, // Garde null si invalide/manquant
      genre: mapperGenre(rawData),
      nationalite: nationalite || 'Non spécifié',
      trancheAge: mapperTrancheAge(rawData),
      adresse: adresseObject,
      antenne: antenne,
      problematiques,
      actions,
      remarques: remarques, // Peut-être fusionner avec notesGenerales?
      etat: etat,
      dateCloture: dateCloture, // Garde null si invalide/manquant
      dateOuverture: dateOuverture, // Fallback date actuelle
      gestionnaire: gestionnaire || '',
      statutSejour: statutSejour || null,
      langue: langue || null,
      premierContact: premierContact || null,
      notesGenerales: notesGenerales || null, // Garder séparé pour l'instant
      // Le champ 'secteur' ne sera plus inclus ici, il sera déterminé et mis à jour après la création de l'utilisateur.
    };

    console.log(`--- Row ${rowIndex + 1} Mapped Successfully: ${mappedUser.nom} ${mappedUser.prenom}`);
    return mappedUser;

  } catch (error) {
    console.error(`!!! Error mapping row ${rowIndex + 1}:`, error);
    console.error(`!!! Raw data for failed row ${rowIndex + 1}:`, JSON.stringify(rawData));
    return null; // Indique un échec pour cette ligne
  }
}

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Import Constants and Mappings
*/

import { FilterType } from '@/features/users/components/UserList/UserListFilters.types';

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
};

// Mappings des problématiques basées sur l'en-tête
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

// Mappings des actions basées sur l'en-tête
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

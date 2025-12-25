/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Form Default Data
Centralized default values for UserFormData
*/

import { UserFormData } from '@/types';

/**
 * Default empty UserFormData object
 */
export const defaultUserFormData: UserFormData = {
    nom: '',
    prenom: '',
    genre: '',
    telephone: '',
    email: '',
    statutSejour: '',
    gestionnaire: '',
    nationalite: '',
    trancheAge: '',
    remarques: '',
    secteur: '',
    langue: '',
    premierContact: '',
    notesGenerales: '',
    informationImportante: '',
    etat: 'Actif',
    antenne: '',
    dateNaissance: '',
    dateOuverture: new Date().toISOString().split('T')[0],
    dateCloture: '',
    id: undefined,
    rgpdAttestationGeneratedAt: null,
    adresse: {
        rue: '',
        numero: '',
        boite: '',
        codePostal: '',
        ville: '',
        quartier: '',
        pays: '',
        secteur: ''
    },
    hasPrevExp: false,
    prevExpDateReception: '',
    prevExpDateRequete: '',
    prevExpDateVad: '',
    prevExpDecision: '',
    prevExpCommentaire: '',
    prevExpMotifRequete: '',
    prevExpDateAudience: '',
    prevExpDateSignification: '',
    prevExpDateJugement: '',
    prevExpDateExpulsion: '',
    prevExpDossierOuvert: '',
    prevExpDemandeCpas: '',
    prevExpNegociationProprio: '',
    prevExpSolutionRelogement: '',
    prevExpMaintienLogement: '',
    prevExpTypeFamille: '',
    prevExpTypeRevenu: '',
    prevExpEtatLogement: '',
    prevExpNombreChambre: '',
    prevExpAideJuridique: '',
    situationProfessionnelle: '',
    revenus: '',
    afficherDonneesConfidentielles: false,
    donneesConfidentielles: '',
    partenaire: [],
    logementDetails: {
        type: '',
        statut: '',
        nombrePieces: 0,
        bailleur: '',
        commentaires: '',
        typeLogement: '',
        dateEntree: '',
        dateSortie: '',
        motifSortie: '',
        destinationSortie: '',
        proprietaire: '',
        loyer: '',
        charges: '',
        commentaire: '',
        hasLitige: false,
        bailEnregistre: '',
        dateContrat: '',
        dureeContrat: '',
        garantieLocative: '',
        statutGarantie: '',
        typeLitige: '',
        dateLitige: '',
        descriptionLitige: '',
        actionsPrises: '',
        datePreavis: '',
        dureePreavis: '',
        preavisPour: ''
    },
    mediationType: '',
    mediationDemandeur: '',
    mediationPartieAdverse: '',
    mediationStatut: '',
    mediationDescription: '',
    problematiques: [],
    problematiquesDetails: '',
    actions: [],
};

/**
 * Form step field mappings for validation
 */
export const STEP_FIELDS: Record<number, string[]> = {
    1: ['nom', 'prenom', 'genre', 'telephone', 'email', 'langue'],
    2: ['dateNaissance', 'nationalite', 'statutSejour', 'trancheAge'],
    3: ['gestionnaire', 'antenne', 'etat', 'premierContact'],
    4: ['hasPrevExp'],
    5: [],
    6: ['remarques', 'notesGenerales']
};

/**
 * Human-readable field labels for validation messages
 */
export const FIELD_LABELS: Record<string, string> = {
    nom: 'Nom',
    prenom: 'Prénom',
    genre: 'Genre',
    telephone: 'Téléphone',
    email: 'Email',
    langue: 'Langue',
    dateNaissance: 'Date de naissance',
    nationalite: 'Nationalité',
    statutSejour: 'Statut séjour',
    trancheAge: "Tranche d'âge",
    gestionnaire: 'Gestionnaire',
    antenne: 'Antenne',
    etat: 'État',
    premierContact: 'Premier contact',
    remarques: 'Remarques',
    notesGenerales: 'Notes générales',
    dateOuverture: "Date d'ouverture"
};

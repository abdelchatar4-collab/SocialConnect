/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Initial User Data Constants
Extracted from app/users/new/page.tsx for maintainability
*/

import { User } from '@/types/user';

/**
 * Default initial data for a new user form
 */
export const initialNewUserData: Partial<User> = {
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
    etat: 'Actif',
    antenne: '',
    dateNaissance: '',
    dateOuverture: new Date().toISOString().split('T')[0],
    dateCloture: '',
    partenaire: null,
    adresse: {
        rue: '',
        numero: '',
        boite: '',
        codePostal: '',
        ville: '',
        quartier: '',
        pays: '',
        secteur: '',
    },
    hasPrevExp: false,
    prevExpDateReception: '',
    prevExpDateRequete: '',
    prevExpDateVad: '',
    prevExpDecision: '',
    prevExpCommentaire: '',
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
        dureePreavis: ''
    },
    problematiques: [],
    problematiquesDetails: '',
    actions: [],
    informationImportante: '',
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Configuration des étapes du formulaire utilisateur
 */

export interface FormStep {
    id: number;
    name: string;
    title: string;
    description?: string;
    requiredFields?: string[];
}

export const FORM_STEPS: FormStep[] = [
    {
        id: 1,
        name: 'personal',
        title: 'Informations personnelles',
        description: 'Renseignements de base sur l\'usager',
        requiredFields: ['nom', 'prenom', 'dateNaissance', 'genre'],
    },
    {
        id: 2,
        name: 'contact',
        title: 'Coordonnées',
        description: 'Informations de contact',
        requiredFields: ['telephone', 'email', 'langue'],
    },
    {
        id: 3,
        name: 'address',
        title: 'Adresse',
        description: 'Adresse de résidence',
        requiredFields: ['adresse.rue', 'adresse.numero', 'adresse.codePostal', 'adresse.ville'],
    },
    {
        id: 4,
        name: 'housing',
        title: 'Logement',
        description: 'Détails du logement',
        requiredFields: [],
    },
    {
        id: 5,
        name: 'problematics',
        title: 'Problématiques & Actions',
        description: 'Problématiques et suivi',
        requiredFields: [],
    },
    {
        id: 6,
        name: 'notes',
        title: 'Notes & Informations',
        description: 'Notes complémentaires',
        requiredFields: [],
    },
];

export const TOTAL_STEPS = FORM_STEPS.length;

/**
 * Utilitaire pour obtenir une étape par son ID
 */
export const getStepById = (id: number): FormStep | undefined => {
    return FORM_STEPS.find(step => step.id === id);
};

/**
 * Utilitaire pour obtenir une étape par son nom
 */
export const getStepByName = (name: string): FormStep | undefined => {
    return FORM_STEPS.find(step => step.name === name);
};

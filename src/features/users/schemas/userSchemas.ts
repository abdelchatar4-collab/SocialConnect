/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { z } from 'zod';

/**
 * Zod schemas for User data validation.
 * These are used both on the client (form validation) and server (API validation).
 */

// Basic Address Schema
export const AdresseSchema = z.object({
    rue: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    boite: z.string().nullable().optional(),
    codePostal: z.string().nullable().optional(),
    ville: z.string().nullable().optional(),
    quartier: z.string().nullable().optional(),
    pays: z.string().nullable().optional(),
    secteur: z.string().nullable().optional(),
});

// Mutuelle Schema
export const MutuelleSchema = z.object({
    nom: z.string().nullable().optional(),
    numeroAdherent: z.string().nullable().optional(),
    dateAdhesion: z.string().nullable().optional(),
    options: z.array(z.string()).nullable().optional(),
});

// Logement Details Schema
export const LogementDetailsSchema = z.object({
    type: z.string().optional(),
    statut: z.string().optional(),
    nombrePieces: z.number().optional(),
    typeLogement: z.string().optional(),
    dateEntree: z.string().optional(),
    dateSortie: z.string().optional(),
    motifSortie: z.string().nullable().optional(),
    destinationSortie: z.string().nullable().optional(),
    proprietaire: z.string().nullable().optional(),
    bailleur: z.string().nullable().optional(),
    loyer: z.string().nullable().optional(),
    charges: z.string().nullable().optional(),
    commentaire: z.string().nullable().optional(),
    commentaires: z.string().nullable().optional(),
    hasLitige: z.boolean().optional(),
    bailEnregistre: z.string().optional(),
    dateContrat: z.string().optional(),
    dureeContrat: z.string().optional(),
    garantieLocative: z.string().optional(),
    statutGarantie: z.string().optional(),
    typeLitige: z.string().optional(),
    dateLitige: z.string().optional(),
    descriptionLitige: z.string().optional(),
    actionsPrises: z.string().optional(),
    datePreavis: z.string().optional(),
    dureePreavis: z.string().optional(),
    preavisPour: z.string().optional(),
});

// Problematique Schema
export const ProblematiqueSchema = z.object({
    type: z.string(),
    description: z.string(),
    dateSignalement: z.string(),
    detail: z.string().nullable().optional(),
});

// Action Suivi Schema
export const ActionSuiviSchema = z.object({
    date: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    titre: z.string().nullable().optional(),
    statut: z.string().nullable().optional(),
    priorite: z.string().nullable().optional(),
    echeance: z.string().nullable().optional(),
    responsable: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    partenaire: z.string().nullable().optional(),
});

// Main User Creation Schema
export const UserCreateSchema = z.object({
    nom: z.string().min(1, "Le nom est obligatoire"),
    prenom: z.string().min(1, "Le prénom est obligatoire"),
    genre: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email("Format d'email invalide").optional().or(z.literal('')),
    dateNaissance: z.string().nullable().optional(),
    dateOuverture: z.string().nullable().optional(),
    dateCloture: z.string().nullable().optional(),
    etat: z.string().optional(),
    antenne: z.string().optional(),
    statutSejour: z.string().optional(),
    gestionnaire: z.string().optional(),
    nationalite: z.string().optional(),
    trancheAge: z.string().optional(),
    remarques: z.string().nullable().optional(),
    secteur: z.string().optional(),
    langue: z.string().optional(),
    situationProfessionnelle: z.string().optional(),
    revenus: z.string().optional(),
    premierContact: z.string().nullable().optional(),
    notesGenerales: z.string().nullable().optional(),
    problematiquesDetails: z.string().nullable().optional(),
    informationImportante: z.string().nullable().optional(),
    afficherDonneesConfidentielles: z.boolean().optional(),
    donneesConfidentielles: z.string().nullable().optional(),

    // Nested objects
    adresse: AdresseSchema.optional(),
    mutuelle: MutuelleSchema.optional(),
    logementDetails: LogementDetailsSchema.optional(),
    problematiques: z.array(ProblematiqueSchema).optional(),
    actions: z.array(ActionSuiviSchema).optional(),

    // PrevExp fields
    hasPrevExp: z.boolean().optional(),
    prevExpDateReception: z.string().nullable().optional(),
    prevExpDateRequete: z.string().nullable().optional(),
    prevExpDateVad: z.string().nullable().optional(),
    prevExpMotifRequete: z.string().nullable().optional(),
    prevExpDateAudience: z.string().nullable().optional(),
    prevExpDateSignification: z.string().nullable().optional(),
    prevExpDateJugement: z.string().nullable().optional(),
    prevExpDateExpulsion: z.string().nullable().optional(),
    prevExpDossierOuvert: z.string().nullable().optional(),
    prevExpDecision: z.string().nullable().optional(),
    prevExpCommentaire: z.string().nullable().optional(),
    prevExpDemandeCpas: z.string().nullable().optional(),
    prevExpNegociationProprio: z.string().nullable().optional(),
    prevExpSolutionRelogement: z.string().nullable().optional(),
    prevExpMaintienLogement: z.string().nullable().optional(),
    prevExpTypeFamille: z.string().nullable().optional(),
    prevExpTypeRevenu: z.string().nullable().optional(),
    prevExpEtatLogement: z.string().nullable().optional(),
    prevExpNombreChambre: z.string().nullable().optional(),
    prevExpAideJuridique: z.string().nullable().optional(),
});

// Update Schema is mostly partial version of create schema
export const UserUpdateSchema = UserCreateSchema.partial();

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Default Dropdown Options Configuration
Extracted from optionsService.ts for maintainability
*/

import { LANGUAGES } from '@/data/languages';
import { COUNTRIES } from '@/data/countries';

export interface DropdownOptionSet {
    id: string;
    name: string;
    options: string[];
    description?: string;
    isSystem?: boolean;
}

/**
 * Default dropdown options for the application
 */
export const defaultOptions: DropdownOptionSet[] = [
    {
        id: 'statutSejour',
        name: 'Statut de séjour',
        description: 'Options pour le champ "Statut de séjour"',
        options: [
            'Belge', 'Citoyen UE', 'Titre de séjour valable', 'Procédure en cours',
            'Sans-papiers', 'Séjour limité (Carte A)', 'Séjour illimité (Carte B)',
            'Etablissement (CARTE K (anciennement carte C))',
            'Résident de longue durée UE (CARTE L (anciennement carte D))',
            'Enregistrement art. 8 DIR 2004/38/CE (CARTE EU (anciennement carte E))',
            'Séjour permanent art.19 DIR 2004/38/CE (CARTE EU + (anciennement carte E+))',
            'Membre famille UE ART. 10 DIR 2004/38/CE (CARTE F)',
            'Membre famille UE ART 20 DIR 2004/38/CE (CARTE F+)',
            'Carte bleue européenne (CARTE H)', 'Carte M', 'Carte M avec mention séjour permanent',
            'Carte N pour petit trafic frontalier pour bénéficiaires de l\'accord de retrait', 'Autre'
        ]
    },
    {
        id: 'typeLogement',
        name: 'Type de logement',
        description: 'Options pour le champ "Type de logement"',
        options: ['Rue', 'Squat', 'Famille/Amis', 'Centre d\'hébergement', 'Logement de transit', 'Location privée', 'Propriétaire', 'Autre']
    },
    {
        id: 'statutSocial',
        name: 'Statut social',
        description: 'Options pour le champ "Statut social"',
        options: ['Salarié', 'Indépendant', 'Demandeur d\'emploi indemnisé', 'Bénéficiaire RIS', 'Sans statut', 'Étudiant', 'Retraité', 'Non précisé']
    },
    {
        id: 'situationFamiliale',
        name: 'Situation familiale',
        description: 'Options pour le champ "Situation familiale"',
        options: ['Célibataire', 'En couple', 'Marié(e)', 'Divorcé(e)', 'Séparé(e)', 'Veuf/Veuve', 'Non précisé']
    },
    {
        id: 'etat',
        name: 'État du dossier',
        description: 'Options pour le champ "État du dossier"',
        options: ['Actif', 'Clôturé', 'Suspendu']
    },
    {
        id: 'antenne',
        name: 'Antennes',
        description: 'Options pour le champ "Antenne"',
        options: ['Antenne Centre', 'Antenne Cureghem', 'Antenne Bizet', 'Antenne Ouest', 'PILDA']
    },
    {
        id: 'problematiques',
        name: 'Problématiques',
        description: 'Options pour le champ "Problématiques" (filtrage, formulaire, etc.)',
        options: [
            'Fiscalité', 'Santé Mentale (dont addiction)', 'CPAS', 'Juridique',
            'Suivi post pénitentiaire/IPPJ', "Demande d'hébergement (court et moyen terme)",
            'Famille/couple', 'Scolarité', 'ISP', 'Santé (physique; handicap; autonomie)',
            'Endettement/Surendettement', 'Séjours', 'Sans abrisme',
            'Energie (eau;gaz;électricité)', 'Logement', 'Autre', 'Non spécifié'
        ]
    },
    {
        id: 'actions',
        name: 'Actions et suivi',
        description: 'Options pour le champ "Actions et suivi" (types d\'action)',
        options: [
            'Entretien', 'Appel téléphonique', 'Courrier', 'Mail', 'Visite à domicile',
            'Orientation', 'Aide administrative', 'Aide financière', 'Aide alimentaire',
            'Accompagnement social', 'Accompagnement logement', 'Accompagnement santé',
            'Accompagnement emploi', 'Accompagnement juridique', 'Autre'
        ]
    },
    {
        id: 'langue',
        name: 'Langues',
        description: 'Options pour le champ "Langue principale"',
        options: LANGUAGES
    },
    {
        id: 'premierContact',
        name: 'Premier contact',
        description: 'Options pour le champ "Premier contact"',
        options: ['Téléphone', 'Email', 'Visite spontanée', 'Rendez-vous', 'Courrier', 'Via partenaire', 'Autre']
    },
    {
        id: 'revenus',
        name: 'Revenus',
        description: 'Options pour le champ "Revenus"',
        options: [
            'Salaire', 'RIS (Revenu d\'Intégration Sociale)', 'Allocations chômage', 'Pension',
            'Allocations familiales', 'Indemnités maladie/invalidité', 'Revenus indépendant',
            'Aide sociale', 'Aucun revenu', 'Autre'
        ]
    },
    {
        id: 'nationalite',
        name: 'Nationalités',
        description: 'Options pour le champ "Nationalité"',
        options: COUNTRIES
    }
];

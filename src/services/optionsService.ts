/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// Service pour gérer les options des menus déroulants

import { useState, useEffect, useCallback } from 'react';
import { LANGUAGES } from '@/data/languages';
import { COUNTRIES } from '@/data/countries';

/**
 * Interface qui définit un ensemble d'options pour un menu déroulant
 */
export interface DropdownOptionSet {
  id: string;
  name: string;
  options: string[];
  description?: string;
  isSystem?: boolean; // Si true, certaines options sont verrouillées (systèmes)
}

// Clé utilisée pour stocker les options dans le localStorage
const STORAGE_KEY = 'app_dropdown_options';

// Options par défaut pour les menus déroulants
export const defaultOptions: DropdownOptionSet[] = [
  {
    id: 'statutSejour',
    name: 'Statut de séjour', // Changé à false pour permettre les modifications
    description: 'Options pour le champ "Statut de séjour"',
    options: [
      'Belge',
      'Citoyen UE',
      'Titre de séjour valable',
      'Procédure en cours',
      'Sans-papiers',
      'Séjour limité (Carte A)',
      'Séjour illimité (Carte B)',
      'Etablissement (CARTE K (anciennement carte C))',
      'Résident de longue durée UE (CARTE L (anciennement carte D))',
      'Enregistrement art. 8 DIR 2004/38/CE (CARTE EU (anciennement carte E))',
      'Séjour permanent art.19 DIR 2004/38/CE (CARTE EU + (anciennement carte E+))',
      'Membre famille UE ART. 10 DIR 2004/38/CE (CARTE F)',
      'Membre famille UE ART 20 DIR 2004/38/CE (CARTE F+)',
      'Carte bleue européenne (CARTE H)',
      'Carte M',
      'Carte M avec mention séjour permanent',
      'Carte N pour petit trafic frontalier pour bénéficiaires de l\'accord de retrait',
      'Autre'
    ]
  },
  {
    id: 'typeLogement',
    name: 'Type de logement',
    description: 'Options pour le champ "Type de logement"',
    options: [
      'Rue',
      'Squat',
      'Famille/Amis',
      'Centre d\'hébergement',
      'Logement de transit',
      'Location privée',
      'Propriétaire',
      'Autre'
    ]
  },
  {
    id: 'statutSocial',
    name: 'Statut social',
    description: 'Options pour le champ "Statut social"',
    options: [
      'Salarié',
      'Indépendant',
      'Demandeur d\'emploi indemnisé',
      'Bénéficiaire RIS',
      'Sans statut',
      'Étudiant',
      'Retraité',
      'Non précisé'
    ]
  },
  {
    id: 'situationFamiliale',
    name: 'Situation familiale',
    description: 'Options pour le champ "Situation familiale"',
    options: [
      'Célibataire',
      'En couple',
      'Marié(e)',
      'Divorcé(e)',
      'Séparé(e)',
      'Veuf/Veuve',
      'Non précisé'
    ]
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
    options: [
      'Antenne Centre',
      'Antenne Cureghem',
      'Antenne Bizet',
      'Antenne Ouest',
      'PILDA'
    ]
  },
  {
    id: 'problematiques',
    name: 'Problématiques',
    description: 'Options pour le champ "Problématiques" (filtrage, formulaire, etc.)',
    options: [
      'Fiscalité',
      'Santé Mentale (dont addiction)',
      'CPAS',
      'Juridique',
      'Suivi post pénitentiaire/IPPJ',
      "Demande d'hébergement (court et moyen terme)",
      'Famille/couple',
      'Scolarité',
      'ISP',
      'Santé (physique; handicap; autonomie)',
      'Endettement/Surendettement',
      'Séjours',
      'Sans abrisme',
      'Energie (eau;gaz;électricité)',
      'Logement',
      'Autre',
      'Non spécifié'
    ]
  },
  {
    id: 'actions', // Changé de 'actionsSuivi' à 'actions'
    name: 'Actions et suivi',
    description: 'Options pour le champ "Actions et suivi" (types d\'action)',
    options: [
      'Entretien',
      'Appel téléphonique',
      'Courrier',
      'Mail',
      'Visite à domicile',
      'Orientation',
      'Aide administrative',
      'Aide financière',
      'Aide alimentaire',
      'Accompagnement social',
      'Accompagnement logement',
      'Accompagnement santé',
      'Accompagnement emploi',
      'Accompagnement juridique',
      'Autre'
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
    options: [
      'Téléphone',
      'Email',
      'Visite spontanée',
      'Rendez-vous',
      'Courrier',
      'Via partenaire',
      'Autre'
    ]
  },
  {
    id: 'revenus',
    name: 'Revenus',
    description: 'Options pour le champ "Revenus"',
    options: [
      'Salaire',
      'RIS (Revenu d\'Intégration Sociale)',
      'Allocations chômage',
      'Pension',
      'Allocations familiales',
      'Indemnités maladie/invalidité',
      'Revenus indépendant',
      'Aide sociale',
      'Aucun revenu',
      'Autre'
    ]
  },
  {
    id: 'nationalite',
    name: 'Nationalités',
    description: 'Options pour le champ "Nationalité"',
    options: COUNTRIES
  }
];

/**
 * Récupère toutes les ensembles d'options (des menus déroulants)
 */
export function getAllOptionSets(): DropdownOptionSet[] {
  try {
    // S'assurer que toutes les options par défaut sont présentes
    ensureAllDefaultOptions();

    const savedOptions = localStorage.getItem(STORAGE_KEY);
    if (savedOptions) {
      return JSON.parse(savedOptions);
    }
    // Si rien n'est trouvé, initialise avec les options par défaut
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOptions));
    return defaultOptions;
  } catch (error) {
    console.error('Erreur lors de la récupération des options des menus déroulants:', error);
    return defaultOptions;
  }
}

/**
 * Récupère un ensemble d'options spécifique par son ID
 */
export function getOptionSetById(id: string): DropdownOptionSet | undefined {
  const allOptions = getAllOptionSets();
  return allOptions.find(optionSet => optionSet.id === id);
}

/**
 * Récupère les options d'un menu déroulant spécifique par son ID
 */
export function getOptionsById(id: string): string[] {
  const optionSet = getOptionSetById(id);
  return optionSet ? ['', ...optionSet.options] : [''];
}

/**
 * Ajoute une nouvelle option à un ensemble d'options existant
 */
// Supprimer cette fonction dupliquée et défectueuse (lignes 381-408)
// export function addOption(categoryId: string, option: string): boolean {
//   try {
//     if (!newOption.trim()) return false; // ❌ newOption n'existe pas
//     const allOptions = getAllOptionSets();
//     const optionSetIndex = allOptions.findIndex(optionSet => optionSet.id === optionSetId); // ❌ optionSetId n'existe pas
//     ...
//   }
// }

// Garder seulement la première fonction (ligne 217) qui est correcte :
export function addOption(optionSetId: string, newOption: string): boolean {
  try {
    if (!newOption.trim()) return false;
    const allOptions = getAllOptionSets();
    const optionSetIndex = allOptions.findIndex(optionSet => optionSet.id === optionSetId);
    if (optionSetIndex === -1) return false;

    // Vérifier si l'option existe déjà
    if (allOptions[optionSetIndex].options.includes(newOption)) {
      return false;
    }

    // Ajouter la nouvelle option
    allOptions[optionSetIndex].options.push(newOption);

    // Sauvegarder les options mises à jour
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));

    // Notifier le changement
    notifyOptionsDataChange();

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une option:', error);
    return false;
  }
}

/**
 * Met à jour une option existante
 */
export function updateOption(optionSetId: string, oldOption: string, newOption: string): boolean {
  try {
    if (!newOption.trim()) return false;

    const allOptions = getAllOptionSets();
    const optionSetIndex = allOptions.findIndex(optionSet => optionSet.id === optionSetId);

    if (optionSetIndex === -1) return false;

    // Trouver l'index de l'ancienne option
    const optionIndex = allOptions[optionSetIndex].options.indexOf(oldOption);
    if (optionIndex === -1) return false;

    // Mettre à jour l'option
    allOptions[optionSetIndex].options[optionIndex] = newOption;

    // Sauvegarder les options mises à jour
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'une option:', error);
    return false;
  }
}

/**
 * Supprime une option existante
 */
export function deleteOption(optionSetId: string, option: string): boolean {
  try {
    const allOptions = getAllOptionSets();
    const optionSetIndex = allOptions.findIndex(optionSet => optionSet.id === optionSetId);

    if (optionSetIndex === -1) return false;

    // Filtrer pour retirer l'option
    allOptions[optionSetIndex].options = allOptions[optionSetIndex].options.filter(
      opt => opt !== option
    );

    // Sauvegarder les options mises à jour
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une option:', error);
    return false;
  }
}

/**
 * Ajoute un nouvel ensemble d'options
 */
export function addOptionSet(newOptionSet: Omit<DropdownOptionSet, 'id'>): string {
  try {
    const allOptions = getAllOptionSets();

    // Générer un ID unique
    const id = `custom_${Date.now()}`;

    // Ajouter le nouvel ensemble d'options
    allOptions.push({
      ...newOptionSet,
      id,
      options: newOptionSet.options || []
    });

    // Sauvegarder les options mises à jour
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    return id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un ensemble d\'options:', error);
    return '';
  }
}

/**
 * Réinitialise toutes les options aux valeurs par défaut
 */
export function resetAllOptions(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOptions));
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des options:', error);
    return false;
  }
}

/**
 * Vérifie et met à jour les options manquantes dans le localStorage
 */
export function ensureAllDefaultOptions(): boolean {
  try {
    const savedOptions = localStorage.getItem(STORAGE_KEY);
    let currentOptions: DropdownOptionSet[] = [];

    if (savedOptions) {
      currentOptions = JSON.parse(savedOptions);
    }

    // Migration: renommer 'actionsSuivi' vers 'actions' si nécessaire
    const actionsSuiviIndex = currentOptions.findIndex(opt => opt.id === 'actionsSuivi');
    if (actionsSuiviIndex !== -1) {
      currentOptions[actionsSuiviIndex].id = 'actions';
      console.log('Migration: actionsSuivi → actions');
    }

    // Vérifier si des options par défaut sont manquantes
    let hasChanges = actionsSuiviIndex !== -1; // Déjà des changements si migration

    for (const defaultOption of defaultOptions) {
      const existingOption = currentOptions.find(opt => opt.id === defaultOption.id);
      if (!existingOption) {
        currentOptions.push(defaultOption);
        hasChanges = true;
        console.log(`Option ajoutée: ${defaultOption.name} (${defaultOption.id})`);
      }
    }

    // Sauvegarder si des changements ont été apportés
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOptions));
      console.log('Options mises à jour dans le localStorage');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification des options par défaut:', error);
    return false;
  }
}

// Ajouter cette fonction pour notifier les changements
function notifyOptionsDataChange() {
  window.dispatchEvent(new CustomEvent('options-data-changed'));
}

// SUPPRIMER COMPLÈTEMENT les lignes 389-420 qui contiennent :
// export function addOption(categoryId: string, option: string): boolean {
//   try {
//     if (!newOption.trim()) return false;
//     const allOptions = getAllOptionSets();
//     const optionSetIndex = allOptions.findIndex(optionSet => optionSet.id === optionSetId);
//
//     if (optionSetIndex === -1) return false;
//
//     // Vérifier si l'option existe déjà
//     if (allOptions[optionSetIndex].options.includes(newOption)) {
//       return false;
//     }
//
//     // Ajouter la nouvelle option
//     allOptions[optionSetIndex].options.push(newOption);
//
//     // Sauvegarder les options mises à jour
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
//
//     // Notifier le changement
//     notifyOptionsDataChange();
//
//     return true;
//   } catch (error) {
//     console.error('Erreur lors de l\'ajout d\'une option:', error);
//     return false;
//   }
// }

// Appliquer la même modification à updateOption, deleteOption, resetOptions

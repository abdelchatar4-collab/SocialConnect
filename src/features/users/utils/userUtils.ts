/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { User } from '@/types';

/**
 * Utility functions for user state badges and status
 */

/**
 * Returns the appropriate badge variant based on user state
 */
export const getEtatBadgeVariant = (
  etat?: string | null
): "success" | "destructive" | "warning" | "default" => {
  if (!etat) return 'default';

  switch (etat.toLowerCase()) {
    case 'actif':
    case 'ouvert':
      return 'success';
    case 'inactif':
    case 'clôturé':
      return 'destructive';
    case 'en attente':
    case 'suspendu':
      return 'warning';
    case 'archivé':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Parses gestionnaire color from JSON string or object
 */
export const getGestionnaireColor = (gestionnaire: any): string => {
  if (!gestionnaire?.couleurMedaillon) {
    return 'linear-gradient(135deg, #60a5fa, #2563eb)';
  }

  try {
    const couleur = typeof gestionnaire.couleurMedaillon === 'string'
      ? JSON.parse(gestionnaire.couleurMedaillon)
      : gestionnaire.couleurMedaillon;
    return `linear-gradient(135deg, ${couleur.from}, ${couleur.to})`;
  } catch (e) {
    console.warn('Erreur parsing couleur gestionnaire:', e);
    return 'linear-gradient(135deg, #60a5fa, #2563eb)';
  }
};

/**
 * Gets display name for a gestionnaire
 */
export const getGestionnaireDisplayName = (gestionnaire: any): string => {
  if (!gestionnaire) return 'Non assigné';
  if (typeof gestionnaire === 'object') {
    return `${gestionnaire.prenom || ''} ${gestionnaire.nom || ''}`.trim() || 'Non assigné';
  }
  return gestionnaire;
};
/**
 * Creates a new empty user with default values
 */
export const createNewUser = (overrides: Partial<User> = {}): User => {
  return {
    id: `new-${Date.now()}`,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: {
      rue: '',
      numero: '',
      codePostal: '',
      ville: '',
      pays: 'Belgique'
    },
    gestionnaire: null,
    secteur: '',
    antenne: '',
    etat: 'En attente',
    dateOuverture: new Date().toISOString(),
    problematiques: [],
    actions: [],
    ...overrides
  } as User;
};

/**
 * Validates user data
 */
export const validateUserData = (data: Partial<User>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.nom || data.nom.trim() === '') {
    errors.nom = 'Le nom est requis';
  }

  if (!data.prenom || data.prenom.trim() === '') {
    errors.prenom = 'Le prénom est requis';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates a complete user object
 */
export const validateUser = (user: User) => validateUserData(user);

/**
 * Merges user updates safely
 */
export const mergeUserData = (existing: User, updates: Partial<User>): User => {
  return {
    ...existing,
    ...updates,
    adresse: {
      ...(existing.adresse || {}),
      ...(updates.adresse || {})
    }
  };
};

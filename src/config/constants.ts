/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Configuration globale des constantes de l'application
 */

// Pagination
export const ITEMS_PER_PAGE = 15;

// Badge variants pour les états
export const ETAT_BADGE_VARIANTS = {
    ACTIF: 'success',
    OUVERT: 'success',
    INACTIF: 'destructive',
    CLOTURE: 'destructive',
    EN_ATTENTE: 'warning',
    SUSPENDU: 'warning',
    ARCHIVE: 'default',
} as const;

// Tailles d'icônes
export const ICON_SIZES = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3' },
    md: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { container: 'w-10 h-10', icon: 'w-5 h-5' },
} as const;

// Couleur par défaut pour les gestionnaires
export const DEFAULT_GESTIONNAIRE_COLOR = 'linear-gradient(135deg, #60a5fa, #2563eb)';

// Modes d'affichage
export const VIEW_MODES = {
    TABLE: 'table',
    CARDS: 'cards',
} as const;

// Nombre de pages visibles dans la pagination
export const MAX_VISIBLE_PAGES = 5;

// Types
export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];
export type IconSize = keyof typeof ICON_SIZES;

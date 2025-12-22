/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Dashboard Utility Functions
 * Extracted from Dashboard.tsx for better maintainability
 */

import { PASQ_COLORS } from '../constants/pasqTheme';
import {
    extractActionsFromNotes as extractActionsFromNotesUtils,
    deduplicateActions,
    deduplicateActionsSuivi
} from '@/utils/actionUtils';

// Helper function to generate PASQ gradient colors for bar charts
// Each bar gets a different shade from the PASQ palette (like in the HTML report)
export const getPasqBarColors = (count: number): string[] => {
    const pasqGradient = [
        PASQ_COLORS.clair,      // #66D1C9 - Light
        PASQ_COLORS.interClair, // #33C7B6 - Medium-light
        PASQ_COLORS.normal,     // #00B4A7 - Standard
        PASQ_COLORS.interFonce, // #009F8D - Medium-dark
        PASQ_COLORS.fonce,      // #008C7A - Dark
    ];

    // Repeat pattern if more colors needed
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        colors.push(pasqGradient[i % pasqGradient.length]);
    }
    return colors;
};

export const getUserActionsWithDeduplication = (user: any): any[] => {
    if (user.actions && user.actions.length > 0) {
        return deduplicateActions(user.actions);
    } else if (user.actionsSuivi && user.actionsSuivi.length > 0) {
        return deduplicateActionsSuivi(user.actionsSuivi);
    } else if (user.notesGenerales) {
        return deduplicateActions(extractActionsFromNotesUtils(user.notesGenerales));
    }
    return [];
};

// Cache pour éviter les recalculs
const userActionsCache = new Map<string, any[]>();

export const getCachedUserActions = (user: any): any[] => {
    // Use a more robust user ID, e.g., combining ID, nom, and prenom if ID can be null
    const userId = user.id || `${user.nom || ''}-${user.prenom || ''}`;

    if (!userActionsCache.has(userId)) {
        userActionsCache.set(userId, getUserActionsWithDeduplication(user));
    }

    return userActionsCache.get(userId)!;
};

export const clearUserActionsCache = (): void => {
    userActionsCache.clear();
};

// Fonction pour tronquer le texte de synthèse
export const getTruncatedSummary = (fullText: string, maxLength: number = 300): { text: string; isTruncated: boolean } => {
    if (fullText.length <= maxLength) {
        return { text: fullText, isTruncated: false };
    }

    // Trouver le dernier espace avant la limite pour éviter de couper un mot
    const truncateIndex = fullText.lastIndexOf(' ', maxLength);
    const truncatedText = fullText.substring(0, truncateIndex > 0 ? truncateIndex : maxLength);

    return { text: truncatedText, isTruncated: true };
};

// Fonctions utilitaires génériques
export const safeArrayAccess = <T,>(array: T[] | undefined): T[] => {
    return Array.isArray(array) ? array : [];
};

export const safePercent = (numerator: number, denominator: number): number => {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Widget Data Calculations
Extracted from WidgetBuilder.tsx
*/

import { User } from '@/types';
import {
    CustomWidgetFilters,
    ANALYZABLE_FIELDS
} from '../types/customWidget';

/**
 * Calculates data for a custom widget based on users and config
 */
export function calculateWidgetData(
    users: User[],
    fieldId: string,
    filters: CustomWidgetFilters
): { name: string; value: number }[] {
    // Apply filters
    let filteredUsers = [...users];

    if (filters.hasPrevExp) {
        filteredUsers = filteredUsers.filter(u => u.hasPrevExp === true);
    }

    if (filters.isActive) {
        filteredUsers = filteredUsers.filter(u =>
            u.etat === 'Actif' || u.etat === 'En cours' || u.etat === 'Ouvert'
        );
    }

    if (filters.hasLitige) {
        filteredUsers = filteredUsers.filter(u => {
            const details = typeof u.logementDetails === 'object' ? u.logementDetails : null;
            return details?.hasLitige === true;
        });
    }

    if (filters.antenne) {
        filteredUsers = filteredUsers.filter(u => u.antenne === filters.antenne);
    }

    // Get field config
    const fieldConfig = ANALYZABLE_FIELDS.find(f => f.id === fieldId);
    if (!fieldConfig) return [];

    // Count values
    const counts: Record<string, number> = {};

    filteredUsers.forEach(user => {
        const value = getNestedValue(user, fieldConfig.path);

        if (fieldConfig.type === 'multi' && typeof value === 'string' && value.includes(',')) {
            // Handle multi-select fields
            value.split(',').forEach(v => {
                const trimmed = v.trim();
                if (trimmed) {
                    counts[trimmed] = (counts[trimmed] || 0) + 1;
                }
            });
        } else if (Array.isArray(value)) {
            // Handle array fields like problematiques
            value.forEach(item => {
                const itemValue = typeof item === 'object' ? item.type || item.partenaire : item;
                if (itemValue) {
                    counts[itemValue] = (counts[itemValue] || 0) + 1;
                }
            });
        } else {
            const strValue = normalizeValue(value, fieldId);
            counts[strValue] = (counts[strValue] || 0) + 1;
        }
    });

    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: User, path: string): unknown {
    if (path.includes('[]')) {
        const [arrayPath] = path.split('[].');
        const array = (obj as unknown as Record<string, unknown>)[arrayPath];
        return Array.isArray(array) ? array : null;
    }

    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current === null || current === undefined) return null;
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Normalize values (like genre or language)
 */
function normalizeValue(value: unknown, fieldId: string): string {
    if (value === null || value === undefined || value === '') {
        return 'Non spécifié';
    }

    const strValue = String(value).trim();

    if (fieldId === 'genre') {
        const lower = strValue.toLowerCase();
        if (lower === 'homme') return 'Homme';
        if (lower === 'femme') return 'Femme';
        if (lower === 'autre') return 'Autre';
    }

    if (fieldId === 'langue') {
        return normalizeMultiLangValue(strValue);
    }

    if (fieldId === 'gestionnaire' && typeof value === 'object') {
        const g = value as { prenom?: string; nom?: string };
        return `${g.prenom || ''} ${g.nom || ''}`.trim() || 'Non assigné';
    }

    if (strValue.length > 0) {
        return capitalizeFirstLetter(strValue);
    }

    return strValue;
}

/**
 * Normalize multi-language values
 */
function normalizeMultiLangValue(value: string): string {
    const parts = value.split(/[\/,\-]|\s+et\s+|\s+and\s+/i);
    const normalizedParts = parts
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => correctLanguageTypos(p.toLowerCase()))
        .map(p => capitalizeFirstLetter(p));

    const uniqueParts = [...new Set(normalizedParts)];
    uniqueParts.sort((a, b) => a.localeCompare(b, 'fr'));
    return uniqueParts.join(' / ');
}

/**
 * Correct common language typos
 */
function correctLanguageTypos(lang: string): string {
    const typoMap: Record<string, string> = {
        'frçais': 'français',
        'francais': 'français',
        'fraçais': 'français',
        'françai': 'français',
        'fançais': 'français',
        'anglai': 'anglais',
        'angalis': 'anglais',
        'arbe': 'arabe',
        'arab': 'arabe',
        'neerlandais': 'néerlandais',
        'espagnole': 'espagnol',
        'italien': 'italien',
        'portuguais': 'portugais',
        'alemand': 'allemand',
        'turc': 'turc',
        'turque': 'turc',
        'russe': 'russe',
        'chinoi': 'chinois',
        'japonnais': 'japonais',
    };
    return typoMap[lang] || lang;
}

/**
 * Capitalize first letter of each word
 */
function capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

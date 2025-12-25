/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Sector Mapping Utilities
*/

import { streetRanges } from './sectorConfig';

/**
 * Clean address to extract street and number
 */
export const cleanAddress = (addressString: string | null | undefined) => {
    if (!addressString) return { street: "", number: "" };

    if (addressString.toLowerCase().includes('sans adresse') ||
        addressString.toLowerCase().includes('sdf')) {
        return { street: "Sans Adresse", number: "" };
    }

    let street = addressString;
    let number = "";

    const numberMatch = addressString.match(/(\d+)(?:[\s\/]|$|\s*boîte|\s*B\d|\s*A\d|\s*étage)/);
    if (numberMatch) {
        number = numberMatch[1];
        const numberIndex = addressString.indexOf(number);
        if (numberIndex > 0) {
            street = addressString.substring(0, numberIndex).trim();
        }
    }

    street = street.replace(/\d+[\s\/].*$/, '').trim();

    if (street.match(/\d+-\d+/)) {
        street = street.replace(/\s+\d+-\d+.*$/, '').trim();
    }

    return { street, number };
};

/**
 * Get sector based on street number ranges
 */
export const getSectorFromRange = (street: string, number: string): string | null => {
    const normalizedStreet = street.toLowerCase().trim();
    const num = parseInt(number, 10);

    if (isNaN(num)) return null;

    const ranges = streetRanges[normalizedStreet];
    if (!ranges) return null;

    for (const range of ranges) {
        if (num >= range.min && num <= range.max) {
            return range.sector;
        }
    }

    return null;
};

/**
 * Normalize street name for matching
 */
export const normalizeStreet = (street: string | null | undefined): string => {
    if (!street) return '';

    let normalized = street.toLowerCase().trim();
    normalized = normalized
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    normalized = normalized
        .replace(/^(rue|r\.|avenue|av\.|boulevard|bd\.|bld\.|chaussée|ch\.|place|pl\.|square|sq\.)\s+/i, '')
        .replace(/^(de|du|des|de la|d'|van|van de|van den|van der)\s+/i, '');

    normalized = normalized
        .replace(/[0-9,.;:\-_'"/\\()\[\]{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized;
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Sector Mapping Service
*/

import { SECTOR_CONFIG } from './sectorConfig';
import { cleanAddress, getSectorFromRange, normalizeStreet } from './sectorUtils';

/**
 * Process a user's address to determine their sector
 */
export const processUserSector = (
    user: { secteur?: string | null, adresse?: { rue?: string | null } | null }
): {
    finalSector: string,
    source: string,
    confidence: string,
    originalAddress?: string | null,
    matchedKeyword?: string
} => {
    if (user.secteur) {
        return {
            finalSector: SECTOR_CONFIG.normalize(user.secteur),
            source: 'direct',
            confidence: 'high'
        };
    }

    if (user.adresse?.rue) {
        const { street, number } = cleanAddress(user.adresse.rue);

        // Priority 1: Ranges
        const sectorFromRange = getSectorFromRange(street, number);
        if (sectorFromRange) {
            return {
                finalSector: sectorFromRange,
                source: 'range',
                confidence: 'high',
                originalAddress: user.adresse.rue
            };
        }

        // Priority 2: Keyword matching
        const normalizedStreet = normalizeStreet(street);
        if (normalizedStreet) {
            for (const mapping of SECTOR_CONFIG.mappings) {
                for (const keyword of mapping.keywords) {
                    if (normalizedStreet.includes(keyword.toLowerCase())) {
                        return {
                            finalSector: SECTOR_CONFIG.normalize(mapping.sector),
                            source: 'keyword',
                            confidence: 'medium',
                            originalAddress: user.adresse.rue,
                            matchedKeyword: keyword
                        };
                    }
                }
            }
        }
    }

    return {
        finalSector: "Non spécifié",
        source: 'default',
        confidence: 'none'
    };
};

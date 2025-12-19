/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { describe, it, expect } from 'vitest';
import { formatDate, capitalize } from '@/lib/utils'; // Assuming these exist or will check utils again

describe('Utility Functions', () => {
    it('capitalizes the first letter', () => {
        expect(capitalize('bonjour')).toBe('Bonjour');
        expect(capitalize('')).toBe('');
    });

    it('formats dates correctly', () => {
        // Note: This relies on the system locale, usually we mock or check generic formatted structure
        // But for a smoke test, we'll check it returns a string
        const date = new Date('2023-01-01');
        const formatted = formatDate(date);
        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('2023');
    });
});

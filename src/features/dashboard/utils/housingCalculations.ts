/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Housing Statistics Calculations
Extracted from dashboardCalculations.ts for maintainability
*/

import { User } from '@/types';
import { HousingStats } from '../types/dashboard';

/**
 * Calculates Housing statistics
 */
export const calculateHousingStats = (users: User[]): HousingStats | null => {
    const housingUsers = users.filter(u => u.logementDetails && typeof u.logementDetails === 'object');
    if (housingUsers.length === 0) return null;

    let totalLoyer = 0, countLoyer = 0, countSocial = 0;
    const typeLogementCount: { [key: string]: number } = {};
    const loyerRanges = { '0-300€': 0, '301-500€': 0, '501-700€': 0, '701-900€': 0, '901€+': 0 };

    housingUsers.forEach(user => {
        const details = user.logementDetails as any;
        if (details.loyer) {
            const loyer = parseFloat(details.loyer.toString().replace(',', '.').replace(/[^\d.-]/g, ''));
            if (!isNaN(loyer) && loyer > 0) {
                totalLoyer += loyer; countLoyer++;
                if (loyer <= 300) loyerRanges['0-300€']++;
                else if (loyer <= 500) loyerRanges['301-500€']++;
                else if (loyer <= 700) loyerRanges['501-700€']++;
                else if (loyer <= 900) loyerRanges['701-900€']++;
                else loyerRanges['901€+']++;
            }
        }
        if (details.typeLogement) {
            const type = details.typeLogement.trim();
            typeLogementCount[type] = (typeLogementCount[type] || 0) + 1;
            if (type.toLowerCase().includes('social') || type.toLowerCase().includes('ais')) countSocial++;
        }
    });

    return {
        totalLogement: housingUsers.length,
        loyerMoyen: countLoyer > 0 ? totalLoyer / countLoyer : 0,
        partLogementSocial: housingUsers.length > 0 ? (countSocial / housingUsers.length) * 100 : 0,
        typeLogementData: Object.entries(typeLogementCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        loyerRangeData: Object.entries(loyerRanges).map(([name, value]) => ({ name, value }))
    };
};

/**
 * Get urgent actions - users with open PrevExp cases or upcoming expulsions
 */
export const getUrgentActions = (users: User[]) => {
    const now = new Date();
    return users
        .filter(u => u.prevExpDossierOuvert === 'OUI' || (u.prevExpDateExpulsion && new Date(u.prevExpDateExpulsion) > now))
        .map(u => ({
            id: u.id,
            nom: u.nom,
            prenom: u.prenom,
            dossierOuvert: u.prevExpDossierOuvert,
            dateExpulsion: u.prevExpDateExpulsion,
            gestionnaire: u.gestionnaire
        }))
        .sort((a, b) => {
            if (a.dateExpulsion && b.dateExpulsion) {
                return new Date(a.dateExpulsion).getTime() - new Date(b.dateExpulsion).getTime();
            }
            if (a.dossierOuvert === 'OUI' && b.dossierOuvert !== 'OUI') return -1;
            if (a.dossierOuvert !== 'OUI' && b.dossierOuvert === 'OUI') return 1;
            return 0;
        })
        .slice(0, 5);
};

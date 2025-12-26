/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Data Mapping Functions
*/

import { parseISO, isValid } from 'date-fns';
import {
    COMMON_FIELDS_MAP,
    AGE_GROUP_MAP,
    PROBLEMATIQUES_MAP,
    ACTIONS_MAP
} from './importConstants';
import { findValue, transformDateExcel } from './excelUtils';

export function mapperAntenne(rawData: Record<string, any>): string {
    const possibleKeys = [
        'antenne', 'centre', 'site', 'structure', 'établissement', 'pôle',
        'antenne spécifique', 'Antenne'
    ];
    const antenneValue = findValue(rawData, possibleKeys, null);
    return antenneValue ? antenneValue.toString().trim() : 'Non spécifié';
}

export function mapperTrancheAge(rawData: Record<string, any>, customKey?: string): string {
    let age: number | null = null;
    const ageKeys = ['age', 'âge', 'Age'];
    const birthDateKeys = COMMON_FIELDS_MAP.dateNaissance;
    const trancheAgeKeys = customKey ? [customKey] : ['Tranche d\'âge', 'tranche age', 'tranche d age'];

    const ageValue = findValue(rawData, ageKeys, null);
    if (ageValue !== null && ageValue !== '' && !isNaN(parseInt(String(ageValue)))) {
        age = parseInt(String(ageValue));
    }

    if (age === null) {
        const birthDateStr = transformDateExcel(findValue(rawData, birthDateKeys));
        if (birthDateStr) {
            const birthDate = parseISO(birthDateStr);
            if (isValid(birthDate)) {
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }
        }
    }

    if (age !== null && age >= 0) {
        if (age < 18) return AGE_GROUP_MAP["0-17"];
        if (age <= 25) return AGE_GROUP_MAP["18-25"];
        if (age <= 40) return AGE_GROUP_MAP["26-40"];
        if (age <= 65) return AGE_GROUP_MAP["41-65"];
        return AGE_GROUP_MAP["65+"];
    }

    const trancheAgeDirecte = findValue(rawData, trancheAgeKeys, null);
    if (trancheAgeDirecte) {
        const trancheNormalisee = trancheAgeDirecte.toString().trim();
        if (trancheNormalisee in AGE_GROUP_MAP) return AGE_GROUP_MAP[trancheNormalisee as keyof typeof AGE_GROUP_MAP];
        const matchingValue = Object.values(AGE_GROUP_MAP).find(val => val.toLowerCase() === trancheNormalisee.toLowerCase());
        if (matchingValue) return matchingValue;
    }

    return "Non spécifié";
}

export function mapperGenre(rawData: Record<string, any>, customKey?: string): string {
    const possibleKeys = customKey ? [customKey] : ['genre', 'sexe', 'gender', 'civilité', 'civilite', 'Genre'];
    const maleValues = ['m', 'h', 'homme', 'male', 'masculin', 'mr', 'monsieur', '1(m)', '1'];
    const femaleValues = ['f', 'femme', 'female', 'féminin', 'mme', 'madame', 'mlle', 'mademoiselle', '2(f)', '2'];
    const otherValues = ['autre', 'other', 'non-binaire', 'nb', 'non précisé', 'non specifie'];
    const genreValue = findValue(rawData, possibleKeys, null);
    if (genreValue) {
        const valueLower = genreValue.toString().toLowerCase().trim();
        if (maleValues.includes(valueLower)) return 'Homme';
        if (femaleValues.includes(valueLower)) return 'Femme';
        if (otherValues.includes(valueLower)) return 'Autre';
    }
    return 'Non spécifié';
}

export function extraireProblematiques(rawData: Record<string, any>): { type: string; description: string; dateSignalement: string }[] {
    const problematiques: { type: string; description: string; dateSignalement: string }[] = [];
    if (!rawData) return problematiques;
    const negativeValues = ['non', 'no', 'faux', 'false', '0', ''];

    for (const key in PROBLEMATIQUES_MAP) {
        const possibleColumns = PROBLEMATIQUES_MAP[key as keyof typeof PROBLEMATIQUES_MAP];
        const value = findValue(rawData, possibleColumns, '');
        const valueStr = value?.toString().trim().toLowerCase();

        if (valueStr && !negativeValues.includes(valueStr)) {
            let description = value.toString().trim();
            if (['oui', 'vrai', 'true', 'x', '1', 'yes'].includes(valueStr)) {
                description = key;
            }
            problematiques.push({
                type: key,
                description: description,
                dateSignalement: new Date().toISOString().split('T')[0]
            });
        }
    }
    return problematiques;
}

export function extraireActions(rawData: Record<string, any>): { type: string; date: string; description: string }[] {
    const actions: { type: string; date: string; description: string }[] = [];
    if (!rawData) return actions;
    const negativeValues = ['non', 'no', 'faux', 'false', '0', ''];

    for (const type in ACTIONS_MAP) {
        const config = ACTIONS_MAP[type as keyof typeof ACTIONS_MAP];
        const value = findValue(rawData, config.columns, '');
        const valueStr = value?.toString().trim().toLowerCase();

        if (valueStr && !negativeValues.includes(valueStr)) {
            let actionDate = transformDateExcel(findValue(rawData, ['date', 'date action', 'date intervention'], null));
            let description = value.toString().trim();
            if (['oui', 'vrai', 'true', 'x', '1', 'yes'].includes(valueStr)) {
                description = type;
            }
            actions.push({ type, date: actionDate || new Date().toISOString(), description: description });
        }
    }
    return actions;
}

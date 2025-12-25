/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Service Utils
*/

import { UserFormData } from '@/types';
import { UserValidationResult } from './userServiceTypes';

export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
    return /^(\+|00)?[0-9\s\-\(\)]{8,15}$/.test(phone);
};

export const validateUserData = (userData: Partial<UserFormData>): UserValidationResult => {
    const errors: string[] = [];
    if (!userData.nom?.trim()) errors.push('Le nom est obligatoire');
    if (!userData.prenom?.trim()) errors.push('Le prénom est obligatoire');
    if (userData.email && !isValidEmail(userData.email)) errors.push('Format d\'email invalide');
    if (userData.telephone && !isValidPhone(userData.telephone)) errors.push('Format de téléphone invalide');
    return { isValid: errors.length === 0, errors };
};

export const generateUserId = (userData: Partial<UserFormData>): string => {
    const antenne = userData.antenne || 'GEN';
    const antenneMap: Record<string, string> = {
        'Antenne Centre': 'CEN', 'Antenne Cureghem': 'CUR', 'Permanence Bizet': 'BIZ',
        'Ouest': 'OUE', 'PILDA': 'PIL'
    };
    const prefix = antenneMap[antenne] || 'GEN';
    return `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Form Validation Logic
*/

import { UserFormData } from '@/types/user';
import { ValidationError, ValidationResult } from './userFormTypes';

export const validateField = (field: keyof UserFormData, value: any): ValidationError | null => {
    const name = String(field);
    const required = ['nom', 'prenom', 'genre', 'telephone', 'email', 'statutSejour', 'gestionnaire', 'nationalite'];

    if (required.includes(name) && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { field: name, message: `Le champ ${name} est obligatoire` };
    }

    if (field === 'email' && value && typeof value === 'string') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { field: name, message: 'Format d\'email invalide' };
    }

    if (field === 'telephone' && value && typeof value === 'string') {
        if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(value)) return { field: name, message: 'Format de téléphone invalide' };
    }

    return null;
};

export const validateForm = (data: UserFormData): ValidationResult => {
    const errors: ValidationError[] = [];
    Object.keys(data).forEach((key) => {
        const error = validateField(key as keyof UserFormData, data[key as keyof UserFormData]);
        if (error) errors.push(error);
    });
    return { isValid: errors.length === 0, errors, fieldErrors: errors.reduce((acc, e) => ({ ...acc, [e.field]: e.message }), {}) };
};

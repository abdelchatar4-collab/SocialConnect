/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Validation Core Logic
*/

import { UserFormData } from '@/types/user';
import { ValidationError } from './userFormTypes';

export const VALIDATION_RULES: Partial<Record<keyof UserFormData, any>> = {
    nom: { minLength: 2, maxLength: 50 },
    prenom: { minLength: 2, maxLength: 50 },
    telephone: { pattern: /^(?:(?:\+|00)32|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/ },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    remarques: { maxLength: 2500 },
    notesGenerales: { maxLength: 3000 },
    prevExpCommentaire: { maxLength: 1000 }
};

export const validateSingleField = (field: keyof UserFormData, value: unknown, dynamicRequired: string[] = []): ValidationError | null => {
    const rules = VALIDATION_RULES[field], name = String(field);
    if (dynamicRequired.includes(name) && (!value || (typeof value === 'string' && !value.trim()))) return { field: name, message: `Obligatoire` };
    if (!value || (typeof value === 'string' && !value.trim())) return null;
    if (rules?.minLength && typeof value === 'string' && value.length < rules.minLength) return { field: name, message: `Min ${rules.minLength}` };
    if (rules?.maxLength && typeof value === 'string' && value.length > rules.maxLength) return { field: name, message: `Max ${rules.maxLength}` };
    if (rules?.pattern && typeof value === 'string' && !rules.pattern.test(value)) return { field: name, message: field === 'email' ? 'Email invalide' : 'Format invalide' };
    if (field === 'dateNaissance' && value) {
        const d = new Date(value as any);
        if (isNaN(d.getTime()) || (new Date().getFullYear() - d.getFullYear() < 0) || (new Date().getFullYear() - d.getFullYear() > 120)) return { field: name, message: 'Date invalide' };
    }
    return null;
};

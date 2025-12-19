/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { UserFormData } from '@/types/user';

export interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
}

/**
 * Valide les champs essentiels d'un formulaire utilisateur
 * @param formData - Les données du formulaire à valider
 * @param requiredFields - Liste des champs obligatoires (depuis les paramètres)
 * @returns Un objet contenant le statut de validation et la liste des champs manquants
 */
export const validateEssentialFields = (
    formData: UserFormData,
    requiredFields: string[] = []
): ValidationResult => {
    const missingFields: string[] = [];

    // Si aucun champ obligatoire n'est configuré, utiliser les valeurs par défaut
    const fieldsToValidate = requiredFields.length > 0
        ? requiredFields
        : ['nom', 'prenom', 'dateNaissance', 'genre', 'adresse', 'antenne', 'gestionnaire'];

    fieldsToValidate.forEach(field => {
        // Gérer les champs imbriqués (ex: adresse.rue)
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            const parentValue = (formData as any)[parent];

            if (!parentValue || !parentValue[child] || parentValue[child].trim() === '') {
                missingFields.push(field);
            }
        }
        // Gérer le cas spécial de l'adresse complète
        else if (field === 'adresse') {
            const hasCompleteAddress =
                formData.adresse &&
                formData.adresse.rue &&
                formData.adresse.rue.trim() !== '' &&
                formData.adresse.codePostal &&
                formData.adresse.codePostal.trim() !== '' &&
                formData.adresse.ville &&
                formData.adresse.ville.trim() !== '';

            if (!hasCompleteAddress) {
                missingFields.push('adresse');
            }
        }
        // Gérer les champs simples
        else {
            const value = (formData as any)[field];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                missingFields.push(field);
            }
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};

/**
 * Obtient un message d'avertissement formaté pour les champs manquants
 * @param missingFields - Liste des champs manquants
 * @returns Un message formaté
 */
export const getMissingFieldsMessage = (missingFields: string[]): string => {
    const fieldLabels: Record<string, string> = {
        nom: 'Nom',
        prenom: 'Prénom',
        dateNaissance: 'Date de naissance',
        genre: 'Genre',
        telephone: 'Téléphone',
        email: 'Email',
        nationalite: 'Nationalité',
        statutSejour: 'Statut de séjour',
        adresse: 'Adresse complète',
        'adresse.rue': 'Adresse - Rue',
        'adresse.codePostal': 'Adresse - Code postal',
        'adresse.ville': 'Adresse - Ville',
        antenne: 'Antenne',
        gestionnaire: 'Gestionnaire',
    };

    const labels = missingFields.map(field => fieldLabels[field] || field);

    if (labels.length === 1) {
        return `Le champ "${labels[0]}" est manquant.`;
    }

    if (labels.length === 2) {
        return `Les champs "${labels[0]}" et "${labels[1]}" sont manquants.`;
    }

    const lastLabel = labels.pop();
    return `Les champs "${labels.join('", "')}" et "${lastLabel}" sont manquants.`;
};

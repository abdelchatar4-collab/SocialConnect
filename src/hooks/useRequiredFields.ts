/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useAdmin } from '@/contexts/AdminContext';

/**
 * Hook to check if a field is required based on admin settings
 */
export function useRequiredFields() {
    const { requiredFields } = useAdmin();

    const isRequired = (fieldName: string): boolean => {
        return requiredFields.includes(fieldName);
    };

    const getRequiredLabel = (label: string, fieldName: string): string => {
        return isRequired(fieldName) ? `${label} *` : label;
    };

    return {
        requiredFields,
        isRequired,
        getRequiredLabel
    };
}

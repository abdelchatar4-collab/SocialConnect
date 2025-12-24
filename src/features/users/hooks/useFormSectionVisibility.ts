/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useAdmin } from '@/contexts/AdminContext';

/**
 * Hook pour vérifier la visibilité des sections du formulaire
 * Utilise les paramètres configurés dans AdminContext
 */
export const useFormSectionVisibility = () => {
    const { visibleFormSections } = useAdmin();

    /**
     * Vérifie si une section est visible
     * @param sectionId - L'identifiant de la section (identity, contact, address, etc.)
     * @returns true si la section est visible, false sinon
     */
    const isSectionVisible = (sectionId: string): boolean => {
        // Par défaut, toutes les sections sont visibles si non définies
        return visibleFormSections[sectionId] !== false;
    };

    /**
     * Vérifie si plusieurs sections sont toutes visibles
     * @param sectionIds - Liste des identifiants de sections
     * @returns true si TOUTES les sections sont visibles
     */
    const areSectionsVisible = (sectionIds: string[]): boolean => {
        return sectionIds.every(id => isSectionVisible(id));
    };

    /**
     * Vérifie si au moins une des sections est visible
     * @param sectionIds - Liste des identifiants de sections
     * @returns true si AU MOINS UNE section est visible
     */
    const isAnySectionVisible = (sectionIds: string[]): boolean => {
        return sectionIds.some(id => isSectionVisible(id));
    };

    return {
        isSectionVisible,
        areSectionsVisible,
        isAnySectionVisible,
        visibleFormSections
    };
};

export default useFormSectionVisibility;

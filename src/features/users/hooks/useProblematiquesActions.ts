/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback } from 'react';
import { UserFormData, Problematique, ActionSuivi } from '@/types/user';

interface CurrentProblematique {
    id?: string;
    type: string;
    description: string;
    dateSignalement: string;
}

interface CurrentAction {
    id?: string;
    date: string;
    type: string;
    description: string;
    partenaire: string;
}

interface UseProblematiquesActionsProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
}

export const useProblematiquesActions = ({ formData, onInputChange }: UseProblematiquesActionsProps) => {
    // États pour l'édition
    const [editingProblematique, setEditingProblematique] = useState<number | null>(null);
    const [editingAction, setEditingAction] = useState<number | null>(null);

    const [currentProblematique, setCurrentProblematique] = useState<CurrentProblematique>({
        type: '',
        description: '',
        dateSignalement: new Date().toISOString().split('T')[0]
    });

    const [currentAction, setCurrentAction] = useState<CurrentAction>({
        date: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        partenaire: ''
    });

    // Utilitaires Dates (Internal to the hook for now to maintain parity)
    const parseFrenchDate = useCallback((dateStr: string): string => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

        const frenchDateMatch = dateStr.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
        if (frenchDateMatch) {
            let [, day, month, year] = frenchDateMatch;
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                year = String(currentCentury + parseInt(year));
            }
            const isoDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const testDate = new Date(isoDate);
            if (!isNaN(testDate.getTime())) return isoDate;
        }
        return new Date().toISOString().split('T')[0];
    }, []);

    const formatDateForInput = useCallback((date: string | Date | null | undefined): string => {
        if (!date) return '';
        if (typeof date === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            return parseFrenchDate(date);
        }
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return new Date().toISOString().split('T')[0];
    }, [parseFrenchDate]);

    const displayDate = useCallback((date: string | Date | null | undefined): string => {
        if (!date) return '';
        try {
            if (typeof date === 'string') {
                const isoDate = parseFrenchDate(date);
                const parsedDate = new Date(isoDate);
                if (isNaN(parsedDate.getTime())) return date;
                return parsedDate.toLocaleDateString('fr-FR');
            }
            return date.toLocaleDateString('fr-FR');
        } catch {
            return String(date);
        }
    }, [parseFrenchDate]);

    // Logic - Problematiques
    const addProblematique = () => {
        if (!currentProblematique.type) {
            alert("Veuillez sélectionner un type de problématique");
            return;
        }
        const newProblematique: Problematique = {
            id: Date.now().toString(),
            type: currentProblematique.type,
            description: currentProblematique.description,
            dateSignalement: currentProblematique.dateSignalement
        };
        onInputChange('problematiques', [...(formData.problematiques || []), newProblematique]);
        setCurrentProblematique({
            type: '',
            description: '',
            dateSignalement: new Date().toISOString().split('T')[0]
        });
    };

    const removeProblematique = (index: number) => {
        onInputChange('problematiques', (formData.problematiques || []).filter((_, i) => i !== index));
    };

    const startEditingProblematique = (index: number) => {
        setEditingProblematique(index);
        const item = formData.problematiques?.[index];
        if (item) {
            setCurrentProblematique({
                id: item.id,
                type: item.type,
                description: item.description,
                dateSignalement: formatDateForInput(item.dateSignalement)
            });
        }
    };

    const saveProblematique = () => {
        if (editingProblematique !== null && formData.problematiques) {
            const updated = [...formData.problematiques];
            updated[editingProblematique] = {
                id: currentProblematique.id || Date.now().toString(),
                type: currentProblematique.type,
                description: currentProblematique.description,
                dateSignalement: currentProblematique.dateSignalement
            };
            onInputChange('problematiques', updated);
            setEditingProblematique(null);
            setCurrentProblematique({
                type: '',
                description: '',
                dateSignalement: new Date().toISOString().split('T')[0]
            });
        }
    };

    // Logic - Actions
    const addAction = () => {
        if (!currentAction.date || !currentAction.type) {
            alert("Veuillez remplir la date et le type d'action");
            return;
        }
        const newAction: ActionSuivi = {
            id: Date.now().toString(),
            date: currentAction.date,
            type: currentAction.type,
            description: currentAction.description,
            partenaire: currentAction.partenaire
        };
        onInputChange('actions', [...(formData.actions || []), newAction]);
        setCurrentAction({
            date: new Date().toISOString().split('T')[0],
            type: '',
            description: '',
            partenaire: ''
        });
    };

    const removeAction = (index: number) => {
        onInputChange('actions', (formData.actions || []).filter((_, i) => i !== index));
    };

    const startEditingAction = (index: number) => {
        setEditingAction(index);
        const item = formData.actions?.[index];
        if (item) {
            setCurrentAction({
                id: item.id,
                date: formatDateForInput(item.date),
                type: item.type || '',
                description: item.description || '',
                partenaire: item.partenaire || ''
            });
        }
    };

    const saveAction = () => {
        if (editingAction !== null && formData.actions) {
            const updated = [...formData.actions];
            updated[editingAction] = {
                id: currentAction.id || Date.now().toString(),
                date: currentAction.date,
                type: currentAction.type,
                description: currentAction.description,
                partenaire: currentAction.partenaire
            };
            onInputChange('actions', updated);
            setEditingAction(null);
            setCurrentAction({
                date: new Date().toISOString().split('T')[0],
                type: '',
                description: '',
                partenaire: ''
            });
        }
    };

    const cancelEditing = () => {
        setEditingProblematique(null);
        setEditingAction(null);
        setCurrentProblematique({
            type: '',
            description: '',
            dateSignalement: new Date().toISOString().split('T')[0]
        });
        setCurrentAction({
            date: new Date().toISOString().split('T')[0],
            type: '',
            description: '',
            partenaire: ''
        });
    };

    const handleCleanData = () => {
        // 1. Clean Problematiques (Deduplicate)
        const existingProbs = formData.problematiques || [];
        const uniqueProbs = existingProbs.filter((p, index, self) =>
            index === self.findIndex((t) => (t.type === p.type))
        );

        // 2. Clean Actions
        const existingActions = formData.actions || [];
        const cleanedActions = existingActions.map(a => {
            const typeStr = a.type || '';
            const isoMatch = typeStr.match(/(\d{4}-\d{2}-\d{2})(T[\d:.]*Z?)?/);
            if (isoMatch) {
                return { ...a, type: typeStr.replace(isoMatch[0], '').trim(), date: isoMatch[1] };
            }
            return a;
        });

        const uniqueActions = cleanedActions.filter((a, index, self) =>
            index === self.findIndex((t) => (t.type === a.type && t.date === a.date))
        );

        const removedCount = (existingProbs.length - uniqueProbs.length) + (existingActions.length - uniqueActions.length);

        if (removedCount > 0 || existingActions.length !== cleanedActions.length) {
            if (confirm(`J'ai trouvé ${removedCount} doublons/erreurs.\n\nVoulez-vous nettoyer les listes ?`)) {
                onInputChange('problematiques', uniqueProbs);
                onInputChange('actions', uniqueActions);
            }
        } else {
            alert("Tout semble correct ! Aucun doublon trouvé.");
        }
    };

    return {
        editingProblematique,
        editingAction,
        currentProblematique,
        currentAction,
        setCurrentProblematique,
        setCurrentAction,
        displayDate,
        addProblematique,
        removeProblematique,
        startEditingProblematique,
        saveProblematique,
        addAction,
        removeAction,
        startEditingAction,
        saveAction,
        cancelEditing,
        handleCleanData
    };
};

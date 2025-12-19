/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback } from 'react';
import { Problematique, ActionSuivi, UserFormData } from '@/types';

interface UseProblematiquesActionsProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  disabled?: boolean;
}

export const useProblematiquesActions = ({
  formData,
  setFormData,
  disabled
}: UseProblematiquesActionsProps) => {
  // États pour l'édition
  const [editingProblematique, setEditingProblematique] = useState<number | null>(null);
  const [editingAction, setEditingAction] = useState<number | null>(null);

  // États temporaires pour l'ajout/édition
  const [currentProblematique, setCurrentProblematique] = useState<{
    id?: string;
    type: string;
    description: string;
    dateSignalement: string;
  }>({
    type: '',
    description: '',
    dateSignalement: new Date().toISOString(),
  });

  const [currentAction, setCurrentAction] = useState<{
    id?: string;
    date: string;
    type: string;
    description: string;
    partenaire: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    partenaire: ''
  });

  // Fonction utilitaire pour formater les dates
  const formatDateForInput = (dateStr: string | Date | null): string => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') {
      return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    }
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // Gestion des problématiques
  const addProblematique = useCallback(() => {
    if (!currentProblematique.type) {
      alert("Veuillez sélectionner un type de problématique");
      return;
    }

    const newProblematique: Problematique = {
      ...currentProblematique,
      dateSignalement: currentProblematique.dateSignalement || new Date().toISOString().split('T')[0],
    };

    setFormData(prev => ({
      ...prev,
      problematiques: [...(prev.problematiques || []), newProblematique]
    }));

    setCurrentProblematique({
      type: '',
      description: '',
      dateSignalement: new Date().toISOString(),
    });
  }, [currentProblematique, setFormData]);

  const removeProblematique = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      problematiques: prev.problematiques?.filter((_, i) => i !== index) || []
    }));
  }, [setFormData]);

  const startEditingProblematique = useCallback((index: number) => {
    setEditingProblematique(index);
    const problematiqueToEdit = formData.problematiques[index];
    setCurrentProblematique({
      id: problematiqueToEdit.id,
      type: problematiqueToEdit.type || '',
      description: problematiqueToEdit.description || '',
      dateSignalement: problematiqueToEdit.dateSignalement || new Date().toISOString().split('T')[0]
    });
  }, [formData.problematiques]);

  const saveProblematique = useCallback(() => {
    if (editingProblematique !== null) {
      const updatedProblematiques = [...formData.problematiques];
      updatedProblematiques[editingProblematique] = {
        ...currentProblematique,
        dateSignalement: currentProblematique.dateSignalement
      };
      setFormData(prev => ({ ...prev, problematiques: updatedProblematiques }));
      setEditingProblematique(null);
      setCurrentProblematique({
        type: '',
        description: '',
        dateSignalement: new Date().toISOString(),
      });
    }
  }, [editingProblematique, currentProblematique, formData.problematiques, setFormData]);

  // Gestion des actions
  const addAction = useCallback(() => {
    if (!currentAction.date) {
      alert("Veuillez sélectionner une date");
      return;
    }
    if (!currentAction.type) {
      alert("Veuillez sélectionner un type d'action");
      return;
    }

    const newAction: ActionSuivi = {
      id: Date.now().toString(),
      date: currentAction.date,
      type: currentAction.type,
      description: currentAction.description,
      partenaire: currentAction.partenaire
    };

    setFormData(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction]
    }));

    setCurrentAction({
      date: new Date().toISOString().split('T')[0],
      type: '',
      description: '',
      partenaire: ''
    });
  }, [currentAction, setFormData]);

  const removeAction = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  }, [setFormData]);

  const startEditingAction = useCallback((index: number) => {
    setEditingAction(index);
    const actionToEdit = formData.actions[index];
    setCurrentAction({
      id: actionToEdit.id,
      date: formatDateForInput(actionToEdit.date || null),
      type: actionToEdit.type || '',
      description: actionToEdit.description || '',
      partenaire: actionToEdit.partenaire || ''
    });
  }, [formData.actions]);

  const saveAction = useCallback(() => {
    if (editingAction !== null) {
      const updatedActions = [...formData.actions];
      updatedActions[editingAction] = {
        ...currentAction,
        date: currentAction.date || new Date().toISOString().split('T')[0],
        type: currentAction.type || '',
        description: currentAction.description || '',
        partenaire: currentAction.partenaire || ''
      };
      setFormData(prev => ({ ...prev, actions: updatedActions }));
      setEditingAction(null);
      setCurrentAction({
        date: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        partenaire: ''
      });
    }
  }, [editingAction, currentAction, formData.actions, setFormData]);

  const cancelEditing = useCallback(() => {
    setEditingProblematique(null);
    setEditingAction(null);
    setCurrentProblematique({
      type: '',
      description: '',
      dateSignalement: new Date().toISOString()
    });
    setCurrentAction({
      date: new Date().toISOString().split('T')[0],
      type: '',
      description: '',
      partenaire: ''
    });
  }, []);

  // Extraction des actions depuis les notes (logique préservée)
  const deduceActionType = useCallback((action: any): string => {
    if (action.type && action.type.trim() !== '') return action.type;
    const desc = (action.description || '').toLowerCase();
    if (/\b(rdv|rendez[- ]?vous)\b/.test(desc)) return 'RDV';
    if (/\bappel(s)?\b/.test(desc)) return 'Appel';
    if (/\brelance(s)?\b/.test(desc)) return 'Relance';
    if (/\bmail(s)?\b/.test(desc)) return 'Mail';
    if (/\bsuivi(s)?\b/.test(desc)) return 'Suivi';
    if (/\bsms\b/.test(desc)) return 'SMS';
    if (/\bvisite(s)?\b/.test(desc)) return 'Visite';
    if (/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/.test(desc)) return 'Action datée';
    return 'Autre';
  }, []);

  const extractActionsFromNotes = useCallback((notes: string): ActionSuivi[] => {
    if (!notes) return [];
    const lines = notes.split(/\n|\r|\r\n|[.;•\u2028\u2029]/).map(l => l.trim()).filter(Boolean);
    const actions: ActionSuivi[] = [];

    for (const line of lines) {
      if (!line) continue;
      const dateMatch = line.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}-\d{2}-\d{2})/);
      const date: string | null = dateMatch ? String(dateMatch[0]) : null;
      let type = deduceActionType({ description: line });

      if (date && line.startsWith(date)) {
        const afterDate = line.slice(date.length).trim();
        if (afterDate) {
          const typeAfter = deduceActionType({ description: afterDate });
          if (typeAfter && typeAfter !== 'Autre') type = typeAfter;
        }
      }

      let description = line;
      if (date) description = description.replace(date, '').replace(/(le|du|au|:)/i, '').trim();

      if (type !== 'Autre' || date || /envoy[ée]/i.test(line) || /mail|email|courriel/i.test(line)) {
        actions.push({ date: date ?? null, type, description });
      }
    }
    return actions;
  }, [deduceActionType]);

  return {
    // Data arrays
    problematiques: formData.problematiques || [],
    actions: formData.actions || [],

    // États d'édition
    editingProblematique,
    editingAction,
    currentProblematique,
    setCurrentProblematique,
    currentAction,
    setCurrentAction,

    // Fonctions problématiques
    addProblematique,
    removeProblematique,
    startEditingProblematique,
    saveProblematique,
    updateProblematique: (index: number, field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        problematiques: prev.problematiques?.map((p, i) =>
          i === index ? { ...p, [field]: value } : p
        ) || []
      }));
    },

    // Fonctions actions
    addAction,
    removeAction,
    startEditingAction,
    saveAction,
    updateAction: (index: number, field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        actions: prev.actions?.map((a, i) =>
          i === index ? { ...a, [field]: value } : a
        ) || []
      }));
    },

    // Fonctions communes
    cancelEditing,
    extractActionsFromNotes,
    formatDateForInput
  };
};

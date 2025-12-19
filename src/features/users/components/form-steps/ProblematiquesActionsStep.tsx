/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useMemo, useCallback } from 'react';
import { UserFormData, Problematique, ActionSuivi } from '@/types/user';
import { FormErrors, displayError } from '@/types';
import { FieldWrapper } from '@/components/shared/FieldWrapper';
import { TextInput } from '@/components/shared/TextInput';
import { SelectInput } from '@/components/shared/SelectInput';
import { ComboBox } from '@/components/shared/ComboBox';
import { TextAreaInput } from '@/components/shared/TextAreaInput';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Types pour les états temporaires
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
  partenaire: string; // Garder string simple
}

interface ProblematiquesActionsStepProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  disabled?: boolean;
  errors?: any;
}

export const ProblematiquesActionsStep: React.FC<ProblematiquesActionsStepProps> = ({
  formData,
  onInputChange,
  disabled = false,
  errors = {}
}) => {
  // Utiliser les constantes au lieu des chaînes de caractères
  const { options: problematiquesOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);
  const { options: actionsOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.ACTIONS);
  const { options: partenairesOptions, loading, error } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PARTENAIRES, 30000);

  // AJOUTER CES LOGS DE DÉBOGAGE
  // Supprimez ces lignes (autour des lignes 47-51 et 70) :
  // console.log('🔍 ProblematiquesActionsStep - État partenaires:');
  // console.log('- Loading:', partenairesLoading);
  // console.log('- Error:', partenairesError);
  // console.log('- Options count:', partenairesOptions.length);
  // console.log('- Options:', partenairesOptions);
  // console.log('📋 Options finales pour ComboBox:', optionsPartenaire);

  // Convertir les options pour les SelectInput
  const optionsTypeProblematique = [
    { value: '', label: 'Sélectionner un type...' },
    ...problematiquesOptions.map(opt => ({ value: opt.value, label: opt.label }))
  ];

  const optionsTypeAction = [
    { value: '', label: 'Sélectionner un type...' },
    ...actionsOptions.map(opt => ({ value: opt.value, label: opt.label }))
  ];

  const optionsPartenaire = [
    { value: '', label: 'Sélectionner un partenaire...' },
    ...partenairesOptions.map(opt => ({ value: opt.value, label: opt.label }))
  ];

  // LOG FINAL
  console.log('📋 Options finales pour ComboBox:', optionsPartenaire);

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

  // Fonctions utilitaires pour les dates
  const parseFrenchDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    // Si c'est déjà au format ISO, le retourner tel quel
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Essayer de parser une date française (dd/mm/yyyy ou dd.mm.yyyy ou dd-mm-yyyy)
    const frenchDateMatch = dateStr.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
    if (frenchDateMatch) {
      let [, day, month, year] = frenchDateMatch;

      // Convertir l'année sur 2 chiffres en année complète
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        year = String(currentCentury + parseInt(year));
      }

      // Formater au format ISO (YYYY-MM-DD)
      const isoDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Vérifier que la date est valide
      const testDate = new Date(isoDate);
      if (!isNaN(testDate.getTime())) {
        return isoDate;
      }
    }

    // Si aucun format reconnu, retourner la date actuelle
    return new Date().toISOString().split('T')[0];
  };

  const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return '';

    if (typeof date === 'string') {
      // Si c'est déjà au format ISO, le retourner tel quel
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // Sinon, essayer de le parser
      return parseFrenchDate(date);
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    // Fallback
    return new Date().toISOString().split('T')[0];
  };

  const displayDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';

    try {
      if (typeof date === 'string') {
        // Convertir en format ISO si nécessaire
        const isoDate = parseFrenchDate(date);
        const parsedDate = new Date(isoDate);

        // Vérifier que la date est valide
        if (isNaN(parsedDate.getTime())) {
          return date; // Retourner la chaîne originale si non parsable
        }

        return parsedDate.toLocaleDateString('fr-FR');
      }

      return date.toLocaleDateString('fr-FR');
    } catch {
      return String(date);
    }
  };

  // Fonctions de gestion des problématiques
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

    const updatedProblematiques = [...(formData.problematiques || []), newProblematique];
    onInputChange('problematiques', updatedProblematiques);

    // Réinitialiser le formulaire
    setCurrentProblematique({
      type: '',
      description: '',
      dateSignalement: new Date().toISOString().split('T')[0]
    });
  };

  const removeProblematique = (index: number) => {
    const updatedProblematiques = (formData.problematiques || []).filter((_, i) => i !== index);
    onInputChange('problematiques', updatedProblematiques);
  };

  const startEditingProblematique = (index: number) => {
    setEditingProblematique(index);
    const problematiqueToEdit = formData.problematiques?.[index];
    if (problematiqueToEdit) {
      setCurrentProblematique({
        id: problematiqueToEdit.id,
        type: problematiqueToEdit.type,
        description: problematiqueToEdit.description,
        dateSignalement: formatDateForInput(problematiqueToEdit.dateSignalement)
      });
    }
  };

  const saveProblematique = () => {
    if (editingProblematique !== null && formData.problematiques) {
      const updatedProblematiques = [...formData.problematiques];
      updatedProblematiques[editingProblematique] = {
        id: currentProblematique.id || Date.now().toString(),
        type: currentProblematique.type,
        description: currentProblematique.description,
        dateSignalement: currentProblematique.dateSignalement
      };
      onInputChange('problematiques', updatedProblematiques);

      // Réinitialiser
      setEditingProblematique(null);
      setCurrentProblematique({
        type: '',
        description: '',
        dateSignalement: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Fonctions de gestion des actions
  const addAction = () => {
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

    const updatedActions = [...(formData.actions || []), newAction];
    onInputChange('actions', updatedActions);

    // Réinitialiser le formulaire
    setCurrentAction({
      date: new Date().toISOString().split('T')[0],
      type: '',
      description: '',
      partenaire: ''
    });
  };

  const removeAction = (index: number) => {
    const updatedActions = (formData.actions || []).filter((_, i) => i !== index);
    onInputChange('actions', updatedActions);
  };

  const startEditingAction = (index: number) => {
    setEditingAction(index);
    const actionToEdit = formData.actions?.[index];
    if (actionToEdit) {
      setCurrentAction({
        id: actionToEdit.id,
        date: formatDateForInput(actionToEdit.date),
        type: actionToEdit.type || '', // Valeur par défaut si null/undefined
        description: actionToEdit.description || '', // Valeur par défaut si null/undefined
        partenaire: actionToEdit.partenaire || '' // Valeur par défaut si null/undefined
      });
    }
  };

  const saveAction = () => {
    if (editingAction !== null && formData.actions) {
      const updatedActions = [...formData.actions];
      updatedActions[editingAction] = {
        id: currentAction.id || Date.now().toString(),
        date: currentAction.date,
        type: currentAction.type,
        description: currentAction.description,
        partenaire: currentAction.partenaire
      };
      onInputChange('actions', updatedActions);

      // Réinitialiser
      setEditingAction(null);
      setCurrentAction({
        date: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        partenaire: ''
      });
    }
  };

  // Fonction pour annuler l'édition
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

  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">Problématiques et Actions de suivi</h3>
            <p className="text-sm text-indigo-700">Gestion des problématiques identifiées et actions mises en place</p>
          </div>
        </div>
      </div>

      {/* Section Problématiques */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Problématiques identifiées
        </h4>

        {/* Formulaire d'ajout/édition de problématique */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <FieldWrapper label="Type de problématique" required>
            <SelectInput
              value={currentProblematique.type}
              onChange={(value) => setCurrentProblematique(prev => ({ ...prev, type: value }))}
              options={optionsTypeProblematique}
              disabled={disabled}
            />
          </FieldWrapper>

          <FieldWrapper label="Date de signalement" required>
            <TextInput
              type="date"
              value={currentProblematique.dateSignalement}
              onChange={(value) => setCurrentProblematique(prev => ({ ...prev, dateSignalement: value }))}
              disabled={disabled}
            />
          </FieldWrapper>

          <FieldWrapper label="Description">
            <TextAreaInput
              value={currentProblematique.description}
              onChange={(value) => setCurrentProblematique(prev => ({ ...prev, description: value }))}
              disabled={disabled}
              rows={2}
            />
          </FieldWrapper>

          <div className="md:col-span-3 flex gap-2">
            {editingProblematique !== null ? (
              <>
                <button
                  type="button"
                  onClick={saveProblematique}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={disabled}
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={addProblematique}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={disabled}
              >
                Ajouter la problématique
              </button>
            )}
          </div>
        </div>

        {/* Liste des problématiques */}
        {formData.problematiques && formData.problematiques.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Problématiques enregistrées :</h5>
            {formData.problematiques.map((problematique, index) => (
              <div key={problematique.id || index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-1">
                  <div className="font-medium text-red-900">{problematique.type}</div>
                  <div className="text-sm text-red-700">
                    Signalé le {displayDate(problematique.dateSignalement)}
                  </div>
                  {problematique.description && (
                    <div className="text-sm text-gray-600 mt-1">{problematique.description}</div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => startEditingProblematique(index)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    disabled={disabled}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProblematique(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                    disabled={disabled}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Actions de suivi */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Actions de suivi
          </div>

          <button
            type="button"
            onClick={() => {
              // 1. Clean Problematiques (Deduplicate)
              const existingProbs = formData.problematiques || [];
              const uniqueProbs = existingProbs.filter((p, index, self) =>
                index === self.findIndex((t) => (
                  t.type === p.type // Keep first occurrence of each type
                ))
              );

              // 2. Clean Actions (Fix formats + Deduplicate)
              const existingActions = formData.actions || [];
              const cleanedActions = existingActions.map(a => {
                // Fix "Rendez-vous2025-..." AND "Email2025-12-07T00..." patterns
                // Safe check for type existence
                const typeStr = a.type || '';
                const isoMatch = typeStr.match(/(\d{4}-\d{2}-\d{2})(T[\d:.]*Z?)?/);

                if (isoMatch) {
                  const datePart = isoMatch[1]; // Always the YYYY-MM-DD part
                  const fullMatch = isoMatch[0]; // The whole string to remove (e.g. 2025-12-07T00...)

                  return {
                    ...a,
                    type: typeStr.replace(fullMatch, '').trim(), // Remove FULL match from title
                    date: datePart // Set date field
                  };
                }
                return a;
              });

              const uniqueActions = cleanedActions.filter((a, index, self) =>
                index === self.findIndex((t) => (
                  t.type === a.type && t.date === a.date
                ))
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
            }}
            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            Nettoyer
          </button>
        </h4>

        {/* Formulaire d'ajout/édition d'action */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <FieldWrapper label="Date" required>
            <TextInput
              type="date"
              value={currentAction.date}
              onChange={(value) => setCurrentAction(prev => ({ ...prev, date: value }))}
              disabled={disabled}
            />
          </FieldWrapper>

          <FieldWrapper label="Type d'action" required>
            <SelectInput
              value={currentAction.type}
              onChange={(value) => setCurrentAction(prev => ({ ...prev, type: value }))}
              options={optionsTypeAction}
              disabled={disabled}
            />
          </FieldWrapper>

          <FieldWrapper label="Partenaire">
            <div className="flex items-center gap-2">
              <ComboBox
                value={currentAction.partenaire || ''} // S'assurer que la valeur n'est jamais null
                onChange={(value) => setCurrentAction(prev => ({ ...prev, partenaire: value }))}
                disabled={disabled}
                options={optionsPartenaire}
                placeholder="Sélectionner ou ajouter un partenaire..."
                allowCustom={true} // Changé de allowCustomValue à allowCustom
                className="flex-1"
              />
              {currentAction.partenaire && currentAction.partenaire.trim() && (
                <button
                  type="button"
                  onClick={() => setCurrentAction(prev => ({ ...prev, partenaire: '' }))}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={disabled}
                  title="Effacer"
                >
                  ✕
                </button>
              )}
            </div>
          </FieldWrapper>

          <FieldWrapper label="Description">
            <TextAreaInput
              value={currentAction.description}
              onChange={(value) => setCurrentAction(prev => ({ ...prev, description: value }))}
              disabled={disabled}
              rows={2}
              placeholder="Description de l'action"
            />
          </FieldWrapper>

          <div className="lg:col-span-4 flex gap-2">
            {editingAction !== null ? (
              <>
                <button
                  type="button"
                  onClick={saveAction}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={disabled}
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={addAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={disabled}
              >
                Ajouter l&apos;action
              </button>
            )}
          </div>
        </div>

        {/* Liste des actions */}
        {formData.actions && formData.actions.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Actions enregistrées :</h5>
            {formData.actions.map((action, index) => (
              <div key={action.id || index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-900">{action.type}</span>
                    <span className="text-sm text-blue-700">le {displayDate(action.date)}</span>
                    {action.partenaire && (
                      <span className="text-sm text-gray-600">avec {action.partenaire}</span>
                    )}
                  </div>
                  {action.description && (
                    <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => startEditingAction(index)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    disabled={disabled}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                    disabled={disabled}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




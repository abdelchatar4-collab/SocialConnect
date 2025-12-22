/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { useProblematiquesActions } from '../../hooks/useProblematiquesActions';

// Sub-components
import { ProblematiquesSection } from './ProblematiquesSection';
import { ActionsSection } from './ActionsSection';

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
  // Logic & State
  const {
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
  } = useProblematiquesActions({ formData, onInputChange });

  // Options from API
  const { options: problematiquesOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);
  const { options: actionsOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.ACTIONS);
  const { options: partenairesOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PARTENAIRES, 30000);

  // Formatting options for Selects
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
      <ProblematiquesSection
        problematiques={formData.problematiques || []}
        currentProblematique={currentProblematique}
        setCurrentProblematique={setCurrentProblematique}
        optionsTypeProblematique={optionsTypeProblematique}
        editingProblematique={editingProblematique}
        addProblematique={addProblematique}
        saveProblematique={saveProblematique}
        removeProblematique={removeProblematique}
        startEditingProblematique={startEditingProblematique}
        cancelEditing={cancelEditing}
        displayDate={displayDate}
        disabled={disabled}
      />

      {/* Section Actions de suivi */}
      <ActionsSection
        actions={formData.actions || []}
        currentAction={currentAction}
        setCurrentAction={setCurrentAction}
        optionsTypeAction={optionsTypeAction}
        optionsPartenaire={optionsPartenaire}
        editingAction={editingAction}
        addAction={addAction}
        saveAction={saveAction}
        removeAction={removeAction}
        startEditingAction={startEditingAction}
        cancelEditing={cancelEditing}
        handleCleanData={handleCleanData}
        displayDate={displayDate}
        disabled={disabled}
      />
    </div>
  );
};

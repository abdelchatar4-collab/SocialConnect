/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de the Licence Publique Générale GNU telle que publiée par the Free Software Foundation, soit the version 3 de the licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même the garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir the Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { useNotesAI } from '../../hooks/useNotesAI';
import { useFormSectionVisibility } from '../../hooks/useFormSectionVisibility';

// Sub-components
import { NotesEditorSection } from './NotesEditorSection';
import { NotesAIAnalysis } from './NotesAIAnalysis';
import { NotesDataList } from './NotesDataList';

interface NotesStepProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  disabled?: boolean;
}

export const NotesStep: React.FC<NotesStepProps> = ({
  formData,
  onInputChange,
  disabled
}) => {
  const { isSectionVisible } = useFormSectionVisibility();

  // If notes section is disabled, don't render anything
  if (!isSectionVisible('notes')) {
    return null;
  }

  // Logic: AI and Data Cleaning
  const {
    isAiAvailable,
    isAnalyzing,
    analysisResult,
    analysisError,
    isReformulating,
    reformulatedText,
    reformulationField,
    handleLisser,
    acceptReformulation,
    rejectReformulation,
    abortReformulation,
    handleAnalyze,
    abortAnalysis,
    toggleValidation,
    selectAllItems,
    deselectAllItems,
    applyValidatedItems,
    handleCleanData,
    setAnalysisResult
  } = useNotesAI({
    formData,
    onInputChange
  });

  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Notes & Bilan Social</h3>
              <p className="text-sm text-amber-700">Informations complémentaires et observations</p>
            </div>
          </div>

          {/* AI Status Indicator */}
          {isAiAvailable && (
            <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              IA Active
            </div>
          )}
        </div>
      </div>

      {/* Section des Éditeurs (Bilan, Notes, Important) + Lissage AI */}
      <NotesEditorSection
        formData={formData}
        onInputChange={onInputChange}
        disabled={disabled}
        isAiAvailable={isAiAvailable}
        isReformulating={isReformulating}
        reformulatedText={reformulatedText}
        reformulationField={reformulationField}
        handleLisser={handleLisser}
        acceptReformulation={acceptReformulation}
        rejectReformulation={rejectReformulation}
        abortReformulation={abortReformulation}
        handleCleanData={handleCleanData}
      />

      {/* Section Analyse et Extraction IA */}
      {isAiAvailable && (
        <NotesAIAnalysis
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          analysisError={analysisError}
          handleAnalyze={handleAnalyze}
          abortAnalysis={abortAnalysis}
          toggleValidation={toggleValidation}
          selectAllItems={selectAllItems}
          deselectAllItems={deselectAllItems}
          applyValidatedItems={applyValidatedItems}
          setAnalysisResult={setAnalysisResult}
          disabled={disabled}
        />
      )}

      {/* Liste des données enregistrées (avec option de suppression) */}
      <NotesDataList
        formData={formData}
        onInputChange={onInputChange}
      />
    </div>
  );
};

export default NotesStep;

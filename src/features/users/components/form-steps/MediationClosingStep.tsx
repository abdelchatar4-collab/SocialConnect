import React from 'react';
import { UserFormData } from '@/types/user';
import { ActionsSection } from './ActionsSection';
import { NotesEditorSection } from './NotesEditorSection';
import { NotesAIAnalysis } from './NotesAIAnalysis';
import { NotesDataList } from './NotesDataList';
import { useProblematiquesActions } from '../../hooks/useProblematiquesActions';
import { useNotesAI } from '../../hooks/useNotesAI';

interface MediationClosingStepProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
}

export const MediationClosingStep: React.FC<MediationClosingStepProps> = ({
    formData,
    onInputChange,
    disabled = false
}) => {
    const {
        editingAction,
        currentAction,
        setCurrentAction,
        displayDate,
        addAction,
        removeAction,
        startEditingAction,
        saveAction,
        cancelEditing,
        handleCleanData
    } = useProblematiquesActions({ formData, onInputChange });

    // AI functionality for notes (full features)
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
        setAnalysisResult
    } = useNotesAI({ formData, onInputChange });

    return (
        <div className="space-y-8">
            {/* Section 1: Actions de suivi (Issues) */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Issues du dossier
                </h3>

                <ActionsSection
                    actions={formData.actions || []}
                    currentAction={currentAction}
                    setCurrentAction={setCurrentAction}
                    optionsTypeAction={[]}
                    optionsPartenaire={[]}
                    editingAction={editingAction}
                    addAction={addAction}
                    saveAction={saveAction}
                    removeAction={removeAction}
                    startEditingAction={startEditingAction}
                    cancelEditing={cancelEditing}
                    handleCleanData={handleCleanData}
                    displayDate={displayDate}
                    disabled={disabled}
                    actionLabel="Issues"
                />
            </div>

            {/* Section 2: Notes avec IA (Lisser) */}
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

            {/* Section 3: Analyse IA (extraction automatique) */}
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

            {/* Section 4: Récapitulatif des données */}
            <NotesDataList
                formData={formData}
                onInputChange={onInputChange}
            />
        </div>
    );
};

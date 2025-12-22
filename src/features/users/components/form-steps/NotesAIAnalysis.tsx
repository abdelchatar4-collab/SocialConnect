/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { SparklesIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnalysisResult } from '../../hooks/useNotesAI';

interface NotesAIAnalysisProps {
    isAnalyzing: boolean;
    analysisResult: AnalysisResult | null;
    analysisError: string | null;
    handleAnalyze: () => void;
    abortAnalysis: () => void;
    toggleValidation: (category: 'actions' | 'problematiques', index: number) => void;
    selectAllItems: (category: 'actions' | 'problematiques') => void;
    deselectAllItems: (category: 'actions' | 'problematiques') => void;
    applyValidatedItems: () => void;
    setAnalysisResult: (result: any) => void;
    disabled?: boolean;
}

export const NotesAIAnalysis: React.FC<NotesAIAnalysisProps> = ({
    isAnalyzing,
    analysisResult,
    analysisError,
    handleAnalyze,
    abortAnalysis,
    toggleValidation,
    selectAllItems,
    deselectAllItems,
    applyValidatedItems,
    setAnalysisResult,
    disabled
}) => {
    const validatedCount = analysisResult
        ? analysisResult.actions.filter(a => a.validated).length +
        analysisResult.problematiques.filter(p => p.validated).length
        : 0;

    return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-purple-900 flex items-center">
                    <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
                    Extraction IA (optionnel)
                </h4>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={disabled || isAnalyzing}
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isAnalyzing
                                ? 'bg-purple-300 text-white cursor-wait'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                            }`}
                    >
                        {isAnalyzing ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Analyser les notes
                            </>
                        )}
                    </button>
                    {isAnalyzing && (
                        <button
                            type="button"
                            onClick={abortAnalysis}
                            className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                        >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Annuler
                        </button>
                    )}
                </div>
            </div>

            <p className="text-sm text-purple-700 mb-4">
                L&apos;IA peut détecter automatiquement les <strong>Actions</strong> et <strong>Problématiques</strong> mentionnées dans vos notes.
                Cliquez sur les éléments détectés pour les valider avant de les ajouter au dossier.
            </p>

            {/* Error Message */}
            {analysisError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                    {analysisError}
                </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
                <div className="space-y-4 animate-fade-in">
                    {/* Problematiques */}
                    {analysisResult.problematiques.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-semibold text-purple-800">
                                    Problématiques détectées ({analysisResult.problematiques.filter(p => p.validated).length}/{analysisResult.problematiques.length} sélectionnées)
                                </h5>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allSelected = analysisResult.problematiques.every(p => p.validated);
                                        allSelected ? deselectAllItems('problematiques') : selectAllItems('problematiques');
                                    }}
                                    className="text-xs px-2 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                                >
                                    {analysisResult.problematiques.every(p => p.validated) ? '✕ Tout désélectionner' : '✓ Tout sélectionner'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.problematiques.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleValidation('problematiques', index)}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2
                      ${item.validated
                                                ? 'bg-red-100 text-red-800 border-red-400 ring-2 ring-red-200'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                                            }`}
                                    >
                                        {item.validated ? (
                                            <CheckIcon className="w-4 h-4 mr-1 text-red-600" />
                                        ) : (
                                            <span className="w-4 h-4 mr-1 rounded-full border-2 border-gray-300 inline-block"></span>
                                        )}
                                        {item.type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {analysisResult.actions.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-semibold text-purple-800">
                                    Actions détectées ({analysisResult.actions.filter(a => a.validated).length}/{analysisResult.actions.length} sélectionnées)
                                </h5>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allSelected = analysisResult.actions.every(a => a.validated);
                                        allSelected ? deselectAllItems('actions') : selectAllItems('actions');
                                    }}
                                    className="text-xs px-2 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                                >
                                    {analysisResult.actions.every(a => a.validated) ? '✕ Tout désélectionner' : '✓ Tout sélectionner'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.actions.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleValidation('actions', index)}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2
                      ${item.validated
                                                ? 'bg-blue-100 text-blue-800 border-blue-400 ring-2 ring-blue-200'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                            }`}
                                    >
                                        {item.validated ? (
                                            <CheckIcon className="w-4 h-4 mr-1 text-blue-600" />
                                        ) : (
                                            <span className="w-4 h-4 mr-1 rounded-full border-2 border-gray-300 inline-block"></span>
                                        )}
                                        {item.type}
                                        {item.date && !isNaN(new Date(item.date).getTime()) && (
                                            <span className="ml-1 text-xs opacity-70">
                                                ({new Date(item.date).toLocaleDateString('fr-BE')})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results Content handled in parent or here? */}
                    {analysisResult.actions.length === 0 && analysisResult.problematiques.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                            Aucun élément détecté dans les notes. Essayez d&apos;ajouter plus de détails.
                        </p>
                    )}

                    {/* Apply Button */}
                    {(analysisResult.actions.length > 0 || analysisResult.problematiques.length > 0) && (
                        <div className="flex justify-end gap-3 pt-2 border-t border-purple-200">
                            <button
                                type="button"
                                onClick={() => setAnalysisResult(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                <XMarkIcon className="w-4 h-4 inline mr-1" />
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={applyValidatedItems}
                                disabled={validatedCount === 0}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${validatedCount > 0
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <CheckIcon className="w-4 h-4 inline mr-1" />
                                Ajouter {validatedCount} élément{validatedCount > 1 ? 's' : ''} au dossier
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, but SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextAreaInput } from '../shared/TextAreaInput';
import { ArrowPathIcon, CheckIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface NotesEditorSectionProps {
    formData: any;
    onInputChange: (field: string, value: any) => void;
    disabled?: boolean;
    isAiAvailable: boolean;
    isReformulating: boolean;
    reformulatedText: string | null;
    reformulationField: string | null;
    handleLisser: (field: 'remarques' | 'notesGenerales') => void;
    acceptReformulation: () => void;
    rejectReformulation: () => void;
    abortReformulation: () => void;
    handleCleanData: () => void;
}

export const NotesEditorSection: React.FC<NotesEditorSectionProps> = ({
    formData,
    onInputChange,
    disabled,
    isAiAvailable,
    isReformulating,
    reformulatedText,
    reformulationField,
    handleLisser,
    acceptReformulation,
    rejectReformulation,
    abortReformulation,
    handleCleanData
}) => {
    return (
        <div className="space-y-6">
            {/* Section Bilan social */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                        </svg>
                        Bilan social
                    </span>

                    <div className="flex gap-2">
                        {/* CLEANUP BUTTON */}
                        <button
                            type="button"
                            onClick={handleCleanData}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Supprimer les doublons et corriger les dates"
                        >
                            <ArrowPathIcon className="w-3 h-3 mr-1" />
                            Nettoyer
                        </button>

                        {/* Lisser Button */}
                        {isAiAvailable && formData.remarques && formData.remarques.trim() && (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleLisser('remarques')}
                                    disabled={disabled || isReformulating}
                                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all
                    ${isReformulating && reformulationField === 'remarques'
                                            ? 'bg-amber-300 text-white cursor-wait'
                                            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                                        }`}
                                >
                                    {isReformulating && reformulationField === 'remarques' ? (
                                        <>
                                            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                                            Lissage...
                                        </>
                                    ) : (
                                        <>
                                            <PencilSquareIcon className="w-3 h-3 mr-1" />
                                            ✨ Lisser
                                        </>
                                    )}
                                </button>
                                {isReformulating && reformulationField === 'remarques' && (
                                    <button
                                        type="button"
                                        onClick={abortReformulation}
                                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </h4>
                <FieldWrapper htmlFor="remarques" label="Bilan social">
                    <TextAreaInput
                        id="remarques"
                        value={formData.remarques || ''}
                        onChange={(value) => onInputChange('remarques', value)}
                        disabled={disabled}
                        placeholder="Bilan social de l'usager..."
                        rows={4}
                    />
                </FieldWrapper>

                {/* Reformulation Preview for Remarques */}
                {reformulatedText && reformulationField === 'remarques' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg animate-fade-in">
                        <h5 className="text-sm font-semibold text-amber-800 mb-2 flex items-center">
                            <PencilSquareIcon className="w-4 h-4 mr-2" />
                            Proposition de reformulation
                        </h5>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-amber-200">
                            {reformulatedText}
                        </p>
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                type="button"
                                onClick={rejectReformulation}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                <XMarkIcon className="w-4 h-4 inline mr-1" />
                                Rejeter
                            </button>
                            <button
                                type="button"
                                onClick={acceptReformulation}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckIcon className="w-4 h-4 inline mr-1" />
                                Accepter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Section Notes générales */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Notes de suivi
                    </span>
                    {/* Lisser Button */}
                    {isAiAvailable && formData.notesGenerales && formData.notesGenerales.trim() && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleLisser('notesGenerales')}
                                disabled={disabled || isReformulating}
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all
                  ${isReformulating && reformulationField === 'notesGenerales'
                                        ? 'bg-emerald-300 text-white cursor-wait'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                                    }`}
                            >
                                {isReformulating && reformulationField === 'notesGenerales' ? (
                                    <>
                                        <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                                        Lissage...
                                    </>
                                ) : (
                                    <>
                                        <PencilSquareIcon className="w-3 h-3 mr-1" />
                                        ✨ Lisser
                                    </>
                                )}
                            </button>
                            {isReformulating && reformulationField === 'notesGenerales' && (
                                <button
                                    type="button"
                                    onClick={abortReformulation}
                                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </h4>
                <FieldWrapper htmlFor="notesGenerales" label="Notes générales">
                    <TextAreaInput
                        id="notesGenerales"
                        value={formData.notesGenerales || ''}
                        onChange={(value) => onInputChange('notesGenerales', value)}
                        disabled={disabled}
                        placeholder="Notes de suivi et observations..."
                        rows={4}
                    />
                </FieldWrapper>

                {/* Reformulation Preview for Notes Générales */}
                {reformulatedText && reformulationField === 'notesGenerales' && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-lg animate-fade-in">
                        <h5 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
                            <PencilSquareIcon className="w-4 h-4 mr-2" />
                            Proposition de reformulation
                        </h5>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-emerald-200">
                            {reformulatedText}
                        </p>
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                type="button"
                                onClick={rejectReformulation}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                <XMarkIcon className="w-4 h-4 inline mr-1" />
                                Rejeter
                            </button>
                            <button
                                type="button"
                                onClick={acceptReformulation}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckIcon className="w-4 h-4 inline mr-1" />
                                Accepter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Section Information importante */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                <h4 className="text-md font-semibold text-red-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Information importante
                </h4>
                <FieldWrapper htmlFor="informationImportante" label="Information importante">
                    <TextAreaInput
                        id="informationImportante"
                        value={formData.informationImportante || ''}
                        onChange={(value) => onInputChange('informationImportante', value)}
                        disabled={disabled}
                        placeholder="Informations importantes à retenir..."
                        rows={3}
                    />
                </FieldWrapper>
                <p className="text-sm text-red-600 mt-2 italic">
                    ⚠️ Cette information sera mise en évidence dans le dossier
                </p>
            </div>
        </div>
    );
};

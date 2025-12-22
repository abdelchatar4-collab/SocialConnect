/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { TextAreaInput } from '../shared/TextAreaInput';

interface Problematique {
    id?: string;
    type: string;
    description: string;
    dateSignalement: string;
}

interface ProblematiquesSectionProps {
    problematiques: Problematique[];
    currentProblematique: any;
    setCurrentProblematique: (val: any) => void;
    optionsTypeProblematique: any[];
    editingProblematique: number | null;
    addProblematique: () => void;
    saveProblematique: () => void;
    removeProblematique: (index: number) => void;
    startEditingProblematique: (index: number) => void;
    cancelEditing: () => void;
    displayDate: (date: string) => string;
    disabled?: boolean;
}

export const ProblematiquesSection: React.FC<ProblematiquesSectionProps> = ({
    problematiques,
    currentProblematique,
    setCurrentProblematique,
    optionsTypeProblematique,
    editingProblematique,
    addProblematique,
    saveProblematique,
    removeProblematique,
    startEditingProblematique,
    cancelEditing,
    displayDate,
    disabled
}) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Problématiques identifiées
            </h4>

            {/* Formulaire d'ajout/édition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <FieldWrapper label="Type de problématique" required>
                    <SelectInput
                        value={currentProblematique.type}
                        onChange={(value) => setCurrentProblematique((prev: any) => ({ ...prev, type: value }))}
                        options={optionsTypeProblematique}
                        disabled={disabled}
                    />
                </FieldWrapper>

                <FieldWrapper label="Date de signalement" required>
                    <TextInput
                        type="date"
                        value={currentProblematique.dateSignalement}
                        onChange={(value) => setCurrentProblematique((prev: any) => ({ ...prev, dateSignalement: value }))}
                        disabled={disabled}
                    />
                </FieldWrapper>

                <FieldWrapper label="Description">
                    <TextAreaInput
                        value={currentProblematique.description}
                        onChange={(value) => setCurrentProblematique((prev: any) => ({ ...prev, description: value }))}
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
            {problematiques && problematiques.length > 0 && (
                <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">Problématiques enregistrées :</h5>
                    {problematiques.map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex-1">
                                <div className="font-medium text-red-900">{item.type}</div>
                                <div className="text-sm text-red-700">
                                    Signalé le {displayDate(item.dateSignalement)}
                                </div>
                                {item.description && (
                                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
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
    );
};

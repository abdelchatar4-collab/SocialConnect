/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN UNAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper, TextInput, SelectInput, TextAreaInput, ComboBox, DateInput } from '../shared';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { ActionSuivi } from '@/types/user';

interface ActionsSectionProps {
    actions: ActionSuivi[];
    currentAction: any;
    setCurrentAction: (val: any) => void;
    optionsTypeAction: any[];
    optionsPartenaire: any[];
    editingAction: number | null;
    addAction: () => void;
    saveAction: () => void;
    removeAction: (index: number) => void;
    startEditingAction: (index: number) => void;
    cancelEditing: () => void;
    handleCleanData: () => void;
    displayDate: (date: string | Date | null | undefined) => string;
    disabled?: boolean;
    // Label personnalisé pour médiation locale ("Issues" au lieu d'"Actions")
    actionLabel?: string;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
    actions,
    currentAction,
    setCurrentAction,
    optionsTypeAction,
    optionsPartenaire,
    editingAction,
    addAction,
    saveAction,
    removeAction,
    startEditingAction,
    cancelEditing,
    handleCleanData,
    displayDate,
    disabled,
    actionLabel = 'Actions' // Par défaut "Actions", peut être "Issues" pour médiation
}) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {actionLabel} de suivi
                </div>

                <button
                    type="button"
                    onClick={handleCleanData}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                    <ArrowPathIcon className="w-3 h-3 mr-1" />
                    Nettoyer
                </button>
            </h4>

            {/* Formulaire d'ajout/édition d'action */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <FieldWrapper label="Date" required>
                    <DateInput
                        id="actionDate"
                        value={currentAction.date}
                        onChange={(value) => setCurrentAction((prev: any) => ({ ...prev, date: value }))}
                        disabled={disabled}
                    />
                </FieldWrapper>

                <FieldWrapper label="Type d'action" required>
                    <SelectInput
                        value={currentAction.type}
                        onChange={(value) => setCurrentAction((prev: any) => ({ ...prev, type: value }))}
                        options={optionsTypeAction}
                        disabled={disabled}
                    />
                </FieldWrapper>

                <FieldWrapper label="Partenaire">
                    <div className="flex items-center gap-2">
                        <ComboBox
                            value={currentAction.partenaire || ''}
                            onChange={(value) => setCurrentAction((prev: any) => ({ ...prev, partenaire: value }))}
                            disabled={disabled}
                            options={optionsPartenaire}
                            placeholder="Sélectionner ou ajouter un partenaire..."
                            allowCustom={true}
                            className="flex-1"
                        />
                        {currentAction.partenaire && currentAction.partenaire.trim() && (
                            <button
                                type="button"
                                onClick={() => setCurrentAction((prev: any) => ({ ...prev, partenaire: '' }))}
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
                        onChange={(value) => setCurrentAction((prev: any) => ({ ...prev, description: value }))}
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
            {actions && actions.length > 0 && (
                <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">{actionLabel} enregistrées :</h5>
                    {actions.map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-blue-900">{item.type}</span>
                                    <span className="text-sm text-blue-700">le {displayDate(item.date)}</span>
                                    {item.partenaire && (
                                        <span className="text-sm text-gray-600">avec {item.partenaire}</span>
                                    )}
                                </div>
                                {item.description && (
                                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
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
    );
};

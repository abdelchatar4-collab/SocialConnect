/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { UserFormData } from '@/types/user';

interface NotesDataListProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
}

export const NotesDataList: React.FC<NotesDataListProps> = ({
    formData,
    onInputChange
}) => {
    const hasData = ((formData.problematiques && formData.problematiques.length > 0) || (formData.actions && formData.actions.length > 0));

    if (!hasData) return null;

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Données actuellement enregistrées
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Enregistrés - Problématiques */}
                {formData.problematiques && formData.problematiques.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <h6 className="text-xs font-bold text-red-800 uppercase mb-2">Problématiques ({formData.problematiques.length})</h6>
                        <ul className="space-y-1">
                            {formData.problematiques.map((p, idx) => (
                                <li key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-red-100">
                                    <span className="text-gray-800 truncate flex-1 mr-2" title={p.type || ''}>{p.type}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newProbs = [...(formData.problematiques || [])];
                                            newProbs.splice(idx, 1);
                                            onInputChange('problematiques', newProbs);
                                        }}
                                        className="text-red-400 hover:text-red-600 p-1"
                                        title="Supprimer"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Enregistrés - Actions */}
                {formData.actions && formData.actions.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <h6 className="text-xs font-bold text-blue-800 uppercase mb-2">Actions ({formData.actions.length})</h6>
                        <ul className="space-y-1">
                            {formData.actions.map((a, idx) => (
                                <li key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-blue-100">
                                    <div className="flex-1 min-w-0 mr-2">
                                        <div className="font-medium text-gray-800 truncate" title={a.type || ''}>{a.type}</div>
                                        {a.date && <div className="text-gray-500 text-[10px]">{new Date(a.date).toLocaleDateString('fr-BE')}</div>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newActions = [...(formData.actions || [])];
                                            newActions.splice(idx, 1);
                                            onInputChange('actions', newActions);
                                        }}
                                        className="text-red-400 hover:text-red-600 p-1"
                                        title="Supprimer"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

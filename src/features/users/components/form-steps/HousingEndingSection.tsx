/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { LisserButton } from '@/components/ai/LisserButton';
import { UserFormData } from '@/types/user';

interface HousingEndingSectionProps {
    logementDetails: any;
    optionsDureePreavis: Array<{ value: string; label: string }>;
    onNestedInputChange: (parentField: keyof UserFormData, childField: string, value: any) => void;
    isAiAvailable: boolean;
    disabled?: boolean;
}

export const HousingEndingSection: React.FC<HousingEndingSectionProps> = ({
    logementDetails,
    optionsDureePreavis,
    onNestedInputChange,
    isAiAvailable,
    disabled
}) => {
    return (
        <>
            {/* Section fin de contrat */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 mb-6">
                <h4 className="text-md font-semibold text-amber-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Fin de contrat / Déménagement
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper htmlFor="datePreavis" label="Date du préavis">
                        <input
                            type="date"
                            id="datePreavis"
                            value={logementDetails.datePreavis || ''}
                            onChange={e => onNestedInputChange('logementDetails', 'datePreavis', e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                    </FieldWrapper>

                    <FieldWrapper htmlFor="dureePreavis" label="Durée du préavis">
                        <SelectInput
                            id="dureePreavis"
                            value={logementDetails.dureePreavis || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'dureePreavis', value)}
                            disabled={disabled}
                            options={[
                                { value: '', label: '' },
                                ...optionsDureePreavis
                            ]}
                        />
                    </FieldWrapper>

                    <FieldWrapper htmlFor="dateSortie" label="Date de sortie">
                        <input
                            type="date"
                            id="dateSortie"
                            value={logementDetails.dateSortie || ''}
                            onChange={e => onNestedInputChange('logementDetails', 'dateSortie', e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                    </FieldWrapper>

                    <FieldWrapper htmlFor="motifSortie" label="Motif de sortie">
                        <TextInput
                            id="motifSortie"
                            value={logementDetails.motifSortie || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'motifSortie', value)}
                            disabled={disabled}
                            placeholder="Motif de sortie"
                        />
                    </FieldWrapper>

                    <FieldWrapper htmlFor="destinationSortie" label="Destination après sortie" className="col-span-2">
                        <TextInput
                            id="destinationSortie"
                            value={logementDetails.destinationSortie || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'destinationSortie', value)}
                            disabled={disabled}
                            placeholder="Destination après sortie"
                        />
                    </FieldWrapper>
                </div>
            </div>

            {/* Section commentaires */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Commentaires généraux
                </h4>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700">
                            Commentaire général sur le logement
                        </label>
                        {isAiAvailable && logementDetails.commentaire && logementDetails.commentaire.trim() && (
                            <LisserButton
                                text={logementDetails.commentaire}
                                onAccept={(text) => onNestedInputChange('logementDetails', 'commentaire', text)}
                                disabled={disabled}
                                colorScheme="blue"
                            />
                        )}
                    </div>
                    <textarea
                        id="commentaire"
                        value={logementDetails.commentaire || ''}
                        onChange={(e) => onNestedInputChange('logementDetails', 'commentaire', e.target.value)}
                        disabled={disabled}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-sm text-gray-900 bg-white transition-colors"
                        placeholder="Commentaires généraux sur le logement..."
                    />
                </div>
            </div>
        </>
    );
};

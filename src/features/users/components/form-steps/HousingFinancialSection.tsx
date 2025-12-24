/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { MultiSelectInput } from '../shared/MultiSelectInput';
import { LisserButton } from '@/components/ai/LisserButton';
import { useRequiredFields } from '@/hooks/useRequiredFields';
import { UserFormData } from '@/types/user';

interface HousingFinancialSectionProps {
    formData: any;
    optionsStatutGarantie: Array<{ value: string; label: string }>;
    optionsTypeLitige: Array<{ value: string; label: string }>;
    optionsPreavisPour: Array<{ value: string; label: string }>;
    revenusOptions: Array<{ value: string; label: string }>;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    onNestedInputChange: (parentField: keyof UserFormData, childField: string, value: any) => void;
    isAiAvailable: boolean;
    disabled?: boolean;
}

export const HousingFinancialSection: React.FC<HousingFinancialSectionProps> = ({
    formData,
    optionsStatutGarantie,
    optionsTypeLitige,
    optionsPreavisPour,
    revenusOptions,
    onInputChange,
    onNestedInputChange,
    isAiAvailable,
    disabled
}) => {
    const { isRequired } = useRequiredFields();
    const { logementDetails } = formData;

    const formatDateForInput = (dateStr: string | Date | null): string => {
        if (!dateStr) return '';
        if (typeof dateStr === 'string') {
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        }
        return new Date(dateStr).toISOString().split('T')[0];
    };

    return (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200 mb-6">
            <h4 className="text-md font-semibold text-violet-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations financières
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldWrapper
                    htmlFor="revenus"
                    label="Sources de revenus"
                    className="col-span-2"
                    required={isRequired('revenus')}
                >
                    <MultiSelectInput
                        id="revenus"
                        value={(() => {
                            const val = formData.revenus;
                            if (!val || val === '') return [];
                            if (val.includes(',')) {
                                return val.split(',').filter(Boolean);
                            }
                            return [val];
                        })()}
                        onChange={(values) => onInputChange('revenus', values.join(','))}
                        disabled={disabled}
                        options={revenusOptions}
                        placeholder="Sélectionner une ou plusieurs sources..."
                    />
                </FieldWrapper>

                <FieldWrapper
                    htmlFor="loyer"
                    label="Loyer (€)"
                    required={isRequired('logementDetails.loyer')}
                >
                    <TextInput
                        id="loyer"
                        type="number"
                        value={logementDetails.loyer || ''}
                        onChange={(value) => onNestedInputChange('logementDetails', 'loyer', value)}
                        disabled={disabled}
                        placeholder="0"
                    />
                </FieldWrapper>

                <FieldWrapper
                    htmlFor="charges"
                    label="Charges (€)"
                    required={isRequired('logementDetails.charges')}
                >
                    <TextInput
                        id="charges"
                        type="number"
                        value={logementDetails.charges || ''}
                        onChange={(value) => onNestedInputChange('logementDetails', 'charges', value)}
                        disabled={disabled}
                        placeholder="0"
                    />
                </FieldWrapper>

                <FieldWrapper htmlFor="garantieLocative" label="Garantie locative (€)">
                    <TextInput
                        id="garantieLocative"
                        type="number"
                        value={logementDetails.garantieLocative || ''}
                        onChange={(value) => onNestedInputChange('logementDetails', 'garantieLocative', value)}
                        disabled={disabled}
                        placeholder="0"
                    />
                </FieldWrapper>

                <FieldWrapper htmlFor="statutGarantie" label="Statut de la garantie">
                    <SelectInput
                        id="statutGarantie"
                        value={logementDetails.statutGarantie || ''}
                        onChange={(value) => onNestedInputChange('logementDetails', 'statutGarantie', value)}
                        disabled={disabled}
                        options={[
                            { value: '', label: '' },
                            ...optionsStatutGarantie
                        ]}
                    />
                </FieldWrapper>

                <div className="col-span-2">
                    <label className="flex items-center p-3 bg-white/50 rounded-md border border-red-200">
                        <input
                            type="checkbox"
                            checked={logementDetails.hasLitige || false}
                            onChange={(e) => onNestedInputChange('logementDetails', 'hasLitige', e.target.checked)}
                            disabled={disabled}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-semibold text-red-900 flex items-center">
                            <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Litige ou problème avec le logement
                        </span>
                    </label>
                </div>
            </div>

            {logementDetails.hasLitige && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h5 className="text-sm font-semibold text-red-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Détails du litige
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper htmlFor="typeLitige" label="Type de litige">
                            <MultiSelectInput
                                id="typeLitige"
                                value={(() => {
                                    const val = logementDetails.typeLitige;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onNestedInputChange('logementDetails', 'typeLitige', values.join(','))}
                                disabled={disabled}
                                options={optionsTypeLitige}
                                placeholder="Sélectionner un ou plusieurs types..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="dateLitige" label="Date du début du litige">
                            <input
                                type="date"
                                id="dateLitige"
                                value={logementDetails.dateLitige ? formatDateForInput(logementDetails.dateLitige) : ''}
                                onChange={e => onNestedInputChange('logementDetails', 'dateLitige', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="preavisPour" label="Préavis pour">
                            <SelectInput
                                id="preavisPour"
                                value={logementDetails.preavisPour || ''}
                                onChange={(value) => onNestedInputChange('logementDetails', 'preavisPour', value)}
                                disabled={disabled}
                                options={[
                                    { value: '', label: '' },
                                    ...optionsPreavisPour
                                ]}
                            />
                        </FieldWrapper>

                        <div className="col-span-2">
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="descriptionLitige" className="block text-sm font-medium text-gray-700">
                                    Description du litige
                                </label>
                                {isAiAvailable && logementDetails.descriptionLitige && logementDetails.descriptionLitige.trim() && (
                                    <LisserButton
                                        text={logementDetails.descriptionLitige}
                                        onAccept={(text) => onNestedInputChange('logementDetails', 'descriptionLitige', text)}
                                        disabled={disabled}
                                        colorScheme="purple"
                                    />
                                )}
                            </div>
                            <textarea
                                id="descriptionLitige"
                                value={logementDetails.descriptionLitige || ''}
                                onChange={(e) => onNestedInputChange('logementDetails', 'descriptionLitige', e.target.value)}
                                disabled={disabled}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white transition-colors"
                                placeholder="Description détaillée du litige..."
                            />
                        </div>

                        <div className="col-span-2">
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="actionsPrises" className="block text-sm font-medium text-gray-700">
                                    Actions prises
                                </label>
                                {isAiAvailable && logementDetails.actionsPrises && logementDetails.actionsPrises.trim() && (
                                    <LisserButton
                                        text={logementDetails.actionsPrises}
                                        onAccept={(text) => onNestedInputChange('logementDetails', 'actionsPrises', text)}
                                        disabled={disabled}
                                        colorScheme="teal"
                                    />
                                )}
                            </div>
                            <textarea
                                id="actionsPrises"
                                value={logementDetails.actionsPrises || ''}
                                onChange={(e) => onNestedInputChange('logementDetails', 'actionsPrises', e.target.value)}
                                disabled={disabled}
                                rows={2}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white transition-colors"
                                placeholder="Actions entreprises pour résoudre le litige..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

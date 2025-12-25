/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prevention Expulsion Basic Information
Extracted from PrevExpFields.tsx
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '../shared/FieldWrapper';
import { MultiSelectInput } from '../shared/MultiSelectInput';
import { SelectInput } from '../shared/SelectInput';

interface PrevExpBasicInfoProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
    optionsPrevExpMotifRequete: Array<{ value: string; label: string }>;
}

export const PrevExpBasicInfo: React.FC<PrevExpBasicInfoProps> = ({
    formData,
    onInputChange,
    disabled,
    optionsPrevExpMotifRequete
}) => {
    return (
        <>
            <FieldWrapper htmlFor="prevExpDateReception" label="Date de réception">
                <input
                    type="date"
                    id="prevExpDateReception"
                    value={formData.prevExpDateReception || ''}
                    onChange={e => onInputChange('prevExpDateReception', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateRequete" label="Date de requête">
                <input
                    type="date"
                    id="prevExpDateRequete"
                    value={formData.prevExpDateRequete || ''}
                    onChange={e => onInputChange('prevExpDateRequete', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateVad" label="Date VAD">
                <input
                    type="date"
                    id="prevExpDateVad"
                    value={formData.prevExpDateVad || ''}
                    onChange={e => onInputChange('prevExpDateVad', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpMotifRequete" label="Motif de la requête">
                <MultiSelectInput
                    id="prevExpMotifRequete"
                    value={(() => {
                        const val = formData.prevExpMotifRequete;
                        if (!val || val === '') return [];
                        if (val.includes(',')) {
                            return val.split(',').filter(Boolean);
                        }
                        return [val];
                    })()}
                    onChange={(values) => onInputChange('prevExpMotifRequete', values.join(','))}
                    disabled={disabled}
                    options={optionsPrevExpMotifRequete}
                    placeholder="Sélectionner un ou plusieurs motifs..."
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDossierOuvert" label="Dossier ouvert ?">
                <SelectInput
                    id="prevExpDossierOuvert"
                    value={formData.prevExpDossierOuvert || ''}
                    onChange={(value) => onInputChange('prevExpDossierOuvert', value)}
                    disabled={disabled}
                    options={[
                        { value: '', label: '' },
                        { value: 'OUI', label: 'OUI' },
                        { value: 'NON', label: 'NON' }
                    ]}
                />
            </FieldWrapper>
        </>
    );
};

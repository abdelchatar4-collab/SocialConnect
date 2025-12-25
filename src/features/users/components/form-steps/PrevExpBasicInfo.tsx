/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prevention Expulsion Basic Information
Extracted from PrevExpFields.tsx
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper, MultiSelectInput, SelectInput, DateInput } from '../shared';

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
                <DateInput
                    id="prevExpDateReception"
                    value={formData.prevExpDateReception}
                    onChange={(value) => onInputChange('prevExpDateReception', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateRequete" label="Date de requête">
                <DateInput
                    id="prevExpDateRequete"
                    value={formData.prevExpDateRequete}
                    onChange={(value) => onInputChange('prevExpDateRequete', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateVad" label="Date VAD">
                <DateInput
                    id="prevExpDateVad"
                    value={formData.prevExpDateVad}
                    onChange={(value) => onInputChange('prevExpDateVad', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
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

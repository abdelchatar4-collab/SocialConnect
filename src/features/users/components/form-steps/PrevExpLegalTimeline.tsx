/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prevention Expulsion Legal Timeline
Extracted from PrevExpFields.tsx
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '../shared/FieldWrapper';

interface PrevExpLegalTimelineProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
}

export const PrevExpLegalTimeline: React.FC<PrevExpLegalTimelineProps> = ({
    formData,
    onInputChange,
    disabled
}) => {
    return (
        <>
            <FieldWrapper htmlFor="prevExpDateAudience" label="Date d'audience">
                <input
                    type="date"
                    id="prevExpDateAudience"
                    value={formData.prevExpDateAudience || ''}
                    onChange={e => onInputChange('prevExpDateAudience', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateSignification" label="Date de signification">
                <input
                    type="date"
                    id="prevExpDateSignification"
                    value={formData.prevExpDateSignification || ''}
                    onChange={e => onInputChange('prevExpDateSignification', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateJugement" label="Date du jugement">
                <input
                    type="date"
                    id="prevExpDateJugement"
                    value={formData.prevExpDateJugement || ''}
                    onChange={e => onInputChange('prevExpDateJugement', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateExpulsion" label="Date d'expulsion">
                <input
                    type="date"
                    id="prevExpDateExpulsion"
                    value={formData.prevExpDateExpulsion || ''}
                    onChange={e => onInputChange('prevExpDateExpulsion', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
            </FieldWrapper>
        </>
    );
};

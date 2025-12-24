/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { displayError } from '@/types/errors';
import { FormErrors } from '@/types';
import { UserFormData } from '@/types/user';

interface ContactSectionProps {
    telephone?: string;
    email?: string;
    premierContact?: string;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    errors: FormErrors;
    isRequired: (field: string) => boolean;
    disabled?: boolean;
    premierContactOptions: { value: string; label: string }[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({
    telephone,
    email,
    premierContact,
    onInputChange,
    errors,
    isRequired,
    disabled,
    premierContactOptions
}) => {
    return (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200 mb-6">
            <h4 className="text-md font-semibold text-rose-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-rose-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Téléphone */}
                <FieldWrapper
                    htmlFor="telephone"
                    label="Téléphone"
                    error={displayError(errors.telephone)}
                    required={isRequired('telephone')}
                >
                    <TextInput
                        id="telephone"
                        value={telephone || ''}
                        onChange={(value) => onInputChange('telephone', value)}
                        disabled={disabled}
                        placeholder="Numéro de téléphone"
                    />
                </FieldWrapper>

                {/* Email */}
                <FieldWrapper
                    htmlFor="email"
                    label="Email"
                    error={displayError(errors.email)}
                    required={isRequired('email')}
                >
                    <TextInput
                        id="email"
                        type="email"
                        value={email || ''}
                        onChange={(value) => onInputChange('email', value)}
                        disabled={disabled}
                        placeholder="Adresse email"
                    />
                </FieldWrapper>

                {/* Premier contact */}
                <FieldWrapper
                    htmlFor="premierContact"
                    label="Premier contact"
                    error={displayError(errors.premierContact)}
                    required={isRequired('premierContact')}
                >
                    <SelectInput
                        id="premierContact"
                        value={premierContact || ''}
                        onChange={(value) => onInputChange('premierContact', value)}
                        disabled={disabled}
                        options={[
                            { value: '', label: 'Sélectionner...' },
                            ...premierContactOptions.map(option => ({
                                value: option.value,
                                label: option.label
                            }))
                        ]}
                    />
                </FieldWrapper>
            </div>
        </div>
    );
};

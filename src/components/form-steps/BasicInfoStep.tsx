/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData, Adresse } from '@/types/user';
import { FormErrors } from '@/types/errors';
import { FormFieldValue } from '@/types/common';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { FieldWrapper } from '../shared/FieldWrapper';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { displayError } from '@/types/errors';
import { AddressSection } from './AddressSection';
import { useRequiredFields } from '@/hooks/useRequiredFields';

interface BasicInfoStepProps {
  formData: UserFormData;
  errors: FormErrors;
  onInputChange: (field: keyof UserFormData, value: FormFieldValue) => void;
  disabled?: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  errors,
  onInputChange,
  disabled
}) => {
  const { isRequired } = useRequiredFields();

  // ✅ Utilisation correcte de l'API
  const { options: premierContactOptionsAPI, loading: loadingPremierContact } = useDropdownOptionsAPI('premierContact', 10000);

  const premierContactOptions = premierContactOptionsAPI.map(opt => ({
    value: opt.value,
    label: opt.label
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Identification & Contact
        </h3>
        <p className="text-blue-700 mb-6">Informations d'identification, adresse et moyens de contact</p>

        {/* Section Identité */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200 mb-6">
          <h4 className="text-md font-semibold text-purple-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Identité
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <FieldWrapper
              htmlFor="nom"
              label="Nom"
              error={displayError(errors.nom)}
              required={isRequired('nom')}
            >
              <TextInput
                id="nom"
                value={formData.nom || ''}
                onChange={(value) => onInputChange('nom', value)}
                disabled={disabled}
                placeholder="Nom de famille"
              />
            </FieldWrapper>

            {/* Prénom */}
            <FieldWrapper
              htmlFor="prenom"
              label="Prénom"
              error={displayError(errors.prenom)}
              required={isRequired('prenom')}
            >
              <TextInput
                id="prenom"
                value={formData.prenom || ''}
                onChange={(value) => onInputChange('prenom', value)}
                disabled={disabled}
                placeholder="Prénom"
              />
            </FieldWrapper>
          </div>
        </div>

        {/* Section Contact */}
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
                value={formData.telephone || ''}
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
                value={formData.email || ''}
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
                value={formData.premierContact || ''}
                onChange={(value) => onInputChange('premierContact', value)}
                disabled={disabled}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  ...premierContactOptions.map(option => ({
                    value: option.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    label: option.label
                  }))
                ]}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* Section Adresse */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Adresse et secteur
          </h4>
          <AddressSection
            address={formData.adresse}
            onChange={(address) => onInputChange('adresse', address)}
            onSecteurChange={(secteur) => onInputChange('secteur', secteur)}
            errors={errors}
            disabled={disabled}
            secteur={formData.secteur}
          />

          {/* Affichage du secteur calculé */}
          {formData.secteur && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-green-700">Secteur d'Anderlecht: </span>
                <span className="font-bold text-green-800 text-lg">{formData.secteur}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;

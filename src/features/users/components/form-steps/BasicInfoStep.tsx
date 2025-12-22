/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { FormErrors } from '@/types';
import { FormFieldValue } from '@/types/common';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { AddressSection } from './AddressSection';
import { useRequiredFields } from '@/hooks/useRequiredFields';
import { useDuplicateCheck } from '../../hooks/useDuplicateCheck';

// Sub-components
import { IdentitySection } from './IdentitySection';
import { ContactSection } from './ContactSection';

interface BasicInfoStepProps {
  formData: UserFormData;
  errors: FormErrors;
  onInputChange: (field: keyof UserFormData, value: FormFieldValue) => void;
  disabled?: boolean;
  mode?: 'create' | 'edit';
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  errors,
  onInputChange,
  disabled,
  mode = 'create'
}) => {
  const { isRequired } = useRequiredFields();

  // Logic: Duplicate check
  const {
    duplicates,
    isCheckingDuplicates,
    checkDuplicates
  } = useDuplicateCheck({
    mode,
    nom: formData.nom,
    prenom: formData.prenom
  });

  // Logic: Dropdown options
  const { options: premierContactOptionsAPI } = useDropdownOptionsAPI('premierContact', 10000);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        {/* Header */}
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Identification &amp; Contact
        </h3>
        <p className="text-blue-700 mb-6">Informations d&apos;identification, adresse et moyens de contact</p>

        {/* Section Identité (inclut check doublons) */}
        <IdentitySection
          nom={formData.nom || ''}
          prenom={formData.prenom || ''}
          onInputChange={(field, value) => onInputChange(field, value)}
          onBlur={checkDuplicates}
          errors={errors}
          isRequired={isRequired}
          disabled={disabled}
          duplicates={duplicates}
          isCheckingDuplicates={isCheckingDuplicates}
        />

        {/* Section Contact */}
        <ContactSection
          telephone={formData.telephone}
          email={formData.email}
          premierContact={formData.premierContact}
          onInputChange={onInputChange}
          errors={errors}
          isRequired={isRequired}
          disabled={disabled}
          premierContactOptions={premierContactOptionsAPI}
        />

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
                <span className="text-sm text-green-700">Secteur d&apos;Anderlecht: </span>
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

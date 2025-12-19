/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { FormErrors } from '@/types';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { MultiSelectInput } from '../shared/MultiSelectInput';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextAreaInput } from '../shared/TextAreaInput';
import { useRequiredFields } from '@/hooks/useRequiredFields';

interface PersonalInfoStepProps {
  formData: UserFormData;
  errors: FormErrors;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  languageOptions: Array<{ value: string; label: string }>;
  nationaliteOptions: Array<{ value: string; label: string }>;
  statutSejourOptions: Array<{ value: string; label: string }>;
  situationProfessionnelleOptions: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  errors,
  onInputChange,
  languageOptions,
  nationaliteOptions,
  statutSejourOptions,
  situationProfessionnelleOptions,
  disabled
}) => {
  const { isRequired } = useRequiredFields();

  const displayError = (error: any): string => {
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      return Object.values(error).join(', ');
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Informations personnelles</h3>
            <p className="text-sm text-purple-700">Détails personnels et statut administratif</p>
          </div>
        </div>
      </div>

      {/* Section informations de base */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Données personnelles
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date de naissance */}
          <FieldWrapper
            htmlFor="dateNaissance"
            label="Date de naissance"
            required={isRequired('dateNaissance')}
            error={displayError(errors.dateNaissance)}
            hint="Format: JJ/MM/AAAA"
          >
            <input
              type="date"
              id="dateNaissance"
              value={formData.dateNaissance || ''}
              onChange={(e) => onInputChange('dateNaissance', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </FieldWrapper>

          {/* Genre */}
          <FieldWrapper
            htmlFor="genre"
            label="Genre"
            required={isRequired('genre')}
            error={displayError(errors.genre)}
          >
            <SelectInput
              id="genre"
              value={formData.genre || ''}
              onChange={(value) => onInputChange('genre', value)}
              disabled={disabled}
              options={[
                { value: '', label: 'Sélectionner...' },
                { value: 'homme', label: 'Homme' },
                { value: 'femme', label: 'Femme' },
                { value: 'autre', label: 'Autre' },
                { value: 'non-precise', label: 'Non précisé' }
              ]}
            />
          </FieldWrapper>
        </div>
      </div>

      {/* Section statut administratif */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Statut administratif et nationalité
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nationalité */}
          <FieldWrapper
            htmlFor="nationalite"
            label="Nationalité"
            required={isRequired('nationalite')}
            error={displayError(errors.nationalite)}
          >
            <SelectInput
              id="nationalite"
              value={formData.nationalite || ''}
              onChange={(value) => onInputChange('nationalite', value)}
              disabled={disabled}
              options={[
                { value: '', label: 'Sélectionner une nationalité...' },
                ...nationaliteOptions
              ]}
            />
          </FieldWrapper>

          {/* Statut de séjour */}
          <FieldWrapper
            htmlFor="statutSejour"
            label="Statut de séjour"
            required={isRequired('statutSejour')}
            error={displayError(errors.statutSejour)}
          >
            <SelectInput
              id="statutSejour"
              value={formData.statutSejour || ''}
              onChange={(value) => onInputChange('statutSejour', value)}
              disabled={disabled}
              options={statutSejourOptions}
            />
          </FieldWrapper>

          {/* Situation Professionnelle */}
          <FieldWrapper
            htmlFor="situationProfessionnelle"
            label="Situation Professionnelle"
            required={isRequired('situationProfessionnelle')}
            error={displayError(errors.situationProfessionnelle)}
            className="md:col-span-2"
          >
            <MultiSelectInput
              id="situationProfessionnelle"
              value={(() => {
                const val = formData.situationProfessionnelle;
                if (!val || val === '') return [];
                if (val.includes(',')) {
                  return val.split(',').filter(Boolean);
                }
                return [val];
              })()}
              onChange={(values) => onInputChange('situationProfessionnelle', values.join(','))}
              disabled={disabled}
              options={situationProfessionnelleOptions}
              placeholder="Sélectionner une ou plusieurs situations..."
            />
          </FieldWrapper>
        </div>
      </div>

      {/* Section communication */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <h4 className="text-md font-semibold text-amber-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Communication
        </h4>
        <div className="grid grid-cols-1 gap-6">
          {/* Langue */}
          <FieldWrapper
            htmlFor="langue"
            label="Langue(s) parlée(s)"
            required={isRequired('langue')}
            error={displayError(errors.langue)}
          >
            <MultiSelectInput
              id="langue"
              value={(() => {
                const val = formData.langue;
                if (!val || val === '') return [];
                if (val.includes(',')) {
                  return val.split(',').filter(Boolean);
                }
                return [val];
              })()}
              onChange={(values) => onInputChange('langue', values.join(','))}
              disabled={disabled}
              options={languageOptions}
              placeholder="Sélectionner une ou plusieurs langues..."
            />
          </FieldWrapper>
        </div>
      </div>

      {/* NOUVELLE SECTION: Données confidentielles */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
        <h4 className="text-md font-semibold text-red-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Données confidentielles
        </h4>

        {/* Case à cocher pour afficher les données confidentielles */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.afficherDonneesConfidentielles || false}
              onChange={(e) => onInputChange('afficherDonneesConfidentielles', e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-red-900">
              Afficher les données confidentielles
            </span>
          </label>
          <p className="text-xs text-red-600 mt-1 ml-6">
            Cochez cette case pour rendre visible le champ de données confidentielles
          </p>
        </div>

        {/* Champ de données confidentielles (visible seulement si la case est cochée) */}
        {formData.afficherDonneesConfidentielles && (
          <FieldWrapper
            htmlFor="donneesConfidentielles"
            label="Données confidentielles"
            error={displayError(errors.donneesConfidentielles)}
          >
            <TextAreaInput
              id="donneesConfidentielles"
              value={formData.donneesConfidentielles || ''}
              onChange={(value) => onInputChange('donneesConfidentielles', value)}
              disabled={disabled}
              placeholder="Informations confidentielles (accès restreint)..."
              rows={3}
            />
            <p className="text-sm text-red-600 mt-2 italic">
              🔒 Ces informations sont confidentielles et à accès restreint
            </p>
          </FieldWrapper>
        )}
      </div>
    </div>
  );
};



/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { FormErrors, displayError } from '@/types';
import { FieldWrapper } from '@/components/shared/FieldWrapper';
import { TextInput } from '@/components/shared/TextInput';

interface ContactStepProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  disabled?: boolean;
}

export const ContactStep: React.FC<ContactStepProps> = ({
  formData,
  onInputChange,
  disabled
}) => {
  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-cyan-900">Contact & Suivi Dossier</h3>
            <p className="text-sm text-cyan-700">Coordonnées et informations de contact</p>
          </div>
        </div>
      </div>

      {/* Section informations de contact */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
        <h4 className="text-md font-semibold text-emerald-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          Moyens de contact
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldWrapper htmlFor="telephone" label="Téléphone">
            <TextInput
              id="telephone"
              value={formData.telephone || ''}
              onChange={(value) => onInputChange('telephone', value)}
              disabled={disabled}
              placeholder="+32 xxx xx xx xx"
            />
          </FieldWrapper>

          <FieldWrapper htmlFor="email" label="Email">
            <TextInput
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(value) => onInputChange('email', value)}
              disabled={disabled}
              placeholder="exemple@email.com"
            />
          </FieldWrapper>
        </div>
      </div>

      {/* Afficher l'adresse en lecture seule */}
      {formData.adresse.rue && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Adresse enregistrée
          </h4>
          <div className="bg-white/50 p-3 rounded-md">
            <p className="text-sm text-blue-800 leading-relaxed font-medium">
              {formData.adresse.rue} {formData.adresse.numero}
              {formData.adresse.boite && ` boîte ${formData.adresse.boite}`}
              <br />
              {formData.adresse.codePostal} {formData.adresse.ville}
            </p>
            {formData.secteur && (
              <p className="text-sm text-indigo-600 mt-2 font-semibold">
                📍 Secteur: {formData.secteur}
              </p>
            )}
            <p className="text-sm text-blue-600 mt-3 italic">
              💡 Pour modifier l&apos;adresse, retournez à l&apos;étape &quot;Identification &amp; Affectation&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactStep;

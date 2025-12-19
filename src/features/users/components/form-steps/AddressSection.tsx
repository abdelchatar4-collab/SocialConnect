/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { FieldWrapper } from '@/components/shared/FieldWrapper';
import { TextInput } from '@/components/shared/TextInput';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { useRequiredFields } from '@/hooks/useRequiredFields';

interface AddressSectionProps {
  address: UserFormData['adresse'];
  onChange: (address: UserFormData['adresse']) => void;
  onSecteurChange?: (secteur: string) => void; // Nouveau callback pour le secteur
  disabled?: boolean;
  errors?: any;
  secteur?: string;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  onChange,
  onSecteurChange,
  disabled,
  errors,
  secteur
}) => {
  const { isRequired } = useRequiredFields();
  const {
    suggestions,
    showSuggestions,
    isLoadingSuggestions,
    searchQuery,
    handleFieldChange,
    selectSuggestion,
    handleFocus,
    handleBlur
  } = useAddressSearch({ address, onChange, onSecteurChange, disabled });

  const displayError = (error: any): string => {
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      const errorKeys = Object.keys(error);
      if (errorKeys.length > 0) {
        return error[errorKeys[0]];
      }
    }
    return '';
  };

  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="text-md font-medium text-green-900 mb-3">
        Adresse (obligatoire - détermine le secteur automatiquement)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Champ Rue avec autocomplétion */}
        <FieldWrapper
          htmlFor="rue"
          label="Rue"
          required={isRequired('adresse.rue')}
        >
          <div className="relative">
            <TextInput
              id="rue"
              value={searchQuery}
              onChange={(value) => handleFieldChange('rue', value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder="Tapez le nom de la rue... (ex: Rue du Devoir)"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              autoComplete="off"
            />

            {/* Dropdown des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute z-[99999] w-full mt-1 bg-white border-2 border-blue-300 rounded-md shadow-2xl max-h-60 overflow-y-auto"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  backgroundColor: '#ffffff'
                }}
              >
                <div className="p-2 bg-blue-100 border-b text-xs text-blue-800 font-medium">
                  💡 {suggestions.length} suggestion(s) trouvée(s) - Cliquez pour sélectionner
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id || index}
                    className="px-4 py-3 cursor-pointer hover:bg-blue-100 border-b border-gray-200 last:border-b-0 transition-all duration-200"
                    onClick={() => selectSuggestion(suggestion)}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      📍 {suggestion.FormattedAddress}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Secteur: {suggestion.Municipality} - {suggestion.Zipcode}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Indicateur de chargement */}
            {isLoadingSuggestions && (
              <div className="absolute right-8 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Icône de recherche */}
            {!isLoadingSuggestions && (
              <div className="absolute right-3 top-3 text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>
        </FieldWrapper>

        <FieldWrapper
          htmlFor="numero"
          label="Numéro"
          required={isRequired('adresse.numero')}
        >
          <TextInput
            id="numero"
            value={address?.numero || ''}
            onChange={(value) => handleFieldChange('numero', value)}
            disabled={disabled}
            placeholder="123"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
        </FieldWrapper>

        <FieldWrapper htmlFor="boite" label="Boîte">
          <TextInput
            id="boite"
            value={address?.boite || ''}
            onChange={(value) => handleFieldChange('boite', value)}
            disabled={disabled}
            placeholder="A, B, 1, etc."
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
        </FieldWrapper>

        <FieldWrapper
          htmlFor="codePostal"
          label="Code postal"
          required={isRequired('adresse.codePostal')}
        >
          <TextInput
            id="codePostal"
            value={address?.codePostal || ''}
            onChange={(value) => handleFieldChange('codePostal', value)}
            disabled={disabled}
            placeholder="Ex: 1000"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
        </FieldWrapper>

        <FieldWrapper
          htmlFor="ville"
          label="Ville"
          required={isRequired('adresse.ville')}
        >
          <TextInput
            id="ville"
            value={address?.ville || ''}
            onChange={(value) => handleFieldChange('ville', value)}
            disabled={disabled}
            placeholder="Anderlecht"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
        </FieldWrapper>

        {/* Message d'aide */}
        <div className="col-span-full">
          <p className="text-xs text-gray-700 mt-2">
            💡 Tapez au moins 3 caractères dans le champ &quot;Rue&quot; pour voir les suggestions d&apos;adresses d&apos;Anderlecht
          </p>
        </div>
      </div>

      {errors && <p className="text-red-500 text-xs mt-1">{displayError(errors)}</p>}

      {
        secteur && (
          <div className="mt-3 p-3 bg-white rounded border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Secteur d&apos;Anderlecht: </span>
                <span className="font-bold text-green-700 text-lg">{secteur}</span>
              </div>
              {secteur.includes('non défini') || secteur.includes('Hors') ? (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  ⚠️ Vérifier l&apos;adresse
                </span>
              ) : (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  ✅ Secteur trouvé
                </span>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
};

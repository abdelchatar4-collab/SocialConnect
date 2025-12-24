/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { FormErrors, displayError } from '@/types';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { ComboBox } from '../shared/ComboBox';
import { PartenairesManager } from '../shared/PartenairesManager';
import { FieldWrapper } from '../shared/FieldWrapper';
import { useRequiredFields } from '@/hooks/useRequiredFields';
import { useSession } from 'next-auth/react';
import { useFormSectionVisibility } from '../../hooks/useFormSectionVisibility';

// Ajouter dans les props de ManagementStepProps
interface ManagementStepProps {
  formData: UserFormData;
  errors: FormErrors;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  gestionnaires: Array<{ value: string; label: string }>;
  optionsAntenne: Array<{ value: string; label: string }>;
  optionsEtat: Array<{ value: string; label: string }>;
  optionsPartenaire: Array<{ value: string; label: string }>;  // Ajouter cette ligne
  disabled?: boolean;
}


export const ManagementStep: React.FC<ManagementStepProps> = ({
  formData,
  errors,
  onInputChange,
  gestionnaires,
  optionsAntenne,
  optionsEtat,
  optionsPartenaire,
  disabled
}) => {
  const { isRequired, getRequiredLabel } = useRequiredFields();
  const { data: session } = useSession();
  const { isSectionVisible } = useFormSectionVisibility();

  // If management section is disabled, don't render anything
  if (!isSectionVisible('management')) {
    return null;
  }

  // Masquer l'antenne pour les services autres que PASQ (default)
  // Utiliser le cast as any car serviceId n'est pas typé par défaut dans next-auth session user
  const currentServiceId = (session?.user as any)?.serviceId || 'default';
  const showAntenne = currentServiceId === 'default';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Gestion et suivi du dossier
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldWrapper
            label="Gestionnaire"
            error={displayError(errors.gestionnaire)}
            required={isRequired('gestionnaire')}
          >
            <SelectInput
              value={formData.gestionnaire || ''}
              onChange={(value) => onInputChange('gestionnaire', value)}
              options={gestionnaires}
              placeholder="Sélectionner un gestionnaire"
              disabled={disabled}
            />
          </FieldWrapper>

          {showAntenne && (
            <FieldWrapper
              label="Antenne"
              error={displayError(errors.antenne)}
              required={isRequired('antenne')}
            >
              <SelectInput
                value={formData.antenne || ''}
                onChange={(value) => onInputChange('antenne', value)}
                options={optionsAntenne}
                placeholder="Sélectionner une antenne"
                disabled={disabled}
              />
            </FieldWrapper>
          )}

          <FieldWrapper
            label="État du dossier"
            error={displayError(errors.etat)}
            required={isRequired('etat')}
          >
            <SelectInput
              value={formData.etat || ''}
              onChange={(value) => onInputChange('etat', value)}
              options={optionsEtat}
              placeholder="Sélectionner un état"
              disabled={disabled}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Date d'ouverture"
            error={displayError(errors.dateOuverture)}
            required={isRequired('dateOuverture')}
          >
            <TextInput
              type="date"
              value={formData.dateOuverture || ''}
              onChange={(value) => {
                // Immediate future date warning
                if (value) {
                  const today = new Date();
                  const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

                  if (value > todayStr) {
                    alert(
                      "⚠️ Attention : La date d'ouverture indiquée est dans le futur.\n\n" +
                      "Cela placera ce dossier en tête de la liste 'Derniers ajouts' et pourrait fausser le tri."
                    );
                  }
                }
                onInputChange('dateOuverture', value);
              }}
              disabled={disabled}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Date de fermeture"
            error={displayError(errors.dateCloture)}
            required={isRequired('dateCloture')}
          >
            <TextInput
              type="date"
              value={formData.dateCloture || ''}
              onChange={(value) => onInputChange('dateCloture', value)}
              disabled={disabled}
            />
          </FieldWrapper>
        </div>

        <div className="mt-6">
          <PartenairesManager
            value={formData.partenaire || []}
            onChange={(value) => onInputChange('partenaire', value)}
            label={getRequiredLabel("Partenaires impliqués", "partenaire")}
            placeholder="Sélectionner ou ajouter des partenaires..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

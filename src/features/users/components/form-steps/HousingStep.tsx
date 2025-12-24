/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Pubérale Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types/user';
import { PrevExpFields } from './PrevExpFields';
import { useAiAvailable } from '@/components/ai/LisserButton';
import { useFormSectionVisibility } from '../../hooks/useFormSectionVisibility';

// Sub-components
import { HousingBasicInfoSection } from './HousingBasicInfoSection';
import { HousingFinancialSection } from './HousingFinancialSection';
import { HousingEndingSection } from './HousingEndingSection';

interface HousingStepProps {
  formData: UserFormData;
  optionsTypeLogementDyn: Array<{ value: string; label: string }>;
  optionsPrevExpDecision: Array<{ value: string; label: string }>;
  optionsPrevExpDemandeCpas: Array<{ value: string; label: string }>;
  optionsPrevExpNegociationProprio: Array<{ value: string; label: string }>;
  optionsPrevExpSolutionRelogement: Array<{ value: string; label: string }>;
  optionsPrevExpTypeFamille: Array<{ value: string; label: string }>;
  optionsPrevExpTypeRevenu: Array<{ value: string; label: string }>;
  optionsPrevExpEtatLogement: Array<{ value: string; label: string }>;
  optionsPrevExpNombreChambre: Array<{ value: string; label: string }>;
  optionsPrevExpAideJuridique: Array<{ value: string; label: string }>;
  optionsPrevExpMotifRequete: Array<{ value: string; label: string }>;
  optionsStatutGarantie: Array<{ value: string; label: string }>;
  optionsBailEnregistre: Array<{ value: string; label: string }>;
  optionsDureeContrat: Array<{ value: string; label: string }>;
  optionsTypeLitige: Array<{ value: string; label: string }>;
  optionsDureePreavis: Array<{ value: string; label: string }>;
  optionsPreavisPour: Array<{ value: string; label: string }>;
  revenusOptions: Array<{ value: string; label: string }>;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  onNestedInputChange: (parentField: keyof UserFormData, childField: string, value: any) => void;
  disabled?: boolean;
}

export const HousingStep: React.FC<HousingStepProps> = ({
  formData,
  optionsTypeLogementDyn,
  optionsPrevExpDecision,
  optionsPrevExpDemandeCpas,
  optionsPrevExpNegociationProprio,
  optionsPrevExpSolutionRelogement,
  optionsPrevExpTypeFamille,
  optionsPrevExpTypeRevenu,
  optionsPrevExpEtatLogement,
  optionsPrevExpNombreChambre,
  optionsPrevExpAideJuridique,
  optionsPrevExpMotifRequete,
  optionsStatutGarantie,
  optionsBailEnregistre,
  optionsDureeContrat,
  optionsTypeLitige,
  optionsDureePreavis,
  optionsPreavisPour,
  revenusOptions,
  onInputChange,
  onNestedInputChange,
  disabled
}) => {
  const isAiAvailable = useAiAvailable();
  const { isSectionVisible } = useFormSectionVisibility();

  const showHousing = isSectionVisible('housing');
  const showPrevExp = isSectionVisible('prevExp');

  // Si les deux sections sont cachées, ne rien afficher
  if (!showHousing && !showPrevExp) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900">Logement & Situation</h3>
            <p className="text-sm text-orange-700">Informations détaillées sur le logement et la situation résidentielle</p>
          </div>
        </div>
      </div>

      {showHousing && formData.logementDetails && (
        <>
          <HousingBasicInfoSection
            logementDetails={formData.logementDetails}
            optionsTypeLogementDyn={optionsTypeLogementDyn}
            optionsBailEnregistre={optionsBailEnregistre}
            optionsDureeContrat={optionsDureeContrat}
            onNestedInputChange={onNestedInputChange}
            disabled={disabled}
          />

          <HousingFinancialSection
            formData={formData}
            optionsStatutGarantie={optionsStatutGarantie}
            optionsTypeLitige={optionsTypeLitige}
            optionsPreavisPour={optionsPreavisPour}
            revenusOptions={revenusOptions}
            onInputChange={onInputChange}
            onNestedInputChange={onNestedInputChange}
            isAiAvailable={isAiAvailable}
            disabled={disabled}
          />

          <HousingEndingSection
            logementDetails={formData.logementDetails}
            optionsDureePreavis={optionsDureePreavis}
            onNestedInputChange={onNestedInputChange}
            isAiAvailable={isAiAvailable}
            disabled={disabled}
          />
        </>
      )}

      {/* Section Expulsion préventive */}
      {showPrevExp && (
        <PrevExpFields
          formData={formData}
          onInputChange={onInputChange}
          disabled={disabled}
          optionsPrevExpDecision={optionsPrevExpDecision}
          optionsPrevExpDemandeCpas={optionsPrevExpDemandeCpas}
          optionsPrevExpNegociationProprio={optionsPrevExpNegociationProprio}
          optionsPrevExpSolutionRelogement={optionsPrevExpSolutionRelogement}
          optionsPrevExpTypeFamille={optionsPrevExpTypeFamille}
          optionsPrevExpTypeRevenu={optionsPrevExpTypeRevenu}
          optionsPrevExpEtatLogement={optionsPrevExpEtatLogement}
          optionsPrevExpNombreChambre={optionsPrevExpNombreChambre}
          optionsPrevExpAideJuridique={optionsPrevExpAideJuridique}
          optionsPrevExpMotifRequete={optionsPrevExpMotifRequete}
        />
      )}
    </div>
  );
};

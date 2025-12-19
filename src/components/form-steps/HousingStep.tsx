/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '@/components/shared/FieldWrapper';
import { TextInput } from '@/components/shared/TextInput';
import { SelectInput } from '@/components/shared/SelectInput';
import { MultiSelectInput } from '@/components/shared/MultiSelectInput';
import { PrevExpFields } from './PrevExpFields';
import { useRequiredFields } from '@/hooks/useRequiredFields';

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
  const { isRequired } = useRequiredFields();

  const formatDateForInput = (dateStr: string | Date | null): string => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') {
      return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    }
    return new Date(dateStr).toISOString().split('T')[0];
  };

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

      {formData.logementDetails && (
        <div>
          {/* Section informations de base */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 mb-6">
            <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Informations de base sur le logement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldWrapper
                htmlFor="typeLogement"
                label="Type de logement"
                required={isRequired('logementDetails.typeLogement')}
              >
                <SelectInput
                  id="typeLogement"
                  value={formData.logementDetails.typeLogement || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'typeLogement', value)}
                  disabled={disabled}
                  options={optionsTypeLogementDyn}
                />
              </FieldWrapper>

              <FieldWrapper
                htmlFor="proprietaire"
                label="Propriétaire"
                required={isRequired('logementDetails.proprietaire')}
              >
                <TextInput
                  id="proprietaire"
                  value={formData.logementDetails.proprietaire || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'proprietaire', value)}
                  disabled={disabled}
                  placeholder="Nom du propriétaire"
                />
              </FieldWrapper>
            </div>
          </div>

          {/* Section informations contractuelles */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200 mb-6">
            <h4 className="text-md font-semibold text-emerald-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Informations contractuelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldWrapper
                htmlFor="bailEnregistre"
                label="Bail enregistré"
                required={isRequired('logementDetails.bailEnregistre')}
              >
                <SelectInput
                  id="bailEnregistre"
                  value={formData.logementDetails.bailEnregistre || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'bailEnregistre', value)}
                  disabled={disabled}
                  options={[
                    { value: '', label: '' },
                    ...optionsBailEnregistre
                  ]}
                />
              </FieldWrapper>

              <FieldWrapper
                htmlFor="dateContrat"
                label="Date du contrat"
                required={isRequired('logementDetails.dateContrat')}
              >
                <input
                  type="date"
                  id="dateContrat"
                  value={formData.logementDetails.dateContrat || ''}
                  onChange={e => onNestedInputChange('logementDetails', 'dateContrat', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="dateEntree" label="Date d'entrée">
                <input
                  type="date"
                  id="dateEntree"
                  value={formData.logementDetails.dateEntree || ''}
                  onChange={e => onNestedInputChange('logementDetails', 'dateEntree', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="dureeContrat" label="Durée du contrat">
                <SelectInput
                  id="dureeContrat"
                  value={formData.logementDetails.dureeContrat || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'dureeContrat', value)}
                  disabled={disabled}
                  options={[
                    { value: '', label: '' },
                    ...optionsDureeContrat
                  ]}
                />
              </FieldWrapper>
            </div>
          </div>

          {/* Section informations financières */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200 mb-6">
            <h4 className="text-md font-semibold text-violet-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informations financières
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldWrapper
                htmlFor="revenus"
                label="Sources de revenus"
                className="col-span-2"
                required={isRequired('revenus')}
              >
                <MultiSelectInput
                  id="revenus"
                  value={(() => {
                    const val = formData.revenus;
                    if (!val || val === '') return [];
                    if (val.includes(',')) {
                      return val.split(',').filter(Boolean);
                    }
                    return [val];
                  })()}
                  onChange={(values) => onInputChange('revenus', values.join(','))}
                  disabled={disabled}
                  options={revenusOptions}
                  placeholder="Sélectionner une ou plusieurs sources..."
                />
              </FieldWrapper>

              <FieldWrapper
                htmlFor="loyer"
                label="Loyer (€)"
                required={isRequired('logementDetails.loyer')}
              >
                <TextInput
                  id="loyer"
                  type="number"
                  value={formData.logementDetails.loyer || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'loyer', value)}
                  disabled={disabled}
                  placeholder="0"
                />
              </FieldWrapper>

              <FieldWrapper
                htmlFor="charges"
                label="Charges (€)"
                required={isRequired('logementDetails.charges')}
              >
                <TextInput
                  id="charges"
                  type="number"
                  value={formData.logementDetails.charges || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'charges', value)}
                  disabled={disabled}
                  placeholder="0"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="garantieLocative" label="Garantie locative (€)">
                <TextInput
                  id="garantieLocative"
                  type="number"
                  value={formData.logementDetails.garantieLocative || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'garantieLocative', value)}
                  disabled={disabled}
                  placeholder="0"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="statutGarantie" label="Statut de la garantie">
                <SelectInput
                  id="statutGarantie"
                  value={formData.logementDetails.statutGarantie || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'statutGarantie', value)}
                  disabled={disabled}
                  options={[
                    { value: '', label: '' },
                    ...optionsStatutGarantie
                  ]}
                />
              </FieldWrapper>

              <div className="col-span-2">
                <label className="flex items-center p-3 bg-white/50 rounded-md border border-red-200">
                  <input
                    type="checkbox"
                    checked={formData.logementDetails.hasLitige || false}
                    onChange={(e) => onNestedInputChange('logementDetails', 'hasLitige', e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-red-900 flex items-center">
                    <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Litige ou problème avec le logement
                  </span>
                </label>
              </div>
            </div>

            {formData.logementDetails.hasLitige && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h5 className="text-sm font-semibold text-red-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Détails du litige
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWrapper htmlFor="typeLitige" label="Type de litige">
                    <MultiSelectInput
                      id="typeLitige"
                      value={(() => {
                        const val = formData.logementDetails.typeLitige;
                        if (!val || val === '') return [];
                        if (val.includes(',')) {
                          return val.split(',').filter(Boolean);
                        }
                        return [val];
                      })()}
                      onChange={(values) => onNestedInputChange('logementDetails', 'typeLitige', values.join(','))}
                      disabled={disabled}
                      options={optionsTypeLitige}
                      placeholder="Sélectionner un ou plusieurs types..."
                    />
                  </FieldWrapper>

                  <FieldWrapper htmlFor="dateLitige" label="Date du début du litige">
                    <input
                      type="date"
                      id="dateLitige"
                      value={formData.logementDetails.dateLitige ? formatDateForInput(formData.logementDetails.dateLitige) : ''}
                      onChange={e => onNestedInputChange('logementDetails', 'dateLitige', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </FieldWrapper>

                  <FieldWrapper htmlFor="preavisPour" label="Préavis pour">
                    <SelectInput
                      id="preavisPour"
                      value={formData.logementDetails.preavisPour || ''}
                      onChange={(value) => onNestedInputChange('logementDetails', 'preavisPour', value)}
                      disabled={disabled}
                      options={[
                        { value: '', label: '' },
                        ...optionsPreavisPour
                      ]}
                    />
                  </FieldWrapper>

                  <FieldWrapper htmlFor="descriptionLitige" label="Description du litige" className="col-span-2">
                    <textarea
                      id="descriptionLitige"
                      value={formData.logementDetails.descriptionLitige || ''}
                      onChange={(e) => onNestedInputChange('logementDetails', 'descriptionLitige', e.target.value)}
                      disabled={disabled}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white transition-colors"
                      placeholder="Description détaillée du litige..."
                    />
                  </FieldWrapper>

                  <FieldWrapper htmlFor="actionsPrises" label="Actions prises" className="col-span-2">
                    <textarea
                      id="actionsPrises"
                      value={formData.logementDetails.actionsPrises || ''}
                      onChange={(e) => onNestedInputChange('logementDetails', 'actionsPrises', e.target.value)}
                      disabled={disabled}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white transition-colors"
                      placeholder="Actions entreprises pour résoudre le litige..."
                    />
                  </FieldWrapper>
                </div>
              </div>
            )}
          </div>

          {/* Section fin de contrat */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 mb-6">
            <h4 className="text-md font-semibold text-amber-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Fin de contrat / Déménagement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldWrapper htmlFor="datePreavis" label="Date du préavis">
                <input
                  type="date"
                  id="datePreavis"
                  value={formData.logementDetails.datePreavis || ''}
                  onChange={e => onNestedInputChange('logementDetails', 'datePreavis', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="dureePreavis" label="Durée du préavis">
                <SelectInput
                  id="dureePreavis"
                  value={formData.logementDetails.dureePreavis || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'dureePreavis', value)}
                  disabled={disabled}
                  options={[
                    { value: '', label: '' },
                    ...optionsDureePreavis
                  ]}
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="dateSortie" label="Date de sortie">
                <input
                  type="date"
                  id="dateSortie"
                  value={formData.logementDetails.dateSortie || ''}
                  onChange={e => onNestedInputChange('logementDetails', 'dateSortie', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="motifSortie" label="Motif de sortie">
                <TextInput
                  id="motifSortie"
                  value={formData.logementDetails.motifSortie || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'motifSortie', value)}
                  disabled={disabled}
                  placeholder="Motif de sortie"
                />
              </FieldWrapper>

              <FieldWrapper htmlFor="destinationSortie" label="Destination après sortie" className="col-span-2">
                <TextInput
                  id="destinationSortie"
                  value={formData.logementDetails.destinationSortie || ''}
                  onChange={(value) => onNestedInputChange('logementDetails', 'destinationSortie', value)}
                  disabled={disabled}
                  placeholder="Destination après sortie"
                />
              </FieldWrapper>
            </div>
          </div>

          {/* Section commentaires */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Commentaires généraux
            </h4>
            <FieldWrapper htmlFor="commentaire" label="Commentaire général sur le logement">
              <textarea
                id="commentaire"
                value={formData.logementDetails.commentaire || ''}
                onChange={(e) => onNestedInputChange('logementDetails', 'commentaire', e.target.value)}
                disabled={disabled}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-sm text-gray-900 bg-white transition-colors"
                placeholder="Commentaires généraux sur le logement..."
              />
            </FieldWrapper>
          </div>
        </div>
      )}

      {/* Section Expulsion préventive */}
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
    </div>
  );
};

export default HousingStep;

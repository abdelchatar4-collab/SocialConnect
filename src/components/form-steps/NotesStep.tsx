/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '@/components/shared/FieldWrapper';
import { TextAreaInput } from '@/components/shared/TextAreaInput';

interface NotesStepProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  disabled?: boolean;
}

export const NotesStep: React.FC<NotesStepProps> = ({
  formData,
  onInputChange,
  disabled
}) => {
  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Notes & Bilan Social</h3>
            <p className="text-sm text-amber-700">Informations complémentaires et observations</p>
          </div>
        </div>
      </div>

      {/* Section Bilan social */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
          </svg>
          Bilan social
        </h4>
        <FieldWrapper htmlFor="remarques" label="Bilan social">
          <TextAreaInput
            id="remarques"
            value={formData.remarques || ''}
            onChange={(value) => onInputChange('remarques', value)}
            disabled={disabled}
            placeholder="Bilan social de l'usager..."
            rows={4}
          />
        </FieldWrapper>
      </div>

      {/* Section Notes générales */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Notes de suivi
        </h4>
        <FieldWrapper htmlFor="notesGenerales" label="Notes générales">
          <TextAreaInput
            id="notesGenerales"
            value={formData.notesGenerales || ''}
            onChange={(value) => onInputChange('notesGenerales', value)}
            disabled={disabled}
            placeholder="Notes de suivi et observations..."
            rows={4}
          />
        </FieldWrapper>
      </div>

      {/* Section Information importante */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
        <h4 className="text-md font-semibold text-red-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Information importante
        </h4>
        <FieldWrapper htmlFor="informationImportante" label="Information importante">
          <TextAreaInput
            id="informationImportante"
            value={formData.informationImportante || ''}
            onChange={(value) => onInputChange('informationImportante', value)}
            disabled={disabled}
            placeholder="Informations importantes à retenir..."
            rows={3}
          />
        </FieldWrapper>
        <p className="text-sm text-red-600 mt-2 italic">
          <span
            className="cursor-pointer hover:text-red-800 transition-colors"
            onClick={() => {
              if (formData.informationImportante && formData.informationImportante.trim()) {
                alert(formData.informationImportante);
              } else {
                alert('Aucune information importante saisie.');
              }
            }}
            title="Cliquer pour afficher l'information importante"
          >
            ⚠️
          </span> Cette information sera mise en évidence dans le dossier
        </p>
      </div>
    </div>
  );
};

export default NotesStep;
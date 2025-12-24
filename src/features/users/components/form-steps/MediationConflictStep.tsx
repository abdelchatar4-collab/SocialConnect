import React from 'react';
import { UserFormData } from '@/types/user';
import { FormErrors } from '@/types';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { useFormSectionVisibility } from '../../hooks/useFormSectionVisibility';

interface MediationConflictStepProps {
    formData: UserFormData;
    errors: FormErrors;
    onInputChange: (field: string, value: any) => void;
    gestionnaires: { value: string; label: string }[];
    optionsAntenne: any[];
    optionsEtat: any[];
}

export const MediationConflictStep: React.FC<MediationConflictStepProps> = ({
    formData,
    errors,
    onInputChange,
    gestionnaires,
    optionsAntenne,
    optionsEtat
}) => {
    const { isSectionVisible } = useFormSectionVisibility();
    const { options: conflictTypeOptions } = useDropdownOptionsAPI('mediationType');
    const { options: statusOptions } = useDropdownOptionsAPI('mediationStatut');

    // If mediation section is disabled, don't render anything
    if (!isSectionVisible('mediation')) {
        return null;
    }

    // Fallback options if API hasn't populated them yet
    const defaultConflictTypes = [
        { value: 'Voisinage', label: 'Conflit de voisinage' },
        { value: 'Familial', label: 'Conflit familial' },
        { value: 'Logement', label: 'Conflit propriétaire/locataire' },
        { value: 'Commercial', label: 'Conflit commercial' },
        { value: 'Travail', label: 'Conflit de travail' },
        { value: 'Autre', label: 'Autre' }
    ];

    const defaultStatusOptions = [
        { value: 'En cours', label: 'En cours' },
        { value: 'Réussi', label: 'Accord trouvé' },
        { value: 'Accord partiel', label: 'Accord partiel' },
        { value: 'Échec', label: 'Échec de la médiation' },
        { value: 'Sans suite', label: 'Sans suite' }
    ];

    const conflictTypes = conflictTypeOptions.length > 0 ? conflictTypeOptions : defaultConflictTypes;
    const statusLabels = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;

    return (
        <div className="space-y-8">
            {/* Section 1: Gestion du dossier */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Gestion du dossier
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-1">Qui est le gestionnaire ?</label>
                        <select
                            value={formData.gestionnaire}
                            onChange={(e) => onInputChange('gestionnaire', e.target.value)}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                            <option value="">Sélectionner...</option>
                            {gestionnaires.map(g => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-1">État actuel</label>
                        <select
                            value={formData.etat}
                            onChange={(e) => onInputChange('etat', e.target.value)}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                            <option value="">Sélectionner...</option>
                            {optionsEtat.map((o: any) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Contexte du Litige */}
            <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
                <h3 className="text-lg font-bold text-rose-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Le Conflit
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-rose-800 mb-1">Type de conflit</label>
                        <select
                            value={formData.mediationType}
                            onChange={(e) => onInputChange('mediationType', e.target.value)}
                            className="w-full p-3 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                        >
                            <option value="">Choisir le type...</option>
                            {conflictTypes.map((o: any) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-rose-800 mb-1">Statut Médiation</label>
                        <select
                            value={formData.mediationStatut}
                            onChange={(e) => onInputChange('mediationStatut', e.target.value)}
                            className="w-full p-3 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                        >
                            <option value="">État de la médiation...</option>
                            {statusLabels.map((o: any) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-rose-800 mb-1">Qui demande la médiation ?</label>
                        <input
                            type="text"
                            value={formData.mediationDemandeur}
                            onChange={(e) => onInputChange('mediationDemandeur', e.target.value)}
                            placeholder="Ex: Le locataire, M. Dupont..."
                            className="w-full p-3 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-rose-800 mb-1">Contre qui ? (Partie adverse)</label>
                        <input
                            type="text"
                            value={formData.mediationPartieAdverse}
                            onChange={(e) => onInputChange('mediationPartieAdverse', e.target.value)}
                            placeholder="Ex: Le voisin, Mme Martin..."
                            className="w-full p-3 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-rose-800 mb-1">Résumé résumé du problème</label>
                    <textarea
                        value={formData.mediationDescription}
                        onChange={(e) => onInputChange('mediationDescription', e.target.value)}
                        rows={4}
                        placeholder="Décrivez brièvement le conflit..."
                        className="w-full p-3 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                    />
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { Palette, Wrench, Loader2 } from 'lucide-react';
import { Gestionnaire } from './types';

interface GestionnaireUtilitiesProps {
    isLoading: boolean;
    gestWithoutColorCount: number;
    onAutoConfigure: () => void;
}

export const GestionnaireUtilities: React.FC<GestionnaireUtilitiesProps> = ({
    isLoading,
    gestWithoutColorCount,
    onAutoConfigure
}) => {
    return (
        <div className="settings-card">
            <div className="settings-card-header">
                <div className="settings-card-icon settings-card-icon--green">
                    <Wrench className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="settings-card-title">Utilitaires</h3>
                    <p className="settings-card-subtitle">Outils de configuration</p>
                </div>
            </div>
            <div className="settings-card-body space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-1">Outil d'Importation Excel</h4>
                        <p className="text-sm text-gray-600">
                            Convertir et préparer les fichiers Excel pour l'importation.
                        </p>
                    </div>
                    <a
                        href="/Utilitaires/Outil-Import-Fiches-Dossiers-V3.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="settings-btn settings-btn--secondary text-sm whitespace-nowrap ml-4"
                    >
                        Ouvrir l'outil
                    </a>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                Configuration Automatique des Couleurs
                            </h4>
                            <p className="text-sm text-gray-600">
                                Attribue des couleurs uniques aux gestionnaires sans couleur.
                            </p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
                            {gestWithoutColorCount} à configurer
                        </span>
                    </div>
                    <button
                        onClick={onAutoConfigure}
                        disabled={isLoading || gestWithoutColorCount === 0}
                        className="settings-btn settings-btn--primary w-full justify-center"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                        Lancer la configuration automatique
                    </button>
                </div>
            </div>
        </div>
    );
};

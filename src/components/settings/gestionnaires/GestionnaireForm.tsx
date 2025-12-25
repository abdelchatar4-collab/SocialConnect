import React from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Gestionnaire } from './types';
import { PREDEFINED_COLORS } from './constants';

interface GestionnaireFormProps {
    currentGestionnaire: Gestionnaire;
    setCurrentGestionnaire: (g: Gestionnaire) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isAdminEditingSelf: boolean;
}

export const GestionnaireForm: React.FC<GestionnaireFormProps> = ({
    currentGestionnaire,
    setCurrentGestionnaire,
    onSubmit,
    onCancel,
    isAdminEditingSelf
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="prenom" className="settings-label">Prénom</label>
                    <input
                        id="prenom"
                        type="text"
                        value={currentGestionnaire.prenom}
                        onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, prenom: e.target.value })}
                        className="settings-input"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="nom" className="settings-label">Nom</label>
                    <input
                        id="nom"
                        type="text"
                        value={currentGestionnaire.nom || ''}
                        onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, nom: e.target.value })}
                        className="settings-input"
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="email" className="settings-label">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={currentGestionnaire.email || ''}
                        onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, email: e.target.value })}
                        className="settings-input"
                    />
                </div>


                {/* Rôle */}
                <div className="md:col-span-2">
                    <label htmlFor="role" className="settings-label">Rôle</label>
                    <select
                        name="role"
                        value={currentGestionnaire.role || 'USER'}
                        onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, role: e.target.value })}
                        className={`settings-input ${(isAdminEditingSelf || currentGestionnaire.role === 'SUPER_ADMIN') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={isAdminEditingSelf || currentGestionnaire.role === 'SUPER_ADMIN'}
                    >
                        <option value="USER">Utilisateur (USER)</option>
                        <option value="ADMIN">Administrateur (ADMIN)</option>
                        {currentGestionnaire.role === 'SUPER_ADMIN' && (
                            <option value="SUPER_ADMIN">Super Administrateur (SUPER_ADMIN)</option>
                        )}
                    </select>
                    {isAdminEditingSelf && (
                        <p className="settings-hint">Vous ne pouvez pas modifier votre propre rôle.</p>
                    )}
                    {currentGestionnaire.role === 'SUPER_ADMIN' && !isAdminEditingSelf && (
                        <p className="settings-hint">Le rôle SUPER_ADMIN ne peut être modifié que via la console.</p>
                    )}
                </div>

                {/* État du compte */}
                <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={currentGestionnaire.isActive !== false}
                            onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, isActive: e.target.checked })}
                            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            disabled={isAdminEditingSelf}
                        />
                        <div>
                            <span className="block font-medium text-gray-800">Compte actif</span>
                            <span className="block text-xs text-gray-500">
                                {currentGestionnaire.isActive !== false
                                    ? "Le gestionnaire peut se connecter au système."
                                    : "Le gestionnaire est actuellement désactivé (ex: congé, départ)."}
                            </span>
                        </div>
                    </label>
                </div>

                {/* Gestionnaire de dossiers */}
                <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={currentGestionnaire.isGestionnaireDossier !== false}
                            onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, isGestionnaireDossier: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div>
                            <span className="block font-medium text-gray-800">Gestionnaire de dossiers</span>
                            <span className="block text-xs text-gray-500">
                                {currentGestionnaire.isGestionnaireDossier !== false
                                    ? "Apparaît dans les listes d'assignation de dossiers usagers."
                                    : "N'apparaît pas dans les listes (coordinateur, évaluateur, admin)."}
                            </span>
                        </div>
                    </label>
                </div>

                {/* Couleur */}
                <div className="md:col-span-2">
                    <label className="settings-label">
                        Couleur du médaillon
                        <span className="font-normal text-gray-500 ml-2">
                            ({PREDEFINED_COLORS.length} dégradés disponibles)
                        </span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                        {PREDEFINED_COLORS.map((color, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentGestionnaire({
                                    ...currentGestionnaire,
                                    couleurMedaillon: JSON.stringify({ from: color.from, to: color.to })
                                })}
                                className={`relative p-1.5 rounded-lg border-2 transition-all hover:scale-105 group ${(() => {
                                    try {
                                        const currentColor = currentGestionnaire.couleurMedaillon
                                            ? JSON.parse(currentGestionnaire.couleurMedaillon)
                                            : null;
                                        return currentColor?.from === color.from
                                            ? 'border-cyan-500 ring-1 ring-cyan-200'
                                            : 'border-transparent hover:border-gray-200';
                                    } catch {
                                        return 'border-transparent hover:border-gray-200';
                                    }
                                })()}`}
                                title={color.name}
                            >
                                <div
                                    className="w-6 h-6 rounded-full mx-auto mb-1 shadow-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${color.from}, ${color.to})`
                                    }}
                                />
                                {(() => {
                                    try {
                                        const currentColor = currentGestionnaire.couleurMedaillon
                                            ? JSON.parse(currentGestionnaire.couleurMedaillon)
                                            : null;
                                        return currentColor?.from === color.from && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                                                <span className="text-white text-[10px]">✓</span>
                                            </div>
                                        );
                                    } catch {
                                        return null;
                                    }
                                })()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="settings-btn settings-btn--secondary"
                >
                    <X className="w-4 h-4" />
                    Annuler
                </button>
                <button
                    type="submit"
                    className="settings-btn settings-btn--primary"
                >
                    <Save className="w-4 h-4" />
                    Enregistrer
                </button>
            </div>
        </form>
    );
};

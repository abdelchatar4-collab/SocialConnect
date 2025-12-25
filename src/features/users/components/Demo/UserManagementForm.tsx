/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Demo Form Component
Extracted from UserManagementDemo.tsx
*/

import { UserFormData } from '@/types/user';

interface UserManagementFormProps {
    formData: UserFormData;
    updateField: (field: keyof UserFormData, value: any) => void;
    fieldErrors: Record<string, string>;
    isValid: boolean;
    handleSubmit: () => void;
    isSaving: boolean;
    canSubmit: boolean;
    hasUnsavedChanges: boolean;
}

export const UserManagementForm: React.FC<UserManagementFormProps> = ({
    formData,
    updateField,
    fieldErrors,
    isValid,
    handleSubmit,
    isSaving,
    canSubmit,
    hasUnsavedChanges
}) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Nouveau Utilisateur</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => updateField('nom', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.nom ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nom de famille"
                        />
                        {fieldErrors.nom && <p className="text-red-500 text-sm mt-1">{fieldErrors.nom}</p>}
                    </div>

                    {/* Prénom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => updateField('prenom', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.prenom ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Prénom"
                        />
                        {fieldErrors.prenom && <p className="text-red-500 text-sm mt-1">{fieldErrors.prenom}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="email@example.com"
                        />
                        {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
                    </div>

                    {/* Téléphone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                        <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => updateField('telephone', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.telephone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="01 23 45 67 89"
                        />
                        {fieldErrors.telephone && <p className="text-red-500 text-sm mt-1">{fieldErrors.telephone}</p>}
                    </div>

                    {/* Gestionnaire */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gestionnaire *</label>
                        <select
                            value={formData.gestionnaire}
                            onChange={(e) => updateField('gestionnaire', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.gestionnaire ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Sélectionner un gestionnaire</option>
                            <option value="gestionnaire1">Gestionnaire 1</option>
                            <option value="gestionnaire2">Gestionnaire 2</option>
                            <option value="gestionnaire3">Gestionnaire 3</option>
                        </select>
                        {fieldErrors.gestionnaire && <p className="text-red-500 text-sm mt-1">{fieldErrors.gestionnaire}</p>}
                    </div>

                    {/* Nationalité */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité *</label>
                        <input
                            type="text"
                            value={formData.nationalite}
                            onChange={(e) => updateField('nationalite', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.nationalite ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nationalité"
                        />
                        {fieldErrors.nationalite && <p className="text-red-500 text-sm mt-1">{fieldErrors.nationalite}</p>}
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSaving}
                        className={`px-6 py-2 rounded-md font-medium ${canSubmit && !isSaving ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        {isSaving ? 'Création en cours...' : 'Créer Utilisateur'}
                    </button>
                    {hasUnsavedChanges && <div className="flex items-center text-orange-600"><span className="text-sm">⚠ Modifications non sauvegardées</span></div>}
                </div>

                <div className="mt-4">
                    <div className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {isValid ? '✓ Formulaire valide' : '✗ Formulaire invalide'}
                    </div>
                </div>
            </div>
        </div>
    );
};

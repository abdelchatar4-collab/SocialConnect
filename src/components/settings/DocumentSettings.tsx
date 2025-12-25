'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';

type Tab = 'general' | 'rgpd' | 'userProfile';

export const DocumentSettings: React.FC = () => {
    const {
        docRetentionPeriod, setDocRetentionPeriod,
        docServiceAddress, setDocServiceAddress,
        docServiceCity, setDocServiceCity,
        docServicePhone, setDocServicePhone,
        docFooterText, setDocFooterText,
        docRgpdTitle, setDocRgpdTitle,
        docRgpdSections, setDocRgpdSections,
        docUserProfileSections, setDocUserProfileSections,
        docAntenneAddresses, setDocAntenneAddresses,
        saveSettings
    } = useAdmin();

    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            await saveSettings();
            setMessage('Paramètres sauvegardés !');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            setMessage('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const updateAntenne = (key: string, field: 'rue' | 'cp', value: string) => {
        setDocAntenneAddresses({
            ...docAntenneAddresses,
            [key]: { ...docAntenneAddresses[key], [field]: value }
        });
    };

    const handleAddAntenne = () => {
        const newKey = `antenne_${Date.now()}`;
        setDocAntenneAddresses({
            ...docAntenneAddresses,
            [newKey]: { rue: '', cp: '1070 ANDERLECHT' }
        });
    };

    const handleDeleteAntenne = (key: string) => {
        if (key === 'default') return;
        const updated = { ...docAntenneAddresses };
        delete updated[key];
        setDocAntenneAddresses(updated);
    };

    const handleRenameAntenne = (oldKey: string, newKey: string) => {
        if (oldKey === newKey || !newKey.trim()) return;
        const sanitizedKey = newKey.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        if (docAntenneAddresses[sanitizedKey] && sanitizedKey !== oldKey) return;
        const updated: Record<string, { rue: string; cp: string }> = {};
        Object.entries(docAntenneAddresses).forEach(([k, v]) => {
            updated[k === oldKey ? sanitizedKey : k] = v;
        });
        setDocAntenneAddresses(updated);
    };

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'general', label: 'Général', icon: '⚙️' },
        { id: 'rgpd', label: 'Attestation RGPD', icon: '📜' },
        { id: 'userProfile', label: 'Fiche Usager', icon: '👤' },
    ];

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Paramètres partagés par tous les documents.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du service (défaut)</label>
                            <input type="text" value={docServiceAddress} onChange={(e) => setDocServiceAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville / CP</label>
                            <input type="text" value={docServiceCity} onChange={(e) => setDocServiceCity(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="text" value={docServicePhone} onChange={(e) => setDocServicePhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="02/XXX.XX.XX" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texte du pied de page</label>
                        <input type="text" value={docFooterText} onChange={(e) => setDocFooterText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>

                    {/* Antenne Addresses */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Adresses par Antenne</h4>
                            <button onClick={handleAddAntenne} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">+ Ajouter</button>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(docAntenneAddresses).map(([key, addr]) => (
                                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <input type="text" value={key} onChange={(e) => handleRenameAntenne(key, e.target.value)}
                                        className="w-24 px-2 py-1 text-sm font-medium border border-gray-300 rounded" />
                                    <input type="text" value={addr.rue} onChange={(e) => updateAntenne(key, 'rue', e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded" placeholder="Rue" />
                                    <input type="text" value={addr.cp} onChange={(e) => updateAntenne(key, 'cp', e.target.value)}
                                        className="w-36 px-2 py-1 text-sm border border-gray-300 rounded" placeholder="CP Ville" />
                                    {key !== 'default' && (
                                        <button onClick={() => handleDeleteAntenne(key)} className="p-1 text-red-600 hover:bg-red-100 rounded">✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* RGPD Tab */}
            {activeTab === 'rgpd' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Paramètres spécifiques à l'attestation RGPD.</p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du document</label>
                        <textarea value={docRgpdTitle} onChange={(e) => setDocRgpdTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={2} />
                        <p className="text-xs text-gray-400 mt-1">Titre principal affiché en haut de l'attestation</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durée de conservation des données</label>
                        <input type="text" value={docRetentionPeriod} onChange={(e) => setDocRetentionPeriod(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="3 ans" />
                        <p className="text-xs text-gray-400 mt-1">Affiché dans la section "Durée de conservation"</p>
                    </div>

                    <div className="border-t pt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Sections visibles</h5>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries({ intro: 'Introduction RGPD', pourquoi: 'Pourquoi collecter', stockage: 'Stockage et sécurité', conservation: 'Durée conservation', acces: 'Qui a accès', signature: 'Zone de signature' }).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={docRgpdSections?.[key] ?? true}
                                        onChange={(e) => setDocRgpdSections({ ...docRgpdSections, [key]: e.target.checked })}
                                        className="rounded border-gray-300" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Tab */}
            {activeTab === 'userProfile' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Sections à afficher dans la fiche usager.</p>

                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries({ identite: 'Identité', contact: 'Contact', situationSociale: 'Situation sociale', gestion: 'Gestion du dossier', logement: 'Logement', prevExp: 'Prévention Expulsion', notes: 'Notes importantes' }).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={docUserProfileSections?.[key] ?? true}
                                    onChange={(e) => setDocUserProfileSections({ ...docUserProfileSections, [key]: e.target.checked })}
                                    className="rounded border-gray-300" />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-4 border-t">
                <button onClick={handleSave} disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm">
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                {message && <span className={`text-sm ${message.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>{message}</span>}
            </div>
        </div>
    );
};

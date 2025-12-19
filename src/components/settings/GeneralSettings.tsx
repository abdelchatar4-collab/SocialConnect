/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * GeneralSettings - Modern redesigned version
 * Service name and logo configuration
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Building2, Image, Save, Loader2, ExternalLink } from 'lucide-react';

export default function GeneralSettings() {
    const { serviceName, setServiceName, logoUrl, setLogoUrl } = useAdmin();
    const [localName, setLocalName] = useState(serviceName);
    const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalName(serviceName);
        setLocalLogoUrl(logoUrl);
    }, [serviceName, logoUrl]);

    const handleSave = () => {
        setServiceName(localName);
        setLogoUrl(localLogoUrl);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Service Name */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--blue">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Nom du Service</h3>
                        <p className="settings-card-subtitle">Identité de l'application</p>
                    </div>
                </div>
                <div className="settings-card-body">
                    <input
                        type="text"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        className="settings-input"
                        placeholder="Ex: Le Pôle Accueil Social Des Quartiers"
                    />
                    <p className="settings-hint">
                        Ce nom sera affiché dans l'en-tête de l'application
                    </p>
                </div>
            </div>

            {/* Logo */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--green">
                        <Image className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Logo Communal</h3>
                        <p className="settings-card-subtitle">Image du header</p>
                    </div>
                </div>
                <div className="settings-card-body space-y-4">
                    <div>
                        <label className="settings-label">URL ou chemin du logo</label>
                        <input
                            type="text"
                            value={localLogoUrl}
                            onChange={(e) => setLocalLogoUrl(e.target.value)}
                            className="settings-input"
                            placeholder="Ex: /logo-mairie.png"
                        />
                        <p className="settings-hint">
                            Chemin vers l'image dans le dossier public ou URL externe
                        </p>
                    </div>

                    {/* Preview */}
                    {localLogoUrl && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Aperçu
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={localLogoUrl}
                                        alt="Logo preview"
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <a
                                    href={localLogoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                                >
                                    Voir en grand <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {isSaved && (
                    <span className="text-sm font-medium text-green-600">
                        ✓ Modifications enregistrées
                    </span>
                )}
                <button
                    onClick={handleSave}
                    className="settings-btn settings-btn--primary"
                >
                    <Save className="w-4 h-4" />
                    Enregistrer
                </button>
            </div>
        </div>
    );
}

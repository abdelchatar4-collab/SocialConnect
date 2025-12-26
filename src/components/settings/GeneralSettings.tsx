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
    const { serviceName, setServiceName, logoUrl, setLogoUrl, absenceNotificationEmail, setAbsenceNotificationEmail, sharepointUrl, setSharepointUrl, sharepointUrlAdmin, setSharepointUrlAdmin, saveSettings } = useAdmin();
    const [localName, setLocalName] = useState(serviceName);
    const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);
    const [localEmail, setLocalEmail] = useState(absenceNotificationEmail || '');
    const [localSpUrl, setLocalSpUrl] = useState(sharepointUrl || '');
    const [localSpAdminUrl, setLocalSpAdminUrl] = useState(sharepointUrlAdmin || '');
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalName(serviceName);
        setLocalLogoUrl(logoUrl);
        setLocalEmail(absenceNotificationEmail || '');
        setLocalSpUrl(sharepointUrl || '');
        setLocalSpAdminUrl(sharepointUrlAdmin || '');
    }, [serviceName, logoUrl, absenceNotificationEmail, sharepointUrl, sharepointUrlAdmin]);

    const handleSave = async () => {
        setIsSaving(true);
        // 1. Update Context State
        setServiceName(localName);
        setLogoUrl(localLogoUrl);
        setAbsenceNotificationEmail(localEmail);
        setSharepointUrl(localSpUrl);
        setSharepointUrlAdmin(localSpAdminUrl);

        // 2. Persist to Backend with overrides (to avoid race condition)
        try {
            await saveSettings({
                serviceName: localName,
                logoUrl: localLogoUrl,
                absenceNotificationEmail: localEmail,
                sharepointUrl: localSpUrl,
                sharepointUrlAdmin: localSpAdminUrl
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            // Optionally handle error UI here
        } finally {
            setIsSaving(false);
        }
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

            {/* SharePoint */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--blue">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12.49 5.56L9.82 2.91C9.69 2.78 9.5 2.72 9.32 2.76L4.06 4.09C3.78 4.16 3.56 4.38 3.49 4.67l-1.33 5.3c-.04.18.02.37.15.5l5.59 5.59c.39.39 1.02.39 1.41 0l6.23-6.23c.39-.39.39-1.02 0-1.41L13.9 6.88c-.39-.38-1.02-.38-1.41-1.32zm-6.25 1.5l1.9-1.9 1.14 1.14-1.9 1.9-1.14-1.14zm1.52 7.64l-1.9-1.9 1.14-1.14 1.9 1.9-1.14 1.14zM16.5 13c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" opacity=".3" /><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9l-4 4-4-4 1.4-1.4L9 11.2V7h2v4.2l2.6-2.6L13 11z" /></svg>
                    </div>
                    <div>
                        <h3 className="settings-card-title">SharePoint / Cloud</h3>
                        <p className="settings-card-subtitle">Raccourci vers vos fichiers</p>
                    </div>
                </div>
                <div className="settings-card-body space-y-4">
                    {/* Team Link */}
                    <div>
                        <label className="settings-label">Lien Équipe (Accès général)</label>
                        <input
                            type="url"
                            value={localSpUrl}
                            onChange={(e) => { setLocalSpUrl(e.target.value); setIsSaved(false); }}
                            className="settings-input"
                            placeholder="Ex: https://mycompany.sharepoint.com/sites/Team..."
                        />
                        <p className="settings-hint">
                            Visible par tous les utilisateurs disposant d'un compte.
                        </p>
                    </div>

                    {/* Admin Link */}
                    <div>
                        <label className="settings-label text-amber-700">Lien Privé (Admin Only)</label>
                        <input
                            type="url"
                            value={localSpAdminUrl}
                            onChange={(e) => { setLocalSpAdminUrl(e.target.value); setIsSaved(false); }}
                            className="settings-input border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                            placeholder="Ex: https://mycompany.sharepoint.com/personal/admin..."
                        />
                        <p className="settings-hint text-amber-600">
                            Visible uniquement par vous et achatar@anderlecht.brussels.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--purple">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <div>
                        <h3 className="settings-card-title">Notifications</h3>
                        <p className="settings-card-subtitle">Alertes et emails</p>
                    </div>
                </div>
                <div className="settings-card-body">
                    <label className="settings-label">Email administratif absences</label>
                    <input
                        type="email"
                        value={localEmail}
                        onChange={(e) => { setLocalEmail(e.target.value); setIsSaved(false); }}
                        className="settings-input"
                        placeholder="Ex: direction@socialconnect.be"
                    />
                    <p className="settings-hint">
                        Les demandes de congés seront envoyées à cette adresse.
                    </p>
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
                    disabled={isSaving}
                    className="settings-btn settings-btn--primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}

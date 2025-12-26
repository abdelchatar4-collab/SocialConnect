/*
Copyright (C) 2025 AC
SocialConnect - Premium Partners Directory Page
*/

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAiSettings } from '@/hooks/ai/useAiSettingsCore';
import { PartnerCard } from '@/components/partners/PartnerCard';
import { PartnerFilters } from '@/components/partners/PartnerFilters';
import { PartnerVerifyModal } from '@/components/partners/PartnerVerifyModal';

interface Partner {
    id: number;
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    thematique: string;
    contact: string;
    isActive: boolean;
}

interface PartnerGroup {
    thematique: string;
    partenaires: Partner[];
    count: number;
}

const thematiqueColors: Record<string, { bg: string; text: string; border: string }> = {
    'DROIT DES ÉTRANGERS': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'AIDE ALIMENTAIRE': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'LOGEMENT': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'SANTÉ': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'EMPLOI': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'JURIDIQUE': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'SOCIAL': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'DEFAULT': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const getThematiqueColor = (thematique: string) => {
    const upperThematique = thematique.toUpperCase();
    for (const [key, value] of Object.entries(thematiqueColors)) {
        if (upperThematique.includes(key)) return value;
    }
    return thematiqueColors.DEFAULT;
};

export default function PartnersDirectoryPage() {
    const [groups, setGroups] = useState<PartnerGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedThematique, setSelectedThematique] = useState<string | null>(null);
    const [lastModified, setLastModified] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // AI Verification state
    const [verifyingPartner, setVerifyingPartner] = useState<Partner | null>(null);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const { settings } = useAiSettings();

    useEffect(() => { fetchPartners(); }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/partners-directory');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setGroups(data.groups || []);
            setLastModified(data.lastModified);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const handleVerifyPartner = async (partner: Partner) => {
        setVerifyingPartner(partner); setShowVerifyModal(true); setVerificationLoading(true);
        setVerificationError(null); setVerificationResult(null);
        try {
            const r = await fetch('/api/partners-directory/verify', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerName: partner.nom, currentData: partner })
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            setVerificationResult(d.verification);
        } catch (err: any) { setVerificationError(err.message); } finally { setVerificationLoading(false); }
    };

    const handleApplyUpdate = async () => {
        if (!verifyingPartner || !verificationResult) return;
        setUpdateLoading(true);
        try {
            const updates: any = {};
            verificationResult.changes.forEach((c: any) => updates[c.field] = c.newValue);
            const r = await fetch('/api/partners-directory/update', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId: verifyingPartner.id, updates })
            });
            if (!r.ok) throw new Error('Update failed');
            await fetchPartners(); setShowVerifyModal(false);
        } catch (err: any) { setVerificationError(err.message); } finally { setUpdateLoading(false); }
    };

    const filteredGroups = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (selectedThematique) {
            return groups.filter(g => g.thematique === selectedThematique)
                .map(g => ({ ...g, partenaires: g.partenaires.filter(p => !query || p.nom.toLowerCase().includes(query)) }))
                .filter(g => g.partenaires.length > 0);
        }
        if (query) {
            const flat = groups.flatMap(g => g.partenaires).filter(p => p.nom.toLowerCase().includes(query));
            return [{ thematique: 'RÉSULTATS', partenaires: flat, count: flat.length }];
        }
        return groups;
    }, [groups, searchQuery, selectedThematique]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 text-white pt-20 pb-24 px-4 text-center">
                <h1 className="text-5xl font-black mb-6">Annuaire des Partenaires</h1>
            </div>

            <PartnerFilters
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                selectedThematique={selectedThematique} setSelectedThematique={setSelectedThematique}
                isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} groups={groups}
            />

            <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
                {filteredGroups.map(group => (
                    <div key={group.thematique}>
                        <h2 className="text-xl font-bold text-slate-700 uppercase mb-10">{group.thematique}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {group.partenaires.map(p => (
                                <PartnerCard key={p.id} partner={p} colors={getThematiqueColor(p.thematique)}
                                    aiEnabled={settings.enabled && settings.geminiEnabled !== false} onVerify={handleVerifyPartner} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showVerifyModal && (
                <PartnerVerifyModal partner={verifyingPartner} result={verificationResult}
                    loading={verificationLoading} error={verificationError} updateLoading={updateLoading}
                    onClose={() => setShowVerifyModal(false)} onRetry={() => handleVerifyPartner(verifyingPartner!)}
                    onApply={handleApplyUpdate} />
            )}
        </div>
    );
}

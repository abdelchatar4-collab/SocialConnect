/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Composant principal d'administration des prestations
*/

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePrestations } from '@/contexts/PrestationContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdmin } from '@/contexts/AdminContext';
import { CalendarIcon, UserGroupIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Composants extraits
import { PrestationEditModal } from './PrestationEditModal';
import { PrestationExportSection, OfficialExportSection } from './PrestationExportSections';
import { PrestationTable } from './PrestationTable';
import { QuotaManagement } from './QuotaManagement';

export const PrestationAdmin: React.FC = () => {
    const { prestations, isPrestationLoading, refreshPrestations, deletePrestation } = usePrestations();
    const { primaryColor } = useAdmin();
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState<'prestations' | 'quotas'>('prestations');

    // Filtres
    const [filterName, setFilterName] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Export states
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Official export
    const [exportYear, setExportYear] = useState(2026);
    const [isExportingOfficial, setIsExportingOfficial] = useState(false);

    // Edit/Delete states
    const [editingPrestation, setEditingPrestation] = useState<any>(null);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        refreshPrestations();
    }, [refreshPrestations]);

    const filteredPrestations = prestations.filter(p => {
        const matchesName = (p as any).gestionnaire?.prenom?.toLowerCase().includes(filterName.toLowerCase()) ||
            (p as any).gestionnaire?.nom?.toLowerCase().includes(filterName.toLowerCase());
        const matchesDate = filterDate ? p.date.startsWith(filterDate) : true;
        return matchesName && matchesDate;
    });

    const handleExport = async () => {
        setIsExporting(true);
        setExportMessage(null);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const response = await fetch(`/api/prestations/export?${params.toString()}`);
            if (!response.ok) throw new Error((await response.json()).error || 'Erreur export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Prestations_${startDate}_${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setExportMessage({ type: 'success', text: '✅ Export téléchargé !' });
            setTimeout(() => setExportMessage(null), 5000);
        } catch (error: any) {
            setExportMessage({ type: 'error', text: `❌ ${error.message}` });
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportOfficial = async () => {
        setIsExportingOfficial(true);
        setExportMessage(null);
        try {
            const response = await fetch(`/api/prestations/export-official?year=${exportYear}`);
            if (!response.ok) throw new Error((await response.json()).error || 'Erreur export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Enregistrement_Temps_Travail_${exportYear}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setExportMessage({ type: 'success', text: '✅ Export officiel téléchargé !' });
            setTimeout(() => setExportMessage(null), 5000);
        } catch (error: any) {
            setExportMessage({ type: 'error', text: `❌ ${error.message}` });
        } finally {
            setIsExportingOfficial(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredPrestations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredPrestations.map((p: any) => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Supprimer ${selectedIds.size} prestation(s) ?`)) return;
        setIsDeleting(true);
        let successCount = 0;
        for (const id of selectedIds) {
            if (await deletePrestation(id)) successCount++;
        }
        setIsDeleting(false);
        setSelectedIds(new Set());
        setActionMessage({ type: 'success', text: `✅ ${successCount} prestation(s) supprimée(s) !` });
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleEdit = async (data: any) => {
        try {
            const response = await fetch('/api/prestations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Erreur modification');
            setEditingPrestation(null);
            await refreshPrestations();
            setActionMessage({ type: 'success', text: '✅ Prestation modifiée !' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error: any) {
            setActionMessage({ type: 'error', text: `❌ ${error.message}` });
        }
    };

    const handleDelete = async (id: string, gestionnaireName: string) => {
        if (!confirm(`Supprimer la prestation de ${gestionnaireName} ?`)) return;
        try {
            if (await deletePrestation(id)) {
                setActionMessage({ type: 'success', text: '✅ Prestation supprimée !' });
                setTimeout(() => setActionMessage(null), 3000);
            } else throw new Error('Échec suppression');
        } catch (error: any) {
            setActionMessage({ type: 'error', text: `❌ ${error.message}` });
        }
    };

    return (
        <>
            <Card className="p-6 space-y-6">
                {/* Action Message */}
                {actionMessage && (
                    <div className={`p-4 rounded-xl flex items-center gap-2 ${actionMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {actionMessage.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
                        <span className="font-medium">{actionMessage.text}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-2">
                    <button
                        onClick={() => setViewMode('prestations')}
                        className={`pb-3 px-4 text-sm font-medium transition-all relative ${viewMode === 'prestations' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Gestion des Prestations
                        {viewMode === 'prestations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: primaryColor }} />}
                    </button>
                    <button
                        onClick={() => setViewMode('quotas')}
                        className={`pb-3 px-4 text-sm font-medium transition-all relative ${viewMode === 'quotas' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Soldes & Quotas (2026)
                        {viewMode === 'quotas' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: primaryColor }} />}
                    </button>
                </div>

                {viewMode === 'quotas' ? (
                    <QuotaManagement />
                ) : (
                    <>
                        {/* Header avec filtres */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Suivi des Prestations</h2>
                                <p className="text-gray-500">Consultez et gérez les heures prestées par l'équipe.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Filtrer par nom..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Export Sections */}
                        <PrestationExportSection
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            onExport={handleExport}
                            isExporting={isExporting}
                            exportMessage={exportMessage}
                        />
                        <OfficialExportSection
                            exportYear={exportYear}
                            onYearChange={setExportYear}
                            onExport={handleExportOfficial}
                            isExporting={isExportingOfficial}
                        />

                        {/* Bulk Delete */}
                        {selectedIds.size > 0 && (
                            <div className="mb-4 flex items-center gap-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <span className="text-sm font-bold text-red-700">{selectedIds.size} sélectionné(s)</span>
                                <Button onClick={handleBulkDelete} disabled={isDeleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">
                                    {isDeleting ? 'Suppression...' : 'Supprimer la sélection'}
                                </Button>
                                <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                            </div>
                        )}

                        {/* Table */}
                        <PrestationTable
                            prestations={filteredPrestations}
                            isLoading={isPrestationLoading}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onToggleSelectAll={toggleSelectAll}
                            onEdit={setEditingPrestation}
                            onDelete={handleDelete}
                            primaryColor={primaryColor}
                        />
                    </>
                )}
            </Card>

            {editingPrestation && (
                <PrestationEditModal
                    prestation={editingPrestation}
                    onClose={() => setEditingPrestation(null)}
                    onSave={handleEdit}
                />
            )}
        </>
    );
};

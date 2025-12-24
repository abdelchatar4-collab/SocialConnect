/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React from 'react';
import { usePrestations } from '@/contexts/PrestationContext';
import { formatDurationHuman } from '@/utils/prestationUtils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ClockIcon, CalendarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAdmin } from '@/contexts/AdminContext';
import { SoldeCongeDisplay } from '@/features/prestations/components/SoldeCongeDisplay';

export default function PrestationsPage() {
    const { prestations, setIsPrestationOpening, deletePrestation } = usePrestations();
    const { primaryColor } = useAdmin();

    // Stats simples pour l'utilisateur
    const totalMinutes = prestations.reduce((acc, p) => acc + p.dureeNet, 0);
    const totalBonis = prestations.reduce((acc, p) => acc + p.bonis, 0);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mes Prestations</h1>
                    <p className="text-gray-500 mt-1">Gérez votre temps de travail et vos absences.</p>
                </div>

                <button
                    onClick={() => setIsPrestationOpening(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                >
                    <PlusIcon className="w-5 h-5" />
                    Nouvelle prestation
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4" style={{ borderLeftColor: primaryColor }}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary-50">
                            <ClockIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Total Période</span>
                            <div className="text-2xl font-black text-gray-900">{formatDurationHuman(totalMinutes)}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-50">
                            <CalendarIcon className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Total Bonis</span>
                            <div className="text-2xl font-black text-amber-600">+{formatDurationHuman(totalBonis)}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-teal-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-teal-50">
                            <ClockIcon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Jours Payés</span>
                            <div className="text-2xl font-black text-teal-900">{Math.floor(totalMinutes / 450)}j</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Meter & Soldes */}
            <SoldeCongeDisplay />

            {/* Recent History */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Historique récent
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prestations.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100 italic">
                            Aucune donnée pour le moment.
                        </div>
                    ) : (
                        prestations.map(p => (
                            <Card key={p.id} className="p-5 hover:shadow-md transition-shadow group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">
                                            {new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </div>
                                        <div className="text-xs text-gray-400">{p.heureDebut} - {p.heureFin} (Pause: {p.pause}min)</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge variant="outline" className="rounded-full">{p.motif}</Badge>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Supprimer cette prestation ?')) deletePrestation(p.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-2xl font-black text-gray-900">{formatDurationHuman(p.dureeNet)}</div>
                                    <div className="flex gap-1">
                                        {p.bonis > 0 && <Badge variant="warning" className="text-[10px]">+{formatDurationHuman(p.bonis)}</Badge>}
                                        {p.isOvertime && <Badge variant="destructive" className="text-[10px]">19h+</Badge>}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

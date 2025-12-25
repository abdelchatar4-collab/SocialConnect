/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Recent Prestations List
*/

import React from 'react';
import { formatDurationHuman } from '@/utils/prestationUtils';

interface RecentPrestationsListProps {
    prestations: any[];
}

export const RecentPrestationsList: React.FC<RecentPrestationsListProps> = ({ prestations }) => {
    if (prestations.length === 0) {
        return <div className="text-center py-8 text-gray-400 text-sm">Aucune prestation</div>;
    }

    return (
        <div className="space-y-2">
            {prestations.map(p => (
                <div key={p.id} className="p-2.5 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700">
                            {new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.motif}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{p.heureDebut} - {p.heureFin}</span>
                        <span className="font-bold text-gray-900">{formatDurationHuman(p.dureeNet)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

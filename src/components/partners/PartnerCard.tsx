/*
Copyright (C) 2025 AC
SocialConnect - Partner Card Component
*/

import React from 'react';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface Partner {
    id: number;
    excelRowIndex: number;
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    thematique: string;
    contact: string;
    isActive: boolean;
}

interface PartnerCardProps {
    partner: Partner;
    colors: { bg: string; text: string; border: string };
    aiEnabled: boolean;
    onVerify: (partner: Partner) => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
    partner,
    colors,
    aiEnabled,
    onVerify
}) => {
    return (
        <div className="group relative bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
            {/* Header & Status */}
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-slate-50 group-hover:${colors.bg} transition-colors duration-500`}>
                    <BuildingOfficeIcon className={`w-8 h-8 text-slate-400 group-hover:${colors.text}`} />
                </div>
                <div className="flex flex-col items-end gap-2">
                    {partner.isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider ring-1 ring-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Actif
                        </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        {partner.thematique}
                    </span>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 group-hover:text-violet-600 transition-colors mb-6 leading-tight min-h-[3rem]">
                {partner.nom}
            </h3>

            {/* Contact Details */}
            <div className="space-y-4 mb-8 flex-1">
                {partner.adresse && (
                    <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium leading-relaxed">{partner.adresse}</span>
                    </div>
                )}
                {partner.telephone && (
                    <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-slate-400 shrink-0" />
                        <a href={`tel:${partner.telephone}`} className="text-slate-600 font-bold hover:text-violet-600 transition-colors">
                            {partner.telephone}
                        </a>
                    </div>
                )}
                {partner.email && (
                    <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-slate-400 shrink-0" />
                        <a href={`mailto:${partner.email}`} className="text-slate-600 font-medium truncate hover:text-violet-600 transition-colors underline decoration-slate-200 underline-offset-4">
                            {partner.email}
                        </a>
                    </div>
                )}
            </div>

            {/* AI Verification Button */}
            <div className="pt-6 border-t border-slate-50 mt-auto">
                {aiEnabled && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onVerify(partner);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-800 transition-all shadow-md hover:shadow-xl active:scale-95 group"
                    >
                        <SparklesIcon className="w-5 h-5 group-hover:animate-pulse" />
                        <span>Vérifier les coordonnées</span>
                    </button>
                )}
            </div>
        </div>
    );
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Mode d'emploi interactif pour l'outil Prestations
*/

"use client";

import React, { useState } from 'react';
import {
    QuestionMarkCircleIcon,
    XMarkIcon,
    ClockIcon,
    CalendarDaysIcon,
    PlusCircleIcon,
    ChartBarIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface PrestationHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    primaryColor?: string;
}

const steps = [
    {
        icon: PlusCircleIcon,
        title: "Deux modes d'encodage",
        description: "Choisissez entre le Mode Rapide (préréglages) ou le Mode Classique (personnalisé).",
        color: "bg-blue-500",
        tips: [
            "⚡ Mode Rapide : 8 préréglages prêts à l'emploi",
            "🔧 Mode Classique : définissez vos propres horaires",
            "Basculez entre les modes avec les boutons en haut"
        ]
    },
    {
        icon: CalendarDaysIcon,
        title: "Dates et périodes",
        description: "Encodez un jour unique ou une période entière en un seul clic.",
        color: "bg-purple-500",
        tips: [
            "📅 Activez 'Mode période' pour encoder plusieurs jours",
            "Les week-ends sont automatiquement exclus ✓",
            "Les 16 jours fériés 2026 sont gérés automatiquement ✓"
        ]
    },
    {
        icon: ClockIcon,
        title: "Horaire habituel",
        description: "Vos horaires par défaut sont mémorisés et réutilisés automatiquement.",
        color: "bg-teal-500",
        tips: [
            "Définissez votre horaire habituel dans les paramètres",
            "Le formulaire s'ouvre avec vos valeurs par défaut",
            "Pause minimum : 30 min pour calcul correct"
        ]
    },
    {
        icon: ChartBarIcon,
        title: "Calculs automatiques",
        description: "Bonis, heures supplémentaires et soldes sont calculés en temps réel.",
        color: "bg-amber-500",
        tips: [
            "Base journalière : 7h30 (450 min)",
            "Bonis = toute minute au-delà de 7h30 net",
            "Heures après 19h = heures supplémentaires"
        ]
    },
    {
        icon: DevicePhoneMobileIcon,
        title: "Suivi des soldes",
        description: "Visualisez vos congés VA, CH, récupérations et bonis accumulés.",
        color: "bg-rose-500",
        tips: [
            "Jauges visuelles pour chaque type de solde",
            "Export Excel disponible (gestionnaires)",
            "Historique complet accessible sur la page"
        ]
    }
];

export const PrestationHelpModal: React.FC<PrestationHelpModalProps> = ({
    isOpen,
    onClose,
    primaryColor = '#3b82f6'
}) => {
    const [activeStep, setActiveStep] = useState(0);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header avec gradient */}
                <div
                    className="relative p-6 text-white overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}
                >
                    {/* Décoration */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-20 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <SparklesIcon className="w-8 h-8" />
                            <h2 className="text-2xl font-black">Mode d'emploi</h2>
                        </div>
                        <p className="text-white/80 text-sm">
                            Apprenez à utiliser l'outil de gestion des prestations en quelques étapes simples.
                        </p>
                    </div>

                    {/* Bouton fermer */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenu avec étapes */}
                <div className="p-6">
                    {/* Navigation étapes */}
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveStep(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${idx === activeStep
                                    ? 'w-8 bg-gray-900'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Étape active */}
                    <div className="text-center mb-6 animate-fade-in" key={activeStep}>
                        <div
                            className={`inline-flex p-4 rounded-2xl ${steps[activeStep].color} text-white mb-4`}
                        >
                            {React.createElement(steps[activeStep].icon, { className: "w-10 h-10" })}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {activeStep + 1}. {steps[activeStep].title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {steps[activeStep].description}
                        </p>

                        {/* Conseils */}
                        <div className="bg-gray-50 rounded-2xl p-4 text-left">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                💡 Conseils
                            </div>
                            <ul className="space-y-2">
                                {steps[activeStep].tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                            disabled={activeStep === 0}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Précédent
                        </button>

                        {activeStep < steps.length - 1 ? (
                            <button
                                onClick={() => setActiveStep(activeStep + 1)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold transition-all hover:shadow-lg active:scale-95"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Suivant <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 rounded-xl text-white font-semibold transition-all hover:bg-green-600 hover:shadow-lg active:scale-95"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                C'est parti !
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer mobile-friendly */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <DevicePhoneMobileIcon className="w-4 h-4" />
                        <span>Optimisé pour smartphone</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Bouton flottant d'aide
interface HelpButtonProps {
    onClick: () => void;
    primaryColor?: string;
}

export const PrestationHelpButton: React.FC<HelpButtonProps> = ({ onClick, primaryColor = '#3b82f6' }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95 animate-bounce-slow"
        style={{ backgroundColor: primaryColor }}
        title="Aide - Mode d'emploi"
    >
        <QuestionMarkCircleIcon className="w-6 h-6" />
    </button>
);

// Hook pour gérer l'état du modal
export const usePrestationHelp = () => {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Ouvrir automatiquement au premier accès
    React.useEffect(() => {
        const hasSeenHelp = localStorage.getItem('prestations_help_seen');
        if (!hasSeenHelp) {
            setIsHelpOpen(true);
            localStorage.setItem('prestations_help_seen', 'true');
        }
    }, []);

    return {
        isHelpOpen,
        openHelp: () => setIsHelpOpen(true),
        closeHelp: () => setIsHelpOpen(false)
    };
};

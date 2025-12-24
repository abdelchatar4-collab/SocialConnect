/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prestation Reminder Alert Component
*/

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePrestations } from '@/contexts/PrestationContext';
import { ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PrestationReminderProps {
    onOpenPrestations?: () => void;
    daysThreshold?: number;
}

export const PrestationReminder: React.FC<PrestationReminderProps> = ({
    onOpenPrestations,
    daysThreshold = 3
}) => {
    const { data: session } = useSession();
    const { prestations } = usePrestations();
    const [isDismissed, setIsDismissed] = useState(false);
    const [daysSinceLastPrestation, setDaysSinceLastPrestation] = useState<number | null>(null);

    useEffect(() => {
        if (!session || prestations.length === 0) {
            // If no prestations at all, show reminder after threshold
            const stored = localStorage.getItem('prestation_reminder_dismissed');
            if (stored) {
                const dismissedDate = new Date(stored);
                const now = new Date();
                // Reset dismissal after 24 hours
                if ((now.getTime() - dismissedDate.getTime()) > 24 * 60 * 60 * 1000) {
                    localStorage.removeItem('prestation_reminder_dismissed');
                    setIsDismissed(false);
                } else {
                    setIsDismissed(true);
                }
            }
            setDaysSinceLastPrestation(daysThreshold + 1); // Force show if no prestations
            return;
        }

        // Find the most recent prestation for the current user
        const userEmail = session.user?.email;
        const userPrestations = prestations.filter((p: any) =>
            p.gestionnaire?.email === userEmail ||
            p.gestionnaireId === (session.user as any)?.id
        );

        if (userPrestations.length === 0) {
            setDaysSinceLastPrestation(daysThreshold + 1);
            return;
        }

        // Get most recent prestation date
        const sortedPrestations = [...userPrestations].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const lastPrestationDate = new Date(sortedPrestations[0].date);
        const now = new Date();
        const diffTime = now.getTime() - lastPrestationDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        setDaysSinceLastPrestation(diffDays);
    }, [session, prestations, daysThreshold]);

    const handleDismiss = () => {
        localStorage.setItem('prestation_reminder_dismissed', new Date().toISOString());
        setIsDismissed(true);
    };

    // Don't show if dismissed or if prestations are recent
    // CUSTOM RULE: Don't show before 2026
    if (new Date().getFullYear() < 2026) return null;

    if (isDismissed || daysSinceLastPrestation === null || daysSinceLastPrestation < daysThreshold) {
        return null;
    }

    return (
        <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 py-2.5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                            <ClockIcon className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-sm font-medium text-amber-800">
                            <span className="font-bold">Rappel :</span> Vous n'avez pas encodé de prestation depuis {daysSinceLastPrestation} jours.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {onOpenPrestations && (
                            <button
                                onClick={onOpenPrestations}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                            >
                                Encoder maintenant
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Fermer pour aujourd'hui"
                        >
                            <XMarkIcon className="w-4 h-4 text-amber-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrestationReminder;

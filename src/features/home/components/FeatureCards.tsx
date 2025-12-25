/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Home Feature Cards
Extracted from app/page.tsx for maintainability
*/

import React from 'react';
import Link from 'next/link';
import {
    ChartBarIcon,
    UserGroupIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

interface FeatureCardsProps {
    usersCount: number;
    onOpenSettings: () => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ usersCount, onOpenSettings }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Carte Gestion des Usagers */}
            <div className="card-glass p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center text-primary-600 mb-3">
                        <UserGroupIcon className="h-7 w-7 mr-2" />
                        <h3 className="text-xl font-semibold">Gestion des Usagers</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">
                        Consultez, modifiez ou ajoutez des dossiers d'usagers.
                    </p>
                </div>
                <div className="space-y-3">
                    <Link href="/users" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                        Voir les Usagers ({usersCount})
                    </Link>
                    <Link href="/users/new" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-500 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors">
                        Ajouter un Usager
                    </Link>
                </div>
            </div>

            {/* Carte Analyses & Documents */}
            <div className="card-glass p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center text-primary-600 mb-3">
                        <ChartBarIcon className="h-7 w-7 mr-2" />
                        <h3 className="text-xl font-semibold">Analyses & Documents</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">
                        Visualisez les statistiques et gérez vos documents.
                    </p>
                </div>
                <div className="space-y-3">
                    <Link href="/dashboard" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                        Tableau de Bord
                    </Link>
                    <Link href="/rapports" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors">
                        Documents
                    </Link>
                </div>
            </div>

            {/* Carte Administration */}
            <div className="card-glass p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center text-primary-600 mb-3">
                        <Cog6ToothIcon className="h-7 w-7 mr-2" />
                        <h3 className="text-xl font-semibold">Administration</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">
                        Gérez les paramètres de l'application.
                    </p>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={onOpenSettings}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                        Paramètres
                    </button>
                    <Link href="/help" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                        <QuestionMarkCircleIcon className="h-5 w-5 mr-2" /> Aide
                    </Link>
                </div>
            </div>
        </div>
    );
};

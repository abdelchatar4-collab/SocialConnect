/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Home User Manual Section
Extracted from app/page.tsx for maintainability
*/

import React from 'react';
import {
    UserGroupIcon,
    Cog6ToothIcon,
    BookOpenIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    PlayCircleIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export const UserManual: React.FC = () => {
    return (
        <div className="mt-8 card-glass p-6 bg-gradient-to-r from-primary-50/80 to-accent-50/80">
            <div className="flex items-center text-blue-700 mb-4">
                <BookOpenIcon className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Manuel d'Utilisation Complet</h3>
            </div>
            <p className="text-blue-600 mb-6 text-sm leading-relaxed">
                Découvrez toutes les fonctionnalités de l'application avec notre guide complet et détaillé.
            </p>

            {/* Grille des sections du manuel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Section 1: Démarrage */}
                <div className="surface-premium p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center text-blue-600 mb-2">
                        <PlayCircleIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-semibold text-sm">Démarrage</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Connexion et authentification</li>
                        <li>• Navigation dans l'interface</li>
                        <li>• Tableau de bord principal</li>
                    </ul>
                </div>

                {/* Section 2: Gestion des Usagers */}
                <div className="surface-premium p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center text-blue-600 mb-2">
                        <UserGroupIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-semibold text-sm">Gestion des Usagers</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Création de nouveaux dossiers</li>
                        <li>• Modification des informations</li>
                        <li>• Recherche et filtrage avancés</li>
                    </ul>
                </div>

                {/* Section 3: Rapports et Documents */}
                <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-blue-600 mb-2">
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-semibold text-sm">Rapports & Documents</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Génération de rapports</li>
                        <li>• Attestations RGPD</li>
                        <li>• Export et import de données</li>
                    </ul>
                </div>

                {/* Section 4: Administration */}
                <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-blue-600 mb-2">
                        <Cog6ToothIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-semibold text-sm">Administration</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Gestion des utilisateurs</li>
                        <li>• Configuration système</li>
                        <li>• Permissions et rôles</li>
                    </ul>
                </div>

                {/* Section 5: Support */}
                <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-blue-600 mb-2">
                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-semibold text-sm">Support & Formation</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Dépannage et solutions</li>
                        <li>• Bonnes pratiques</li>
                        <li>• FAQ et glossaire</li>
                    </ul>
                </div>

                {/* Section 6: Ressources */}
                <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-blue-600 mb-2">
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-semibold text-sm">Ressources</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Guides téléchargeables</li>
                        <li>• Modèles de documents</li>
                        <li>• <strong>Raccourcis :</strong> Alt+A (Accueil), Alt+D (Dashboard), Alt+U (Usagers), Alt+N (Nouveau), Alt+H (Aide), Alt+P (Imprimer), Alt+S (Rechercher)</li>
                    </ul>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3">
                <a
                    href="/documents_aide/MANUEL_UTILISATEUR.html"
                    target="_blank"
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    Consulter le Manuel Complet
                </a>
                <a
                    href="/documents_aide/MANUEL_UTILISATEUR.html"
                    download="Manuel_Utilisateur_PASQ.html"
                    className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Télécharger le Manuel
                </a>
            </div>
        </div>
    );
};

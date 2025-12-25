/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Home Quick Help Section
Extracted from app/page.tsx for maintainability
*/

import React from 'react';
import Link from 'next/link';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const QuickHelp: React.FC = () => {
    return (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center text-primary-600 mb-4">
                <QuestionMarkCircleIcon className="h-7 w-7 mr-2" />
                <h3 className="text-xl font-semibold">Aide Rapide</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
                Consultez ces guides rapides pour les fonctionnalités les plus utilisées :
            </p>

            <div className="space-y-6">
                {/* Recherche d'usagers */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Recherche d'usagers</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            L'application offre un système de recherche puissant pour retrouver rapidement les usagers :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Recherche par champ spécifique</strong> - Utilisez le menu déroulant pour sélectionner le type de recherche :
                                nom, prénom, email, secteur, antenne, adresse, gestionnaire ou état du dossier.
                            </li>
                            <li>
                                <strong>Recherche par adresse</strong> - Pour les adresses, vous pouvez chercher par rue, code postal ou ville.
                                Format "rue, numéro" également supporté.
                            </li>
                            <li>
                                <strong>Recherche globale</strong> - Sélectionnez "Tous les champs" pour chercher dans l'ensemble des informations.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Gestion des dossiers */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Gestion des dossiers</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            Chaque dossier d'usager contient plusieurs sections d'informations :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Informations personnelles</strong> - Coordonnées, adresse, et informations démographiques.
                            </li>
                            <li>
                                <strong>Problématiques</strong> - Enregistrez les types de problématiques, leur description et leurs dates.
                            </li>
                            <li>
                                <strong>Actions et suivi</strong> - Documentez les actions entreprises et suivez l'évolution du dossier.
                            </li>
                            <li>
                                <strong>État du dossier</strong> - Marquez un dossier comme "Actif", "En attente" ou "Clôturé".
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Tri et filtrage */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Tri et filtrage</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            Dans la liste des usagers, vous pouvez :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Trier les colonnes</strong> - Cliquez sur l'en-tête d'une colonne pour trier les résultats par ce champ.
                                Cliquez à nouveau pour inverser l'ordre de tri.
                            </li>
                            <li>
                                <strong>Sélection multiple</strong> - Utilisez les cases à cocher pour sélectionner plusieurs usagers à la fois.
                            </li>
                            <li>
                                <strong>Pagination</strong> - Naviguez entre les pages de résultats avec les boutons de pagination en bas de la liste.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Import et export */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Import et export de données</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            L'application permet d'importer et d'exporter des données :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Import</strong> - Les administrateurs peuvent importer des usagers à partir de fichiers Excel. Accédez à cette fonction via
                                le menu "Actions" dans la liste des usagers.
                            </li>
                            <li>
                                <strong>Export</strong> - Exportez la liste des usagers au format Excel pour produire des rapports. Cette fonction est
                                également accessible via le menu "Actions".
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Tableau de bord */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Tableaux de bord et statistiques</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            Analysez vos données grâce aux tableaux de bord :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Vue d'ensemble</strong> - Visualisez la répartition des dossiers par statut, antenne, et problématique.
                            </li>
                            <li>
                                <strong>Documents</strong> - Gérez tous vos documents (PDFs, Excel, images, archives) et générez des rapports détaillés pour analyser l'activité et suivre l'évolution des dossiers.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Droits d'accès */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Droits d'accès</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            L'application dispose de différents niveaux d'accès :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Mode administrateur</strong> - Les administrateurs peuvent accéder aux paramètres avancés, importer/exporter des
                                données et gérer tous les dossiers.
                            </li>
                            <li>
                                <strong>Mode gestionnaire</strong> - Les gestionnaires peuvent consulter et modifier les dossiers qui leur sont assignés.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Raccourcis clavier */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Raccourcis clavier</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            Pour une utilisation plus efficace, vous pouvez utiliser les raccourcis suivants :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Recherche rapide</strong> - Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">F</kbd> pour accéder directement à la barre de recherche.
                            </li>
                            <li>
                                <strong>Navigation entre onglets</strong> - Utilisez <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd> et <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd> pour naviguer entre les sections du formulaire.
                            </li>
                            <li>
                                <strong>Enregistrement</strong> - <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">S</kbd> pour sauvegarder les modifications en cours de saisie.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Aide supplémentaire */}
                <div>
                    <h4 className="text-lg font-medium text-primary-600 mb-2">Besoin d'aide supplémentaire ?</h4>
                    <div className="text-slate-600 text-sm space-y-2">
                        <p>
                            Pour une documentation plus détaillée sur l'utilisation de l'application, vous pouvez :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                Consulter la <Link href="/help" className="text-primary-600 hover:underline">page d'aide complète</Link>
                            </li>
                            <li>
                                Télécharger le <a href="/documents_aide/README%20Pense.pdf" target="_blank" className="text-primary-600 hover:underline">guide utilisateur</a> (PDF)
                            </li>
                            <li>
                                Contacter l'administrateur du système si vous avez des questions spécifiques
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

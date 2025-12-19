/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  HomeIcon,
  Squares2X2Icon,
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  PlayCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import SettingsModal from '@/components/SettingsModal';
import { useSession } from "next-auth/react";

interface SessionUserWithRole {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function HomePage() {
  const [usersCount, setUsersCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session, status } = useSession();
  const userRole = (session?.user as SessionUserWithRole)?.role;

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch('/api/users/count');
        if (response.ok) {
          const data = await response.json();
          setUsersCount(data.count || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du nombre d'usagers:", error);
      }
    };

    fetchUsersCount();
  }, []);

  const handleOpenSettings = () => {
    if (status === "authenticated" && userRole === "ADMIN") {
      setIsSettingsOpen(true);
    } else if (status === "authenticated" && userRole !== "ADMIN") {
      alert("Accès refusé. Vous devez avoir les droits administrateur pour accéder aux paramètres.");
    } else {
      alert("Veuillez vous connecter en tant qu'administrateur pour accéder aux paramètres.");
    }
  };

  return (
    // Conteneur principal avec gradient fluide
    <div className="min-h-screen text-slate-800">
      {/* Contenu principal avec padding */}
      <div className="container mx-auto p-6 animate-fade-in">
        {/* Titre de page "Accueil" */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-800">Accueil</h2>
        </div>

        {/* Section "Tableau de bord" */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-slate-800 mb-4">Tableau de bord</h3>
          <p className="mt-2 text-slate-600">
            Bienvenue sur l'application de gestion des usagers. Utilisez les liens ci-dessous pour accéder aux différentes fonctionnalités.
          </p>
        </div>

        {/* Cartes de fonctionnalités */}
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
              {/* Bouton principal */}
              <Link href="/users" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                Voir les Usagers ({usersCount})
              </Link>
              {/* Bouton secondaire */}
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
              {/* Bouton principal */}
              <Link href="/dashboard" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                Tableau de Bord
              </Link>
              {/* Bouton secondaire */}
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
              {/* Bouton principal */}
              <button
                onClick={handleOpenSettings}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Paramètres
              </button>
              {/* Bouton "Aide" */}
              <Link href="/help" className="button-link w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2" /> Aide
              </Link>
            </div>
          </div>
        </div>

        {/* Carte À propos */}
        <div className="card-glass p-6">
          <div className="flex items-center text-primary-600 mb-3">
            <InformationCircleIcon className="h-7 w-7 mr-2" />
            <h3 className="text-xl font-semibold">À propos de l'application</h3>
          </div>
          <p className="text-slate-600 text-sm">
            Cette application de gestion des usagers permet de suivre les dossiers des personnes accompagnées, de gérer leurs informations et de suivre leur parcours.
          </p>
        </div>

        {/* Manuel d'Utilisation */}
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
                <li>• Raccourcis clavier</li>
              </ul>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/documents_aide/README Pense.pdf"
              target="_blank"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Consulter le Manuel Complet
            </a>
            <a
              href="/documents_aide/README Pense.pdf"
              download="Manuel_Utilisateur_PASQ.pdf"
              className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Télécharger le Manuel
            </a>
          </div>
        </div>

        {/* Section d'aide rapide */}
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
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

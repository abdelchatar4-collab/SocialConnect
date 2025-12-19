/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpenIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useButtonClasses } from '@/hooks/useStyleClasses';

export default function HelpPage() {
  const [documentList, setDocumentList] = useState<string[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Classes de boutons avec le hook
  const primaryButtonClasses = useButtonClasses('primary', 'md');
  const secondaryButtonClasses = useButtonClasses('secondary', 'md');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoadingDocuments(true);
        setDocumentError(null);
        const response = await fetch('/api/aide/list-documents');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
        }
        const data: string[] = await response.json();
        setDocumentList(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des documents:", err);
        setDocumentError(err.message || "Une erreur est survenue lors du chargement des documents.");
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, []); // Exécuter une seule fois au montage

  return (
    // Conteneur principal avec fond gris très clair (style de page global)
    <div className="min-h-screen bg-background text-text_darker">
      {/* Contenu principal avec padding */}
      <div className="container mx-auto p-6">
        {/* Titre de page "Aide" (style de titre principal) */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">Centre d'Aide</h1>
          <p className="mt-2 text-text_dark">
            Retrouvez ici les guides et les réponses à vos questions sur l'utilisation de la plateforme Gestion Usagers PASQ.
          </p>
        </div>

        {/* Section Manuel d'Utilisation Complet */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-200">
          <div className="flex items-center text-blue-700 mb-4">
            <BookOpenIcon className="h-8 w-8 mr-3"/>
            <h2 className="text-2xl font-bold">Manuel d'Utilisation Complet</h2>
          </div>
          <p className="text-blue-600 mb-4 text-sm leading-relaxed">
            Pour une documentation exhaustive de toutes les fonctionnalités de l'application, consultez notre manuel d'utilisation détaillé.
            Ce guide couvre tous les aspects de l'application, de la connexion initiale aux fonctionnalités avancées d'administration.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-semibold text-blue-700 mb-2">Contenu du Manuel :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
              <div>• Introduction et présentation</div>
              <div>• Connexion et authentification</div>
              <div>• Navigation et tableau de bord</div>
              <div>• Gestion complète des usagers</div>
              <div>• Création et modification de dossiers</div>
              <div>• Recherche et filtrage avancés</div>
              <div>• Génération de rapports</div>
              <div>• Gestion des documents</div>
              <div>• Administration et paramètres</div>
              <div>• Dépannage et bonnes pratiques</div>
              <div>• FAQ et glossaire</div>
              <div>• Support et ressources</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="/documents_aide/README Pense.pdf" 
              target="_blank" 
              className={primaryButtonClasses}
            >
              <BookOpenIcon className="h-5 w-5 mr-2"/>
              Consulter le Manuel Complet (PDF)
            </a>
            <a 
              href="/documents_aide/README Pense.pdf" 
              download="Manuel_Utilisateur_PASQ.pdf"
              className={primaryButtonClasses}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2"/>
              Télécharger le Manuel (PDF)
            </a>
          </div>
        </div>

        {/* Conteneur principal du contenu (style de conteneur de contenu) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="space-y-8"> {/* Espacement entre les sections principales */}

            {/* Section d'Aide Générale */}
            <div>
              <div className="flex items-center mb-4">
                <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-primary"/>
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-2">Aide Générale</h2>
              </div>
              <div className="space-y-6 text-text_dark"> {/* Espacement entre les sous-sections */}

                {/* Introduction */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Introduction</h3>
                  <p className="text-sm leading-relaxed">
                    Bienvenue sur l'application de Gestion Usagers PASQ. Cet outil a été conçu pour vous aider à gérer efficacement les dossiers des personnes que vous accompagnez, de la création initiale au suivi et à la génération de rapports.
                  </p>
                </div>

                {/* Gestion des Dossiers Usagers */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Gestion des Dossiers Usagers</h3>
                  <p className="text-sm leading-relaxed">
                    La section "Usagers" vous permet de visualiser la liste de tous les dossiers enregistrés. Vous pouvez rechercher un usager par nom ou prénom, créer un nouveau dossier, ou cliquer sur un usager existant pour voir ses détails complets. La page de détails permet de modifier les informations, de générer une attestation RGPD ou un PDF récapitulatif. Le formulaire de création/édition est structuré en plusieurs étapes pour faciliter la saisie des informations (informations personnelles, contact, adresse, logement, problématiques, actions, etc.).
                  </p>
                </div>

                {/* Gestion des Accès (pour Administrateurs) */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Gestion des Accès (pour Administrateurs)</h3>
                  <p className="text-sm leading-relaxed">
                    Si vous disposez des droits administrateur, vous avez accès à la section "Paramètres" (via le bouton sur la page d'accueil ou dans le menu). Cette section vous permet de gérer les comptes des gestionnaires qui utilisent l'application, d'attribuer des rôles (Admin/User) et de gérer leurs informations.
                  </p>
                </div>

                {/* Importation de Données */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Importation de Données</h3>
                  <p className="text-sm leading-relaxed">
                    L'application permet d'importer des listes d'usagers à partir d'un fichier Excel. Cette fonctionnalité est accessible via un bouton dédié dans la section "Gestion des Usagers". Assurez-vous que votre fichier Excel respecte le format attendu pour un import réussi.
                  </p>
                </div>

                {/* Attestations RGPD */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Attestations RGPD</h3>
                  <p className="text-sm leading-relaxed">
                    Pour générer une attestation de consentement RGPD pour un usager, rendez-vous sur la page de détails de cet usager. Un bouton spécifique vous permettra de télécharger l'attestation au format PDF.
                  </p>
                </div>

                {/* Documents et Statistiques */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Documents et Statistiques</h3>
                  <p className="text-sm leading-relaxed">
                    La section "Analyses & Documents" (accessible depuis la page d'accueil ou le menu) vous donne accès à un tableau de bord visuel avec des statistiques sur les usagers. Le bouton "Documents" vous redirige vers une page où vous pourrez gérer tous vos documents (PDFs, Excel, images, archives, vidéos), générer des rapports détaillés ou télécharger des données.
                  </p>
                </div>

                {/* Foire Aux Questions (FAQ) - Optionnel */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Foire Aux Questions (FAQ)</h3>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-semibold">Q: Comment ajouter un nouveau gestionnaire ?</span><br/>R: Les administrateurs peuvent ajouter de nouveaux gestionnaires via la section "Paramètres".</p>
                    <p><span className="font-semibold">Q: Que faire si je ne trouve pas une rue dans l'autocomplétion d'adresse ?</span><br/>R: L'autocomplétion se base sur les rues d'Anderlecht. Si la rue n'apparaît pas, vérifiez l'orthographe ou saisissez l'adresse manuellement. Le secteur sera déterminé si l'adresse est reconnue.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Nouvelle Section : Procédures et Guides d'Utilisation */}
            <div>
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-primary"/>
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-2">Procédures et Guides d'Utilisation</h2>
              </div>
              <p className="text-sm leading-relaxed text-text_dark mb-4">
                Retrouvez ci-dessous les documents et guides pour vous accompagner dans l'utilisation de l'application et les procédures spécifiques à PASQ.
              </p>

              {isLoadingDocuments ? (
                <p className="text-gray-600">Chargement des documents...</p>
              ) : documentError ? (
                <p className="text-red-600">Erreur lors du chargement des documents : {documentError}</p>
              ) : documentList.length === 0 ? (
                <p className="text-gray-600">Aucun document disponible pour le moment.</p>
              ) : (
                <ul className="list-disc list-inside space-y-2 text-sm text-text_dark">
                  {documentList.map((fileName, index) => (
                    <li key={index}>
                      <a
                        href={`/documents_aide/${encodeURIComponent(fileName)}`}
                        download={fileName}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

            </div>

            {/* Section Formation et Support */}
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-6 w-6 mr-2 text-primary"/>
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-2">Formation et Support</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manuel d'Utilisation */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Manuel d'Utilisation</h3>
                  <p className="text-sm text-blue-600 mb-3">
                    Guide complet et détaillé couvrant toutes les fonctionnalités de l'application.
                  </p>
                  <a 
                    href="/documents_aide/README Pense.pdf" 
                    target="_blank" 
                    className={useButtonClasses('primary', 'sm')}
                  >
                    <BookOpenIcon className="h-4 w-4 mr-1"/>
                    Consulter le PDF
                  </a>
                </div>
                
                {/* Documentation Technique */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Documentation Technique</h3>
                  <p className="text-sm text-green-600 mb-3">
                    Instructions de démarrage, commandes de développement et documentation technique.
                  </p>
                  <a 
                    href="/documents_aide/README Pense.pdf" 
                    target="_blank" 
                    className={useButtonClasses('secondary', 'sm')}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-1"/>
                    Voir le README
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact et Support */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center mb-3">
                <InformationCircleIcon className="h-6 w-6 mr-2 text-amber-600"/>
                <h3 className="text-lg font-semibold text-amber-700">Besoin d'aide supplémentaire ?</h3>
              </div>
              <p className="text-sm text-amber-600 mb-3">
                Si vous ne trouvez pas la réponse à votre question dans cette documentation, n'hésitez pas à contacter l'équipe de support.
              </p>
              <div className="text-sm text-amber-700">
                <p><strong>Email :</strong> support@pasq.be</p>
                <p><strong>Heures d'ouverture :</strong> Lundi-Vendredi, 9h-17h</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

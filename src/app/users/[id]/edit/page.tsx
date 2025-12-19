/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Adresse } from '@/types';
import UserForm from '@/features/users/components/UserForm';
import { useAdmin } from '@/contexts/AdminContext'; // Ajouter Adresse
import { ArrowLeftIcon, CheckCircleIcon, DocumentIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
// Importer la fonction centralisée
import { initiateRgpdAttestationGeneration } from '@/utils/rgpdUtils';

interface GestionnaireForForm {
  id: string;
  prenom: string;
  nom: string | null;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = typeof params?.id === 'string' ? params.id : undefined;

  const [userFormData, setUserFormData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [gestionnairesList, setGestionnairesList] = useState<GestionnaireForForm[]>([]);

  // Utiliser useCallback pour fetchUserDataAndGestionnaires pour la stabilité de la ref dans useEffect
  const fetchUserDataAndGestionnaires = useCallback(async (showLoadingIndicator = true) => {
    if (!userId) {
      setPageError("ID utilisateur manquant.");
      if (showLoadingIndicator) setIsLoading(false);
      return;
    }
    if (showLoadingIndicator) setIsLoading(true);
    setPageError(null);

    try {
      const userResponse = await fetch(`/api/users/${userId}`);

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({ message: `Erreur ${userResponse.status} chargement utilisateur` }));
        throw new Error(errorData.message || `Erreur ${userResponse.status} `);
      }

      const responseText = await userResponse.text();
      let userData: User;
      try {
        userData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erreur parsing JSON:", parseError);
        throw new Error("Réponse API invalide (pas du JSON valide)");
      }

      // CORRECTION AUTOMATIQUE SI ID ALTERNATIF TROUVÉ
      if (!userData.id) {
        const userDataAny = userData as any;
        if (userDataAny._id) {
          userData.id = userDataAny._id;
        } else if (userDataAny.user_id) {
          userData.id = userDataAny.user_id;
        } else if (userDataAny.userId) {
          userData.id = userDataAny.userId;
        } else {
          // Utiliser l'ID de l'URL comme fallback
          userData.id = userId;
        }
      }

      setUserFormData(userData);

      if (gestionnairesList.length === 0) {
        const gestionnairesResponse = await fetch('/api/gestionnaires');
        if (!gestionnairesResponse.ok) {
          throw new Error('Erreur lors du chargement des gestionnaires');
        }
        const gestionnairesData = await gestionnairesResponse.json();
        setGestionnairesList(gestionnairesData);
      }
    } catch (err: any) {
      console.error("Erreur fetchUserDataAndGestionnaires:", err);
      setPageError(err.message);
      setUserFormData(null);
    } finally {
      if (showLoadingIndicator) setIsLoading(false);
    }
  }, [userId, gestionnairesList.length]);

  useEffect(() => {
    fetchUserDataAndGestionnaires(true);
  }, [fetchUserDataAndGestionnaires]);

  const handleSaveUser = async (userData: Partial<import('@/types/user').User>): Promise<void> => {
    if (!userId) {
      setPageError("ID utilisateur manquant pour la mise à jour.");
      throw new Error("ID utilisateur manquant");
    }
    setIsProcessing(true);
    setPageError(null);
    setShowSuccessBanner(false);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status} ` }));
        throw new Error(errorData.error || `Échec de la mise à jour(${response.status})`);
      }
      const updatedUser = await response.json();
      setUserFormData(updatedUser);
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 4000);
    } catch (err: any) {
      console.error("Save user error:", err);
      setPageError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(userId ? `/users/${userId}` : '/users');
  };

  const handleGenerateRgpdRequest = async () => {
    if (!userFormData || !userFormData.id) {
      alert("Les données de l'usager ne sont pas disponibles.");
      return;
    }

    setIsProcessing(true);
    setPageError(null);
    setShowSuccessBanner(false);

    try {
      let dataForRgpdGeneration = { ...userFormData };

      const userFullName = `${dataForRgpdGeneration.prenom || ''} ${dataForRgpdGeneration.nom || ''} `.trim();

      // CORRECTION : Extraire correctement l'adresse de l'objet Adresse
      const addr = dataForRgpdGeneration.adresse || {} as Adresse;
      const userFullAddress = `${addr.numero || ''} ${addr.rue || ''}${addr.boite ? ' bte ' + addr.boite : ''} `.trim();
      const userPostalCode = addr.codePostal || '';
      const userCity = addr.ville || '';

      if (!dataForRgpdGeneration.id) {
        alert("ID utilisateur manquant pour la génération RGPD.");
        setIsProcessing(false);
        return;
      }

      await initiateRgpdAttestationGeneration(
        dataForRgpdGeneration.id,
        userFullName,
        userFullAddress,
        userPostalCode,
        userCity,
        async () => {
          await fetchUserDataAndGestionnaires(false);
        }
      );

    } catch (error: any) {
      console.error("Erreur handleGenerateRgpdRequest:", error);
      setPageError(error.message || "Une erreur est survenue.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Chargement...</p></div>;
  if (pageError && !userFormData) return (
    <div className="container mx-auto p-4 text-center">
      <p className="text-red-600 text-xl">Erreur: {pageError}</p>
      <button onClick={() => router.push('/users')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retour à la liste</button>
    </div>
  );
  if (!userFormData && !isLoading) return <div className="container mx-auto p-4 text-center"><p className="text-lg text-gray-700">Aucun usager trouvé pour cet ID.</p></div>;

  return (
    <div className="container mx-auto p-6 min-h-screen animate-fade-in">
      <div className="card-glass p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors group mb-1"
              title="Retour (Précédent)"
              disabled={isProcessing}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              <span className="font-medium">Retour</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Modifier l'usager : <span className="text-blue-700">{userFormData?.prenom} {userFormData?.nom}</span>
            </h1>
          </div>

          {/* BOUTON RGPD */}
          <div className="flex flex-col items-end space-y-2">
            {userFormData && userFormData.id ? (
              <div className="relative inline-flex items-center">
                <button
                  onClick={handleGenerateRgpdRequest}
                  disabled={isProcessing}
                  className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm flex items-center justify-center focus:outline-none transition-all duration-150 min-w-[200px]
                              ${isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : (userFormData.rgpdAttestationGeneratedAt
                        ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2'
                        : 'bg-green-600 text-white hover:bg-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-2')
                    }
                              ${!userFormData.rgpdAttestationGeneratedAt && !isProcessing ? 'border-2 border-yellow-400' : ''}
`}
                >
                  {isProcessing ? (
                    <span>Traitement...</span>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      {userFormData.rgpdAttestationGeneratedAt ? "Re-générer Attestation" : "Générer Attestation RGPD"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                <p>Bouton RGPD indisponible</p>
                <p className="text-xs">Données: {!userFormData ? 'Non chargées' : 'ID manquant'}</p>
              </div>
            )}
          </div>
        </div>

        {showSuccessBanner && (
          <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md flex items-center shadow">
            <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
            Modifications enregistrées avec succès !
          </div>
        )}
        {pageError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md shadow">
            Erreur: {pageError}
          </div>
        )}

        {userFormData && (
          <UserForm
            initialData={userFormData}
            onSubmit={handleSaveUser}
            onCancel={handleCancel}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
}

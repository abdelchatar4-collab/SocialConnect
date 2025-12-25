/* Copyright (C) 2025 ABDEL KADER CHATAR - Licence GPLv3+ */
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Adresse } from '@/types';
import UserForm from '@/features/users/components/UserForm';
import { useAdmin } from '@/contexts/AdminContext';
import { ArrowLeftIcon, CheckCircleIcon, DocumentIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
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

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const attemptDelete = () => {
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!userId) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Erreur ${res.status}: La suppression a échoué.`);
      }
      setShowDeleteConfirm(false);
      // Redirect to list
      router.push('/users');
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const handleGenerateRgpdRequest = () => {
    if (!userFormData || !userFormData.id) {
      alert("Les données de l'usager ne sont pas disponibles.");
      return;
    }
    // Ouvrir la page d'aperçu RGPD dans un nouvel onglet
    window.open(`/documents/rgpd/${userFormData.id}`, '_blank');
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
            onDelete={attemptDelete}
            mode="edit"
          />
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={cancelDelete}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmer la suppression</h3>
                    <div className="mt-2 text-sm text-gray-500">
                      Voulez-vous supprimer le dossier de <strong>{userFormData?.prenom} {userFormData?.nom}</strong> ? Cette action est irréversible.
                      {deleteError && <p className="mt-3 text-red-700 bg-red-100 p-3 rounded border border-red-300">{deleteError}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button type="button" onClick={confirmDelete} disabled={isDeleting} className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white ${isDeleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}>
                  {isDeleting ? "Suppression..." : "Oui, supprimer"}
                </button>
                <button type="button" onClick={cancelDelete} className="rounded-md px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-100">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

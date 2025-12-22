/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import { useState, useEffect, useCallback } from "react"; // Importer useCallback
import { useParams, useRouter } from "next/navigation";
import { User, Gestionnaire, UserFormData, Adresse } from "@/types/user"; // Importer Adresse
// Importer la fonction centralisée
import { initiateRgpdAttestationGeneration } from "@/utils/rgpdUtils";
import { DocumentIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/20/solid'; // Importer les icônes
import { UserDetails } from "@/features/users";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingRgpd, setIsProcessingRgpd] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError("ID utilisateur manquant");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [userData, gestionnairesData] = await Promise.all([
        getUserData(userId),
        getGestionnairesList(),
      ]);

      setUser(userData);
      setGestionnaires(gestionnairesData);
    } catch (err: any) {
      console.error("[UserDetailPage] Erreur lors du fetch:", err);
      setError(err.message || "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUserData = async (id: string): Promise<User | null> => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Utilisateur non trouvé");
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  };

  const getGestionnairesList = async (): Promise<Gestionnaire[]> => {
    try {
      const response = await fetch("/api/gestionnaires");
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des gestionnaires:", error);
      throw error;
    }
  };

  const handleSaveUser = async (userData: UserFormData) => {
    let cleanedLogementDetails = userData.logementDetails;
    if (typeof cleanedLogementDetails !== 'object' || cleanedLogementDetails === null) {
      try {
        if (typeof cleanedLogementDetails === 'string') {
          cleanedLogementDetails = JSON.parse(cleanedLogementDetails);
        } else {
          cleanedLogementDetails = {
            type: '', statut: '', nombrePieces: 0, bailleur: '', commentaires: '',
            typeLogement: '', dateEntree: '', dateSortie: '', motifSortie: '',
            destinationSortie: '', proprietaire: '', loyer: '', charges: '',
            commentaire: '', hasLitige: false,
          };
        }
      } catch (e) {
        cleanedLogementDetails = {
          type: '', statut: '', nombrePieces: 0, bailleur: '', commentaires: '',
          typeLogement: '', dateEntree: '', dateSortie: '', motifSortie: '',
          destinationSortie: '', proprietaire: '', loyer: '', charges: '',
          commentaire: '', hasLitige: false,
        };
      }
    }

    if (cleanedLogementDetails && typeof cleanedLogementDetails === 'object') {
      if (cleanedLogementDetails.dateEntree && typeof cleanedLogementDetails.dateEntree === 'string') {
        cleanedLogementDetails.dateEntree = cleanedLogementDetails.dateEntree.split('T')[0];
      }
      if (cleanedLogementDetails.dateSortie && typeof cleanedLogementDetails.dateSortie === 'string') {
        cleanedLogementDetails.dateSortie = cleanedLogementDetails.dateSortie.split('T')[0];
      }
    }

    const dataToSend = {
      ...userData,
      logementDetails: cleanedLogementDetails,
    };

    try {
      const method = userData.id ? 'PUT' : 'POST';
      const url = userData.id ? `/api/users/${userData.id}` : '/api/users';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        throw new Error(errorData.error || `Échec de la mise à jour (${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("[UserDetailPage] Erreur lors de la sauvegarde de l'utilisateur:", error);
      throw error;
    }
  };

  const handleGenerateRgpdOnDetailsPage = async () => {
    if (!user || !user.id) return;

    setIsProcessingRgpd(true);
    try {
      const userFullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
      const addr = user.adresse || {} as Adresse;
      const userFullAddress = `${addr.numero || ''} ${addr.rue || ''}${addr.boite ? ' bte ' + addr.boite : ''}`.trim();
      const userPostalCode = addr.codePostal || '';
      const userCity = addr.ville || '';

      await initiateRgpdAttestationGeneration(
        user.id, userFullName, userFullAddress, userPostalCode, userCity, fetchData
      );
    } catch (error) {
      console.error("Erreur lors de la génération de l'attestation RGPD:", error);
      alert("Une erreur est survenue lors de la génération de l'attestation RGPD.");
    } finally {
      setIsProcessingRgpd(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-2 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour</span>
            </button>
            <h1 className="text-2xl leading-8 font-bold text-gray-900 mb-1">
              Fiche Usager : {user?.prenom || ''} {user?.nom || ''}
            </h1>
            {user?.id && (
              <p className="text-base text-gray-600">
                Dossier N°: <span className="font-medium text-gray-800">{user.id}</span>
              </p>
            )}
          </div>

          {user && user.id && (
            <div className="relative inline-flex items-center">
              <button
                onClick={handleGenerateRgpdOnDetailsPage}
                disabled={isProcessingRgpd}
                className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${!user?.rgpdAttestationGeneratedAt && !isProcessingRgpd ? 'border-2 border-yellow-400' : ''}`}
              >
                {isProcessingRgpd ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {user.rgpdAttestationGeneratedAt ? "Re-générer Attestation RGPD" : "Générer Attestation RGPD"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <UserDetails
          user={user}
          isLoading={isLoading}
          error={error}
          gestionnaires={gestionnaires}
        />
      </div>
    </div>
  );
}

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - New User Page
Refactored to use extracted modules for maintainability
*/

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '@/features/users/components/UserForm';
import { UserSearch } from '@/components/UserSearch';
import { useAdmin } from '@/contexts/AdminContext';
import type { UserFormRef } from '@/types';
import { Adresse, User } from '@/types/user';
import { initialNewUserData } from '@/features/users/constants/userFormDefaults';

// Types for this page
interface GestionnaireForForm {
  id: string;
  prenom: string;
  nom: string | null;
}

interface SavedUser {
  id: string;
  nom: string;
  prenom: string;
  adresse?: Adresse | null;
}

export default function NewUserPage() {
  const { selectedYear, setSelectedYear } = useAdmin();
  const [showSearch, setShowSearch] = useState(false);
  const [prefilledData, setPrefilledData] = useState<Partial<User>>(initialNewUserData);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRgpdButton, setShowRgpdButton] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [savedUserName, setSavedUserName] = useState<string | null>(null);
  const [savedUserFullData, setSavedUserFullData] = useState<SavedUser | null>(null);
  const [gestionnairesList, setGestionnairesList] = useState<GestionnaireForForm[]>([]);
  const [isLoadingGestionnaires, setIsLoadingGestionnaires] = useState(false);
  const router = useRouter();
  const userCreatedRef = React.useRef(false);

  // Show search for future years (re-inscription)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (selectedYear > currentYear) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  }, [selectedYear]);

  // Load gestionnaires
  useEffect(() => {
    const fetchGestionnaires = async () => {
      setIsLoadingGestionnaires(true);
      try {
        const response = await fetch('/api/gestionnaires');
        if (!response.ok) throw new Error('Erreur lors du chargement des gestionnaires');
        const data = await response.json();
        setGestionnairesList(data);
      } catch (err) {
        console.error("Erreur fetchGestionnaires:", err);
        setError(err instanceof Error ? err.message : 'Impossible de charger les gestionnaires');
        setGestionnairesList([
          { id: 'test-1', prenom: 'Test', nom: 'Gestionnaire 1' },
          { id: 'test-2', prenom: 'Test', nom: 'Gestionnaire 2' }
        ]);
      } finally {
        setIsLoadingGestionnaires(false);
      }
    };
    fetchGestionnaires();
  }, []);

  const handleSelectUser = (user: User, options: { contact: boolean; adresse: boolean; nationalite: boolean; situationPro: boolean; gestion: boolean; logement: boolean; notes: boolean }) => {
    const newData: Partial<User> = {
      ...initialNewUserData,
      nom: user.nom || '',
      prenom: user.prenom || '',
      dateNaissance: user.dateNaissance,
      genre: user.genre,
      ...(options.contact && { telephone: user.telephone, email: user.email }),
      ...(options.adresse && { adresse: user.adresse }),
      ...(options.nationalite && { nationalite: user.nationalite, langue: user.langue, statutSejour: user.statutSejour }),
      ...(options.situationPro && { situationProfessionnelle: user.situationProfessionnelle, revenus: user.revenus }),
      ...(options.gestion && { gestionnaire: user.gestionnaire, antenne: user.antenne }),
      ...(options.logement && { logementDetails: user.logementDetails }),
      ...(options.notes && {
        remarques: user.remarques,
        notesGenerales: user.notesGenerales,
        informationImportante: user.informationImportante,
        problematiquesDetails: user.problematiquesDetails,
        donneesConfidentielles: user.donneesConfidentielles,
      }),
    };
    setPrefilledData(newData);
    setPreviousUserId(user.id);
    setShowSearch(false);
  };

  const handleCreateNew = () => {
    setPrefilledData(initialNewUserData);
    setPreviousUserId(null);
    setShowSearch(false);
  };

  const handleSave = async (userData: Partial<User>) => {
    if (userCreatedRef.current) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check for duplicates
      const duplicateCheckResponse = await fetch('/api/users/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: userData.nom,
          prenom: userData.prenom,
          dateNaissance: userData.dateNaissance,
        }),
      });

      if (duplicateCheckResponse.ok) {
        const { hasDuplicate, duplicates } = await duplicateCheckResponse.json();
        if (hasDuplicate && duplicates.length > 0) {
          const duplicatesList = duplicates.map((d: any) =>
            `- ${d.prenom} ${d.nom} (ID: ${d.id}, Antenne: ${d.antenne || 'N/A'})`
          ).join('\n');
          const confirmMessage = `⚠️ ATTENTION : Un ou plusieurs usagers avec le même nom/prénom existent déjà :\n\n${duplicatesList}\n\nVoulez-vous quand même créer ce nouvel usager ?`;
          if (!window.confirm(confirmMessage)) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const payload = { ...userData, annee: selectedYear, dossierPrecedentId: previousUserId };
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Échec de la création: ${response.statusText} - ${errorData}`);
      }

      const newUser: SavedUser = await response.json();
      userCreatedRef.current = true;
      setShowSuccessMessage(true);
      setShowRgpdButton(true);
      setSavedUserId(newUser.id);
      setSavedUserName(`${newUser.prenom} ${newUser.nom}`);
      setSavedUserFullData(newUser);
      setIsSubmitting(false);
    } catch (saveError: any) {
      console.error("Erreur lors de la création:", saveError);
      setError(`Erreur lors de la création: ${saveError.message}`);
      setIsSubmitting(false);
      throw saveError;
    }
  };

  const handleRgpdGeneration = () => {
    if (!savedUserFullData) return;
    // Ouvrir la page d'aperçu RGPD dans un nouvel onglet
    window.open(`/documents/rgpd/${savedUserFullData.id}`, '_blank');
  };

  const handleFinish = () => router.push('/users');
  const handleCancel = () => router.push('/users');

  if (isLoadingGestionnaires) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Chargement des gestionnaires...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Créer un nouvel usager</h1>
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {showSuccessMessage && savedUserFullData && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex flex-col gap-2">
          <p>Usager sauvegardé avec succès dans l'exercice {(savedUserFullData as any).annee || selectedYear} !</p>
          {(savedUserFullData as any).annee && (savedUserFullData as any).annee !== selectedYear && (
            <button
              onClick={() => {
                const newYear = (savedUserFullData as any).annee;
                if (typeof setSelectedYear === 'function') {
                  setSelectedYear(newYear);
                  router.push('/users');
                } else {
                  router.push(`/users?annee=${newYear}`);
                }
              }}
              className="text-sm font-semibold underline hover:text-green-900 text-left"
            >
              Basculer vers l'exercice {(savedUserFullData as any).annee} pour voir ce dossier
            </button>
          )}
        </div>
      )}

      {showSearch ? (
        <UserSearch
          onSelectUser={handleSelectUser}
          onCreateNew={handleCreateNew}
          currentYear={selectedYear}
        />
      ) : (
        <UserForm
          key={previousUserId || "new"}
          initialData={prefilledData}
          onSubmit={handleSave}
          onCancel={handleCancel}
          mode="create"
        />
      )}

      {showRgpdButton && savedUserFullData && (
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleRgpdGeneration}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Générer Attestation RGPD
          </button>
          <button
            onClick={handleFinish}
            className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Terminer
          </button>
        </div>
      )}
    </div>
  );
}

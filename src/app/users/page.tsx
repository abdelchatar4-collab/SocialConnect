/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// src/app/users/page.tsx

"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, getSession } from "next-auth/react";
import Link from "next/link";
import { PlusCircleIcon, UsersIcon, CalendarIcon, MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { formatDate } from '@/utils/formatters'; // AJOUTER CETTE LIGNE

// Chargez UserList dynamiquement sans SSR - Interface cards améliorée
const UserList = dynamic(() => import('@/features/users/components/UserList/UserList'), { ssr: false });

// Type pour les filtres de recherche
type FilterType = 'all' | 'nom' | 'prenom' | 'email' | 'secteur' | 'antenne' | 'adresse' | 'gestionnaire' | 'etat';

// Options pour le menu déroulant des champs de recherche
const searchFieldOptions = [
  { value: 'all', label: 'Tous les champs' },
  { value: 'nom', label: 'Nom' },
  { value: 'prenom', label: 'Prénom' },
  { value: 'email', label: 'Email' },
  { value: 'secteur', label: 'Secteur' },
  { value: 'antenne', label: 'Antenne' },
  { value: 'adresse', label: 'Adresse' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'etat', label: 'État' },
  // Ajoutez d'autres champs pertinents ici
];

export default function UsersListPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [problematiqueFilter, setProblematiqueFilter] = useState<string>('');

  // AJOUTER ces nouvelles lignes :
  const [showImportantInfoOnly, setShowImportantInfoOnly] = useState<boolean>(false); // Décochée par défaut
  const [showMissingBirthDate, setShowMissingBirthDate] = useState<boolean>(false); // Décochée par défaut



  useEffect(() => {
    setIsClient(true);

    // Restaurer l'état depuis l'URL au chargement de la page
    const urlParams = new URLSearchParams(window.location.search);
    const savedSearchTerm = urlParams.get('search') || '';
    const savedSearchField = (urlParams.get('field') as FilterType) || 'all';
    const savedSortField = urlParams.get('sort') || null;
    const savedSortDirection = (urlParams.get('direction') as 'asc' | 'desc') || 'asc';
    const savedProblematiqueFilter = urlParams.get('problematique') || '';
    const savedShowImportantInfoOnly = urlParams.get('important') === 'true';
    const savedShowMissingBirthDate = urlParams.get('missingBirthDate') === 'true';

    setSearchTerm(savedSearchTerm);
    setSearchField(savedSearchField);
    setSortField(savedSortField);
    setSortDirection(savedSortDirection);
    setProblematiqueFilter(savedProblematiqueFilter);
    setShowImportantInfoOnly(savedShowImportantInfoOnly);
    setShowMissingBirthDate(savedShowMissingBirthDate);
  }, []);

  // Sauvegarder l'état dans l'URL chaque fois qu'il change
  useEffect(() => {
    if (!isClient) return;

    const urlParams = new URLSearchParams();
    if (searchTerm) urlParams.set('search', searchTerm);
    if (searchField !== 'all') urlParams.set('field', searchField);
    if (sortField) urlParams.set('sort', sortField);
    if (sortDirection !== 'asc') urlParams.set('direction', sortDirection);
    if (problematiqueFilter) urlParams.set('problematique', problematiqueFilter);
    if (showImportantInfoOnly) urlParams.set('important', 'true');
    if (showMissingBirthDate) urlParams.set('missingBirthDate', 'true');

    const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, searchField, sortField, sortDirection, problematiqueFilter, showImportantInfoOnly, showMissingBirthDate, isClient]);





  const noop = async () => { }; // Placeholder pour les fonctions, à implémenter

  if (status === "loading" && !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 animate-fade-in">


        {/* Conteneur principal stylisé comme une carte */}
        <div className="card-glass p-4 sm:p-6">



          {isClient ? (
            <UserList
              onDeleteUsers={noop}
              onImportUsers={noop}
              onDeleteImportedUsers={noop}
              isImporting={false}
              onCancelImport={() => { }}
              searchTerm={searchTerm}
              searchField={searchField}
              onSearchTermChange={setSearchTerm}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={(field: string | null, direction: 'asc' | 'desc') => {
                setSortField(field);
                setSortDirection(direction);
              }}
              problematiqueFilter={problematiqueFilter}
              onProblematiqueFilterChange={setProblematiqueFilter}
              showImportantInfoOnly={showImportantInfoOnly}
              onShowImportantInfoOnlyChange={setShowImportantInfoOnly}
              showMissingBirthDate={showMissingBirthDate}
              onShowMissingBirthDateChange={setShowMissingBirthDate}
            />
          ) : (
            <div className="min-h-[300px] flex items-center justify-center text-neutral-600">
              <p>Chargement de la liste des usagers...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

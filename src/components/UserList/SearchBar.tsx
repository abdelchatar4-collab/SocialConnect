/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchField: string;
  setSearchField: (field: string) => void;
  isTableView: boolean;
  setIsTableView: (view: boolean) => void;
  problematiquesFilter: string[];
  setProblematiquesFilter: (filter: string[]) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  isTableView,
  setIsTableView,
  problematiquesFilter,
  setProblematiquesFilter
}: SearchBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Barre de recherche principale */}
        <div className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email, secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap gap-2">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les champs</option>
            <option value="nom">Nom</option>
            <option value="prenom">Prénom</option>
            <option value="email">Email</option>
            <option value="secteur">Secteur</option>
            <option value="antenne">Antenne</option>
          </select>

          <button
            onClick={() => setIsTableView(!isTableView)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isTableView
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {isTableView ? (
              <><TableCellsIcon className="h-4 w-4 inline mr-1" />Tableau</>
            ) : (
              <><Squares2X2Icon className="h-4 w-4 inline mr-1" />Grille</>
            )}
          </button>
        </div>
      </div>

      {/* Indicateurs de recherche */}
      {(searchTerm || problematiquesFilter.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Recherche: "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {problematiquesFilter.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {problematiquesFilter.length} problématique(s)
              <button
                onClick={() => setProblematiquesFilter([])}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

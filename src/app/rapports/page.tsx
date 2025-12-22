/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ReportGenerator from '@/components/ReportGenerator';
import DocumentPreview from '@/components/DocumentPreview';
import {
  FolderOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Hooks & Components
import { useDocumentManagement, DocumentInfo } from '@/features/documents/hooks/useDocumentManagement';
import { DocumentLibraryToolbar } from '@/features/documents/components/DocumentLibraryToolbar';
import { DocumentUploadSection } from '@/features/documents/components/DocumentUploadSection';
import { DocumentList } from '@/features/documents/components/DocumentList';

interface User {
  id: string;
  nom: string;
  prenom: string;
  etat?: string | null;
  antenne?: string | null;
  problematiques?: { type?: string | null }[];
  dateNaissance?: string | null;
  genre?: string | null;
  secteur?: string | null;
  gestionnaire?: string | null;
  statutSocial?: string | null;
  dateOuverture?: string | null;
  adresse?: { rue?: string | null } | null;
}

export default function RapportsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');
  const [previewDocument, setPreviewDocument] = useState<DocumentInfo | null>(null);

  const {
    loading: loadingDocs,
    message,
    setMessage,
    uploading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    handleDeleteReport,
    handleUpload,
    groupedDocuments,
    stats
  } = useDocumentManagement();

  // Fetch users for ReportGenerator
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users?take=5000');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const result = await response.json();
        setUsers(Array.isArray(result) ? result : (result.users || []));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const isLoading = loadingDocs || fetchingUsers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Centre de Documents
              </h1>
              <p className="mt-2 text-lg text-gray-600 font-light">
                Gestion complète de vos documents et génération de rapports statistiques
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FolderOpenIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Documents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm mb-6 border border-white/20">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all duration-200 flex items-center ${activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Générer un Rapport
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all duration-200 flex items-center ${activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FolderOpenIcon className="h-5 w-5 mr-2" />
              Bibliothèque
            </button>
          </nav>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-lg animate-in fade-in slide-in-from-top-4 ${message.startsWith('Erreur')
            ? 'bg-red-50 text-red-800 border-red-400'
            : 'bg-green-50 text-green-800 border-green-400'
            }`}>
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-bold">{message}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 font-medium">Analyse du centre de documents...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {activeTab === 'generate' ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <ReportGenerator users={users} />
              </div>
            ) : (
              <>
                <DocumentLibraryToolbar
                  stats={stats}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />

                <DocumentUploadSection
                  onUpload={handleUpload}
                  uploading={uploading}
                  setMessage={setMessage}
                />

                <DocumentList
                  groupedDocuments={groupedDocuments}
                  viewMode={viewMode}
                  onPreview={setPreviewDocument}
                  onDelete={handleDeleteReport}
                  searchTerm={searchTerm}
                  filterType={filterType}
                  onResetFilters={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  uploading={uploading}
                />
              </>
            )}
          </div>
        )}
      </div>

      <DocumentPreview
        isOpen={previewDocument !== null}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
    </div>
  );
}

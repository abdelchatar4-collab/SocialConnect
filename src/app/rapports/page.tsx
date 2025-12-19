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
  DocumentArrowDownIcon,
  FolderOpenIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PhotoIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  TagIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

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

interface DocumentInfo {
  name: string;
  size?: number;
  lastModified?: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';
  category?: string; // Ajouter cette ligne
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';

export default function RapportsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewDocument, setPreviewDocument] = useState<DocumentInfo | null>(null);

  // États pour les nouveaux composants (temporairement désactivés)
  // const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  // const [showBulkExportModal, setShowBulkExportModal] = useState(false);

  // Fonction pour déterminer le type de document
  const getDocumentType = (filename: string): DocumentInfo['type'] => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'xlsx':
      case 'xls':
      case 'csv':
        return 'excel';
      case 'docx':
      case 'doc':
      case 'rtf':
        return 'word';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'svg':
        return 'image';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
        return 'archive';
      default:
        return 'other';
    }
  };

  // Fonction pour obtenir la catégorie du document
  const getDocumentCategory = (filename: string): string => {
    const lowerName = filename.toLowerCase();

    if (lowerName.includes('statistique') || lowerName.includes('rapport') || lowerName.includes('analyse')) {
      return 'Rapports Statistiques';
    } else if (lowerName.includes('liste') || lowerName.includes('usager') || lowerName.includes('user')) {
      return 'Listes Usagers';
    } else if (lowerName.includes('procedure') || lowerName.includes('guide') || lowerName.includes('aide')) {
      return 'Guides & Procédures';
    } else if (lowerName.includes('export') || lowerName.includes('backup') || lowerName.includes('sauvegarde')) {
      return 'Exports & Sauvegardes';
    } else if (lowerName.includes('template') || lowerName.includes('modele') || lowerName.includes('formulaire')) {
      return 'Modèles & Formulaires';
    } else {
      return 'Documents Divers';
    }
  };

  // Fonction pour obtenir l'icône selon le type
  const getDocumentIcon = (type: DocumentInfo['type']) => {
    switch (type) {
      case 'pdf':
        return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
      case 'excel':
        return <TableCellsIcon className="h-8 w-8 text-green-500" />;
      case 'word':
        return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <PhotoIcon className="h-8 w-8 text-purple-500" />;
      case 'archive':
        return <ArchiveBoxIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return <DocumentArrowDownIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur du badge selon le type
  const getTypeBadgeColor = (type: DocumentInfo['type']) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'excel':
        return 'bg-green-100 text-green-800';
      case 'word':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-purple-100 text-purple-800';
      case 'archive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour formater la taille des fichiers
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Taille inconnue';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date inconnue';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir la taille maximale autorisée pour un fichier
  const getMaxSizeForFile = (filename: string): number => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 50 * 1024 * 1024; // 50MB pour les PDFs
      case 'xlsx':
      case 'xls':
        return 25 * 1024 * 1024; // 25MB pour Excel
      case 'zip':
      case 'rar':
      case '7z':
        return 100 * 1024 * 1024; // 100MB pour les archives
      case 'mp4':
      case 'avi':
      case 'mov':
        return 200 * 1024 * 1024; // 200MB pour les vidéos
      default:
        return 10 * 1024 * 1024; // 10MB par défaut
    }
  };

  // Fonction pour formater la limite de taille en texte lisible
  const getMaxSizeText = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return '50MB';
      case 'xlsx':
      case 'xls': return '25MB';
      case 'zip':
      case 'rar':
      case '7z': return '100MB';
      case 'mp4':
      case 'avi':
      case 'mov': return '200MB';
      default: return '10MB';
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setMessage(`Erreur lors du chargement des usagers : ${error.message}`);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/rapports');
      if (!response.ok) {
        throw new Error(`Error fetching reports: ${response.statusText}`);
      }
      const data = await response.json();

      // Si c'est un ancien format (array de strings), on le convertit
      if (Array.isArray(data) && typeof data[0] === 'string') {
        setReports(data);
        const documentsInfo: DocumentInfo[] = data.map((filename: string) => ({
          name: filename,
          type: getDocumentType(filename),
          category: getDocumentCategory(filename), // Ajouter cette ligne
        }));
        setDocuments(documentsInfo);
      } else {
        // Nouveau format avec informations détaillées
        const filenames = data.map((file: any) => file.name);
        setReports(filenames);

        const documentsInfo: DocumentInfo[] = data.map((file: any) => ({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          type: getDocumentType(file.name),
          category: getDocumentCategory(file.name), // Ajouter cette ligne
        }));
        setDocuments(documentsInfo);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setMessage(`Erreur lors du chargement des documents : ${error.message}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchReports()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Validation de la taille du fichier avec limites variables
      const maxSize = getMaxSizeForFile(file.name);
      if (file.size > maxSize) {
        setMessage(`Erreur : Le fichier "${file.name}" est trop volumineux. Taille maximale autorisée pour ce type : ${getMaxSizeText(file.name)}. Taille du fichier : ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        setSelectedFile(null);
        // Reset the input
        event.target.value = '';
        return;
      }

      setSelectedFile(file);
      setMessage(null); // Clear previous messages
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Veuillez sélectionner un fichier à uploader.');
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/rapports/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload du fichier.');
      }

      const result = await response.json();
      setMessage(`Fichier "${result.filename}" uploadé avec succès !`);
      setSelectedFile(null); // Clear selected file
      (event.target as HTMLFormElement).reset(); // Reset the form
      fetchReports(); // Refresh the list of reports

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setMessage(`Erreur lors de l'upload : ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (filename: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${filename}" ?`)) {
      return;
    }

    setUploading(true); // Use uploading state to disable buttons during deletion
    setMessage(null);

    try {
      const response = await fetch('/api/rapports/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du fichier.');
      }

      setMessage(`Rapport "${filename}" supprimé avec succès.`);
      fetchReports(); // Refresh the list of reports

    } catch (error: any) {
      console.error('Error deleting file:', error);
      setMessage(`Erreur lors de la suppression : ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewDocument = (doc: DocumentInfo) => {
    setPreviewDocument(doc);
  };

  // Gestionnaires pour le drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Simuler un événement de changement de fichier
      const file = files[0];

      // Validation de la taille du fichier
      const maxSize = getMaxSizeForFile(file.name);
      if (file.size > maxSize) {
        setMessage(`Erreur : Le fichier "${file.name}" est trop volumineux. Taille maximale autorisée pour ce type : ${getMaxSizeText(file.name)}. Taille du fichier : ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setMessage(null);
    }
  };

  // Fonctions de prévisualisation et sélection temporairement désactivées
  /*
  const handlePreviewDocument = (filename: string) => {
    // Prévisualisation désactivée temporairement
  };

  const handleToggleDocumentSelection = (filename: string) => {
    // Sélection de documents désactivée temporairement
  };

  const handleSelectAllDocuments = () => {
    // Sélection multiple désactivée temporairement
  };
  */

  // Fonction d'export en lot temporairement désactivée
  /*
  const handleBulkExport = () => {
    // Export en lot désactivé temporairement
  };
  */

  // Filtrer et rechercher les documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Grouper les documents par catégorie
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const category = doc.category || 'Autres'; // Valeur par défaut si category est undefined
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, DocumentInfo[]>);

  // Obtenir les statistiques des documents
  const getDocumentStats = () => {
    const stats = {
      total: documents.length,
      pdf: documents.filter(d => d.type === 'pdf').length,
      excel: documents.filter(d => d.type === 'excel').length,
      word: documents.filter(d => d.type === 'word').length,
      image: documents.filter(d => d.type === 'image').length,
      archive: documents.filter(d => d.type === 'archive').length,
      other: documents.filter(d => d.type === 'other').length,
    };
    return stats;
  };

  // Prévisualisation temporairement désactivée
  // const previewDocumentInfo = previewDocument ? documents.find(doc => doc.name === previewDocument) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* En-tête amélioré */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Centre de Documents
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Gestion complète de vos documents et génération de rapports statistiques
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
                <div className="flex items-center space-x-2">
                  <FolderOpenIcon className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getDocumentStats().total}</p>
                    <p className="text-xs text-gray-500">Documents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets améliorée */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm mb-6 border border-white/20">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Générer un Rapport
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FolderOpenIcon className="h-5 w-5 inline mr-2" />
              Bibliothèque de Documents
            </button>
          </nav>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${
            message.startsWith('Erreur')
              ? 'bg-red-50 text-red-800 border-red-400 shadow-red-100'
              : 'bg-green-50 text-green-800 border-green-400 shadow-green-100'
          } shadow-lg`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.startsWith('Erreur') ? (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 font-medium">Chargement des données...</p>
            <p className="text-sm text-gray-500 mt-2">Analyse des documents en cours</p>
          </div>
        ) : (
          <>
            {/* Contenu de l'onglet Générer un Rapport */}
            {activeTab === 'generate' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <ReportGenerator users={users} />
              </div>
            )}

            {/* Contenu de l'onglet Gérer les Documents */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                {/* Barre d'outils et statistiques */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Statistiques des documents */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {[
                        { label: 'Total', count: getDocumentStats().total, color: 'text-gray-600', bgColor: 'bg-gray-100' },
                        { label: 'PDF', count: getDocumentStats().pdf, color: 'text-red-600', bgColor: 'bg-red-100' },
                        { label: 'Excel', count: getDocumentStats().excel, color: 'text-green-600', bgColor: 'bg-green-100' },
                        { label: 'Word', count: getDocumentStats().word, color: 'text-blue-600', bgColor: 'bg-blue-100' },
                        { label: 'Images', count: getDocumentStats().image, color: 'text-purple-600', bgColor: 'bg-purple-100' },
                        { label: 'Archives', count: getDocumentStats().archive, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
                      ].map((stat, index) => (
                        <div key={index} className={`${stat.bgColor} rounded-lg p-3 text-center`}>
                          <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                          <p className="text-xs text-gray-600">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Contrôles de vue et recherche */}
                    <div className="flex items-center space-x-3">
                      {/* Barre de recherche */}
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un document..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Filtre par type */}
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as FilterType)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Tous les types</option>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="word">Word</option>
                        <option value="image">Images</option>
                        <option value="archive">Archives</option>
                        <option value="other">Autres</option>
                      </select>

                      {/* Mode d'affichage */}
                      <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-l-lg transition-all ${
                            viewMode === 'grid'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <Squares2X2Icon className="h-4 w-4 mr-2" />
                          Grille
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-lg transition-all ${
                            viewMode === 'list'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <ListBulletIcon className="h-4 w-4 mr-2" />
                          Liste
                        </button>
                      </div>

                      {/* Fonctionnalités d'export et sélection temporairement désactivées */}
                    </div>
                  </div>
                </div>

                {/* Section Upload */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentArrowDownIcon className="h-6 w-6 mr-2 text-blue-500" />
                    Ajouter un nouveau document
                  </h2>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Glissez votre fichier ici ou cliquez sur le bouton
                      </p>
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={uploading}
                          className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          Télécharger un document
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Tous types de fichiers acceptés
                      </p>
                      <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <div>Limites par type :</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>• PDF : 50MB</div>
                          <div>• Excel : 25MB</div>
                          <div>• Archives : 100MB</div>
                          <div>• Vidéos : 200MB</div>
                          <div>• Autres : 10MB</div>
                        </div>
                      </div>
                      {selectedFile && (
                        <div className={`mt-4 p-3 rounded-lg ${
                          selectedFile.size <= getMaxSizeForFile(selectedFile.name)
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <p className={`text-sm font-medium ${
                            selectedFile.size <= getMaxSizeForFile(selectedFile.name)
                              ? 'text-green-900'
                              : 'text-red-900'
                          }`}>
                            Fichier sélectionné : {selectedFile.name}
                          </p>
                          <p className={`text-xs ${
                            selectedFile.size <= getMaxSizeForFile(selectedFile.name)
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}>
                            Taille : {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-gray-600">
                            Limite pour ce type : {getMaxSizeText(selectedFile.name)}
                          </p>
                          {selectedFile.size > getMaxSizeForFile(selectedFile.name) && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              ⚠️ Fichier trop volumineux, veuillez en sélectionner un plus petit
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bouton d'upload */}
                    {selectedFile && selectedFile.size <= getMaxSizeForFile(selectedFile.name) && (
                      <div className="flex justify-center pt-4">
                        <button
                          type="submit"
                          disabled={uploading}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {uploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Upload en cours...
                            </>
                          ) : (
                            <>
                              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                              Uploader le fichier
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Liste des documents organisés par catégorie */}
                {Object.keys(groupedDocuments).length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/20">
                    <FolderOpenIcon className="mx-auto h-24 w-24 text-gray-300 mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || filterType !== 'all'
                        ? 'Aucun document ne correspond à vos critères de recherche.'
                        : 'Commencez par télécharger votre premier document.'
                      }
                    </p>
                    {(searchTerm || filterType !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterType('all');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedDocuments).map(([category, docs]) => (
                      <div key={category} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              <TagIcon className="h-5 w-5 mr-2 text-blue-500" />
                              {category}
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {docs.length} document{docs.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {docs.map((doc, index) => (
                              <div key={index} className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    {getDocumentIcon(doc.type)}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors cursor-pointer"
                                          title={doc.name}
                                          onClick={() => window.open(`/api/rapports/${encodeURIComponent(doc.name)}`, '_blank')}>
                                        {doc.name}
                                      </h4>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(doc.type)}`}>
                                          {doc.type.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Informations du fichier */}
                                <div className="text-xs text-gray-500 space-y-1 mb-3">
                                  <div className="flex items-center justify-between">
                                    <span>Taille :</span>
                                    <span className="font-medium">{formatFileSize(doc.size)}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Modifié :</span>
                                    <span className="font-medium">{formatDate(doc.lastModified)}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handlePreviewDocument(doc)}
                                      className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Aperçu"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                    <a
                                      href={`/api/rapports/${encodeURIComponent(doc.name)}`}
                                      download
                                      className="inline-flex items-center p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Télécharger"
                                    >
                                      <ArrowDownTrayIcon className="h-4 w-4" />
                                    </a>
                                    <button
                                      onClick={() => handleDeleteReport(doc.name)}
                                      className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                      disabled={uploading}
                                      title="Supprimer"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {docs.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                  {getDocumentIcon(doc.type)}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                                        title={doc.name}
                                        onClick={() => window.open(`/api/rapports/${encodeURIComponent(doc.name)}`, '_blank')}>
                                      {doc.name}
                                    </h4>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(doc.type)}`}>
                                        {doc.type.toUpperCase()}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatFileSize(doc.size)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Modifié {formatDate(doc.lastModified)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handlePreviewDocument(doc)}
                                    className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Aperçu"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                  <a
                                    href={`/api/rapports/${encodeURIComponent(doc.name)}`}
                                    download
                                    className="inline-flex items-center p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Télécharger"
                                  >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteReport(doc.name)}
                                    className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                    disabled={uploading}
                                    title="Supprimer"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Composants de prévisualisation et d'export en lot - Temporairement désactivés */}
      <DocumentPreview
        isOpen={previewDocument !== null}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
    </div>
  );
}

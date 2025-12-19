/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { ImportUsers } from '@/features/users';

const AdminPage: React.FC = () => {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const handleExportExcelWithPython = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/users/export/excel');

      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorData.details) errorMessage += ` Détails: ${errorData.details}`;
          if (errorData.stderr) errorMessage += ` Stderr: ${errorData.stderr}`;
        } catch (e) {
          // La réponse n'est pas JSON, utiliser le statusText
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `Export_Usagers_${new Date().toISOString().slice(0, 10)}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error("Erreur lors de l'export Excel (Python):", error);
      alert(`Une erreur s'est produite lors de l'exportation: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAdmin) {
    return <div className="text-center mt-10 text-red-600">Accès non autorisé.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Administration</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('import')}
            className={`${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Importer des Usagers
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Exporter des Usagers
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'import' && (
          <div className="bg-white shadow rounded-lg p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Importer depuis un fichier Excel</h2>
            <ImportUsers onImportComplete={() => { /* Gérer la complétion de l'import si nécessaire */ }} />
          </div>
        )}
        {activeTab === 'export' && (
          <div className="bg-white shadow rounded-lg p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Exporter les Usagers en Excel</h2>
            <button
              onClick={handleExportExcelWithPython}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {isExporting ? 'Exportation en cours...' : 'Lancer l\'Exportation Excel'}
            </button>
            {isExporting && <p className="mt-2 text-sm text-gray-700">Veuillez patienter, la génération du fichier peut prendre quelques instants...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

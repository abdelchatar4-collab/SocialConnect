/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState } from 'react';
import {
  XMarkIcon,
  CloudArrowDownIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocuments: string[];
  onExportComplete: () => void;
}

export default function BulkExportModal({
  isOpen,
  onClose,
  selectedDocuments,
  onExportComplete
}: BulkExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'zip' | 'individual'>('zip');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (selectedDocuments.length === 0) return;

    setIsExporting(true);

    try {
      if (exportFormat === 'zip') {
        // Créer un ZIP avec tous les fichiers sélectionnés
        const response = await fetch('/api/rapports/bulk-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: selectedDocuments,
            exportType: 'zip'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'export');
        }

        // Télécharger le fichier ZIP
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents_export_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Télécharger chaque fichier individuellement
        for (const docName of selectedDocuments) {
          const a = document.createElement('a');
          a.href = `/api/rapports/${encodeURIComponent(docName)}`;
          a.download = docName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Petite pause entre les téléchargements
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      onExportComplete();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des documents');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <CloudArrowDownIcon className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Export en lot
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} sélectionné{selectedDocuments.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Format selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Format d&apos;export
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setExportFormat('zip')}
                  className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${exportFormat === 'zip'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <ArchiveBoxIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Archive ZIP</h3>
                      <p className="text-sm text-gray-500">
                        Tous les fichiers dans une archive
                      </p>
                    </div>
                  </div>
                  {exportFormat === 'zip' && (
                    <div className="absolute top-2 right-2">
                      <CheckIcon className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setExportFormat('individual')}
                  className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${exportFormat === 'individual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <DocumentDuplicateIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Fichiers individuels</h3>
                      <p className="text-sm text-gray-500">
                        Téléchargement séparé de chaque fichier
                      </p>
                    </div>
                  </div>
                  {exportFormat === 'individual' && (
                    <div className="absolute top-2 right-2">
                      <CheckIcon className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Files list */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fichiers sélectionnés
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {selectedDocuments.map((fileName, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900 truncate flex-1">
                      {fileName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {exportFormat === 'zip' ? (
                <div className="flex items-center space-x-2">
                  <ArchiveBoxIcon className="h-4 w-4" />
                  <span>Les documents seront compressés dans un fichier ZIP</span>
                </div>
              ) : (
                <span>Chaque document sera téléchargé individuellement</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={handleExport}
                disabled={selectedDocuments.length === 0 || isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Export en cours...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowDownIcon className="h-4 w-4" />
                    <span>Exporter ({selectedDocuments.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

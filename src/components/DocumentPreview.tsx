/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React from 'react';
import { XMarkIcon, DocumentTextIcon, PhotoIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/formatters';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    type: 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';
    size?: number;
    lastModified?: string;
  } | null;
}

export default function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
  if (!isOpen || !document) return null;

  const handleDownload = () => {
    const fileUrl = `/api/rapports/${encodeURIComponent(document.name)}`;
    const link = window.document.createElement('a');
    link.href = fileUrl;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const getPreviewContent = () => {
    const fileUrl = `/api/rapports/${encodeURIComponent(document.name)}`;

    switch (document.type) {
      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-96 border border-gray-300 rounded"
            title={`Prévisualisation de ${document.name}`}
          />
        );
      case 'image':
        return (
          <img
            src={fileUrl}
            alt={document.name}
            className="max-w-full max-h-96 object-contain mx-auto"
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <DocumentTextIcon className="h-16 w-16 mb-4" />
            <p>Prévisualisation non disponible pour ce type de fichier</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Ouvrir le fichier
            </a>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Télécharger
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              {getPreviewContent()}
            </div>

            {/* Footer avec boutons d'action */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {document.size && (
                  <span>Taille: {(document.size / 1024 / 1024).toFixed(2)} MB</span>
                )}
                {document.lastModified && (
                  // Remplacer :
                  // <span className="ml-4">Modifié: {new Date(document.lastModified).toLocaleDateString()}</span>

                  // Par :
                  <span className="ml-4">Modifié: {formatDate(document.lastModified)}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2 inline" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

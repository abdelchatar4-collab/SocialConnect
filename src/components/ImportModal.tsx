/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importez XLSX
import { mapExcelToUserStructure, transformDateExcel } from '@/utils/importHelpers'; // Importez mapExcelToUserStructure et transformDateExcel
import { useAdmin } from '@/contexts/AdminContext';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void; // Ajoutez cette ligne
}

// Copiez la fonction parseCellValue ici depuis ImportUsers.jsx
const parseCellValue = (cell: any, headerKey: string | undefined) => {
  if (!cell) {
    return ''; // Retourne une chaîne vide si la cellule est vide
  }

  const lowerHeader = headerKey?.toLowerCase() || '';
  const dateHeaders = ['date', 'naissance', 'inscription', 'début', 'fin', 'rendez-vous'];

  const isPotentialDateColumn = dateHeaders.some(keyword => lowerHeader.includes(keyword));

  if (isPotentialDateColumn) {
    if (cell.t === 'n') {
      try {
        const dateInfo = XLSX.SSF.parse_date_code(cell.v);
        if (dateInfo && dateInfo.y && dateInfo.m !== undefined && dateInfo.d) {
          const month = (dateInfo.m + 1).toString().padStart(2, '0');
          const day = dateInfo.d.toString().padStart(2, '0');
          const year = dateInfo.y;
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.warn(`[ImportModal] Failed to parse Excel serial date for header "${headerKey}":`, cell.v, e);
      }
    }
  }

  return cell.w !== undefined ? String(cell.w) : String(cell.v);
};

const ImportIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const { selectedYear } = useAdmin();

  // Utilisez process.env.NODE_ENV directement
  const currentEnvironment = process.env.NODE_ENV;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      setFile(selectedFile);
      setMessage(null);
      setIsError(false);
    } else {
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage("Veuillez sélectionner un fichier.");
      setIsError(true);
      return;
    }
    // La vérification !environment n'est plus nécessaire de la même manière,
    // car process.env.NODE_ENV sera toujours défini.

    if (!file) {
      setMessage("Veuillez sélectionner un fichier.");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // Vérifier que e.target et e.target.result ne sont pas nuls
        if (!e.target || !e.target.result) {
          throw new Error("Erreur lors de la lecture du fichier: Résultat vide.");
        }
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellText: false, cellNF: false });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Utiliser un type plus précis pour les données brutes de la feuille
        const rawSheetData: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

        if (rawSheetData.length === 0) {
          setMessage("Le fichier est vide ou ne contient pas de données.");
          setIsError(true);
          setIsLoading(false);
          return;
        }

        let headerRowIndex = -1;
        // Trouver l'index de la première ligne non vide (qui devrait être les en-têtes)
        for (let i = 0; i < rawSheetData.length; i++) {
          const row = rawSheetData[i];
          // Vérifier si la ligne n'est pas vide (contient au moins une cellule non vide)
          if (row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          // Gérer le cas où tout le fichier est vide
          setMessage("Le fichier ne contient aucune donnée valide.");
          setIsError(true);
          setIsLoading(false);
          return;
        }

        // Extraire les en-têtes à partir de la ligne trouvée
        const headers: (string | number | null | undefined)[] = rawSheetData[headerRowIndex];
        // Extraire les lignes de données à partir de la ligne suivant les en-têtes
        const dataRows: (string | number | null | undefined)[][] = rawSheetData.slice(headerRowIndex + 1);

        const processedUsers = [];
        const errors = [];
        const totalRows = dataRows.length;

        // Pas de barre de progression dans la modale, juste traitement
        // setImportProgress({ current: 0, total: totalRows, percentage: 0, status: 'Traitement en cours...' });

        for (let i = 0; i < totalRows; i++) {
          const rowData: (string | number | null | undefined)[] = dataRows[i];
          const rowObject: Record<string, any> = {}; // Utiliser Record<string, any> pour le mappage dynamique

          headers.forEach((header, index) => {
            // Assurez-vous que l'en-tête est une chaîne pour l'utiliser comme clé
            const headerString = String(header || '').trim();
            if (headerString) { // Ignorer les en-têtes vides
              const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex + 1 + i, c: index });
              // Utiliser la fonction parseCellValue copiée/définie localement
              rowObject[headerString] = parseCellValue({ v: rowData[index], t: worksheet[cellAddress]?.t }, headerString);
            }
          });

          const originalRowIndex = headerRowIndex + 1 + i;
          // mapExcelToUserStructure doit être importé
          const mappedUser = mapExcelToUserStructure(rowObject, originalRowIndex, currentEnvironment);

          if (mappedUser) {
            processedUsers.push(mappedUser);
          } else {
            errors.push({ rowIndex: originalRowIndex + 1, data: rowObject, reason: 'Mapping failed or minimal data missing' });
          }
        }

        if (processedUsers.length === 0) {
          setMessage("Aucun utilisateur valide n'a pu être extrait du fichier.");
          setIsError(true);
          setIsLoading(false);
          return;
        }

        // --- Envoi des données mappées à l'API ---
        console.log("[ImportModal] Sending mapped users to API:", processedUsers);

        const apiResponse = await fetch('/api/user/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-auth': 'admin123' // Assurez-vous que cet en-tête est toujours nécessaire
          },
          body: JSON.stringify({
            users: processedUsers,
            annee: selectedYear || new Date().getFullYear()
          }), // Envoyer le tableau d'objets JSON enveloppé avec l'année
        });

        const resultData = await apiResponse.json();

        if (apiResponse.ok) {
          setMessage(`Importation réussie ! ${resultData.importedCount} utilisateurs importés.`);
          setIsError(false);
          if (onImportSuccess) onImportSuccess();
          setTimeout(() => {
            onClose();
            setFile(null);
            setMessage(null);
            setIsLoading(false); // Mettre à false ici après la fermeture
          }, 2000);
        } else {
          console.error("[ImportModal] API Import Error:", resultData);
          setMessage(`Erreur lors de l'importation: ${resultData.error || apiResponse.statusText}`);
          setIsError(true);
          setIsLoading(false); // Mettre à false en cas d'erreur API
        }

      } catch (e) {
        console.error("[ImportModal] Error processing file:", e);
        setMessage(`Erreur lors du traitement du fichier: ${e instanceof Error ? e.message : 'Une erreur inconnue'}`);
        setIsError(true);
        setIsLoading(false);
      }
    };

    reader.onerror = (error) => {
      console.error("[ImportModal] FileReader error:", error);
      setMessage(`Erreur de lecture du fichier: ${error instanceof Error ? error.message : 'Une erreur inconnue'}`);
      setIsError(true);
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Optionnel: Réinitialiser l'état quand la modale est fermée de l'extérieur
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setMessage(null);
      setIsError(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Importer des usagers</h2>

        <p className="mb-4 text-gray-600">
          Sélectionnez un fichier CSV ou Excel pour importer des usagers.
        </p>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Fichier CSV / Excel
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="border rounded w-full p-2"
            accept=".csv,.xlsx,.xls"
            name="file"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Fichier sélectionné: {file.name}
            </p>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-2 rounded ${isError ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'
              }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="flex items-center justify-center px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-500"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importation...
              </>
            ) : (
              <>
                <ImportIcon />
                Importer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;

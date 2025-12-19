/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";
import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  mapExcelToUserStructure,
  transformDateExcel
} from '@/utils/importHelpers';
import { User } from '@/types';

// Interfaces TypeScript pour le composant
interface AddressData {
  rue: string;
  codePostal: string;
  ville: string;
  numero: string;
}

interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
  status: string;
}

interface ImportResults {
  totalRows: number;
  processedUsers: number;
  errors: number;
}

interface ImportUsersProps {
  onImportComplete?: () => void;
}

interface CellData {
  v: any;
  w?: string;
  t?: string;
}

// La fonction extractAddressColumns est maintenue localement car elle est spécifique à ce composant
const extractAddressColumns = (row: Record<string, any>): AddressData => {
  console.log("[extractAddressColumns] Processing row:", row); // Log la ligne brute
  let rue = '';
  let codePostal = '';
  let ville = '';
  let numeroMaison = ''; // Variable pour le numéro
  const rueKeys = ['rue', 'street', 'adresse', 'address'];
  const cpKeys = ['cp', 'code postal', 'postal code', 'zip'];
  const villeKeys = ['ville', 'city', 'commune', 'localité'];
  const numeroKeys = ['n°', 'numero', 'numéro', 'number', 'num']; // Clés pour le numéro

  for (const colName in row) {
    if (!colName || !row[colName]) continue;
    const colNameLower = colName.toLowerCase().trim();
    const value = row[colName].toString().trim();

    // 1. Chercher spécifiquement le numéro de maison
    if (numeroKeys.some(key => colNameLower === key || colNameLower.includes(key))) {
      numeroMaison = value;
      console.log(`[extractAddressColumns] Found house number from column '${colName}': "${numeroMaison}"`);
      continue; // Passe à la colonne suivante une fois le numéro trouvé
    }
    // 2. Chercher la rue (éviter les colonnes de numéro)
    if (rueKeys.some(key => colNameLower === key || colNameLower.includes(key)) && !numeroKeys.some(nk => colNameLower === nk || colNameLower.includes(nk))) {
      rue = value;
      console.log(`[extractAddressColumns] Found street from column '${colName}': "${rue}"`);
    }
    // 3. Chercher CP
    if (cpKeys.some(key => colNameLower === key || colNameLower.includes(key))) {
      codePostal = value;
      console.log(`[extractAddressColumns] Found postal code from column '${colName}': "${codePostal}"`);
    }
    // 4. Chercher Ville
    if (villeKeys.some(key => colNameLower === key || colNameLower.includes(key))) {
      ville = value;
      console.log(`[extractAddressColumns] Found city from column '${colName}': "${ville}"`);
    }
  }

  // ---> LOG FINAL DE LA FONCTION <---
  console.log("[extractAddressColumns] Returning:", { rue, codePostal, ville, numero: numeroMaison });
  return {
    rue: rue, // Retourner la rue SANS le numéro ici
    codePostal: codePostal,
    ville: ville,
    numero: numeroMaison // Retourner le numéro séparément
  };
};

const ImportUsers: React.FC<ImportUsersProps> = ({ onImportComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [processingMethod, setProcessingMethod] = useState<string>('optimized');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fonction pour parser les valeurs de cellule, en gérant spécifiquement les dates
  const parseCellValue = (cell: CellData | null, headerKey?: string): string => {
    if (!cell) {
      return ''; // Retourne une chaîne vide si la cellule est vide
    }

    const lowerHeader = headerKey?.toLowerCase() || '';
    // Colonnes potentielles contenant des dates (à adapter si nécessaire)
    const dateHeaders = ['date', 'naissance', 'inscription', 'début', 'fin', 'rendez-vous'];

    // Vérifier si l'en-tête suggère une date
    const isPotentialDateColumn = dateHeaders.some(keyword => lowerHeader.includes(keyword));

    if (isPotentialDateColumn) {
      // Si c'est un nombre, essayer de le traiter comme un numéro de série Excel
      if (cell.t === 'n') {
        try {
          // XLSX.SSF.parse_date_code convertit le numéro de série en objet {y, m, d, H, M, S}
          // Attention: Le mois 'm' est 0-indexé (0=Janvier, 11=Décembre)
          const dateInfo = XLSX.SSF.parse_date_code(cell.v);
          // Log the raw dateInfo object for debugging
          console.log(`[Import Debug] Date Parsing for header "${headerKey}", cell.v: ${cell.v}, cell.t: ${cell.t}`);
          console.log(`[Import Debug] XLSX.SSF.parse_date_code output:`, JSON.stringify(dateInfo));

          if (dateInfo && dateInfo.y && dateInfo.m !== undefined && dateInfo.d) {
            // Construct the date string directly to avoid Date object pitfalls
            // Add 1 to the 0-indexed month (dateInfo.m)
            const month = (dateInfo.m + 1).toString().padStart(2, '0');
            const day = dateInfo.d.toString().padStart(2, '0');
            const year = dateInfo.y;
            // Return the correctly formatted 'yyyy-MM-dd' string
            return `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.warn(`[Import Debug] Failed to parse Excel serial date for header "${headerKey}" using XLSX.SSF.parse_date_code:`, cell.v, e);
        }
      }
      // Si c'est une chaîne, on pourrait essayer de la parser, mais c'est moins fiable
      // Pour l'instant, on se fie à la conversion numérique ou à la valeur formatée
    }

    // Pour les autres types ou si la conversion de date a échoué, retourner la valeur formatée (.w) si elle existe, sinon la valeur brute (.v)
    // Convertir en chaîne pour assurer la cohérence
    return cell.w !== undefined ? String(cell.w) : String(cell.v);
  };

  // Gestion de l'importation du fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResults(null);
    setImportProgress(null);
    setSuccessMessage('');
    setIsLoading(true);

    const file = event.target.files?.[0];
    if (!file) {
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellText: false, cellNF: false }); // cellDates: false pour gérer manuellement

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir la feuille en tableau d'objets JSON (une ligne par objet)
        // header: 1 pour utiliser la première ligne comme en-têtes
        // raw: true pour obtenir les valeurs brutes (y compris les numéros de série Excel pour les dates)
        // Utiliser { header: 1, raw: true } pour obtenir un tableau de tableaux bruts
        const rawSheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];

        if (rawSheetData.length === 0) {
          setError("Le fichier est vide ou ne contient pas de données.");
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
          setError("Le fichier ne contient aucune donnée valide.");
          setIsLoading(false);
          return;
        }

        // Extraire les en-têtes à partir de la ligne trouvée
        const headers = rawSheetData[headerRowIndex] as string[];
        // Extraire les lignes de données à partir de la ligne suivant les en-têtes
        const dataRows = rawSheetData.slice(headerRowIndex + 1);

        const processedUsers: User[] = [];
        const errors: Array<{ rowIndex: number; data: Record<string, any>; reason: string }> = [];
        const totalRows = dataRows.length;

        setImportProgress({ current: 0, total: totalRows, percentage: 0, status: 'Traitement en cours...' });

        // Traiter chaque ligne de données
        for (let i = 0; i < totalRows; i++) {
          const rowData = dataRows[i];
          // Créer un objet avec les en-têtes comme clés et les valeurs de la ligne
          const rowObject: Record<string, any> = {};
          headers.forEach((header, index) => {
            // Utiliser parseCellValue pour gérer les types et les dates
            // L'index de la cellule dans la feuille originale est (headerRowIndex + 1 + i, index)
            const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex + 1 + i, c: index });
            const cellData = worksheet[cellAddress];
            rowObject[header] = parseCellValue(
              cellData ? { v: rowData[index], t: cellData.t, w: cellData.w } : null,
              header
            );
          });

          // Mapper la ligne traitée à la structure utilisateur
          // Passer l'index de la ligne originale dans le fichier Excel pour les logs d'erreur
          const originalRowIndex = headerRowIndex + 1 + i;
          const mappedUser = mapExcelToUserStructure(rowObject, originalRowIndex);

          if (mappedUser) {
            processedUsers.push(mappedUser);
            // --- AJOUT TEMPORAIRE : Afficher la langue mappée pour la première ligne ---
            if (i === 0) {
              alert(`Langue mappée pour la première ligne de données (ligne ${originalRowIndex + 1} dans Excel): ${mappedUser.langue}`);
            }
            // --- FIN AJOUT TEMPORAIRE ---
          } else {
            errors.push({ rowIndex: i + 2, data: rowObject, reason: 'Mapping failed or minimal data missing' }); // +2 car 1-indexed et on saute l'en-tête
          }

          // Mettre à jour la progression (par lots pour éviter trop de re-renders)
          if ((i + 1) % 10 === 0 || i + 1 === totalRows) {
            const percentage = Math.round(((i + 1) / totalRows) * 100);
            setImportProgress({ current: i + 1, total: totalRows, percentage: percentage, status: `Traitement de la ligne ${i + 1}...` });
          }
        }

        setImportProgress({ current: totalRows, total: totalRows, percentage: 100, status: 'Envoi des données...' });

        // --- Envoi des données à l'API ---
        console.log("Mapped users:", processedUsers); // Log les utilisateurs mappés
        console.log("Errors during mapping:", errors); // Log les erreurs de mappage

        if (processedUsers.length > 0) {
          const apiResponse = await fetch('/api/user/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedUsers),
          });

          const resultData = await apiResponse.json();

          if (apiResponse.ok) {
            setSuccessMessage(`Importation réussie! ${resultData.importedCount} utilisateurs importés.`);
            setResults({
              totalRows: totalRows,
              processedUsers: processedUsers.length, // Nombre d'utilisateurs qui ont passé le mapping
              errors: errors.length + (resultData.errors?.length || 0), // Erreurs de mapping + erreurs API
            });
            if (onImportComplete) {
              onImportComplete(); // Appeler le callback si fourni
            }
          } else {
            setError(`Erreur lors de l'importation: ${resultData.error || apiResponse.statusText}`);
            setResults({
              totalRows: totalRows,
              processedUsers: processedUsers.length,
              errors: errors.length + (resultData.errors?.length || 0),
            });
            console.error("API Import Error:", resultData);
          }
        } else {
          setError("Aucun utilisateur valide n'a pu être extrait du fichier.");
          setResults({
            totalRows: totalRows,
            processedUsers: 0,
            errors: errors.length,
          });
        }

      } catch (e) {
        console.error("Error processing file:", e);
        const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
        setError(`Erreur lors du traitement du fichier: ${errorMessage}`);
        setResults({
          totalRows: 0,
          processedUsers: 0,
          errors: 0, // Impossible de compter les erreurs individuelles ici
        });
      } finally {
        setIsLoading(false);
        setImportProgress(null); // Cacher la barre de progression à la fin
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      setError(`Erreur de lecture du fichier: ${error}`);
      setIsLoading(false);
      setImportProgress(null);
    };

    reader.readAsArrayBuffer(file);
  };

  // --- Rendu du composant inchangé ---
  return (
    <div className="import-container p-4 max-w-4xl mx-auto">
      {/* Le reste du JSX n'a pas besoin d'être modifié */}
      <h2 className="text-2xl font-bold mb-6">Importation d&apos;utilisateurs</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Sélectionner un fichier</h3>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier Excel (.xlsx, .xls) ou CSV (.csv)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="block w-full text-sm text-gray-700
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-700 mt-1">
            Assurez-vous que les en-têtes de colonnes sont sur la première ligne.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Succès!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      {importProgress && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Progression</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${importProgress.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-600">
            <span>{importProgress.current} sur {importProgress.total} lignes traitées</span>
            <span>{importProgress.percentage}%</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            Statut: {importProgress.status}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-700 dark:text-gray-300">Chargement en cours...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {results && !isLoading && (
        <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Résultats de l&apos;importation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{results.totalRows}</div>
              <div className="text-sm text-gray-700 dark:text-gray-600">Lignes de données lues</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{results.processedUsers}</div>
              <div className="text-sm text-gray-700 dark:text-gray-600">Utilisateurs traités</div>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{results.errors}</div>
              <div className="text-sm text-gray-700 dark:text-gray-600">Lignes ignorées</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportUsers;

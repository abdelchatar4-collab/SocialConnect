/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { mapExcelToUserStructure } from '@/utils/importHelpers';
import { User } from '@/types';
import { parseCellValue } from '../utils/importParsing';
import { ImportResultsDisplay } from './Import/ImportResultsDisplay';
import { ImportProgressDisplay } from './Import/ImportProgressDisplay';

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

const ImportUsers: React.FC<ImportUsersProps> = ({ onImportComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

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
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellText: false, cellNF: false });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawSheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];

        if (rawSheetData.length === 0) {
          setError("Le fichier est vide ou ne contient pas de données.");
          setIsLoading(false);
          return;
        }

        let headerRowIndex = -1;
        for (let i = 0; i < rawSheetData.length; i++) {
          const row = rawSheetData[i];
          if (row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          setError("Le fichier ne contient aucune donnée valide.");
          setIsLoading(false);
          return;
        }

        const headers = rawSheetData[headerRowIndex] as string[];
        const dataRows = rawSheetData.slice(headerRowIndex + 1);

        const processedUsers: User[] = [];
        const errors: any[] = [];
        const totalRows = dataRows.length;

        setImportProgress({ current: 0, total: totalRows, percentage: 0, status: 'Traitement en cours...' });

        for (let i = 0; i < totalRows; i++) {
          const rowData = dataRows[i];
          const rowObject: Record<string, any> = {};

          headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex + 1 + i, c: index });
            const cellData = worksheet[cellAddress];
            rowObject[header] = parseCellValue(
              cellData ? { v: rowData[index], t: cellData.t, w: cellData.w } : null,
              header
            );
          });

          const originalRowIndex = headerRowIndex + 1 + i;
          const mappedUser = mapExcelToUserStructure(rowObject, originalRowIndex);

          if (mappedUser) {
            processedUsers.push(mappedUser);
          } else {
            errors.push({ rowIndex: i + 2, data: rowObject, reason: 'Mapping failed' });
          }

          if ((i + 1) % 10 === 0 || i + 1 === totalRows) {
            setImportProgress({
              current: i + 1,
              total: totalRows,
              percentage: Math.round(((i + 1) / totalRows) * 100),
              status: `Traitement de la ligne ${i + 1}...`
            });
          }
        }

        setImportProgress({ current: totalRows, total: totalRows, percentage: 100, status: 'Envoi des données...' });

        if (processedUsers.length > 0) {
          const apiResponse = await fetch('/api/user/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(processedUsers),
          });

          const resultData = await apiResponse.json();

          if (apiResponse.ok) {
            setSuccessMessage(`Importation réussie! ${resultData.importedCount} utilisateurs importés.`);
            setResults({
              totalRows: totalRows,
              processedUsers: processedUsers.length,
              errors: errors.length + (resultData.errors?.length || 0),
            });
            if (onImportComplete) onImportComplete();
          } else {
            setError(`Erreur lors de l'importation: ${resultData.error || apiResponse.statusText}`);
            setResults({
              totalRows: totalRows,
              processedUsers: processedUsers.length,
              errors: errors.length + (resultData.errors?.length || 0),
            });
          }
        } else {
          setError("Aucun utilisateur valide n'a pu être extrait du fichier.");
          setResults({ totalRows: totalRows, processedUsers: 0, errors: errors.length });
        }

      } catch (e) {
        console.error("Error processing file:", e);
        setError(`Erreur lors du traitement du fichier: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
        setResults({ totalRows: 0, processedUsers: 0, errors: 0 });
      } finally {
        setIsLoading(false);
        setImportProgress(null);
      }
    };

    reader.onerror = (error) => {
      setError(`Erreur de lecture du fichier: ${error}`);
      setIsLoading(false);
      setImportProgress(null);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="import-container p-4 max-w-4xl mx-auto">
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

      <ImportProgressDisplay progress={importProgress} />

      {isLoading && !importProgress && (
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

      <ImportResultsDisplay results={results} isLoading={isLoading} />
    </div>
  );
};

export default ImportUsers;

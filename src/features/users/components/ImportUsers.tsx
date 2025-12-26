/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useSession } from 'next-auth/react';
import { mapExcelToUserStructure } from '@/utils/importHelpers';
import { ImportResultsDisplay } from './Import/ImportResultsDisplay';
import { ImportProgressDisplay } from './Import/ImportProgressDisplay';
import { ImportMappingStep } from './Import/ImportMappingStep';
import { ImportProgress, ImportResults } from './Import/ImportTypes';
import { detectHeaders } from './Import/ImportHeaderDetector';
import { UploadZone } from './Import/UploadZone';

interface ImportUsersProps {
  onImportComplete?: () => void;
}

const ImportUsers: React.FC<ImportUsersProps> = ({ onImportComplete }) => {
  const { data: session } = useSession();
  const serviceId = (session?.user as any)?.serviceId || 'default';
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<Record<string, any>>({});
  const [showMapping, setShowMapping] = useState<boolean>(false);
  const [filesToProcess, setFilesToProcess] = useState<File[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResults(null);
    setImportProgress(null);
    setSuccessMessage('');
    setIsLoading(true);

    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'));

    if (validFiles.length === 0) {
      setError("Aucun fichier valide sélectionné (.xlsx, .xls, .csv).");
      setIsLoading(false);
      return;
    }

    setFilesToProcess(validFiles);

    const file = validFiles[0];
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellText: false, cellNF: false });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawSheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];

        if (rawSheetData.length === 0) {
          setError(`Le fichier ${file.name} est vide.`);
          setIsLoading(false);
          return;
        }

        const { headers: detectedHeaders, sampleRow } = detectHeaders(rawSheetData);
        setHeaders(detectedHeaders);
        setSampleData(sampleRow);
        setShowMapping(true);
        setIsLoading(false);
      } catch (e) {
        setError(`Erreur lecture ${file.name}: ${e instanceof Error ? e.message : 'Inconnue'}`);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError(`Erreur de lecture du fichier.`);
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const processSingleFile = async (file: File, customMapping: Record<string, string>): Promise<{ users: any[], rows: number, errorsCount: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

          const { headers: fileHeaders } = detectHeaders(rawData);
          const dataRows = rawData.slice(1);
          const processedUsers: any[] = [];
          let errorsCount = 0;

          dataRows.forEach((row, i) => {
            if (!row || row.every(c => !c)) return;
            const rowObj: Record<string, any> = {};
            fileHeaders.forEach((h, idx) => { if (h) rowObj[h] = row[idx]; });
            const mapped = mapExcelToUserStructure(rowObj, i, customMapping);
            if (mapped) processedUsers.push(mapped);
            else errorsCount++;
          });

          resolve({ users: processedUsers, rows: dataRows.length, errorsCount });
        } catch (err) { reject(err); }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const finalizeImport = async (customMapping: Record<string, string>) => {
    setIsLoading(true);
    setShowMapping(false);

    let totalImported = 0;
    let totalErrors = 0;
    let totalProcessedRows = 0;

    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setImportProgress({
          current: i + 1,
          total: filesToProcess.length,
          status: `Traitement de ${file.name}...`,
          isBatch: true,
          fileName: file.name
        });

        const { users, rows, errorsCount } = await processSingleFile(file, customMapping);
        totalProcessedRows += rows;
        totalErrors += errorsCount;

        if (users.length > 0) {
          const res = await fetch('/api/user/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users, serviceId }),
          });
          const data = await res.json();
          if (res.ok) {
            totalImported += data.importedCount;
            totalErrors += (data.errors?.length || 0);
          }
        }
      }

      setSuccessMessage(`Importation terminée ! ${totalImported} usagers importés.`);
      setResults({ totalRows: totalProcessedRows, processedUsers: totalImported, errors: totalErrors });
      if (onImportComplete) onImportComplete();
    } catch (e) {
      setError(`Erreur lors de l'importation : ${e instanceof Error ? e.message : 'Inconnue'}`);
    } finally {
      setIsLoading(false);
      setImportProgress(null);
    }
  };

  return (
    <div className="import-container p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Importation d&apos;utilisateurs</h2>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Succès!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <ImportProgressDisplay progress={importProgress} />

      {isLoading && !importProgress && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-700">Traitement en cours...</p>
        </div>
      )}

      {!showMapping ? (
        <UploadZone
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          filesToProcess={filesToProcess}
          onClearFiles={() => setFilesToProcess([])}
        />
      ) : (
        <ImportMappingStep
          headers={headers}
          sampleData={sampleData}
          onConfirm={finalizeImport}
          onCancel={() => setShowMapping(false)}
        />
      )}

      {results && !showMapping && <ImportResultsDisplay results={results} isLoading={isLoading} />}
    </div>
  );
};

export default ImportUsers;


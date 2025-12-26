/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre
*/

"use client";
import React, { useState, useCallback, lazy, Suspense } from 'react';
import * as XLSX from 'xlsx';
import { useSession } from 'next-auth/react';
import { useUserImport } from '../hooks/useUserImport';
import { ImportResultsDisplay } from './Import/ImportResultsDisplay';
import { ImportProgressDisplay } from './Import/ImportProgressDisplay';
import { ImportMappingStep } from './Import/ImportMappingStep';
import { detectHeaders } from './Import/ImportHeaderDetector';
import { UploadZone } from './Import/UploadZone';

const ExcelEditorModal = lazy(() => import('./Import/ExcelEditorModal'));

interface ImportUsersProps {
  onImportComplete?: () => void;
}

const ImportUsers: React.FC<ImportUsersProps> = ({ onImportComplete }) => {
  const { data: session } = useSession();
  const serviceId = (session?.user as any)?.serviceId || 'default';

  const {
    isLoading, results, error, importProgress, successMessage,
    setResults, setError, setIsLoading, setSuccessMessage, finalizeImport
  } = useUserImport(serviceId, onImportComplete);

  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<Record<string, any>>({});
  const [showMapping, setShowMapping] = useState<boolean>(false);
  const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
  const [showExcelEditor, setShowExcelEditor] = useState<boolean>(false);
  const [excelRawData, setExcelRawData] = useState<any[][]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); setResults(null); setSuccessMessage(''); setIsLoading(true);
    const files = event.target.files ? Array.from(event.target.files) : [];
    const valid = files.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'));

    if (valid.length === 0) {
      setError("Aucun fichier valide sélectionné."); setIsLoading(false); return;
    }

    setFilesToProcess(valid);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const raw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as any[][];
        if (raw.length === 0) { setError(`Vide.`); setIsLoading(false); return; }

        const { headers: h, sampleRow: s } = detectHeaders(raw);
        setHeaders(h); setSampleData(s); setExcelRawData(raw.slice(1));
        setCurrentFileName(valid[0].name); setShowMapping(true); setIsLoading(false);
      } catch (err) { setError(`Erreur.`); setIsLoading(false); }
    };
    reader.readAsArrayBuffer(valid[0]);
  };

  const handleExcelEditorConfirm = useCallback((editedData: any[][], editedHeaders: string[]) => {
    setExcelRawData(editedData); setHeaders(editedHeaders);
    if (editedData.length > 0) {
      const s: Record<string, any> = {};
      editedHeaders.forEach((h, idx) => { s[h] = editedData[0]?.[idx] || ''; });
      setSampleData(s);
    }
    setShowExcelEditor(false);
  }, []);

  return (
    <div className="import-container p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Importation d&apos;utilisateurs</h2>
      {successMessage && <div className="bg-green-100 p-4 rounded-lg mb-6">{successMessage}</div>}
      {error && <div className="bg-red-100 p-4 rounded-lg mb-6 text-red-700">{error}</div>}
      <ImportProgressDisplay progress={importProgress} />
      {isLoading && !importProgress && <div className="text-center py-8">Traitement...</div>}

      {!showMapping ? (
        <UploadZone onFileUpload={handleFileUpload} isLoading={isLoading} filesToProcess={filesToProcess} onClearFiles={() => setFilesToProcess([])} />
      ) : (
        <div>
          <button onClick={() => setShowExcelEditor(true)} className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg">Éditer le fichier ✨</button>
          <ImportMappingStep headers={headers} sampleData={sampleData} onConfirm={(m) => { setShowMapping(false); finalizeImport(filesToProcess, m); }} onCancel={() => setShowMapping(false)} />
        </div>
      )}

      {results && !showMapping && <ImportResultsDisplay results={results} isLoading={isLoading} />}
      {showExcelEditor && (
        <Suspense fallback={<div>Chargement...</div>}>
          <ExcelEditorModal isOpen={showExcelEditor} onClose={() => setShowExcelEditor(false)} data={excelRawData} headers={headers} fileName={currentFileName} onConfirm={handleExcelEditorConfirm} />
        </Suspense>
      )}
    </div>
  );
};

export default ImportUsers;

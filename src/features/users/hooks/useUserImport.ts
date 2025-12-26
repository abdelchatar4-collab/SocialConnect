/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Import Hook
*/

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { mapExcelToUserStructure } from '@/utils/importHelpers';
import { detectHeaders } from '@/features/users/components/Import/ImportHeaderDetector';
import { ImportProgress, ImportResults } from '@/features/users/components/Import/ImportTypes';

export const useUserImport = (serviceId: string, onImportComplete?: () => void) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<ImportResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

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

    const finalizeImport = async (filesToProcess: File[], customMapping: Record<string, string>) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

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

    return {
        isLoading,
        results,
        error,
        importProgress,
        successMessage,
        setResults,
        setError,
        setIsLoading,
        setImportProgress,
        setSuccessMessage,
        finalizeImport
    };
};

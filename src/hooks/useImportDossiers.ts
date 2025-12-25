/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Hook for importing dossiers from Excel/CSV
*/

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { mapExcelToUserStructure, parseCellValue } from '@/utils/importHelpers';

export function useImportDossiers(onSuccess?: () => void) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
            setIsError(false);
        } else setFile(null);
    };

    const handleImport = async (selectedYear: number) => {
        if (!file) { setMessage("Sélectionnez un fichier."); setIsError(true); return; }
        setLoading(true); setMessage(null); setIsError(false);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

                if (!raw.length) throw new Error("Fichier vide");

                const headerIdx = raw.findIndex(r => r?.some(c => c !== null && String(c).trim() !== ''));
                if (headerIdx === -1) throw new Error("Pas de données");

                const headers = raw[headerIdx];
                const dataRows = raw.slice(headerIdx + 1);
                const users = dataRows.map((row, i) => {
                    const obj: any = {};
                    headers.forEach((h, j) => {
                        const hs = String(h || '').trim();
                        if (hs) {
                            const addr = XLSX.utils.encode_cell({ r: headerIdx + 1 + i, c: j });
                            obj[hs] = parseCellValue({ v: row[j], t: ws[addr]?.t }, hs);
                        }
                    });
                    return mapExcelToUserStructure(obj, headerIdx + 1 + i, process.env.NODE_ENV);
                }).filter(Boolean);

                if (!users.length) throw new Error("Aucun usager valide");

                const res = await fetch('/api/user/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-admin-auth': 'admin123' },
                    body: JSON.stringify({ users, annee: selectedYear })
                });

                const result = await res.json();
                if (res.ok) {
                    setMessage(`Succès : ${result.importedCount} importés`); setIsError(false);
                    if (onSuccess) onSuccess();
                } else {
                    setMessage(`Erreur : ${result.error || res.statusText}`); setIsError(true);
                }
            } catch (err: any) {
                setMessage(err.message || "Erreur lors du traitement"); setIsError(true);
            } finally { setLoading(false); }
        };
        reader.readAsArrayBuffer(file);
    };

    return { file, loading, message, isError, handleFileChange, handleImport, setFile, setMessage };
}

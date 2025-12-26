import React, { useEffect, useState, useCallback, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { XMarkIcon, NoSymbolIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import * as XLSX from 'xlsx';

// Lazy load Excel Editor to reduce bundle size
const ExcelEditorModal = dynamic(
    () => import('../../features/users/components/Import/ExcelEditorModal'),
    { ssr: false }
);

interface PreviewOverlayProps {
    url: string;
    onClose: () => void;
    fileName?: string;
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
    url,
    onClose,
    fileName
}) => {
    const [content, setContent] = useState<React.ReactNode | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editorData, setEditorData] = useState<any[][]>([]);
    const [editorHeaders, setEditorHeaders] = useState<string[]>([]);

    const isExcel = fileName?.toLowerCase().endsWith('.xlsx') || fileName?.toLowerCase().endsWith('.xls') || url.toLowerCase().endsWith('.xlsx') || url.toLowerCase().endsWith('.xls');

    const loadExcelData = useCallback(() => {
        if (isExcel) {
            setLoading(true);
            fetch(url)
                // Cache busting to ensure we get the latest version after save
                .then(res => res.url.includes('?') ? res.arrayBuffer() : fetch(`${url}?t=${Date.now()}`).then(r => r.arrayBuffer()))
                .catch(() => fetch(url).then(r => r.arrayBuffer())) // Fallback
                .then(ab => {
                    const wb = XLSX.read(ab, { type: 'array' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                    if (!data || data.length === 0) {
                        setContent(<div className="p-8 text-center text-gray-500">Fichier Excel vide</div>);
                        setEditorData([]);
                        setEditorHeaders([]);
                        return;
                    }

                    // Prepare data for editor
                    const headers = data[0].map((h: any) => h?.toString() || '');
                    setEditorHeaders(headers);
                    setEditorData(data.slice(1));

                    setContent(
                        <div className="overflow-auto max-h-full p-4">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {data[0].map((header: any, i: number) => (
                                            <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                                {header?.toString() || `Col ${i + 1}`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.slice(1).map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            {row.map((cell: any, j: number) => (
                                                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 last:border-r-0">
                                                    {cell?.toString() || ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })
                .catch(err => {
                    console.error("Error loading Excel:", err);
                    setError("Impossible de charger l'aperçu Excel.");
                })
                .finally(() => setLoading(false));
        }
    }, [url, isExcel]);

    useEffect(() => {
        loadExcelData();
    }, [loadExcelData]);

    const handleSave = async (editedData: any[][], headers: string[]) => {
        setLoading(true);
        setIsEditing(false); // Close editor immediately
        try {
            // Reconstruct full data array (headers + rows)
            const fullData = [headers, ...editedData];

            // Create workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(fullData);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // Write to buffer
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            // Upload to server
            const formData = new FormData();
            // Use original filename or fallback
            const fname = fileName || 'document.xlsx';
            formData.append('file', blob, fname);

            const res = await fetch('/api/rapports/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

            // Reload preview
            loadExcelData();

        } catch (err) {
            console.error("Save error:", err);
            setError("Erreur lors de la sauvegarde du fichier.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 md:p-8">
                <div className="relative w-full h-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                    {/* Top bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <NoSymbolIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">Aperçu du document</h3>
                                {fileName && <p className="text-xs text-slate-500 font-medium">{fileName}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isExcel && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                    Modifier
                                </button>
                            )}
                            <a
                                href={url}
                                download
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                                title="Télécharger"
                            >
                                <ArrowDownTrayIcon className="w-6 h-6" />
                            </a>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                            >
                                <XMarkIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Preview Frame */}
                    <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-500 p-8 text-center">
                                <p className="font-bold mb-2">Erreur</p>
                                <p>{error}</p>
                                <a href={url} download className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Télécharger le fichier</a>
                            </div>
                        ) : isExcel ? (
                            content
                        ) : (
                            <iframe
                                src={url}
                                className="w-full h-full border-none"
                                title="Preview"
                            />
                        )}
                    </div>

                    {/* Bottom bar */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            Fermer l'aperçu
                        </button>
                    </div>
                </div>
            </div>

            {/* Excel Editor Modal */}
            {isEditing && (
                <ExcelEditorModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    data={editorData}
                    headers={editorHeaders}
                    fileName={fileName || 'Document'}
                    onConfirm={handleSave}
                    mode="edit"
                />
            )}
        </Fragment>
    );
};

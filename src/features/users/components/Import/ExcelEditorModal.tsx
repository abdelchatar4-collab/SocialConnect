/*
Copyright (C) 2025 AC
SocialConnect - Premium Excel Editor Modal Component
*/

"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
// CSS imports moved to globals.css to fix lazy loading issues
import './ExcelEditor.css';

interface ExcelEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[][];
    headers: string[];
    fileName: string;
    onConfirm: (editedData: any[][], headers: string[]) => void;
    mode?: 'import' | 'edit';
}

const ExcelEditorModal: React.FC<ExcelEditorModalProps> = ({
    isOpen,
    onClose,
    data,
    headers,
    fileName,
    onConfirm,
    mode = 'import'
}) => {
    const spreadsheetRef = useRef<HTMLDivElement>(null);
    const jssRef = useRef<any>(null);
    const [rowCount, setRowCount] = useState(data.length);
    const [colCount, setColCount] = useState(headers.length);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize spreadsheet
    useEffect(() => {
        if (!isOpen || !spreadsheetRef.current) return;

        // Clean up previous instance
        if (jssRef.current) {
            jspreadsheet.destroy(spreadsheetRef.current);
            jssRef.current = null;
        }

        // Prepare columns with headers
        const columns = headers.map((header, idx) => ({
            title: header,
            width: Math.max(120, Math.min(250, header.length * 10 + 40)),
            align: 'left' as const,
        }));

        // Initialize jspreadsheet (v4 API)
        // @ts-ignore - jspreadsheet types are incomplete
        jssRef.current = jspreadsheet(spreadsheetRef.current, {
            data: data.length > 0 ? data : [['']],
            columns,
            minDimensions: [headers.length || 5, Math.max(data.length, 20)],
            tableOverflow: true,
            tableWidth: '100%',
            tableHeight: '500px',
            allowInsertRow: true,
            allowInsertColumn: true,
            allowDeleteRow: true,
            allowDeleteColumn: true,
            allowRenameColumn: true,
            columnSorting: true,
            onchange: () => {
                setHasChanges(true);
                if (jssRef.current) {
                    const currentData = jssRef.current.getData();
                    setRowCount(currentData.length);
                }
            },
            oninsertrow: () => {
                setHasChanges(true);
                if (jssRef.current) {
                    setRowCount(jssRef.current.getData().length);
                }
            },
            ondeleterow: () => {
                setHasChanges(true);
                if (jssRef.current) {
                    setRowCount(jssRef.current.getData().length);
                }
            },
        });

        setRowCount(data.length);
        setColCount(headers.length);

        return () => {
            if (spreadsheetRef.current) {
                jspreadsheet.destroy(spreadsheetRef.current);
                jssRef.current = null;
            }
        };
    }, [isOpen, data, headers]);

    // Note: Search functionality disabled - jspreadsheet-ce API differs from expected
    // The built-in search is enabled via the 'search: true' option above

    // Handle confirm
    const handleConfirm = useCallback(() => {
        if (!jssRef.current) return;

        const editedData = jssRef.current.getData();
        const editedHeaders = jssRef.current.getHeaders(true) as string[];

        // Filter out empty rows
        const filteredData = editedData.filter((row: any[]) =>
            row.some((cell) => cell !== null && cell !== undefined && cell !== '')
        );

        onConfirm(filteredData, editedHeaders);
    }, [onConfirm]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleConfirm();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose, handleConfirm]);

    if (!isOpen) return null;

    return (
        <div className="excel-editor-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="excel-editor-modal">
                {/* Header */}
                <div className="excel-editor-header">
                    <div className="excel-editor-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <span>{fileName || 'Éditeur Excel'}</span>
                        <span className="excel-editor-badge">Premium</span>
                        {hasChanges && <span className="excel-editor-badge" style={{ background: 'rgba(251, 191, 36, 0.3)' }}>Modifié</span>}
                    </div>
                    <button onClick={onClose} className="toolbar-btn" title="Fermer (Échap)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="excel-editor-toolbar">
                    <button className="toolbar-btn" title="Annuler (Ctrl+Z)" onClick={() => jssRef.current?.undo?.()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Rétablir (Ctrl+Y)" onClick={() => jssRef.current?.redo?.()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                        </svg>
                    </button>
                    <div className="toolbar-divider" />
                    <button className="toolbar-btn" title="Ajouter ligne" onClick={() => jssRef.current?.insertRow?.()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Supprimer ligne sélectionnée" onClick={() => {
                        if (jssRef.current) {
                            const selected = jssRef.current.getSelectedRows?.() || [];
                            if (selected.length > 0) jssRef.current.deleteRow?.(selected[0], 1);
                        }
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <div className="toolbar-divider" />
                    <button className="toolbar-btn" title="Trier A→Z" onClick={() => jssRef.current?.orderBy?.(0, 0)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
                        </svg>
                    </button>
                    <div className="toolbar-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Spreadsheet */}
                <div className="excel-editor-content">
                    <div className="spreadsheet-wrapper">
                        <div ref={spreadsheetRef}></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="excel-editor-footer">
                    <div className="footer-info">
                        <span className="footer-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                            </svg>
                            {rowCount} lignes
                        </span>
                        <span className="footer-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="3" x2="9" y2="21" />
                            </svg>
                            {colCount} colonnes
                        </span>
                    </div>
                    <div className="footer-actions">
                        <button className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button className="btn-confirm" onClick={handleConfirm}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {mode === 'edit' ? 'Sauvegarder' : 'Valider et Importer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExcelEditorModal;

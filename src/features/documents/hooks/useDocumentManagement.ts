/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useCallback } from 'react';

export interface DocumentInfo {
    name: string;
    size?: number;
    lastModified?: string;
    type: 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';
    category?: string;
}

export type ViewMode = 'grid' | 'list';
export type FilterType = 'all' | 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';

export const useDocumentManagement = () => {
    const [reports, setReports] = useState<string[]>([]);
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // États de recherche et filtrage
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Helpers (internal to hook to maintain consistency)
    const getDocumentType = useCallback((filename: string): DocumentInfo['type'] => {
        const ext = filename.toLowerCase().split('.').pop();
        switch (ext) {
            case 'pdf': return 'pdf';
            case 'xlsx': case 'xls': case 'csv': return 'excel';
            case 'docx': case 'doc': case 'rtf': return 'word';
            case 'png': case 'jpg': case 'jpeg': case 'gif': case 'bmp': case 'svg': return 'image';
            case 'zip': case 'rar': case '7z': case 'tar': return 'archive';
            default: return 'other';
        }
    }, []);

    const getDocumentCategory = useCallback((filename: string): string => {
        const lowerName = filename.toLowerCase();
        if (lowerName.includes('statistique') || lowerName.includes('rapport') || lowerName.includes('analyse')) return 'Rapports Statistiques';
        if (lowerName.includes('liste') || lowerName.includes('usager') || lowerName.includes('user')) return 'Listes Usagers';
        if (lowerName.includes('procedure') || lowerName.includes('guide') || lowerName.includes('aide')) return 'Guides & Procédures';
        if (lowerName.includes('export') || lowerName.includes('backup') || lowerName.includes('sauvegarde')) return 'Exports & Sauvegardes';
        if (lowerName.includes('template') || lowerName.includes('modele') || lowerName.includes('formulaire')) return 'Modèles & Formulaires';
        return 'Documents Divers';
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            const response = await fetch('/api/rapports');
            if (!response.ok) throw new Error(`Error fetching reports: ${response.statusText}`);
            const data = await response.json();

            if (Array.isArray(data) && typeof data[0] === 'string') {
                const filenames = data;
                setReports(filenames);
                setDocuments(filenames.map((name: string) => ({
                    name,
                    type: getDocumentType(name),
                    category: getDocumentCategory(name),
                })));
            } else {
                const filenames = data.map((file: any) => file.name);
                setReports(filenames);
                setDocuments(data.map((file: any) => ({
                    name: file.name,
                    size: file.size,
                    lastModified: file.lastModified,
                    type: getDocumentType(file.name),
                    category: getDocumentCategory(file.name),
                })));
            }
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            setMessage(`Erreur lors du chargement des documents : ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [getDocumentType, getDocumentCategory]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDeleteReport = async (filename: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${filename}" ?`)) return;

        setUploading(true);
        setMessage(null);
        try {
            const response = await fetch('/api/rapports/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la suppression.');
            }
            setMessage(`Rapport "${filename}" supprimé avec succès.`);
            await fetchReports();
        } catch (error: any) {
            setMessage(`Erreur lors de la suppression : ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        setMessage(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/rapports/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'upload.');
            }
            const result = await response.json();
            setMessage(`Fichier "${result.filename}" uploadé avec succès !`);
            await fetchReports();
            return true;
        } catch (error: any) {
            setMessage(`Erreur lors de l'upload : ${error.message}`);
            return false;
        } finally {
            setUploading(false);
        }
    };

    // Filtrage
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || doc.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
        const category = doc.category || 'Autres';
        if (!acc[category]) acc[category] = [];
        acc[category].push(doc);
        return acc;
    }, {} as Record<string, DocumentInfo[]>);

    const stats = {
        total: documents.length,
        pdf: documents.filter(d => d.type === 'pdf').length,
        excel: documents.filter(d => d.type === 'excel').length,
        word: documents.filter(d => d.type === 'word').length,
        image: documents.filter(d => d.type === 'image').length,
        archive: documents.filter(d => d.type === 'archive').length,
        other: documents.filter(d => d.type === 'other').length,
    };

    return {
        reports,
        documents,
        loading,
        message,
        setMessage,
        uploading,
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        viewMode,
        setViewMode,
        handleDeleteReport,
        handleUpload,
        groupedDocuments,
        stats,
        fetchReports
    };
};

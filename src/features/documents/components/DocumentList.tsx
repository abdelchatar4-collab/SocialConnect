/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import {
    DocumentTextIcon,
    TableCellsIcon,
    PhotoIcon,
    ArchiveBoxIcon,
    DocumentArrowDownIcon,
    TagIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    FolderOpenIcon
} from '@heroicons/react/24/outline';
import { DocumentInfo } from '../hooks/useDocumentManagement';

interface DocumentListProps {
    groupedDocuments: Record<string, DocumentInfo[]>;
    viewMode: 'grid' | 'list';
    onPreview: (doc: DocumentInfo) => void;
    onDelete: (filename: string) => void;
    searchTerm: string;
    filterType: string;
    onResetFilters: () => void;
    uploading: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    groupedDocuments,
    viewMode,
    onPreview,
    onDelete,
    searchTerm,
    filterType,
    onResetFilters,
    uploading
}) => {
    const getDocumentIcon = (type: DocumentInfo['type']) => {
        switch (type) {
            case 'pdf': return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
            case 'excel': return <TableCellsIcon className="h-8 w-8 text-green-500" />;
            case 'word': return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
            case 'image': return <PhotoIcon className="h-8 w-8 text-purple-500" />;
            case 'archive': return <ArchiveBoxIcon className="h-8 w-8 text-yellow-500" />;
            default: return <DocumentArrowDownIcon className="h-8 w-8 text-gray-500" />;
        }
    };

    const getTypeBadgeColor = (type: DocumentInfo['type']) => {
        switch (type) {
            case 'pdf': return 'bg-red-100 text-red-800';
            case 'excel': return 'bg-green-100 text-green-800';
            case 'word': return 'bg-blue-100 text-blue-800';
            case 'image': return 'bg-purple-100 text-purple-800';
            case 'archive': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Taille inconnue';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Date inconnue';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (Object.keys(groupedDocuments).length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/20">
                <FolderOpenIcon className="mx-auto h-24 w-24 text-gray-300 mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                <p className="text-gray-500 mb-6 font-light">
                    {searchTerm || filterType !== 'all'
                        ? 'Aucun document ne correspond à vos critères de recherche.'
                        : 'La bibliothèque est vide. Commencez par ajouter votre premier document.'
                    }
                </p>
                {(searchTerm || filterType !== 'all') && (
                    <button
                        onClick={onResetFilters}
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Réinitialiser les filtres
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {(Object.entries(groupedDocuments) as [string, DocumentInfo[]][]).map(([category, docs]) => (
                <div key={category} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <TagIcon className="h-5 w-5 mr-2 text-blue-500" />
                                {category}
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                                {docs.length} document{docs.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {docs.map((doc, idx) => (
                                <div key={idx} className="group bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 p-4">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            {getDocumentIcon(doc.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors cursor-pointer"
                                                onClick={() => window.open(`/api/rapports/${encodeURIComponent(doc.name)}`, '_blank')}>
                                                {doc.name}
                                            </h4>
                                            <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getTypeBadgeColor(doc.type)}`}>
                                                {doc.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-gray-500 space-y-1 mb-4 border-t border-gray-50 pt-3">
                                        <div className="flex justify-between">
                                            <span>Poids :</span>
                                            <span className="font-semibold text-gray-700">{formatFileSize(doc.size)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Dernière modif :</span>
                                            <span className="font-semibold text-gray-700">{formatDate(doc.lastModified)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                        <button onClick={() => onPreview(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Aperçu">
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                        <a href={`/api/rapports/${encodeURIComponent(doc.name)}`} download className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Télécharger">
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                        </a>
                                        <button onClick={() => onDelete(doc.name)} disabled={uploading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Supprimer">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {docs.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-blue-50/30 transition-colors group">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="bg-gray-50 p-2 rounded group-hover:bg-white transition-colors">
                                            {React.cloneElement(getDocumentIcon(doc.type) as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6' })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                                                onClick={() => window.open(`/api/rapports/${encodeURIComponent(doc.name)}`, '_blank')}>
                                                {doc.name}
                                            </h4>
                                            <div className="flex gap-4 mt-1">
                                                <span className={`text-[10px] font-bold uppercase ${getTypeBadgeColor(doc.type).split(' ')[1]}`}>
                                                    {doc.type}
                                                </span>
                                                <span className="text-xs text-gray-400 font-light">{formatFileSize(doc.size)}</span>
                                                <span className="text-xs text-gray-400 font-light">Modifié {formatDate(doc.lastModified)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onPreview(doc)} className="p-2 text-blue-600 hover:bg-white rounded-lg transition-colors"><EyeIcon className="h-4 w-4" /></button>
                                        <a href={`/api/rapports/${encodeURIComponent(doc.name)}`} download className="p-2 text-green-600 hover:bg-white rounded-lg transition-colors"><ArrowDownTrayIcon className="h-4 w-4" /></a>
                                        <button onClick={() => onDelete(doc.name)} disabled={uploading} className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

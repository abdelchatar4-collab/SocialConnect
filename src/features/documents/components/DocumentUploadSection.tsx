/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface DocumentUploadSectionProps {
    onUpload: (file: File) => Promise<boolean>;
    uploading: boolean;
    setMessage: (msg: string | null) => void;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
    onUpload,
    uploading,
    setMessage
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const getMaxSizeForFile = (filename: string): number => {
        const ext = filename.toLowerCase().split('.').pop();
        switch (ext) {
            case 'pdf': return 50 * 1024 * 1024;
            case 'xlsx': case 'xls': return 25 * 1024 * 1024;
            case 'zip': case 'rar': case '7z': return 100 * 1024 * 1024;
            case 'mp4': case 'avi': case 'mov': return 200 * 1024 * 1024;
            default: return 10 * 1024 * 1024;
        }
    };

    const getMaxSizeText = (filename: string): string => {
        const ext = filename.toLowerCase().split('.').pop();
        switch (ext) {
            case 'pdf': return '50MB';
            case 'xlsx': case 'xls': return '25MB';
            case 'zip': case 'rar': case '7z': return '100MB';
            case 'mp4': case 'avi': case 'mov': return '200MB';
            default: return '10MB';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const maxSize = getMaxSizeForFile(file.name);
            if (file.size > maxSize) {
                setMessage(`Erreur : Le fichier "${file.name}" est trop volumineux. Taille maximale : ${getMaxSizeText(file.name)}.`);
                setSelectedFile(null);
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            const success = await onUpload(selectedFile);
            if (success) {
                setSelectedFile(null);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const maxSize = getMaxSizeForFile(file.name);
            if (file.size > maxSize) {
                setMessage(`Erreur : Le fichier "${file.name}" est trop volumineux.`);
                return;
            }
            setSelectedFile(file);
            setMessage(null);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentArrowDownIcon className="h-6 w-6 mr-2 text-blue-500" />
                Ajouter un nouveau document
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload-hidden')?.click()}
                >
                    <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload-hidden"
                    />
                    <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                        Glissez votre fichier ici ou cliquez pour parcourir
                    </p>
                    <div className="mb-4">
                        <span className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Sélectionner un fichier
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">Tous types de fichiers acceptés</p>
                    <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-[10px] uppercase font-bold tracking-wider">
                            <div className="bg-gray-100 p-1 rounded">PDF : 50MB</div>
                            <div className="bg-gray-100 p-1 rounded">Excel : 25MB</div>
                            <div className="bg-gray-100 p-1 rounded">Archives : 100MB</div>
                            <div className="bg-gray-100 p-1 rounded">Vidéos : 200MB</div>
                            <div className="bg-gray-100 p-1 rounded">Autres : 10MB</div>
                        </div>
                    </div>
                    {selectedFile && (
                        <div className={`mt-4 p-3 rounded-lg border bg-green-50 border-green-200`}>
                            <p className="text-sm font-medium text-green-900 truncate">
                                Sélectionné : {selectedFile.name}
                            </p>
                            <p className="text-xs text-green-700">
                                Taille : {(selectedFile.size / 1024 / 1024).toFixed(2)} MB (Limite : {getMaxSizeText(selectedFile.name)})
                            </p>
                        </div>
                    )}
                </div>

                {selectedFile && (
                    <div className="flex justify-center pt-2">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-lg"
                        >
                            {uploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Transfert en cours...
                                </>
                            ) : (
                                <>
                                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                    Uploader maintenant
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

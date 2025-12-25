/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Import Results Component
Extracted from ImportUsers.tsx
*/

import React from 'react';

interface ImportResultsProps {
    results: {
        totalRows: number;
        processedUsers: number;
        errors: number;
    } | null;
    isLoading: boolean;
}

export const ImportResultsDisplay: React.FC<ImportResultsProps> = ({ results, isLoading }) => {
    if (!results || isLoading) return null;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Résultats de l&apos;importation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{results.totalRows}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-600">Lignes de données lues</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{results.processedUsers}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-600">Utilisateurs traités</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">{results.errors}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-600">Lignes ignorées</div>
                </div>
            </div>
        </div>
    );
};

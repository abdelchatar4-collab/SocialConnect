/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Import Progress Component
Extracted from ImportUsers.tsx
*/

import React from 'react';

interface ImportProgressProps {
    progress: {
        current: number;
        total: number;
        percentage: number;
        status: string;
    } | null;
}

export const ImportProgressDisplay: React.FC<ImportProgressProps> = ({ progress }) => {
    if (!progress) return null;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Progression</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-700">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-600">
                <span>{progress.current} sur {progress.total} lignes traitées</span>
                <span>{progress.percentage}%</span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                Statut: {progress.status}
            </p>
        </div>
    );
};

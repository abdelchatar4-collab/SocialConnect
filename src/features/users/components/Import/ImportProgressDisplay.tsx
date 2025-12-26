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
        percentage?: number;
        status: string;
        isBatch?: boolean;
        fileName?: string;
    } | null;
}

export const ImportProgressDisplay: React.FC<ImportProgressProps> = ({ progress }) => {
    if (!progress) return null;

    const percentage = progress.isBatch
        ? Math.round((progress.current / progress.total) * 100)
        : (progress as any).percentage || 0;

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Progression de l&apos;importation</h3>
                {progress.isBatch && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-wider">
                        Lot de fichiers
                    </span>
                )}
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-700">
                            {progress.isBatch ? `Fichier ${progress.current} sur ${progress.total}` : `${progress.current} sur ${progress.total} lignes`}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">({percentage}%)</span>
                    </div>
                    <p className="text-sm text-gray-500 italic flex items-center gap-2">
                        {progress.isBatch && (
                            <span className="p-1 bg-gray-100 rounded text-gray-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </span>
                        )}
                        {progress.status}
                    </p>
                </div>

                {progress.isBatch && (progress as any).fileName && (
                    <div className="text-[10px] font-mono text-blue-400 bg-blue-50/50 px-2 py-1 rounded">
                        {(progress as any).fileName}
                    </div>
                )}
            </div>
        </div>
    );
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User List Stats Cards
Extracted from UserListFilters.tsx
*/

import React from 'react';
import { Users, UserCheck, AlertCircle, Copy } from 'lucide-react';

interface StatsCardsSectionProps {
    totalUsersCount: number;
    myDossiersCount: number;
    showImportantInfoOnly: boolean;
    onShowImportantInfoOnlyChange: (show: boolean) => void;
    importantInfoCount: number;
    showDuplicates: boolean;
    onShowDuplicatesChange: (show: boolean) => void;
    duplicatesCount: number;
    includeDateInDuplicates: boolean;
    onIncludeDateInDuplicatesChange: (include: boolean) => void;
}

export const StatsCardsSection: React.FC<StatsCardsSectionProps> = ({
    totalUsersCount,
    myDossiersCount,
    showImportantInfoOnly,
    onShowImportantInfoOnlyChange,
    importantInfoCount,
    showDuplicates,
    onShowDuplicatesChange,
    duplicatesCount,
    includeDateInDuplicates,
    onIncludeDateInDuplicatesChange
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:bg-white/80 group">
                <div className="bg-blue-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Usagers</p>
                    <p className="text-2xl font-bold text-slate-900">{totalUsersCount}</p>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:bg-white/80 group">
                <div className="bg-teal-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mes Dossiers</p>
                    <p className="text-2xl font-bold text-slate-900">{myDossiersCount}</p>
                </div>
            </div>

            <div
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center gap-4 group ${showImportantInfoOnly
                    ? 'bg-amber-100/80 border-amber-300 shadow-amber-100'
                    : 'bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80'
                    }`}
                onClick={() => onShowImportantInfoOnlyChange(!showImportantInfoOnly)}
            >
                <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${showImportantInfoOnly ? 'bg-amber-500/20' : 'bg-amber-500/10'}`}>
                    <AlertCircle className={`w-6 h-6 ${showImportantInfoOnly ? 'text-amber-700' : 'text-amber-600'}`} />
                </div>
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${showImportantInfoOnly ? 'text-amber-700' : 'text-slate-500'}`}>Infos Importantes</p>
                    <p className={`text-2xl font-bold ${showImportantInfoOnly ? 'text-amber-700' : 'text-slate-900'}`}>{importantInfoCount}</p>
                </div>
            </div>

            <div className="relative group">
                <div
                    className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center gap-4 ${showDuplicates
                        ? 'bg-rose-100/80 border-rose-300 shadow-rose-100'
                        : 'bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80'
                        }`}
                    onClick={() => onShowDuplicatesChange(!showDuplicates)}
                >
                    <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${showDuplicates ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
                        <Copy className={`w-6 h-6 ${showDuplicates ? 'text-rose-700' : 'text-rose-600'}`} />
                    </div>
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${showDuplicates ? 'text-rose-700' : 'text-slate-500'}`}>Doublons</p>
                        <p className={`text-2xl font-bold ${showDuplicates ? 'text-rose-700' : 'text-slate-900'}`}>{duplicatesCount}</p>
                    </div>
                </div>

                <div className="absolute -bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer bg-white/80 px-2 py-1 rounded shadow-sm border border-slate-200">
                        <input
                            type="checkbox"
                            checked={!includeDateInDuplicates}
                            onChange={(e) => onIncludeDateInDuplicatesChange(!e.target.checked)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3 w-3"
                        />
                        <span>Ignorer date naiss.</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

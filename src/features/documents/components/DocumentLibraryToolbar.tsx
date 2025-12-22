/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import {
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ListBulletIcon
} from '@heroicons/react/24/outline';

interface DocumentLibraryToolbarProps {
    stats: {
        total: number;
        pdf: number;
        excel: number;
        word: number;
        image: number;
        archive: number;
        other: number;
    };
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    filterType: string;
    setFilterType: (val: any) => void;
    viewMode: 'grid' | 'list';
    setViewMode: (val: 'grid' | 'list') => void;
}

export const DocumentLibraryToolbar: React.FC<DocumentLibraryToolbarProps> = ({
    stats,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    viewMode,
    setViewMode
}) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Statistiques des documents */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[
                        { label: 'Total', count: stats.total, color: 'text-gray-600', bgColor: 'bg-gray-100' },
                        { label: 'PDF', count: stats.pdf, color: 'text-red-600', bgColor: 'bg-red-100' },
                        { label: 'Excel', count: stats.excel, color: 'text-green-600', bgColor: 'bg-green-100' },
                        { label: 'Word', count: stats.word, color: 'text-blue-600', bgColor: 'bg-blue-100' },
                        { label: 'Images', count: stats.image, color: 'text-purple-600', bgColor: 'bg-purple-100' },
                        { label: 'Archives', count: stats.archive, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
                    ].map((stat, index) => (
                        <div key={index} className={`${stat.bgColor} rounded-lg p-3 text-center`}>
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                            <p className="text-xs text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Contrôles de vue et recherche */}
                <div className="flex items-center space-x-3">
                    {/* Barre de recherche */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un document..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-64"
                        />
                    </div>

                    {/* Filtre par type */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">Tous les types</option>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="word">Word</option>
                        <option value="image">Images</option>
                        <option value="archive">Archives</option>
                        <option value="other">Autres</option>
                    </select>

                    {/* Mode d'affichage */}
                    <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center px-4 py-2 text-sm font-medium transition-all ${viewMode === 'grid'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <Squares2X2Icon className="h-4 w-4 mr-2" />
                            Grille
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center px-4 py-2 text-sm font-medium transition-all ${viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <ListBulletIcon className="h-4 w-4 mr-2" />
                            Liste
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

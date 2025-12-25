/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Search Results List
*/

import React from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { Button, Badge } from '@/components/ui';

interface SearchResultsProps {
    results: User[];
    currentYear: number;
    onSelect: (user: User) => void;
    onCreateNew: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, currentYear, onSelect, onCreateNew }) => {
    if (results.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-600 mb-4">Aucun dossier trouvé dans les archives.</p>
                <Button onClick={onCreateNew} variant="outline">Créer un nouveau dossier vide</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Résultats ({results.length})</h3>
            <div className="grid gap-4">
                {results.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">{user.prenom?.[0]}{user.nom?.[0]}</div>
                            <div>
                                <h4 className="font-bold text-slate-800">{user.prenom} {user.nom}</h4>
                                <div className="flex items-center space-x-2 text-sm text-slate-500">
                                    <span>Né(e) le {user.dateNaissance ? new Date(user.dateNaissance).toLocaleDateString() : 'N/A'}</span>
                                    <span>•</span>
                                    <Badge variant="secondary" size="sm">Dossier {(user as any).annee || 2025}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => onSelect(user)} className="bg-green-600 hover:bg-green-700 text-white"><UserPlusIcon className="h-4 w-4 mr-2" />Réinscrire en {currentYear}</Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

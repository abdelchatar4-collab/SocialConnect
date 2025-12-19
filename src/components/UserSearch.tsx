/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { Button, Badge, Loading } from '@/components/ui';

interface UserSearchProps {
    onSelectUser: (user: User) => void;
    onCreateNew: () => void;
    currentYear: number;
}

export const UserSearch = ({ onSelectUser, onCreateNew, currentYear }: UserSearchProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            // Rechercher dans l'année précédente (ou toutes les années sauf la courante)
            // Pour l'instant, on récupère tout et on filtre côté client pour la démo
            // Idéalement, l'API devrait supporter une recherche textuelle + filtre année
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Erreur lors de la recherche');

            const allUsers: User[] = await response.json();

            // Filtrer :
            // 1. Correspondance nom/prénom
            // 2. Année != currentYear (on cherche dans les archives)
            const filtered = allUsers.filter(user => {
                const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
                const search = searchTerm.toLowerCase();
                // @ts-ignore - annee n'est pas encore dans le type User frontend mais est dans la DB
                const userYear = user.annee || 2025;

                return fullName.includes(search) && userYear < currentYear;
            });

            setResults(filtered);
            setHasSearched(true);
        } catch (error) {
            console.error("Erreur recherche:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Nouvelle Inscription {currentYear}</h2>
                <p className="text-slate-500 mt-2">
                    Recherchez d&apos;abord si l&apos;usager possède déjà un dossier dans les archives.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative mb-8">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher dans les archives (Nom, Prénom)..."
                        className="w-full pl-[60px] pr-4 py-4 text-lg border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none"
                        autoFocus
                    />
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 pointer-events-none" />
                </div>
                <div className="mt-4 flex justify-center">
                    <Button type="submit" disabled={loading || !searchTerm.trim()} size="lg">
                        {loading ? <Loading text="Recherche..." /> : "Rechercher"}
                    </Button>
                </div>
            </form>

            {hasSearched && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Résultats ({results.length})
                    </h3>

                    {results.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-600 mb-4">Aucun dossier trouvé dans les archives.</p>
                            <Button onClick={onCreateNew} variant="outline">
                                Créer un nouveau dossier vide
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {results.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                            {user.prenom?.[0]}{user.nom?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{user.prenom} {user.nom}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                                                <span>Né(e) le {user.dateNaissance ? new Date(user.dateNaissance).toLocaleDateString() : 'N/A'}</span>
                                                <span>•</span>
                                                <Badge variant="secondary" size="sm">Dossier {(user as any).annee || 2025}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onSelectUser(user)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <UserPlusIcon className="h-4 w-4 mr-2" />
                                        Réinscrire en {currentYear}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!hasSearched && (
                <div className="text-center mt-8 pt-8 border-t border-slate-100">
                    <button
                        onClick={onCreateNew}
                        className="text-sm text-slate-500 hover:text-primary-600 underline decoration-dotted underline-offset-4"
                    >
                        Usager inconnu ? Créer un nouveau dossier directement
                    </button>
                </div>
            )}
        </div>
    );
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { Button, Badge, Loading } from '@/components/ui';

// Options d'import pour la réinscription
export interface ImportOptions {
    contact: boolean;      // telephone, email
    adresse: boolean;      // adresse complète
    nationalite: boolean;  // nationalite, langue, statutSejour
    situationPro: boolean; // situationProfessionnelle, revenus
    gestion: boolean;      // gestionnaire, antenne
    logement: boolean;     // logementDetails
    notes: boolean;        // remarques, notesGenerales, informationImportante
}

const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
    contact: true,
    adresse: true,
    nationalite: false,
    situationPro: false,
    gestion: false,
    logement: false,
    notes: false,
};

interface UserSearchProps {
    onSelectUser: (user: User, options: ImportOptions) => void;
    onCreateNew: () => void;
    currentYear: number;
}

export const UserSearch = ({ onSelectUser, onCreateNew, currentYear }: UserSearchProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Modal state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importOptions, setImportOptions] = useState<ImportOptions>(DEFAULT_IMPORT_OPTIONS);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/users?take=5000');
            if (!response.ok) throw new Error('Erreur lors de la recherche');

            const result = await response.json();
            const allUsers: User[] = Array.isArray(result) ? result : (result.users || []);

            const filtered = allUsers.filter(user => {
                const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
                const search = searchTerm.toLowerCase();
                const userYear = (user as any).annee || (new Date().getFullYear() - 1);

                // Si c'est un dossier d'une année passée et que ça correspond au nom
                if (fullName.includes(search) && userYear < currentYear) {
                    // Vérifier si cet usager n'a pas DÉJÀ un dossier pour l'année en cours
                    const hasCurrentDossier = allUsers.some(u =>
                        u.nom === user.nom &&
                        u.prenom === user.prenom &&
                        u.dateNaissance === user.dateNaissance &&
                        (u as any).annee === currentYear
                    );

                    return !hasCurrentDossier;
                }
                return false;
            });

            setResults(filtered);
            setHasSearched(true);
        } catch (error) {
            console.error("Erreur recherche:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectForImport = (user: User) => {
        setSelectedUser(user);
        setImportOptions(DEFAULT_IMPORT_OPTIONS);
        setShowImportModal(true);
    };

    const handleConfirmImport = () => {
        if (selectedUser) {
            onSelectUser(selectedUser, importOptions);
            setShowImportModal(false);
            setSelectedUser(null);
        }
    };

    const toggleOption = (key: keyof ImportOptions) => {
        setImportOptions(prev => ({ ...prev, [key]: !prev[key] }));
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
                                        onClick={() => handleSelectForImport(user)}
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

            {/* Modal de sélection des données à importer */}
            {showImportModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                        {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{selectedUser.prenom} {selectedUser.nom}</h3>
                                        <p className="text-white/80 text-sm">Réinscription en {currentYear}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-slate-600 mb-4">
                                Sélectionnez les données à reprendre du dossier précédent :
                            </p>

                            <div className="space-y-3">
                                {/* Identité - toujours coché, non modifiable */}
                                <label className="flex items-center p-3 bg-slate-50 rounded-lg cursor-not-allowed opacity-75">
                                    <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                                    <div>
                                        <span className="font-medium text-slate-700">Identité</span>
                                        <span className="text-slate-500 text-sm ml-2">(nom, prénom, date de naissance, genre)</span>
                                    </div>
                                    <span className="ml-auto text-xs text-slate-400">Toujours inclus</span>
                                </label>

                                {/* Contact */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.contact}
                                        onChange={() => toggleOption('contact')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Contact</span>
                                        <span className="text-slate-500 text-sm ml-2">(téléphone, email)</span>
                                    </div>
                                </label>

                                {/* Adresse */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.adresse}
                                        onChange={() => toggleOption('adresse')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Adresse</span>
                                        <span className="text-slate-500 text-sm ml-2">(rue, code postal, ville)</span>
                                    </div>
                                </label>

                                {/* Nationalité & Langues */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.nationalite}
                                        onChange={() => toggleOption('nationalite')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Nationalité & Langues</span>
                                        <span className="text-slate-500 text-sm ml-2">(nationalité, langue, statut séjour)</span>
                                    </div>
                                </label>

                                {/* Situation Pro */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.situationPro}
                                        onChange={() => toggleOption('situationPro')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Situation professionnelle</span>
                                        <span className="text-slate-500 text-sm ml-2">(emploi, revenus)</span>
                                    </div>
                                </label>

                                {/* Gestion */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.gestion}
                                        onChange={() => toggleOption('gestion')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Gestion</span>
                                        <span className="text-slate-500 text-sm ml-2">(gestionnaire, antenne)</span>
                                    </div>
                                </label>

                                {/* Logement */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.logement}
                                        onChange={() => toggleOption('logement')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Logement</span>
                                        <span className="text-slate-500 text-sm ml-2">(type, statut, bailleur...)</span>
                                    </div>
                                </label>

                                {/* Notes */}
                                <label className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={importOptions.notes}
                                        onChange={() => toggleOption('notes')}
                                        className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-slate-700">Notes & Remarques</span>
                                        <span className="text-slate-500 text-sm ml-2">(remarques, notes générales, info importante)</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowImportModal(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleConfirmImport}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckIcon className="h-4 w-4 mr-2" />
                                Confirmer la réinscription
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

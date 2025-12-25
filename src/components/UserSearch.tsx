/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { Button, Loading } from '@/components/ui';
import { ImportModal, ImportOptions } from './UserSearch/ImportModal';
import { SearchResults } from './UserSearch/SearchResults';

const DEFAULT_OPTIONS: ImportOptions = { contact: true, adresse: true, nationalite: false, situationPro: false, gestion: false, logement: false, notes: false };

interface UserSearchProps { onSelectUser: (u: User, o: ImportOptions) => void; onCreateNew: () => void; currentYear: number; }

export const UserSearch = ({ onSelectUser, onCreateNew, currentYear }: UserSearchProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [importOptions, setImportOptions] = useState<ImportOptions>(DEFAULT_OPTIONS);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault(); if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/users?take=5000');
            const data = await resp.json();
            const all: User[] = Array.isArray(data) ? data : (data.users || []);
            setResults(all.filter(u => {
                const name = `${u.nom} ${u.prenom}`.toLowerCase();
                const year = (u as any).annee || (new Date().getFullYear() - 1);
                return name.includes(searchTerm.toLowerCase()) && year < currentYear && !all.some(curr => curr.nom === u.nom && curr.prenom === u.prenom && curr.dateNaissance === u.dateNaissance && (curr as any).annee === currentYear);
            }));
            setHasSearched(true);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-center mb-8"><h2 className="text-2xl font-bold text-slate-800">Nouvelle Inscription {currentYear}</h2><p className="text-slate-500 mt-2">Recherchez d&apos;abord l&apos;usager dans les archives.</p></div>
            <form onSubmit={handleSearch} className="relative mb-8">
                <div className="relative"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher (Nom, Prénom)..." className="w-full pl-[60px] pr-4 py-4 text-lg border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none" autoFocus /><MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" /></div>
                <div className="mt-4 flex justify-center"><Button type="submit" disabled={loading || !searchTerm.trim()} size="lg">{loading ? <Loading text="Recherche..." /> : "Rechercher"}</Button></div>
            </form>
            {hasSearched ? <SearchResults results={results} currentYear={currentYear} onSelect={(u) => setSelectedUser(u)} onCreateNew={onCreateNew} />
                : <div className="text-center mt-8 pt-8 border-t border-slate-100"><button onClick={onCreateNew} className="text-sm text-slate-500 hover:text-primary-600 underline">Nouveau dossier directly</button></div>}
            {selectedUser && <ImportModal user={selectedUser} currentYear={currentYear} options={importOptions} onToggle={(k) => setImportOptions(p => ({ ...p, [k]: !p[k] }))} onConfirm={() => { onSelectUser(selectedUser, importOptions); setSelectedUser(null); }} onClose={() => setSelectedUser(null)} />}
        </div>
    );
};

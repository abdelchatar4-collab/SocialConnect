/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Search Import Modal
*/

import React from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { User } from '@/types/user';

export interface ImportOptions {
    contact: boolean;
    adresse: boolean;
    nationalite: boolean;
    situationPro: boolean;
    gestion: boolean;
    logement: boolean;
    notes: boolean;
}

interface ImportModalProps {
    user: User;
    currentYear: number;
    options: ImportOptions;
    onToggle: (key: keyof ImportOptions) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ user, currentYear, options, onToggle, onConfirm, onClose }) => {
    const items = [
        { key: 'contact', label: 'Contact', desc: '(téléphone, email)' },
        { key: 'adresse', label: 'Adresse', desc: '(rue, code postal, ville)' },
        { key: 'nationalite', label: 'Nationalité & Langues', desc: '(nationalité, langue, statut séjour)' },
        { key: 'situationPro', label: 'Situation professionnelle', desc: '(emploi, revenus)' },
        { key: 'gestion', label: 'Gestion', desc: '(gestionnaire, antenne)' },
        { key: 'logement', label: 'Logement', desc: '(type, statut, bailleur...)' },
        { key: 'notes', label: 'Notes & Remarques', desc: '(remarques, notes générales, info importante)' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-up">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">{user.prenom?.[0]}{user.nom?.[0]}</div>
                            <div><h3 className="font-bold text-lg">{user.prenom} {user.nom}</h3><p className="text-white/80 text-sm">Réinscription en {currentYear}</p></div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><XMarkIcon className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 mb-4">Sélectionnez les données à reprendre du dossier précédent :</p>
                    <div className="space-y-3">
                        <label className="flex items-center p-3 bg-slate-50 rounded-lg cursor-not-allowed opacity-75"><CheckIcon className="h-5 w-5 text-green-600 mr-3" /><div><span className="font-medium text-slate-700">Identité</span><span className="text-slate-500 text-sm ml-2">(nom, prénom, date de naissance, genre)</span></div><span className="ml-auto text-xs text-slate-400">Toujours inclus</span></label>
                        {items.map(item => (
                            <label key={item.key} className="flex items-center p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors">
                                <input type="checkbox" checked={(options as any)[item.key]} onChange={() => onToggle(item.key as keyof ImportOptions)} className="h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500" /><div className="ml-3"><span className="font-medium text-slate-700">{item.label}</span><span className="text-slate-500 text-sm ml-2">{item.desc}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white"><CheckIcon className="h-4 w-4 mr-2" />Confirmer la réinscription</Button>
                </div>
            </div>
        </div>
    );
};

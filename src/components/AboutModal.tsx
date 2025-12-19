/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, ScaleIcon, BookOpenIcon, FolderIcon } from '@heroicons/react/24/outline';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const documents = [
    { name: 'Licence GNU GPL v3', url: '/LICENSE', icon: ScaleIcon, type: 'text' },
    { name: 'Présentation & Installation', url: '/README.md', icon: BookOpenIcon, type: 'markdown' },
    { name: 'Manuel Utilisateur', url: '/MANUEL_UTILISATEUR.md', icon: DocumentTextIcon, type: 'markdown' },
    { name: 'Rapports & Documents', url: '/rapports', icon: FolderIcon, type: 'folder' },
];

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-2xl p-6 overflow-hidden">
                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-gray-900">À propos de SocialConnect</Dialog.Title>
                            <p className="text-sm text-gray-500 mt-1">Version 1.0.0</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Copyright & License Info */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-2">© 2025 AC</h3>
                            <p className="text-sm text-slate-600 mb-3">
                                SocialConnect est un logiciel libre distribué sous licence <strong>GNU GPL v3</strong>.
                            </p>
                            <p className="text-xs text-slate-500 italic">
                                Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE.
                            </p>
                        </div>

                        {/* Documents List */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation & Légal</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {documents.map((doc) => (
                                    <a
                                        key={doc.name}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <doc.icon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900 group-hover:text-blue-700">{doc.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {doc.type === 'folder' ? 'Dossier' : 'Ouvrir le document'}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-400 pt-4 border-t">
                            Développé pour le secteur social.
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}

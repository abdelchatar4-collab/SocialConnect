/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Modal d'édition de prestation
*/

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditModalProps {
    prestation: any;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export const PrestationEditModal: React.FC<EditModalProps> = ({ prestation, onClose, onSave }) => {
    const [date, setDate] = useState(prestation.date.split('T')[0]);
    const [heureDebut, setHeureDebut] = useState(prestation.heureDebut);
    const [heureFin, setHeureFin] = useState(prestation.heureFin);
    const [pause, setPause] = useState(prestation.pause);
    const [motif, setMotif] = useState(prestation.motif);
    const [commentaire, setCommentaire] = useState(prestation.commentaire || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({
            id: prestation.id,
            date,
            heureDebut,
            heureFin,
            pause: parseInt(String(pause)),
            motif,
            commentaire
        });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Modifier la Prestation</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pause (min)</label>
                            <input
                                type="number"
                                min="0"
                                value={pause}
                                onChange={(e) => setPause(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                            <input
                                type="time"
                                value={heureDebut}
                                onChange={(e) => setHeureDebut(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                            <input
                                type="time"
                                value={heureFin}
                                onChange={(e) => setHeureFin(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                        <select
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                        >
                            <option value="Télétravail">Télétravail</option>
                            <option value="Présentiel">Présentiel</option>
                            <option value="Formation">Formation</option>
                            <option value="Réunion externe">Réunion externe</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                        <textarea
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl"
                        >
                            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

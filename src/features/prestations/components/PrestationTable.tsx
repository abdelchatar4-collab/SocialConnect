/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Table des prestations
*/

"use client";

import React from 'react';
import { formatDurationHuman } from '@/utils/prestationUtils';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PrestationTableProps {
    prestations: any[];
    isLoading: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onEdit: (prestation: any) => void;
    onDelete: (id: string, gestionnaireName: string) => void;
    primaryColor: string;
}

export const PrestationTable: React.FC<PrestationTableProps> = ({
    prestations,
    isLoading,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onEdit,
    onDelete,
    primaryColor
}) => {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === prestations.length && prestations.length > 0}
                                onChange={onToggleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </TableHead>
                        <TableHead>Collaborateur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Horaire</TableHead>
                        <TableHead>Pause</TableHead>
                        <TableHead>Durée Net</TableHead>
                        <TableHead>Extra / Bonis</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-gray-400">Chargement...</TableCell>
                        </TableRow>
                    ) : prestations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-gray-400">Aucune prestation trouvée.</TableCell>
                        </TableRow>
                    ) : (
                        prestations.map((p: any) => (
                            <TableRow key={p.id} className={selectedIds.has(p.id) ? 'bg-red-50' : ''}>
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(p.id)}
                                        onChange={() => onToggleSelect(p.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: p.gestionnaire?.couleurMedaillon || primaryColor }}
                                        >
                                            {p.gestionnaire?.prenom?.[0]}{p.gestionnaire?.nom?.[0]}
                                        </div>
                                        <span className="font-medium">{p.gestionnaire?.prenom} {p.gestionnaire?.nom}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(p.date).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell>{p.heureDebut} - {p.heureFin}</TableCell>
                                <TableCell>{p.pause} min</TableCell>
                                <TableCell className="font-bold">{formatDurationHuman(p.dureeNet)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {p.bonis > 0 && <Badge variant="warning">+{formatDurationHuman(p.bonis)} Bonis</Badge>}
                                        {p.isOvertime && <Badge variant="destructive">Overtime (19h+)</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{p.motif}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => onEdit(p)}
                                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            title="Modifier"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(p.id, `${p.gestionnaire?.prenom} ${p.gestionnaire?.nom}`)}
                                            className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

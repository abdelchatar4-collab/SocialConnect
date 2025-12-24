/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListRow - Individual row in the user list table
 */

import React, { memo } from 'react';
import { User, ActionSuivi, Problematique, Gestionnaire } from '@/types';
import { TableRow, TableCell, Checkbox, Badge } from '@/components/ui';
import { GestionnaireIcon } from '../shared/GestionnaireIcon';
import { getEtatBadgeVariant } from '@/features/users/utils/userUtils';
import { formatDate } from '@/utils/formatters';
import { getLastThreeActions, getActionsForUser, deduceActionType } from '@/utils/actionUtils';

interface UserListRowProps {
    user: User;
    isSelected: boolean;
    showColumns: {
        showProblematiques: boolean;
        showActions: boolean;
        showDossier: boolean;
        showPhone: boolean;
        showAdresse: boolean;
        showAntenne: boolean;
        showDateNaissance: boolean;
    };
    onSelect: (userId: string, checked: boolean) => void;
    onClick: (userId: string) => void;
    gestionnaireMap: Map<string, Gestionnaire>;
}

export const UserListRow = memo<UserListRowProps>(({
    user,
    isSelected,
    showColumns,
    onSelect,
    onClick,
    gestionnaireMap,
}) => {
    let gestionnaireObj = null;
    if (user.gestionnaire) {
        if (typeof user.gestionnaire === 'object') {
            gestionnaireObj = user.gestionnaire;
        } else {
            gestionnaireObj = gestionnaireMap.get(user.gestionnaire as string);
        }
    }

    const adresseDisplay = user.adresse && typeof user.adresse === 'object'
        ? `${user.adresse.rue || ''} ${user.adresse.numero || ''}, ${user.adresse.codePostal || ''} ${user.adresse.ville || ''}`
        : String(user.adresse || '');

    return (
        <TableRow
            className="group cursor-pointer bg-white/60 hover:bg-primary-50/50 transition-all duration-200 border-b border-slate-100/80 last:border-0"
            onClick={() => onClick(user.id)}
        >
            {/* Checkbox */}
            <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-4 pl-4 w-12">
                <Checkbox
                    checked={isSelected}
                    onChange={(checked) => onSelect(user.id, checked)}
                    label=""
                    className="flex justify-center"
                />
            </TableCell>

            {/* N° Dossier */}
            {showColumns.showDossier && (
                <TableCell className="text-center py-4 font-mono text-xs font-medium text-gray-500">
                    {user.id}
                </TableCell>
            )}

            {/* Nom */}
            <TableCell className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors py-4">
                <div className="flex items-center gap-2 relative">
                    <span>{user.nom || '-'}</span>
                    {user.informationImportante && (
                        <span
                            title="Cliquez pour voir l'information importante"
                            className="text-amber-500 animate-pulse cursor-pointer hover:text-amber-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                const popup = document.getElementById(`popup-info-${user.id}`);
                                if (popup) {
                                    popup.classList.toggle('hidden');
                                }
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </span>
                    )}
                    {user.donneesConfidentielles && (
                        <span
                            title="Cliquez pour voir les données confidentielles"
                            className="text-purple-600 cursor-pointer hover:text-purple-700 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                const popup = document.getElementById(`popup-conf-${user.id}`);
                                if (popup) {
                                    popup.classList.toggle('hidden');
                                }
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                    )}
                    {!user.dateNaissance && (
                        <span title="Date de naissance manquante" className="text-red-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    )}

                    {/* Popup pour Information Importante */}
                    {user.informationImportante && (
                        <div
                            id={`popup-info-${user.id}`}
                            className="hidden absolute left-0 top-full mt-2 z-50 w-80 max-w-md bg-amber-50 border border-amber-200 rounded-lg shadow-xl p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 text-amber-700 font-semibold">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span>Information Importante</span>
                                </div>
                                <button
                                    className="text-amber-500 hover:text-amber-700 text-lg font-bold"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const popup = document.getElementById(`popup-info-${user.id}`);
                                        if (popup) popup.classList.add('hidden');
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-sm text-amber-800 whitespace-pre-wrap">{user.informationImportante}</p>
                        </div>
                    )}

                    {/* Popup pour Données Confidentielles */}
                    {user.donneesConfidentielles && (
                        <div
                            id={`popup-conf-${user.id}`}
                            className="hidden absolute left-0 top-full mt-2 z-50 w-80 max-w-md bg-purple-50 border border-purple-200 rounded-lg shadow-xl p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Données Confidentielles</span>
                                </div>
                                <button
                                    className="text-purple-500 hover:text-purple-700 text-lg font-bold"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const popup = document.getElementById(`popup-conf-${user.id}`);
                                        if (popup) popup.classList.add('hidden');
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-sm text-purple-800 whitespace-pre-wrap">{user.donneesConfidentielles}</p>
                        </div>
                    )}
                </div>
            </TableCell>

            {/* Prénom */}
            <TableCell className="font-medium text-gray-700 group-hover:text-primary-600 transition-colors py-4">
                {user.prenom || '-'}
            </TableCell>

            {/* Date Naissance (conditionnel) */}
            {showColumns.showDateNaissance && (
                <TableCell className="text-center py-4 text-sm text-gray-500">
                    {user.dateNaissance ? formatDate(user.dateNaissance) : <span className="text-gray-300 italic">-</span>}
                </TableCell>
            )}

            {/* Téléphone (conditionnel) */}
            {showColumns.showPhone && (
                <TableCell className="text-center py-4 font-mono text-xs text-gray-600">
                    {user.telephone || <span className="text-gray-300 italic">-</span>}
                </TableCell>
            )}

            {/* Adresse (conditionnel) */}
            {showColumns.showAdresse && (
                <TableCell className="max-w-xs truncate py-4 text-sm text-gray-500" title={adresseDisplay}>
                    {adresseDisplay || '-'}
                </TableCell>
            )}

            {/* Gestionnaire */}
            <TableCell className="py-4">
                {gestionnaireObj ? (
                    <div className="inline-flex items-center gap-2.5">
                        <GestionnaireIcon gestionnaire={gestionnaireObj} size="sm" />
                        <span className="text-sm font-medium text-gray-700">
                            {gestionnaireObj.prenom} {gestionnaireObj.nom}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400 italic">N/A</span>
                )}
            </TableCell>

            {/* Secteur */}
            <TableCell className="text-center py-4 text-sm font-medium text-gray-700">
                {user.secteur || <span className="text-slate-400 italic">N/A</span>}
            </TableCell>

            {/* Antenne */}
            {showColumns.showAntenne && (
                <TableCell className="text-center py-4 text-sm font-medium text-gray-700">
                    {user.antenne || <span className="text-slate-400 italic">N/A</span>}
                </TableCell>
            )}

            {/* État */}
            <TableCell className="text-center py-4">
                <Badge variant={getEtatBadgeVariant(user.etat)} className="font-medium">
                    {user.etat || 'Non défini'}
                </Badge>
            </TableCell>

            {/* Date d'ouverture */}
            <TableCell className="text-center py-4 text-sm font-medium text-gray-700">
                {user.dateOuverture ? formatDate(user.dateOuverture) : <span className="text-slate-400 italic">N/A</span>}
            </TableCell>

            {/* Problématiques (conditionnel) */}
            {showColumns.showProblematiques && (
                <TableCell className="py-4 align-top">
                    {user.problematiques && user.problematiques.length > 0 ? (
                        <ul className="list-disc pl-4 text-sm text-blue-700 font-medium space-y-1">
                            {user.problematiques.map((p: Problematique, i: number) => (
                                <li key={i} className="leading-tight">
                                    {typeof p === 'string' ? p : (p.type || JSON.stringify(p))}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-slate-400 italic">Aucune</span>
                    )}
                </TableCell>
            )}

            {/* Actions (conditionnel) - Avec logique de déduction */}
            {showColumns.showActions && (() => {
                const userActions = getActionsForUser(user);
                return (
                    <TableCell className="py-4 align-top max-w-xs">
                        {userActions && userActions.length > 0 ? (
                            <ul className="text-sm text-amber-700 font-medium space-y-1">
                                {userActions.map((action, idx) => (
                                    <li key={idx} className="leading-tight">{deduceActionType(action)}</li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-slate-400 italic">Aucune action</span>
                        )}
                    </TableCell>
                );
            })()}
        </TableRow>
    );
});

UserListRow.displayName = 'UserListRow';

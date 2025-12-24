/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/


import React from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { User, Gestionnaire, ActionSuivi, Problematique } from '@/types';
import { GestionnaireIcon } from '../shared/GestionnaireIcon';
import { useMemo } from 'react';
import { extractActionsFromNotes, getActionsForUser, deduceActionType } from '@/utils/actionUtils';
import { getGestionnaireColor } from '@/features/users/utils/userUtils';

const getEtatBadgeVariant = (etat?: string | null): "success" | "destructive" | "warning" | "default" => {
    if (!etat) return 'default';
    switch (etat.toLowerCase()) {
        case 'actif':
        case 'ouvert':
            return 'success';
        case 'inactif':
        case 'clôturé':
            return 'destructive';
        case 'en attente':
        case 'en cours':
        case 'suspendu':
            return 'warning';
        case 'archivé':
            return 'default';
        default:
            return 'default';
    }
};

interface UserListGridProps {
    users: User[];
    gestionnaireMap: Map<string, Gestionnaire>; // Map pour recherche rapide
    onRowClick: (userId: string) => void;
    showDossier?: boolean;
    showPhone?: boolean;
    showProblematiques?: boolean;
    showActions?: boolean;
    showAdresse?: boolean;
    showAntenne?: boolean;
}

export const UserListGrid: React.FC<UserListGridProps> = ({
    users,
    gestionnaireMap,
    onRowClick,
    showDossier = false,
    showPhone = false,
    showProblematiques = false,
    showActions = false,
    showAdresse = false,
    showAntenne = true,
}) => {

    if (users.length === 0) {
        return (
            <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4-4-4m0 0L9 9l4 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun usager</h3>
                <p className="mt-1 text-sm text-slate-700">Aucun usager à afficher</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {users.map((user, idx) => {
                // Résolution du gestionnaire
                let gestionnaireObj = null;
                if (user.gestionnaire) {
                    if (typeof user.gestionnaire === 'object') {
                        gestionnaireObj = user.gestionnaire;
                    } else {
                        gestionnaireObj = gestionnaireMap.get(user.gestionnaire);
                    }
                }

                return (
                    <Card
                        key={user.id || idx}
                        className="group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer bg-white border-0 shadow-card"
                        onClick={() => onRowClick(user.id)}
                    >
                        {/* Accent color bar */}
                        {gestionnaireObj && (
                            <div
                                className="absolute left-0 top-0 h-full w-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{ background: getGestionnaireColor(gestionnaireObj) }}
                            />
                        )}

                        <CardContent className="p-5 flex flex-col h-full relative z-10">
                            {/* Header: N° Dossier & Badge */}
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant={getEtatBadgeVariant(user.etat)} className="shadow-sm">
                                    {user.etat || 'N/A'}
                                </Badge>
                                {showDossier && (
                                    <span className="font-mono text-[10px] text-gray-400 font-medium">
                                        #{user.id}
                                    </span>
                                )}
                            </div>

                            {/* Nom & Prénom */}
                            <div className="mb-4 flex-grow">
                                <h3
                                    className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1"
                                    title={`${user.nom} ${user.prenom}`}
                                >
                                    {user.nom} {user.prenom}
                                </h3>
                                {user.secteur && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {user.secteur}
                                        {showAntenne && user.antenne && <span className="text-slate-400"> • {user.antenne}</span>}
                                    </p>
                                )}
                            </div>

                            {/* Téléphone */}
                            {showPhone && user.telephone && (
                                <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {user.telephone}
                                </div>
                            )}

                            {/* Adresse */}
                            {showAdresse && user.adresse && (
                                <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="truncate">
                                        {typeof user.adresse === 'object'
                                            ? `${user.adresse.numero || ''} ${user.adresse.rue || ''}, ${user.adresse.codePostal || ''} ${user.adresse.ville || ''}`.trim()
                                            : String(user.adresse)
                                        }
                                    </span>
                                </div>
                            )}

                            {/* Divider if extra content */}
                            {(gestionnaireObj || showProblematiques || showActions) && (
                                <div className="h-px bg-slate-100 my-3 -mx-5" />
                            )}

                            {/* Gestionnaire */}
                            {gestionnaireObj && (
                                <div className="flex items-center gap-3 mb-2">
                                    <GestionnaireIcon gestionnaire={gestionnaireObj} size="sm" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-gray-800 truncate">
                                            {gestionnaireObj.prenom} {gestionnaireObj.nom}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Actions Contextuelles */}
                            {(showActions || showProblematiques) && (
                                <div className="mt-2 space-y-1.5">
                                    {showProblematiques && (
                                        user.problematiques && user.problematiques.length > 0 ? (
                                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="truncate">{user.problematiques[0]?.type || 'Problématique'}</span>
                                                {user.problematiques.length > 1 && <span className="text-gray-400">+{user.problematiques.length - 1}</span>}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 italic">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                <span>Aucune problématique</span>
                                            </div>
                                        )
                                    )}
                                    {showActions && (() => {
                                        // Get actions from database OR extract from notes
                                        const userActions = getActionsForUser(user);
                                        const hasActions = userActions && userActions.length > 0;

                                        return hasActions ? (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span className="truncate">{deduceActionType(userActions[0])}</span>
                                                {userActions.length > 1 && <span className="text-gray-400">+{userActions.length - 1}</span>}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 italic">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                <span>Aucune action</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

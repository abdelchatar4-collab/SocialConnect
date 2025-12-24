/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from "react";
import { User, Gestionnaire } from "@/types";
import { formatDate } from "@/utils/formatters";
import { extractActionsFromNotes, deduplicateActionsSuivi, deduceActionType } from '@/utils/actionUtils';
import { useSession } from 'next-auth/react';

// Fonction pour déterminer la classe du badge selon l'état
const getEtatBadgeClass = (etat?: string) => {
    switch (etat?.toLowerCase()) {
        case "actif":
            return "bg-green-100 text-green-800 border border-green-200";
        case "en attente":
        case "suspendu":
            return "bg-yellow-100 text-yellow-800 border border-yellow-200";
        case "clôturé":
            return "bg-red-100 text-red-800 border border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border border-gray-200";
    }
};

interface UserDetailDisplayProps {
    user: User;
    gestionnaires: Gestionnaire[];
}

export const UserDetailDisplay = React.memo(({ user, gestionnaires }: UserDetailDisplayProps) => {
    const { data: session } = useSession();
    const serviceId = (session?.user as any)?.serviceId || 'default';
    const showAntenne = serviceId === 'default' || !serviceId;

    const displayValue = (value: string | number | null | undefined) =>
        value ? <span className="font-medium text-gray-900">{value}</span> : <span className="text-gray-600 italic font-medium">N/A</span>;

    const displayDate = (date: string | Date | null | undefined) =>
        date ? <span className="font-medium text-gray-900">{formatDate(date)}</span> : <span className="text-gray-600 italic">N/A</span>;

    // Extraction automatique des actions depuis les notes si actions vide
    let actionsToDisplay = user.actions && user.actions.length > 0 ? user.actions : [];
    if ((!user.actions || user.actions.length === 0) && user.notesGenerales) {
        actionsToDisplay = extractActionsFromNotes(user.notesGenerales);
    }
    actionsToDisplay = deduplicateActionsSuivi(actionsToDisplay);

    return (
        <div className="space-y-6">
            {/* Informations Personnelles */}
            <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                    <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                    Informations Personnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div><span className="font-medium text-gray-700">Nom :</span> {displayValue(user.nom)}</div>
                    <div><span className="font-medium text-gray-700">Prénom :</span> {displayValue(user.prenom)}</div>
                    <div><span className="font-medium text-gray-700">Date de naissance :</span> {displayDate(user.dateNaissance)}</div>
                    <div><span className="font-medium text-gray-700">Genre :</span> {displayValue(user.genre)}</div>
                    <div><span className="font-medium text-gray-700">Nationalité :</span> {displayValue(user.nationalite)}</div>
                    <div><span className="font-medium text-gray-700">Email :</span> {displayValue(user.email)}</div>
                    <div><span className="font-medium text-gray-700">Téléphone :</span> {displayValue(user.telephone)}</div>
                    <div><span className="font-medium text-gray-700">Langue d'entretien :</span> {displayValue(user.langue)}</div>
                    <div><span className="font-medium text-gray-700">Statut de séjour :</span> {displayValue(user.statutSejour)}</div>
                </div>
            </div>

            {/* Coordonnées / Adresse */}
            <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                    <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
                    Coordonnées / Adresse
                </h2>
                {user.adresse ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div><span className="font-medium text-gray-700">Rue :</span> {displayValue(user.adresse.rue)}</div>
                        <div><span className="font-medium text-gray-700">Numéro :</span> {displayValue(user.adresse.numero)}</div>
                        <div><span className="font-medium text-gray-700">Boîte :</span> {displayValue(user.adresse.boite)}</div>
                        <div><span className="font-medium text-gray-700">Code Postal :</span> {displayValue(user.adresse.codePostal)}</div>
                        <div><span className="font-medium text-gray-700">Ville :</span> {displayValue(user.adresse.ville)}</div>
                    </div>
                ) : (
                    <div className="text-gray-600 italic text-sm">Aucune adresse enregistrée.</div>
                )}
            </div>

            {/* Dossier Administratif */}
            <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                    <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
                    Dossier Administratif
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div><span className="font-medium text-gray-700">État du dossier :</span>{" "}
                        <span className={`font-medium inline-flex items-center px-2 py-0.5 rounded text-xs ${getEtatBadgeClass(user.etat || undefined)}`}>
                            {displayValue(user.etat)}
                        </span>
                    </div>
                    {showAntenne && (
                        <div><span className="font-medium text-gray-700">Antenne :</span> {displayValue(user.antenne)}</div>
                    )}
                    <div>
                        <span className="font-medium text-gray-700">Gestionnaire :</span> {
                            (() => {
                                const gest = user.gestionnaire;
                                if (!gest) return <span className="text-gray-600 italic">N/A</span>;
                                if (typeof gest === 'object' && gest !== null && 'nom' in gest) {
                                    return <span className="font-medium text-gray-900">{`${gest.prenom || ''} ${gest.nom || ''}`.trim()}</span>;
                                }
                                if (typeof gest === 'string') {
                                    const found = gestionnaires?.find(g => g.id === gest);
                                    if (found) return <span className="font-medium text-gray-900">{`${found.prenom || ''} ${found.nom || ''}`.trim()}</span>;
                                    return <span className="font-medium text-gray-900">{gest}</span>;
                                }
                                return <span className="text-gray-600 italic">Format inconnu</span>;
                            })()
                        }
                    </div>
                    <div><span className="font-medium text-gray-700">Secteur :</span> {displayValue(user.secteur)}</div>
                    <div><span className="font-medium text-gray-700">Date d'ouverture :</span> {displayDate(user.dateOuverture)}</div>
                    <div><span className="font-medium text-gray-700">Date de clôture :</span> {displayDate(user.dateCloture)}</div>
                </div>
            </div>

            {/* Détails de la Médiation (Conditionnel) */}
            {(user.mediationType || user.mediationDemandeur || user.mediationDescription) && (
                <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                    <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                        <span className="w-2 h-8 bg-rose-500 rounded-full mr-3"></span>
                        Détails de la Médiation
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                        <div><span className="font-medium text-gray-700">Type de litige :</span> {displayValue(user.mediationType)}</div>
                        <div><span className="font-medium text-gray-700">Statut :</span> {displayValue(user.mediationStatut)}</div>
                        <div><span className="font-medium text-gray-700">Demandeur :</span> {displayValue(user.mediationDemandeur)}</div>
                        <div><span className="font-medium text-gray-700">Partie Adverse :</span> {displayValue(user.mediationPartieAdverse)}</div>
                    </div>
                    {user.mediationDescription && (
                        <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-100 italic text-rose-900 border-l-4">
                            "{user.mediationDescription}"
                        </div>
                    )}
                </div>
            )}

            {/* Notes Générales */}
            <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                    <span className="w-2 h-8 bg-amber-500 rounded-full mr-3"></span>
                    Notes Générales
                </h2>
                {user.notesGenerales ? (
                    <div className="text-gray-800 text-sm whitespace-pre-wrap">{user.notesGenerales}</div>
                ) : (
                    <div className="text-gray-600 italic text-sm">Aucune note générale.</div>
                )}
            </div>

            {/* Problématiques */}
            <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                    <span className="w-2 h-8 bg-red-500 rounded-full mr-3"></span>
                    Problématiques
                </h2>
                {user.problematiques && user.problematiques.length > 0 ? (
                    <ul className="space-y-4">
                        {user.problematiques.map((p, index) => (
                            <li key={index} className="text-sm border-l-4 border-yellow-500 pl-3 bg-yellow-50 p-2 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                    {p.dateSignalement && <span className="font-semibold text-gray-900">{displayDate(p.dateSignalement)}</span>}
                                    <span className="font-medium text-gray-900">{displayValue(p.type)}</span>
                                </div>
                                {p.description && <div className="mt-1 text-gray-800 whitespace-pre-wrap">{p.description}</div>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-600 italic text-sm">Aucune problématique enregistrée.</div>
                )}
            </div>

            {/* Actions et suivi */}
            <div className="backdrop-blur-md bg-white/80 p-6 rounded-2xl shadow-xl border border-white/40 ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200/50 flex items-center">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></span>
                    Actions et suivi
                </h2>
                {(!user.actions || user.actions.length === 0) && actionsToDisplay.length > 0 && (
                    <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                        <svg className="inline h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" d="M12 8v4m0 4h.01" /></svg>
                        Ajouté automatiquement depuis les notes
                    </div>
                )}
                {actionsToDisplay && actionsToDisplay.length > 0 ? (
                    <ul className="space-y-4">
                        {actionsToDisplay.map((a, index) => (
                            <li key={index} className="text-sm border-l-4 border-green-500 pl-3 bg-green-50 p-2 rounded">
                                <div className="font-medium text-gray-900">
                                    {deduceActionType(a)}
                                    {(!a.type || a.type.trim() === '') && <span className="text-gray-400"> (déduit)</span>}
                                    {a.date && <span className="ml-2 text-gray-700">{formatDate(a.date)}</span>}
                                    {a.partenaire && <span className="text-gray-800 ml-2 font-medium">(Partenaire: {a.partenaire})</span>}
                                </div>
                                {a.description && <div className="mt-1 text-gray-800 whitespace-pre-wrap">{a.description}</div>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-600 italic text-sm">Aucune action enregistrée.</div>
                )}
            </div>

            {/* Audit Trail */}
            <div className="mt-6 pt-4 border-t border-gray-200/50">
                <div className="backdrop-blur-md bg-gray-50/80 p-4 rounded-xl border border-gray-200/40">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {(user as any).createdBy ? (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">📝</span>
                                <span>Créé par <strong className="text-gray-700">{(user as any).createdBy}</strong> {user.createdAt && <>le <strong className="text-gray-700">{formatDate(user.createdAt)}</strong></>}</span>
                            </div>
                        ) : (
                            user.gestionnaire && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📝</span>
                                    <span>
                                        Créé par <strong className="text-gray-700">
                                            {typeof user.gestionnaire === 'object' && user.gestionnaire !== null
                                                ? `${(user.gestionnaire as any).prenom || ''} ${(user.gestionnaire as any).nom || ''}`.trim() || 'Gestionnaire'
                                                : gestionnaires.find(g => g.id === (user.gestionnaire as string))?.prenom || 'Gestionnaire'
                                            } (présumé)
                                        </strong>
                                        {user.createdAt && <> le <strong className="text-gray-700">{formatDate(user.createdAt)}</strong></>}
                                    </span>
                                </div>
                            )
                        )}
                        {(user as any).updatedBy && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">✏️</span>
                                <span>Modifié par <strong className="text-gray-700">{(user as any).updatedBy}</strong> {user.updatedAt && <>le <strong className="text-gray-700">{formatDate(user.updatedAt)}</strong></>}</span>
                            </div>
                        )}
                        {!(user as any).createdBy && !(user as any).updatedBy && !user.gestionnaire && (
                            <span className="italic text-gray-400">Traçabilité non disponible (dossier créé avant activation)</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

UserDetailDisplay.displayName = "UserDetailDisplay";

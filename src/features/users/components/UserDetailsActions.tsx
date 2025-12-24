/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from "react";
import Link from "next/link";
import { User, Gestionnaire } from "@/types";
import LazyPDFDownloadButton from "@/components/LazyPDFDownloadButton";
import { useSession } from "next-auth/react";

// Icons
const EditIcon = () => (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
    </svg>
);

const TrashIcon = () => (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" />
    </svg>
);

const ExcelIcon = () => (
    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const PrintIcon = () => (
    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const getEtatBadgeClass = (etat?: string) => {
    switch (etat?.toLowerCase()) {
        case "actif": return "bg-green-100 text-green-800 border-green-200";
        case "en attente":
        case "suspendu": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "clôturé": return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

interface UserDetailsActionsProps {
    user: User;
    gestionnaires: Gestionnaire[];
    isAdmin: boolean;
    onDelete: () => void;
    onExcelExport: () => void;
}

export const UserDetailsActions: React.FC<UserDetailsActionsProps> = ({
    user,
    gestionnaires,
    isAdmin,
    onDelete,
    onExcelExport
}) => {
    const { data: session } = useSession();
    const serviceId = (session?.user as any)?.serviceId || 'default';
    const showAntenne = serviceId === 'default' || !serviceId;

    return (
        <div className="px-8 py-8 bg-gradient-to-br from-white/40 to-transparent border-b border-white/20 flex flex-wrap justify-between items-center gap-6">
            <div>
                <h1 className="text-2xl leading-8 font-bold text-gray-900 mb-1">
                    Fiche Usager : {user.prenom} {user.nom}
                </h1>
                <p className="text-base text-gray-600">
                    Dossier N°: <span className="font-medium text-gray-800">{user.id}</span> | État:
                    <span className={`ml-1 font-medium inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getEtatBadgeClass(user.etat as string)}`}>
                        {user.etat || "Inconnu"}
                    </span>
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                {/* Modifier */}
                <Link
                    href={`/users/${user.id}/edit`}
                    className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-colors"
                >
                    <EditIcon /> Modifier
                </Link>

                {/* PDF */}
                <LazyPDFDownloadButton
                    user={user}
                    gestionnaires={gestionnaires}
                    showAntenne={showAntenne}
                    className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-colors"
                />

                {/* Excel */}
                <button
                    onClick={onExcelExport}
                    className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-colors"
                >
                    <ExcelIcon /> Exporter Excel
                </button>

                {/* Imprimer */}
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-colors"
                >
                    <PrintIcon /> Imprimer
                </button>

                {/* Supprimer */}
                {isAdmin && (
                    <button
                        onClick={onDelete}
                        className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-colors"
                    >
                        <TrashIcon /> Supprimer
                    </button>
                )}
            </div>
        </div>
    );
};

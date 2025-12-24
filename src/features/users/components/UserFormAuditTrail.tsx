/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types';

interface UserFormAuditTrailProps {
    formData: UserFormData;
    mode: 'create' | 'edit';
    gestionnaires: Array<{ id: string; prenom: string; nom: string }>;
}

export const UserFormAuditTrail: React.FC<UserFormAuditTrailProps> = ({ formData, mode, gestionnaires }) => {
    if (mode !== 'edit') return null;

    const formatDate = (date: any) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const createdBy = (formData as any).createdBy;
    const createdAt = (formData as any).createdAt;
    const updatedBy = (formData as any).updatedBy;
    const updatedAt = (formData as any).updatedAt;

    return (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
            <div className="flex flex-wrap gap-4">
                {createdBy ? (
                    <span>
                        📝 Créé par <strong className="text-gray-700">{createdBy}</strong>
                        {createdAt && <> le {formatDate(createdAt)}</>}
                    </span>
                ) : (
                    /* Fallback: show gestionnaire for old records */
                    formData.gestionnaire && gestionnaires.length > 0 && (
                        <span>
                            📝 Créé par <strong className="text-gray-700">
                                {gestionnaires.find(g => g.id === formData.gestionnaire)?.prenom || 'Gestionnaire'} (présumé)
                            </strong>
                        </span>
                    )
                )}

                {updatedBy && (
                    <span>
                        ✏️ Modifié par <strong className="text-gray-700">{updatedBy}</strong>
                        {updatedAt && <> le {formatDate(updatedAt)}</>}
                    </span>
                )}

                {!createdBy && !updatedBy && !formData.gestionnaire && (
                    <span className="italic">Traçabilité non disponible (dossier créé avant activation)</span>
                )}
            </div>
        </div>
    );
};

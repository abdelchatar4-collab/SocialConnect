/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * useUserColumns - Manage visible/hidden columns in UserList
 */

import { useState, useCallback } from 'react';

export interface ColumnVisibility {
    showProblematiques: boolean;
    showActions: boolean;
    showDossier: boolean;
    showPhone: boolean;
    showAdresse: boolean;
}

export const useUserColumns = () => {
    const [columns, setColumns] = useState<ColumnVisibility>({
        showProblematiques: false,
        showActions: false,
        showDossier: false,
        showPhone: false,
        showAdresse: false,
    });

    const toggleColumn = useCallback((columnName: keyof ColumnVisibility) => {
        setColumns(prev => ({
            ...prev,
            [columnName]: !prev[columnName],
        }));
    }, []);

    const setColumn = useCallback((columnName: keyof ColumnVisibility, value: boolean) => {
        setColumns(prev => ({
            ...prev,
            [columnName]: value,
        }));
    }, []);

    return {
        columns,
        toggleColumn,
        setColumn,
    };
};

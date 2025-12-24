/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import { useMemo } from 'react';
import { User, Problematique, Gestionnaire } from '@/types';

interface UserListLogicProps {
    users: User[];
    gestionnaires: Gestionnaire[];
    session: any;
    state: any; // Result from useUserListState
}

export const useUserListLogic = ({ users, gestionnaires, session, state }: UserListLogicProps) => {
    const {
        searchTerm,
        searchField,
        problematiqueFilter,
        showImportantInfoOnly,
        showDonneesConfidentielles,
        showMissingBirthDate,
        showDuplicates,
        includeDateInDuplicates,
        sortField,
        sortDirection
    } = state;

    // Gestionnaire Map
    const gestionnaireMap = useMemo(() => {
        const map = new Map();
        gestionnaires.forEach(g => map.set(g.id, g));
        return map;
    }, [gestionnaires]);

    // Apply local filtering (Mirrored from UserList.tsx)
    const filteredUsers = useMemo(() => {
        let result = users || [];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => {
                if (searchField === 'all') {
                    const adresse = u.adresse && typeof u.adresse === 'object'
                        ? `${u.adresse.rue || ''} ${u.adresse.numero || ''} ${u.adresse.codePostal || ''} ${u.adresse.ville || ''}`
                        : String(u.adresse || '');

                    const gestionnaireIdx = typeof u.gestionnaire === 'object'
                        ? `${u.gestionnaire?.prenom || ''} ${u.gestionnaire?.nom || ''}`
                        : String(u.gestionnaire || '');

                    return (
                        u.nom?.toLowerCase().includes(term) ||
                        u.prenom?.toLowerCase().includes(term) ||
                        u.email?.toLowerCase().includes(term) ||
                        u.telephone?.includes(term) ||
                        adresse.toLowerCase().includes(term) ||
                        String(gestionnaireIdx || '').toLowerCase().includes(term)
                    );
                }

                if (searchField === 'adresse') {
                    const adresse = u.adresse && typeof u.adresse === 'object'
                        ? u.adresse
                        : { rue: String(u.adresse || '') };
                    const rue = (adresse.rue || '').toLowerCase();
                    const numero = (adresse.numero || '').toLowerCase();
                    const cp = (adresse.codePostal || '').toLowerCase();
                    const ville = (adresse.ville || '').toLowerCase();
                    const fullAdresse = `${rue} ${numero} ${cp} ${ville}`;
                    return fullAdresse.includes(term);
                }

                if (searchField === 'gestionnaire') {
                    const gVal = typeof u.gestionnaire === 'object'
                        ? `${u.gestionnaire?.prenom || ''} ${u.gestionnaire?.nom || ''}`
                        : String(u.gestionnaire || '');
                    return gVal.toLowerCase().includes(term);
                }

                const val = u[searchField as keyof User];
                return String(val || '').toLowerCase().includes(term);
            });
        }

        // Problématique filter
        if (problematiqueFilter) {
            if (problematiqueFilter === 'aucune') {
                result = result.filter(u => !u.problematiques || u.problematiques.length === 0);
            } else {
                result = result.filter(u =>
                    u.problematiques?.some((p: Problematique) => {
                        const pType = (p.type || p.description || 'Problématique').toString().toLowerCase();
                        return pType === problematiqueFilter.toLowerCase();
                    })
                );
            }
        }

        // Special filters
        if (showImportantInfoOnly) {
            result = result.filter(u => u.informationImportante && u.informationImportante.trim() !== '');
        }
        if (showDonneesConfidentielles) {
            result = result.filter(u => u.donneesConfidentielles && u.donneesConfidentielles.trim() !== '');
        }
        if (showMissingBirthDate) {
            result = result.filter(u => !u.dateNaissance);
        }
        if (showDuplicates) {
            const seen = new Map<string, User[]>();
            result.forEach(u => {
                const key = includeDateInDuplicates
                    ? `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}_${u.dateNaissance}`
                    : `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}`;
                if (!seen.has(key)) seen.set(key, []);
                seen.get(key)!.push(u);
            });
            result = result.filter(u => {
                const key = includeDateInDuplicates
                    ? `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}_${u.dateNaissance}`
                    : `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}`;
                return (seen.get(key)?.length || 0) > 1;
            });
        }

        return result;
    }, [users, searchTerm, searchField, problematiqueFilter, showImportantInfoOnly, showDonneesConfidentielles, showMissingBirthDate, showDuplicates, includeDateInDuplicates, session]);

    // Sorting
    const sortedUsers = useMemo(() => {
        const usersToSort = filteredUsers || [];
        if (!sortField) return usersToSort;
        return [...usersToSort].sort((a, b) => {
            let aVal: unknown = a[sortField as keyof User];
            let bVal: unknown = b[sortField as keyof User];

            if (sortField === 'gestionnaire') {
                aVal = typeof a.gestionnaire === 'object' ? a.gestionnaire?.prenom : a.gestionnaire;
                bVal = typeof b.gestionnaire === 'object' ? b.gestionnaire?.prenom : b.gestionnaire;
            }

            if (sortField === 'dateOuverture') {
                const timeA = a.dateOuverture ? new Date(a.dateOuverture).getTime() : 0;
                const timeB = b.dateOuverture ? new Date(b.dateOuverture).getTime() : 0;
                return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
            }

            const valAStr = String(aVal || '');
            const valBStr = String(bVal || '');
            const comparison = valAStr.localeCompare(valBStr);
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredUsers, sortField, sortDirection]);

    // Stats
    const totalUsersCount = users.length;

    const lastAddedUser = useMemo(() => {
        if (users.length === 0) return null;
        return [...users].sort((a, b) => {
            const dateA = a.dateOuverture ? new Date(a.dateOuverture).getTime() : 0;
            const dateB = b.dateOuverture ? new Date(b.dateOuverture).getTime() : 0;
            return dateB - dateA;
        })[0];
    }, [users]);

    const myDossiersCount = useMemo(() => {
        // Option 1: Match by ID (More robust)
        const currentUserId = (session?.user as any)?.gestionnaire?.id || session?.user?.id;

        if (currentUserId) {
            return users.filter(u => {
                // Check scalar ID if available (needs casting as it might not be in the type definition but is in the API response)
                if ((u as any).gestionnaireId && String((u as any).gestionnaireId) === String(currentUserId)) {
                    return true;
                }

                if (!u.gestionnaire) return false;

                // If gestionnaire is an object with an ID
                if (typeof u.gestionnaire === 'object' && u.gestionnaire?.id) {
                    return String(u.gestionnaire.id) === String(currentUserId);
                }

                return false;
            }).length;
        }

        // Option 2: Fallback to Name Match (Legacy / Safety)
        if (!session?.user?.name) return 0;
        const currentUserName = session.user.name.toLowerCase();

        return users.filter(u => {
            if (!u.gestionnaire) return false;
            const gName = typeof u.gestionnaire === 'object'
                ? `${u.gestionnaire.prenom} ${u.gestionnaire.nom}`
                : String(u.gestionnaire);
            return gName.toLowerCase().includes(currentUserName);
        }).length;
    }, [users, session]);

    const importantInfoCount = useMemo(() =>
        users.filter(u => u.informationImportante && u.informationImportante.trim() !== '').length,
        [users]
    );

    const donneesConfidentiellesCount = useMemo(() =>
        users.filter(u => u.donneesConfidentielles && u.donneesConfidentielles.trim() !== '').length,
        [users]
    );

    const missingBirthDateCount = useMemo(() =>
        users.filter(u => !u.dateNaissance).length,
        [users]
    );

    const duplicatesCount = useMemo(() => {
        const seen = new Map<string, number>();
        users.forEach(u => {
            const key = includeDateInDuplicates
                ? `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}_${u.dateNaissance}`
                : `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}`;
            seen.set(key, (seen.get(key) || 0) + 1);
        });
        return Array.from(seen.values()).filter(count => count > 1).reduce((a, b) => a + b, 0);
    }, [users, includeDateInDuplicates]);

    return {
        filteredUsers,
        sortedUsers,
        gestionnaireMap,
        stats: {
            totalUsersCount,
            lastAddedUser,
            myDossiersCount,
            importantInfoCount,
            donneesConfidentiellesCount,
            missingBirthDateCount,
            duplicatesCount,
        }
    };
};

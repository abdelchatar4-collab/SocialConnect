/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Migration Helpers
*/

import { User } from '@/types';
import { DatabaseInterface } from './migrationTypes';

/**
 * Creates a new user object based on the current schema
 */
export const createNewUser = (userData: Partial<User>): User => {
    const now = new Date();
    return {
        id: userData.id || crypto.randomUUID(),
        nom: userData.nom || null,
        prenom: userData.prenom || null,
        email: userData.email || null,
        telephone: userData.telephone || null,
        dateNaissance: userData.dateNaissance || null,
        genre: userData.genre || null,
        adresseId: userData.adresseId || null,
        dateOuverture: userData.dateOuverture || now,
        dateCloture: userData.dateCloture || null,
        etat: userData.etat || 'Actif',
        antenne: userData.antenne || null,
        statutSejour: userData.statutSejour || null,
        gestionnaire: userData.gestionnaire || null,
        nationalite: userData.nationalite || null,
        trancheAge: userData.trancheAge || null,
        remarques: userData.remarques || null,
        secteur: userData.secteur || null,
        langue: userData.langue || null,
        premierContact: userData.premierContact || null,
        notesGenerales: userData.notesGenerales || null,
        hasPrevExp: userData.hasPrevExp || null,
        prevExpDateReception: userData.prevExpDateReception || null,
        prevExpDateRequete: userData.prevExpDateRequete || null,
        prevExpDateVad: userData.prevExpDateVad || null,
        prevExpDecision: userData.prevExpDecision || null,
        prevExpCommentaire: userData.prevExpCommentaire || null,
        logementDetails: userData.logementDetails || null,
        adresse: userData.adresse || null,
        problematiques: userData.problematiques || [],
        actionsSuivi: userData.actionsSuivi || [],
        dateCreation: userData.dateCreation || now,
        derniereModification: userData.derniereModification || now,
        meta: userData.meta || {}
    };
};

/**
 * Saves a backup of the data
 */
export const saveBackup = async (
    db: DatabaseInterface,
    backupName: string,
    data: any[]
): Promise<boolean | { backupName: string; data: any[] }> => {
    if (db.collection) {
        await db.collection('backups').insertOne({
            _id: backupName,
            data: data,
            timestamp: new Date(),
            type: 'users_migration'
        });
        return true;
    }
    console.log("Backup data (to be handled by parent component):", { backupName, data });
    return { backupName, data };
};

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Migration Types
*/

import { User } from '@/types';

export interface MigrationOptions {
    createBackup?: boolean;
    validateAfterMigration?: boolean;
    fixInconsistencies?: boolean;
    logProgress?: boolean;
}

export interface MigrationWarning {
    userId: string;
    message: string;
}

export interface MigrationError {
    userId: string;
    message: string;
    error?: string;
}

export interface MigrationResults {
    total: number;
    migrated: number;
    warnings: MigrationWarning[];
    errors: MigrationError[];
    backup: any[] | null;
    migratedUsers: User[];
    savedCount?: number;
    success?: boolean;
    error?: string;
}

export interface ProgressCallback {
    phase: 'saving' | 'migrating';
    current: number;
    total: number;
    percentage: number;
}

export interface LegacyUser {
    id?: string;
    _id?: string;
    nom?: string | null;
    prenom?: string | null;
    email?: string | null;
    telephone?: string | null;
    dateNaissance?: string | Date | null;
    mutuelle?: string | null | {
        id?: string | null;
        _id?: string | null;
        nom?: string | null;
        name?: string | null;
        numeroAdherent?: string | null;
        number?: string | null;
        dateAdhesion?: string | Date | null;
        date?: string | Date | null;
        options?: any[] | any | null;
    };
    adresse?: string | null | {
        rue?: string | null;
        street?: string | null;
        codePostal?: string | null;
        cp?: string | null;
        zipCode?: string | null;
        ville?: string | null;
        city?: string | null;
        pays?: string | null;
        country?: string | null;
    };
    emploi?: any;
    famille?: any;
    sante?: any;
    logement?: any;
    preferences?: any;
    dateCreation?: string | Date | null;
    createdAt?: string | Date | null;
    source?: string;
    [key: string]: any;
}

export interface DatabaseInterface {
    collection?: (name: string) => {
        insertOne: (doc: any) => Promise<any>;
    };
    [key: string]: any;
}

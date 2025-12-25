/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useUser Hook Types
*/

import { User } from '@/types';

export interface UseUserOptions {
    apiEndpoint?: string;
    fetchOnMount?: boolean;
    debounceTime?: number;
    validateOnChange?: boolean;
    autoSave?: boolean;
    cacheKey?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export interface MigrationStatus {
    done: boolean;
    inProgress: boolean;
    results: {
        totalMigrated: number;
        totalSaved: number;
        errors: string[];
    } | null;
}

export interface UserOperationResult {
    success: boolean;
    user?: User;
    errors?: Record<string, string>;
    error?: string;
}

export interface MigrationResult {
    success: boolean;
    totalMigrated?: number;
    totalSaved?: number;
    error?: string;
}

export interface CachedData {
    timestamp: number;
    data: User[];
}

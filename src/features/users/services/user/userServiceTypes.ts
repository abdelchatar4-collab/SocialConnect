/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Service Types
*/

export interface UserServiceOptions {
    useCache?: boolean;
    throwOnError?: boolean;
}

export interface UserValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface UserSearchFilters {
    gestionnaire?: string;
    secteur?: string;
    antenne?: string;
    etat?: string;
    search?: string;
}

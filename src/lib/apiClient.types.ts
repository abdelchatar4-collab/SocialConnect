/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Types et configuration pour le client API
*/

import type { User, UserFormData, Gestionnaire } from '@/types';

// Configuration API
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://192.168.2.147:3001',
    TIMEOUT: 5000,
    STORAGE_KEY: 'gestionUsagers_users',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Types pour les réponses API
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface BulkDeleteRequest {
    ids: string[];
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Types pour les options de requête
export interface RequestOptions extends RequestInit {
    timeout?: number;
    useCache?: boolean;
    cacheKey?: string;
}

// Re-export des types utilisateur
export type { User, UserFormData, Gestionnaire };

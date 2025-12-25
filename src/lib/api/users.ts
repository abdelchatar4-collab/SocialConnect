/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API User Operations
*/

import { ApiCore } from './core';
import { API_CONFIG, User, UserFormData, PaginationParams, ApiResponse, BulkDeleteRequest } from '../apiClient.types';

export class UserOperations extends ApiCore {
    async getUsers(options: { useCache?: boolean; pagination?: PaginationParams } = {}): Promise<User[]> {
        const { useCache = true, pagination } = options;
        if (this.isLocalStorageMode()) {
            const cacheKey = API_CONFIG.STORAGE_KEY;
            const cached = this.getFromCache(cacheKey);
            if (useCache && cached) return cached;
            const users = JSON.parse(localStorage.getItem(cacheKey) || '[]');
            if (useCache) this.setCache(cacheKey, users);
            return users;
        }
        const url = new URL('/api/users', this.baseURL);
        if (pagination) Object.entries(pagination).forEach(([k, v]) => v !== undefined && url.searchParams.append(k, String(v)));
        const response = await this.fetchWithTimeout(url.toString());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : data.users || [];
    }

    async getUser(id: string): Promise<User> {
        if (this.isLocalStorageMode()) {
            const user = (await this.getUsers({ useCache: false })).find(u => u.id === id);
            if (!user) throw new Error(`User ${id} not found`);
            return user;
        }
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async createUser(userData: UserFormData): Promise<User> {
        if (this.isLocalStorageMode()) {
            const users = await this.getUsers({ useCache: false });
            const newUser = { ...userData, id: userData.id || this.generateUserId(), partenaire: userData.partenaire ? JSON.stringify(userData.partenaire) : null } as User;
            users.push(newUser);
            localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(users));
            return newUser;
        }
        const resp = await this.fetchWithTimeout(`${this.baseURL}/api/users`, { method: 'POST', body: JSON.stringify(userData) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    }

    async updateUser(id: string, userData: Partial<UserFormData>): Promise<User> {
        if (this.isLocalStorageMode()) {
            const users = await this.getUsers({ useCache: false });
            const idx = users.findIndex(u => u.id === id);
            if (idx === -1) throw new Error(`User ${id} not found`);
            const { partenaire, ...rest } = userData;
            users[idx] = { ...users[idx], ...rest, id, ...(partenaire !== undefined && { partenaire: partenaire ? JSON.stringify(partenaire) : null }) };
            localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(users));
            return users[idx];
        }
        const resp = await this.fetchWithTimeout(`${this.baseURL}/api/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    }

    async deleteUser(id: string): Promise<ApiResponse> {
        if (this.isLocalStorageMode()) {
            const users = (await this.getUsers({ useCache: false })).filter(u => u.id !== id);
            localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(users));
            return { success: true, message: 'Deleted' };
        }
        const resp = await this.fetchWithTimeout(`${this.baseURL}/api/users/${id}`, { method: 'DELETE', headers: { 'x-admin-auth': 'true' } });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return { success: true, message: 'Deleted' };
    }

    async bulkDeleteUsers(req: BulkDeleteRequest): Promise<ApiResponse> {
        if (this.isLocalStorageMode()) {
            const users = (await this.getUsers({ useCache: false })).filter(u => !req.ids.includes(u.id));
            localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(users));
            return { success: true, message: 'Bulk deleted' };
        }
        const resp = await this.fetchWithTimeout(`${this.baseURL}/api/users/bulk-delete`, { method: 'DELETE', headers: { 'x-admin-auth': 'true' }, body: JSON.stringify(req) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return { success: true, message: 'Bulk deleted' };
    }

    private generateUserId(): string {
        return `USR-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
}

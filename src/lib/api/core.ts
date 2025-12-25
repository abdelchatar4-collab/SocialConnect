/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Core Logic
*/

import { API_CONFIG, RequestOptions } from '../apiClient.types';

export class ApiCore {
    protected baseURL: string = API_CONFIG.BASE_URL;
    protected timeout: number = API_CONFIG.TIMEOUT;

    protected async fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
        const { timeout = this.timeout, ...fetchOptions } = options;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...fetchOptions.headers },
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error) {
                if (error.name === 'AbortError') throw new Error(`Request timeout after ${timeout}ms`);
                if (error.message === 'Failed to fetch') throw new Error(`Network error: Could not reach ${this.baseURL}`);
            }
            throw error;
        }
    }

    protected getFromCache(key: string): any | null {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp > API_CONFIG.CACHE_DURATION) {
                localStorage.removeItem(key);
                return null;
            }
            return data;
        } catch { return null; }
    }

    protected setCache(key: string, data: any): void {
        try {
            localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
        } catch (error) { console.warn('Failed to cache data:', error); }
    }

    protected isLocalStorageMode(): boolean {
        return process.env.NODE_ENV === 'development';
    }

    protected generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

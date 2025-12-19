/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Groq API Key Pool Manager
 *
 * Manages a pool of Groq API keys for rotation.
 * When one key hits rate limit, automatically switches to the next.
 * Admin can add/remove keys from the pool.
 */

// Storage key
const GROQ_KEY_POOL_STORAGE = 'groq_api_key_pool';

export interface GroqApiKey {
    id: string;
    key: string;
    label: string;           // e.g., "Pauline", "Ahmed", etc.
    addedAt: string;         // ISO date
    lastUsed?: string;       // ISO date
    requestsToday: number;   // Counter reset daily
    isRateLimited: boolean;  // Currently rate limited
    rateLimitedUntil?: string; // ISO date when rate limit expires
}

export interface KeyPoolStats {
    totalKeys: number;
    activeKeys: number;
    rateLimitedKeys: number;
    totalRequestsToday: number;
}

// Get stored key pool
export function getKeyPool(): GroqApiKey[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(GROQ_KEY_POOL_STORAGE);
        if (stored) {
            const keys = JSON.parse(stored);
            // Reset daily counters if new day
            return keys.map((k: GroqApiKey) => resetDailyIfNeeded(k));
        }
    } catch (e) {
        console.error('Failed to load key pool:', e);
    }
    return [];
}

// Save key pool
function saveKeyPool(keys: GroqApiKey[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(GROQ_KEY_POOL_STORAGE, JSON.stringify(keys));
    } catch (e) {
        console.error('Failed to save key pool:', e);
    }
}

// Reset daily counters if it's a new day
function resetDailyIfNeeded(key: GroqApiKey): GroqApiKey {
    if (!key.lastUsed) return key;

    const lastUsedDate = new Date(key.lastUsed).toDateString();
    const todayDate = new Date().toDateString();

    if (lastUsedDate !== todayDate) {
        return {
            ...key,
            requestsToday: 0,
            isRateLimited: false,
            rateLimitedUntil: undefined,
        };
    }

    // Check if rate limit has expired
    if (key.rateLimitedUntil) {
        const expiry = new Date(key.rateLimitedUntil);
        if (new Date() > expiry) {
            return {
                ...key,
                isRateLimited: false,
                rateLimitedUntil: undefined,
            };
        }
    }

    return key;
}

// Add a new key to the pool
export function addKeyToPool(key: string, label: string): GroqApiKey | null {
    if (!key || key.length < 10) return null;

    const pool = getKeyPool();

    // Check for duplicates
    if (pool.some(k => k.key === key)) {
        console.warn('Key already exists in pool');
        return null;
    }

    const newKey: GroqApiKey = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key,
        label: label || 'Sans nom',
        addedAt: new Date().toISOString(),
        requestsToday: 0,
        isRateLimited: false,
    };

    pool.push(newKey);
    saveKeyPool(pool);

    return newKey;
}

// Remove a key from the pool
export function removeKeyFromPool(keyId: string): boolean {
    const pool = getKeyPool();
    const newPool = pool.filter(k => k.id !== keyId);

    if (newPool.length !== pool.length) {
        saveKeyPool(newPool);
        return true;
    }
    return false;
}

// Get the next available key (round-robin with rate limit check)
export function getNextAvailableKey(): string | null {
    const pool = getKeyPool();

    if (pool.length === 0) return null;

    // Find keys that are not rate limited
    const availableKeys = pool.filter(k => !k.isRateLimited);

    if (availableKeys.length === 0) {
        console.warn('All keys are rate limited');
        return null;
    }

    // Get the least recently used key
    availableKeys.sort((a, b) => {
        const aTime = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
        const bTime = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
        return aTime - bTime;
    });

    return availableKeys[0].key;
}

// Mark a key as used (increment counter)
export function markKeyAsUsed(key: string): void {
    const pool = getKeyPool();
    const keyIndex = pool.findIndex(k => k.key === key);

    if (keyIndex !== -1) {
        pool[keyIndex] = {
            ...pool[keyIndex],
            lastUsed: new Date().toISOString(),
            requestsToday: pool[keyIndex].requestsToday + 1,
        };
        saveKeyPool(pool);
    }
}

// Mark a key as rate limited
export function markKeyAsRateLimited(key: string, retryAfterSeconds: number = 60): void {
    const pool = getKeyPool();
    const keyIndex = pool.findIndex(k => k.key === key);

    if (keyIndex !== -1) {
        const expiryTime = new Date();
        expiryTime.setSeconds(expiryTime.getSeconds() + retryAfterSeconds);

        pool[keyIndex] = {
            ...pool[keyIndex],
            isRateLimited: true,
            rateLimitedUntil: expiryTime.toISOString(),
        };
        saveKeyPool(pool);
    }
}

// Get pool statistics
export function getKeyPoolStats(): KeyPoolStats {
    const pool = getKeyPool();

    return {
        totalKeys: pool.length,
        activeKeys: pool.filter(k => !k.isRateLimited).length,
        rateLimitedKeys: pool.filter(k => k.isRateLimited).length,
        totalRequestsToday: pool.reduce((sum, k) => sum + k.requestsToday, 0),
    };
}

// Check if pool has any available keys
export function hasAvailableKeys(): boolean {
    const pool = getKeyPool();
    return pool.some(k => !k.isRateLimited);
}

// Clear all keys (admin action)
export function clearKeyPool(): void {
    saveKeyPool([]);
}

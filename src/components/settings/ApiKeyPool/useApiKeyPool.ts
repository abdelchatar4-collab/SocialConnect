/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Key Pool Management Hook
*/

import { useState, useEffect, useCallback } from 'react';

export interface DbApiKey {
    id: string; key: string; label: string; isActive: boolean;
    lastUsedAt: string | null; requestsToday: number;
    isRateLimited: boolean; rateLimitedUntil: string | null; createdAt: string;
}

export function useApiKeyPool(onPoolChange?: () => void) {
    const [keys, setKeys] = useState<DbApiKey[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDbMode, setIsDbMode] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/api-keys');
            if (res.ok) {
                const data = await res.json();
                setKeys(data);
                setStats({
                    totalKeys: data.length,
                    activeKeys: data.filter((k: any) => !k.isRateLimited && k.isActive).length,
                    totalRequestsToday: data.reduce((sum: number, k: any) => sum + k.requestsToday, 0)
                });
                setIsDbMode(true);
            } else throw new Error();
        } catch {
            setIsDbMode(false);
            const { getKeyPool, getKeyPoolStats } = await import('@/lib/groq-key-pool');
            const lk = getKeyPool();
            setKeys(lk.map((k: any) => ({ id: k.id, key: k.key, label: k.label, isActive: true, requestsToday: k.requestsToday, isRateLimited: k.isRateLimited, createdAt: k.addedAt } as any)));
            setStats(getKeyPoolStats());
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const add = async (key: string, label: string) => {
        if (!key.startsWith('gsk_')) throw new Error('Doit commencer par gsk_');
        if (isDbMode) {
            const res = await fetch('/api/admin/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, label }) });
            if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
        } else {
            const { addKeyToPool } = await import('@/lib/groq-key-pool');
            if (!addKeyToPool(key, label)) throw new Error('Déjà présente');
        }
        refresh(); onPoolChange?.();
    };

    const remove = async (id: string) => {
        if (!confirm('Supprimer cette clé ?')) return;
        if (isDbMode) await fetch(`/api/admin/api-keys?id=${id}`, { method: 'DELETE' });
        else { const { removeKeyFromPool } = await import('@/lib/groq-key-pool'); removeKeyFromPool(id); }
        refresh(); onPoolChange?.();
    };

    return { keys, stats, loading, error, setError, add, remove, refresh };
}

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Gestionnaire Operations
*/

import { UserOperations } from './users';
import { Gestionnaire, API_CONFIG } from '../apiClient.types';

export class GestionnaireOperations extends UserOperations {
    async getGestionnaires(): Promise<Gestionnaire[]> {
        if (this.isLocalStorageMode()) {
            const users = await this.getUsers({ useCache: false });
            const gestionnaires: Gestionnaire[] = [];
            const seen = new Set<string>();

            users.forEach(u => {
                if (u.gestionnaire) {
                    const name = typeof u.gestionnaire === 'string' ? u.gestionnaire : `${u.gestionnaire.prenom} ${u.gestionnaire.nom}`;
                    if (!seen.has(name)) {
                        seen.add(name);
                        gestionnaires.push({ id: this.generateId(), nom: name.split(' ').pop() || '', prenom: name.split(' ').slice(0, -1).join(' ') || name });
                    }
                }
            });

            if (gestionnaires.length === 0) {
                gestionnaires.push({ id: '1', nom: 'Admin', prenom: 'Houssaine' }, { id: '2', nom: 'Admin', prenom: 'Samia' }, { id: '3', nom: 'Admin', prenom: 'Delphine' });
            }
            return gestionnaires;
        }

        const resp = await this.fetchWithTimeout(`${this.baseURL}/api/gestionnaires`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return Array.isArray(data) ? data : data.gestionnaires || [];
    }

    // deleteAllUsers a été supprimé pour des raisons de sécurité

    public clearCache(key?: string): void {
        if (key) localStorage.removeItem(key);
        else Object.keys(localStorage).forEach(k => k.startsWith('gestionUsagers_') && localStorage.removeItem(k));
    }

    async healthCheck(): Promise<boolean> {
        if (this.isLocalStorageMode()) return true;
        try {
            const resp = await this.fetchWithTimeout(`${this.baseURL}/api/health`, { timeout: 3000 });
            return resp.ok;
        } catch { return false; }
    }

    async getStats(): Promise<{ totalUsers: number; totalGestionnaires: number; mode: string }> {
        try {
            const [u, g] = await Promise.all([this.getUsers({ useCache: false }), this.getGestionnaires()]);
            return { totalUsers: u.length, totalGestionnaires: g.length, mode: this.isLocalStorageMode() ? 'localStorage' : 'api' };
        } catch {
            return { totalUsers: 0, totalGestionnaires: 0, mode: this.isLocalStorageMode() ? 'localStorage' : 'api' };
        }
    }
}

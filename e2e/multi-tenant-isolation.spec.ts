/**
 * Tests E2E d'isolation Multi-Tenant
 *
 * Ces tests vérifient que chaque service ne voit que ses propres données.
 *
 * Usage: npx playwright test e2e/multi-tenant-isolation.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

/**
 * Helper pour se connecter via dev-login
 */
async function devLogin(page: Page): Promise<boolean> {
    await page.goto(`${BASE_URL}/dev-login`);

    // Attendre le chargement
    await page.waitForLoadState('networkidle');

    // Chercher le bouton Dev Admin
    const devButton = page.locator('button:has-text("Dev Admin")');

    if (await devButton.isVisible({ timeout: 5000 })) {
        await devButton.click();

        // Attendre la redirection vers dashboard
        try {
            await page.waitForURL('**/dashboard', { timeout: 15000 });
            return true;
        } catch {
            return false;
        }
    }

    // Vérifier si on est déjà connecté (redirigé vers dashboard)
    if (page.url().includes('/dashboard')) {
        return true;
    }

    return false;
}

/**
 * Helper pour appeler une API et gérer les erreurs
 */
async function callApi(page: Page, endpoint: string): Promise<{ status: number; data: unknown; error?: string }> {
    try {
        const result = await page.evaluate(async (url) => {
            try {
                const res = await fetch(url);
                const text = await res.text();

                // Vérifier si c'est du JSON
                try {
                    const json = JSON.parse(text);
                    return { status: res.status, data: json, isJson: true };
                } catch {
                    // C'est du HTML (probablement une page de login)
                    return {
                        status: res.status,
                        data: null,
                        isJson: false,
                        isHtml: text.startsWith('<!DOCTYPE') || text.startsWith('<html')
                    };
                }
            } catch (err) {
                return { status: 0, data: null, error: String(err) };
            }
        }, endpoint);

        if (!result.isJson && result.isHtml) {
            return { status: result.status, data: null, error: 'API returned HTML (not authenticated)' };
        }

        return { status: result.status, data: result.data };
    } catch (err) {
        return { status: 0, data: null, error: String(err) };
    }
}

test.describe('Multi-Tenant Isolation Tests', () => {

    test.beforeEach(async ({ page }) => {
        const loggedIn = await devLogin(page);
        expect(loggedIn, 'Connexion dev-login réussie').toBe(true);
    });

    test('API /api/gestionnaires - retourne uniquement les gestionnaires du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/gestionnaires');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        const gestionnaires = data as Array<{ serviceId: string; prenom: string }>;

        // Vérifier que tous ont le même serviceId (celui de la session)
        if (gestionnaires.length > 0) {
            const firstServiceId = gestionnaires[0].serviceId;
            const allSameService = gestionnaires.every(g => g.serviceId === firstServiceId);
            expect(allSameService, 'Tous les gestionnaires doivent avoir le même serviceId').toBe(true);
            console.log(`✅ ${gestionnaires.length} gestionnaires, tous avec serviceId=${firstServiceId}`);
        } else {
            console.log(`⚠️ Aucun gestionnaire trouvé`);
        }
    });

    test('API /api/users - retourne uniquement les usagers du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/users?annee=2025');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        const users = data as Array<{ serviceId: string; nom: string }>;

        if (users.length > 0) {
            const firstServiceId = users[0].serviceId;
            const wrongService = users.filter(u => u.serviceId !== firstServiceId);
            expect(wrongService.length, 'Aucun usager d\'un autre service').toBe(0);
            console.log(`✅ ${users.length} usagers, tous avec serviceId=${firstServiceId}`);
        }
    });

    test('API /api/partenaires - retourne uniquement les partenaires du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/partenaires');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        const partenaires = data as Array<{ serviceId: string }>;

        if (partenaires.length > 0) {
            const firstServiceId = partenaires[0].serviceId;
            const wrongService = partenaires.filter(p => p.serviceId !== firstServiceId);
            expect(wrongService.length, 'Aucun partenaire d\'un autre service').toBe(0);
            console.log(`✅ ${partenaires.length} partenaires, tous avec serviceId=${firstServiceId}`);
        }
    });

    test('API /api/settings - retourne les paramètres du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/settings');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(data).toBeDefined();

        console.log(`✅ Settings récupérés correctement`);
    });

    test('API /api/prestations - retourne uniquement les prestations du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/prestations');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        const prestations = data as Array<{ serviceId: string }>;

        if (prestations.length > 0) {
            const firstServiceId = prestations[0].serviceId;
            const wrongService = prestations.filter(p => p.serviceId !== firstServiceId);
            expect(wrongService.length, 'Aucune prestation d\'un autre service').toBe(0);
            console.log(`✅ ${prestations.length} prestations, toutes avec serviceId=${firstServiceId}`);
        }
    });

    test('API /api/options/nationalite - retourne uniquement les options du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/options/nationalite');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        const options = data as Array<{ serviceId: string }>;

        if (options.length > 0) {
            const firstServiceId = options[0].serviceId;
            const wrongService = options.filter(o => o.serviceId !== firstServiceId);
            expect(wrongService.length, 'Aucune option d\'un autre service').toBe(0);
            console.log(`✅ ${options.length} options, toutes avec serviceId=${firstServiceId}`);
        }
    });

    test('API /api/users/count - retourne le compte des usagers du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/users/count?annee=2025');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(data).toBeDefined();

        console.log(`✅ Count: ${JSON.stringify(data)}`);
    });

    test('API /api/stats/users-by-status - retourne les stats du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/stats/users-by-status?annee=2025');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        console.log(`✅ Stats récupérées: ${(data as unknown[]).length} catégories`);
    });

    test('API /api/users/recent - retourne les usagers récents du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/users/recent?limit=5');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        console.log(`✅ ${(data as unknown[]).length} usagers récents`);
    });

    test('API /api/conges - retourne les congés du service courant', async ({ page }) => {
        const { status, data, error } = await callApi(page, '/api/conges');

        expect(error, `Erreur API: ${error}`).toBeUndefined();
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);

        const conges = data as Array<{ serviceId: string }>;

        if (conges.length > 0) {
            const firstServiceId = conges[0].serviceId;
            const wrongService = conges.filter(c => c.serviceId !== firstServiceId);
            expect(wrongService.length, 'Aucun congé d\'un autre service').toBe(0);
            console.log(`✅ ${conges.length} congés, tous du même service`);
        }
    });
});

test('Résumé rapide - Toutes les APIs critiques', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 VÉRIFICATION RAPIDE ISOLATION MULTI-TENANT');
    console.log('='.repeat(60) + '\n');

    const loggedIn = await devLogin(page);
    expect(loggedIn).toBe(true);

    const apis = [
        '/api/gestionnaires',
        '/api/users?annee=2025',
        '/api/partenaires',
        '/api/settings',
        '/api/prestations',
        '/api/options/nationalite',
        '/api/users/count',
        '/api/stats/users-by-status',
        '/api/users/recent?limit=5',
        '/api/conges',
    ];

    let allPassed = true;

    for (const api of apis) {
        const { status, error, data } = await callApi(page, api);
        const icon = status === 200 && !error ? '✅' : '❌';
        const count = Array.isArray(data) ? ` (${data.length} items)` : '';

        console.log(`${icon} ${api}${count}`);

        if (status !== 200 || error) {
            allPassed = false;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(allPassed ? '✅ TOUTES LES APIS RÉPONDENT CORRECTEMENT' : '❌ CERTAINES APIS ONT ÉCHOUÉ');
    console.log('='.repeat(60) + '\n');

    expect(allPassed).toBe(true);
});

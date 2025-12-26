import { test, expect } from '@playwright/test';

test('Production Smoke Test - https://pasqweb.org', async ({ page }) => {
    // 1. Navigation & SSL Check
    console.log('🔗 Navigation vers https://pasqweb.org...');
    const response = await page.goto('/');

    // Vérifier que le serveur répond avec succès
    expect(response?.status()).toBe(200);
    console.log('✅ Statut 200 OK');

    // 2. Vérification visuelle & Branding / Protection
    const title = await page.title();
    console.log(`🔍 Titre actuel : "${title}"`);

    const navigationTiming = await page.evaluate(() => performance.timing);
    const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
    console.log(`⏱️ Temps de chargement total : ${loadTime}ms`);

    if (title.includes('Cloudflare Access')) {
        console.log('🛡️  Application protégée par Cloudflare Access. Serveur opérationnel et sécurisé.');
        // On valide que Cloudflare nous demande bien de nous connecter
        await expect(page.locator('body')).toContainText(/Sign in|Cloudflare/i);
        console.log('✅ Interface Cloudflare détectée');
    } else {
        // Si on n'est pas derrière Cloudflare (ex: accès direct ou IP autorisée)
        await expect(page).toHaveTitle(/SocialConnect/);
        console.log('✅ Titre "SocialConnect" détecté');

        const logoContainer = page.locator('div:has-text("SC")').first();
        await expect(logoContainer).toBeVisible();
        console.log('✅ Logo "SC" détecté');

        // 3. Vérification de la page de Login
        const loginButton = page.locator('button:has-text("Se connecter")').or(page.locator('a:has-text("Se connecter")'));
        const devLoginButton = page.locator('button:has-text("Dev Admin")');

        await expect(loginButton.or(devLoginButton)).toBeVisible({ timeout: 10000 });
        console.log('✅ Interface de connexion opérationnelle');

        expect(loadTime).toBeLessThan(5000);
    }
});

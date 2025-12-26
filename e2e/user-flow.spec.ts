import { test, expect } from '@playwright/test';

test('Create User Flow', async ({ page, baseURL }) => {
    // Skip if running against production (Cloudflare protected)
    if (baseURL?.includes('pasqweb.org')) {
        test.skip(true, 'Skipping user flow on production environment');
        return;
    }

    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `Automated${uniqueId}`;
    const lastName = `TestE2E${uniqueId}`;

    test.setTimeout(120000); // 2 minutes timeout

    // 1. Authenticate
    console.log('Navigating to target directly...');
    await page.goto('/users/new');

    // Check if we were redirected to login
    if (page.url().includes('dev-login')) {
        console.log('Redirected to login. Logging in as Dev Admin...');
        const devAdminBtn = page.locator('button', { hasText: 'Dev Admin' });
        // Click if visible, otherwise we might already be logged in or on another page
        if (await devAdminBtn.isVisible()) {
            await devAdminBtn.click();
            // Wait for redirect to happen (away from dev-login)
            await page.waitForURL((url) => !url.toString().includes('dev-login'), { timeout: 30000 });
        }
    }

    // 2. Ensure we are on users/new
    // If login redirected us to dashboard, go to users/new
    if (!page.url().includes('/users/new')) {
        await page.goto('/users/new');
    }
    // Verify we are on the correct page
    await expect(page).toHaveURL(/.*\/users\/new/, { timeout: 60000 });

    // 3. Fill Form Steps

    // Step 1: Identification
    console.log('Step 1: Identification');
    await page.fill('input[id="nom"]', lastName);
    await page.fill('input[id="prenom"]', firstName);
    await page.click('button:has-text("Suivant")');

    // Step 2: Infos personnelles
    console.log('Step 2: Infos personnelles');
    // DateInput expects DD/MM/YYYY text input
    await page.fill('input[id="dateNaissance"]', '01/01/1990');

    // Select Gender (SelectInput)
    await page.selectOption('select[id="genre"]', { index: 1 });

    // Nationalité
    // Wait for options to load (API call)
    await expect(async () => {
        const count = await page.locator('select[id="nationalite"] option').count();
        expect(count).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });
    await page.selectOption('select[id="nationalite"]', { index: 1 });

    // Click Suivant to move to Step 3
    await page.click('button:has-text("Suivant")');

    // Step 3: Gestion
    console.log('Step 3: Gestion');
    // Wait for Etat
    await expect(page.locator('select[id="etat"]')).toBeVisible();
    await page.selectOption('select[id="etat"]', { index: 1 });
    await page.click('button:has-text("Suivant")');

    // Step 4: Logement => Skip
    console.log('Step 4: Logement');
    await page.click('button:has-text("Suivant")');

    // Step 5: Problématiques => Skip
    console.log('Step 5: Problématiques');
    await page.click('button:has-text("Suivant")');

    // Step 6: Notes => Fill simple note
    console.log('Step 6: Notes');
    await page.fill('textarea[id="remarques"]', 'Test E2E Note');

    // Submit
    console.log('Submitting...');
    await page.click('button:has-text("Enregistrer")');

    // 4. Verify Creation
    // Should redirect to /users or /users/[id]
    await page.waitForTimeout(2000);

    // Go to list and search
    await page.goto(`/users?search=${lastName}`);
    await page.waitForTimeout(1000);

    // Click on the first result to verify details
    const userRow = page.getByText(lastName).first();
    await expect(userRow).toBeVisible();
    await userRow.click();

    // Check detail page
    await expect(page).toHaveURL(/\/users\/.+/, { timeout: 10000 });

    // Check detail page - wait for H1 to contain the name
    await expect(page.locator('h1').filter({ hasText: firstName }).first()).toBeVisible({ timeout: 15000 });

    // 5. Delete User (Cleanup)
    console.log('Starting Delete Flow...');

    // Click "Modifier"
    await page.click('a[href*="/edit"]'); // Helper to find edit link
    await page.waitForURL(/\/edit$/);

    // Click "Supprimer"
    await page.click('button:has-text("Supprimer")');

    // Confirm in modal
    // Handle specific custom modal if present or just generic text
    await page.click('button:has-text("Oui, supprimer")');

    // Verify Deletion
    await page.waitForURL(/\/users.*/, { timeout: 30000 });
    expect(page.url()).toContain('/users');
});

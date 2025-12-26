import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
        },
        {
            name: 'production',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'https://pasqweb.org',
            },
        },
    ],
    webServer: process.env.CI_TEST_PROD ? undefined : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
    },
});

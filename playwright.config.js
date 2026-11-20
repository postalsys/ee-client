// End-to-end tests: the client in Chromium against a real EmailEngine (Docker) backed by imapkit
// mail servers that run inside the test process. See test/e2e/README.md.

import { defineConfig, devices } from '@playwright/test';

const HARNESS_PORT = Number(process.env.EE_E2E_HARNESS_PORT) || 7198;

export default defineConfig({
    testDir: 'test/e2e',
    testMatch: '*.spec.js',
    globalSetup: './test/e2e/global-setup.js',
    timeout: 60 * 1000,
    expect: { timeout: 10 * 1000 },
    // Each test has its own mailbox and EmailEngine account, so tests run in parallel
    fullyParallel: true,
    workers: process.env.CI ? 2 : 4,
    retries: process.env.CI ? 1 : 0,
    forbidOnly: !!process.env.CI,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${HARNESS_PORT}`,
        viewport: { width: 1440, height: 900 },
        locale: 'en-US',
        timezoneId: 'UTC',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
    }
});

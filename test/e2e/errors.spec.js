import { test, expect } from './fixtures.js';

test.describe('failed requests', () => {
    test('says when the server cannot be reached and offers Retry', async ({ app, page }) => {
        await app.start({ apiUrl: 'http://127.0.0.1:9' }, { waitForList: false });
        const sidebar = page.locator('.ee-folder-tree .ee-error');
        await expect(sidebar.locator('.ee-error-title')).toHaveText('Folders unavailable');
        await expect(sidebar.locator('.ee-error-detail')).toHaveText('Could not reach the EmailEngine server at http://127.0.0.1:9');
        await expect(sidebar.locator('.ee-error-retry')).toBeVisible();
        await expect(page.locator('.ee-message-list .ee-error-title')).toHaveText('Folders unavailable');
    });

    test('reports a rejected access token', async ({ app, page }) => {
        await app.start({ accessToken: 'f'.repeat(64) }, { waitForList: false });
        await expect(page.locator('.ee-folder-tree .ee-error-detail')).toContainText(/token/i);
    });

    test('recovers from a failed listing with Retry', async ({ app, page }) => {
        let failed = false;
        await page.route('**/messages?**', async route => {
            if (!failed) {
                failed = true;
                return route.fulfill({
                    status: 503,
                    contentType: 'application/json',
                    body: JSON.stringify({ statusCode: 503, error: 'Service Unavailable', message: 'Requested account is not yet initialized' })
                });
            }
            return route.continue();
        });
        await app.start({}, { waitForList: false });
        const list = page.locator('.ee-message-list');
        await expect(list.locator('.ee-error-detail')).toHaveText('Requested account is not yet initialized');
        await list.locator('.ee-error-retry').click();
        await expect(app.listItem('Quarterly report')).toBeVisible();
    });

    test('says a deep-linked message does not exist', async ({ app, page }) => {
        await app.start({ message: 'AAAAAQAAB9A' }, { waitForList: false });
        await expect(page.locator('.ee-message-viewer .ee-error-title')).toHaveText('Message not found');
        await app.waitForList();
        await expect(page.locator('.ee-message-list .ee-pane-title')).toHaveText('Inbox');
    });

    test('reports a failed action instead of doing nothing', async ({ app, page }) => {
        await app.start();
        await app.openMessage('Welcome aboard');
        await page.route('**/message/*/move', route =>
            route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ statusCode: 500, message: 'Move failed on the server' }) })
        );
        await app.viewerButton('move').selectOption('Archive');
        await expect.poll(async () => (await app.dialogs()).at(-1)).toMatchObject({ kind: 'alert', message: 'Move failed on the server' });
        await expect(app.listItem('Welcome aboard')).toHaveCount(1);
    });
});

// How the client fits into a host page: dark mode, navigation callbacks, deep links, notices and
// teardown

import { test, expect } from './fixtures.js';

test.describe('host integration', () => {
    test('toggles dark mode and remembers the choice', async ({ app, page }) => {
        await app.start();
        await page.locator('.ee-dark-mode-toggle').click();
        await expect(page.locator('.ee-client')).toHaveClass(/ee-dark-mode/);
        expect(await page.evaluate(() => localStorage.getItem('ee-client-dark-mode'))).toBe('true');

        await page.evaluate(() => window.client.destroy());
        await app.start();
        await expect(page.locator('.ee-client')).toHaveClass(/ee-dark-mode/);
    });

    test('a host-driven theme hides the toggle and follows setDarkMode', async ({ app, page }) => {
        await app.start({ darkMode: false, showDarkModeToggle: false });
        await expect(page.locator('.ee-dark-mode-toggle')).toHaveCount(0);
        await page.evaluate(() => window.client.setDarkMode(true));
        await expect(page.locator('.ee-client')).toHaveClass(/ee-dark-mode/);
        expect(await page.evaluate(() => localStorage.getItem('ee-client-dark-mode'))).toBeNull();
    });

    test('tells the host which folder and message are open', async ({ app, page, mailbox }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        const id = await mailbox.messageId('INBOX', 'Quarterly report');
        const navigations = await page.evaluate(() => window.__navigations);
        expect(navigations).toContainEqual({ path: 'INBOX', messageId: null });
        expect(navigations.at(-1)).toEqual({ path: 'INBOX', messageId: id });
    });

    test('opens a deep-linked message with its folder', async ({ app, page, mailbox }) => {
        const id = await mailbox.messageId('Drafts', 'Unfinished proposal');
        await app.start({ message: id }, { waitForList: false });
        await expect(page.locator('.ee-message-title')).toHaveText('Unfinished proposal');
        await app.waitForList();
        await expect(page.locator('.ee-message-list .ee-pane-title')).toHaveText('Drafts');
    });

    test('ready resolves once the first view has loaded', async ({ app, page }) => {
        await app.start({}, { waitForList: false });
        expect(await page.evaluate(() => window.client.ready)).toBe(true);
        await expect(app.listItem('Quarterly report')).toBeVisible();
    });

    test('ready resolves false when the first view could not load, and onError says why', async ({ app, page }) => {
        await app.start({ apiUrl: 'http://127.0.0.1:9' }, { waitForList: false });
        expect(await page.evaluate(() => window.client.ready)).toBe(false);
        expect(await page.evaluate(() => window.__events)).toContainEqual(
            expect.objectContaining({ name: 'error', action: 'loadFolders', description: 'Failed to load the folders' })
        );
    });

    test('tells the host about sent messages, saved drafts and failed requests', async ({ app, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        await app.compose.locator('[name="to"]').fill('jane@example.com');
        await app.compose.locator('[name="subject"]').fill('Events');
        await app.compose.locator('.ee-compose-editor').fill('Hello');
        await app.compose.locator('.ee-compose-save-draft').click();
        await expect(page.locator('.ee-toast')).toHaveText('Draft saved.');

        await page.locator('.ee-sidebar-compose-button').click();
        await app.compose.locator('[name="to"]').fill('jane@example.com');
        await app.compose.locator('.ee-compose-editor').fill('Hello again');
        await app.compose.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        await page.route('**/messages?**', route =>
            route.fulfill({ status: 500, contentType: 'application/json', body: '{"statusCode":500,"message":"Boom"}' })
        );
        await app.folder('Archive').click();
        await expect(page.locator('.ee-message-list .ee-error')).toBeVisible();

        const events = await page.evaluate(() => window.__events);
        expect(events.map(event => event.name)).toEqual(['draftSaved', 'messageSent', 'error']);
        expect(events[0].path).toBe('Drafts');
        expect(events[1].queueId).toBeTruthy();
        expect(events[2]).toMatchObject({ action: 'loadMessages', statusCode: 500 });
    });

    test('shows notices from the host', async ({ app, page }) => {
        await app.start();
        await page.evaluate(() => window.client.notify('Settings saved.'));
        await expect(page.locator('.ee-toast')).toHaveText('Settings saved.');
        await expect(page.locator('.ee-toast')).toHaveClass(/show/);
    });

    test('destroy removes the stylesheet and stops reacting', async ({ app, page }) => {
        await app.start();
        const styles = () => page.evaluate(() => document.head.querySelectorAll('style').length);
        const before = await styles();
        await page.evaluate(() => window.client.destroy());
        expect(await styles()).toBe(before - 1);
        // the Escape handler is gone with it
        await page.keyboard.press('Escape');
    });
});

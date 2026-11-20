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

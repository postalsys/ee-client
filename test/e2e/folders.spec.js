import { test, expect } from './fixtures.js';
import { XSS } from './seed.js';

test.describe('folders', () => {
    test('lists special-use folders first, then the nested tree', async ({ app, page }) => {
        await app.start();
        const names = await page.locator('.ee-folder-item .ee-folder-name').allTextContents();
        expect(names.map(name => name.trim())).toEqual(['INBOX', 'Drafts', 'Sent', 'Trash', 'Junk', 'Archive', XSS.folder, 'Projects', '2026']);
        await expect(app.folder('2026')).toHaveAttribute('data-depth', '1');
        await expect(app.folder('INBOX')).toHaveClass(/active/);
    });

    test('opens the inbox on start and switches folders', async ({ app, page }) => {
        await app.start();
        await expect(page.locator('.ee-message-list .ee-pane-title')).toHaveText('INBOX');
        await expect(app.listItem('Quarterly report')).toBeVisible();

        await app.openFolder('Drafts');
        await expect(app.listItem('Unfinished proposal')).toBeVisible();
        await expect(app.folder('Drafts')).toHaveClass(/active/);

        await app.openFolder('Trash');
        await expect(page.locator('.ee-message-list .ee-empty-state')).toBeVisible();
    });

    test('renders a hostile folder name as text', async ({ app }) => {
        await app.start();
        await expect(app.folder(XSS.folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).toBeVisible();
        await app.folder(XSS.folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).hover();
    });
});

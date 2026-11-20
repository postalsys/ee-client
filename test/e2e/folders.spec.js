import { test, expect } from './fixtures.js';
import { XSS } from './seed.js';

test.describe('folders', () => {
    test('lists special-use folders first, then the nested tree', async ({ app, page }) => {
        await app.start();
        const names = await page.locator('.ee-folder-item .ee-folder-name').allTextContents();
        expect(names.map(name => name.trim())).toEqual(['Inbox', 'Drafts', 'Sent', 'Trash', 'Junk', 'Archive', XSS.folder, 'Projects', '2026']);
        await expect(app.folder('2026')).toHaveAttribute('data-depth', '1');
        await expect(app.folder('Inbox')).toHaveClass(/active/);
    });

    test('shows unread counts and keeps them in step with reading', async ({ app }) => {
        await app.start();
        const count = app.folder('Inbox').locator('.ee-folder-count');
        await expect(count).toHaveText('5');
        await expect(app.folder('Inbox').locator('.ee-folder-content')).toHaveAttribute('aria-label', 'Inbox, 5 unread');
        await expect(app.folder('Drafts').locator('.ee-folder-count')).toHaveCount(0);

        await app.openMessage('Quarterly report');
        await expect(count).toHaveText('4');
        await app.viewerButton('toggle-read').click();
        await expect(count).toHaveText('5');
    });

    test('opens folders from the keyboard', async ({ app, page }) => {
        await app.start();
        await app.folder('Drafts').locator('.ee-folder-content').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.ee-message-list .ee-pane-title')).toHaveText('Drafts');
        await expect(app.folder('Drafts').locator('.ee-folder-content')).toHaveAttribute('aria-current', 'true');
    });

    test('opens the inbox on start and switches folders', async ({ app, page }) => {
        await app.start();
        await expect(page.locator('.ee-message-list .ee-pane-title')).toHaveText('Inbox');
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

import { test, expect } from './fixtures.js';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe('phone layout', () => {
    test('moves between folders, list and message one pane at a time', async ({ app, page }) => {
        await app.start();
        const client = page.locator('.ee-client');
        await expect(client).toHaveAttribute('data-view', 'list');
        await expect(page.locator('.ee-sidebar')).toBeHidden();

        await page.locator('.ee-message-list [data-action="show-folders"]').click();
        await expect(client).toHaveAttribute('data-view', 'folders');
        await expect(page.locator('.ee-sidebar')).toBeVisible();

        await app.folder('Drafts').click();
        await expect(client).toHaveAttribute('data-view', 'list');
        await expect(app.listItem('Unfinished proposal')).toBeVisible();

        await app.openMessage('Unfinished proposal');
        await expect(client).toHaveAttribute('data-view', 'message');
        await expect(page.locator('.ee-message-list')).toBeHidden();

        await page.locator('.ee-message-viewer [data-action="back-to-list"]').click();
        await expect(client).toHaveAttribute('data-view', 'list');
    });

    test('offers compose from a floating button', async ({ app, page }) => {
        await app.start();
        const button = page.locator('.ee-compose-button');
        await expect(button).toBeVisible();
        await button.click();
        await expect(app.compose).toBeVisible();
        const box = await app.compose.boundingBox();
        expect(box.width).toBeLessThanOrEqual(390);
    });
});

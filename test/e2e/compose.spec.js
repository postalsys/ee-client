import { test, expect } from './fixtures.js';

test.describe('compose', () => {
    test('sends a new message with Cc, Bcc and an attachment', async ({ app, mailbox, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        const dialog = app.compose;
        await expect(dialog).toBeVisible();
        await dialog.locator('[name="to"]').fill('"Doe, Jane" <jane@example.com>, bob@example.com');
        await dialog.locator('[data-action="show-cc"]').click();
        await dialog.locator('[name="cc"]').fill('carol@example.com');
        await dialog.locator('[name="bcc"]').fill('hidden@example.com');
        await dialog.locator('[name="subject"]').fill('Lunch on Friday');
        await dialog.locator('[name="message"]').fill('Shall we meet at noon?');
        await dialog.locator('.ee-compose-file-input').setInputFiles({ name: 'menu.txt', mimeType: 'text/plain', buffer: Buffer.from('Soup of the day') });
        await expect(dialog.locator('.ee-compose-chip-name')).toHaveText('menu.txt');
        await dialog.locator('.ee-compose-send').click();

        await expect(dialog).toBeHidden();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const sent = await mailbox.waitForMessage('INBOX', 'Subject: Lunch on Friday');
        expect(sent.source).toMatch(/To: "Doe, Jane" <jane@example.com>, bob@example.com/);
        expect(sent.source).toContain('Cc: carol@example.com');
        expect(sent.source).not.toMatch(/^Bcc:/m);
        expect(sent.source).toContain('filename=menu.txt');
        expect(sent.source).toContain(Buffer.from('Soup of the day').toString('base64'));
        await mailbox.waitForMessage('Sent', 'Subject: Lunch on Friday');
    });

    test('refuses to send without a recipient, with a bad address, or without text', async ({ app, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        const dialog = app.compose;
        const error = dialog.locator('.ee-compose-error');

        await dialog.locator('.ee-compose-send').click();
        await expect(error).toHaveText('Add at least one recipient.');
        await expect(dialog.locator('[name="to"]')).toHaveAttribute('aria-invalid', 'true');

        await dialog.locator('[name="to"]').fill('Jane Doe');
        await dialog.locator('.ee-compose-send').click();
        await expect(error).toHaveText('Not a valid email address: Jane Doe');

        await dialog.locator('[name="to"]').fill('jane@example.com');
        await dialog.locator('.ee-compose-send').click();
        await expect(error).toHaveText('Write a message before sending.');
        await expect(dialog).toBeVisible();
    });

    test('saves a draft to the Drafts folder', async ({ app, mailbox, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        const dialog = app.compose;
        await dialog.locator('[name="to"]').fill('jane@example.com');
        await dialog.locator('[name="subject"]').fill('Half-written');
        await dialog.locator('[name="message"]').fill('To be continued');
        await dialog.locator('.ee-compose-save-draft').click();
        await expect(dialog).toBeHidden();
        await expect(page.locator('.ee-toast')).toHaveText('Draft saved to the Drafts folder.');

        const draft = await mailbox.waitForMessage('Drafts', 'Subject: Half-written');
        expect(draft.flags).toContain('\\Draft');
        expect(draft.source).toContain('From: Test User <testuser@example.com>');
    });

    test('closes with Escape and keeps nothing', async ({ app, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        await app.compose.locator('[name="subject"]').fill('Gone');
        await page.keyboard.press('Escape');
        await expect(app.compose).toBeHidden();
        await page.locator('.ee-sidebar-compose-button').click();
        await expect(app.compose.locator('[name="subject"]')).toHaveValue('');
    });
});

import { decodePart } from './mime.js';
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
        await dialog.locator('.ee-compose-editor').fill('Shall we meet at noon?');
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
        await dialog.locator('.ee-compose-editor').fill('To be continued');
        await dialog.locator('.ee-compose-save-draft').click();
        await expect(dialog).toBeHidden();
        await expect(page.locator('.ee-toast')).toHaveText('Draft saved.');

        const draft = await mailbox.waitForMessage('Drafts', 'Subject: Half-written');
        expect(draft.flags).toContain('\\Draft');
        expect(draft.source).toContain('From: Test User <testuser@example.com>');
    });

    test('closes an untouched form with Escape without asking', async ({ app, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        await expect(app.compose).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(app.compose).toBeHidden();
        expect(await app.dialogs()).toEqual([]);
    });
});

test.describe('compose panel', () => {
    test('stays docked beside the message, can be minimized and restored', async ({ app }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('reply').click();
        const dialog = app.compose;
        await expect(dialog).toBeVisible();
        const box = await dialog.boundingBox();
        expect(box.x + box.width).toBeGreaterThan(1400);
        expect(box.y + box.height).toBeCloseTo(900, 0);

        // no backdrop: the list stays usable while the reply is open
        await app.openMessage('Welcome aboard');
        await expect(dialog).toBeVisible();

        await dialog.locator('[data-action="minimize"]').click();
        await expect(dialog).toHaveClass(/minimized/);
        await expect(dialog.locator('.ee-compose-form')).toBeHidden();
        await dialog.locator('.ee-compose-title').click();
        await expect(dialog.locator('.ee-compose-form')).toBeVisible();
    });

    test('asks to save an unsaved message on close and saves it as a draft', async ({ app, mailbox, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        await app.compose.locator('[name="subject"]').fill('Not finished');
        await app.compose.locator('.ee-compose-editor').fill('Half a thought');
        await app.answerDialogs(true);
        await app.compose.locator('[data-action="close"]').click();
        await expect(app.compose).toBeHidden();
        expect((await app.dialogs())[0]).toMatchObject({ kind: 'confirm', title: 'Unsaved message' });
        await mailbox.waitForMessage('Drafts', 'Subject: Not finished');
        await expect(page.locator('.ee-toast')).toHaveText('Draft saved.');
    });

    test('discards an unsaved message when asked to', async ({ app, mailbox, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        await app.compose.locator('[name="subject"]').fill('Throwaway');
        await app.answerDialogs(false);
        await page.keyboard.press('Escape');
        await expect(app.compose).toBeHidden();
        expect(mailbox.messages('Drafts').some(m => m.source.includes('Throwaway'))).toBe(false);
    });

    test('asks before replacing an unsaved message with a reply', async ({ app }) => {
        await app.start();
        await app.page.locator('.ee-sidebar-compose-button').click();
        await app.compose.locator('[name="subject"]').fill('First thoughts');
        await app.openMessage('Quarterly report');
        await app.answerDialogs(false);
        await app.viewerButton('reply').click();
        await expect(app.compose.locator('[name="subject"]')).toHaveValue('Re: Quarterly report');
        expect((await app.dialogs()).map(d => d.title)).toEqual(['Unsaved message']);
    });

    test('fills the screen on a phone', async ({ app, page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await app.start();
        await page.locator('.ee-compose-button').click();
        const box = await app.compose.boundingBox();
        expect(box).toMatchObject({ x: 0, y: 0, width: 390, height: 844 });
    });
});

test.describe('rich text', () => {
    test('sends bold, lists and links with a plain-text alternative', async ({ app, mailbox, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        const dialog = app.compose;
        await dialog.locator('[name="to"]').fill('jane@example.com');
        await dialog.locator('[name="subject"]').fill('Formatted');
        const editor = dialog.locator('.ee-compose-editor');
        await editor.click();
        await dialog.locator('[data-command="bold"]').click();
        await expect(dialog.locator('[data-command="bold"]')).toHaveAttribute('aria-pressed', 'true');
        await page.keyboard.type('Important');
        await dialog.locator('[data-command="bold"]').click();
        await page.keyboard.press('Enter');
        await dialog.locator('[data-command="insertUnorderedList"]').click();
        await page.keyboard.type('first point');
        await page.keyboard.press('Enter');
        await page.keyboard.type('second point');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
        await dialog.locator('.ee-compose-toolbar [data-action="link"]').click();
        await dialog.locator('[name="link"]').fill('example.com/docs');
        await dialog.locator('[data-action="insert-link"]').click();
        await expect(editor.locator('a')).toHaveAttribute('href', 'https://example.com/docs');
        await dialog.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const sent = await mailbox.waitForMessage('INBOX', 'Subject: Formatted');
        const html = decodePart(sent.source, 'text/html');
        expect(html).toMatch(/<b>Important<\/b>/);
        expect(html).toContain('<ul><li>first point</li><li>second point</li></ul>');
        expect(html).toContain('<a href="https://example.com/docs">');
        const text = decodePart(sent.source, 'text/plain');
        expect(text).toContain('Important');
        expect(text).toContain('- first point\r\n- second point');
        expect(text).toContain('example.com/docs');
    });

    test('filters pasted HTML down to plain formatting', async ({ app, page }) => {
        await app.start();
        await page.locator('.ee-sidebar-compose-button').click();
        const editor = app.compose.locator('.ee-compose-editor');
        await editor.click();
        await editor.evaluate(el => {
            const data = new DataTransfer();
            data.setData(
                'text/html',
                '<style>p{color:red}</style><p onclick="window.__xss=10" style="color:red">Hello <b>bold</b> <img src=x onerror="window.__xss=11">' +
                    '<a href="javascript:window.__xss=12">bad link</a> <a href="https://example.com" target="_blank">good link</a></p><script>window.__xss=13</script>' +
                    '<iframe src="https://example.com"></iframe><table><tr><td>cell</td></tr></table>'
            );
            el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
        });
        const html = await editor.innerHTML();
        expect(html).toContain('<b>bold</b>');
        expect(html).toContain('<a href="https://example.com">good link</a>');
        expect(html).toContain('<a>bad link</a>');
        expect(html).toContain('cell');
        expect(html).not.toMatch(/<(img|script|style|iframe|table)|onclick|onerror|style=|javascript:|target=/);
    });
});

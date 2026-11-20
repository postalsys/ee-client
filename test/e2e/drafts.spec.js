import { test, expect } from './fixtures.js';
import { waitFor } from './mailbox.js';
import { buildMessage, standardStorage } from './seed.js';
import { headerOf } from './mime.js';

test.describe('drafts', () => {
    test('sends a stored draft and removes it from Drafts', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openFolder('Drafts');
        await app.openMessage('Unfinished proposal');
        await expect(app.viewerButton('reply')).toHaveCount(0);
        await app.viewerButton('send-draft').click();
        await expect(page.locator('.ee-toast')).toHaveText('Draft queued for delivery.');

        const sent = await mailbox.waitForMessage('INBOX', 'Subject: Unfinished proposal');
        expect(sent.source).toMatch(/^To: "?Carol Chen"? <carol@example.com>/m);
        await waitFor(() => !mailbox.messages('Drafts').some(m => m.source.includes('Unfinished proposal')), { message: 'the draft to go' });
    });
});

test.describe('editing drafts', () => {
    test('reopens a draft, saves the new version and removes the old one', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openFolder('Drafts');
        await app.openMessage('Unfinished proposal');
        await app.viewerButton('edit-draft').click();
        const dialog = app.compose;
        await expect(dialog.locator('.ee-compose-title')).toHaveText('Draft');
        await expect(dialog.locator('[name="to"]')).toHaveValue(/Carol Chen <carol@example.com>/);
        await expect(dialog.locator('.ee-compose-editor')).toContainText('Draft text that is not finished yet');

        await dialog.locator('[name="subject"]').fill('Finished proposal');
        await dialog.locator('.ee-compose-save-draft').click();
        await expect(page.locator('.ee-toast')).toHaveText('Draft saved.');

        await waitFor(() => mailbox.messages('Drafts').length === 1 && mailbox.messages('Drafts')[0].source.includes('Subject: Finished proposal'), {
            message: 'the draft to be replaced'
        });
        await expect(app.listItem('Finished proposal')).toBeVisible();
        await expect(app.listItem('Unfinished proposal')).toHaveCount(0);
    });

    test('sends an edited draft and removes it from Drafts', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openFolder('Drafts');
        await app.openMessage('Unfinished proposal');
        await app.viewerButton('edit-draft').click();
        await app.compose.locator('.ee-compose-editor').fill('Here is the finished proposal.');
        await app.compose.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const sent = await mailbox.waitForMessage('INBOX', 'Subject: Unfinished proposal');
        expect(sent.source).toContain('Here is the finished proposal.');
        await waitFor(() => mailbox.messages('Drafts').length === 0, { message: 'the draft to go' });
    });

    test('keeps a reply in its thread through a saved draft', async ({ app, mailbox, page }) => {
        await app.start();
        await app.openMessage('Quarterly report');
        await app.viewerButton('reply').click();
        await app.compose.locator('.ee-compose-editor').fill('Let me check the numbers first.');
        await app.compose.locator('.ee-compose-save-draft').click();
        await expect(page.locator('.ee-toast')).toHaveText('Draft saved.');

        await app.openFolder('Drafts');
        await app.openMessage('Re: Quarterly report');
        await app.viewerButton('edit-draft').click();
        // the quote of the original came along into the draft
        await expect(app.compose.locator('.ee-compose-editor blockquote')).toContainText('The Q3 report');
        await app.compose.locator('.ee-compose-send').click();
        await expect(page.locator('.ee-toast')).toHaveText('Message queued for delivery.');

        const original = mailbox.messages('INBOX').find(m => m.source.includes('Subject: Quarterly report'));
        const sent = await mailbox.waitForMessage('INBOX', msg => msg.source.includes('Subject: Re: Quarterly report') && msg.uid !== original.uid);
        expect(headerOf(sent.source, 'In-Reply-To')).toBe(headerOf(original.source, 'Message-ID'));
        expect(sent.source).toContain('Let me check the numbers first.');
    });

    test.describe('with a hostile draft', () => {
        test.use({
            storage: standardStorage({
                Drafts: [
                    {
                        raw: buildMessage({
                            subject: 'Booby-trapped draft',
                            to: [{ address: 'x@example.com' }],
                            html: '<p>Keep <b>this</b></p><img src=x onerror="window.__xss=20"><script>window.__xss=21</script><a href="javascript:window.__xss=22">x</a><div onmouseover="window.__xss=23">hover</div>'
                        }),
                        flags: ['\\Draft']
                    }
                ]
            })
        });

        test('opens it in the editor with only plain formatting left', async ({ app }) => {
            await app.start();
            await app.openFolder('Drafts');
            await app.openMessage('Booby-trapped draft');
            await app.viewerButton('edit-draft').click();
            const editor = app.compose.locator('.ee-compose-editor');
            await expect(editor).toContainText('Keep this');
            await editor.locator('div', { hasText: 'hover' }).hover();
            const html = await editor.innerHTML();
            expect(html).toContain('<b>this</b>');
            expect(html).not.toMatch(/<(img|script)|onerror|onmouseover|javascript:/);
        });
    });
});

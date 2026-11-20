// Playwright fixtures for the e2e specs.
//
// - mailbox: a fresh imapkit server registered as a new EmailEngine account (see mailbox.js).
//   test.use({ storage }) replaces the standard folders and messages.
// - app: the harness page with the browser clock fixed to NOW. app.start(options) creates the
//   client against the mailbox. After every test the fixture checks that no script injected
//   through test mail ran (window.__xss) and that the page threw nothing.

import { test as base, expect } from '@playwright/test';
import { Mailbox } from './mailbox.js';
import { NOW } from './seed.js';

class App {
    constructor(page, mailbox) {
        this.page = page;
        this.mailbox = mailbox;
        this.pageErrors = [];
        this.consoleErrors = [];
    }

    // Creates the client and waits for the inbox listing (or a deep-linked message)
    async start(options = {}, { waitForList = true } = {}) {
        const { page, mailbox } = this;
        await page.evaluate(opts => window.startClient(opts), {
            apiUrl: mailbox.apiUrl,
            account: mailbox.account,
            accessToken: mailbox.token,
            ...options
        });
        if (waitForList) {
            await this.waitForList();
        }
    }

    // Waits until a folder listing (not a placeholder or a loading state) is on screen
    async waitForList() {
        await this.page.waitForFunction(
            () => window.client.currentFolder && !document.querySelector('.ee-message-list .ee-loading') && document.querySelector('.ee-folder-item')
        );
    }

    listItem(subject) {
        return this.page.locator('.ee-message-item', { has: this.page.locator('.ee-message-subject-text', { hasText: subject }) });
    }

    folder(name) {
        return this.page.locator('.ee-folder-item', { has: this.page.locator('.ee-folder-name', { hasText: new RegExp(`^${name}$`) }) });
    }

    async openFolder(name) {
        // the one-pane (phone) layout keeps the folders behind a button
        const nav = this.page.locator('.ee-message-list [data-action="show-folders"]');
        if (!(await this.folder(name).isVisible()) && (await nav.isVisible())) {
            await nav.click();
        }
        await this.folder(name).click();
        await expect(this.page.locator('.ee-message-list .ee-pane-title')).toHaveText(name);
        await expect(this.page.locator('.ee-message-list .ee-loading')).toHaveCount(0);
    }

    async openMessage(subject) {
        await this.listItem(subject).first().click();
        await expect(this.page.locator('.ee-message-title')).toHaveText(subject);
    }

    viewerButton(action) {
        return this.page.locator(`.ee-message-viewer [data-action="${action}"]`);
    }

    get compose() {
        return this.page.locator('.ee-compose-dialog');
    }

    dialogs() {
        return this.page.evaluate(() => window.__dialogs);
    }

    // Answers for the next confirm/alert calls, in order (true when none is queued)
    answerDialogs(...answers) {
        return this.page.evaluate(list => window.__dialogAnswers.push(...list), answers);
    }
}

export const test = base.extend({
    // Folders and messages of the test mailbox, in the shape of the imapkit storage option
    storage: [null, { option: true }],

    // eslint-disable-next-line no-empty-pattern -- Playwright requires the object pattern here
    stack: [async ({}, use) => use({ apiUrl: process.env.EE_E2E_API_URL, token: process.env.EE_E2E_TOKEN }), { scope: 'worker' }],

    mailbox: async ({ stack, storage }, use) => {
        const mailbox = await new Mailbox({ ...stack, storage }).start();
        await use(mailbox);
        await mailbox.stop();
    },

    app: async ({ page, mailbox }, use) => {
        const app = new App(page, mailbox);
        page.on('pageerror', error => app.pageErrors.push(error.message));
        page.on('console', msg => msg.type() === 'error' && app.consoleErrors.push(msg.text()));
        await page.clock.setFixedTime(NOW);
        await page.goto('/test/e2e/harness.html');
        await page.waitForFunction(() => window.__harnessReady);

        await use(app);

        expect(await page.evaluate(() => window.__xss), 'script from test mail ran').toBeUndefined();
        expect(app.pageErrors, 'uncaught page errors').toEqual([]);
        await page.evaluate(() => window.client && window.client.destroy());
    }
});

export { expect };

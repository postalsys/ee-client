# End-to-end tests

The client runs in Chromium against a real EmailEngine. Each test gets its own mail server and
EmailEngine account, so tests run in parallel and leave nothing behind.

```
npm run test:e2e:install   # once: Playwright's Chromium
npm run test:e2e           # the whole suite
npx playwright test compose --headed
```

Docker must be running. Nothing else is needed: no license, no secrets and no outside mail
service.

## How it fits together

- `global-setup.js` starts Redis and EmailEngine in Docker (`stack.js`) and a static server for
  `harness.html` on `127.0.0.1:7198` (`serve.js`). EmailEngine runs unlicensed: its IMAP and
  submit workers keep running until the first license check, 20 minutes after boot, and every run
  starts fresh containers.
- `mailbox.js` starts an [imapkit](https://github.com/postalsys/imapkit) server per test, inside
  the test process, and registers it as a new EmailEngine account. EmailEngine reaches it through
  `host.docker.internal`. imapkit's SMTP sink appends everything EmailEngine sends to the INBOX of
  the same server, which is how tests read back sent MIME (`mailbox.waitForMessage()`).
- `seed.js` builds the test mail. The browser clock is fixed to `NOW`, and every message is dated
  relative to it.
- `fixtures.js` gives each test `mailbox` and `app`. `test.use({ storage })` replaces the folders
  and messages. After every test the fixture fails it if script from test mail ran
  (`window.__xss`) or the page threw.
- The checkout's `index.js` is mounted over EmailEngine's `static/js/ee-client.js`, so
  `embed.spec.js` tests the client inside EmailEngine's own admin page.

## Settings

| Variable              | Default                         | What it changes                                          |
| --------------------- | ------------------------------- | -------------------------------------------------------- |
| `EE_E2E_IMAGE`        | `postalsys/emailengine:v2.89.0` | The EmailEngine image, e.g. `postalsys/emailengine:edge` |
| `EE_E2E_HARNESS_PORT` | `7198`                          | Port of the harness page                                 |
| `EE_E2E_MAIL_HOST`    | `127.0.0.1`, `0.0.0.0` on Linux | Interface the imapkit servers listen on                  |
| `EE_E2E_LOGS`         | unset                           | Print the EmailEngine log after the run                  |

## Screenshots for design review

`npm run screenshots` captures every screen at desktop, tablet and phone widths in light and dark
mode into `screenshots/`. It is not part of the test run.

# @postalsys/ee-client

Client library for [EmailEngine](https://emailengine.app/) that works in both the browser and Node.js.

It wraps the EmailEngine REST API (`/v1/account/...`) so you can list folders, read and search messages, change flags, move and delete messages, download attachments, and send mail. When you also give it a DOM element, it renders a complete, self-contained webmail interface (folder tree, paginated message list, message viewer, compose modal, dark mode) into that element.

This is the same client that powers the built-in message browser in the EmailEngine admin UI.

## About EmailEngine

[EmailEngine](https://emailengine.app/) is a headless email client application that exposes IMAP, SMTP, Gmail API, and Microsoft Graph API accounts through a single unified REST API and webhooks. This library talks to that REST API - you need a running EmailEngine instance to use it.

- Website: https://emailengine.app/
- API reference: https://api.emailengine.app/
- Documentation: https://docs.emailengine.app/

Note that EmailEngine (the server) is commercial software and requires a subscription; this client library is MIT-licensed.

## Installation

```bash
npm install @postalsys/ee-client
```

This package is **ES modules only** (`"type": "module"`). Import it with `import`; `require()` will not work.

It has **no runtime dependencies** and uses the platform `fetch`:

- In the browser and on Node.js 18+, the global `fetch` is used automatically.
- On older Node.js (14-17), install [`node-fetch`](https://www.npmjs.com/package/node-fetch) as a fallback:

    ```bash
    npm install node-fetch
    ```

## Quick start

### Browser (embedded webmail UI)

Pass a `container` element and the client renders a full webmail UI into it and loads the inbox automatically:

```html
<div id="email-client" style="height: 600px;"></div>
<script type="module">
    import { EmailEngineClient } from '@postalsys/ee-client';

    const client = new EmailEngineClient({
        apiUrl: 'https://your-emailengine-server.example.com',
        account: 'your-account-id',
        accessToken: 'your-access-token',
        container: document.getElementById('email-client')
    });
</script>
```

Because the browser talks to EmailEngine directly, use a short-lived, account-scoped token here (see [Authentication](#authentication)) - never a root or admin token.

### Node.js (API client, no UI)

Omit `container` to use the client purely as an API wrapper:

```javascript
import { EmailEngineClient } from '@postalsys/ee-client';

const client = new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.example.com',
    account: 'your-account-id',
    accessToken: 'your-access-token'
});

// List folders
const folders = await client.loadFolders();

// Load messages from INBOX
const { messages, nextPageCursor } = await client.loadMessages('INBOX');

// Load a single message (its HTML is returned pre-processed for safe display)
const message = await client.loadMessage(messages[0].id);

// Send a message
await client.sendMessage({ to: 'user@example.com', subject: 'Hello', text: 'Sent from ee-client' });

// Release the keep-alive timer when done (see destroy() below)
client.destroy();
```

## Authentication

Every request is sent to EmailEngine with an `Authorization: Bearer <accessToken>` header. Tokens are scoped to a single account, so create one token per account you expose. There are two kinds of tokens you can pass as `accessToken`:

### Access tokens

Provision a long-lived, account-scoped access token with the `api` scope through the EmailEngine admin UI, or via the API:

```bash
curl -XPOST "https://your-emailengine-server.example.com/v1/token" \
  -H "Authorization: Bearer <root-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "account": "your-account-id",
    "description": "Webmail client",
    "scopes": ["api"]
  }'
```

The response contains a `token` string to use as `accessToken`. Keep root tokens on your server; only hand an account-scoped `api` token to the browser.

### Session tokens (`sess_...`)

EmailEngine can also mint short-lived, session-bound tokens whose value starts with `sess_` (this is how its own built-in message browser is embedded). These expire quickly on inactivity. When the client detects a `sess_` token, it automatically pings `GET /v1/account/{account}` after about five minutes of inactivity to keep the token alive. Call [`destroy()`](#destroy-void) to stop that timer when you tear the client down.

## Constructor options

```javascript
new EmailEngineClient(options);
```

| Option               | Type          | Default                 | Description                                                                                                                                                                                                                                 |
| -------------------- | ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `account`            | `string`      | (required)              | EmailEngine account identifier.                                                                                                                                                                                                             |
| `apiUrl`             | `string`      | `http://127.0.0.1:3000` | Base URL of your EmailEngine instance.                                                                                                                                                                                                      |
| `accessToken`        | `string`      | -                       | Bearer token for API authentication.                                                                                                                                                                                                        |
| `container`          | `HTMLElement` | -                       | DOM element to render the webmail UI into. Omit for API-only use.                                                                                                                                                                           |
| `pageSize`           | `number`      | `20`                    | Messages per page. A saved value in `localStorage` takes precedence.                                                                                                                                                                        |
| `confirmMethod`      | `function`    | browser `confirm()`     | Custom confirm dialog, `(message, title, cancelText, okText)`. May be sync or async; returns a boolean.                                                                                                                                     |
| `alertMethod`        | `function`    | browser `alert()`       | Custom alert dialog, `(message, title, cancelText, okText)` where `cancelText` is `null`.                                                                                                                                                   |
| `darkMode`           | `boolean`     | stored preference       | Initial dark mode. Overrides the preference stored by the builtin toggle.                                                                                                                                                                   |
| `showDarkModeToggle` | `boolean`     | `true`                  | Render the builtin dark mode toggle. Set `false` when the host application drives the mode through `client.setDarkMode(enabled)` (for example in sync with its own theme switch).                                                           |
| `styleNonce`         | `string`      | none                    | Nonce set on the `<style>` elements the widget creates (its own stylesheet and the one inside the message body's shadow root). Pass the page's Content-Security-Policy nonce when `style-src-elem` allows no inline stylesheet without one. |
| `message`            | `string`      | none                    | EmailEngine message ID to open on startup instead of the inbox. The folder holding it is listed next to it (the inbox for Gmail API accounts, which report no folder). Use it to deep-link into one message.                                |
| `onNavigate`         | `function`    | none                    | Called with `{ path, messageId }` whenever the open folder or message changes, so the host page can keep its address bar in step (`history.replaceState`). `messageId` is `null` when no message is open.                                   |
| `maxAttachmentSize`  | `number`      | `25 MB`                 | Total size limit, in bytes, of the files attached in the compose form. Files are sent base64 encoded in one JSON request, so keep it under EmailEngine's API body limit.                                                                    |

UI rendering, the compose modal, and dark mode only activate when a `container` is supplied. In a non-browser environment the UI is skipped and the instance behaves as a plain API client.

### Factory helper

`createEmailEngineClient()` is a convenience wrapper that resolves a `containerId` to its DOM element and validates that `account` is present:

```javascript
import { createEmailEngineClient } from '@postalsys/ee-client';

// From an options object with a containerId
const client = createEmailEngineClient({
    apiUrl: 'https://your-emailengine-server.example.com',
    account: 'your-account-id',
    accessToken: 'your-access-token',
    containerId: 'email-client'
});
```

## Methods

### `loadFolders(): Promise<Folder[]>`

Load all folders/mailboxes for the account. Renders the folder tree when a container is set.

### `loadMessages(path: string, cursor?: string): Promise<MessageListResponse>`

Load a page of messages from a folder. Pass `nextPageCursor` / `prevPageCursor` from a previous response to paginate. Resolves to `{ messages, nextPageCursor, prevPageCursor }`. The open message stays open; `openFolder(path)` closes it and lists another folder, which is what a click in the folder tree does.

### `loadMessage(messageId: string): Promise<Message>`

Load a single message. HTML is requested with `webSafeHtml=true`, so EmailEngine returns it pre-processed with inline images embedded for safe display, and the message is marked as seen. Web-safe HTML also folds quoted thread history (reply history, forwarded content, disclaimers) into a `<details class="ee-collapsed-thread">` element - see [Quoted thread history](#quoted-thread-history).

When the message carries a one-time passcode (the `otp` field EmailEngine 2.87+ reads from an `OTP-Token` header), the viewer shows a "Code requested" box above the body with the code and a Copy code button. The site the code is for is named only when EmailEngine reports the origin as `authenticated`, since the header itself proves nothing about the sender.

### `markAsRead(messageId: string, seen?: boolean): Promise<boolean>`

Add or remove the `\Seen` flag. Pass `false` to mark as unread.

### `deleteMessage(messageId: string): Promise<object>`

Delete a message. EmailEngine moves it to Trash, or removes it when that is what the backend does for the folder it is in (an IMAP message already in Trash or Junk). Resolves to EmailEngine's answer, `{ deleted, moved }`, where `moved` (`{ destination, message }`) is set when the message went to Trash.

### `moveMessage(messageId: string, targetPath: string): Promise<boolean>`

Move a message to another folder.

### `openMessage(messageId: string): Promise<Message | null>`

Open a message by its ID and list the folder that holds it, the way the `message` option does on startup. A message that cannot be loaded shows its error in the viewer and the inbox is listed instead.

### `sendMessage(message): Promise<object>`

Send an email. Submitting queues the message; EmailEngine delivers it afterwards. `message` is an object:

- `to`, `cc`, `bcc`: recipients, each a string address (`'user@example.com'`), an object (`{ name: 'John Doe', address: 'john@example.com' }`) or an array of either
- `subject`
- `text`: the plain text part, and `html`: the HTML part (either or both)
- `attachments`: new files as `{ filename, contentType, content }` with `content` base64 encoded, or attachments of a stored message as `{ reference, filename, contentType }`, where `reference` is the EmailEngine attachment ID. The server fetches a referenced file itself, so forwarding a large file does not pass it through the browser
- `reference`: EmailEngine's submit reference block, `{ message, action, inline, forwardAttachments }`. With it EmailEngine sets the threading headers, quotes the referenced message when `inline` is true, carries all of its attachments over on a forward with `forwardAttachments`, and flags the original `\Answered` / `$Forwarded` once the message is delivered (IMAP accounts)
- `headers`: extra headers, for example the `In-Reply-To` and `References` of a reopened draft

Resolves to EmailEngine's submit response.

### `reply(messageId?, { all }?)`, `forward(messageId?)`, `compose(prefill?)`, `editDraft(messageId?)`

Open the compose form (UI only). `reply()` and `forward()` act on the open message when no ID is given and fill in the recipients, the `Re:` / `Fwd:` subject and the reference; the original is shown under the editor and quoted by EmailEngine when the message is sent. `reply(id, { all: true })` resolves reply-all in the client: the original sender goes in To and the other recipients in Cc, without the account's own address, and the message goes out exactly as the form shows it. A forward lists the original's files as attachments, each of which can be removed. `compose()` opens a blank form and takes `{ to, cc, bcc, subject, text, html }` to prefill it. `editDraft()` opens a stored draft; saving replaces it and sending removes it from Drafts.

When the form already holds unsaved changes, these first ask whether to save them as a draft. They resolve `false` if saving that draft failed and the form stayed as it was, `true` otherwise.

### `prepareResponse(msg, action, ownAddress?): object`

The recipients, subject and reference of a `'reply'`, `'reply-all'` or `'forward'` of a message, as `reply()` and `forward()` prefill them: `{ to, cc, subject, reference }`, plus `attachments` for a forward (the original's files as `{ reference, filename, contentType, size }`). A reply goes to the message's Reply-To, otherwise its sender, or to its recipients when the account sent it. Useful for building a compose UI of your own.

### `parseAddressList(value)` / `formatAddressList(list)`

Convert between a typed address field (`"Doe, John" <john@example.com>, jane@example.com`) and address entries.

### `saveDraft(message): Promise<object>`

Store a message as a draft instead of sending it (`POST /v1/account/{account}/message`). It takes the same message object as `sendMessage()`, and every field may be left out. The message is uploaded to the account's Drafts special-use folder with the `\Draft` flag set and the account's own name and address as the sender, so it can later be delivered with `submitDraft()`. A draft saved with a `reference` keeps the threading headers and the quote. Resolves to EmailEngine's upload response (`{ id, path, uid, ... }`).

### `updateDraft(messageId, message): Promise<object>`

Replace a stored draft with a new version. IMAP cannot change a stored message, so the new version is saved first and the old draft removed for good afterwards; attachments the new version references from the old draft are copied before it goes. If the old draft cannot be removed, the new one is kept and the failure only logged. Resolves to the upload response of the new version.

### `submitDraft(messageId: string, options?: SubmitDraftOptions): Promise<object>`

Send an existing draft message as-is (`POST /v1/account/{account}/message/{message}/submit`). The message must be a draft: stored in the Drafts folder or flagged as a draft (IMAP), carrying the DRAFT label (Gmail), or a draft message (MS Graph). The provider removes the draft once it has been sent and files the sent copy into the Sent Mail folder. Requires EmailEngine v2.76.0 or later.

The optional `options` object mirrors the API's SubmitDraft payload (`envelope`, `copy`, `sentMailPath`, `sendAt`, ...). Resolves to EmailEngine's submit response (`{ response, messageId, queueId, sendAt }`).

### `downloadAttachment(attachmentId: string, suggestedFilename?: string): Promise<void>`

Browser only. Fetch an attachment and trigger a download, using the filename from the `Content-Disposition` header when available.

### `downloadOriginalMessage(messageId: string, subject?: string): Promise<void>`

Browser only. Download the raw message source as an `.eml` file.

### `setDarkMode(enabled: boolean): void`

Set dark mode from the host application without touching the preference stored by the builtin toggle. Combine with `showDarkModeToggle: false` to keep the rendered UI in sync with the host page's own theme switch.

### `destroy(): void`

Clean up the instance and clear the `sess_` token keep-alive interval. Always call this when you are finished with a client (for example when unmounting the UI) to avoid a leaked timer.

## Upgrading from 1.x

2.0 changes how messages are sent and how compose behaves:

- `sendMessage()` and `saveDraft()` take one message object. `sendMessage(to, subject, text, { cc })` becomes `sendMessage({ to, subject, text, cc })`; `saveDraft(to, subject, text, options)` becomes `saveDraft({ to, subject, text, ...options })`. The old form throws a `TypeError` instead of sending a message without its subject and text.
- `compose()` returns a promise, like `reply()` and `forward()`.
- A forward attaches the original's files one by one as references (`prepareResponse()` returns them in `attachments`, and its reference has `forwardAttachments: false`).
- The compose form is a docked panel without a backdrop (class `ee-compose`, formerly `ee-compose-modal`) and writes HTML through its editor; the message textarea is gone. Hosts that styled or scripted the old modal need updating.
- The folder list is loaded with `counters=true` to show unread counts.

## Browser UI

When a `container` is provided the client builds a full webmail interface:

- Folder tree with special-folder ordering (Inbox, Drafts, Sent, Trash, Junk, Archive), icons, unread counts and nested folders. The folder list is requested with `counters=true`, which costs one IMAP STATUS command per folder
- Paginated message list with its position ("1-20 of 45") and a selectable page size (persisted to `localStorage`) in a footer. Unread messages are marked with a dot and bold text; Drafts and Sent list the recipients instead of the sender
- Message viewer with reply, reply all, forward, mark read/unread, delete, move-to-folder, download original, and attachment downloads
- Replied and forwarded markers in the list and the viewer, from the `\Answered` and `$Forwarded` flags (IMAP accounts)
- Draft messages open with an "Edit" button that continues the draft in the compose form, and a "Send draft" button that submits it as it is (requires EmailEngine v2.76.0 or later)
- Quoted thread history collapsed behind a "Show quoted text" control
- Compose form docked to the bottom right of the window (full screen on a phone), so the message being answered stays readable. It has a minimal rich text editor (bold, italic, lists, links), To, Cc and Bcc fields that take several addresses, file attachments, and Save draft. A reply's quote is folded behind a "..." control; a forward shows the forwarded message with its header and lists the original's files as attachments that can be removed one by one. Closing a form with unsaved changes asks whether to save them as a draft
- Folders, messages and attachments are buttons, reachable and usable from the keyboard
- Dark mode toggle with the preference persisted to `localStorage`
- Failed requests replace the affected pane's placeholder with an error panel and a Retry button

### Theming

The accent colour (buttons, the selected folder, links in the compose form) comes from CSS custom properties that a host page can set on the container element:

```html
<div id="email-client" style="--ee-accent: #4c5cc5; --ee-accent-hover: #3d4bb0; --ee-accent-light: #9ba6ee"></div>
```

`--ee-accent` is the colour behind white text, `--ee-accent-hover` its pressed and hover shade, and `--ee-accent-light` the shade used for text and outlines in dark mode. Without them the client uses its own blue.

When opening a message the client scrolls the page only if its top is scrolled out of view, and it honours the container's `scroll-margin-top`, so a page with a sticky header can keep the toolbar clear of it.

### Compose and notices

On wide layouts the Compose button sits at the top of the folder pane; in the one-pane layout it is a floating button. Problems with a message (no recipient, an address that is not one, a send the server refused) are shown inside the compose form next to its buttons, and the form keeps what was typed. Outcomes that need no answer ("Message queued for delivery.", "Draft saved.", "Message moved to Trash.") appear as a short notice at the bottom of the client, which `notify(message)` can show from the host too. `alertMethod` is used for failures outside the form.

The editor keeps paragraphs, bold, italic, underline, lists, quotes and `http`, `https` and `mailto` links. Pasted content and reopened drafts are filtered down to those; anything else keeps only its text. A reopened draft of a reply keeps its quote as editable text. When the message being answered or forwarded has no HTML part of its own, the client adds the quote to the HTML part itself, since EmailEngine quotes only the original's HTML into it.

### Dark mode and styled messages

A message that sets its own colours or backgrounds (most newsletters) was designed for a light page, so in dark mode it is shown on a light surface. Plain messages follow the theme.

### Failed requests

When a request behind a pane fails, that pane shows why instead of sitting on its "Loading..." placeholder. The reason is the message EmailEngine returned - for example "Requested account is not yet initialized" for an account that has not connected yet, or "Requested mailbox folder was not found" - and a Retry button re-runs the request. If the server could not be reached at all, the panel says so and names the configured `apiUrl`. A message that does not exist (deleted, moved, or a link with a broken ID) is reported as "Message not found" without a Retry button, since retrying cannot help. The underlying promise still rejects, so callers driving the client programmatically can handle the error themselves.

### Quoted thread history

EmailEngine's web-safe HTML wraps the quoted tail of a reply - reply history, forwarded content, disclaimers - in a single `<details class="ee-collapsed-thread">` element with an empty `<summary class="ee-collapsed-thread-toggle">`, leaving the label to the renderer. The message viewer labels that summary ("Show quoted text" / "Hide quoted text") and styles it as a button, so only what the sender actually wrote is visible until the reader asks for the rest. Messages with no quoted tail carry no such element and render unchanged.

Operators can turn the folding off server side with `EENGINE_DISABLE_THREAD_COLLAPSE=true`; older EmailEngine versions simply never emit the element.

### Custom dialogs

Provide `confirmMethod` and `alertMethod` to route confirmations and alerts through your own modal system instead of the browser defaults - useful when integrating with a UI framework:

```javascript
const client = new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.example.com',
    account: 'your-account-id',
    accessToken: 'your-access-token',
    container: document.getElementById('email-client'),

    alertMethod: async (message, title, cancelText, okText) => {
        return await MyModal.alert({ title, message, okButton: okText });
    },

    confirmMethod: async (message, title, cancelText, okText) => {
        return await MyModal.confirm({ title, message, cancelButton: cancelText, okButton: okText });
    }
});
```

Both methods receive the same arguments:

- `message` (string): text to display
- `title` (string): dialog title (defaults: `Confirm` / `Notice`)
- `cancelText` (string | null): cancel button text (`Cancel` for confirm, `null` for alert)
- `okText` (string): confirm/OK button text (default `OK`)

The client uses contextual titles such as `Delete Message`, `Validation Error`, `Success`, `Send Error`, and `Download Error`. `confirmMethod` should return a boolean (or a promise for one); `alertMethod` may be sync or async.

## Security

This library renders attacker-controlled email content, so it is careful about HTML injection:

- All untrusted values (subjects, addresses, names, filenames, folder names) are HTML-escaped before being written to the DOM.
- The one intentional raw-HTML sink is the message body itself. The client fetches it with EmailEngine's `webSafeHtml` option so the HTML arrives already pre-processed for safe embedding, and renders it inside a shadow root so host styles and ids cannot reach it.
- HTML that enters the compose editor (pasted content, a reopened draft, `compose({ html })`) is parsed in an inert document and rebuilt from an allowlist of tags with no attributes except `http`, `https` and `mailto` link targets. The same filter runs on the HTML that is sent.

Do not disable escaping or add new raw-HTML sinks when extending the UI.

## TypeScript

Type declarations ship with the package (`index.d.ts`), so `EmailEngineClient`, `createEmailEngineClient`, and the exported interfaces (`Folder`, `Message`, `MessageListResponse`, `EmailEngineClientOptions`, and others) are typed out of the box - no `@types` package needed.

## License

MIT (c) Postal Systems OÜ

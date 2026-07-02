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

// Send a plain-text message
await client.sendMessage('user@example.com', 'Hello', 'Sent from ee-client');

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

| Option          | Type          | Default                 | Description                                                                                             |
| --------------- | ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `account`       | `string`      | (required)              | EmailEngine account identifier.                                                                         |
| `apiUrl`        | `string`      | `http://127.0.0.1:3000` | Base URL of your EmailEngine instance.                                                                  |
| `accessToken`   | `string`      | -                       | Bearer token for API authentication.                                                                    |
| `container`     | `HTMLElement` | -                       | DOM element to render the webmail UI into. Omit for API-only use.                                       |
| `pageSize`      | `number`      | `20`                    | Messages per page. A saved value in `localStorage` takes precedence.                                    |
| `confirmMethod` | `function`    | browser `confirm()`     | Custom confirm dialog, `(message, title, cancelText, okText)`. May be sync or async; returns a boolean. |
| `alertMethod`   | `function`    | browser `alert()`       | Custom alert dialog, `(message, title, cancelText, okText)` where `cancelText` is `null`.               |

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

Load a page of messages from a folder. Pass `nextPageCursor` / `prevPageCursor` from a previous response to paginate. Resolves to `{ messages, nextPageCursor, prevPageCursor }`.

### `loadMessage(messageId: string): Promise<Message>`

Load a single message. HTML is requested with `webSafeHtml=true`, so EmailEngine returns it pre-processed with inline images embedded for safe display, and the message is marked as seen.

### `markAsRead(messageId: string, seen?: boolean): Promise<boolean>`

Add or remove the `\Seen` flag. Pass `false` to mark as unread.

### `deleteMessage(messageId: string): Promise<boolean>`

Delete a message (EmailEngine moves it to Trash, or removes it if already in Trash).

### `moveMessage(messageId: string, targetPath: string): Promise<boolean>`

Move a message to another folder.

### `sendMessage(to, subject, text): Promise<object>`

Send a plain-text email. `to` may be:

- a string address: `'user@example.com'`
- an object: `{ name: 'John Doe', address: 'john@example.com' }`
- an array of strings and/or objects for multiple recipients

Resolves to EmailEngine's submit response.

### `downloadAttachment(attachmentId: string, suggestedFilename?: string): Promise<void>`

Browser only. Fetch an attachment and trigger a download, using the filename from the `Content-Disposition` header when available.

### `downloadOriginalMessage(messageId: string, subject?: string): Promise<void>`

Browser only. Download the raw message source as an `.eml` file.

### `destroy(): void`

Clean up the instance and clear the `sess_` token keep-alive interval. Always call this when you are finished with a client (for example when unmounting the UI) to avoid a leaked timer.

## Browser UI

When a `container` is provided the client builds a full webmail interface:

- Folder tree with special-folder ordering (Inbox, Drafts, Sent, Trash, Junk, Archive) and nested folders
- Paginated message list with a selectable page size (persisted to `localStorage`)
- Message viewer with mark read/unread, delete, move-to-folder, download original, and attachment downloads
- Compose modal (floating button) for sending plain-text mail
- Dark mode toggle with the preference persisted to `localStorage`

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
- The one intentional raw-HTML sink is the message body itself. The client fetches it with EmailEngine's `webSafeHtml` option so the HTML arrives already pre-processed for safe embedding.

Do not disable escaping or add new raw-HTML sinks when extending the UI.

## TypeScript

Type declarations ship with the package (`index.d.ts`), so `EmailEngineClient`, `createEmailEngineClient`, and the exported interfaces (`Folder`, `Message`, `MessageListResponse`, `EmailEngineClientOptions`, and others) are typed out of the box - no `@types` package needed.

## License

MIT (c) Postal Systems OÜ

# @postalsys/ee-client

EmailEngine client library for browser and Node.js applications.

## Installation

```bash
npm install @postalsys/ee-client
```

For Node.js environments, you may also need to install `node-fetch`:

```bash
npm install node-fetch
```

## Usage

### Browser

```javascript
import { EmailEngineClient } from '@postalsys/ee-client';

// Create client with UI container
const client = new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.com',
    account: 'your-account-id',
    accessToken: 'your-access-token',
    container: document.getElementById('email-client')
});
```

### Node.js

```javascript
import { EmailEngineClient } from '@postalsys/ee-client';

// Create client for API-only usage
const client = new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.com',
    account: 'your-account-id',
    accessToken: 'your-access-token'
});

// Load folders
const folders = await client.loadFolders();

// Load messages from INBOX
const { messages } = await client.loadMessages('INBOX');

// Load a specific message
const message = await client.loadMessage(messages[0].id);
```

### CommonJS

```javascript
const { EmailEngineClient } = require('@postalsys/ee-client');

const client = new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.com',
    account: 'your-account-id',
    accessToken: 'your-access-token'
});
```

## API

### Constructor Options

- `apiUrl` (string, optional): EmailEngine API URL. Defaults to `http://127.0.0.1:3000`
- `account` (string, required): Account identifier
- `accessToken` (string, optional): Access token for authentication
- `container` (HTMLElement, optional): DOM container for UI components (browser only)

### Methods

#### `loadFolders(): Promise<Folder[]>`

Load all folders/mailboxes for the account.

#### `loadMessages(path: string, cursor?: string): Promise<MessageListResponse>`

Load messages from a specific folder.

#### `loadMessage(messageId: string): Promise<Message>`

Load a specific message by ID.

#### `markAsRead(messageId: string, seen?: boolean): Promise<boolean>`

Mark a message as read or unread.

#### `deleteMessage(messageId: string): Promise<boolean>`

Delete a message.

#### `moveMessage(messageId: string, targetPath: string): Promise<boolean>`

Move a message to another folder.

## Browser UI

When used in a browser with a container element, the client automatically creates a full email interface with:

- Folder tree navigation
- Message list with pagination
- Message viewer with actions (mark as read/unread, delete, move)
- Responsive design

```html
<div id="email-client" style="height: 600px;"></div>
<script type="module">
import { EmailEngineClient } from '@postalsys/ee-client';

new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.com',
    account: 'your-account-id',
    accessToken: 'your-access-token',
    container: document.getElementById('email-client')
});
</script>
```

## License

MIT © Postal Systems OÜ
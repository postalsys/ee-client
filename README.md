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

## API

### Constructor Options

- `apiUrl` (string, optional): EmailEngine API URL. Defaults to `http://127.0.0.1:3000`
- `account` (string, required): Account identifier
- `accessToken` (string, optional): Access token for authentication
- `container` (HTMLElement, optional): DOM container for UI components (browser only)
- `confirmMethod` (function, optional): Custom confirm dialog method. Receives `(message, title, cancelText, okText)` parameters. Can be sync or async. Defaults to browser's `confirm()` with standard parameters.
- `alertMethod` (function, optional): Custom alert dialog method. Receives `(message, title, cancelText, okText)` parameters where `cancelText` is `null` for alerts. Can be sync or async. Defaults to browser's `alert()` with standard parameters.

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

#### `sendMessage(to: string | object | array, subject: string, text: string): Promise<object>`

Send a new email message. The `to` parameter can be:
- A string email address: `'user@example.com'`
- An object with name and address: `{ name: 'John Doe', address: 'john@example.com' }`
- An array of strings or objects for multiple recipients

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
        container: document.getElementById('email-client'),
        // Optional: Custom confirm dialog
        confirmMethod: async message => {
            return await myCustomDialog.confirm(message);
        }
    });
</script>
```

### Custom Dialog Methods

You can provide custom alert and confirm dialog methods that will be used instead of the browser's default dialogs. This is useful for integrating with UI frameworks or custom dialog systems:

```javascript
const client = new EmailEngineClient({
    apiUrl: 'https://your-emailengine-server.com',
    account: 'your-account-id',
    accessToken: 'your-access-token',
    container: document.getElementById('email-client'),
    
    // Custom alert method
    alertMethod: async (message, title, cancelText, okText) => {
        return await MyModal.alert({
            title: title,           // e.g., "Success", "Error", "Notice"
            message: message,
            okButton: okText        // e.g., "OK"
            // cancelText is null for alerts
        });
    },
    
    // Custom confirm method
    confirmMethod: async (message, title, cancelText, okText) => {
        return await MyModal.confirm({
            title: title,           // e.g., "Delete Message", "Confirm"
            message: message,
            cancelButton: cancelText, // e.g., "Cancel"
            okButton: okText        // e.g., "Delete", "OK"
        });
    }
});
```

#### Dialog Method Signatures

Both methods receive the same parameters:
- `message` (string): The message to display
- `title` (string): Dialog title (defaults: "Confirm" for confirm, "Notice" for alert)
- `cancelText` (string|null): Cancel button text ("Cancel" for confirm, `null` for alert)
- `okText` (string): OK/action button text (defaults: "OK")

#### Built-in Dialog Types

The library uses contextually appropriate titles and button texts:

- **Validation errors**: `alertMethod(message, "Validation Error", null, "OK")`
- **Success messages**: `alertMethod(message, "Success", null, "OK")`
- **Send errors**: `alertMethod(message, "Send Error", null, "OK")`
- **Download errors**: `alertMethod(message, "Download Error", null, "OK")`
- **Delete confirmation**: `confirmMethod(message, "Delete Message", "Cancel", "Delete")`

Both methods can be synchronous or asynchronous and should return a boolean for confirm dialogs.

## License

MIT © Postal Systems OÜ

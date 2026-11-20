export interface EmailAddress {
    name?: string;
    address: string;
}

export interface MessageFlags {
    add?: string[];
    delete?: string[];
}

export interface MessageText {
    html?: string;
    plain?: string;
    /** Sizes of the parts as stored; a message without `html` here had no HTML part of its own */
    encodedSize?: { plain?: number; html?: number };
}

export interface MessageStatus {
    messages: number;
    unseen?: number;
}

export interface Folder {
    name: string;
    path: string;
    parentPath?: string;
    delimiter?: string;
    specialUse?: string;
    status?: MessageStatus;
}

export interface FolderTreeEntry {
    folder: Folder;
    depth: number;
}

export interface Attachment {
    id: string;
    filename?: string;
    contentType?: string;
    size?: number;
    /** Size of the attachment as encoded in the message (base64), as EmailEngine reports it */
    encodedSize?: number;
    /** An image the HTML body shows in place; not listed as an attachment */
    embedded?: boolean;
    inline?: boolean;
}

/** One-time passcode of a message, from its OTP-Token header (EmailEngine 2.87+, experimental) */
export interface MessageOtp {
    code: string;
    /** The origin the passcode is bound to, e.g. "https://example.com" */
    origin: string;
    /** Whether the receiving server vouches for the origin. The site is named in the UI only when true */
    authenticated: boolean;
}

export interface Message {
    id: string;
    subject?: string;
    from?: EmailAddress;
    to?: EmailAddress[];
    cc?: EmailAddress[];
    replyTo?: EmailAddress[];
    date: string;
    /** IMAP-style flags, e.g. "\\Seen", "\\Answered", "$Forwarded" */
    flags?: string[];
    unseen: boolean;
    draft?: boolean;
    /** Special-use flag of the folder the message is stored in, e.g. "\\Drafts" */
    messageSpecialUse?: string;
    intro?: string;
    text?: MessageText;
    attachments?: Attachment[];
    otp?: MessageOtp;
}

export interface MessageListResponse {
    messages: Message[];
    nextPageCursor?: string;
    prevPageCursor?: string;
}

/** Where the listed page sits in its folder, when the server reports it */
export interface ListPosition {
    /** 0-based page number */
    page: number;
    /** Messages in the folder */
    total: number;
}

export type SendRecipient = string | EmailAddress;

/** A file to attach: new content, base64 encoded */
export interface ComposeAttachment {
    filename: string;
    contentType?: string;
    /** Base64 encoded file content */
    content: string;
}

/**
 * An attachment of a stored message, attached by its EmailEngine attachment ID. The server
 * fetches the content itself; filename and contentType are kept on the new message.
 */
export interface ReferencedAttachment {
    reference: string;
    filename?: string;
    contentType?: string;
    /** Size in bytes, for display only; not sent */
    size?: number;
}

/** EmailEngine's submit reference block: what the message replies to or forwards */
export interface MessageReference {
    message: string;
    action: 'reply' | 'reply-all' | 'forward';
    /** Quote the referenced message under the new text */
    inline?: boolean;
    /** Carry all of the referenced message's attachments over (forward only) */
    forwardAttachments?: boolean;
}

/** The message `sendMessage()`, `saveDraft()` and `updateDraft()` take */
export interface OutgoingMessage {
    to?: SendRecipient | SendRecipient[] | null;
    cc?: SendRecipient | SendRecipient[] | null;
    bcc?: SendRecipient | SendRecipient[] | null;
    subject?: string;
    /** The plain text part */
    text?: string;
    /** The HTML part */
    html?: string;
    attachments?: Array<ComposeAttachment | ReferencedAttachment>;
    /** What the message replies to or forwards; the server adds the threading headers and the quote */
    reference?: MessageReference | null;
    /** Extra headers, e.g. the In-Reply-To and References of a reopened draft */
    headers?: Record<string, string>;
}

/** Recipients, subject and reference of a reply, reply-all or forward, from `prepareResponse()` */
export interface PreparedResponse {
    to: EmailAddress[];
    cc: EmailAddress[];
    subject: string;
    reference: MessageReference;
    /** A forward's files: the original's attachments as references, one per file */
    attachments?: ReferencedAttachment[];
}

/** Prefill for `compose()`. Address fields take a typed string or address entries */
export interface ComposePrefill {
    to?: string | EmailAddress[];
    cc?: string | EmailAddress[];
    bcc?: string | EmailAddress[];
    subject?: string;
    text?: string;
    /** Rich text for the editor; filtered to paragraphs, emphasis, lists, quotes and http(s)/mailto links */
    html?: string;
}

/** What `onNavigate` is told whenever the open folder or message changes */
export interface NavigationState {
    path: string | null;
    messageId: string | null;
}

/**
 * Optional payload for `submitDraft()`. Mirrors the SubmitDraft schema of the
 * EmailEngine API; all fields are optional and most only apply to SMTP deliveries.
 */
export interface SubmitDraftOptions {
    /** SMTP envelope override; derived from the draft's headers when omitted */
    envelope?: { from?: string; to?: string[] };
    /** Copy the sent message to the Sent Mail folder (SMTP only; account default when unset) */
    copy?: boolean | null;
    /** Upload the sent message to this folder instead of the default Sent Mail folder (SMTP only) */
    sentMailPath?: string;
    /** Schedule the send instead of sending immediately */
    sendAt?: string | Date;
    deliveryAttempts?: number;
    gateway?: string;
    [key: string]: unknown;
}

/**
 * Custom dialog handler. Invoked by the client as
 * `(message, title, cancelText, okText)`; `cancelText` is `null` for alerts.
 * May be synchronous or asynchronous. Confirm handlers should resolve to a boolean.
 */
/** A confirm resolves true for the OK button and false for the cancel button. A host dialog closed without either (its close button, Escape, the backdrop) may resolve null: the client then treats the question as unanswered, which keeps an unsaved message open. */
export type DialogMethod = (
    message: string,
    title?: string,
    cancelText?: string | null,
    okText?: string
) => boolean | null | void | Promise<boolean | null | void>;

export interface EmailEngineClientOptions {
    apiUrl?: string;
    account: string;
    accessToken?: string;
    container?: HTMLElement;
    containerId?: string;
    pageSize?: number;
    confirmMethod?: DialogMethod;
    alertMethod?: DialogMethod;
    /** Initial dark mode; overrides the preference stored by the builtin toggle */
    darkMode?: boolean;
    /** Render the builtin dark mode toggle button (default true); set false when the host drives the mode through setDarkMode() */
    showDarkModeToggle?: boolean;
    /** CSP nonce set on the <style> element the widget appends, for a host page whose style-src-elem requires one */
    styleNonce?: string;
    /** EmailEngine message ID to open on startup (with its folder) instead of the inbox */
    message?: string;
    /** Called whenever the open folder or message changes, e.g. to keep the address bar in step */
    onNavigate?: (state: NavigationState) => void;
    /** Total size limit for files attached in the compose form, in bytes (default 25 MB) */
    maxAttachmentSize?: number;
    /** Called with EmailEngine's response whenever a message or a stored draft is queued for delivery */
    onMessageSent?: (response: any) => void;
    /** Called with EmailEngine's upload response whenever a draft is stored */
    onDraftSaved?: (response: any) => void;
    /** Called whenever a request fails, with what the client was doing */
    onError?: (error: Error, context: ErrorContext) => void;
}

/** What `onError` is told about a failed request */
export interface ErrorContext {
    action: 'loadFolders' | 'loadMessages' | 'loadMessage' | 'markAsRead' | 'delete' | 'move' | 'send' | 'saveDraft' | 'download';
    /** The failure in words, e.g. "Failed to load the folders" */
    description: string;
}

export declare class EmailEngineClient {
    apiUrl: string;
    account: string;
    accessToken?: string;
    container?: HTMLElement | null;
    confirmMethod: DialogMethod;
    alertMethod: DialogMethod;
    pageSize: number;
    darkMode: boolean;
    showDarkModeToggle: boolean;
    currentFolder: string | null;
    currentMessage: Message | null;
    onNavigate: ((state: NavigationState) => void) | null;
    maxAttachmentSize: number;
    folders: Folder[];
    messages: Message[];
    nextPageCursor: string | null;
    prevPageCursor: string | null;
    listPosition: ListPosition | null;
    /**
     * Resolves once the first view (folders and a listing, or a deep-linked message) has loaded:
     * true when it did, false when its requests failed and the panes show why (a deep-linked
     * message that could not be opened does not count, the inbox is listed instead). Resolves true
     * at once for an API-only client, and false outside a browser.
     */
    ready: Promise<boolean>;

    constructor(options?: EmailEngineClientOptions);

    apiRequest(method: string, endpoint: string, data?: any): Promise<any>;
    /** Lists the folders; counters adds message and unread counts (default: true when the UI is rendered) */
    loadFolders(options?: { counters?: boolean }): Promise<Folder[]>;
    /** Loads a page of a folder's message list; the open message stays open */
    loadMessages(path: string, cursor?: string | null): Promise<MessageListResponse>;
    /** Closes the open message and lists another folder */
    openFolder(path: string): Promise<MessageListResponse>;
    loadMessage(messageId: string): Promise<Message>;
    markAsRead(messageId: string, seen?: boolean): Promise<boolean>;
    /** Resolves to EmailEngine's answer; `moved` is set when the message went to Trash instead of being removed */
    deleteMessage(messageId: string): Promise<{ deleted?: boolean; moved?: { destination?: string; message?: string } }>;
    moveMessage(messageId: string, targetPath: string): Promise<boolean>;
    /** Opens a message by ID and lists the folder that holds it */
    openMessage(messageId: string): Promise<Message | null>;
    /** Submits a message for delivery. Since 2.0 it takes one message object */
    sendMessage(message: OutgoingMessage): Promise<any>;
    /** Stores a message in the Drafts folder */
    saveDraft(message: OutgoingMessage): Promise<any>;
    /** Replaces a stored draft: saves the new version, then removes the old one for good */
    updateDraft(messageId: string, message: OutgoingMessage): Promise<any>;
    /** Parses a typed address field ("Name <a@example.com>, b@example.com") into address entries */
    parseAddressList(value: string | null | undefined): EmailAddress[];
    /** Formats address entries for an address field; the reverse of parseAddressList() */
    formatAddressList(list: EmailAddress | EmailAddress[] | null | undefined): string;
    /** Recipients, subject and reference for answering msg; ownAddress is left out of the recipients */
    prepareResponse(msg: Message, action: 'reply' | 'reply-all' | 'forward', ownAddress?: string | null): PreparedResponse;
    /**
     * Opens the compose form, optionally prefilled. Like reply(), forward() and editDraft() it
     * needs the UI, and resolves false when an unsaved message stayed open instead (the user chose
     * to save it as a draft and saving failed), true otherwise.
     */
    compose(prefill?: ComposePrefill): Promise<boolean>;
    /** Opens the compose form as a reply to a message, the open one by default */
    reply(messageId?: string | null, options?: { all?: boolean }): Promise<boolean>;
    /** Opens the compose form to forward a message, the open one by default */
    forward(messageId?: string | null): Promise<boolean>;
    /** Opens a stored draft in the compose form, the open message by default */
    editDraft(messageId?: string | null): Promise<boolean>;
    submitDraft(messageId: string, options?: SubmitDraftOptions | null): Promise<any>;
    downloadAttachment(attachmentId: string, suggestedFilename?: string): Promise<void>;
    downloadOriginalMessage(messageId: string, subject?: string): Promise<void>;
    formatDate(dateStr: string): string;
    /** The date shown in the message header: weekday, date and time to the minute */
    formatFullDate(dateStr: string): string;
    /** Shows a short notice at the bottom of the client that goes away on its own (needs the UI) */
    notify(message: string): void;
    formatFileSize(bytes: number): string;
    escapeHtml(value: unknown): string;
    /** HTML of the "Code requested" box for a message's one-time passcode, empty without one */
    renderOtpBox(otp?: MessageOtp): string;
    /** Copies text to the clipboard, falling back to execCommand outside a secure context */
    copyText(text: string): Promise<boolean>;
    createStyles(): void;
    buildFolderTree(): FolderTreeEntry[];
    renderFolderList(): void;
    renderMessageList(): void;
    renderMessage(): void;
    createLayout(): void;
    init(): void;
    setDarkMode(enabled: boolean): void;
    toggleDarkMode(): void;
    destroy(): void;
}

export declare function createEmailEngineClient(options: EmailEngineClientOptions): EmailEngineClient;

export default EmailEngineClient;

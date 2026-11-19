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
}

export interface MessageStatus {
    messages: number;
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

export type SendRecipient = string | EmailAddress;

/** A file to attach, as the compose form reads it */
export interface ComposeAttachment {
    filename: string;
    contentType?: string;
    /** Base64 encoded file content */
    content: string;
}

/** EmailEngine's submit reference block: what the message replies to or forwards */
export interface MessageReference {
    message: string;
    action: 'reply' | 'reply-all' | 'forward';
    /** Quote the referenced message under the new text */
    inline?: boolean;
    /** Carry the referenced message's attachments over (forward only) */
    forwardAttachments?: boolean;
}

/** Optional fields for `sendMessage()` and `saveDraft()` */
export interface ComposeOptions {
    cc?: SendRecipient | SendRecipient[];
    bcc?: SendRecipient | SendRecipient[];
    attachments?: ComposeAttachment[];
    reference?: MessageReference | null;
}

/** Recipients, subject and reference of a reply, reply-all or forward, from `prepareResponse()` */
export interface PreparedResponse {
    to: EmailAddress[];
    cc: EmailAddress[];
    subject: string;
    reference: MessageReference;
}

/** Prefill for `compose()`. Address fields take a typed string or address entries */
export interface ComposePrefill {
    to?: string | EmailAddress[];
    cc?: string | EmailAddress[];
    bcc?: string | EmailAddress[];
    subject?: string;
    text?: string;
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
export type DialogMethod = (message: string, title?: string, cancelText?: string | null, okText?: string) => boolean | void | Promise<boolean | void>;

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

    constructor(options?: EmailEngineClientOptions);

    apiRequest(method: string, endpoint: string, data?: any): Promise<any>;
    loadFolders(): Promise<Folder[]>;
    /** Loads a page of a folder's message list; the open message stays open */
    loadMessages(path: string, cursor?: string | null): Promise<MessageListResponse>;
    /** Closes the open message and lists another folder */
    openFolder(path: string): Promise<MessageListResponse>;
    loadMessage(messageId: string): Promise<Message>;
    markAsRead(messageId: string, seen?: boolean): Promise<boolean>;
    deleteMessage(messageId: string): Promise<boolean>;
    moveMessage(messageId: string, targetPath: string): Promise<boolean>;
    /** Opens a message by ID and lists the folder that holds it */
    openMessage(messageId: string): Promise<Message | null>;
    sendMessage(to: SendRecipient | SendRecipient[], subject: string, text: string, options?: ComposeOptions): Promise<any>;
    saveDraft(to?: SendRecipient | SendRecipient[] | null, subject?: string, text?: string, options?: ComposeOptions): Promise<any>;
    /** Parses a typed address field ("Name <a@example.com>, b@example.com") into address entries */
    parseAddressList(value: string | null | undefined): EmailAddress[];
    /** Formats address entries for an address field; the reverse of parseAddressList() */
    formatAddressList(list: EmailAddress | EmailAddress[] | null | undefined): string;
    /** Recipients, subject and reference for answering msg; ownAddress is left out of the recipients */
    prepareResponse(msg: Message, action: 'reply' | 'reply-all' | 'forward', ownAddress?: string | null): PreparedResponse;
    /** Opens the compose form, optionally prefilled (needs the UI) */
    compose(prefill?: ComposePrefill): void;
    /** Opens the compose form as a reply to a message, the open one by default (needs the UI) */
    reply(messageId?: string | null, options?: { all?: boolean }): Promise<void>;
    /** Opens the compose form to forward a message, the open one by default (needs the UI) */
    forward(messageId?: string | null): Promise<void>;
    submitDraft(messageId: string, options?: SubmitDraftOptions | null): Promise<any>;
    downloadAttachment(attachmentId: string, suggestedFilename?: string): Promise<void>;
    downloadOriginalMessage(messageId: string, subject?: string): Promise<void>;
    formatDate(dateStr: string): string;
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

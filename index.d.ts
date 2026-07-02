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

export interface Message {
    id: string;
    subject?: string;
    from?: EmailAddress;
    to?: EmailAddress[];
    cc?: EmailAddress[];
    date: string;
    unseen: boolean;
    intro?: string;
    text?: MessageText;
    attachments?: Attachment[];
}

export interface MessageListResponse {
    messages: Message[];
    nextPageCursor?: string;
    prevPageCursor?: string;
}

export type SendRecipient = string | EmailAddress;

/**
 * Custom dialog handler. Invoked by the client as
 * `(message, title, cancelText, okText)`; `cancelText` is `null` for alerts.
 * May be synchronous or asynchronous. Confirm handlers should resolve to a boolean.
 */
export type DialogMethod = (
    message: string,
    title?: string,
    cancelText?: string | null,
    okText?: string
) => boolean | void | Promise<boolean | void>;

export interface EmailEngineClientOptions {
    apiUrl?: string;
    account: string;
    accessToken?: string;
    container?: HTMLElement;
    containerId?: string;
    pageSize?: number;
    confirmMethod?: DialogMethod;
    alertMethod?: DialogMethod;
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
    currentFolder: string | null;
    currentMessage: Message | null;
    folders: Folder[];
    messages: Message[];
    nextPageCursor: string | null;
    prevPageCursor: string | null;

    constructor(options?: EmailEngineClientOptions);

    apiRequest(method: string, endpoint: string, data?: any): Promise<any>;
    loadFolders(): Promise<Folder[]>;
    loadMessages(path: string, cursor?: string | null): Promise<MessageListResponse>;
    loadMessage(messageId: string): Promise<Message>;
    markAsRead(messageId: string, seen?: boolean): Promise<boolean>;
    deleteMessage(messageId: string): Promise<boolean>;
    moveMessage(messageId: string, targetPath: string): Promise<boolean>;
    sendMessage(to: SendRecipient | SendRecipient[], subject: string, text: string): Promise<any>;
    downloadAttachment(attachmentId: string, suggestedFilename?: string): Promise<void>;
    downloadOriginalMessage(messageId: string, subject?: string): Promise<void>;
    formatDate(dateStr: string): string;
    formatFileSize(bytes: number): string;
    escapeHtml(value: unknown): string;
    createStyles(): void;
    buildFolderTree(): FolderTreeEntry[];
    renderFolderList(): void;
    renderMessageList(): void;
    renderMessage(): void;
    createLayout(): void;
    init(): void;
    toggleDarkMode(): void;
    destroy(): void;
}

export declare function createEmailEngineClient(options: EmailEngineClientOptions): EmailEngineClient;

export default EmailEngineClient;

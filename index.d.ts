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
}

export interface MessageListResponse {
    messages: Message[];
    nextPageCursor?: string;
    prevPageCursor?: string;
}

export interface EmailEngineClientOptions {
    apiUrl?: string;
    account: string;
    accessToken?: string;
    container?: HTMLElement;
    containerId?: string;
}

export declare class EmailEngineClient {
    apiUrl: string;
    account: string;
    accessToken?: string;
    container?: HTMLElement;
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
    formatDate(dateStr: string): string;
    createStyles(): void;
    calculateFolderDepth(folder: Folder): number;
    buildFolderTree(): Folder[];
    renderFolderList(): void;
    renderMessageList(): void;
    renderMessage(): void;
    createLayout(): void;
    init(): void;
}

export declare function createEmailEngineClient(options: EmailEngineClientOptions | string | HTMLElement): EmailEngineClient;

export default EmailEngineClient;
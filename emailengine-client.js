(function (window) {
    'use strict';

    class EmailEngineClient {
        constructor(options) {
            this.apiUrl = options.apiUrl || 'http://127.0.0.1:3000';
            this.account = options.account;
            this.accessToken = options.accessToken;
            this.container = options.container;
            this.confirmMethod = options.confirmMethod || ((message) => confirm(message));

            this.currentFolder = null;
            this.currentMessage = null;
            this.folders = [];
            this.messages = [];
            this.nextPageCursor = null;
            this.prevPageCursor = null;

            this.init();
        }

        async apiRequest(method, endpoint, data = null) {
            const url = `${this.apiUrl}${endpoint}`;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Only add Authorization header if access token is provided
            if (this.accessToken) {
                options.headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        }

        async loadFolders() {
            try {
                const data = await this.apiRequest('GET', `/v1/account/${this.account}/mailboxes`);
                this.folders = data.mailboxes || [];
                this.renderFolderList();
            } catch (error) {
                console.error('Failed to load folders:', error);
            }
        }

        async loadMessages(path, cursor = null) {
            const messageList = this.container.querySelector('.ee-message-list');
            messageList.innerHTML = '<div class="ee-loading">Loading messages...</div>';

            try {
                const params = new URLSearchParams({ path: path, pageSize: 50 });
                if (cursor) {
                    params.set('cursor', cursor);
                }

                const data = await this.apiRequest('GET', `/v1/account/${this.account}/messages?${params}`);
                this.messages = data.messages || [];
                this.currentFolder = path;
                this.nextPageCursor = data.nextPageCursor || null;
                this.prevPageCursor = data.prevPageCursor || null;
                this.renderMessageList();
            } catch (error) {
                console.error('Failed to load messages:', error);
                messageList.innerHTML = '<div class="ee-error">Failed to load messages</div>';
            }
        }

        async loadMessage(messageId) {
            const viewer = this.container.querySelector('.ee-message-viewer');
            viewer.innerHTML = '<div class="ee-loading">Loading message...</div>';

            try {
                const params = new URLSearchParams({
                    webSafeHtml: true,
                    markAsSeen: true // Automatically mark as seen when viewing
                });
                const data = await this.apiRequest('GET', `/v1/account/${this.account}/message/${messageId}?${params}`);
                this.currentMessage = data;

                // Since we used markAsSeen=true, the message is now seen on the server
                // Update both local states to reflect this
                this.currentMessage.unseen = false;

                const msg = this.messages.find(m => m.id === messageId);
                if (msg) {
                    msg.unseen = false;
                    this.renderMessageList();
                }

                this.renderMessage();
            } catch (error) {
                console.error('Failed to load message:', error);
                viewer.innerHTML = '<div class="ee-error">Failed to load message</div>';
            }
        }

        async markAsRead(messageId, seen = true) {
            // Disable the button to prevent multiple clicks
            const button = this.container.querySelector('[data-action="toggle-read"]');
            if (button) {
                button.disabled = true;
                button.textContent = 'Updating...';
            }

            try {
                const flagUpdate = seen ? { flags: { add: ['\\Seen'] } } : { flags: { delete: ['\\Seen'] } };

                await this.apiRequest('PUT', `/v1/account/${this.account}/message/${messageId}`, flagUpdate);

                // Update local message state
                const msg = this.messages.find(m => m.id === messageId);
                if (msg) {
                    msg.unseen = !seen;
                    this.renderMessageList();
                }

                // If marking as unseen, de-select the message to avoid marking it seen again
                if (!seen) {
                    this.currentMessage = null;
                    this.renderMessage();
                } else {
                    // Update current message if it's the one being modified
                    if (this.currentMessage && this.currentMessage.id === messageId) {
                        this.currentMessage.unseen = !seen;
                        this.renderMessage();
                    }
                }
            } catch (error) {
                console.error('Failed to update message flags:', error);
                // Re-enable button on error
                if (button) {
                    button.disabled = false;
                    button.textContent = `Mark as ${this.currentMessage.unseen ? 'seen' : 'unseen'}`;
                }
            }
        }

        async deleteMessage(messageId) {
            const button = this.container.querySelector('[data-action="delete"]');
            if (button) {
                button.disabled = true;
                button.textContent = 'Deleting...';
            }

            try {
                await this.apiRequest('DELETE', `/v1/account/${this.account}/message/${messageId}`);
                // Remove from local messages
                this.messages = this.messages.filter(m => m.id !== messageId);
                this.renderMessageList();
                if (this.currentMessage && this.currentMessage.id === messageId) {
                    this.currentMessage = null;
                    this.renderMessage();
                }
            } catch (error) {
                console.error('Failed to delete message:', error);
                // Re-enable button on error
                if (button) {
                    button.disabled = false;
                    button.textContent = 'Delete';
                }
            }
        }

        async moveMessage(messageId, targetPath) {
            const select = this.container.querySelector('[data-action="move"]');
            let originalHTML = '';

            if (select) {
                select.disabled = true;
                // Save original options
                originalHTML = select.innerHTML;
                select.innerHTML = '<option>Moving...</option>';
            }

            try {
                await this.apiRequest('PUT', `/v1/account/${this.account}/message/${messageId}/move`, {
                    path: targetPath
                });
                // Remove from local messages
                this.messages = this.messages.filter(m => m.id !== messageId);
                this.renderMessageList();
                if (this.currentMessage && this.currentMessage.id === messageId) {
                    this.currentMessage = null;
                    this.renderMessage();
                }
            } catch (error) {
                console.error('Failed to move message:', error);
                // Restore select on error
                if (select) {
                    select.innerHTML = originalHTML;
                    select.disabled = false;
                    select.value = '';
                }
            }
        }

        formatDate(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now - date;

            if (diff < 86400000) {
                // Less than 24 hours
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diff < 604800000) {
                // Less than 7 days
                return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        }

        createStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .ee-client {
                    display: flex;
                    height: 100%;
                    min-height: 400px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #333;
                    background: #fff;
                    border: 1px solid #ddd;
                }
                
                .ee-client * {
                    box-sizing: border-box;
                }
                
                .ee-sidebar {
                    width: 200px;
                    background: #f5f5f5;
                    border-right: 1px solid #ddd;
                    overflow-y: auto;
                }
                
                .ee-folder-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                
                .ee-folder-item {
                    cursor: pointer;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .ee-folder-item:hover {
                    background: #e8e8e8;
                }
                
                .ee-folder-item.active {
                    background: #007bff;
                    color: white;
                }
                
                .ee-folder-content {
                    padding: 8px 16px 8px 0px;
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                
                .ee-folder-indent {
                    color: #999;
                    font-size: 12px;
                    margin-right: 4px;
                    font-family: monospace;
                }
                
                .ee-folder-name {
                    font-weight: 500;
                    flex: 1;
                }
                
                .ee-folder-name.has-children {
                    font-weight: 600;
                }
                
                .ee-folder-item.active .ee-folder-indent {
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .ee-folder-count {
                    font-size: 12px;
                    opacity: 0.7;
                    margin-left: 8px;
                    flex-shrink: 0;
                }
                
                .ee-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .ee-message-list {
                    width: 350px;
                    border-right: 1px solid #ddd;
                    overflow-y: auto;
                }
                
                .ee-message-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e0e0e0;
                    cursor: pointer;
                }
                
                .ee-message-item:hover {
                    background: #f8f8f8;
                }
                
                .ee-message-item.active {
                    background: #e3f2fd;
                }
                
                .ee-message-item.unread {
                    font-weight: 600;
                }
                
                .ee-message-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                
                .ee-message-from {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .ee-message-date {
                    font-size: 12px;
                    color: #666;
                    flex-shrink: 0;
                    margin-left: 8px;
                }
                
                .ee-message-subject {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-bottom: 2px;
                }
                
                .ee-message-preview {
                    font-size: 12px;
                    color: #666;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-weight: normal;
                }
                
                .ee-message-viewer {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .ee-message-actions {
                    padding: 12px 16px;
                    background: #f5f5f5;
                    border-bottom: 1px solid #ddd;
                    display: flex;
                    gap: 8px;
                }
                
                .ee-button {
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                }
                
                .ee-button:hover:not(:disabled) {
                    background: #f0f0f0;
                }
                
                .ee-button:disabled {
                    background: #e9ecef;
                    color: #6c757d;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                
                .ee-message-content {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }
                
                .ee-message-meta {
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .ee-message-meta-row {
                    margin-bottom: 4px;
                }
                
                .ee-message-meta-label {
                    display: inline-block;
                    width: 60px;
                    color: #666;
                    font-weight: 500;
                }
                
                .ee-message-body {
                    line-height: 1.6;
                }
                
                .ee-message-body img {
                    max-width: 100%;
                    height: auto;
                }
                
                .ee-empty-state {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #999;
                }
                
                .ee-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    color: #666;
                }
                
                .ee-error {
                    padding: 16px;
                    background: #fee;
                    color: #c00;
                    border: 1px solid #fcc;
                    border-radius: 4px;
                    margin: 16px;
                }
                
                .ee-flag {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4CAF50;
                    margin-right: 4px;
                }
                
                .ee-flag.unread {
                    background: #2196F3;
                }
                
                .ee-pagination {
                    padding: 8px 16px;
                    background: #f8f9fa;
                    border-top: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .ee-pagination-btn {
                    font-size: 12px;
                    padding: 4px 8px;
                }
                
                .ee-message-items {
                    flex: 1;
                    overflow-y: auto;
                }
            `;
            document.head.appendChild(style);
        }

        calculateFolderDepth(folder) {
            if (!folder.parentPath || !folder.delimiter) {
                return 0;
            }

            // Count the number of delimiter characters in the path to determine depth
            const pathParts = folder.path.split(folder.delimiter);
            return Math.max(0, pathParts.length - 1);
        }

        buildFolderTree() {
            // First, separate special use folders from regular folders
            const specialFolders = [];
            const regularFolders = [];

            this.folders.forEach(folder => {
                if (folder.specialUse) {
                    specialFolders.push(folder);
                } else {
                    regularFolders.push(folder);
                }
            });

            // Debug logging
            console.log(
                'All folders:',
                this.folders.map(f => `${f.name} (path: ${f.path}, parent: ${f.parentPath}, delimiter: ${f.delimiter})`)
            );
            console.log(
                'Regular folders for hierarchy:',
                regularFolders.map(f => `${f.name} (path: ${f.path}, parent: ${f.parentPath})`)
            );

            // Sort special folders in logical order
            const specialOrder = ['\\Inbox', '\\Drafts', '\\Sent', '\\Trash', '\\Junk', '\\Archive'];
            specialFolders.sort((a, b) => {
                // INBOX always first
                if (a.specialUse === '\\Inbox' || a.name.toLowerCase() === 'inbox') {
                    return -1;
                }
                if (b.specialUse === '\\Inbox' || b.name.toLowerCase() === 'inbox') {
                    return 1;
                }

                const aIndex = specialOrder.indexOf(a.specialUse);
                const bIndex = specialOrder.indexOf(b.specialUse);
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                if (aIndex !== -1) {
                    return -1;
                }
                if (bIndex !== -1) {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            });

            // Build hierarchical tree for regular folders
            const buildHierarchy = (folders, parentPath = null, depth = 0) => {
                const result = [];

                // Find direct children of this parent
                const children = folders.filter(f => {
                    if (parentPath === null) {
                        // Root level: folders that are direct children of INBOX or have no parent
                        return f.parentPath === 'INBOX' || !f.parentPath || f.parentPath === '';
                    } else {
                        // Child level: exact parentPath match
                        return f.parentPath === parentPath;
                    }
                });

                // Debug logging
                if (depth < 3) {
                    console.log(
                        `Level ${depth}, Parent: ${parentPath || 'ROOT'}, Found children:`,
                        children.map(c => `${c.name} (path: ${c.path}, parent: ${c.parentPath})`)
                    );
                }

                children.sort((a, b) => a.name.localeCompare(b.name));

                children.forEach(folder => {
                    result.push(folder);
                    // Recursively add children immediately after parent
                    result.push(...buildHierarchy(folders, folder.path, depth + 1));
                });

                return result;
            };

            const hierarchicalRegular = buildHierarchy(regularFolders);

            // Combine special folders first, then hierarchical regular folders
            return [...specialFolders, ...hierarchicalRegular];
        }

        renderFolderList() {
            const sidebar = this.container.querySelector('.ee-sidebar');

            const sortedFolders = this.buildFolderTree();

            const html = `
                <ul class="ee-folder-list">
                    ${sortedFolders
                        .map(folder => {
                            const depth = this.calculateFolderDepth(folder);
                            const hasChildren = this.folders.some(f => f.parentPath === folder.path);
                            return `
                            <li class="ee-folder-item ${folder.path === this.currentFolder ? 'active' : ''}" 
                                data-path="${folder.path}" 
                                data-depth="${depth}">
                                <div class="ee-folder-content" style="padding-left: ${8 + depth * 12}px;">
                                    ${depth > 0 ? '<span class="ee-folder-indent">└ </span>' : ''}
                                    <span class="ee-folder-name ${hasChildren ? 'has-children' : ''}">${folder.name}</span>
                                    ${folder.status && folder.status.messages > 0 ? `<span class="ee-folder-count">${folder.status.messages}</span>` : ''}
                                </div>
                            </li>
                        `;
                        })
                        .join('')}
                </ul>
            `;
            sidebar.innerHTML = html;

            // Add click handlers
            sidebar.querySelectorAll('.ee-folder-item').forEach(item => {
                item.addEventListener('click', () => {
                    const path = item.getAttribute('data-path');
                    this.loadMessages(path);
                });
            });
        }

        renderMessageList() {
            const messageList = this.container.querySelector('.ee-message-list');

            if (!this.messages.length) {
                messageList.innerHTML = '<div class="ee-empty-state">No messages</div>';
                return;
            }

            const paginationHtml =
                this.nextPageCursor || this.prevPageCursor
                    ? `
                <div class="ee-pagination">
                    ${this.prevPageCursor ? `<button class="ee-button ee-pagination-btn" data-action="prev-page">← Previous</button>` : ''}
                    ${this.nextPageCursor ? `<button class="ee-button ee-pagination-btn" data-action="next-page">Next →</button>` : ''}
                </div>
            `
                    : '';

            const html = `
                ${paginationHtml}
                <div class="ee-message-items">
                    ${this.messages
                        .map(
                            msg => `
                        <div class="ee-message-item ${msg.unseen ? 'unread' : ''} ${msg.id === (this.currentMessage && this.currentMessage.id) ? 'active' : ''}" data-id="${msg.id}">
                            <div class="ee-message-header">
                                <span class="ee-message-from">${msg.from ? msg.from.name || msg.from.address : 'Unknown'}</span>
                                <span class="ee-message-date">${this.formatDate(msg.date)}</span>
                            </div>
                            <div class="ee-message-subject">${msg.subject || '(no subject)'}</div>
                            <div class="ee-message-preview">${msg.intro || ''}</div>
                        </div>
                    `
                        )
                        .join('')}
                </div>
                ${paginationHtml}
            `;
            messageList.innerHTML = html;

            // Add click handlers for messages
            messageList.querySelectorAll('.ee-message-item').forEach(item => {
                item.addEventListener('click', () => {
                    const messageId = item.getAttribute('data-id');
                    this.loadMessage(messageId);
                });
            });

            // Add click handlers for pagination
            messageList.querySelectorAll('[data-action="prev-page"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.loadMessages(this.currentFolder, this.prevPageCursor);
                });
            });

            messageList.querySelectorAll('[data-action="next-page"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.loadMessages(this.currentFolder, this.nextPageCursor);
                });
            });
        }

        renderMessage() {
            const viewer = this.container.querySelector('.ee-message-viewer');
            if (!this.currentMessage) {
                viewer.innerHTML = '<div class="ee-empty-state">Select a message to view</div>';
                return;
            }

            const msg = this.currentMessage;
            const isUnseen = msg.unseen;
            const html = `
                <div class="ee-message-actions">
                    <button class="ee-button" data-action="toggle-read">Mark as ${isUnseen ? 'seen' : 'unseen'}</button>
                    <button class="ee-button" data-action="delete">Delete</button>
                    <select class="ee-button" data-action="move">
                        <option value="">Move to...</option>
                        ${this.buildFolderTree()
                            .map(folder => {
                                const depth = this.calculateFolderDepth(folder);
                                const indent = '　'.repeat(depth); // Using full-width space for better alignment
                                const prefix = depth > 0 ? '└ ' : '';
                                return `<option value="${folder.path}" ${folder.path === this.currentFolder ? 'disabled' : ''}>${indent}${prefix}${folder.name}</option>`;
                            })
                            .join('')}
                    </select>
                </div>
                <div class="ee-message-content">
                    <div class="ee-message-meta">
                        <div class="ee-message-meta-row">
                            <span class="ee-message-meta-label">From:</span>
                            ${msg.from ? `${msg.from.name || ''} &lt;${msg.from.address}&gt;` : 'Unknown'}
                        </div>
                        <div class="ee-message-meta-row">
                            <span class="ee-message-meta-label">To:</span>
                            ${msg.to ? msg.to.map(t => `${t.name || ''} &lt;${t.address}&gt;`).join(', ') : ''}
                        </div>
                        ${
                            msg.cc && msg.cc.length
                                ? `
                            <div class="ee-message-meta-row">
                                <span class="ee-message-meta-label">Cc:</span>
                                ${msg.cc.map(c => `${c.name || ''} &lt;${c.address}&gt;`).join(', ')}
                            </div>
                        `
                                : ''
                        }
                        <div class="ee-message-meta-row">
                            <span class="ee-message-meta-label">Date:</span>
                            ${new Date(msg.date).toLocaleString()}
                        </div>
                        <div class="ee-message-meta-row">
                            <span class="ee-message-meta-label">Subject:</span>
                            ${msg.subject || '(no subject)'}
                        </div>
                    </div>
                    <div class="ee-message-body">
                        ${msg.text && msg.text.html ? msg.text.html : msg.text && msg.text.plain ? `<pre>${msg.text.plain}</pre>` : ''}
                    </div>
                </div>
            `;
            viewer.innerHTML = html;

            // Add action handlers
            viewer.querySelector('[data-action="toggle-read"]').addEventListener('click', () => {
                const currentlyUnseen = msg.unseen;
                this.markAsRead(msg.id, currentlyUnseen); // if unseen, mark as seen (true), if seen mark as unseen (false)
            });

            viewer.querySelector('[data-action="delete"]').addEventListener('click', async () => {
                const result = await this.confirmMethod('Delete this message?');
                if (result) {
                    this.deleteMessage(msg.id);
                }
            });

            viewer.querySelector('[data-action="move"]').addEventListener('change', e => {
                const targetPath = e.target.value;
                if (targetPath) {
                    this.moveMessage(msg.id, targetPath);
                }
            });
        }

        createLayout() {
            this.container.innerHTML = `
                <div class="ee-client">
                    <div class="ee-sidebar">
                        <div class="ee-loading">Loading folders...</div>
                    </div>
                    <div class="ee-message-list">
                        <div class="ee-empty-state">Select a folder</div>
                    </div>
                    <div class="ee-message-viewer">
                        <div class="ee-empty-state">Select a message to view</div>
                    </div>
                </div>
            `;
        }

        init() {
            this.createStyles();
            this.createLayout();
            this.loadFolders();

            // Load inbox by default
            setTimeout(() => {
                const inbox =
                    this.folders.find(f => f.specialUse === '\\Inbox' || f.name.toLowerCase() === 'inbox') ||
                    this.folders[0];
                if (inbox) {
                    this.loadMessages(inbox.path);
                }
            }, 500);
        }
    }

    // Public API
    window.EmailEngineClient = function (options) {
        if (typeof options === 'string') {
            // If a string is passed, assume it's the container ID
            options = {
                container: document.getElementById(options)
            };
        } else if (options instanceof HTMLElement) {
            // If a DOM element is passed
            options = {
                container: options
            };
        } else if (typeof options === 'object' && options.containerId) {
            // If containerId is specified
            options.container = document.getElementById(options.containerId);
        }

        if (!options.container) {
            throw new Error('Container element not found');
        }

        if (!options.apiUrl) {
            console.warn('No API URL specified, using default http://127.0.0.1:3000');
        }

        if (!options.account) {
            throw new Error('Account identifier is required');
        }

        return new EmailEngineClient(options);
    };
})(window);

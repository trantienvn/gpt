// =================================================================
// PHẦN CẤU HÌNH MARKED - ĐẶT Ở ĐẦU SCRIPT CỦA BẠN
// =================================================================

marked.use({
    renderer: {
        code(code, language) {
            const codeString = String(code.text);

            let highlightedCode;
            if (language && hljs.getLanguage(language)) {
                highlightedCode = hljs.highlight(codeString, { language: language }).value;
            } else {
                highlightedCode = hljs.highlightAuto(codeString).value;
            }

            // CHỈ CÓ NÚT COPY, KHÔNG CÓ NÚT WORD WRAP
            return `
                <div class="code-wrapper">
                    <pre><code class="language-${language || ''}">${highlightedCode}</code></pre>
                    <button class="copy-btn" title="Copy to clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                        <span>Copy</span>
                    </button>
                </div>
            `;
        }
    }
});

// =================================================================
// LẮNG NGHE SỰ KIỆN CLICK NÚT COPY - LOẠI BỎ XỬ LÝ NÚT WORD WRAP
// =================================================================
document.addEventListener('click', function (event) {
    const copyButton = event.target.closest('.copy-btn');
    if (copyButton) {
        const wrapper = copyButton.closest('.code-wrapper');
        const codeBlock = wrapper.querySelector('pre code');

        if (codeBlock) {
            const codeText = codeBlock.textContent;

            navigator.clipboard.writeText(codeText).then(() => {
                const buttonText = copyButton.querySelector('span');
                buttonText.textContent = 'Đã copy!';
                copyButton.classList.add('copied');

                setTimeout(() => {
                    buttonText.textContent = 'Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Lỗi khi copy code: ', err);
                const buttonText = copyButton.querySelector('span');
                buttonText.textContent = 'Lỗi!';
            });
        }
    }
    // Đã loại bỏ phần xử lý sự kiện cho nút Word Wrap ở đây.
});

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const appLayout = document.querySelector('.app-layout');
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const newChatBtn = document.getElementById('new-chat-btn');
    const conversationList = document.getElementById('conversation-list');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const chatTitle = document.getElementById('chat-title');
    const modelSelect = document.getElementById('model-select');
    const apiProviderSelect = document.getElementById('api-provider-select');
    const sendBtn = document.getElementById('send-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');

    // Modal Elements
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const apiKeyInput = document.getElementById('api-key-modal');
    const apiKeyStatus = document.getElementById('api-key-status');
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    // --- SVG Icons ---
    const userAvatarSVG = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    const botAvatarSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.3333 4.83333C16.248 3.74803 14.7821 3.13883 13.25 3.13883C11.7179 3.13883 10.252 3.74803 9.16667 4.83333C8.08136 5.91864 7.47217 7.38455 7.47217 8.91667C7.47217 10.4488 8.08136 11.9147 9.16667 13L12 15.8333L14.8333 13C15.9186 11.9147 16.5278 10.4488 16.5278 8.91667C16.5278 7.38455 15.9186 5.91864 14.8333 4.83333L17.3333 4.83333Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.83331 17.3333L7.49998 14.6667" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.1667 17.3333L16.5 14.6667" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    // --- App State ---
    let appState = {
        theme: 'light',
        apiProvider: 'google',
        apiKeys: { google: null, openai: null },
        selectedModel: null,
        currentConversationId: null,
        conversations: {},
    };

    // --- State Management ---
    function loadState() {
        const savedState = localStorage.getItem('geminiMultiChat');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            appState = {
                ...appState,
                ...parsedState,
                apiKeys: { ...appState.apiKeys, ...(parsedState.apiKeys || {}) },
            };
        }
        if (!appState.currentConversationId || !appState.conversations[appState.currentConversationId]) {
            startNewConversation(false);
        }
        apiProviderSelect.value = appState.apiProvider;
        apiKeyInput.value = appState.apiKeys[appState.apiProvider] || '';
        updateProviderModels();
        setTheme(appState.theme);
        renderConversationList();
        loadConversation(appState.currentConversationId);
    }

    function saveState() {
        const currentProvider = apiProviderSelect.value;
        appState.apiKeys[currentProvider] = apiKeyInput.value.trim();
        appState.selectedModel = modelSelect.value;
        appState.apiProvider = currentProvider;
        appState.theme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('geminiMultiChat', JSON.stringify(appState));
    }

    // --- UI & Theme ---
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.checked = theme === 'dark';
        appState.theme = theme;
    }

    function toggleSidebar() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            appLayout.classList.toggle('sidebar-open');
        } else {
            appLayout.classList.toggle('sidebar-collapsed');
        }
    }

    function openSettingsModal() { settingsModal.classList.add('active'); }
    function closeSettingsModal() { settingsModal.classList.remove('active'); }

    // --- Conversation Management ---
    function startNewConversation(shouldSave = true) {
        const newId = `chat_${Date.now()}`;
        appState.conversations[newId] = {
            id: newId,
            title: 'New Conversation',
            history: [],
            createdAt: Date.now(),
        };
        switchConversation(newId, shouldSave);
    }

    function switchConversation(id, shouldSave = true) {
        if (id === appState.currentConversationId && !shouldSave) return;
        appState.currentConversationId = id;
        loadConversation(id);
        if (shouldSave) saveState();
    }

    function deleteSingleConversation(idToDelete) {
        if (Object.keys(appState.conversations).length <= 1) {
            appState.conversations[idToDelete].history = [];
            appState.conversations[idToDelete].title = 'New Conversation';
            loadConversation(idToDelete);
            renderConversationList();
            saveState();
            return;
        }
        delete appState.conversations[idToDelete];
        if (idToDelete === appState.currentConversationId) {
            const sortedConvs = Object.values(appState.conversations).sort((a, b) => b.createdAt - a.createdAt);
            const newCurrentId = sortedConvs[0]?.id;
            switchConversation(newCurrentId, false);
        }
        renderConversationList();
        saveState();
    }

    function deleteAllConversations() {
        if (confirm('Are you sure you want to delete all conversations?')) {
            appState.conversations = {};
            closeSettingsModal();
            startNewConversation(true);
        }
    }

    // --- Rendering ---
    function renderConversationList() {
        conversationList.innerHTML = '';
        Object.values(appState.conversations).sort((a, b) => b.createdAt - a.createdAt).forEach(conv => {
            const li = document.createElement('li');
            li.dataset.id = conv.id;
            if (conv.id === appState.currentConversationId) li.classList.add('active');
            const titleSpan = document.createElement('span');
            titleSpan.textContent = conv.title;
            li.appendChild(titleSpan);
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-conv-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // if (confirm(`Delete "${conv.title}"?`)) {
                deleteSingleConversation(conv.id);
                // }
            });
            li.appendChild(deleteBtn);
            li.addEventListener('click', () => switchConversation(conv.id));
            conversationList.appendChild(li);
        });
    }

    function loadConversation(id) {
        if (!id || !appState.conversations[id]) return;
        const conversation = appState.conversations[id];
        chatTitle.textContent = conversation.title;
        chatBox.innerHTML = '';
        if (conversation.history.length === 0) {
            const welcome = document.createElement('div');
            welcome.classList.add('welcome-message');
            const welcomeHeading = document.createElement('h1');
            welcomeHeading.textContent = 'Gemini';
            welcome.appendChild(welcomeHeading);
            chatBox.appendChild(welcome);
        }
        conversation.history.forEach(item => addMessageToUI(item.parts[0].text, item.role === 'model' ? 'bot' : 'user'));
        renderConversationList();
    }

    function addMessageToUI(message, type, mediaFiles = []) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = type === 'user' ? userAvatarSVG : botAvatarSVG;
        messageDiv.appendChild(avatarDiv);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');

        // Thêm phần text message nếu có
        if (message) {
            const textContentDiv = document.createElement('div');
            textContentDiv.classList.add('text-content');
            textContentDiv.innerHTML = type === 'bot'
                ? marked.parse(message)
                : message.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\n/g, '<br>');
            contentDiv.appendChild(textContentDiv);
        }

        // Thêm phần media nếu có
        if (mediaFiles.length > 0) {
            const mediaContentDiv = document.createElement('div');
            mediaContentDiv.classList.add('media-content');
            
            mediaFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.classList.add('chat-media');
                    img.addEventListener('click', () => {
                        window.open(img.src, '_blank');
                    });
                    mediaContentDiv.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = URL.createObjectURL(file);
                    video.classList.add('chat-media');
                    video.controls = true;
                    mediaContentDiv.appendChild(video);
                }
            });
            
            contentDiv.appendChild(mediaContentDiv);
        }

        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    }

    // --- API & Chat Logic ---
    function updateProviderModels() {
        const provider = apiProviderSelect.value;
        apiKeyInput.value = appState.apiKeys[provider] || '';
        modelSelect.innerHTML = '';

        if (appState.apiKeys[provider]) {
            validateApiKey(true);
        }
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const userMessageText = userInput.value.trim();
        const currentConv = appState.conversations[appState.currentConversationId];
        const provider = appState.apiProvider;
        if (!appState.apiKeys[provider] || !modelSelect.value) {
            openSettingsModal();
            setApiStatus('Please set your API Key and choose a model.', 'error');
            return;
        }
        if (!userMessageText || !currentConv) return;
        if (currentConv.history.length === 0) {
            currentConv.title = userMessageText.substring(0, 30) + (userMessageText.length > 30 ? '...' : '');
            renderConversationList();
            chatBox.innerHTML = '';
        }
        addMessageToUI(userMessageText, 'user');
        currentConv.history.push({ role: 'user', parts: [{ text: userMessageText }] });
        userInput.value = '';
        sendBtn.classList.remove('visible');
        saveState();
        const botMessageElement = addMessageToUI('...', 'bot');
        const botTextContent = botMessageElement.querySelector('.text-content');
        if (provider === 'google') {
            handleGoogleRequest(currentConv, botTextContent, botMessageElement);
        } else if (provider === 'openai') {
            handleOpenAIRequest(currentConv, botTextContent, botMessageElement);
        }
    }

    async function handleGoogleRequest(currentConv, botTextContent, botMessageElement) {
        try {
            // Chỉ lấy phần text history để gửi lên API
            const context = currentConv.history.filter(msg => msg.parts[0].text).slice(-10);
            const apiKey = appState.apiKeys.google;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelSelect.value}:streamGenerateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: context })
            });            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Unknown API error');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = '';

            // Tối ưu: Lập lịch để cập nhật Markdown
            const updateInterval = 50; // Cập nhật sau mỗi 50ms
            let lastRenderedText = '';
            const intervalId = setInterval(() => {
                if (lastRenderedText !== fullResponseText) {
                    botTextContent.innerHTML = marked.parse(fullResponseText);
                    chatBox.scrollTop = chatBox.scrollHeight;
                    lastRenderedText = fullResponseText;
                }
            }, updateInterval);

            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    try {
                        // Tối ưu: Chỉ nối chuỗi vào biến fullResponseText
                        const jsonString = decoder.decode(value, { stream: true });
                        const data = JSON.parse(jsonString.replace(/^[\[,]/, ''));
                        if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
                            const textChunk = data.candidates[0].content.parts[0].text || '';
                            fullResponseText += textChunk;
                        }
                    } catch (error) {
                        console.error('Lỗi khi xử lý JSON chunk:', error);
                    }
                }
            } finally {
                clearInterval(intervalId); // Quan trọng: Dừng interval khi luồng kết thúc
                reader.releaseLock();
            }

            // Sau khi luồng kết thúc, cập nhật toàn bộ nội dung với Markdown một lần duy nhất
            if (fullResponseText) {
                botTextContent.innerHTML = marked.parse(fullResponseText);
                currentConv.history.push({ role: 'model', parts: [{ text: fullResponseText }] });
                saveState();
            } else {
                throw new Error('No response received from API or response was empty.');
            }

        } catch (error) {
            botTextContent.textContent = `Error: ${error.message}`;
            botMessageElement.classList.add('error-message');
            console.error('handleGoogleRequest failed:', error);
        }
    }

    async function handleOpenAIRequest(currentConv, botTextContent, botMessageElement) {
        try {
            const apiKey = appState.apiKeys.openai;
            const apiUrl = 'http://localhost:1234/v1/chat/completions';
            const messages = currentConv.history.map(h => ({
                role: h.role === 'model' ? 'assistant' : h.role,
                content: h.parts[0].text
            }));

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelSelect.value,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error((await response.json()).error.message);
            }

            const reader = response.body.getReader();
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim()).map(line => line.replace(/^data: /, ''));

                for (const line of lines) {
                    if (line === '[DONE]') continue;
                    try {
                        const data = JSON.parse(line);
                        const content = data.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullResponse += content;
                            botTextContent.innerHTML = marked.parse(fullResponse);
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }

            if (fullResponse) {
                currentConv.history.push({ role: 'model', parts: [{ text: fullResponse }] });
                saveState();
            } else {
                throw new Error('No response received from API.');
            }
        } catch (error) {
            botTextContent.textContent = `Error: ${error.message}`;
            botMessageElement.classList.add('error-message');
        }
    }

    async function validateApiKey(isSilent = false) {
        const provider = apiProviderSelect.value;
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            if (!isSilent) setApiStatus('Please enter an API key.', 'error');
            return;
        }
        setApiStatus('Validating...', '');
        let validationUrl, headers;
        if (provider === 'google') {
            validationUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            headers = {};
        } else { // openai
            validationUrl = 'http://localhost:1234/v1/models';
            headers = { 'Authorization': `Bearer ${apiKey}` };
        }
        try {
            const response = await fetch(validationUrl, { headers });
            if (response.ok) {
                setApiStatus('API Key is valid.', 'success');
                appState.apiKeys[provider] = apiKey;
                const data = await response.json();
                if (provider === 'google') {
                    populateModels(data.models, true);
                } else {
                    populateModels(data.data, false);
                }
                saveState();
            } else {
                setApiStatus(`Error: ${(await response.json()).error.message}`, 'error');
            }
        } catch (error) {
            setApiStatus('Network error or API is unreachable.', 'error');
        }
    }

    function populateModels(models, isGoogle) {
        const savedModel = appState.selectedModel;
        modelSelect.innerHTML = '';
        let modelsToPopulate = [];
        if (isGoogle) {
            modelsToPopulate = models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
        } else { // Is OpenAI
            modelsToPopulate = models.filter(m => m.id).sort((a, b) => a.id.localeCompare(b.id));
        }
        modelsToPopulate.forEach(m => {
            const option = document.createElement('option');
            const modelId = isGoogle ? m.name.replace('models/', '') : m.id;
            const modelName = isGoogle ? m.displayName : m.id;
            option.value = modelId;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        });
        if (savedModel && Array.from(modelSelect.options).some(opt => opt.value === savedModel)) {
            modelSelect.value = savedModel;
        }
    }

    function setApiStatus(message, status) {
        apiKeyStatus.textContent = message;
        apiKeyStatus.className = status ? `status-${status}` : '';
    }

    // Xử lý upload file
    let selectedFiles = [];

    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        selectedFiles = selectedFiles.concat(files);
        
        // Hiển thị preview của files đã chọn
        const message = selectedFiles.map(file => file.name).join('\n');
        userInput.value = message;
        sendBtn.classList.add('visible');
    }

    async function handleChatSubmitWithFiles(e) {
        e.preventDefault();
        const userMessageText = userInput.value.trim();
        const currentConv = appState.conversations[appState.currentConversationId];
        
        if (!userMessageText && selectedFiles.length === 0) return;

        if (currentConv.history.length === 0) {
            currentConv.title = userMessageText || 'Media Message';
            renderConversationList();
            chatBox.innerHTML = '';
        }

        // Hiển thị tin nhắn với media
        addMessageToUI(userMessageText, 'user', selectedFiles);
        
        // Lưu tin nhắn vào history với cấu trúc tương thích API
        if (userMessageText) {
            currentConv.history.push({ 
                role: 'user', 
                parts: [{ text: userMessageText }]
            });
        }

        // Lưu thông tin media riêng
        if (selectedFiles.length > 0) {
            currentConv.mediaHistory = currentConv.mediaHistory || [];
            currentConv.mediaHistory.push({
                timestamp: Date.now(),
                files: selectedFiles.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size
                }))
            });
        }

        // Reset input và files
        userInput.value = '';
        selectedFiles = [];
        fileInput.value = '';
        sendBtn.classList.remove('visible');
        
        saveState();

        // Xử lý phản hồi từ AI nếu có tin nhắn văn bản
        if (userMessageText) {
            const botMessageElement = addMessageToUI('...', 'bot');
            const botTextContent = botMessageElement.querySelector('.text-content');
            const provider = appState.apiProvider;
            
            if (provider === 'google') {
                handleGoogleRequest(currentConv, botTextContent, botMessageElement);
            } else if (provider === 'openai') {
                handleOpenAIRequest(currentConv, botTextContent, botMessageElement);
            }
        }
    }

    // Xử lý paste
    async function handlePaste(e) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        
        for (const item of items) {
            if (item.type.indexOf('image') !== -1 || item.type.indexOf('video') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    selectedFiles.push(file);
                    updateFilePreview();
                }
            }
        }
    }

    // Xử lý drag & drop
    function handleDragOver(e) {
        e.preventDefault();
        userInput.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        userInput.classList.remove('drag-over');
    }

    async function handleDrop(e) {
        e.preventDefault();
        userInput.classList.remove('drag-over');
        
        const items = [];
        if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                const item = e.dataTransfer.items[i];
                if (item.type.indexOf('image') !== -1 || item.type.indexOf('video') !== -1) {
                    const file = item.getAsFile();
                    items.push(file);
                }
            }
        } else {
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                const file = e.dataTransfer.files[i];
                if (file.type.indexOf('image') !== -1 || file.type.indexOf('video') !== -1) {
                    items.push(file);
                }
            }
        }

        if (items.length > 0) {
            selectedFiles = selectedFiles.concat(items);
            updateFilePreview();
        }
    }

    // Cập nhật preview của files
    function updateFilePreview() {
        if (selectedFiles.length > 0) {
            const fileNames = selectedFiles.map(file => file.name).join(', ');
            const previewDiv = document.getElementById('file-preview') || document.createElement('div');
            previewDiv.id = 'file-preview';
            
            let previewContent = '<div class="preview-files">';
            selectedFiles.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const imgUrl = URL.createObjectURL(file);
                    previewContent += `
                        <div class="preview-item">
                            <img src="${imgUrl}" alt="${file.name}">
                            <button class="remove-file" data-index="${index}">&times;</button>
                        </div>`;
                } else if (file.type.startsWith('video/')) {
                    previewContent += `
                        <div class="preview-item">
                            <div class="video-preview">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                                <span>${file.name}</span>
                            </div>
                            <button class="remove-file" data-index="${index}">&times;</button>
                        </div>`;
                }
            });
            previewContent += '</div>';
            
            previewDiv.innerHTML = previewContent;
            
            if (!document.getElementById('file-preview')) {
                chatForm.insertBefore(previewDiv, userInput);
            }

            // Add event listeners for remove buttons
            previewDiv.querySelectorAll('.remove-file').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    selectedFiles.splice(index, 1);
                    updateFilePreview();
                });
            });
        } else {
            const previewDiv = document.getElementById('file-preview');
            if (previewDiv) {
                previewDiv.remove();
            }
        }
        
        // Show send button if there are files or text
        sendBtn.classList.toggle('visible', selectedFiles.length > 0 || userInput.value.trim() !== '');
    }

    // --- Event Listeners ---
    apiProviderSelect.addEventListener('change', updateProviderModels);
    userInput.addEventListener('input', () => { sendBtn.classList.toggle('visible', userInput.value.trim() !== ''); });
    userInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) handleChatSubmitWithFiles(e); });
    userInput.addEventListener('paste', handlePaste);
    userInput.addEventListener('dragover', handleDragOver);
    userInput.addEventListener('dragleave', handleDragLeave);
    userInput.addEventListener('drop', handleDrop);
    apiKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') validateApiKey(false); });
    chatForm.addEventListener('submit', handleChatSubmitWithFiles);
    newChatBtn.addEventListener('click', () => { startNewConversation(true); });
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
    settingsBtn.addEventListener('click', openSettingsModal);
    closeModalBtn.addEventListener('click', closeSettingsModal);
    deleteAllBtn.addEventListener('click', deleteAllConversations);
    themeToggle.addEventListener('change', () => { setTheme(themeToggle.checked ? 'dark' : 'light'); saveState(); });
    window.addEventListener('click', e => { if (e.target === settingsModal) closeSettingsModal(); });
    
    // File upload listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // --- Initial Load ---
    loadState();
});

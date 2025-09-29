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
document.addEventListener('click', function(event) {
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

    function addMessageToUI(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = type === 'user' ? userAvatarSVG : botAvatarSVG;
        const textContentDiv = document.createElement('div');
        textContentDiv.classList.add('text-content');
        textContentDiv.innerHTML = type === 'bot'
            ? marked.parse(message)
            : message.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, '<br>');
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textContentDiv);
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
            const context = currentConv.history.slice(-10);
            const apiKey = appState.apiKeys.google;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelSelect.value}:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: context }) });
            if (!response.ok) throw new Error((await response.json()).error.message);
            let data = await response.json();
            if (Array.isArray(data)) {
                data = data[0];
            }
            const fullResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (fullResponse) {
                botTextContent.innerHTML = marked.parse(fullResponse);
                currentConv.history.push({ role: 'model', parts: [{ text: fullResponse }] });
                saveState();
            } else {
                throw new Error('Invalid response structure from API.');
            }
        } catch (error) {
            botTextContent.textContent = `Error: ${error.message}`;
            botMessageElement.classList.add('error-message');
        }
    }

    async function handleOpenAIRequest(currentConv, botTextContent, botMessageElement) {
        try {
            const apiKey = appState.apiKeys.openai;
            const apiUrl = 'http://localhost:1234/v1/chat/completions';
            const messages = currentConv.history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts[0].text }));
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: modelSelect.value, messages: messages, stream: false }) });
            if (!response.ok) { throw new Error((await response.json()).error.message); }
            const data = await response.json();
            const fullResponse = data?.choices?.[0]?.message?.content;
            if (fullResponse) {
                botTextContent.textContent = fullResponse;
                currentConv.history.push({ role: 'model', parts: [{ text: fullResponse }] });
                saveState();
            } else {
                throw new Error('Invalid response structure from API.');
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

    // --- Event Listeners ---
    apiProviderSelect.addEventListener('change', updateProviderModels);
    userInput.addEventListener('input', () => { sendBtn.classList.toggle('visible', userInput.value.trim() !== ''); });
    userInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) handleChatSubmit(e); });
    apiKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') validateApiKey(false); });
    chatForm.addEventListener('submit', handleChatSubmit);
    newChatBtn.addEventListener('click', () => { startNewConversation(true); });
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
    settingsBtn.addEventListener('click', openSettingsModal);
    closeModalBtn.addEventListener('click', closeSettingsModal);
    deleteAllBtn.addEventListener('click', deleteAllConversations);
    themeToggle.addEventListener('change', () => { setTheme(themeToggle.checked ? 'dark' : 'light'); saveState(); });
    window.addEventListener('click', e => { if (e.target === settingsModal) closeSettingsModal(); });

    // --- Initial Load ---
    loadState();
});

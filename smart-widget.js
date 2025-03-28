// QualiaBot Smart Widget with Local Data v1.0.0
(function() {
  // Configuration
  const config = {
    widgetPosition: 'right',
    mobileBreakpoint: 768,
    zIndex: 2147483647,
    initialDelay: 1500,
    perplexityApiKey: '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',
    maxTokens: 200,
    searchContextSize: 'low',
    maxUsagePerDay: 100,
    localDataUrl: 'https://qualiasolutions.github.io/qualiabot/sitemapData.json',
    useLocalData: true
  };

  // Local data store
  let siteData = null;

  // System prompt with site context
  const SYSTEM_PROMPT = `You are QualiaBot, an AI assistant for Qualia Solutions, a web design and AI integration company based in Cyprus.
  
  Qualia Solutions provides services including web design, SEO optimization, digital advertising, AI automation, and chatbot development.
  
  If you don't know the answer or if users ask about pricing, contracts, or specific timelines, suggest contacting info@qualiasolutions.net.`;

  // Track usage
  let usageKey = 'qualiaBotApiUsage_' + new Date().toISOString().split('T')[0];
  let dailyUsage = parseInt(localStorage.getItem(usageKey) || '0');

  // Fetch local data
  async function fetchLocalData() {
    try {
      const response = await fetch(config.localDataUrl);
      if (response.ok) {
        siteData = await response.json();
        console.log('QualiaBot: Local data loaded successfully');
      } else {
        console.error('QualiaBot: Failed to load local data');
      }
    } catch (error) {
      console.error('QualiaBot: Error loading local data', error);
    }
  }

  // Get relevant context from site data
  function getRelevantContext(query) {
    if (!siteData || !config.useLocalData) {
      return '';
    }

    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Prepare results array with scores
    let results = [];
    
    // Search through pages
    if (siteData.pages) {
      siteData.pages.forEach(page => {
        let score = 0;
        const pageText = (page.title + ' ' + page.description + ' ' + (page.content || '')).toLowerCase();
        
        // Check for exact matches first
        if (pageText.includes(normalizedQuery)) {
          score += 10;
        }
        
        // Check for keyword matches
        const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 3);
        keywords.forEach(keyword => {
          if (pageText.includes(keyword)) {
            score += 2;
          }
        });
        
        // If we have a score, add to results
        if (score > 0) {
          results.push({
            score,
            title: page.title,
            description: page.description,
            url: page.url,
            content: page.content || page.description
          });
        }
      });
    }
    
    // If no results found
    if (results.length === 0) {
      return '';
    }
    
    // Sort results by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    // Take top results
    const topResults = results.slice(0, 2);
    
    // Build context from top results
    let context = 'Here is some relevant information from the Qualia Solutions website:\n\n';
    
    topResults.forEach((result, index) => {
      context += `Page: ${result.title}\n`;
      context += `Description: ${result.description}\n`;
      if (result.content) {
        const contentSummary = result.content.length > 300 
          ? result.content.substring(0, 300) + '...' 
          : result.content;
        context += `Content: ${contentSummary}\n`;
      }
      context += `URL: ${result.url}\n\n`;
    });
    
    return context;
  }

  // Create widget container with styles
  function createWidgetContainer() {
    const container = document.createElement('div');
    container.id = 'qualia-bot-container';
    
    const containerStyles = {
      position: 'fixed',
      bottom: '0',
      [config.widgetPosition]: '0',
      zIndex: config.zIndex.toString(),
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: config.widgetPosition === 'right' ? 'flex-end' : 'flex-start',
      justifyContent: 'flex-end',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, sans-serif'
    };
    
    Object.keys(containerStyles).forEach(key => {
      container.style[key] = containerStyles[key];
    });
    
    document.body.appendChild(container);
    return container;
  }

  // Add the basic chat UI elements
  function createChatInterface(container) {
    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'qualia-widget-toggle';
    toggleButton.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: #10121F;
      border: 1px solid rgba(0, 164, 172, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      outline: none;
      margin: 20px;
      pointer-events: auto;
    `;
    
    // Bot logo
    const botLogo = document.createElement('img');
    botLogo.src = 'https://qualiasolutions.github.io/qualiabot/favicon-96x96.png';
    botLogo.alt = 'QualiaBot';
    botLogo.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 16px;
    `;
    
    toggleButton.appendChild(botLogo);
    container.appendChild(toggleButton);
    
    // Chat content container
    const chatContent = document.createElement('div');
    chatContent.className = 'qualia-widget-content';
    chatContent.style.cssText = `
      opacity: 0;
      visibility: hidden;
      width: 380px;
      height: 500px;
      background: #10121F;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 164, 172, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateY(20px) scale(0.95);
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      margin: 0 20px 20px 20px;
      position: absolute;
      bottom: 60px;
      right: 0;
    `;
    
    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.className = 'qualia-widget-header';
    chatHeader.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #1A1C2E;
      border-bottom: 1px solid rgba(0, 164, 172, 0.2);
      padding: 0 16px;
      height: 40px;
      user-select: none;
    `;
    
    // Title
    const chatTitle = document.createElement('div');
    chatTitle.className = 'qualia-widget-title';
    chatTitle.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    const headerLogo = document.createElement('img');
    headerLogo.src = 'https://qualiasolutions.github.io/qualiabot/favicon-96x96.png';
    headerLogo.alt = 'QualiaBot';
    headerLogo.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 4px;
    `;
    
    const titleText = document.createElement('span');
    titleText.textContent = 'QualiaBot';
    titleText.style.cssText = `
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
    `;
    
    chatTitle.appendChild(headerLogo);
    chatTitle.appendChild(titleText);
    
    // Controls
    const chatControls = document.createElement('div');
    chatControls.className = 'qualia-widget-controls';
    chatControls.style.cssText = `
      display: flex;
      gap: 8px;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'qualia-control-button qualia-close-button';
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      font-size: 14px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
      outline: none;
    `;
    
    chatControls.appendChild(closeButton);
    chatHeader.appendChild(chatTitle);
    chatHeader.appendChild(chatControls);
    chatContent.appendChild(chatHeader);
    
    // Custom chat interface
    const chatBody = document.createElement('div');
    chatBody.className = 'qualia-chat-body';
    chatBody.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      height: calc(100% - 40px);
      overflow: hidden;
      background-color: #10121F;
    `;
    
    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'qualia-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
    
    // Add initial message
    const initialMessage = document.createElement('div');
    initialMessage.className = 'qualia-message qualia-bot-message';
    initialMessage.style.cssText = `
      max-width: 80%;
      padding: 12px 16px;
      background-color: rgba(0, 164, 172, 0.15);
      border: 1px solid rgba(0, 164, 172, 0.2);
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      color: #ffffff;
      font-size: 14px;
      line-height: 1.5;
    `;
    initialMessage.textContent = "Hi! I'm QualiaBot, your assistant for Qualia Solutions. How can I help you today?";
    messagesContainer.appendChild(initialMessage);
    
    // Citations container for styling
    const citationsStyle = document.createElement('style');
    citationsStyle.textContent = `
      .citation-link {
        color: rgba(0, 164, 172, 1);
        text-decoration: underline;
        margin-right: 5px;
        font-size: 12px;
      }
      .citation-container {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    `;
    document.head.appendChild(citationsStyle);
    
    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'qualia-input-area';
    inputArea.style.cssText = `
      display: flex;
      padding: 12px;
      gap: 8px;
      border-top: 1px solid rgba(0, 164, 172, 0.2);
      background-color: #1A1C2E;
    `;
    
    const textInput = document.createElement('input');
    textInput.className = 'qualia-text-input';
    textInput.placeholder = 'Type your message here...';
    textInput.style.cssText = `
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid rgba(0, 164, 172, 0.2);
      background-color: #1A1C2E;
      color: #fff;
      font-size: 14px;
      outline: none;
    `;
    
    const sendButton = document.createElement('button');
    sendButton.className = 'qualia-send-button';
    sendButton.textContent = 'Send';
    sendButton.style.cssText = `
      background-color: rgba(0, 164, 172, 0.8);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0 16px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    `;
    
    inputArea.appendChild(textInput);
    inputArea.appendChild(sendButton);
    
    chatBody.appendChild(messagesContainer);
    chatBody.appendChild(inputArea);
    chatContent.appendChild(chatBody);
    container.appendChild(chatContent);
    
    // Event listeners
    let isOpen = false;
    
    toggleButton.addEventListener('click', () => {
      if (isOpen) {
        chatContent.style.opacity = '0';
        chatContent.style.visibility = 'hidden';
        chatContent.style.transform = 'translateY(20px) scale(0.95)';
      } else {
        chatContent.style.opacity = '1';
        chatContent.style.visibility = 'visible';
        chatContent.style.transform = 'translateY(0) scale(1)';
      }
      isOpen = !isOpen;
    });
    
    closeButton.addEventListener('click', () => {
      chatContent.style.opacity = '0';
      chatContent.style.visibility = 'hidden';
      chatContent.style.transform = 'translateY(20px) scale(0.95)';
      isOpen = false;
    });
    
    // Chat functionality
    const messages = [{
      role: 'system',
      content: SYSTEM_PROMPT
    }, {
      role: 'assistant',
      content: initialMessage.textContent
    }];
    
    // Function to parse citations from response
    function parseCitations(text) {
      // Regular expression to find citation links like [[1]](https://example.com)
      const citationRegex = /\[\[(\d+)\]\]\((https?:\/\/[^\s]+)\)/g;
      const citations = [];
      let match;
      
      // Extract citations
      while ((match = citationRegex.exec(text)) !== null) {
        citations.push({
          number: match[1],
          url: match[2]
        });
      }
      
      // Clean the text by removing citation links
      const cleanText = text.replace(citationRegex, '[[' + '$1' + ']]');
      
      return { cleanText, citations };
    }
    
    function addMessage(text, isUser, citations = []) {
      const messageEl = document.createElement('div');
      messageEl.className = `qualia-message ${isUser ? 'qualia-user-message' : 'qualia-bot-message'}`;
      messageEl.style.cssText = isUser 
        ? `
          max-width: 80%;
          padding: 12px 16px;
          background-color: #2A2C3E;
          border-radius: 12px;
          border-bottom-right-radius: 4px;
          align-self: flex-end;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.5;
        `
        : `
          max-width: 80%;
          padding: 12px 16px;
          background-color: rgba(0, 164, 172, 0.15);
          border: 1px solid rgba(0, 164, 172, 0.2);
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          align-self: flex-start;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.5;
        `;
      
      if (!isUser && citations.length > 0) {
        // Replace [[1]] with spans for styling
        let formattedText = text;
        citations.forEach((citation, index) => {
          formattedText = formattedText.replace(
            `[[${citation.number}]]`, 
            `<span class="citation-ref">[${citation.number}]</span>`
          );
        });
        
        messageEl.innerHTML = formattedText;
        
        // Add citations
        const citationsContainer = document.createElement('div');
        citationsContainer.className = 'citation-container';
        
        citations.forEach((citation) => {
          const link = document.createElement('a');
          link.href = citation.url;
          link.className = 'citation-link';
          link.textContent = `[${citation.number}]`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          citationsContainer.appendChild(link);
        });
        
        messageEl.appendChild(citationsContainer);
      } else {
        messageEl.textContent = text;
      }
      
      messagesContainer.appendChild(messageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Update messages array
      messages.push({
        role: isUser ? 'user' : 'assistant',
        content: text
      });
    }
    
    async function sendMessage() {
      const text = textInput.value.trim();
      if (!text) return;
      
      // Add user message to chat
      addMessage(text, true);
      textInput.value = '';
      
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'qualia-typing-indicator';
      typingIndicator.style.cssText = `
        max-width: 80%;
        padding: 12px 16px;
        background-color: rgba(0, 164, 172, 0.15);
        border: 1px solid rgba(0, 164, 172, 0.2);
        border-radius: 12px;
        border-bottom-left-radius: 4px;
        align-self: flex-start;
        color: #ffffff;
        font-size: 14px;
        line-height: 1.5;
      `;
      typingIndicator.textContent = "...";
      messagesContainer.appendChild(typingIndicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      try {
        // Check daily usage limit
        if (dailyUsage >= config.maxUsagePerDay) {
          // Remove typing indicator
          messagesContainer.removeChild(typingIndicator);
          
          addMessage("I've reached my daily limit. Please contact our team at info@qualiasolutions.net for assistance, or try again tomorrow.", false);
          return;
        }
        
        // Get relevant context from site data
        const siteContext = getRelevantContext(text);
        
        // Update usage counter for API call
        dailyUsage++;
        localStorage.setItem(usageKey, dailyUsage.toString());
        
        // Create message array with site context
        const promptMessages = [
          { role: 'system', content: SYSTEM_PROMPT }
        ];
        
        // Add conversation history (last 4 messages)
        const historyMessages = messages.slice(-4);
        promptMessages.push(...historyMessages);
        
        // Add site context if available
        if (siteContext) {
          promptMessages.push({ 
            role: 'system', 
            content: siteContext
          });
        }
        
        // Add current user query
        promptMessages.push({ role: 'user', content: text });
        
        // Call Perplexity API with Sonar model
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.perplexityApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: promptMessages,
            temperature: 0.7,
            max_tokens: config.maxTokens,
            search_context_size: config.searchContextSize
          })
        });
        
        // Handle response
        if (response.ok) {
          const data = await response.json();
          const botResponse = data.choices[0].message.content;
          
          // Remove typing indicator
          messagesContainer.removeChild(typingIndicator);
          
          // Parse citations and add bot response
          const { cleanText, citations } = parseCitations(botResponse);
          addMessage(cleanText, false, citations);
        } else {
          // Remove typing indicator
          messagesContainer.removeChild(typingIndicator);
          
          // Add error message
          addMessage("I'm having trouble connecting. Please contact info@qualiasolutions.net for assistance.", false);
          console.error('Perplexity API error:', await response.text());
        }
      } catch (error) {
        // Remove typing indicator
        messagesContainer.removeChild(typingIndicator);
        
        // Add error message
        addMessage("I'm having trouble. Please contact info@qualiasolutions.net for assistance.", false);
        console.error('Error calling Perplexity API:', error);
      }
    }
    
    // Event listeners for chat
    sendButton.addEventListener('click', sendMessage);
    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Initialize everything
  async function initWidget() {
    // Load local data first
    if (config.useLocalData) {
      await fetchLocalData();
    }
    
    // Create widget container
    const container = createWidgetContainer();
    
    // Add chat interface
    createChatInterface(container);
    
    // Expose configuration API
    window.QualiaBot = window.QualiaBot || {};
    window.QualiaBot.configure = function(customConfig) {
      Object.assign(config, customConfig);
    };
  }

  // Run initialization after a delay
  setTimeout(initWidget, config.initialDelay);
})(); 
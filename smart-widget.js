// QualiaBot Smart Widget with Local Data v1.0.0
(function() {
  // Configuration
  const config = {
    widgetPosition: 'right',
    mobileBreakpoint: 768,
    zIndex: 2147483647,
    initialDelay: 1500,
    perplexityApiKey: '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',
    maxTokens: 150,
    searchContextSize: 'low',
    maxUsagePerDay: 100,
    shortResponses: true,
    localDataUrl: 'https://qualiasolutions.github.io/qualiabot/sitemapData.json',
    useLocalData: true
  };

  // Local data store
  let siteData = null;

  // System prompt for concise but natural responses
  const SYSTEM_PROMPT = `You are QualiaBot, an AI assistant for Qualia Solutions. Your responses should be helpful, conversational and natural, but still concise (keep to 3-4 sentences max).
  
  You represent Qualia Solutions, a web design and AI integration company based in Cyprus that creates modern websites and helps businesses integrate AI tools.
  
  If you can't answer a question or if the user asks about specific quotes, timelines, or contracts, suggest contacting info@qualiasolutions.net.`;

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

  // Try to find answer in local data
  function findLocalAnswer(query) {
    if (!siteData || !config.useLocalData) {
      return null;
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
      return null;
    }
    
    // Sort results by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    // Take top results
    const topResults = results.slice(0, 2);
    
    // Format a response based on results
    let response = '';
    
    if (topResults.length > 0) {
      // Get the best match
      const bestMatch = topResults[0];
      
      // Create different responses based on query type
      if (normalizedQuery.includes("what is") || normalizedQuery.includes("who is") || 
          normalizedQuery.includes("tell me about") || normalizedQuery.includes("info")) {
        response = `${bestMatch.title.replace(" | Qualia Solutions", "")} is ${bestMatch.description} `;
        
        // Add a bit more detail
        if (bestMatch.content && bestMatch.content.length > 20) {
          // Get a relevant sentence from the content
          const sentences = bestMatch.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (sentences.length > 0) {
            let relevantSentence = sentences[0].trim();
            // Try to find a more relevant sentence if available
            for (let i = 0; i < sentences.length; i++) {
              const sentence = sentences[i].toLowerCase();
              if (keywords.some(kw => sentence.includes(kw))) {
                relevantSentence = sentences[i].trim();
                break;
              }
            }
            response += relevantSentence + ". ";
          }
        }
      } else if (normalizedQuery.includes("contact") || normalizedQuery.includes("email") || 
                normalizedQuery.includes("phone") || normalizedQuery.includes("reach")) {
        response = `You can contact Qualia Solutions at info@qualiasolutions.net. `;
        if (bestMatch.content && bestMatch.content.includes("contact")) {
          // Extract contact-related information
          const contactStart = bestMatch.content.toLowerCase().indexOf("contact");
          if (contactStart > 0) {
            const contactInfo = bestMatch.content.substring(contactStart, contactStart + 150);
            const cleanedContact = contactInfo.replace(/\s+/g, ' ').trim();
            response += cleanedContact + " ";
          }
        }
      } else if (normalizedQuery.includes("service") || normalizedQuery.includes("offer") || 
                normalizedQuery.includes("provide") || normalizedQuery.includes("help")) {
        response = `Qualia Solutions offers ${bestMatch.description.toLowerCase()} `;
        if (bestMatch.content) {
          // Try to find services-related content
          const serviceKeywords = ["service", "offer", "provide", "specialize", "expert"];
          let serviceInfo = "";
          const sentences = bestMatch.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
          for (const sentence of sentences) {
            if (serviceKeywords.some(kw => sentence.toLowerCase().includes(kw))) {
              serviceInfo = sentence.trim() + ". ";
              break;
            }
          }
          if (serviceInfo) {
            response += serviceInfo;
          }
        }
      } else {
        // Default response pattern for other queries
        response = `${bestMatch.description} `;
        
        // Add a relevant excerpt
        if (bestMatch.content) {
          const contentLower = bestMatch.content.toLowerCase();
          let relevantText = "";
          
          // Try to find text related to the query
          const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 3);
          for (const keyword of keywords) {
            const keywordIndex = contentLower.indexOf(keyword);
            if (keywordIndex >= 0) {
              // Extract content around the keyword
              const start = Math.max(0, keywordIndex - 50);
              const end = Math.min(bestMatch.content.length, keywordIndex + keyword.length + 100);
              relevantText = bestMatch.content.substring(start, end).trim();
              break;
            }
          }
          
          // If no keyword match, use the beginning of the content
          if (!relevantText && bestMatch.content.length > 20) {
            relevantText = bestMatch.content.substring(0, 150).trim();
          }
          
          // Add to response if we found relevant text
          if (relevantText) {
            // Clean up the text to make it more readable
            relevantText = relevantText.replace(/\s+/g, ' ').trim();
            
            // Make sure it ends with proper punctuation
            if (!relevantText.endsWith('.') && !relevantText.endsWith('!') && !relevantText.endsWith('?')) {
              relevantText += '.';
            }
            
            response += relevantText + " ";
          }
        }
      }
      
      // Add source link
      if (bestMatch.url) {
        response += `You can learn more here [[1]](${bestMatch.url})`;
      }
    }
    
    return response.length > 0 ? response : null;
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
    initialMessage.textContent = "Hi there! I'm QualiaBot, your assistant for Qualia Solutions. I can help with questions about our web design services, AI integration, and more. How can I assist you today?";
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
    
    // Function to handle common queries with natural responses
    function getPresetResponse(text) {
      const lowercaseText = text.toLowerCase().trim();
      
      // Common greetings
      if (/^(hi|hello|hey)(\s|$|\W)/i.test(lowercaseText)) {
        return "Hello! Nice to meet you. I'm QualiaBot, here to help with questions about Qualia Solutions. How can I assist you today?";
      }
      
      // How are you
      if (/^how are you(\?)?$/i.test(lowercaseText)) {
        return "I'm doing well, thanks for asking! I'm ready to help with information about Qualia Solutions and our services. How about you?";
      }
      
      // Thank you
      if (/^(thank you|thanks)(\s|$|\W)/i.test(lowercaseText)) {
        return "You're welcome! I'm glad I could help. Is there anything else you'd like to know about Qualia Solutions?";
      }
      
      // Goodbye
      if (/^(bye|goodbye|see you|later)(\s|$|\W)/i.test(lowercaseText)) {
        return "Thanks for chatting! Feel free to come back if you have more questions about Qualia Solutions. Have a great day!";
      }
      
      // Return null if no preset response matches
      return null;
    }
    
    async function sendMessage() {
      const text = textInput.value.trim();
      if (!text) return;
      
      // Add user message to chat
      addMessage(text, true);
      textInput.value = '';
      
      // Check for preset responses
      const presetResponse = getPresetResponse(text);
      if (presetResponse) {
        addMessage(presetResponse, false);
        return;
      }
      
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
        // Try to find an answer in local data first
        const localAnswer = findLocalAnswer(text);
        
        if (localAnswer) {
          // Remove typing indicator
          messagesContainer.removeChild(typingIndicator);
          
          // Parse citations and add local response
          const { cleanText, citations } = parseCitations(localAnswer);
          addMessage(cleanText, false, citations);
          return;
        }
        
        // Check daily usage limit
        if (dailyUsage >= config.maxUsagePerDay) {
          // Remove typing indicator
          messagesContainer.removeChild(typingIndicator);
          
          addMessage("I've reached my daily conversation limit. Please contact our team at info@qualiasolutions.net for personalized assistance, or try again tomorrow.", false);
          return;
        }
        
        // Update usage counter for API call
        dailyUsage++;
        localStorage.setItem(usageKey, dailyUsage.toString());
        
        // Call Perplexity API with Sonar model
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.perplexityApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: text }
            ],
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
          addMessage("I'm having a bit of trouble connecting at the moment. Please contact our team at info@qualiasolutions.net for assistance, or try again later.", false);
          console.error('Perplexity API error:', await response.text());
        }
      } catch (error) {
        // Remove typing indicator
        messagesContainer.removeChild(typingIndicator);
        
        // Add error message
        addMessage("I'm having trouble processing your request. Please contact info@qualiasolutions.net for immediate assistance, or try again later.", false);
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
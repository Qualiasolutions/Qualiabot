// QualiaBot Widget Embed Script v1.0.0 with Perplexity Sonar
(function() {
  // Configuration
  const config = {
    widgetPosition: 'right',
    mobileBreakpoint: 768,
    zIndex: 2147483647,
    initialDelay: 1500,
    perplexityApiKey: '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'  // Working API key with credits
  };

  // System prompt including website context
  const SYSTEM_PROMPT = `You are QualiaBot, the AI assistant for Qualia Solutions, Cyprus's first AI solutions agency.

COMPANY OVERVIEW:
- Founded as Cyprus's first AI web design and solutions agency
- Based in Nicosia, Cyprus with international clients across UK, Greece, UAE, and Jordan
- Specializes in AI agent development, intelligent web design, business automation, and digital marketing

CORE SERVICES:
1. AI-POWERED WEB DESIGN
   - Next-generation websites with AI personalization
   - AI-driven UX design and intelligent content generation 
   - Responsive design systems and performance optimization
   - Technology stack: React, Vue.js, Node.js, WordPress, Shopify

2. CUSTOM AI AGENTS & CHATBOTS
   - 24/7 virtual assistants for customer support
   - Lead generation and qualification systems
   - Workflow automation for business processes
   - Multi-platform integration and natural language processing

3. SEO & DIGITAL ADVERTISING
   - Technical SEO with comprehensive site audits
   - On-page and off-page optimization strategies
   - Local SEO for Cyprus businesses
   - AI-powered Meta and Google ad campaigns

4. BUSINESS AUTOMATION
   - Document processing and workflow optimization
   - Approval systems and data processing
   - System integration and API development
   - Legacy system integration

KEY PROJECTS:
- Tzironis: B2B platform in Greece with AI agent for lead generation and invoice automation (85% efficiency increase)
- ESConnect: UK-based procurement solutions provider with dynamic personalization
- Urban Catering: Premium catering services website with SEO optimization (100% online visibility)
- Luxury Barber UK: High-end barbershop in London with online booking system

PRICING INFORMATION:
- Basic websites start at €2,500
- E-commerce and custom web applications start at €5,000
- Most AI solutions implemented within 2-4 weeks
- Free custom AI bot offered as limited promotion

RESULTS ACHIEVED:
- 85% efficiency increases for clients
- 40-50% cost reduction for automated processes
- 24/7 operations capability
- First page Google rankings for clients

CONTACT INFORMATION:
- Email: info@qualiasolutions.net or support@qualiasolutions.net
- Phone: +357 99 111 668
- Location: Nicosia, Cyprus
- Response time: Within 24 hours

COMMUNICATION STYLE GUIDE:
1. Keep responses extremely brief (1-3 sentences) unless detailed information is specifically requested
2. Be friendly, smart, and conversational but always professional
3. For casual greetings ("hi", "hello", etc.), respond with a simple greeting and ask how you can help
4. Add a touch of humor when appropriate, but keep it subtle and professional
5. For technical questions, provide accurate information clearly and concisely
6. When you don't know something, be honest and offer to connect with the team
7. Use emoji sparingly (👋 and ✅ are acceptable) to maintain professionalism

RESPONSE EXAMPLES:
- "Hi there": "Hey! How can I help with your web design or AI needs today?"
- "What do you do?": "We create AI-powered websites, custom AI agents, and business automation solutions. What can I help with specifically?"
- "How much?": "Basic websites start at €2,500, with custom AI solutions varying based on requirements. Need a quote for something specific?"
- "Thanks": "You're welcome! Let me know if you need anything else."
- "Tell me more about AI agents": "Our AI agents can automate customer service, lead generation, and workflows. They provide 24/7 support with human-like interactions. What business area are you looking to improve?"

REMEMBER: Your purpose is to provide helpful, accurate information about Qualia Solutions while creating a positive, professional impression. Always prioritize clarity and brevity in your responses.`;

  // Track usage
  let usageKey = 'qualiaBotApiUsage_' + new Date().toISOString().split('T')[0];
  let dailyUsage = parseInt(localStorage.getItem(usageKey) || '0');
  const MAX_DAILY_USAGE = 100;

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
      height: 600px;
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
    initialMessage.textContent = "👋 Hello! I'm QualiaBot, your AI assistant for Qualia Solutions. I can help with web design, AI integration, and custom software development questions.";
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
    
    // Add a more natural AI response function with subtle intelligence
    function createIntelligentResponse(query) {
      // Process user query
      const processedQuery = query.toLowerCase().trim();
      
      // Check for basic greetings
      if (/^(hi|hello|hey|hi there|greetings|howdy|good (morning|afternoon|evening))$/.test(processedQuery)) {
        return {
          response: "Hey there! How can I help with your web design or AI needs today?",
          usedAI: false
        };
      }
      
      // Check for how are you variations
      if (/^(how are you|how('s| is) it going|how('s| are) things|what's up|sup|how('s| are) you doing)$/.test(processedQuery)) {
        return {
          response: "I'm doing great, thanks for asking! Ready to assist with anything related to Qualia Solutions. What can I help you with?",
          usedAI: false
        };
      }
      
      // Check for thank you variations
      if (/^(thanks|thank you|ty|thx|thanks a lot|thank you very much)$/.test(processedQuery)) {
        return {
          response: "You're welcome! Need anything else?",
          usedAI: false
        };
      }
      
      // Check for goodbye variations
      if (/^(bye|goodbye|see you|cya|farewell|have a (good|nice) day)$/.test(processedQuery)) {
        return {
          response: "Goodbye! Feel free to chat anytime you need assistance with web design or AI services.",
          usedAI: false
        };
      }
      
      // Check for who are you variations
      if (/^(who are you|what are you|what is this|what's this|who is this)$/.test(processedQuery)) {
        return {
          response: "I'm QualiaBot, the AI assistant for Qualia Solutions - Cyprus's first AI web design and solutions agency. How can I help you today?",
          usedAI: false
        };
      }
      
      // For any other queries, use the AI service
      return {
        response: null,
        usedAI: true
      };
    }
    
    async function sendMessage() {
      const message = textInput.value.trim();
      
      if (!message) return;
      
      // Clear input field
      textInput.value = '';
      
      // Add user message to chat
      addMessage(message, true);
      
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'qualia-message-typing';
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      messagesContainer.appendChild(typingIndicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      try {
        // First check if we can respond without AI for common phrases
        const intelligentResponse = createIntelligentResponse(message);
        
        let response;
        let citations = [];
        
        // If we can handle it without AI, do so - saves API costs
        if (!intelligentResponse.usedAI) {
          response = intelligentResponse.response;
          // Add a small delay to make it feel natural
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          // Use the Perplexity API for more complex queries
          if (dailyUsage >= MAX_DAILY_USAGE) {
            response = "I'm sorry, we've reached our daily API usage limit. Please try again tomorrow or contact us directly at info@qualiasolutions.net for immediate assistance.";
          } else {
            try {
              // Track API usage
              dailyUsage++;
              localStorage.setItem(usageKey, dailyUsage.toString());
              
              // Get AI response from Perplexity API
              const apiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${config.perplexityApiKey}`
                },
                body: JSON.stringify({
                  model: 'sonar-small-chat',
                  messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: message }
                  ],
                  temperature: 0.7,
                  max_tokens: 300
                })
              });
              
              if (!apiResponse.ok) {
                throw new Error(`API Error: ${apiResponse.status}`);
              }
              
              const data = await apiResponse.json();
              response = data.choices[0].message.content;
              
              // Check for citations in the response
              citations = parseCitations(response).citations;
            } catch (error) {
              console.error('API Error:', error);
              response = "I'm having trouble connecting to my knowledge base. Please try again or contact our team directly at info@qualiasolutions.net.";
            }
          }
        }
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response to chat
        addMessage(response, false, citations);
      } catch (error) {
        console.error('Error sending message:', error);
        typingIndicator.remove();
        addMessage("I'm sorry, I encountered an error. Please try again or contact our team directly.", false);
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
  function initWidget() {
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
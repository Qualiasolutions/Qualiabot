const fs = require('fs');
const path = require('path');

// Create scripts directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname))) {
  fs.mkdirSync(path.join(__dirname), { recursive: true });
}

// Widget code template with dynamic URL replacement
const widgetCode = `
// QualiaBot Widget Embed Script v1.0.0
(function() {
  // Configuration
  const config = {
    widgetPosition: 'right', // 'right' or 'left'
    mobileBreakpoint: 768,   // Width in px to switch to mobile layout
    zIndex: 99999,           // z-index for the widget
    initialDelay: 1500       // Delay before showing widget (ms)
  };

  // Create widget container with styles
  function createWidgetContainer() {
    // Create container
    const container = document.createElement('div');
    container.id = 'qualia-bot-container';
    
    // Add container styles
    const containerStyles = {
      position: 'fixed',
      bottom: '0',
      [config.widgetPosition]: '0',
      zIndex: config.zIndex.toString(),
      width: '100%',
      height: '100%',
      pointerEvents: 'none', // Allow clicks to pass through to elements below
      display: 'flex',
      flexDirection: 'column',
      alignItems: config.widgetPosition === 'right' ? 'flex-end' : 'flex-start',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, sans-serif'
    };
    
    Object.keys(containerStyles).forEach(key => {
      container.style[key] = containerStyles[key];
    });
    
    document.body.appendChild(container);
    return container;
  }
  
  // Load widget resources
  function loadResources(widgetUrl) {
    // Load CSS
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = widgetUrl + '/static/css/main.css';
    document.head.appendChild(styleLink);
    
    // Load JS with defer
    const script = document.createElement('script');
    script.src = widgetUrl + '/static/js/main.js';
    script.defer = true;
    script.onload = () => {
      console.log('QualiaBot widget loaded successfully');
    };
    document.body.appendChild(script);
  }
  
  // Initialize widget
  function initWidget() {
    // Determine the widget URL
    const scriptSrc = document.currentScript.src;
    const widgetUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    
    // Create widget container
    const container = createWidgetContainer();
    
    // Set a custom attribute that the React app can detect
    container.setAttribute('data-widget-position', config.widgetPosition);
    container.setAttribute('data-mobile-breakpoint', config.mobileBreakpoint);
    
    // Load widget resources
    setTimeout(() => {
      loadResources(widgetUrl);
    }, config.initialDelay);
    
    // Expose configuration API
    window.QualiaBot = window.QualiaBot || {};
    window.QualiaBot.configure = function(customConfig) {
      Object.assign(config, customConfig);
      
      // Update container position
      container.style.alignItems = config.widgetPosition === 'right' ? 'flex-end' : 'flex-start';
      container.setAttribute('data-widget-position', config.widgetPosition);
      container.setAttribute('data-mobile-breakpoint', config.mobileBreakpoint);
    };
    
    // Expose widget control API
    window.QualiaBot.open = function() {
      const event = new CustomEvent('qualiabot:open');
      document.dispatchEvent(event);
    };
    
    window.QualiaBot.close = function() {
      const event = new CustomEvent('qualiabot:close');
      document.dispatchEvent(event);
    };
    
    window.QualiaBot.toggle = function() {
      const event = new CustomEvent('qualiabot:toggle');
      document.dispatchEvent(event);
    };
  }
  
  // Run initialization
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initWidget, 0);
  } else {
    document.addEventListener('DOMContentLoaded', initWidget);
  }
})();
`;

// Write widget.js to the public folder
const outputDir = path.join(__dirname, '../public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'widget.js'),
  widgetCode,
  'utf8'
);

// Also write to the build folder if it exists (for production builds)
const buildDir = path.join(__dirname, '../build');
if (fs.existsSync(buildDir)) {
  fs.writeFileSync(
    path.join(buildDir, 'widget.js'),
    widgetCode,
    'utf8'
  );
}

console.log('Widget embed script generated successfully!');
console.log('To embed the widget on your website, add the following script tag:');
console.log('<script src="https://your-deployed-widget-url/widget.js"></script>');
console.log('\nYou can customize the widget with:');
console.log('window.QualiaBot.configure({widgetPosition: "left", initialDelay: 0});'); 
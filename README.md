# QualiaBot Chat Widget

A modern, AI-powered chat widget for qualiasolutions.net. This widget provides both automated AI responses using Perplexity API and the ability to escalate to live agents when needed.

## Features

- Modern, responsive chat interface
- AI-powered responses using Perplexity API
- Live agent handoff capabilities
- Real-time communication via Socket.io
- Email notifications when no agents are available
- Website context awareness through sitemap integration
- Customizable appearance and behavior

## Recent Improvements

- **Responsive Design**: Enhanced mobile experience with proper scaling
- **Website Context Training**: Added sitemap data integration for smarter responses
- **Widget Customization**: Position, timing, and appearance can now be configured
- **Header Controls**: Added minimize/maximize functionality
- **Embedding API**: Simple JavaScript API for controlling the widget from the parent site
- **Optimized Performance**: Improved loading and rendering speed
- **Security Enhancements**: Better handling of API keys and sensitive information
- **Accessibility**: Added proper ARIA labels and keyboard support

## Project Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_PERPLEXITY_API_KEY=your_perplexity_api_key
   EMAIL_USER=your_notification_email
   EMAIL_PASS=your_email_password
   PORT=3000
   ```

## Available Scripts

### `npm run dev`

Runs both the React frontend and Node.js backend server concurrently in development mode.

### `npm start`

Runs just the React app in development mode on [http://localhost:3001](http://localhost:3001).

### `npm run server`

Runs just the backend server on [http://localhost:3000](http://localhost:3000).

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run fetch-sitemap`

Fetches and processes sitemap data from qualiasolutions.net to train the chatbot with website context.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Embedding the Widget

Add the following script tag to your website:

```html
<script src="https://your-deployed-widget-url/widget.js"></script>
```

### Customization

You can customize the widget using the JavaScript API:

```javascript
// Configure widget options
window.QualiaBot.configure({
  widgetPosition: 'left', // 'left' or 'right'
  initialDelay: 0,        // milliseconds before loading
  mobileBreakpoint: 768,  // width in pixels
  zIndex: 99999           // z-index for the widget
});

// Control widget visibility
window.QualiaBot.open();   // Open the widget
window.QualiaBot.close();  // Close the widget
window.QualiaBot.toggle(); // Toggle open/closed
```

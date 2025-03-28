# QualiaBot Deployment Guide

This guide will help you deploy the QualiaBot chat widget to your web server and integrate it with qualiasolutions.net.

## Prerequisites

- Node.js 14+ and npm
- Web server with HTTPS support
- Domain name or subdomain for the widget (e.g., chat.qualiasolutions.net)

## Build Process

1. Set up your environment variables by creating a `.env.production` file in the project root:

```
REACT_APP_PERPLEXITY_API_KEY=your_perplexity_api_key
EMAIL_USER=your_support_email
EMAIL_PASS=your_email_password
PORT=3000
NODE_ENV=production
```

2. Install dependencies:

```bash
npm install
```

3. Fetch website data from the sitemap (this will help train the bot):

```bash
npm run fetch-sitemap
```

4. Build the production version:

```bash
npm run build
```

This will create a `build` directory with the optimized production build and generate the `widget.js` file.

## Deployment Options

### Option 1: Deploy as a standalone application

1. Upload the contents of the `build` directory to your web server
2. Configure your web server to serve the application (example for Nginx):

```nginx
server {
    listen 80;
    server_name chat.qualiasolutions.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name chat.qualiasolutions.net;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        root /path/to/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

3. Set up and start the Node.js server:

```bash
# Install PM2 process manager
npm install -g pm2

# Start the server
pm2 start server.js
```

### Option 2: Deploy as a widget on qualiasolutions.net

1. Upload the `build` directory to a subdirectory on your web server (e.g., `/widget`)
2. Set up the Node.js server as described in Option 1
3. Add the widget script to your website by adding this code to the HTML:

```html
<script src="https://chat.qualiasolutions.net/widget.js"></script>
```

Replace `chat.qualiasolutions.net` with your actual domain where the widget is hosted.

## SSL/TLS Configuration

Ensure your domain has a valid SSL certificate. You can obtain a free SSL certificate from Let's Encrypt:

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d chat.qualiasolutions.net
```

## Testing the Deployment

After deployment, verify that:

1. The chat widget appears on your website
2. The widget can connect to the AI backend
3. Agent handoff functionality works correctly
4. The widget is responsive on mobile devices

## Troubleshooting

- If the widget doesn't appear, check browser console for JavaScript errors
- If socket.io connection fails, verify your server configuration and firewall settings
- If the AI responses don't work, check your API key and environment variables

## Security Considerations

- Never expose your API keys in client-side code
- Use HTTPS for all communications
- Keep your Node.js server and dependencies updated
- Consider implementing rate limiting for API requests

## Updating the Widget

To update the widget after making changes:

1. Make your changes to the codebase
2. Run the build process again
3. Replace the files on your web server with the new build

The widget on your website will automatically use the updated version.

## Support

For assistance with deployment or technical issues, contact support@qualiasolutions.net. 
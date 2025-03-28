const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://qualiasolutions.net', /\.qualiasolutions\.net$/]
      : "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected agents
const connectedAgents = new Map();

// Configure email transport (update with your email settings)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle agent login
  socket.on('agent:login', (agentData) => {
    connectedAgents.set(socket.id, {
      ...agentData,
      available: true
    });
    broadcastAgentStatus();
  });

  // Handle agent logout
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (connectedAgents.has(socket.id)) {
      connectedAgents.delete(socket.id);
      broadcastAgentStatus();
    }
  });

  // Handle chat requests
  socket.on('chat:request', async (data) => {
    console.log('Chat request received:', data);
    
    // Notify available agents
    const availableAgents = Array.from(connectedAgents.values()).filter(agent => agent.available);
    
    if (availableAgents.length > 0) {
      io.emit('chat:new_request', {
        userId: socket.id,
        message: data.message,
        timestamp: data.timestamp
      });
    } else {
      // Send email notification if no agents are available
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'support@qualiasolutions.net', // Update with your support email
          subject: 'New Chat Support Request',
          text: `A new chat support request has been received:\n\nMessage: ${data.message}\nTimestamp: ${data.timestamp}`
        });
        console.log('Support notification email sent');
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }
  });
});

// Broadcast agent status to all clients
function broadcastAgentStatus() {
  const agents = Array.from(connectedAgents.values());
  io.emit('agents:update', agents);
}

// For any other GET request, send back the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
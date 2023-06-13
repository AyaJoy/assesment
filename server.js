const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);

// Mock database
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

const contacts = [
  { id: 1, name: 'Contact 1' },
  { id: 2, name: 'Contact 2' },
];

// Middleware to check if user is logged in
const checkLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Not logged in' });
  }
};

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.session.user = user;
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/checkLoggedIn', checkLoggedIn, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

app.get('/api/contacts', checkLoggedIn, (req, res) => {
  res.json({ success: true, contacts });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Example: Send a new message event
  socket.on('sendMessage', (message) => {
    // Handle new message event
    console.log('New message:', message);
    // Broadcast the message to all connected clients
    io.emit('newMessage', message);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

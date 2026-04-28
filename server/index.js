const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const express = require("express");
const app = express();
const port = process.env.PORT || 3700;

const clientUrl = (process.env.CLIENT_URL || '').trim();
const allowedOrigins = (clientUrl || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const expressCorsOrigin = allowedOrigins;
const socketCorsOrigin = allowedOrigins;

app.use(helmet());
app.use(cors({ origin: expressCorsOrigin }));
app.use(morgan('dev'));

const server = app.listen(port, () => console.log(`Server listening on port ${port}`));
const io = require('socket.io')(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ['GET', 'POST'],
  },
});

const users = {};

function normalizeName(name) {
  const normalized = (typeof name === 'string' ? name : String(name ?? '')).trim().slice(0, 50);
  return normalized || 'Anonymous';
}

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    const safeName = normalizeName(name);
    users[socket.id] = safeName;
    io.emit('users', Object.entries(users).map(([id, name]) => ({ id, name })));
    io.emit('message', {
      type: 'system',
      text: `${safeName} joined the chat`,
    });
  });

  socket.on('send', (data) => {
    if (!users[socket.id]) return;
    if (!data || typeof data !== 'object' || typeof data.text !== 'string') return;
    const text = data.text.trim().slice(0, 2000);
    if (!text) return;
    io.emit('message', {
      type: 'chat',
      text,
      from: socket.id,
      name: users[socket.id] || 'Unknown',
    });
  });

  socket.on('disconnect', () => {
    const name = users[socket.id];
    delete users[socket.id];
    if (name) {
      io.emit('users', Object.entries(users).map(([id, name]) => ({ id, name })));
      io.emit('message', { type: 'system', text: `${name} left the chat` });
    }
  });

  socket.on('offer', ({ to, offer }) => {
    io.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ to, answer }) => {
    io.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });
});

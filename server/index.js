require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const express = require("express");
const app = express();
const port = process.env.PORT || 3700;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(morgan('dev'));

const server = app.listen(port, () => console.log(`Server listening on port ${port}`));
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

const users = {};

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    users[socket.id] = name;
    io.emit('users', Object.entries(users).map(([id, name]) => ({ id, name })));
    io.emit('message', {
      type: 'system',
      text: `${name} joined the chat`,
    });
  });

  socket.on('send', (data) => {
    io.emit('message', {
      type: 'chat',
      text: data.text,
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
});

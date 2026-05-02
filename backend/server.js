require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket/socket');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Wrap Express app in a raw HTTP server so Socket.IO can share the same port
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach io to the Express app so controllers can access it via req.app.get('io')
  app.set('io', io);

  initSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

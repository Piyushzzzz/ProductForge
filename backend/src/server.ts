import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { registerSocketHandlers } from './sockets/notification.socket.js';

const startServer = () => {
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  registerSocketHandlers(io);

  httpServer.listen(ENV.PORT, () => {
    console.log(`🚀 ProductForge Modular Monolith Backend is running on http://localhost:${ENV.PORT}`);
    console.log(`📡 Real-time WebSocket Gateway attached`);
    console.log(`🛡️ Environment: ${ENV.NODE_ENV}`);
  });
};

startServer();

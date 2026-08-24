import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/token.js';

export const registerSocketHandlers = (io: SocketIOServer) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const payload = verifyToken(token);
        (socket as any).user = payload;
        return next();
      } catch {
        // Allow unauthenticated socket connection for public broadcasts
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (user) {
      // Join user specific room
      socket.join(`user:${user.userId}`);
      if (user.role === 'CREATOR') {
        socket.join('creators');
      }
      if (user.role === 'ADMIN') {
        socket.join('admins');
      }
    }

    socket.on('disconnect', () => {
      // Clean up on disconnect
    });
  });
};

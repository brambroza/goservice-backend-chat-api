import { Server as IOServer } from 'socket.io';
import { Logger } from 'pino';
import { Server } from 'http';

export function createSocketServer(server: Server, logger: Logger) {
  const io = new IOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected via Socket.IO');

    socket.on('chat:send', (msg) => {
      // Simple broadcast for omnichannel feed
      io.emit('chat:receive', { from: socket.id, ...msg });
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  return io;
}

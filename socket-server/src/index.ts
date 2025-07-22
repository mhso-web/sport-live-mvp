import { createServer } from 'http';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-match', (matchId: string) => {
    socket.join(`match:${matchId}`);
    console.log(`Socket ${socket.id} joined match:${matchId}`);
  });

  socket.on('leave-match', (matchId: string) => {
    socket.leave(`match:${matchId}`);
    console.log(`Socket ${socket.id} left match:${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`⚡ Socket.io server running on port ${PORT}`);
});
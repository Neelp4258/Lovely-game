import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { FirebaseAdmin } from './firebase-admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;
const firebaseAdmin = new FirebaseAdmin();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Store active rooms and players
const rooms = new Map();
const players = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    activePlayers: players.size
  });
});

// API Routes for secure Firestore operations
app.post('/api/player/save', async (req, res) => {
  try {
    const { playerId, data } = req.body;
    await firebaseAdmin.savePlayer(playerId, data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving player:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchase', async (req, res) => {
  try {
    const { playerId, itemType, itemId, cost } = req.body;
    const result = await firebaseAdmin.processPurchase(playerId, itemType, itemId, cost);
    res.json(result);
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/job/complete', async (req, res) => {
  try {
    const { playerId, jobId, reward } = req.body;
    const result = await firebaseAdmin.completeJob(playerId, jobId, reward);
    res.json(result);
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebRTC Signaling with Socket.io
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  players.set(socket.id, { id: socket.id, roomId: null });

  // Create room
  socket.on('createRoom', ({ playerId, playerData }) => {
    const roomId = generateRoomCode();
    const room = {
      id: roomId,
      host: socket.id,
      players: new Map([[socket.id, { id: socket.id, playerId, playerData }]]),
      createdAt: Date.now()
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    const player = players.get(socket.id);
    if (player) player.roomId = roomId;

    socket.emit('roomCreated', { roomId, hostId: socket.id });
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // Join room
  socket.on('joinRoom', ({ roomId, playerId, playerData }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.size >= 20) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    socket.join(roomId);
    room.players.set(socket.id, { id: socket.id, playerId, playerData });

    const player = players.get(socket.id);
    if (player) player.roomId = roomId;

    // Send list of existing players to the new player
    const existingPlayers = Array.from(room.players.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, data]) => ({ socketId: id, ...data }));

    socket.emit('roomJoined', { roomId, players: existingPlayers });

    // Notify others about new player
    socket.to(roomId).emit('playerJoined', {
      socketId: socket.id,
      playerId,
      playerData
    });

    console.log(`Player ${socket.id} joined room ${roomId}`);
  });

  // WebRTC Signaling - Offer
  socket.on('webrtcOffer', ({ targetId, offer }) => {
    io.to(targetId).emit('webrtcOffer', {
      fromId: socket.id,
      offer
    });
  });

  // WebRTC Signaling - Answer
  socket.on('webrtcAnswer', ({ targetId, answer }) => {
    io.to(targetId).emit('webrtcAnswer', {
      fromId: socket.id,
      answer
    });
  });

  // WebRTC Signaling - ICE Candidate
  socket.on('webrtcIce', ({ targetId, candidate }) => {
    io.to(targetId).emit('webrtcIce', {
      fromId: socket.id,
      candidate
    });
  });

  // Leave room
  socket.on('leaveRoom', () => {
    handlePlayerLeave(socket);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handlePlayerLeave(socket);
    players.delete(socket.id);
  });
});

function handlePlayerLeave(socket) {
  const player = players.get(socket.id);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (room) {
    room.players.delete(socket.id);
    socket.to(player.roomId).emit('playerLeft', { socketId: socket.id });

    // Delete room if empty
    if (room.players.size === 0) {
      rooms.delete(player.roomId);
      console.log(`Room deleted: ${player.roomId}`);
    }
  }

  player.roomId = null;
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

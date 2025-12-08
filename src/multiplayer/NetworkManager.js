import { io } from 'socket.io-client';
import { NETWORK_EVENTS } from '../../shared/constants.js';
import { WebRTCPeer } from './WebRTCPeer.js';

export class NetworkManager {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    this.socket = null;
    this.peers = new Map();
    this.roomId = null;
    this.playerId = null;
    this.playerData = null;

    this.onPlayerJoinedCallback = null;
    this.onPlayerLeftCallback = null;
    this.onPlayerUpdateCallback = null;
    this.onEmoteCallback = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket.id);
        this.setupSocketListeners();
        resolve(this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  setupSocketListeners() {
    this.socket.on(NETWORK_EVENTS.ROOM_CREATED, ({ roomId, hostId }) => {
      console.log('Room created:', roomId);
      this.roomId = roomId;
    });

    this.socket.on(NETWORK_EVENTS.ROOM_JOINED, ({ roomId, players }) => {
      console.log('Joined room:', roomId, 'with', players.length, 'players');
      this.roomId = roomId;

      // Create WebRTC connections with existing players
      players.forEach(({ socketId, playerId, playerData }) => {
        this.createPeerConnection(socketId, true, playerId, playerData);
      });
    });

    this.socket.on(NETWORK_EVENTS.PLAYER_JOINED, ({ socketId, playerId, playerData }) => {
      console.log('Player joined:', socketId);
      this.createPeerConnection(socketId, false, playerId, playerData);
    });

    this.socket.on(NETWORK_EVENTS.PLAYER_LEFT, ({ socketId }) => {
      console.log('Player left:', socketId);
      this.removePeer(socketId);

      if (this.onPlayerLeftCallback) {
        this.onPlayerLeftCallback(socketId);
      }
    });

    this.socket.on(NETWORK_EVENTS.WEBRTC_OFFER, async ({ fromId, offer }) => {
      const peer = this.peers.get(fromId);
      if (peer) {
        await peer.handleOffer(offer);
      }
    });

    this.socket.on(NETWORK_EVENTS.WEBRTC_ANSWER, async ({ fromId, answer }) => {
      const peer = this.peers.get(fromId);
      if (peer) {
        await peer.handleAnswer(answer);
      }
    });

    this.socket.on(NETWORK_EVENTS.WEBRTC_ICE, async ({ fromId, candidate }) => {
      const peer = this.peers.get(fromId);
      if (peer) {
        await peer.handleIceCandidate(candidate);
      }
    });

    this.socket.on(NETWORK_EVENTS.ERROR, ({ message }) => {
      console.error('Server error:', message);
    });
  }

  createPeerConnection(socketId, initiator, playerId, playerData) {
    if (this.peers.has(socketId)) return;

    const peer = new WebRTCPeer(socketId, initiator);

    // Handle offer
    peer.onOffer((offer) => {
      this.socket.emit(NETWORK_EVENTS.WEBRTC_OFFER, {
        targetId: socketId,
        offer
      });
    });

    // Handle answer
    peer.onAnswer((answer) => {
      this.socket.emit(NETWORK_EVENTS.WEBRTC_ANSWER, {
        targetId: socketId,
        answer
      });
    });

    // Handle ICE candidate
    peer.onIceCandidate((candidate) => {
      this.socket.emit(NETWORK_EVENTS.WEBRTC_ICE, {
        targetId: socketId,
        candidate
      });
    });

    // Handle data channel messages
    peer.onMessage((data) => {
      this.handlePeerMessage(socketId, data);
    });

    // Handle connection ready
    peer.onReady(() => {
      console.log('WebRTC connection ready with', socketId);

      if (this.onPlayerJoinedCallback) {
        this.onPlayerJoinedCallback(socketId, playerId, playerData);
      }
    });

    this.peers.set(socketId, peer);

    if (initiator) {
      peer.createOffer();
    }
  }

  handlePeerMessage(socketId, data) {
    switch (data.type) {
      case 'playerUpdate':
        if (this.onPlayerUpdateCallback) {
          this.onPlayerUpdateCallback(socketId, data.data);
        }
        break;

      case 'emote':
        if (this.onEmoteCallback) {
          this.onEmoteCallback(socketId, data.emote);
        }
        break;

      case 'kissRequest':
        // Handle kiss request
        console.log('Kiss request from', socketId);
        break;

      case 'kissAccept':
        // Handle kiss acceptance
        console.log('Kiss accepted by', socketId);
        break;
    }
  }

  removePeer(socketId) {
    const peer = this.peers.get(socketId);
    if (peer) {
      peer.close();
      this.peers.delete(socketId);
    }
  }

  createRoom(playerId, playerData) {
    this.playerId = playerId;
    this.playerData = playerData;

    this.socket.emit(NETWORK_EVENTS.CREATE_ROOM, {
      playerId,
      playerData
    });
  }

  joinRoom(roomId, playerId, playerData) {
    this.playerId = playerId;
    this.playerData = playerData;

    this.socket.emit(NETWORK_EVENTS.JOIN_ROOM, {
      roomId,
      playerId,
      playerData
    });
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.emit(NETWORK_EVENTS.LEAVE_ROOM);
      this.peers.forEach(peer => peer.close());
      this.peers.clear();
      this.roomId = null;
    }
  }

  broadcastPlayerUpdate(playerData) {
    this.peers.forEach(peer => {
      peer.send({
        type: 'playerUpdate',
        data: playerData
      });
    });
  }

  broadcastEmote(emote) {
    this.peers.forEach(peer => {
      peer.send({
        type: 'emote',
        emote
      });
    });
  }

  sendKissRequest(targetSocketId) {
    const peer = this.peers.get(targetSocketId);
    if (peer) {
      peer.send({
        type: 'kissRequest'
      });
    }
  }

  sendKissAccept(targetSocketId) {
    const peer = this.peers.get(targetSocketId);
    if (peer) {
      peer.send({
        type: 'kissAccept'
      });
    }
  }

  onPlayerJoined(callback) {
    this.onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback) {
    this.onPlayerLeftCallback = callback;
  }

  onPlayerUpdate(callback) {
    this.onPlayerUpdateCallback = callback;
  }

  onEmote(callback) {
    this.onEmoteCallback = callback;
  }

  disconnect() {
    this.leaveRoom();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getRoomId() {
    return this.roomId;
  }

  getPeers() {
    return this.peers;
  }
}

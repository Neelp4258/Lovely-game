import { auth, signInWithPopup, signInAnonymously, GoogleAuthProvider } from './config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { Game } from './core/Game.js';
import * as THREE from 'three';

// Make THREE globally available for Game class
window.THREE = THREE;

let game = null;
let currentUser = null;

// Show loading screen
function showLoadingScreen() {
  document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoadingScreen() {
  document.getElementById('loading-screen').style.display = 'none';
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
}

function hideLoginScreen() {
  document.getElementById('login-screen').style.display = 'none';
}

function showLobbyScreen() {
  document.getElementById('lobby-screen').style.display = 'flex';
}

function hideLobbyScreen() {
  document.getElementById('lobby-screen').style.display = 'none';
}

function updateLoadingProgress(progress, text) {
  const progressBar = document.getElementById('loading-progress');
  const loadingText = document.getElementById('loading-text');

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (loadingText) {
    loadingText.textContent = text;
  }
}

// Authentication
function setupAuth() {
  const googleLoginBtn = document.getElementById('google-login-btn');
  const anonymousLoginBtn = document.getElementById('anonymous-login-btn');

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error('Google sign-in error:', error);
        alert('Failed to sign in with Google');
      }
    });
  }

  if (anonymousLoginBtn) {
    anonymousLoginBtn.addEventListener('click', async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Anonymous sign-in error:', error);
        alert('Failed to sign in anonymously');
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      hideLoginScreen();
      showLobbyScreen();
      console.log('User signed in:', user.uid);
    } else {
      hideLoadingScreen();
      showLoginScreen();
    }
  });
}

// Lobby
function setupLobby() {
  const createRoomBtn = document.getElementById('create-room-btn');
  const joinRoomBtn = document.getElementById('join-room-btn');
  const playSoloBtn = document.getElementById('play-solo-btn');
  const startGameBtn = document.getElementById('start-game-btn');
  const roomCodeInput = document.getElementById('room-code-input');

  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', async () => {
      await initializeGame();

      // Create room
      await game.connectToNetwork();
      game.createRoom();

      // Show room info
      const roomInfo = document.getElementById('room-info');
      const currentRoomCode = document.getElementById('current-room-code');

      if (roomInfo && currentRoomCode) {
        // Wait for room code
        const checkRoomCode = setInterval(() => {
          const roomId = game.networkManager.getRoomId();
          if (roomId) {
            currentRoomCode.textContent = roomId;
            roomInfo.style.display = 'block';
            clearInterval(checkRoomCode);
          }
        }, 100);
      }
    });
  }

  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', async () => {
      const roomCode = roomCodeInput.value.trim().toUpperCase();

      if (!roomCode) {
        alert('Please enter a room code');
        return;
      }

      await initializeGame();

      // Join room
      await game.connectToNetwork();
      game.joinRoom(roomCode);

      // Start game
      setTimeout(() => {
        startGame();
      }, 1000);
    });
  }

  if (playSoloBtn) {
    playSoloBtn.addEventListener('click', async () => {
      await initializeGame();
      startGame();
    });
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      startGame();
    });
  }
}

async function initializeGame() {
  if (game) return;

  showLoadingScreen();
  updateLoadingProgress(0, 'Initializing game...');

  const canvas = document.getElementById('game-canvas');

  try {
    updateLoadingProgress(20, 'Creating game world...');
    game = new Game(canvas, currentUser);

    updateLoadingProgress(60, 'Loading assets...');
    await game.init();

    updateLoadingProgress(100, 'Ready!');

    console.log('Game ready');
  } catch (error) {
    console.error('Error initializing game:', error);
    alert('Failed to initialize game');
  }
}

function startGame() {
  if (!game) return;

  hideLobbyScreen();
  hideLoadingScreen();

  // Show game UI
  document.getElementById('ui-overlay').style.display = 'block';

  // Update room code in UI
  if (game.networkManager) {
    const roomId = game.networkManager.getRoomId();
    if (roomId) {
      game.uiManager.updateRoomCode(roomId);
    }
  }

  // Start game loop
  game.start();

  console.log('Game started');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Lovely City - 3D Multiplayer Game');

  // Hide UI overlay initially
  document.getElementById('ui-overlay').style.display = 'none';

  setupAuth();
  setupLobby();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (game) {
    game.dispose();
  }
});

// Handle visibility change (save position when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game) {
    game.firestoreManager.savePlayerPosition(
      currentUser.uid,
      {
        x: game.player.position.x,
        y: game.player.position.y,
        z: game.player.position.z
      }
    );
  }
});

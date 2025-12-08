import { Scene } from './Scene.js';
import { Renderer } from './Renderer.js';
import { City } from '../world/City.js';
import { Player } from '../entities/Player.js';
import { Car } from '../entities/Car.js';
import { RemotePlayer } from '../entities/RemotePlayer.js';
import { MovementController } from '../systems/MovementController.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { InteriorManager } from '../world/InteriorManager.js';
import { UIManager } from '../ui/UIManager.js';
import { NetworkManager } from '../multiplayer/NetworkManager.js';
import { FirestoreManager } from '../database/FirestoreManager.js';
import { BUILDING_TYPES, INTERIOR_TYPES } from '../../shared/constants.js';

export class Game {
  constructor(canvas, currentUser) {
    this.canvas = canvas;
    this.currentUser = currentUser;

    this.scene = new Scene();
    this.renderer = new Renderer(canvas);
    this.city = null;
    this.player = null;
    this.cars = [];
    this.remotePlayers = new Map();

    this.movementController = null;
    this.interactionSystem = null;
    this.interiorManager = null;
    this.uiManager = null;
    this.networkManager = null;
    this.firestoreManager = new FirestoreManager();

    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.isInVehicle = false;
    this.currentVehicle = null;

    this.lastSyncTime = 0;
    this.syncInterval = 50; // Sync every 50ms

    this.init();
  }

  async init() {
    // Load player data from Firestore
    let playerData = await this.firestoreManager.getPlayer(this.currentUser.uid);

    if (!playerData) {
      playerData = await this.firestoreManager.createPlayer(
        this.currentUser.uid,
        this.currentUser.displayName || 'Player'
      );
    }

    // Create game world
    this.city = new City(this.scene);

    // Create player
    this.player = new Player(playerData.customization);
    this.player.setPosition(
      playerData.lastPosition?.x || 0,
      playerData.lastPosition?.y || 0,
      playerData.lastPosition?.z || 0
    );
    this.scene.add(this.player.getMesh());

    // Create some cars in the world
    this.spawnCar('sedan1', 0xff0000, 15, 0, -20);
    this.spawnCar('sedan2', 0x0000ff, -15, 0, 20);
    this.spawnCar('sedan3', 0x00ff00, 25, 0, 25);

    // Setup systems
    this.movementController = new MovementController(
      this.player,
      this.renderer.getCamera()
    );

    this.interactionSystem = new InteractionSystem(
      this.player,
      this.city,
      this.cars,
      this.renderer.getCamera()
    );

    this.interiorManager = new InteriorManager(this.scene);

    this.uiManager = new UIManager(this);

    // Setup interaction callback
    this.interactionSystem.onInteraction((interactable) => {
      this.handleInteraction(interactable);
    });

    // Setup interior exit callback
    this.interiorManager.onExit(() => {
      this.exitInterior();
    });

    // Update UI
    this.uiManager.updatePlayerInfo(
      playerData.displayName,
      playerData.money
    );

    // Setup network manager
    this.networkManager = new NetworkManager();

    this.setupNetworkCallbacks();

    console.log('Game initialized');
  }

  setupNetworkCallbacks() {
    this.networkManager.onPlayerJoined((socketId, playerId, playerData) => {
      console.log('Remote player joined:', playerId);

      const remotePlayer = new RemotePlayer(socketId, playerId, playerData);
      this.remotePlayers.set(socketId, remotePlayer);
      this.scene.add(remotePlayer.getMesh());
    });

    this.networkManager.onPlayerLeft((socketId) => {
      const remotePlayer = this.remotePlayers.get(socketId);
      if (remotePlayer) {
        this.scene.remove(remotePlayer.getMesh());
        remotePlayer.destroy();
        this.remotePlayers.delete(socketId);
      }
    });

    this.networkManager.onPlayerUpdate((socketId, data) => {
      const remotePlayer = this.remotePlayers.get(socketId);
      if (remotePlayer) {
        remotePlayer.update(data);
      }
    });

    this.networkManager.onEmote((socketId, emote) => {
      const remotePlayer = this.remotePlayers.get(socketId);
      if (remotePlayer) {
        remotePlayer.playEmote(emote);
      }
    });
  }

  async connectToNetwork() {
    try {
      await this.networkManager.connect();
      console.log('Connected to network');
    } catch (error) {
      console.error('Failed to connect to network:', error);
    }
  }

  createRoom() {
    const playerData = {
      customization: this.player.customization,
      displayName: this.currentUser.displayName || 'Player'
    };

    this.networkManager.createRoom(this.currentUser.uid, playerData);
  }

  joinRoom(roomCode) {
    const playerData = {
      customization: this.player.customization,
      displayName: this.currentUser.displayName || 'Player'
    };

    this.networkManager.joinRoom(roomCode, this.currentUser.uid, playerData);
  }

  handleInteraction(interactable) {
    if (interactable.type === 'building') {
      this.enterBuilding(interactable.object);
    } else if (interactable.type === 'car') {
      this.enterVehicle(interactable.object);
    }
  }

  enterBuilding(building) {
    const buildingType = building.type;
    const interiorType = building.interiorType;

    // Show appropriate UI based on building type
    if (buildingType === BUILDING_TYPES.SHOP || buildingType === BUILDING_TYPES.MALL) {
      const items = [
        { id: 'shirt1', name: 'Casual Shirt', description: 'A comfortable casual shirt', price: 50 },
        { id: 'pants1', name: 'Jeans', description: 'Classic blue jeans', price: 60 },
        { id: 'shoes1', name: 'Sneakers', description: 'Stylish sneakers', price: 80 },
      ];
      this.uiManager.showShopPanel(items);
    } else if (buildingType === BUILDING_TYPES.CAR_DEALERSHIP) {
      const cars = [
        { id: 'sedan', name: 'Sedan', description: 'A reliable family car', price: 1500 },
        { id: 'sports', name: 'Sports Car', description: 'Fast and stylish', price: 3000 },
        { id: 'suv', name: 'SUV', description: 'Spacious and powerful', price: 2500 },
      ];
      this.uiManager.showDealershipPanel(cars);
    }

    // Enter interior
    this.interiorManager.enterInterior(interiorType, buildingType);
  }

  exitInterior() {
    // Close all panels
    document.querySelectorAll('.ui-panel').forEach(panel => {
      panel.style.display = 'none';
    });
  }

  enterVehicle(car) {
    this.isInVehicle = true;
    this.currentVehicle = car;
    this.player.enterVehicle(car);

    // Setup car controls
    this.setupVehicleControls();
  }

  exitVehicle() {
    if (this.currentVehicle) {
      this.player.exitVehicle();
      this.isInVehicle = false;
      this.currentVehicle = null;

      // Remove car controls
      this.removeVehicleControls();
    }
  }

  setupVehicleControls() {
    this.vehicleKeys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.vehicleKeyHandler = (e) => {
      const isDown = e.type === 'keydown';

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.vehicleKeys.forward = isDown;
          break;
        case 's':
        case 'arrowdown':
          this.vehicleKeys.backward = isDown;
          break;
        case 'a':
        case 'arrowleft':
          this.vehicleKeys.left = isDown;
          break;
        case 'd':
        case 'arrowright':
          this.vehicleKeys.right = isDown;
          break;
        case 'f':
          if (isDown) this.exitVehicle();
          break;
      }
    };

    window.addEventListener('keydown', this.vehicleKeyHandler);
    window.addEventListener('keyup', this.vehicleKeyHandler);
  }

  removeVehicleControls() {
    if (this.vehicleKeyHandler) {
      window.removeEventListener('keydown', this.vehicleKeyHandler);
      window.removeEventListener('keyup', this.vehicleKeyHandler);
      this.vehicleKeyHandler = null;
    }
  }

  spawnCar(id, color, x, y, z) {
    const car = new Car({
      id,
      color,
      position: new THREE.Vector3(x, y, z)
    });

    this.cars.push(car);
    this.scene.add(car.getMesh());

    return car;
  }

  spawnPlayerCar(carId) {
    // Spawn car near player
    const spawnPos = this.player.getPosition().clone();
    spawnPos.x += 5;

    const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    this.spawnCar(carId, randomColor, spawnPos.x, spawnPos.y, spawnPos.z);
  }

  update() {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();

    // Update player
    if (!this.interiorManager.isInInterior()) {
      if (this.isInVehicle && this.currentVehicle) {
        // Update vehicle
        if (this.vehicleKeys.forward) this.currentVehicle.accelerate();
        if (this.vehicleKeys.backward) this.currentVehicle.brake();
        if (this.vehicleKeys.left) this.currentVehicle.turnLeft();
        if (this.vehicleKeys.right) this.currentVehicle.turnRight();

        this.currentVehicle.update(deltaTime);
        this.movementController.updateForVehicle(this.currentVehicle);
      } else {
        // Update normal movement
        this.movementController.update(deltaTime);
        this.player.update(deltaTime);

        // Update interaction system
        this.interactionSystem.update();
      }

      // Update cars
      this.cars.forEach(car => {
        if (car !== this.currentVehicle) {
          car.update(deltaTime);
        }
      });

      // Sync player state over network
      this.syncNetworkState();
    }

    // Update remote players
    this.remotePlayers.forEach(remotePlayer => {
      // Remote players update based on received data
    });

    // Render
    this.renderer.render(this.scene.getScene());

    requestAnimationFrame(() => this.update());
  }

  syncNetworkState() {
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncInterval) return;

    this.lastSyncTime = now;

    if (this.networkManager && this.networkManager.getRoomId()) {
      const playerState = {
        position: {
          x: this.player.position.x,
          y: this.player.position.y,
          z: this.player.position.z
        },
        rotation: this.player.rotation,
        isMoving: this.player.isMoving,
        isRunning: this.player.isRunning,
        inVehicle: this.isInVehicle,
        vehicleId: this.currentVehicle?.id
      };

      this.networkManager.broadcastPlayerUpdate(playerState);
    }
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.update();
  }

  stop() {
    this.isRunning = false;
  }

  async dispose() {
    this.stop();

    // Save player position
    await this.firestoreManager.savePlayerPosition(
      this.currentUser.uid,
      {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z
      }
    );

    // Disconnect from network
    if (this.networkManager) {
      this.networkManager.disconnect();
    }

    // Clean up resources
    this.remotePlayers.forEach(remotePlayer => {
      remotePlayer.destroy();
    });

    console.log('Game disposed');
  }
}

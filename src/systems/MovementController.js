import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../shared/constants.js';

export class MovementController {
  constructor(player, camera) {
    this.player = player;
    this.camera = camera;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false
    };

    this.joystick = {
      active: false,
      angle: 0,
      strength: 0
    };

    this.cameraOffset = new THREE.Vector3(0, 5, 10);
    this.cameraLookOffset = new THREE.Vector3(0, 1, 0);

    this.setupControls();
    this.setupJoystick();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mobile run button
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
      runBtn.addEventListener('touchstart', () => {
        this.keys.run = true;
        runBtn.style.background = 'rgba(255, 255, 255, 0.5)';
      });

      runBtn.addEventListener('touchend', () => {
        this.keys.run = false;
        runBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      });
    }
  }

  setupJoystick() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');

    if (!joystickBase || !joystickStick) return;

    let touchId = null;

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchId = touch.identifier;
      this.joystick.active = true;
      updateJoystick(touch);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = Array.from(e.touches).find(t => t.identifier === touchId);
      if (touch) updateJoystick(touch);
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      if (touchId !== null) {
        this.joystick.active = false;
        this.joystick.strength = 0;
        joystickStick.style.transform = 'translate(-50%, -50%)';
        touchId = null;
      }
    };

    const updateJoystick = (touch) => {
      const rect = joystickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = rect.width / 2;

      this.joystick.strength = Math.min(distance / maxDistance, 1);
      this.joystick.angle = Math.atan2(deltaY, deltaX);

      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
      const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

      joystickStick.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    };

    joystickBase.addEventListener('touchstart', handleTouchStart, { passive: false });
    joystickBase.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystickBase.addEventListener('touchend', handleTouchEnd, { passive: false });
    joystickBase.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  }

  handleKeyDown(e) {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.keys.forward = true;
        break;
      case 's':
      case 'arrowdown':
        this.keys.backward = true;
        break;
      case 'a':
      case 'arrowleft':
        this.keys.left = true;
        break;
      case 'd':
      case 'arrowright':
        this.keys.right = true;
        break;
      case 'shift':
        this.keys.run = true;
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.keys.forward = false;
        break;
      case 's':
      case 'arrowdown':
        this.keys.backward = false;
        break;
      case 'a':
      case 'arrowleft':
        this.keys.left = false;
        break;
      case 'd':
      case 'arrowright':
        this.keys.right = false;
        break;
      case 'shift':
        this.keys.run = false;
        break;
    }
  }

  update(deltaTime) {
    if (this.player.inVehicle) return;

    const moveDirection = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();

    // Get camera forward direction
    this.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    // Keyboard/Joystick input
    if (this.joystick.active) {
      // Mobile joystick
      const joyX = Math.cos(this.joystick.angle) * this.joystick.strength;
      const joyY = Math.sin(this.joystick.angle) * this.joystick.strength;

      moveDirection.add(cameraRight.clone().multiplyScalar(joyX));
      moveDirection.add(cameraDirection.clone().multiplyScalar(-joyY));
    } else {
      // Desktop keyboard
      if (this.keys.forward) moveDirection.add(cameraDirection);
      if (this.keys.backward) moveDirection.sub(cameraDirection);
      if (this.keys.left) moveDirection.sub(cameraRight);
      if (this.keys.right) moveDirection.add(cameraRight);
    }

    // Normalize and apply movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();

      const speed = GAME_CONSTANTS.MOVEMENT_SPEED * (this.keys.run ? GAME_CONSTANTS.RUN_MULTIPLIER : 1);

      this.player.velocity.copy(moveDirection.multiplyScalar(speed));
      this.player.position.add(this.player.velocity.clone().multiplyScalar(deltaTime));

      // Update player rotation to face movement direction
      this.player.rotation = Math.atan2(moveDirection.x, moveDirection.z);
      this.player.isMoving = true;
      this.player.isRunning = this.keys.run;
    } else {
      this.player.isMoving = false;
      this.player.isRunning = false;
    }

    // Keep player on ground
    this.player.position.y = 0;

    // Update player mesh
    this.player.setPosition(this.player.position.x, this.player.position.y, this.player.position.z);
    this.player.setRotation(this.player.rotation);

    // Update camera to follow player
    this.updateCamera();
  }

  updateCamera() {
    const idealOffset = this.cameraOffset.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.player.rotation
    );

    const idealPosition = this.player.position.clone().add(idealOffset);
    const idealLookAt = this.player.position.clone().add(this.cameraLookOffset);

    // Smooth camera movement
    this.camera.position.lerp(idealPosition, 0.1);
    this.camera.lookAt(idealLookAt);
  }

  updateForVehicle(vehicle) {
    // Camera follows vehicle
    const vehicleOffset = new THREE.Vector3(0, 3, -8);
    const idealOffset = vehicleOffset.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      vehicle.rotation
    );

    const idealPosition = vehicle.position.clone().add(idealOffset);
    const idealLookAt = vehicle.position.clone().add(new THREE.Vector3(0, 1, 0));

    this.camera.position.lerp(idealPosition, 0.1);
    this.camera.lookAt(idealLookAt);
  }
}

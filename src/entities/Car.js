import * as THREE from 'three';

export class Car {
  constructor({ id, model = 'sedan', color = 0xff0000, position = new THREE.Vector3() }) {
    this.id = id;
    this.model = model;
    this.color = color;
    this.position = position.clone();
    this.rotation = 0;
    this.velocity = new THREE.Vector3();
    this.speed = 0;
    this.maxSpeed = 20;
    this.acceleration = 0.5;
    this.friction = 0.95;
    this.turnSpeed = 0.05;

    this.createMesh();
  }

  createMesh() {
    this.group = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      metalness: 0.8,
      roughness: 0.2
    });

    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 0.8;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Car top (cabin)
    const topGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      metalness: 0.8,
      roughness: 0.2
    });

    this.top = new THREE.Mesh(topGeometry, topMaterial);
    this.top.position.y = 1.6;
    this.top.position.z = -0.3;
    this.top.castShadow = true;
    this.group.add(this.top);

    // Windows
    this.createWindows();

    // Wheels
    this.createWheels();

    // Headlights
    this.createHeadlights();

    // Store car data
    this.group.userData = {
      type: 'car',
      carId: this.id,
      interactable: true
    };

    this.group.position.copy(this.position);
  }

  createWindows() {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });

    // Front window
    const frontWindowGeometry = new THREE.PlaneGeometry(1.6, 0.6);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0, 1.6, 0.7);
    frontWindow.rotation.x = -0.3;
    this.group.add(frontWindow);

    // Back window
    const backWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    backWindow.position.set(0, 1.6, -1.3);
    backWindow.rotation.x = 0.3;
    backWindow.rotation.y = Math.PI;
    this.group.add(backWindow);

    // Side windows
    const sideWindowGeometry = new THREE.PlaneGeometry(1.8, 0.6);
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    leftWindow.position.set(-0.9, 1.6, -0.3);
    leftWindow.rotation.y = Math.PI / 2;
    this.group.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    rightWindow.position.set(0.9, 1.6, -0.3);
    rightWindow.rotation.y = -Math.PI / 2;
    this.group.add(rightWindow);
  }

  createWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8
    });

    this.wheels = [];

    const wheelPositions = [
      new THREE.Vector3(-0.8, 0.4, 1.2),  // Front left
      new THREE.Vector3(0.8, 0.4, 1.2),   // Front right
      new THREE.Vector3(-0.8, 0.4, -1.2), // Back left
      new THREE.Vector3(0.8, 0.4, -1.2),  // Back right
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.copy(pos);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      this.group.add(wheel);
      this.wheels.push(wheel);
    });
  }

  createHeadlights() {
    const lightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffffaa,
      emissiveIntensity: 0.5
    });

    const leftHeadlight = new THREE.Mesh(lightGeometry, lightMaterial);
    leftHeadlight.position.set(-0.6, 0.8, 2.05);
    this.group.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(lightGeometry, lightMaterial);
    rightHeadlight.position.set(0.6, 0.8, 2.05);
    this.group.add(rightHeadlight);

    // Spotlights
    const leftSpotlight = new THREE.SpotLight(0xffffaa, 1, 30, Math.PI / 6);
    leftSpotlight.position.set(-0.6, 0.8, 2.05);
    leftSpotlight.target.position.set(-0.6, 0, 10);
    this.group.add(leftSpotlight);
    this.group.add(leftSpotlight.target);

    const rightSpotlight = new THREE.SpotLight(0xffffaa, 1, 30, Math.PI / 6);
    rightSpotlight.position.set(0.6, 0.8, 2.05);
    rightSpotlight.target.position.set(0.6, 0, 10);
    this.group.add(rightSpotlight);
    this.group.add(rightSpotlight.target);
  }

  update(deltaTime) {
    // Apply friction
    this.speed *= this.friction;

    // Update position based on velocity
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);

    this.velocity.copy(forward).multiplyScalar(this.speed);
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Update mesh
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    // Rotate wheels based on speed
    const wheelRotation = this.speed * deltaTime * 5;
    this.wheels.forEach(wheel => {
      wheel.rotation.x += wheelRotation;
    });
  }

  accelerate() {
    this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
  }

  brake() {
    this.speed = Math.max(this.speed - this.acceleration * 2, -this.maxSpeed / 2);
  }

  turnLeft() {
    if (Math.abs(this.speed) > 0.1) {
      this.rotation += this.turnSpeed * (this.speed > 0 ? 1 : -1);
    }
  }

  turnRight() {
    if (Math.abs(this.speed) > 0.1) {
      this.rotation -= this.turnSpeed * (this.speed > 0 ? 1 : -1);
    }
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.group.position.copy(this.position);
  }

  setRotation(rotation) {
    this.rotation = rotation;
    this.group.rotation.y = rotation;
  }

  getMesh() {
    return this.group;
  }

  getPosition() {
    return this.position;
  }

  getData() {
    return {
      id: this.id,
      position: this.position.toArray(),
      rotation: this.rotation,
      speed: this.speed
    };
  }
}

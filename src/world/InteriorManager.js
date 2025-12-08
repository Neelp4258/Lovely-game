import * as THREE from 'three';
import { INTERIOR_TYPES, BUILDING_TYPES } from '../../shared/constants.js';

export class InteriorManager {
  constructor(scene) {
    this.scene = scene;
    this.currentInterior = null;
    this.exteriorObjects = [];
    this.interiorObjects = [];
    this.onExitCallback = null;

    this.setupExitButton();
  }

  setupExitButton() {
    const exitBtn = document.getElementById('exit-interior-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.exitInterior());
    }
  }

  enterInterior(interiorType, buildingType) {
    // Hide exterior
    this.hideExterior();

    // Create interior scene
    this.createInterior(interiorType, buildingType);

    // Show interior panel
    const interiorPanel = document.getElementById('interior-panel');
    const interiorTitle = document.getElementById('interior-title');

    if (interiorPanel && interiorTitle) {
      interiorTitle.textContent = this.getInteriorTitle(buildingType);
      interiorPanel.style.display = 'block';
    }

    this.currentInterior = { type: interiorType, buildingType };
  }

  createInterior(interiorType, buildingType) {
    // Create a simple interior room
    const roomSize = { width: 20, height: 5, depth: 20 };

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.depth);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.interiorObjects.push(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.9
    });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, roomSize.height / 2, -roomSize.depth / 2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);
    this.interiorObjects.push(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    leftWall.position.set(-roomSize.width / 2, roomSize.height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);
    this.interiorObjects.push(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    rightWall.position.set(roomSize.width / 2, roomSize.height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);
    this.interiorObjects.push(rightWall);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.depth);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = roomSize.height;
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);
    this.interiorObjects.push(ceiling);

    // Interior-specific content
    this.addInteriorContent(buildingType);

    // Interior lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    this.interiorObjects.push(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 30);
    pointLight.position.set(0, roomSize.height - 1, 0);
    this.scene.add(pointLight);
    this.interiorObjects.push(pointLight);
  }

  addInteriorContent(buildingType) {
    switch (buildingType) {
      case BUILDING_TYPES.SHOP:
      case BUILDING_TYPES.MALL:
        this.createShopContent();
        break;

      case BUILDING_TYPES.CAR_DEALERSHIP:
        this.createDealershipContent();
        break;

      case BUILDING_TYPES.CLUB:
        this.createClubContent();
        break;

      case BUILDING_TYPES.SCHOOL:
      case BUILDING_TYPES.COLLEGE:
        this.createSchoolContent();
        break;

      case BUILDING_TYPES.HOUSE:
        this.createHouseContent();
        break;

      case BUILDING_TYPES.MARRIAGE_HALL:
        this.createMarriageHallContent();
        break;
    }
  }

  createShopContent() {
    // Shelves with items
    for (let i = 0; i < 3; i++) {
      const shelfGeometry = new THREE.BoxGeometry(8, 3, 1);
      const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.set(-5 + i * 5, 1.5, -8);
      shelf.castShadow = true;
      this.scene.add(shelf);
      this.interiorObjects.push(shelf);
    }

    // Counter
    const counterGeometry = new THREE.BoxGeometry(10, 1.5, 2);
    const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.75, 7);
    counter.castShadow = true;
    this.scene.add(counter);
    this.interiorObjects.push(counter);
  }

  createDealershipContent() {
    // Car display platforms
    for (let i = 0; i < 3; i++) {
      const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.3, 32);
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(-6 + i * 6, 0.15, -5);
      this.scene.add(platform);
      this.interiorObjects.push(platform);
    }
  }

  createClubContent() {
    // Dance floor
    const danceFloorGeometry = new THREE.CircleGeometry(5, 32);
    const danceFloorMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.3
    });
    const danceFloor = new THREE.Mesh(danceFloorGeometry, danceFloorMaterial);
    danceFloor.rotation.x = -Math.PI / 2;
    danceFloor.position.y = 0.01;
    this.scene.add(danceFloor);
    this.interiorObjects.push(danceFloor);

    // Bar
    const barGeometry = new THREE.BoxGeometry(12, 1.5, 2);
    const barMaterial = new THREE.MeshStandardMaterial({ color: 0x4a1a1a });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(0, 0.75, 8);
    this.scene.add(bar);
    this.interiorObjects.push(bar);

    // Colorful lights
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff];
    colors.forEach((color, i) => {
      const light = new THREE.PointLight(color, 1, 15);
      light.position.set(-6 + i * 4, 4, 0);
      this.scene.add(light);
      this.interiorObjects.push(light);
    });
  }

  createSchoolContent() {
    // Desks
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const deskGeometry = new THREE.BoxGeometry(1.5, 1, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(-4 + col * 2.5, 0.5, -6 + row * 3);
        desk.castShadow = true;
        this.scene.add(desk);
        this.interiorObjects.push(desk);
      }
    }

    // Blackboard
    const blackboardGeometry = new THREE.PlaneGeometry(8, 3);
    const blackboardMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const blackboard = new THREE.Mesh(blackboardGeometry, blackboardMaterial);
    blackboard.position.set(0, 2, -9.9);
    this.scene.add(blackboard);
    this.interiorObjects.push(blackboard);
  }

  createHouseContent() {
    // Furniture
    const furnitureConfigs = [
      { size: [2, 1, 1], pos: [-5, 0.5, -5], color: 0x8b4513 }, // Table
      { size: [1, 1, 1], pos: [-3, 0.5, 5], color: 0x654321 },  // Chair
      { size: [3, 2, 1], pos: [5, 1, 5], color: 0x2d2d2d },     // Couch
    ];

    furnitureConfigs.forEach(config => {
      const geometry = new THREE.BoxGeometry(...config.size);
      const material = new THREE.MeshStandardMaterial({ color: config.color });
      const furniture = new THREE.Mesh(geometry, material);
      furniture.position.set(...config.pos);
      furniture.castShadow = true;
      this.scene.add(furniture);
      this.interiorObjects.push(furniture);
    });
  }

  createMarriageHallContent() {
    // Stage
    const stageGeometry = new THREE.BoxGeometry(10, 1, 5);
    const stageMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, 0.5, -7);
    this.scene.add(stage);
    this.interiorObjects.push(stage);

    // Decorative lights
    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(0xffd700, 0.8, 10);
      light.position.set(-8 + i * 4, 4, 0);
      this.scene.add(light);
      this.interiorObjects.push(light);
    }
  }

  hideExterior() {
    this.scene.getScene().traverse((object) => {
      if (object.isMesh || object.isLight) {
        if (!this.interiorObjects.includes(object)) {
          object.visible = false;
          this.exteriorObjects.push(object);
        }
      }
    });
  }

  showExterior() {
    this.exteriorObjects.forEach(object => {
      object.visible = true;
    });
    this.exteriorObjects = [];
  }

  exitInterior() {
    // Remove interior objects
    this.interiorObjects.forEach(object => {
      this.scene.remove(object);
    });
    this.interiorObjects = [];

    // Show exterior
    this.showExterior();

    // Hide interior panel
    const interiorPanel = document.getElementById('interior-panel');
    if (interiorPanel) {
      interiorPanel.style.display = 'none';
    }

    this.currentInterior = null;

    if (this.onExitCallback) {
      this.onExitCallback();
    }
  }

  getInteriorTitle(buildingType) {
    const titles = {
      [BUILDING_TYPES.HOUSE]: 'House',
      [BUILDING_TYPES.MALL]: 'Shopping Mall',
      [BUILDING_TYPES.CLUB]: 'Night Club',
      [BUILDING_TYPES.SCHOOL]: 'School',
      [BUILDING_TYPES.COLLEGE]: 'College',
      [BUILDING_TYPES.SHOP]: 'Shop',
      [BUILDING_TYPES.CAR_DEALERSHIP]: 'Car Dealership',
      [BUILDING_TYPES.MARRIAGE_HALL]: 'Marriage Hall',
    };

    return titles[buildingType] || 'Interior';
  }

  onExit(callback) {
    this.onExitCallback = callback;
  }

  isInInterior() {
    return this.currentInterior !== null;
  }
}

import * as THREE from 'three';
import { GAME_CONSTANTS, BUILDING_TYPES } from '../../shared/constants.js';
import { Building } from './Building.js';

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.roads = [];
    this.interactables = new Map();
    this.generate();
  }

  generate() {
    this.createGround();
    this.createRoadGrid();
    this.createBuildings();
    this.createStreetLights();
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(GAME_CONSTANTS.CITY_SIZE, GAME_CONSTANTS.CITY_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5f3a,
      roughness: 0.8
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoadGrid() {
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2d2d,
      roughness: 0.9
    });

    const roadWidth = 6;
    const numRoads = 5;
    const spacing = GAME_CONSTANTS.CITY_SIZE / numRoads;

    // Horizontal roads
    for (let i = 0; i <= numRoads; i++) {
      const roadGeometry = new THREE.PlaneGeometry(GAME_CONSTANTS.CITY_SIZE, roadWidth);
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.02, -GAME_CONSTANTS.CITY_SIZE / 2 + i * spacing);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roads.push(road);

      // Road markings
      this.createRoadMarkings(road, true);
    }

    // Vertical roads
    for (let i = 0; i <= numRoads; i++) {
      const roadGeometry = new THREE.PlaneGeometry(roadWidth, GAME_CONSTANTS.CITY_SIZE);
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set(-GAME_CONSTANTS.CITY_SIZE / 2 + i * spacing, 0.02, 0);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roads.push(road);

      // Road markings
      this.createRoadMarkings(road, false);
    }
  }

  createRoadMarkings(road, isHorizontal) {
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const dashLength = 2;
    const dashSpacing = 3;
    const numDashes = 15;

    for (let i = 0; i < numDashes; i++) {
      const dashGeometry = new THREE.PlaneGeometry(
        isHorizontal ? dashLength : 0.2,
        isHorizontal ? 0.2 : dashLength
      );
      const dash = new THREE.Mesh(dashGeometry, markingMaterial);
      dash.rotation.x = -Math.PI / 2;

      if (isHorizontal) {
        dash.position.set(
          -GAME_CONSTANTS.CITY_SIZE / 2 + i * dashSpacing * 2,
          0.03,
          road.position.z
        );
      } else {
        dash.position.set(
          road.position.x,
          0.03,
          -GAME_CONSTANTS.CITY_SIZE / 2 + i * dashSpacing * 2
        );
      }

      this.scene.add(dash);
    }
  }

  createBuildings() {
    const buildingConfigs = [
      // Houses
      { type: BUILDING_TYPES.HOUSE, position: new THREE.Vector3(-30, 0, -30), color: 0xf4a460, size: { width: 12, height: 8, depth: 12 } },
      { type: BUILDING_TYPES.HOUSE, position: new THREE.Vector3(-30, 0, 30), color: 0xdeb887, size: { width: 10, height: 7, depth: 10 } },
      { type: BUILDING_TYPES.HOUSE, position: new THREE.Vector3(30, 0, -30), color: 0xe9967a, size: { width: 11, height: 7, depth: 11 } },

      // Mall
      { type: BUILDING_TYPES.MALL, position: new THREE.Vector3(0, 0, -50), color: 0x4682b4, size: { width: 30, height: 15, depth: 20 } },

      // Club
      { type: BUILDING_TYPES.CLUB, position: new THREE.Vector3(-50, 0, 0), color: 0x9370db, size: { width: 20, height: 12, depth: 20 } },

      // School
      { type: BUILDING_TYPES.SCHOOL, position: new THREE.Vector3(50, 0, 0), color: 0xffa07a, size: { width: 25, height: 10, depth: 25 } },

      // College
      { type: BUILDING_TYPES.COLLEGE, position: new THREE.Vector3(50, 0, 50), color: 0x8fbc8f, size: { width: 30, height: 12, depth: 25 } },

      // Shops
      { type: BUILDING_TYPES.SHOP, position: new THREE.Vector3(0, 0, 30), color: 0xffb6c1, size: { width: 15, height: 8, depth: 12 } },
      { type: BUILDING_TYPES.SHOP, position: new THREE.Vector3(-50, 0, -50), color: 0xffdab9, size: { width: 14, height: 8, depth: 12 } },

      // Car Dealership
      { type: BUILDING_TYPES.CAR_DEALERSHIP, position: new THREE.Vector3(30, 0, 50), color: 0xff6347, size: { width: 25, height: 10, depth: 20 } },

      // Marriage Hall
      { type: BUILDING_TYPES.MARRIAGE_HALL, position: new THREE.Vector3(-50, 0, 50), color: 0xffd700, size: { width: 28, height: 14, depth: 22 } },
    ];

    buildingConfigs.forEach(config => {
      const building = new Building(config);
      this.scene.add(building.mesh);
      this.buildings.push(building);
      this.interactables.set(building.mesh.uuid, building);
    });
  }

  createStreetLights() {
    const lightPositions = [
      new THREE.Vector3(-40, 0, -40),
      new THREE.Vector3(-40, 0, 40),
      new THREE.Vector3(40, 0, -40),
      new THREE.Vector3(40, 0, 40),
      new THREE.Vector3(0, 0, -60),
      new THREE.Vector3(0, 0, 60),
      new THREE.Vector3(-60, 0, 0),
      new THREE.Vector3(60, 0, 0),
    ];

    lightPositions.forEach(pos => {
      const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.copy(pos);
      pole.position.y = 4;
      pole.castShadow = true;
      this.scene.add(pole);

      // Light bulb
      const bulbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const bulbMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffe0,
        emissive: 0xffffe0,
        emissiveIntensity: 0.5
      });
      const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulb.position.copy(pos);
      bulb.position.y = 8;
      this.scene.add(bulb);

      // Point light
      const light = new THREE.PointLight(0xffffe0, 1, 30);
      light.position.copy(pos);
      light.position.y = 8;
      light.castShadow = true;
      this.scene.add(light);
    });
  }

  getNearbyInteractables(position, radius) {
    const nearby = [];

    this.buildings.forEach(building => {
      const distance = position.distanceTo(building.mesh.position);
      if (distance <= radius) {
        nearby.push({
          type: 'building',
          building,
          distance
        });
      }
    });

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  getBuildings() {
    return this.buildings;
  }
}

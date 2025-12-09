import * as THREE from 'three';
import { BUILDING_TYPES, INTERIOR_TYPES } from '../../shared/constants.js';
import { getSharedMaterial, optimizeForMobile } from '../utils/optimization.js';

export class Building {
  constructor({ type, position, color, size }) {
    this.type = type;
    this.position = position;
    this.color = color;
    this.size = size;
    this.interiorType = this.getInteriorType();
    this.optimizationSettings = optimizeForMobile();

    this.createMesh();
    this.createSign();
  }

  createMesh() {
    // Main building structure - use shared material
    const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth);
    const material = getSharedMaterial('building', this.color, {
      roughness: 0.7,
      metalness: 0.2
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.position.y = this.size.height / 2;
    this.mesh.castShadow = this.optimizationSettings.shadowsEnabled;
    this.mesh.receiveShadow = this.optimizationSettings.shadowsEnabled;

    // Store building data in mesh userData
    this.mesh.userData = {
      type: 'building',
      buildingType: this.type,
      interiorType: this.interiorType,
      interactable: true
    };

    // Create windows
    this.createWindows();

    // Create door
    this.createDoor();

    // Create roof
    this.createRoof();
  }

  createWindows() {
    // Skip windows on mobile to save GPU memory
    if (!this.optimizationSettings.shadowsEnabled) {
      console.log('⚡ Skipping windows (mobile mode)');
      return;
    }

    // Use shared window material
    const windowMaterial = getSharedMaterial('window', 0x87ceeb, {
      emissive: 0x4488ff,
      emissiveIntensity: 0.2
    });

    const windowSize = 1.5;
    const windowSpacing = 3;
    const numWindowsX = Math.floor(this.size.width / windowSpacing) - 1;
    const numWindowsZ = Math.floor(this.size.depth / windowSpacing) - 1;

    // Front windows - reduced count on desktop too
    const maxWindows = 3; // Limit windows per side
    for (let i = 0; i < Math.min(numWindowsX, maxWindows); i++) {
      const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, 0.2);
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(
        this.position.x - this.size.width / 2 + (i + 1) * windowSpacing,
        this.position.y + this.size.height / 3,
        this.position.z + this.size.depth / 2 + 0.1
      );
      this.mesh.add(window);
    }

    // Skip side windows to reduce geometry further
  }

  createDoor() {
    const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const doorMaterial = getSharedMaterial('door', 0x654321, {
      roughness: 0.8
    });

    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(
      this.position.x,
      this.position.y - this.size.height / 2 + 1.5,
      this.position.z + this.size.depth / 2 + 0.1
    );
    this.mesh.add(door);
  }

  createRoof() {
    const roofGeometry = new THREE.ConeGeometry(
      Math.max(this.size.width, this.size.depth) * 0.7,
      3,
      4
    );
    const roofMaterial = getSharedMaterial('roof', 0x8b4513, {
      roughness: 0.9
    });

    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(
      this.position.x,
      this.position.y + this.size.height / 2 + 1.5,
      this.position.z
    );
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    this.mesh.add(roof);
  }

  createSign() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getDisplayName(), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const signGeometry = new THREE.PlaneGeometry(4, 1);
    const sign = new THREE.Mesh(signGeometry, signMaterial);

    sign.position.set(
      this.position.x,
      this.position.y + this.size.height / 2 + 1,
      this.position.z + this.size.depth / 2 + 0.2
    );

    this.mesh.add(sign);
  }

  getDisplayName() {
    const names = {
      [BUILDING_TYPES.HOUSE]: 'HOUSE',
      [BUILDING_TYPES.MALL]: 'SHOPPING MALL',
      [BUILDING_TYPES.CLUB]: 'NIGHT CLUB',
      [BUILDING_TYPES.SCHOOL]: 'SCHOOL',
      [BUILDING_TYPES.COLLEGE]: 'COLLEGE',
      [BUILDING_TYPES.SHOP]: 'SHOP',
      [BUILDING_TYPES.CAR_DEALERSHIP]: 'CAR DEALERSHIP',
      [BUILDING_TYPES.MARRIAGE_HALL]: 'MARRIAGE HALL',
    };

    return names[this.type] || 'BUILDING';
  }

  getInteriorType() {
    const mapping = {
      [BUILDING_TYPES.HOUSE]: INTERIOR_TYPES.HOUSE_INTERIOR,
      [BUILDING_TYPES.MALL]: INTERIOR_TYPES.MALL_INTERIOR,
      [BUILDING_TYPES.CLUB]: INTERIOR_TYPES.CLUB_INTERIOR,
      [BUILDING_TYPES.SCHOOL]: INTERIOR_TYPES.SCHOOL_INTERIOR,
      [BUILDING_TYPES.COLLEGE]: INTERIOR_TYPES.COLLEGE_INTERIOR,
      [BUILDING_TYPES.SHOP]: INTERIOR_TYPES.SHOP_INTERIOR,
      [BUILDING_TYPES.CAR_DEALERSHIP]: INTERIOR_TYPES.DEALERSHIP_INTERIOR,
      [BUILDING_TYPES.MARRIAGE_HALL]: INTERIOR_TYPES.MARRIAGE_HALL_INTERIOR,
    };

    return mapping[this.type];
  }
}

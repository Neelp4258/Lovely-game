import * as THREE from 'three';
import { GAME_CONSTANTS, DEFAULT_CUSTOMIZATION } from '../../shared/constants.js';

export class Player {
  constructor(customization = DEFAULT_CUSTOMIZATION) {
    this.customization = customization;
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.velocity = new THREE.Vector3();
    this.isMoving = false;
    this.isRunning = false;
    this.currentEmote = null;
    this.inVehicle = false;
    this.currentVehicle = null;

    this.createMesh();
  }

  createMesh() {
    this.group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.customization.shirtColor
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 1;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.customization.skinColor
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = 1.6;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair
    if (this.customization.hairStyle !== 'bald') {
      this.createHair();
    }

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.12, 0.6, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: this.customization.pantsColor
    });

    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.position.set(-0.15, 0.4, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.position.set(0.15, 0.4, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: this.customization.skinColor
    });

    this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
    this.leftArm.position.set(-0.4, 1.2, 0);
    this.leftArm.rotation.z = 0.3;
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
    this.rightArm.position.set(0.4, 1.2, 0);
    this.rightArm.rotation.z = -0.3;
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    this.group.position.copy(this.position);
  }

  createHair() {
    let hairGeometry;

    if (this.customization.hairStyle === 'short') {
      hairGeometry = new THREE.SphereGeometry(0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    } else if (this.customization.hairStyle === 'long') {
      hairGeometry = new THREE.SphereGeometry(0.28, 16, 16);
    }

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: this.customization.hairColor
    });

    this.hair = new THREE.Mesh(hairGeometry, hairMaterial);
    this.hair.position.y = 1.65;
    this.hair.castShadow = true;
    this.group.add(this.hair);
  }

  updateCustomization(customization) {
    this.customization = { ...this.customization, ...customization };

    // Update materials
    this.body.material.color.set(this.customization.shirtColor);
    this.head.material.color.set(this.customization.skinColor);
    this.leftLeg.material.color.set(this.customization.pantsColor);
    this.rightLeg.material.color.set(this.customization.pantsColor);
    this.leftArm.material.color.set(this.customization.skinColor);
    this.rightArm.material.color.set(this.customization.skinColor);

    // Recreate hair if style changed
    if (this.hair) {
      this.group.remove(this.hair);
      this.hair = null;
    }

    if (this.customization.hairStyle !== 'bald') {
      this.createHair();
    }
  }

  update(deltaTime) {
    if (this.inVehicle) return;

    // Animate walking
    if (this.isMoving) {
      const walkSpeed = this.isRunning ? 12 : 8;
      const time = Date.now() * 0.001 * walkSpeed;

      this.leftLeg.rotation.x = Math.sin(time) * 0.5;
      this.rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;

      this.leftArm.rotation.x = Math.sin(time + Math.PI) * 0.3;
      this.rightArm.rotation.x = Math.sin(time) * 0.3;

      // Bob effect
      this.body.position.y = 1 + Math.abs(Math.sin(time * 2)) * 0.05;
      this.head.position.y = 1.6 + Math.abs(Math.sin(time * 2)) * 0.05;
    } else {
      // Reset to idle pose
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.body.position.y = 1;
      this.head.position.y = 1.6;
    }

    // Update emote animations
    if (this.currentEmote) {
      this.updateEmoteAnimation();
    }
  }

  updateEmoteAnimation() {
    const time = Date.now() * 0.001;

    switch (this.currentEmote) {
      case 'wave':
        this.rightArm.rotation.z = -0.3 + Math.sin(time * 8) * 0.5;
        this.rightArm.rotation.x = Math.sin(time * 8) * 0.3;
        break;

      case 'dance':
        this.body.rotation.y = Math.sin(time * 4) * 0.3;
        this.leftArm.rotation.z = 0.3 + Math.sin(time * 6) * 0.5;
        this.rightArm.rotation.z = -0.3 - Math.sin(time * 6) * 0.5;
        break;

      case 'sit':
        this.leftLeg.rotation.x = Math.PI / 2;
        this.rightLeg.rotation.x = Math.PI / 2;
        this.body.position.y = 0.5;
        break;

      case 'clap':
        const clapAngle = Math.sin(time * 10) * 0.5;
        this.leftArm.rotation.y = -clapAngle;
        this.rightArm.rotation.y = clapAngle;
        break;

      case 'kiss':
        this.head.scale.z = 1.2;
        break;
    }
  }

  playEmote(emote) {
    this.currentEmote = emote;

    setTimeout(() => {
      this.stopEmote();
    }, 3000);
  }

  stopEmote() {
    this.currentEmote = null;
    this.body.rotation.y = 0;
    this.head.scale.set(1, 1, 1);
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.group.position.copy(this.position);
  }

  setRotation(rotation) {
    this.rotation = rotation;
    this.group.rotation.y = rotation;
  }

  enterVehicle(vehicle) {
    this.inVehicle = true;
    this.currentVehicle = vehicle;
    this.group.visible = false;
  }

  exitVehicle() {
    if (this.currentVehicle) {
      const exitPos = this.currentVehicle.position.clone();
      exitPos.x += 3;
      this.setPosition(exitPos.x, exitPos.y, exitPos.z);
    }

    this.inVehicle = false;
    this.currentVehicle = null;
    this.group.visible = true;
  }

  getMesh() {
    return this.group;
  }

  getPosition() {
    return this.position;
  }
}

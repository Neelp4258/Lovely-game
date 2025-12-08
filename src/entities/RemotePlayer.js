import * as THREE from 'three';
import { DEFAULT_CUSTOMIZATION } from '../../shared/constants.js';

export class RemotePlayer {
  constructor(socketId, playerId, playerData) {
    this.socketId = socketId;
    this.playerId = playerId;
    this.customization = playerData?.customization || DEFAULT_CUSTOMIZATION;
    this.position = new THREE.Vector3();
    this.rotation = 0;
    this.currentEmote = null;

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

    // Name tag
    this.createNameTag();

    this.group.position.copy(this.position);
  }

  createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.playerId.substring(0, 10), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    this.nameTag = new THREE.Sprite(spriteMaterial);
    this.nameTag.position.set(0, 2.5, 0);
    this.nameTag.scale.set(2, 0.5, 1);
    this.group.add(this.nameTag);
  }

  update(data) {
    if (data.position) {
      this.position.set(data.position.x, data.position.y, data.position.z);
      this.group.position.lerp(this.position, 0.3);
    }

    if (data.rotation !== undefined) {
      this.rotation = data.rotation;
      this.group.rotation.y = this.rotation;
    }

    if (data.isMoving) {
      const time = Date.now() * 0.001 * 8;
      this.leftLeg.rotation.x = Math.sin(time) * 0.5;
      this.rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
    } else {
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
    }
  }

  playEmote(emote) {
    this.currentEmote = emote;

    setTimeout(() => {
      this.currentEmote = null;
    }, 3000);
  }

  getMesh() {
    return this.group;
  }

  destroy() {
    this.group.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

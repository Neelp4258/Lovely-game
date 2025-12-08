import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../shared/constants.js';

export class InteractionSystem {
  constructor(player, city, cars, camera) {
    this.player = player;
    this.city = city;
    this.cars = cars;
    this.camera = camera;

    this.nearestInteractable = null;
    this.onInteractionCallback = null;

    this.setupUI();
  }

  setupUI() {
    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.interactionBtn = document.getElementById('interaction-btn');
    this.interactionLabel = document.getElementById('interaction-label');

    if (this.interactionBtn) {
      this.interactionBtn.addEventListener('click', () => this.interact());
    }

    // Keyboard interaction
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'e' || e.key === ' ') {
        this.interact();
      }
    });
  }

  update() {
    if (this.player.inVehicle) {
      this.hidePrompt();
      return;
    }

    this.findNearestInteractable();

    if (this.nearestInteractable) {
      this.showPrompt();
    } else {
      this.hidePrompt();
    }
  }

  findNearestInteractable() {
    this.nearestInteractable = null;
    let closestDistance = GAME_CONSTANTS.INTERACTION_DISTANCE;

    const playerPos = this.player.getPosition();

    // Check buildings
    const nearbyBuildings = this.city.getNearbyInteractables(playerPos, GAME_CONSTANTS.INTERACTION_DISTANCE);
    if (nearbyBuildings.length > 0) {
      this.nearestInteractable = {
        type: 'building',
        object: nearbyBuildings[0].building,
        distance: nearbyBuildings[0].distance
      };
      closestDistance = nearbyBuildings[0].distance;
    }

    // Check cars
    this.cars.forEach(car => {
      const distance = playerPos.distanceTo(car.getPosition());
      if (distance < closestDistance) {
        this.nearestInteractable = {
          type: 'car',
          object: car,
          distance
        };
        closestDistance = distance;
      }
    });
  }

  showPrompt() {
    if (!this.interactionPrompt) return;

    this.interactionPrompt.style.display = 'block';

    if (this.nearestInteractable.type === 'building') {
      const building = this.nearestInteractable.object;
      this.interactionLabel.textContent = `Enter ${building.getDisplayName()}`;
    } else if (this.nearestInteractable.type === 'car') {
      this.interactionLabel.textContent = 'Enter Vehicle';
    }
  }

  hidePrompt() {
    if (this.interactionPrompt) {
      this.interactionPrompt.style.display = 'none';
    }
  }

  interact() {
    if (!this.nearestInteractable) return;

    if (this.onInteractionCallback) {
      this.onInteractionCallback(this.nearestInteractable);
    }

    this.hidePrompt();
  }

  onInteraction(callback) {
    this.onInteractionCallback = callback;
  }
}

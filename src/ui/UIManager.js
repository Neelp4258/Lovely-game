import { BUILDING_TYPES, JOB_TYPES } from '../../shared/constants.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.setupPanels();
    this.setupMenuButtons();
    this.setupEmoteSystem();
  }

  setupPanels() {
    // Close buttons for all panels
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const panel = e.target.closest('.ui-panel');
        if (panel) panel.style.display = 'none';
      });
    });

    // Wardrobe customization
    this.setupWardrobePanel();

    // Jobs panel
    this.setupJobsPanel();
  }

  setupMenuButtons() {
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const panelName = e.target.dataset.panel;
        this.openPanel(panelName);
      });
    });
  }

  setupWardrobePanel() {
    const saveBtn = document.getElementById('save-customization-btn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
      const customization = {
        hairStyle: document.querySelector('.option-btn.active[data-type="hairStyle"]')?.dataset.value || 'short',
        hairColor: document.getElementById('hair-color')?.value || '#3d2817',
        skinColor: document.getElementById('skin-color')?.value || '#ffdbac',
        shirtColor: document.getElementById('shirt-color')?.value || '#4287f5',
        pantsColor: document.getElementById('pants-color')?.value || '#2d2d2d',
      };

      // Update player appearance
      this.game.player.updateCustomization(customization);

      // Save to Firestore
      try {
        await this.game.firestoreManager.saveCustomization(this.game.currentUser.uid, customization);
        this.showNotification('Customization saved!');
      } catch (error) {
        console.error('Error saving customization:', error);
        this.showNotification('Failed to save customization');
      }

      document.getElementById('wardrobe-panel').style.display = 'none';
    });

    // Hair style selection
    document.querySelectorAll('.option-btn[data-type="hairStyle"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.option-btn[data-type="hairStyle"]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Set initial color values from player
    if (this.game.player) {
      const customization = this.game.player.customization;
      document.getElementById('hair-color').value = customization.hairColor;
      document.getElementById('skin-color').value = customization.skinColor;
      document.getElementById('shirt-color').value = customization.shirtColor;
      document.getElementById('pants-color').value = customization.pantsColor;
    }
  }

  setupJobsPanel() {
    const jobs = [
      { id: 'delivery', name: 'Delivery Driver', reward: 50, description: 'Deliver packages around the city' },
      { id: 'taxi', name: 'Taxi Driver', reward: 40, description: 'Transport passengers to their destinations' },
      { id: 'shop_clerk', name: 'Shop Clerk', reward: 30, description: 'Serve customers at the shop' },
      { id: 'teacher', name: 'Teacher', reward: 60, description: 'Teach students at school' },
    ];

    const jobList = document.getElementById('job-list');
    if (!jobList) return;

    jobList.innerHTML = jobs.map(job => `
      <div class="job-item">
        <div class="job-info">
          <h4>${job.name}</h4>
          <p>${job.description}</p>
        </div>
        <div>
          <div class="job-reward">$${job.reward}</div>
          <button class="btn btn-success btn-sm" data-job-id="${job.id}" data-reward="${job.reward}">Start Job</button>
        </div>
      </div>
    `).join('');

    // Job start buttons
    jobList.querySelectorAll('.btn-success').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const jobId = e.target.dataset.jobId;
        const reward = parseInt(e.target.dataset.reward);

        // Simple job completion (in a real game, this would be more complex)
        try {
          const result = await this.game.firestoreManager.completeJob(
            this.game.currentUser.uid,
            jobId,
            reward
          );

          this.updateMoneyDisplay(result.newMoney);
          this.showNotification(`Job completed! Earned $${reward}`);
          document.getElementById('jobs-panel').style.display = 'none';
        } catch (error) {
          console.error('Error completing job:', error);
          this.showNotification('Failed to complete job');
        }
      });
    });
  }

  setupEmoteSystem() {
    const emoteBtn = document.getElementById('emote-btn');
    const emoteMenu = document.getElementById('emote-menu');

    if (emoteBtn && emoteMenu) {
      emoteBtn.addEventListener('click', () => {
        emoteMenu.style.display = emoteMenu.style.display === 'none' ? 'flex' : 'none';
      });

      document.querySelectorAll('.emote-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const emote = e.target.dataset.emote;
          this.playEmote(emote);
          emoteMenu.style.display = 'none';
        });
      });

      // Close emote menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!emoteBtn.contains(e.target) && !emoteMenu.contains(e.target)) {
          emoteMenu.style.display = 'none';
        }
      });
    }
  }

  playEmote(emote) {
    if (emote === 'kiss') {
      // Special handling for kiss emote
      this.showKissRequest();
    } else {
      this.game.player.playEmote(emote);

      // Broadcast emote to other players
      if (this.game.networkManager) {
        this.game.networkManager.broadcastEmote(emote);
      }
    }
  }

  showKissRequest() {
    // In a real implementation, this would send a request to nearby players
    this.showNotification('Kiss emote requires another player nearby to accept!');
  }

  openPanel(panelName) {
    // Close all panels first
    document.querySelectorAll('.ui-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    // Open requested panel
    const panelMap = {
      'wardrobe': 'wardrobe-panel',
      'jobs': 'jobs-panel',
      'map': null, // Could implement minimap
      'emotes': null, // Handled by emote button
    };

    const panelId = panelMap[panelName];
    if (panelId) {
      const panel = document.getElementById(panelId);
      if (panel) panel.style.display = 'block';
    }
  }

  updatePlayerInfo(playerName, money) {
    const playerNameEl = document.getElementById('player-name');
    if (playerNameEl) playerNameEl.textContent = playerName;

    this.updateMoneyDisplay(money);
  }

  updateMoneyDisplay(money) {
    const moneyEl = document.getElementById('player-money');
    if (moneyEl) moneyEl.textContent = `💰 $${money}`;
  }

  updateRoomCode(roomCode) {
    const roomCodeEl = document.getElementById('room-code-display');
    if (roomCodeEl) {
      roomCodeEl.textContent = roomCode ? `Room: ${roomCode}` : '';
    }
  }

  showNotification(message, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  showShopPanel(items) {
    const shopPanel = document.getElementById('shop-panel');
    const shopItems = document.getElementById('shop-items');

    if (!shopPanel || !shopItems) return;

    shopItems.innerHTML = items.map(item => `
      <div class="shop-item">
        <h4>${item.name}</h4>
        <p>${item.description}</p>
        <div class="item-price">$${item.price}</div>
        <button class="btn btn-success" data-item-id="${item.id}" data-item-price="${item.price}">Buy</button>
      </div>
    `).join('');

    shopPanel.style.display = 'block';

    // Add buy button handlers
    shopItems.querySelectorAll('.btn-success').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const itemId = e.target.dataset.itemId;
        const price = parseInt(e.target.dataset.itemPrice);

        try {
          const result = await this.game.firestoreManager.processPurchase(
            this.game.currentUser.uid,
            'clothes',
            itemId,
            price
          );

          this.updateMoneyDisplay(result.newMoney);
          this.showNotification('Purchase successful!');
        } catch (error) {
          console.error('Error purchasing item:', error);
          this.showNotification(error.message || 'Purchase failed');
        }
      });
    });
  }

  showDealershipPanel(cars) {
    const dealershipPanel = document.getElementById('dealership-panel');
    const carList = document.getElementById('car-list');

    if (!dealershipPanel || !carList) return;

    carList.innerHTML = cars.map(car => `
      <div class="car-item">
        <h4>${car.name}</h4>
        <p>${car.description}</p>
        <div class="car-price">$${car.price}</div>
        <button class="btn btn-success" data-car-id="${car.id}" data-car-price="${car.price}">Buy</button>
      </div>
    `).join('');

    dealershipPanel.style.display = 'block';

    // Add buy button handlers
    carList.querySelectorAll('.btn-success').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const carId = e.target.dataset.carId;
        const price = parseInt(e.target.dataset.carPrice);

        try {
          const result = await this.game.firestoreManager.processPurchase(
            this.game.currentUser.uid,
            'cars',
            carId,
            price
          );

          this.updateMoneyDisplay(result.newMoney);
          this.showNotification('Car purchased!');

          // Spawn new car in game
          if (this.game.spawnPlayerCar) {
            this.game.spawnPlayerCar(carId);
          }
        } catch (error) {
          console.error('Error purchasing car:', error);
          this.showNotification(error.message || 'Purchase failed');
        }
      });
    });
  }
}

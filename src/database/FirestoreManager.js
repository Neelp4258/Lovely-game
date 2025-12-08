import { db } from '../config/firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { DEFAULT_MONEY, DEFAULT_CUSTOMIZATION } from '../../shared/constants.js';

export class FirestoreManager {
  constructor() {
    this.serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  }

  async getPlayer(playerId) {
    try {
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      return playerDoc.exists() ? playerDoc.data() : null;
    } catch (error) {
      console.error('Error getting player:', error);
      return null;
    }
  }

  async createPlayer(playerId, displayName) {
    const playerData = {
      id: playerId,
      displayName,
      money: DEFAULT_MONEY,
      customization: { ...DEFAULT_CUSTOMIZATION },
      inventory: {
        cars: [],
        clothes: [],
        accessories: []
      },
      lastPosition: { x: 0, y: 0, z: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'players', playerId), playerData);
      return playerData;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async savePlayer(playerId, data) {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving player:', error);
      throw error;
    }
  }

  async savePlayerPosition(playerId, position) {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        lastPosition: position,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving position:', error);
    }
  }

  async updateMoney(playerId, amount) {
    try {
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      const currentMoney = playerDoc.data().money || 0;
      const newMoney = currentMoney + amount;

      await updateDoc(doc(db, 'players', playerId), {
        money: newMoney,
        updatedAt: serverTimestamp()
      });

      return newMoney;
    } catch (error) {
      console.error('Error updating money:', error);
      throw error;
    }
  }

  async processPurchase(playerId, itemType, itemId, cost) {
    try {
      const response = await fetch(`${this.serverUrl}/api/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, itemType, itemId, cost })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Purchase failed');
      }

      return result;
    } catch (error) {
      console.error('Error processing purchase:', error);
      throw error;
    }
  }

  async completeJob(playerId, jobId, reward) {
    try {
      const response = await fetch(`${this.serverUrl}/api/job/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, jobId, reward })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Job completion failed');
      }

      return result;
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
    }
  }

  async saveCustomization(playerId, customization) {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        customization,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving customization:', error);
      throw error;
    }
  }
}

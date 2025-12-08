import admin from 'firebase-admin';
import { readFileSync } from 'fs';

export class FirebaseAdmin {
  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    try {
      if (admin.apps.length === 0) {
        let serviceAccount;

        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
          serviceAccount = JSON.parse(
            readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
          );
        } else if (process.env.FIREBASE_PRIVATE_KEY) {
          serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          };
        } else {
          console.warn('⚠️  Firebase Admin SDK not initialized - missing credentials');
          console.warn('   Server will run but Firestore operations will not work');
          this.db = null;
          return;
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || 'vendor-f9973'
        });

        this.db = admin.firestore();
        console.log('✅ Firebase Admin SDK initialized');
      } else {
        this.db = admin.firestore();
      }
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error.message);
      this.db = null;
    }
  }

  async savePlayer(playerId, data) {
    if (!this.db) throw new Error('Firebase Admin not initialized');

    const playerRef = this.db.collection('players').doc(playerId);
    await playerRef.set({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };
  }

  async getPlayer(playerId) {
    if (!this.db) throw new Error('Firebase Admin not initialized');

    const playerDoc = await this.db.collection('players').doc(playerId).get();
    return playerDoc.exists ? playerDoc.data() : null;
  }

  async processPurchase(playerId, itemType, itemId, cost) {
    if (!this.db) throw new Error('Firebase Admin not initialized');

    const playerRef = this.db.collection('players').doc(playerId);

    return await this.db.runTransaction(async (transaction) => {
      const playerDoc = await transaction.get(playerRef);

      if (!playerDoc.exists) {
        throw new Error('Player not found');
      }

      const playerData = playerDoc.data();
      const currentMoney = playerData.money || 0;

      if (currentMoney < cost) {
        throw new Error('Insufficient funds');
      }

      const newMoney = currentMoney - cost;
      const inventory = playerData.inventory || {};

      if (!inventory[itemType]) {
        inventory[itemType] = [];
      }

      inventory[itemType].push({
        id: itemId,
        purchasedAt: Date.now()
      });

      transaction.update(playerRef, {
        money: newMoney,
        inventory: inventory
      });

      // Log transaction
      const transactionRef = this.db.collection('transactions').doc();
      transaction.set(transactionRef, {
        playerId,
        type: 'purchase',
        itemType,
        itemId,
        cost,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, newMoney, inventory };
    });
  }

  async completeJob(playerId, jobId, reward) {
    if (!this.db) throw new Error('Firebase Admin not initialized');

    const playerRef = this.db.collection('players').doc(playerId);

    return await this.db.runTransaction(async (transaction) => {
      const playerDoc = await transaction.get(playerRef);

      if (!playerDoc.exists) {
        throw new Error('Player not found');
      }

      const playerData = playerDoc.data();
      const currentMoney = playerData.money || 0;
      const newMoney = currentMoney + reward;

      transaction.update(playerRef, {
        money: newMoney
      });

      // Log transaction
      const transactionRef = this.db.collection('transactions').doc();
      transaction.set(transactionRef, {
        playerId,
        type: 'job_reward',
        jobId,
        reward,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, newMoney, reward };
    });
  }

  async savePlayerPosition(playerId, position) {
    if (!this.db) throw new Error('Firebase Admin not initialized');

    await this.db.collection('players').doc(playerId).update({
      lastPosition: position,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

# 🔥 Firestore Database Setup Guide

If you're getting "Failed to initialize game" error, you need to set up Firestore database.

## 🚨 Common Issue:

**Error:** "Failed to initialize game" when creating a room
**Cause:** Firestore database doesn't exist or has wrong security rules

---

## ✅ Fix Firestore Database (3 Minutes)

### Step 1: Create Firestore Database

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select project: **vendor-f9973** (or your project)

2. **Navigate to Firestore Database**
   - Click **"Firestore Database"** in left sidebar
   - If you see "Get started", click it

3. **Create Database**
   - Choose **"Start in test mode"** (for now)
   - Click **"Next"**

4. **Choose Location**
   - Select closest location to your users
   - Example: `us-central1` or `europe-west1`
   - Click **"Enable"**
   - Wait ~30 seconds for database creation

---

### Step 2: Set Up Security Rules

1. **Click "Rules" Tab**
   - Should see the rules editor

2. **Replace with These Rules:**

**For Development (Allows all authenticated users):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Players collection - users can only read/write their own data
    match /players/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }

    // Transactions - read-only for authenticated users
    match /transactions/{transactionId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only server can write
    }

    // Jobs - read-only for authenticated users
    match /jobs/{jobId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only server can write
    }

    // Rooms - authenticated users can read/write
    match /rooms/{roomId} {
      allow read, write: if isAuthenticated();
    }

    // Cars - users can read all, write their own
    match /cars/{carId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // World data - read-only
    match /world/{document=**} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
  }
}
```

3. **Click "Publish"**

---

### Step 3: Test Firestore Connection

1. **Open Browser Console (F12)**
2. **Go to your game**
3. **Try to create a room**
4. **Check console for errors**

**Expected behavior:**
- ✅ No "permission-denied" errors
- ✅ Should see Firestore reads/writes in Network tab
- ✅ Game initializes successfully

---

## 🧪 Verify Database Setup

### Test 1: Check Database Exists
1. Go to Firebase Console → Firestore Database
2. Should see "Data" tab (not "Get Started")
3. Should see collection structure (even if empty)

### Test 2: Check Authentication
1. Sign in to your game
2. Open browser console (F12)
3. Type: `firebase.auth().currentUser`
4. Should see user object ✅

### Test 3: Try Creating Room
1. Click "Create Room"
2. Should work! ✅
3. Check Firestore → Should see `players` collection created

---

## 🔍 Debug Errors

If still not working, check browser console for these errors:

### Error 1: "Missing or insufficient permissions"
**Fix:**
- Update Firestore rules (Step 2 above)
- Make sure you're signed in

### Error 2: "PERMISSION_DENIED"
**Fix:**
```javascript
// Check if rules are published
// Firebase Console → Firestore → Rules
// Should see the rules from Step 2
```

### Error 3: "Firestore is not defined"
**Fix:**
- Firestore database doesn't exist
- Create it (Step 1 above)

### Error 4: "Network error"
**Fix:**
- Check internet connection
- Check if Firebase is down: https://status.firebase.google.com/

---

## 📊 Firestore Collections Structure

After your first game session, Firestore should have:

```
firestore
├── players
│   └── {userId}
│       ├── id: string
│       ├── displayName: string
│       ├── money: number
│       ├── customization: object
│       ├── inventory: object
│       ├── lastPosition: object
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── rooms (optional)
│   └── {roomId}
│       └── room data
│
├── transactions (created by server)
│   └── {transactionId}
│       └── transaction data
│
└── jobs (optional)
    └── {jobId}
        └── job data
```

---

## 🔒 Security Rules Explained

### Test Mode (Development)
```javascript
// Allows all authenticated users to read/write
// Good for: Development, testing
// Bad for: Production (not secure)

allow read, write: if request.auth != null;
```

### Production Mode (Secure)
```javascript
// Users can only access their own data
// Good for: Production
// Example above in Step 2
```

---

## 💡 Alternative: More Permissive Rules (Testing Only!)

If you're still having issues and just want to test, use these **TEMPORARY** rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING:** These rules are NOT secure! Only use for testing, then switch to proper rules.

---

## ✅ Checklist

Before your game works:

- [ ] Firestore database is created
- [ ] Security rules are published
- [ ] Authentication is working (can sign in)
- [ ] Browser console shows no permission errors
- [ ] Can create a room successfully

---

## 🎯 Expected Flow

**After fixing Firestore:**

1. Sign in → ✅
2. See lobby → ✅
3. Click "Create Room" → ✅
4. See room code → ✅
5. Click "Start Game" → ✅
6. Game loads → ✅
7. Can walk around → ✅

**In Firestore Console:**
- Should see `players` collection with your user ID
- Should see your player data (money, customization, etc.)

---

## 🆘 Still Not Working?

### Get Better Error Messages

1. Open `src/main.js`
2. Find this section (around line 160):
```javascript
} catch (error) {
  console.error('Error initializing game:', error);
  alert('Failed to initialize game');
}
```

3. Change to:
```javascript
} catch (error) {
  console.error('Error initializing game:', error);
  alert('Failed to initialize game: ' + error.message);
}
```

4. Rebuild and redeploy
5. Error message will now show the actual problem!

---

## 📞 Common Error Solutions

| Error Message | Solution |
|--------------|----------|
| "Missing or insufficient permissions" | Update Firestore rules |
| "PERMISSION_DENIED" | Check rules are published |
| "Firestore is not defined" | Create Firestore database |
| "Network request failed" | Check internet connection |
| "Invalid collection reference" | Check collection names in rules |

---

**After completing these steps, your game should work perfectly!** 🎉

Still stuck? Share the exact error from browser console (F12) and I'll help debug!

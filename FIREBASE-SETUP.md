# 🔧 Firebase Authentication Setup Guide

If you're getting authentication errors, follow these steps to configure Firebase properly.

## 🚨 Common Issues:

1. ❌ "Play as Guest" failing → Anonymous auth not enabled
2. ❌ "Sign in with Google" blank page → Google auth not enabled or domain not authorized
3. ❌ Redirect issues → Netlify domain not in authorized domains

---

## ✅ Fix Authentication (5 Minutes)

### Step 1: Enable Authentication Methods

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select project: **vendor-f9973** (or your project)

2. **Navigate to Authentication**
   - Click **"Authentication"** in left sidebar
   - Click **"Get Started"** if you haven't set it up

3. **Enable Anonymous Authentication**
   - Click **"Sign-in method"** tab
   - Find **"Anonymous"** in the list
   - Click on it
   - Toggle **"Enable"**
   - Click **"Save"**

4. **Enable Google Authentication**
   - Still in **"Sign-in method"** tab
   - Find **"Google"** in the list
   - Click on it
   - Toggle **"Enable"**
   - **Important:** Add a support email (your email)
   - Click **"Save"**

---

### Step 2: Add Authorized Domains

1. **Stay in Authentication → Sign-in method**
   - Scroll down to **"Authorized domains"** section

2. **Add Your Netlify Domain**
   - Click **"Add domain"**
   - Enter your Netlify URL: `your-site.netlify.app` (without https://)
   - Example: `lovely-city-game.netlify.app`
   - Click **"Add"**

3. **Verify These Domains Are Listed:**
   - ✅ `localhost` (for development)
   - ✅ `your-site.netlify.app` (your production URL)
   - ✅ `vendor-f9973.firebaseapp.com` (default)

---

### Step 3: Check Firestore Rules (Optional but Recommended)

1. **Go to Firestore Database**
   - Click **"Firestore Database"** in left sidebar
   - Click **"Rules"** tab

2. **Use These Rules for Development:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read/write their own data
       match /players/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // Allow all users to read transactions (optional)
       match /transactions/{document=**} {
         allow read: if request.auth != null;
         allow write: if false;
       }

       // Allow authenticated users to read jobs
       match /jobs/{document=**} {
         allow read: if request.auth != null;
         allow write: if false;
       }

       // Allow authenticated users to read/write rooms
       match /rooms/{roomId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Click "Publish"**

---

## 🧪 Test Authentication

### Test 1: Play as Guest
1. Open your game: `https://your-site.netlify.app`
2. Click **"Play as Guest"**
3. Should see lobby screen ✅

### Test 2: Sign in with Google
1. Refresh the page
2. Click **"Sign in with Google"**
3. Select your Google account
4. Should see lobby screen ✅

---

## 🚨 Still Not Working? Additional Checks

### Check 1: Browser Console
1. Open browser console (F12)
2. Look for errors
3. Common errors:

**"Firebase: Error (auth/unauthorized-domain)"**
→ Add your Netlify domain to authorized domains

**"Firebase: Error (auth/operation-not-allowed)"**
→ Enable Anonymous or Google auth in Firebase Console

**"Popup blocked"**
→ Allow popups for your site

---

### Check 2: Firebase Config

Verify the Firebase config in your deployed site:

1. Open browser console on your Netlify site
2. Type: `localStorage`
3. Should see Firebase-related keys

If empty, the Firebase config might not be loading.

---

### Check 3: Network Tab

1. Open DevTools → Network tab
2. Try to sign in
3. Look for:
   - ✅ Requests to `firebaseapp.com`
   - ✅ Requests to `googleapis.com`
   - ❌ Any failed requests (red)

---

## 📋 Quick Checklist

Before your game works, make sure:

- [ ] Firebase Authentication is enabled
- [ ] Anonymous sign-in is enabled
- [ ] Google sign-in is enabled
- [ ] Support email is set for Google sign-in
- [ ] Your Netlify domain is in authorized domains
- [ ] Firestore database exists
- [ ] Firestore rules allow authenticated reads/writes

---

## 💡 Alternative: Use Your Own Firebase Project

If you want to use your own Firebase project instead of the provided one:

1. **Create a new Firebase project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"

2. **Enable Authentication**
   - Follow Step 1 above

3. **Create Firestore Database**
   - Click "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)

4. **Update Firebase Config**
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web apps
   - Copy the configuration
   - Update `src/config/firebase.js` with your config
   - Commit and push changes

---

## 🆘 Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `auth/unauthorized-domain` | Domain not authorized | Add Netlify domain to Firebase |
| `auth/operation-not-allowed` | Auth method not enabled | Enable Anonymous/Google in Console |
| `auth/popup-blocked` | Browser blocking popup | Allow popups for your site |
| `auth/network-request-failed` | Network issue | Check internet, try again |
| Blank page after Google sign-in | Redirect issue | Check authorized domains |

---

## ✅ Expected Behavior

**After successful setup:**

1. Open game → See loading screen
2. See login screen with 2 buttons:
   - ✅ "Sign in with Google"
   - ✅ "Play as Guest"
3. Click either → See lobby screen
4. Can create/join rooms
5. Can start game

---

## 🎯 Next Steps After Auth Works

Once authentication is working:

1. ✅ Test creating a room
2. ✅ Test joining a room
3. ✅ Test multiplayer with 2 browser windows
4. ✅ Test character customization
5. ✅ Test jobs and economy features

---

**Need more help?** Share the exact error message from browser console (F12) and I can provide specific guidance!

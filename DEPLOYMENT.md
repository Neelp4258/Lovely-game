# 🚀 Deployment Guide - Netlify + Render

This guide will help you deploy the Lovely City game perfectly on Netlify (client) and Render (server).

## 📋 Prerequisites

- GitHub account
- Netlify account (free tier works)
- Render account (free tier works)
- Firebase project (already configured)

---

## Part 1: Deploy Server to Render (5 minutes)

### Step 1: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `lovely-city-server`
   - **Region**: Choose closest to your users
   - **Branch**: `claude/3d-multiplayer-city-game-01HCdtPqtypWrQrFAS5ZDE6w`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

### Step 2: Set Environment Variables on Render

Click **"Environment"** and add:

```
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=vendor-f9973
CLIENT_URL=https://your-site.netlify.app
```

**Optional** (for server-side Firestore operations):
```
FIREBASE_CLIENT_EMAIL=your-firebase-admin-email@vendor-f9973.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----"
```

> ℹ️ To get Firebase Admin credentials:
> - Go to Firebase Console → Project Settings → Service Accounts
> - Click "Generate new private key"
> - Use the values from the downloaded JSON

### Step 3: Deploy Server

1. Click **"Create Web Service"**
2. Wait for deployment (~2 minutes)
3. Copy your server URL (e.g., `https://lovely-city-server.onrender.com`)

### Step 4: Test Server

Visit: `https://your-server.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T...",
  "activeRooms": 0,
  "activePlayers": 0
}
```

✅ **Server is ready!**

---

## Part 2: Deploy Client to Netlify (3 minutes)

### Step 1: Create Netlify Site

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your repository: `Lovely-game`
5. Configure:
   - **Branch**: `claude/3d-multiplayer-city-game-01HCdtPqtypWrQrFAS5ZDE6w`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: Leave empty

### Step 2: Set Environment Variables on Netlify

Click **"Site settings"** → **"Environment variables"** → **"Add a variable"**

Add this variable:

**Key**: `VITE_SERVER_URL`
**Value**: `https://your-server.onrender.com` (from Part 1, Step 3)

**Scopes**: Select all scopes

> ⚠️ **IMPORTANT**: Replace `your-server.onrender.com` with your actual Render URL!

### Step 3: Deploy Client

1. Click **"Deploy site"**
2. Wait for build (~2 minutes)
3. Your site will be live at: `https://random-name-123.netlify.app`

### Step 4: Update Server with Client URL

Go back to **Render Dashboard** → Your Web Service → **Environment**

Update the `CLIENT_URL` variable:
```
CLIENT_URL=https://your-site.netlify.app
```

Click **"Save Changes"** - Render will automatically redeploy.

### Step 5: Custom Domain (Optional)

In Netlify:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to add your domain

✅ **Client is ready!**

---

## Part 3: Test Your Deployment

### Step 1: Open Your Game

Visit your Netlify URL: `https://your-site.netlify.app`

You should see:
1. ✅ Loading screen
2. ✅ Login screen
3. ✅ Sign in with Google or Guest

### Step 2: Test Multiplayer

1. Sign in
2. Click **"Create Room"**
3. Note the room code
4. Open another browser/incognito window
5. Sign in again
6. Click **"Join Room"** and enter the code
7. Click **"Start Game"**
8. You should see both players in the game!

### Step 3: Test Features

- ✅ Walk around (WASD keys)
- ✅ Approach a building → "GET IN" button appears
- ✅ Click "GET IN" → Interior loads
- ✅ Click "EXIT" → Back to city
- ✅ Approach a car → "GET IN" appears
- ✅ Enter car → Drive with WASD
- ✅ Press F → Exit vehicle
- ✅ Open Wardrobe (👔) → Customize character
- ✅ Open Jobs (💼) → Complete a job
- ✅ Check your money increased

---

## 🎯 Quick Troubleshooting

### "Cannot connect to server"

**Fix**:
1. Check Render server is running (visit `/health` endpoint)
2. Verify `VITE_SERVER_URL` in Netlify environment variables
3. Check `CLIENT_URL` in Render environment variables
4. Make sure both URLs match exactly (no trailing slashes)

### "WebRTC connection failed"

**Fix**:
- Render free tier may have limitations
- Try upgrading to paid tier if needed
- Check browser console for specific errors

### "Firebase error"

**Fix**:
- Verify Firebase credentials in Render
- Check Firestore security rules allow reads/writes
- Ensure Authentication is enabled in Firebase Console

### Build fails on Netlify

**Fix**:
1. Check build logs in Netlify
2. Ensure `VITE_SERVER_URL` is set
3. Try manual build locally: `npm run build`

### Server crashes on Render

**Fix**:
1. Check Render logs
2. Verify all environment variables are set
3. If using Firebase Admin, check credentials format

---

## 📊 Environment Variables Checklist

### Netlify (Client)
- ✅ `VITE_SERVER_URL` = Your Render server URL

### Render (Server)
- ✅ `NODE_ENV` = production
- ✅ `PORT` = 3000
- ✅ `CLIENT_URL` = Your Netlify site URL
- ✅ `FIREBASE_PROJECT_ID` = vendor-f9973
- ⚠️ `FIREBASE_CLIENT_EMAIL` (optional, for server-side operations)
- ⚠️ `FIREBASE_PRIVATE_KEY` (optional, for server-side operations)

---

## 🔄 Continuous Deployment

Both Netlify and Render automatically redeploy when you push to your GitHub branch:

```bash
git add .
git commit -m "Update game"
git push origin claude/3d-multiplayer-city-game-01HCdtPqtypWrQrFAS5ZDE6w
```

- Netlify will rebuild the client (~2 min)
- Render will rebuild the server (~2 min)

---

## 💰 Cost Breakdown

**Free Tier** (Good for development & small games):
- Netlify: 100GB bandwidth/month (free)
- Render: 750 hours/month (free)
- Firebase: 50K reads, 20K writes per day (free)

**Paid** (For production with many players):
- Netlify Pro: $19/month (1TB bandwidth)
- Render Starter: $7/month per service
- Firebase Blaze: Pay as you go

---

## 🎉 You're Live!

Your game is now deployed and accessible worldwide! Share your Netlify URL with friends and start playing together! 🚀🎮

### Share Your Game:
```
🎮 Play Lovely City!
🌐 https://your-site.netlify.app

- Walk around a 3D city
- Drive cars
- Customize your character
- Play with friends in multiplayer!
```

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console (F12)
2. Check Render logs
3. Check Netlify build logs
4. Verify all environment variables are set correctly

The game is configured to work perfectly out of the box - if something doesn't work, it's usually an environment variable issue!

# 🚀 Netlify One-Click Deployment

This guide will get your game live on Netlify in under 10 minutes.

## ⚡ Super Quick Deploy

### Step 1: Deploy Server (2 minutes)

1. Visit: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Use these exact settings:
   ```
   Name: lovely-city-server
   Root Directory: server
   Build Command: npm install
   Start Command: node server.js
   ```
5. Add Environment Variables:
   ```
   NODE_ENV=production
   FIREBASE_PROJECT_ID=vendor-f9973
   CLIENT_URL=https://will-update-this.netlify.app
   ```
6. Click **"Create Web Service"**
7. **IMPORTANT:** Copy your server URL (e.g., `https://lovely-city-server.onrender.com`)

---

### Step 2: Deploy Client to Netlify (3 minutes)

1. Visit: https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → Select your repo
4. Use these exact settings:
   ```
   Branch: claude/3d-multiplayer-city-game-01HCdtPqtypWrQrFAS5ZDE6w
   Build command: npm run build
   Publish directory: dist
   ```
5. Click **"Show advanced"** → **"New variable"**
6. Add this variable:
   ```
   Key: VITE_SERVER_URL
   Value: YOUR_RENDER_URL_FROM_STEP_1
   ```
   Example: `https://lovely-city-server.onrender.com`

7. Click **"Deploy site"**
8. Wait 2 minutes ⏳
9. **IMPORTANT:** Copy your Netlify URL (e.g., `https://random-name-123.netlify.app`)

---

### Step 3: Update Server (1 minute)

1. Go back to Render: https://dashboard.render.com/
2. Click your **lovely-city-server** service
3. Click **"Environment"**
4. Update `CLIENT_URL` with your Netlify URL from Step 2
5. Click **"Save Changes"**
6. Wait for auto-redeploy (~1 minute)

---

## ✅ You're Live!

Your game is now deployed! Visit your Netlify URL and play!

### Test Everything:
- ✅ Sign in with Google
- ✅ Create a room → Note the room code
- ✅ Open incognito window → Join the room
- ✅ See both players moving in real-time!

---

## 🎨 Customize Your URL (Optional)

### In Netlify:
1. Go to **Site settings** → **Domain management**
2. Click **"Change site name"**
3. Choose something cool like: `lovely-city-game.netlify.app`

---

## 📊 What You Got (All FREE!)

- ✅ **Netlify Free Tier**: 100GB bandwidth/month
- ✅ **Render Free Tier**: 750 hours/month
- ✅ **Firebase Free Tier**: 50K reads, 20K writes/day
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **HTTPS**: Secure by default
- ✅ **Auto Deploy**: Push to GitHub → Auto updates

**This setup handles 100+ concurrent players for $0/month!**

---

## 🔧 Environment Variables Cheat Sheet

**Netlify (Just 1 variable):**
```
VITE_SERVER_URL=https://your-server.onrender.com
```

**Render (3 required variables):**
```
NODE_ENV=production
FIREBASE_PROJECT_ID=vendor-f9973
CLIENT_URL=https://your-site.netlify.app
```

---

## 🆘 Quick Fixes

### "Cannot connect to server"
1. Check Netlify env var: `VITE_SERVER_URL` matches Render URL
2. Visit `https://your-server.onrender.com/health` - should return JSON

### "CORS error"
1. Check Render env var: `CLIENT_URL` matches Netlify URL
2. Make sure both URLs have `https://` and no trailing slash

### Build failed
1. Check Netlify build log
2. Ensure `VITE_SERVER_URL` is set before building
3. Try clearing cache and rebuilding

---

## 🎉 Share Your Game!

```
🎮 Play Lovely City - 3D Multiplayer Game!
🌐 https://your-site.netlify.app

✨ Features:
- Explore a 3D city
- Drive cars
- Customize your character
- Play with friends in real-time!

🆓 100% Free to Play
```

---

## 📈 Monitor Your Game

**Netlify Analytics:**
- Bandwidth usage
- Number of visitors
- Build history

**Render Dashboard:**
- Server uptime
- Active connections
- Logs and errors

**Firebase Console:**
- User authentication
- Database reads/writes
- Active users

---

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain in Netlify settings
2. **Upgrade for Scale**: If you get popular, upgrade to paid tiers
3. **Add Features**: Fork the repo and add new gameplay!
4. **Share**: Tell your friends and grow your player base!

---

**That's it! Your game is live and ready to play! 🎮**

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

# 🚀 Render Deployment - Now with render.yaml!

**Even easier now!** Just connect your GitHub repo and Render will auto-configure everything from `render.yaml`.

## ⚡ Deploy Server to Render (2 Minutes)

### Method 1: Auto-Deploy with render.yaml (Easiest!)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/

2. **Create New Blueprint**
   - Click **"New +"** → **"Blueprint"**
   - Click **"Connect a repository"**
   - Select your GitHub repository
   - Click **"Connect"**

3. **Render Auto-Detects Everything!**
   - Render reads `render.yaml` and auto-configures:
     ✅ Service name: `lovely-city-server`
     ✅ Root directory: `server`
     ✅ Build command: `npm install`
     ✅ Start command: `node server.js`
     ✅ Environment variables (except CLIENT_URL)

4. **Review and Deploy**
   - Click **"Apply"**
   - Wait ~2 minutes for deployment

5. **Copy Your Server URL**
   - Example: `https://lovely-city-server.onrender.com`

6. **Update CLIENT_URL**
   - After deploying to Netlify, come back here
   - Go to **Environment** tab
   - Set `CLIENT_URL` to your Netlify URL
   - Example: `https://your-site.netlify.app`

---

### Method 2: Manual Setup (If Blueprint Doesn't Work)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Settings:
   ```
   Name: lovely-city-server
   Region: Oregon (or closest to you)
   Branch: claude/3d-multiplayer-city-game-01HCdtPqtypWrQrFAS5ZDE6w
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   FIREBASE_PROJECT_ID=vendor-f9973
   CLIENT_URL=https://will-update-after-netlify.com
   ```

6. Click **"Create Web Service"**

---

## ✅ Test Your Server

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

If you see this, your server is working! 🎉

---

## 🔄 Next Steps

1. ✅ Server deployed to Render
2. ➡️ Deploy client to Netlify (see [NETLIFY-DEPLOY.md](./NETLIFY-DEPLOY.md))
3. ➡️ Update `CLIENT_URL` in Render with your Netlify URL
4. 🎮 Play your game!

---

## 🆘 Troubleshooting

### "Build failed"
- Check you're using the correct branch
- Verify `server` folder exists in your repo
- Check Render build logs for errors

### "Application failed to respond"
- Check Start Command is: `node server.js`
- Verify PORT environment variable is set to 3000
- Check Render service logs

### "Health check failed"
- Wait 2-3 minutes for first deploy
- Render free tier can take time to start
- Check `/health` endpoint directly

---

## 💰 Free Tier Limits

- **750 hours/month** - Enough for 24/7 operation
- Spins down after 15 min of inactivity
- First request after spin-down takes ~30 seconds
- **Upgrade to Starter ($7/mo)** to prevent spin-down

---

## 🎯 That's It!

Your server is deployed! Now deploy the client to Netlify:
👉 [NETLIFY-DEPLOY.md](./NETLIFY-DEPLOY.md)

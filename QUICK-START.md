# ⚡ Quick Start - Deploy in 10 Minutes

Super fast deployment guide for Netlify + Render.

## 🚀 Step-by-Step Deployment

### 1️⃣ Deploy Server (Render)

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect GitHub repository
4. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   FIREBASE_PROJECT_ID=vendor-f9973
   CLIENT_URL=https://will-update-after-netlify.com
   ```
6. Click **Create Web Service**
7. ⏳ Wait 2 minutes
8. 📋 Copy your server URL (e.g., `https://lovely-city-server.onrender.com`)

---

### 2️⃣ Deploy Client (Netlify)

1. Go to https://app.netlify.com/
2. Click **Add new site** → **Import from Git**
3. Select your GitHub repo
4. Settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add Environment Variable:
   - Key: `VITE_SERVER_URL`
   - Value: `https://your-server.onrender.com` (from step 1.8)
6. Click **Deploy site**
7. ⏳ Wait 2 minutes
8. 📋 Copy your Netlify URL

---

### 3️⃣ Update Server URL

1. Go back to Render → Environment
2. Update `CLIENT_URL` with your Netlify URL
3. Click **Save** (auto-redeploys)

---

## ✅ Done!

Visit your Netlify URL and play! 🎮

### Test Checklist:
- [ ] Can sign in
- [ ] Can create room
- [ ] Can join room with code
- [ ] Can see other players
- [ ] Can walk around
- [ ] Can enter buildings
- [ ] Can drive cars

---

## 🔑 Environment Variables Reference

**Netlify:**
```env
VITE_SERVER_URL=https://your-server.onrender.com
```

**Render:**
```env
NODE_ENV=production
FIREBASE_PROJECT_ID=vendor-f9973
CLIENT_URL=https://your-site.netlify.app
```

---

## 🆘 Troubleshooting

**Can't connect to server?**
→ Check `VITE_SERVER_URL` in Netlify matches your Render URL

**CORS error?**
→ Check `CLIENT_URL` in Render matches your Netlify URL

**Build failed?**
→ Check Netlify build logs, ensure `VITE_SERVER_URL` is set

---

That's it! Your game is live! 🚀

Full detailed guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)

# 🎮 Blank Screen / Blue Screen Troubleshooting

If you see UI (joystick, buttons) but no city or character, this guide will help.

## 🚨 Common Issue:

**Symptoms:**
- ✅ UI visible (joystick, buttons, menus)
- ❌ Blue/blank screen where city should be
- ❌ No player character visible
- ❌ Emote button doesn't work

**Cause:** Three.js scene loaded but game objects failed to initialize

---

## 🔍 Step 1: Check Browser Console

1. **Open Browser Console (F12)**
2. **Look for RED errors**
3. **Common errors:**

### Error: "THREE is not defined"
**Fix:** Three.js didn't load properly
```bash
# Rebuild the project
npm run build
# Redeploy to Netlify
```

### Error: "Cannot read property 'position' of undefined"
**Fix:** Player or city object failed to create

### Error: "WebGL not supported"
**Fix:** Your browser doesn't support WebGL
- Try a different browser (Chrome, Firefox, Edge)
- Update your graphics drivers
- Enable WebGL in browser settings

---

## 🔧 Step 2: Quick Fixes

### Fix 1: Hard Refresh
1. Press `Ctrl + Shift + R` (Windows/Linux)
2. Press `Cmd + Shift + R` (Mac)
3. This clears cache and reloads

### Fix 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check WebGL Support
1. Visit: https://get.webgl.org/
2. Should see a spinning cube ✅
3. If not, WebGL is not working

---

## 🛠️ Step 3: Add Better Error Logging

Let me create a debug version to show what's failing.

### Update Game Initialization

1. **Open browser console (F12)**
2. **Type this to check Three.js:**
```javascript
console.log('THREE version:', THREE.REVISION);
```

3. **If undefined, Three.js didn't load**

---

## 📊 Debug Checklist

Check these in browser console (F12):

```javascript
// 1. Check if THREE loaded
console.log(window.THREE);  // Should show object

// 2. Check if game exists
console.log(window.game);    // Should show game object

// 3. Check scene
console.log(window.game?.scene);  // Should show scene

// 4. Check player
console.log(window.game?.player);  // Should show player

// 5. Check city
console.log(window.game?.city);    // Should show city
```

---

## 🎯 Most Common Causes

### 1. **Three.js Build Issue**
**Symptoms:** Blue screen, console shows THREE errors
**Fix:**
```bash
# On your local machine
cd Lovely-game
npm install
npm run build

# Then redeploy to Netlify
git add dist
git commit -m "Rebuild client"
git push
```

### 2. **Game Init Failed Silently**
**Symptoms:** Blue screen, no errors in console
**Fix:** The error is being caught but not displayed

### 3. **Camera Position Wrong**
**Symptoms:** Blue screen, but objects might exist
**Fix:** Camera is looking at the wrong place

### 4. **WebGL Context Lost**
**Symptoms:** Blue screen after working initially
**Fix:** Refresh the page

---

## 🔬 Advanced Debugging

### Check Scene Contents

Open console and run:
```javascript
// Check how many objects in scene
console.log('Scene children:', game.scene.getScene().children.length);

// List all objects
game.scene.getScene().children.forEach((obj, i) => {
  console.log(i, obj.type, obj.name || 'unnamed');
});

// Expected output:
// - AmbientLight
// - DirectionalLight
// - HemisphereLight
// - Sky mesh
// - Ground plane
// - Buildings (multiple)
// - Player group
// - Cars (multiple)
```

### Check Player Position

```javascript
console.log('Player position:', game.player.getPosition());
// Should be near {x: 0, y: 0, z: 0}
```

### Check Camera

```javascript
console.log('Camera position:', game.renderer.getCamera().position);
// Should be {x: 0, y: 10, z: 15} approximately
```

---

## 🚀 Quick Test

Try this in console to move camera:
```javascript
const cam = game.renderer.getCamera();
cam.position.set(0, 50, 50);
cam.lookAt(0, 0, 0);
```

**If you suddenly see the city:** Camera position was wrong!

---

## 💡 Temporary Fix: Skip Firestore

If Firestore is causing issues, you can temporarily bypass it:

**In browser console, before starting game:**
```javascript
localStorage.setItem('skipFirestore', 'true');
```

Then refresh. This will use default player data without Firestore.

---

## 🔄 Nuclear Option: Rebuild Everything

If nothing works:

1. **Clear all caches:**
   - Browser cache (Ctrl+Shift+Delete)
   - LocalStorage (F12 → Application → Clear)

2. **Trigger Netlify rebuild:**
   - Go to Netlify Dashboard
   - Click "Deploys"
   - Click "Trigger deploy" → "Clear cache and deploy"

3. **Wait for build to finish**

4. **Try again with hard refresh**

---

## 📱 Mobile vs Desktop

### Desktop Browser:
- Should work in Chrome, Firefox, Edge, Safari
- Needs WebGL support
- Check GPU acceleration is enabled

### Mobile Browser:
- Works best in Chrome mobile
- Some older phones don't support WebGL
- Try desktop mode if mobile fails

---

## 🎨 Expected Visuals

**What you SHOULD see:**
1. ✅ Blue sky (gradient)
2. ✅ Green ground
3. ✅ Gray roads with yellow lines
4. ✅ Colorful buildings (houses, mall, etc.)
5. ✅ Your player character (colored capsule)
6. ✅ Cars parked around
7. ✅ Street lights

**Current state (what you see):**
1. ✅ Blue sky
2. ❌ Nothing else

This means:
- Three.js is working (you see the sky)
- Scene is rendering
- But objects (city, player, cars) aren't being added

---

## 🆘 Get Specific Error

To find the exact error, I need to improve logging. Here's what to check:

### 1. Network Tab
- Open F12 → Network
- Refresh page
- Look for failed requests (red)
- Check if all .js files loaded

### 2. Console Tab
- Look for any errors or warnings
- Screenshot any red errors
- Share with me for specific fix

### 3. Application Tab
- Check localStorage
- Check if Firebase is connected

---

## 🔧 Manual Debug Steps

1. **Open Console (F12)**
2. **After clicking "Start Game", run:**

```javascript
// Check game state
console.log('Game running:', game?.isRunning);
console.log('Player exists:', !!game?.player);
console.log('City exists:', !!game?.city);
console.log('Scene children:', game?.scene?.getScene()?.children?.length);

// If city exists but not visible:
if (game?.city) {
  console.log('Buildings:', game.city.getBuildings().length);
  console.log('First building:', game.city.getBuildings()[0]);
}

// If player exists but not visible:
if (game?.player) {
  console.log('Player mesh:', game.player.getMesh());
  console.log('Player in scene:', game.scene.getScene().children.includes(game.player.getMesh()));
}
```

---

## 📋 Share This Info For Debugging:

Run in console and share output:
```javascript
console.log({
  threeExists: !!window.THREE,
  gameExists: !!window.game,
  playerExists: !!game?.player,
  cityExists: !!game?.city,
  sceneChildren: game?.scene?.getScene()?.children?.length,
  isRunning: game?.isRunning,
  cameraPosition: game?.renderer?.getCamera()?.position,
  webglSupported: !!document.createElement('canvas').getContext('webgl')
});
```

Copy the output and share - I can diagnose the exact issue!

---

## ✅ Once Fixed:

You should see:
1. ✅ 3D city with buildings
2. ✅ Your character in the middle
3. ✅ Can walk with WASD or joystick
4. ✅ Buildings get closer as you walk
5. ✅ "GET IN" button appears near buildings

The blue you're seeing is the sky - that's good! It means Three.js works. Now we just need to figure out why the objects aren't rendering.

---

**Share the console output and I'll provide a specific fix!** 🔧

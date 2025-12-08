# Lovely City - 3D Multiplayer Game

A fully-featured 3D multiplayer city game built with Three.js, WebRTC, Firebase, and Node.js. Walk around a vibrant city, drive cars, customize your character, do jobs, visit buildings, and interact with other players in real-time!

## 🎮 Features

### World & Environment
- **Large 3D City** with roads, buildings, and landmarks
- Multiple building types: Houses, Mall, Club, School, College, Shops, Car Dealership, Marriage Hall
- Day/night cycle with dynamic lighting
- Street lights and environmental effects

### Player System
- **Customizable Characters**
  - Hair styles (short, long, bald)
  - Customizable colors (hair, skin, shirt, pants)
  - Saved to Firestore
- Smooth character animations (walking, running, emotes)
- Third-person camera system

### Vehicles
- **Drivable Cars** with realistic physics
- Multiple car models with customizable colors
- Buy cars from the dealership
- "GET IN" prompts when near vehicles
- Smooth vehicle controls

### Interactive Buildings
- **GET IN button** appears when near any building
- Each building has unique interior scenes
- Interior-specific UI and interactions
- **EXIT button** to return to the city

### Economy System
- Earn money through jobs
- Buy cars from the dealership
- Shop for clothes and accessories
- All transactions secured via Firestore

### Jobs & Mini-Games
- Delivery Driver
- Taxi Driver
- Shop Clerk
- Teacher
- Earn rewards for completing tasks

### Multiplayer
- **Real-time WebRTC P2P connections**
- Socket.io signaling server
- Create or join rooms with room codes
- See other players in real-time
- Synchronized player positions and animations

### Emotes & Social
- Wave, Dance, Sit, Clap
- **Kiss Emote** - requires mutual acceptance
- Broadcast emotes to other players

### Mobile Support
- Touch-based joystick controls
- Mobile-optimized UI
- Responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (already configured in code)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Lovely-game
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

3. **Configure Firebase Admin (Optional)**

If you want server-side Firestore operations (purchases, jobs), set up Firebase Admin SDK:

- Go to Firebase Console → Project Settings → Service Accounts
- Generate a new private key
- Save it as `server/serviceAccountKey.json`

Or set environment variables in `server/.env`:
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=vendor-f9973
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

4. **Run the development server**
```bash
npm run dev
```

This will start:
- Client dev server on `http://localhost:5173`
- Signaling server on `http://localhost:3000`

5. **Open the game**
Navigate to `http://localhost:5173` in your browser

## 🎯 How to Play

### Controls

**Desktop:**
- `W/↑` - Move forward
- `S/↓` - Move backward
- `A/←` - Turn left
- `D/→` - Turn right
- `Shift` - Run
- `E` or `Space` - Interact (GET IN)
- `F` - Exit vehicle

**Mobile:**
- Use on-screen joystick to move
- Tap "RUN" button to run
- Tap "GET IN" button to interact

### Gameplay

1. **Sign In**
   - Sign in with Google or play as guest

2. **Multiplayer**
   - Create a room and share the room code with friends
   - Join a room by entering a room code
   - Or play solo

3. **Explore the City**
   - Walk around and discover different buildings
   - Approach buildings to see the "GET IN" prompt

4. **Enter Buildings**
   - Click "GET IN" near a building
   - Each building has its own interior
   - Shop for clothes, buy cars, do jobs
   - Click "EXIT" to leave

5. **Drive Cars**
   - Walk up to any car and click "GET IN"
   - Use WASD to control the car
   - Press F to exit the vehicle

6. **Customize Your Character**
   - Open the Wardrobe panel (👔 button)
   - Change hair style and colors
   - Changes are saved automatically

7. **Earn Money**
   - Open the Jobs panel (💼 button)
   - Complete jobs to earn money
   - Use money to buy cars and clothes

8. **Social Interactions**
   - Use emotes to interact with other players
   - Try the kiss emote with nearby players!

## 🏗️ Architecture

### Client (`/`)
- **Three.js** - 3D rendering
- **Firebase** - Authentication & Firestore database
- **Socket.io-client** - WebRTC signaling
- **Vite** - Build tool

### Server (`/server`)
- **Express** - Web server
- **Socket.io** - WebRTC signaling
- **Firebase Admin SDK** - Secure Firestore operations

### Shared (`/shared`)
- Constants and types used by both client and server

## 📦 Project Structure

```
Lovely-game/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── core/
│   │   ├── Game.js              # Main game class
│   │   ├── Scene.js             # Three.js scene
│   │   └── Renderer.js          # Three.js renderer
│   ├── world/
│   │   ├── City.js              # City generation
│   │   ├── Building.js          # Building classes
│   │   └── InteriorManager.js   # Interior scenes
│   ├── entities/
│   │   ├── Player.js            # Player character
│   │   ├── Car.js               # Vehicle
│   │   └── RemotePlayer.js      # Networked players
│   ├── systems/
│   │   ├── MovementController.js
│   │   └── InteractionSystem.js
│   ├── multiplayer/
│   │   ├── NetworkManager.js    # Socket.io client
│   │   └── WebRTCPeer.js        # WebRTC connections
│   ├── ui/
│   │   └── UIManager.js         # UI panels & menus
│   ├── database/
│   │   └── FirestoreManager.js  # Firestore operations
│   └── main.js                  # Entry point
├── server/
│   ├── server.js                # Express + Socket.io server
│   └── firebase-admin.js        # Firebase Admin SDK
├── shared/
│   └── constants.js             # Shared constants
├── styles/
│   └── main.css                 # Styling
├── index.html                   # HTML entry
└── vite.config.js              # Vite configuration
```

## 🚢 Deployment

### Deploy to Render / Railway / Fly.io

1. **Build the client**
```bash
npm run build
```

2. **Set environment variables**
```
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=vendor-f9973
FIREBASE_CLIENT_EMAIL=<your-service-account-email>
FIREBASE_PRIVATE_KEY=<your-private-key>
```

3. **Start command**
```bash
npm start
```

The server will serve both the API and static files from `/dist`.

### Deploy Client to Vercel/Netlify (Optional)

If you want to separate client and server:

1. Build client: `npm run build`
2. Deploy `dist/` folder to Vercel/Netlify
3. Set `VITE_SERVER_URL` to your server URL
4. Deploy server separately

## 🔧 Configuration

### Firebase
Firebase is already configured with the provided credentials. If you want to use your own Firebase project:

1. Create a Firebase project
2. Enable Authentication (Google & Anonymous)
3. Create a Firestore database
4. Update `src/config/firebase.js` with your config

### Server URL
Update `.env` or `VITE_SERVER_URL` environment variable to point to your deployed server.

## 📝 Firestore Collections

### `players`
```javascript
{
  id: string,
  displayName: string,
  money: number,
  customization: {
    hairColor: string,
    skinColor: string,
    shirtColor: string,
    pantsColor: string,
    hairStyle: string
  },
  inventory: {
    cars: [],
    clothes: [],
    accessories: []
  },
  lastPosition: { x, y, z },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `transactions`
```javascript
{
  playerId: string,
  type: 'purchase' | 'job_reward',
  itemType: string,
  itemId: string,
  cost: number,
  reward: number,
  timestamp: timestamp
}
```

## 🐛 Troubleshooting

### "Cannot connect to server"
- Make sure the server is running on port 3000
- Check firewall settings
- Update `VITE_SERVER_URL` if deployed

### "WebRTC connection failed"
- Check if STUN servers are accessible
- Some corporate networks block WebRTC
- Try a different network

### "Firebase error"
- Verify Firebase configuration
- Check Firestore security rules
- Ensure Authentication is enabled

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🎨 Credits

- Built with [Three.js](https://threejs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Real-time communication via [WebRTC](https://webrtc.org/)
- Signaling with [Socket.io](https://socket.io/)

## 🌟 Features Coming Soon

- Voice chat
- More vehicles (bikes, boats)
- More buildings and interiors
- Persistent world state
- Inventory system
- Trading between players
- Mini-games (racing, hide and seek)
- Weather effects
- Day/night cycle
- Mobile app

---

**Enjoy playing Lovely City! 🎮🏙️**

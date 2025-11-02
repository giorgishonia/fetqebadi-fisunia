# Multiplayer Setup Guide

This Exploding Kittens game now supports **real-time multiplayer** using WebSocket (Socket.IO).

## 🚀 Quick Start

### 1. Install Dependencies

First, install the new dependencies (especially `tsx` for running the TypeScript server):

```bash
npm install
```

### 2. Start the Server

Run the development server with WebSocket support:

```bash
npm run dev
```

This will start:
- Next.js application on `http://localhost:3000`
- WebSocket server on the same port at path `/api/socket`

### 3. Play the Game

1. Open `http://localhost:3000` in your browser
2. Click "Play Now" or navigate to the Lobby
3. Enter your name
4. Either:
   - **Create a new room** - You'll be the host
   - **Join an existing room** - Choose from available public rooms
5. Wait for other players to join
6. When all players are ready, the host can start the game
7. Play in real-time with other players!

## 🎮 How It Works

### Real-time Features

- **Live Room Updates**: See players join/leave in real-time
- **Instant Game State Sync**: All players see the same game state simultaneously  
- **Turn-based Gameplay**: Only the current player can take actions
- **Nope Window**: All players have 3 seconds to play a Nope card
- **Automatic Reconnection**: If disconnected, the client will try to reconnect automatically

### Architecture

```
┌─────────────┐     WebSocket      ┌──────────────────┐
│   Browser   │ ◄─────────────────► │  Custom Server   │
│  (Client)   │   Socket.IO Path:   │  (server.ts)     │
│             │   /api/socket       │                  │
└─────────────┘                     │  - Room Manager  │
                                    │  - Game Engine   │
                                    │  - State Sync    │
                                    └──────────────────┘
```

### Key Components

1. **server.ts**: Custom Next.js server with Socket.IO integration
   - Manages game rooms
   - Handles player connections/disconnections  
   - Runs game engine instances
   - Broadcasts state updates

2. **lib/websocket-client.ts**: WebSocket client wrapper
   - Singleton connection manager
   - Event handlers for game events
   - Auto-reconnection with exponential backoff

3. **lib/use-websocket.ts**: React hook for WebSocket
   - Manages connection lifecycle
   - Provides game state to components
   - Exposes action methods (playCard, drawCard, etc.)

4. **lib/game-engine.ts**: Game logic orchestration
   - Validates player actions
   - Updates game state
   - Triggers callbacks for state changes

## 🔧 Configuration

### Port Configuration

Change the port in `server.ts`:

```typescript
const port = parseInt(process.env.PORT || '3000', 10)
```

Or set the `PORT` environment variable:

```bash
PORT=4000 npm run dev
```

### Room Settings

Configure room settings in `server.ts`:

```typescript
maxPlayers: 5,  // Maximum players per room
isPublic: true, // Whether room appears in lobby
```

### WebSocket Reconnection

Configure in `lib/websocket-client.ts`:

```typescript
reconnection: true,
reconnectionAttempts: 10,
reconnectionDelay: 1000,
reconnectionDelayMax: 5000,
```

## 🐛 Troubleshooting

### "Not connected to server" error

- Check that the server is running (`npm run dev`)
- Look for errors in the terminal
- Check browser console for WebSocket connection errors

### Players not syncing

- Refresh the page to reconnect
- Check that all players are in the same room ID
- Verify WebSocket connection in browser DevTools (Network tab)

### Game freezes or doesn't update

- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- Try clearing browser cache and localStorage

## 📝 Testing Multiplayer Locally

To test multiplayer on the same machine:

1. Start the server: `npm run dev`
2. Open multiple browser windows/tabs
3. Use different player names in each window
4. Create a room in one window
5. Copy the room URL and paste it in other windows
6. All players will join the same game!

### Testing on Local Network

1. Start the server: `npm run dev`
2. Find your local IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`
3. Share the URL with devices on the same network:
   - Example: `http://192.168.1.100:3000`
4. Players can join from different devices!

## 🚀 Production Deployment

### Option 1: Deploy with WebSocket Support

Services that support WebSockets:
- **Railway**: Automatic WebSocket support
- **Render**: WebSocket support included
- **DigitalOcean App Platform**: WebSocket support
- **AWS EC2/Lightsail**: Full control

### Option 2: Separate WebSocket Server

For platforms that don't support WebSockets in serverless functions (like Vercel):

1. Deploy Next.js app normally
2. Deploy `server.ts` separately (e.g., on Railway/Heroku)
3. Update `lib/websocket-client.ts` to connect to separate WebSocket server:

```typescript
this.socket = io('https://your-websocket-server.com', {
  path: '/api/socket',
})
```

## 🎯 Features

### Currently Implemented

✅ Real-time room creation and joining  
✅ Live player list updates  
✅ Synchronized game state  
✅ Turn-based gameplay  
✅ All card actions (Attack, Skip, Favor, etc.)  
✅ Nope card interrupts  
✅ Cat card combos  
✅ Automatic player elimination  
✅ Winner detection  
✅ Auto-reconnection on disconnect  
✅ Host migration when host leaves  

### Future Enhancements

🔜 Player reconnection to active games  
🔜 Spectator mode  
🔜 Game replay/history  
🔜 Player statistics  
🔜 Custom card decks  
🔜 Chat messages  
🔜 Friend invites  

## 📚 API Reference

### WebSocket Events

#### Client → Server

- `get-rooms`: Request list of public rooms
- `join-room`: Join or create a room
- `leave-room`: Leave current room
- `ready-toggle`: Toggle ready state
- `start-game`: Start the game (host only)
- `play-card`: Play a card
- `draw-card`: Draw a card
- `play-cat-combo`: Play two matching cat cards
- `insert-kitten`: Place exploding kitten back in deck
- `favor-response`: Give card to player who played Favor
- `play-nope`: Play a Nope card

#### Server → Client

- `rooms-list`: List of available rooms
- `room-update`: Room state changed
- `game-started`: Game has begun
- `game-state-update`: Game state changed
- `error`: Error message
- `player-disconnected`: A player disconnected

## 🤝 Contributing

To add new features:

1. Update `server.ts` to handle new events
2. Add methods to `lib/websocket-client.ts`
3. Update `lib/use-websocket.ts` hook
4. Implement UI in game components

## 📄 License

Same as the main project.


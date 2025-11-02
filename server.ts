import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import type { GameRoom } from './lib/types'
import { initializeGame } from './lib/game-logic'
import { GameEngine } from './lib/game-engine'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// In-memory storage for rooms and game engines
const rooms = new Map<string, GameRoom>()
const gameEngines = new Map<string, GameEngine>()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Periodic check for stuck nope windows (every 2 seconds)
  setInterval(() => {
    gameEngines.forEach((engine, roomId) => {
      try {
        engine.checkAndResolveStuckNopeWindow()
      } catch (error) {
        console.error(`[v0] Error checking nope window in room ${roomId}:`, error)
      }
    })
  }, 2000)

  io.on('connection', (socket) => {
    console.log('[v0] Client connected:', socket.id)

    // Get all public rooms
    socket.on('get-rooms', () => {
      const publicRooms = Array.from(rooms.values())
        .filter((room) => room.isPublic && room.status === 'waiting')
        .map((room) => ({
          ...room,
          // Don't send full game state
          gameState: undefined,
        }))
      socket.emit('rooms-list', publicRooms)
    })

    // Join room
    socket.on('join-room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
      console.log('[v0] Player joining room:', roomId, playerName)

      let room = rooms.get(roomId)

      if (!room) {
        // Create new room
        room = {
          id: roomId,
          hostId: socket.id,
          players: [
            {
              id: socket.id,
              name: playerName,
              isReady: false,
              isHost: true,
            },
          ],
          maxPlayers: 5,
          isPublic: true,
          status: 'waiting',
          createdAt: Date.now(),
        }
        rooms.set(roomId, room)
        console.log('[v0] Created new room:', roomId)
      } else {
        // Check if player is already in room by socket ID
        const existingPlayerBySocket = room.players.find((p) => p.id === socket.id)
        // Check if player is already in room by name (for page navigation)
        const existingPlayerByName = room.players.find((p) => p.name === playerName)
        // Check if player was in the game (for reconnection after disconnect/refresh)
        const wasInGame = room.gameState?.players.find((p) => p.name === playerName)
        
        if (!existingPlayerBySocket && !existingPlayerByName) {
          // Check if this is a reconnection to an active game
          if (room.status === 'active' && wasInGame) {
            // Player is reconnecting to an active game - allow them back in
            const isOriginalHost = wasInGame.id === room.hostId
            room.players.push({
              id: socket.id,
              name: playerName,
              isReady: true, // Already in game, so they're ready
              isHost: isOriginalHost,
            })
            
            // Update their socket ID in game state
            wasInGame.id = socket.id
            
            // If they were the host, restore host status
            if (isOriginalHost) {
              room.hostId = socket.id
            }
            
            console.log('[v0] Player reconnected to active game:', playerName)
          } else if (room.status !== 'waiting') {
            // New player trying to join active game - block them
            socket.emit('error', { message: 'Game already in progress' })
            return
          } else {
            // Add new player to waiting room
            if (room.players.length >= room.maxPlayers) {
              socket.emit('error', { message: 'Room is full' })
              return
            }

            room.players.push({
              id: socket.id,
              name: playerName,
              isReady: false,
              isHost: false,
            })
            console.log('[v0] Player added to room:', playerName)
          }
        } else if (existingPlayerByName && !existingPlayerBySocket) {
          // Player is reconnecting (e.g., navigating from room page to game page)
          // Update their socket ID in room
          const oldSocketId = existingPlayerByName.id
          existingPlayerByName.id = socket.id
          
          // Update player ID in game state if game is active
          if (room.gameState) {
            const gamePlayer = room.gameState.players.find((p) => p.id === oldSocketId)
            if (gamePlayer) {
              gamePlayer.id = socket.id
            }
          }
          
          console.log('[v0] Player reconnected with new socket:', playerName, 'old:', oldSocketId, 'new:', socket.id)
        }
      }

      socket.join(roomId)
      
      console.log('[v0] Player joined room, current status:', room.status, 'hasGameState:', !!room.gameState)
      
      // Send room update to all players in the room
      io.to(roomId).emit('room-update', room)
      
      // If game is already active, send game state to the joining player
      if (room.status === 'active' && room.gameState) {
        console.log('[v0] Sending active game state to player:', playerName, 'socket:', socket.id)
        console.log('[v0] Game has', room.gameState.players.length, 'players, current turn phase:', room.gameState.turnPhase)
        
        // Check for stuck nope windows when player reconnects
        const engine = gameEngines.get(roomId)
        if (engine) {
          engine.checkAndResolveStuckNopeWindow()
        }
        
        socket.emit('game-started', { roomId, gameState: room.gameState })
      }
      
      // Broadcast updated room list to lobby
      broadcastRoomList()
    })

    // Leave room
    socket.on('leave-room', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const room = rooms.get(roomId)
      if (!room) return

      room.players = room.players.filter((p) => p.id !== playerId)

      if (room.players.length === 0) {
        const engine = gameEngines.get(roomId)
        if (engine) {
          engine.cleanup()
        }
        rooms.delete(roomId)
        gameEngines.delete(roomId)
        console.log('[v0] Room deleted:', roomId)
      } else {
        // Assign new host if needed
        if (playerId === room.hostId) {
          room.players[0].isHost = true
          room.hostId = room.players[0].id
        }
        io.to(roomId).emit('room-update', room)
      }

      socket.leave(roomId)
      broadcastRoomList()
    })

    // Toggle ready
    socket.on('ready-toggle', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const room = rooms.get(roomId)
      if (!room) return

      const player = room.players.find((p) => p.id === playerId)
      if (player) {
        player.isReady = !player.isReady
        io.to(roomId).emit('room-update', room)
        console.log('[v0] Player ready toggle:', player.name, player.isReady)
      }
    })

    // Start game
    socket.on('start-game', ({ roomId }: { roomId: string }) => {
      const room = rooms.get(roomId)
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      // Verify host
      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can start the game' })
        return
      }

      // Check minimum players
      if (room.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' })
        return
      }

      // Check all ready
      const allReady = room.players.every((p) => p.isReady || p.isHost)
      if (!allReady) {
        socket.emit('error', { message: 'All players must be ready' })
        return
      }

      console.log('[v0] Starting game in room:', roomId)

      // Initialize game
      const playerNames = room.players.map((p) => p.name)
      const gameState = initializeGame(playerNames)

      // Map player IDs
      gameState.players.forEach((player, index) => {
        player.id = room.players[index].id
      })

      room.gameState = gameState
      room.status = 'active'

      // Create game engine
      const engine = new GameEngine(gameState)
      engine.onStateUpdate((newState) => {
        room.gameState = newState
        io.to(roomId).emit('game-state-update', { roomId, gameState: newState })
        
        // Check for game over
        if (newState.gameStatus === 'finished') {
          room.status = 'finished'
          setTimeout(() => {
            // Clean up finished game after 30 seconds
            const finishedEngine = gameEngines.get(roomId)
            if (finishedEngine) {
              finishedEngine.cleanup()
            }
            rooms.delete(roomId)
            gameEngines.delete(roomId)
          }, 30000)
        }
      })
      gameEngines.set(roomId, engine)

      io.to(roomId).emit('game-started', { roomId, gameState })
      broadcastRoomList()
      console.log('[v0] Game started with', gameState.players.length, 'players')
    })

    // Play card
    socket.on('play-card', ({ roomId, playerId, cardId, targetId }: { roomId: string; playerId: string; cardId: string; targetId?: string }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerPlayCard(playerId, cardId, targetId)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to play card' })
        console.error('[v0] Play card error:', error)
      }
    })

    // Draw card
    socket.on('draw-card', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerDrawCard(playerId)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to draw card' })
        console.error('[v0] Draw card error:', error)
      }
    })

    // Play cat combo
    socket.on('play-cat-combo', ({ roomId, playerId, cardIds, targetId, targetCardType }: { roomId: string; playerId: string; cardIds: string[]; targetId: string; targetCardType?: string }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerPlayCatCombo(playerId, cardIds, targetId, targetCardType)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to play cat combo' })
        console.error('[v0] Cat combo error:', error)
      }
    })

    // Insert kitten
    socket.on('insert-kitten', ({ roomId, playerId, position }: { roomId: string; playerId: string; position: number }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerInsertKitten(playerId, position)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to insert kitten' })
        console.error('[v0] Insert kitten error:', error)
      }
    })

    // Favor response
    socket.on('favor-response', ({ roomId, playerId, cardId }: { roomId: string; playerId: string; cardId: string }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerRespondToFavor(playerId, cardId)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to respond to favor' })
        console.error('[v0] Favor response error:', error)
      }
    })

    // Alter future response
    socket.on('alter-future-response', ({ roomId, playerId, cardOrder }: { roomId: string; playerId: string; cardOrder: string[] }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerRearrangeTopCards(playerId, cardOrder)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to rearrange cards' })
        console.error('[v0] Alter future response error:', error)
      }
    })

    // Bury response
    socket.on('bury-response', ({ roomId, playerId, cardId, position }: { roomId: string; playerId: string; cardId: string; position: number }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerBuryCard(playerId, cardId, position)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to bury card' })
        console.error('[v0] Bury response error:', error)
      }
    })

    // Play nope
    socket.on('play-nope', ({ roomId, playerId, cardId }: { roomId: string; playerId: string; cardId: string }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      try {
        engine.playerPlayCard(playerId, cardId)
      } catch (error) {
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to play nope' })
        console.error('[v0] Play nope error:', error)
      }
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log('[v0] Client disconnected:', socket.id)

      // Remove player from all rooms
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id)
        if (playerIndex !== -1) {
          const playerName = room.players[playerIndex].name
          room.players.splice(playerIndex, 1)

          if (room.players.length === 0) {
            // If game is active, keep room for 5 minutes to allow reconnection
            if (room.status === 'active') {
              console.log('[v0] All players disconnected from active game, keeping room for reconnection:', roomId)
              setTimeout(() => {
                const currentRoom = rooms.get(roomId)
                if (currentRoom && currentRoom.players.length === 0) {
                  const disconnectEngine = gameEngines.get(roomId)
                  if (disconnectEngine) {
                    disconnectEngine.cleanup()
                  }
                  rooms.delete(roomId)
                  gameEngines.delete(roomId)
                  console.log('[v0] Room deleted after timeout:', roomId)
                }
              }, 5 * 60 * 1000) // 5 minutes
            } else {
              // Waiting room with no players - delete immediately
              const waitingEngine = gameEngines.get(roomId)
              if (waitingEngine) {
                waitingEngine.cleanup()
              }
              rooms.delete(roomId)
              gameEngines.delete(roomId)
              console.log('[v0] Empty waiting room deleted:', roomId)
            }
          } else {
            // Assign new host if needed
            if (socket.id === room.hostId) {
              room.players[0].isHost = true
              room.hostId = room.players[0].id
            }
            io.to(roomId).emit('room-update', room)
            io.to(roomId).emit('player-disconnected', { playerName })
          }

          broadcastRoomList()
        }
      })
    })
  })

  function broadcastRoomList() {
    const publicRooms = Array.from(rooms.values())
      .filter((room) => room.isPublic && room.status === 'waiting')
      .map((room) => ({
        ...room,
        gameState: undefined,
      }))
    io.emit('rooms-list', publicRooms)
  }

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> WebSocket server initialized')
    })
})


import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { GameRoom } from "@/lib/types"
import { initializeGame } from "@/lib/game-logic"
import { GameEngine } from "@/lib/game-engine"

// In-memory storage for rooms and game engines
const rooms = new Map<string, GameRoom>()
const gameEngines = new Map<string, GameEngine>()

export async function GET(req: Request) {
  // This endpoint is used to initialize the Socket.IO server
  // In a real deployment, you'd use a separate WebSocket server
  // For now, we'll return a simple response
  return new Response(
    JSON.stringify({
      message: "WebSocket server endpoint. Connect using Socket.IO client.",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}

// Socket.IO handler (this would typically be in a separate server file)
export function initializeSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("[v0] Client connected:", socket.id)

    // Join room
    socket.on("join-room", ({ roomId, playerName }) => {
      console.log("[v0] Player joining room:", roomId, playerName)

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
          status: "waiting",
          createdAt: Date.now(),
        }
        rooms.set(roomId, room)
      } else {
        // Add player to existing room
        if (room.players.length >= room.maxPlayers) {
          socket.emit("error", { message: "Room is full" })
          return
        }

        room.players.push({
          id: socket.id,
          name: playerName,
          isReady: false,
          isHost: false,
        })
      }

      socket.join(roomId)
      io.to(roomId).emit("room-update", room)
    })

    // Leave room
    socket.on("leave-room", ({ roomId, playerId }) => {
      const room = rooms.get(roomId)
      if (!room) return

      room.players = room.players.filter((p) => p.id !== playerId)

      if (room.players.length === 0) {
        rooms.delete(roomId)
        gameEngines.delete(roomId)
      } else {
        // Assign new host if needed
        if (playerId === room.hostId) {
          room.players[0].isHost = true
          room.hostId = room.players[0].id
        }
        io.to(roomId).emit("room-update", room)
      }

      socket.leave(roomId)
    })

    // Toggle ready
    socket.on("ready-toggle", ({ roomId, playerId }) => {
      const room = rooms.get(roomId)
      if (!room) return

      const player = room.players.find((p) => p.id === playerId)
      if (player) {
        player.isReady = !player.isReady
        io.to(roomId).emit("room-update", room)
      }
    })

    // Start game
    socket.on("start-game", ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room) return

      // Initialize game
      const playerNames = room.players.map((p) => p.name)
      const gameState = initializeGame(playerNames)

      // Map player IDs
      gameState.players.forEach((player, index) => {
        player.id = room.players[index].id
      })

      room.gameState = gameState
      room.status = "active"

      // Create game engine
      const engine = new GameEngine(gameState)
      engine.onStateUpdate((newState) => {
        room.gameState = newState
        io.to(roomId).emit("game-state-update", { roomId, gameState: newState })
      })
      gameEngines.set(roomId, engine)

      io.to(roomId).emit("game-started", { roomId, gameState })
    })

    // Play card
    socket.on("play-card", ({ roomId, playerId, cardId, targetId }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) return

      try {
        engine.playerPlayCard(playerId, cardId, targetId)
      } catch (error) {
        socket.emit("error", { message: error instanceof Error ? error.message : "Failed to play card" })
      }
    })

    // Draw card
    socket.on("draw-card", ({ roomId, playerId }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) return

      try {
        engine.playerDrawCard(playerId)
      } catch (error) {
        socket.emit("error", { message: error instanceof Error ? error.message : "Failed to draw card" })
      }
    })

    // Play cat combo
    socket.on("play-cat-combo", ({ roomId, playerId, cardIds, targetId }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) return

      try {
        engine.playerPlayCatCombo(playerId, cardIds, targetId)
      } catch (error) {
        socket.emit("error", { message: error instanceof Error ? error.message : "Failed to play cat combo" })
      }
    })

    // Insert kitten
    socket.on("insert-kitten", ({ roomId, playerId, position }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) return

      try {
        engine.playerInsertKitten(playerId, position)
      } catch (error) {
        socket.emit("error", { message: error instanceof Error ? error.message : "Failed to insert kitten" })
      }
    })

    // Favor response
    socket.on("favor-response", ({ roomId, playerId, cardId }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) return

      try {
        engine.playerRespondToFavor(playerId, cardId)
      } catch (error) {
        socket.emit("error", { message: error instanceof Error ? error.message : "Failed to respond to favor" })
      }
    })

    // Play nope
    socket.on("play-nope", ({ roomId, playerId, cardId }) => {
      const engine = gameEngines.get(roomId)
      if (!engine) return

      try {
        engine.playerPlayCard(playerId, cardId)
      } catch (error) {
        socket.emit("error", { message: error instanceof Error ? error.message : "Failed to play nope" })
      }
    })

    // Disconnect
    socket.on("disconnect", () => {
      console.log("[v0] Client disconnected:", socket.id)

      // Remove player from all rooms
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id)
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1)

          if (room.players.length === 0) {
            rooms.delete(roomId)
            gameEngines.delete(roomId)
          } else {
            // Assign new host if needed
            if (socket.id === room.hostId) {
              room.players[0].isHost = true
              room.hostId = room.players[0].id
            }
            io.to(roomId).emit("room-update", room)
          }
        }
      })
    })
  })

  return io
}

"use client"

import { useEffect, useState, useCallback } from "react"
import { getWebSocketClient } from "./websocket-client"
import type { GameState, GameRoom } from "./types"

export function useWebSocket(roomId: string) {
  const [connected, setConnected] = useState(false)
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ws = getWebSocketClient()

    // Check if already connected
    if (ws.isConnected()) {
      console.log("[v0] WebSocket already connected")
      setConnected(true)
    }

    // Connect to WebSocket
    ws.connect()
      .then(() => {
        console.log("[v0] WebSocket connect promise resolved")
        setConnected(true)
      })
      .catch((err) => {
        console.error("[v0] WebSocket connection failed:", err)
        setError("Failed to connect to server")
      })

    // Set up event handlers
    ws.on("connect", () => {
      console.log("[v0] Socket connected event in useWebSocket")
      setConnected(true)
    })

    ws.on("disconnect", () => {
      console.log("[v0] Socket disconnected event in useWebSocket")
      setConnected(false)
    })

    ws.on("room-update", (updatedRoom: GameRoom) => {
      console.log("[v0] Room updated:", updatedRoom)
      setRoom(updatedRoom)
    })

    ws.on("game-started", ({ gameState: newGameState }: { roomId: string; gameState: GameState }) => {
      console.log("[v0] Game started event received! Players:", newGameState.players.length, "Phase:", newGameState.turnPhase)
      setGameState(newGameState)
    })

    ws.on("game-state-update", ({ gameState: newGameState }: { roomId: string; gameState: GameState }) => {
      console.log("[v0] Game state updated")
      setGameState(newGameState)
    })

    ws.on("error", ({ message }: { message: string }) => {
      console.error("[v0] Server error:", message)
      setError(message)
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    })

    // Cleanup
    return () => {
      ws.off("connect")
      ws.off("disconnect")
      ws.off("room-update")
      ws.off("game-started")
      ws.off("game-state-update")
      ws.off("error")
    }
  }, [roomId])

  const joinRoom = useCallback(
    (playerName: string) => {
      const ws = getWebSocketClient()
      ws.joinRoom(roomId, playerName)
    },
    [roomId],
  )

  const leaveRoom = useCallback(
    (playerId: string) => {
      const ws = getWebSocketClient()
      ws.leaveRoom(roomId, playerId)
    },
    [roomId],
  )

  const toggleReady = useCallback(
    (playerId: string) => {
      const ws = getWebSocketClient()
      ws.toggleReady(roomId, playerId)
    },
    [roomId],
  )

  const startGame = useCallback(() => {
    const ws = getWebSocketClient()
    ws.startGame(roomId)
  }, [roomId])

  const playCard = useCallback(
    (playerId: string, cardId: string, targetId?: string) => {
      const ws = getWebSocketClient()
      ws.playCard(roomId, playerId, cardId, targetId)
    },
    [roomId],
  )

  const drawCard = useCallback(
    (playerId: string) => {
      const ws = getWebSocketClient()
      ws.drawCard(roomId, playerId)
    },
    [roomId],
  )

  const playCatCombo = useCallback(
    (playerId: string, cardIds: string[], targetId: string, targetCardType?: string) => {
      const ws = getWebSocketClient()
      ws.playCatCombo(roomId, playerId, cardIds, targetId, targetCardType)
    },
    [roomId],
  )

  const insertKitten = useCallback(
    (playerId: string, position: number) => {
      const ws = getWebSocketClient()
      ws.insertKitten(roomId, playerId, position)
    },
    [roomId],
  )

  const favorResponse = useCallback(
    (playerId: string, cardId: string) => {
      const ws = getWebSocketClient()
      ws.favorResponse(roomId, playerId, cardId)
    },
    [roomId],
  )

  const playNope = useCallback(
    (playerId: string, cardId: string) => {
      const ws = getWebSocketClient()
      ws.playNope(roomId, playerId, cardId)
    },
    [roomId],
  )

  const rearrangeTopCards = useCallback(
    (playerId: string, cardOrder: string[]) => {
      const ws = getWebSocketClient()
      ws.rearrangeTopCards(roomId, playerId, cardOrder)
    },
    [roomId],
  )

  const buryCard = useCallback(
    (playerId: string, cardId: string, position: number) => {
      const ws = getWebSocketClient()
      ws.buryCard(roomId, playerId, cardId, position)
    },
    [roomId],
  )

  return {
    connected,
    room,
    gameState,
    error,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    playCard,
    drawCard,
    playCatCombo,
    insertKitten,
    favorResponse,
    playNope,
    rearrangeTopCards,
    buryCard,
  }
}

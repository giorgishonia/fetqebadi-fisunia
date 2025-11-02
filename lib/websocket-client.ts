"use client"

import { io, type Socket } from "socket.io-client"

export class WebSocketClient {
  private socket: Socket | null = null
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private nativeEventHandlers: Map<string, (data: any) => void> = new Map()
  private isConnecting = false

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prevent multiple simultaneous connection attempts
      if (this.isConnecting) {
        return
      }

      // Already connected
      if (this.socket?.connected) {
        resolve()
        return
      }

      this.isConnecting = true

      try {
        // Connect to WebSocket server with reconnection enabled
        this.socket = io({
          path: "/api/socket",
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        })

        this.socket.on("connect", () => {
          console.log("[v0] WebSocket connected, socket ID:", this.socket?.id)
          this.isConnecting = false
          
          // Call any registered connect handlers
          const connectHandler = this.nativeEventHandlers.get("connect")
          if (connectHandler) {
            connectHandler(undefined)
          }
          
          resolve()
        })

        this.socket.on("disconnect", (reason) => {
          console.log("[v0] WebSocket disconnected:", reason)
          
          // Call any registered disconnect handlers
          const disconnectHandler = this.nativeEventHandlers.get("disconnect")
          if (disconnectHandler) {
            disconnectHandler(reason)
          }
        })

        this.socket.on("reconnect", (attemptNumber) => {
          console.log("[v0] WebSocket reconnected after", attemptNumber, "attempts")
          
          // Call any registered reconnect handlers
          const reconnectHandler = this.nativeEventHandlers.get("reconnect")
          if (reconnectHandler) {
            reconnectHandler(attemptNumber)
          }
        })

        this.socket.on("reconnect_attempt", (attemptNumber) => {
          console.log("[v0] WebSocket reconnection attempt:", attemptNumber)
        })

        this.socket.on("reconnect_error", (error) => {
          console.error("[v0] WebSocket reconnection error:", error)
        })

        this.socket.on("reconnect_failed", () => {
          console.error("[v0] WebSocket reconnection failed")
          this.isConnecting = false
          reject(new Error("Failed to reconnect"))
        })

        this.socket.on("error", (error) => {
          console.error("[v0] WebSocket error:", error)
          this.isConnecting = false
          reject(error)
        })

        // Handle incoming messages
        this.socket.onAny((event, data) => {
          const handler = this.messageHandlers.get(event)
          if (handler) {
            handler(data)
          }
        })
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, handler: (data: any) => void): void {
    // For native socket.io events like 'connect' and 'disconnect',
    // store them in nativeEventHandlers to be called from our connect/disconnect handlers
    if (event === "connect" || event === "disconnect" || event === "reconnect") {
      this.nativeEventHandlers.set(event, handler)
    } else {
      // For custom events, use the messageHandlers map
      this.messageHandlers.set(event, handler)
    }
  }

  off(event: string): void {
    // Remove from appropriate map
    if (event === "connect" || event === "disconnect" || event === "reconnect") {
      this.nativeEventHandlers.delete(event)
    } else {
      this.messageHandlers.delete(event)
    }
  }

  emit(event: string, data: any): void {
    if (!this.socket) {
      throw new Error("WebSocket not connected")
    }
    this.socket.emit(event, data)
  }

  // Room management
  getRooms(): void {
    this.emit("get-rooms", {})
  }

  joinRoom(roomId: string, playerName: string): void {
    this.emit("join-room", { roomId, playerName })
  }

  leaveRoom(roomId: string, playerId: string): void {
    this.emit("leave-room", { roomId, playerId })
  }

  toggleReady(roomId: string, playerId: string): void {
    this.emit("ready-toggle", { roomId, playerId })
  }

  startGame(roomId: string): void {
    this.emit("start-game", { roomId })
  }

  // Game actions
  playCard(roomId: string, playerId: string, cardId: string, targetId?: string): void {
    this.emit("play-card", { roomId, playerId, cardId, targetId })
  }

  drawCard(roomId: string, playerId: string): void {
    this.emit("draw-card", { roomId, playerId })
  }

  playNope(roomId: string, playerId: string, cardId: string): void {
    this.emit("play-nope", { roomId, playerId, cardId })
  }

  insertKitten(roomId: string, playerId: string, position: number): void {
    this.emit("insert-kitten", { roomId, playerId, position })
  }

  favorResponse(roomId: string, playerId: string, cardId: string): void {
    this.emit("favor-response", { roomId, playerId, cardId })
  }

  playCatCombo(roomId: string, playerId: string, cardIds: string[], targetId: string, targetCardType?: string): void {
    this.emit("play-cat-combo", { roomId, playerId, cardIds, targetId, targetCardType })
  }

  rearrangeTopCards(roomId: string, playerId: string, cardOrder: string[]): void {
    this.emit("alter-future-response", { roomId, playerId, cardOrder })
  }

  buryCard(roomId: string, playerId: string, cardId: string, position: number): void {
    this.emit("bury-response", { roomId, playerId, cardId, position })
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}

import type { GameState, Player, Card } from "./types"
import {
  drawCard,
  playCard,
  playCatCombo,
  insertExplodingKitten,
  resolveNopeChain,
  respondToFavor,
  eliminatePlayer,
  canPlayCard,
  getTopCards,
  rearrangeTopCards,
  buryCard,
} from "./game-logic"

// Game Engine - Orchestrates game flow and state management
export class GameEngine {
  private gameState: GameState
  private stateUpdateCallback?: (state: GameState) => void
  private nopeWindowTimeout?: NodeJS.Timeout

  constructor(gameState: GameState) {
    this.gameState = gameState
    // Check if there's an active nope window that needs auto-resolve
    this.setupNopeWindowAutoResolve(gameState)
  }

  // Set callback for state updates
  onStateUpdate(callback: (state: GameState) => void) {
    this.stateUpdateCallback = callback
  }

  // Get current game state
  getState(): GameState {
    return this.gameState
  }

  // Update state and trigger callback
  private updateState(newState: GameState) {
    this.gameState = newState
    
    // Set up auto-resolve for nope window if needed
    this.setupNopeWindowAutoResolve(newState)
    
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(newState)
    }
  }

  // Set up auto-resolve timer for nope window
  private setupNopeWindowAutoResolve(state: GameState) {
    // Clear any existing timeout
    if (this.nopeWindowTimeout) {
      clearTimeout(this.nopeWindowTimeout)
      this.nopeWindowTimeout = undefined
    }

    // If in nope window, set up auto-resolve
    if (state.turnPhase === "nope-window" && state.pendingAction) {
      const timeRemaining = state.pendingAction.expiresAt - Date.now()
      
      if (timeRemaining > 0) {
        console.log(`[v0] Setting up nope window auto-resolve in ${timeRemaining}ms`)
        this.nopeWindowTimeout = setTimeout(() => {
          console.log('[v0] Auto-resolving nope window')
          try {
            this.resolveNopeWindow()
          } catch (error) {
            console.error('[v0] Error auto-resolving nope window:', error)
          }
        }, timeRemaining)
      } else {
        // Time already expired, resolve immediately
        console.log('[v0] Nope window already expired, resolving immediately')
        try {
          this.resolveNopeWindow()
        } catch (error) {
          console.error('[v0] Error resolving expired nope window:', error)
        }
      }
    }
  }

  // Force check and resolve any stuck nope windows
  checkAndResolveStuckNopeWindow(): void {
    const state = this.gameState
    if (state.turnPhase === "nope-window" && state.pendingAction) {
      const timeRemaining = state.pendingAction.expiresAt - Date.now()
      
      if (timeRemaining <= 0) {
        console.log('[v0] Found stuck nope window, resolving immediately')
        try {
          this.resolveNopeWindow()
        } catch (error) {
          console.error('[v0] Error resolving stuck nope window:', error)
        }
      } else {
        console.log(`[v0] Nope window active with ${timeRemaining}ms remaining`)
      }
    }
  }

  // Clean up resources
  cleanup() {
    if (this.nopeWindowTimeout) {
      clearTimeout(this.nopeWindowTimeout)
      this.nopeWindowTimeout = undefined
    }
  }

  // Player draws a card
  playerDrawCard(playerId: string): void {
    try {
      const newState = drawCard(this.gameState, playerId)
      this.updateState(newState)

      // Check if player exploded and has no defuse
      const player = newState.players.find((p) => p.id === playerId)
      if (newState.turnPhase === "exploded" && player) {
        const hasDefuse = player.hand.some((c) => c.type === "defuse")
        if (!hasDefuse) {
          // Player is eliminated
          setTimeout(() => {
            const eliminatedState = eliminatePlayer(newState, playerId)
            this.updateState(eliminatedState)
          }, 1000) // Give time to show explosion
        }
      }
    } catch (error) {
      console.error("[v0] Draw card error:", error)
      throw error
    }
  }

  // Player plays a card
  playerPlayCard(playerId: string, cardId: string, targetId?: string): void {
    try {
      const newState = playCard(this.gameState, playerId, cardId, targetId)
      this.updateState(newState)
      // Auto-resolve is now handled by setupNopeWindowAutoResolve in updateState
    } catch (error) {
      console.error("[v0] Play card error:", error)
      throw error
    }
  }

  // Player plays cat combo (2 or 3 cards)
  playerPlayCatCombo(playerId: string, cardIds: string[], targetId: string, targetCardType?: string): void {
    try {
      const newState = playCatCombo(this.gameState, playerId, cardIds, targetId, targetCardType as any)
      this.updateState(newState)
      // Auto-resolve is now handled by setupNopeWindowAutoResolve in updateState
    } catch (error) {
      console.error("[v0] Cat combo error:", error)
      throw error
    }
  }

  // Player inserts Exploding Kitten
  playerInsertKitten(playerId: string, position: number): void {
    try {
      const newState = insertExplodingKitten(this.gameState, playerId, position)
      this.updateState(newState)
    } catch (error) {
      console.error("[v0] Insert kitten error:", error)
      throw error
    }
  }

  // Player responds to Favor
  playerRespondToFavor(targetId: string, cardId: string): void {
    try {
      const newState = respondToFavor(this.gameState, targetId, cardId)
      this.updateState(newState)
    } catch (error) {
      console.error("[v0] Favor response error:", error)
      throw error
    }
  }

  // Player rearranges top cards (Alter the Future)
  playerRearrangeTopCards(playerId: string, cardOrder: string[]): void {
    try {
      const newState = rearrangeTopCards(this.gameState, playerId, cardOrder)
      this.updateState(newState)
    } catch (error) {
      console.error("[v0] Rearrange cards error:", error)
      throw error
    }
  }

  // Player buries a card in the deck
  playerBuryCard(playerId: string, cardId: string, position: number): void {
    try {
      const newState = buryCard(this.gameState, playerId, cardId, position)
      this.updateState(newState)
    } catch (error) {
      console.error("[v0] Bury card error:", error)
      throw error
    }
  }

  // Resolve nope window
  resolveNopeWindow(): void {
    try {
      const { cancelled, gameState: newState } = resolveNopeChain(this.gameState)

      if (cancelled) {
        console.log("[v0] Action was noped!")
      }

      this.updateState(newState)
    } catch (error) {
      console.error("[v0] Resolve nope error:", error)
      throw error
    }
  }

  // Get visible information for a specific player
  getPlayerView(playerId: string): {
    hand: Card[]
    otherPlayers: Array<{ id: string; name: string; cardCount: number; isAlive: boolean }>
    drawPileCount: number
    discardPile: Card[]
    currentPlayer: Player
    isMyTurn: boolean
    topCards?: Card[] // For See the Future
  } {
    const player = this.gameState.players.find((p) => p.id === playerId)
    if (!player) {
      throw new Error("Player not found")
    }

    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex]

    // Get top cards if player has active See the Future or Alter the Future
    let topCards: Card[] | undefined
    if (
      (this.gameState.pendingAction?.type === "see-future" || this.gameState.pendingAction?.type === "alter-future") &&
      this.gameState.pendingAction.initiatorId === playerId
    ) {
      topCards = getTopCards(this.gameState)
    }

    return {
      hand: player.hand,
      otherPlayers: this.gameState.players
        .filter((p) => p.id !== playerId)
        .map((p) => ({
          id: p.id,
          name: p.name,
          cardCount: p.hand.length,
          isAlive: p.isAlive,
        })),
      drawPileCount: this.gameState.drawPile.length,
      discardPile: this.gameState.discardPile,
      currentPlayer,
      isMyTurn: player.isCurrentTurn,
      topCards,
    }
  }

  // Check if player can perform action
  canPlayerPlayCard(playerId: string, cardType: string): boolean {
    return canPlayCard(this.gameState, playerId, cardType as any)
  }
}

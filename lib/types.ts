// Card Types
export type CardType =
  | "exploding-kitten"
  | "defuse"
  | "nope"
  | "attack"
  | "skip"
  | "favor"
  | "shuffle"
  | "see-the-future"
  | "cat-taco"
  | "cat-rainbow"
  | "cat-beard"
  | "cat-melon"
  | "cat-potato"
  | "reverse"
  | "draw-from-bottom"
  | "alter-the-future"
  | "bury"

export interface Card {
  id: string
  type: CardType
  playerId?: string // Who currently holds this card
}

// Player State
export interface Player {
  id: string
  name: string
  hand: Card[]
  isAlive: boolean
  turnsRemaining: number // For Attack card stacking
  isCurrentTurn: boolean
}

// Game State
export interface GameState {
  id: string
  players: Player[]
  drawPile: Card[]
  discardPile: Card[]
  currentPlayerIndex: number
  turnPhase: TurnPhase
  gameStatus: GameStatus
  turnDirection: 1 | -1 // 1 = clockwise, -1 = counterclockwise
  pendingAction?: PendingAction
  winner?: string
  createdAt: number
}

export type TurnPhase =
  | "playing-cards" // Player can play action cards
  | "drawing" // Player must draw a card
  | "exploded" // Player drew Exploding Kitten, must play Defuse
  | "inserting-kitten" // Player is choosing where to insert Exploding Kitten
  | "nope-window" // Waiting for potential Nope responses

export type GameStatus =
  | "waiting" // Lobby, waiting for players
  | "active" // Game in progress
  | "finished" // Game over

// Pending Actions (for Nope chains, Favor requests, etc.)
export interface PendingAction {
  type: "nope-chain" | "favor-request" | "see-future" | "alter-future" | "bury"
  initiatorId: string
  targetId?: string
  cardPlayed?: Card
  cardType?: CardType // The card type being played (for display in nope window)
  nopeChain: string[] // Player IDs who played Nope
  timestamp: number
  expiresAt: number
  deferredAction?: {
    type: "attack" | "skip" | "shuffle" | "see-future" | "favor" | "cat-combo" | "reverse" | "draw-from-bottom" | "alter-the-future" | "bury"
    playerId: string
    targetId?: string
    cardIds?: string[]
    targetCardType?: CardType
    position?: number // For bury card
    cardOrder?: string[] // For alter-the-future
  }
}

// Game Room (Lobby)
export interface GameRoom {
  id: string
  hostId: string
  players: RoomPlayer[]
  maxPlayers: number
  isPublic: boolean
  status: GameStatus
  gameState?: GameState
  createdAt: number
}

export interface RoomPlayer {
  id: string
  name: string
  isReady: boolean
  isHost: boolean
}

// WebSocket Messages
export type WSMessage =
  | { type: "join-room"; roomId: string; playerName: string }
  | { type: "leave-room"; roomId: string; playerId: string }
  | { type: "ready-toggle"; roomId: string; playerId: string }
  | { type: "start-game"; roomId: string }
  | { type: "play-card"; roomId: string; playerId: string; cardId: string; targetId?: string }
  | { type: "draw-card"; roomId: string; playerId: string }
  | { type: "play-nope"; roomId: string; playerId: string; cardId: string }
  | { type: "insert-kitten"; roomId: string; playerId: string; position: number }
  | { type: "favor-response"; roomId: string; playerId: string; cardId: string }
  | { type: "play-cat-combo"; roomId: string; playerId: string; cardIds: string[]; targetId: string; targetCardType?: CardType }
  | { type: "alter-future-response"; roomId: string; playerId: string; cardOrder: string[] }
  | { type: "bury-response"; roomId: string; playerId: string; cardId: string; position: number }
  | { type: "game-state-update"; roomId: string; gameState: GameState }
  | { type: "error"; message: string }

// Game Configuration
export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 5,
  NOPE_WINDOW_MS: 3000, // 3 seconds to play Nope
  CARDS_PER_PLAYER: 5, // Initial hand size (excluding Defuse)
  DEFUSE_CARDS: 6, // Total Defuse cards in deck
  EXPLODING_KITTENS_FORMULA: (players: number) => players - 1,
  CARD_COUNTS: {
    nope: 5,
    attack: 4,
    skip: 4,
    favor: 4,
    shuffle: 4,
    "see-the-future": 5,
    "cat-taco": 4,
    "cat-rainbow": 4,
    "cat-beard": 4,
    "cat-melon": 4,
    "cat-potato": 4,
    reverse: 4,
    "draw-from-bottom": 4,
    "alter-the-future": 4,
    bury: 4,
  },
} as const

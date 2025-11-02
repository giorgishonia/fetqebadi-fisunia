import { type Card, type CardType, type GameState, type Player, GAME_CONFIG } from "./types"

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Create a new deck of cards
export function createDeck(playerCount: number): Card[] {
  const deck: Card[] = []

  // Add regular cards based on CARD_COUNTS
  Object.entries(GAME_CONFIG.CARD_COUNTS).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      deck.push({ id: generateId(), type: type as CardType })
    }
  })

  // Add Defuse cards (players get 1 each, rest go in deck)
  const defuseInDeck = GAME_CONFIG.DEFUSE_CARDS - playerCount
  for (let i = 0; i < defuseInDeck; i++) {
    deck.push({ id: generateId(), type: "defuse" })
  }

  return shuffleDeck(deck)
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Initialize a new game
export function initializeGame(playerNames: string[]): GameState {
  const playerCount = playerNames.length

  if (playerCount < GAME_CONFIG.MIN_PLAYERS || playerCount > GAME_CONFIG.MAX_PLAYERS) {
    throw new Error(`Game requires ${GAME_CONFIG.MIN_PLAYERS}-${GAME_CONFIG.MAX_PLAYERS} players`)
  }

  // Create deck without Exploding Kittens initially
  let deck = createDeck(playerCount)

  // Create players and deal initial hands
  const players: Player[] = playerNames.map((name, index) => {
    const hand: Card[] = []

    // Deal 7 cards + 1 Defuse to each player
    for (let i = 0; i < GAME_CONFIG.CARDS_PER_PLAYER; i++) {
      const card = deck.pop()!
      hand.push(card)
    }

    // Add Defuse card
    hand.push({ id: generateId(), type: "defuse" })

    return {
      id: generateId(),
      name,
      hand,
      isAlive: true,
      turnsRemaining: 1,
      isCurrentTurn: index === 0,
    }
  })

  // Add Exploding Kittens to the deck
  const explodingKittenCount = GAME_CONFIG.EXPLODING_KITTENS_FORMULA(playerCount)
  for (let i = 0; i < explodingKittenCount; i++) {
    deck.push({ id: generateId(), type: "exploding-kitten" })
  }

  // Shuffle deck with Exploding Kittens
  deck = shuffleDeck(deck)

  return {
    id: generateId(),
    players,
    drawPile: deck,
    discardPile: [],
    currentPlayerIndex: 0,
    turnPhase: "playing-cards",
    gameStatus: "active",
    turnDirection: 1, // Start clockwise
    createdAt: Date.now(),
  }
}

// Check if a card is a Cat card (for combos)
export function isCatCard(cardType: CardType): boolean {
  return cardType.startsWith("cat-")
}

// Get cat card pairs/triples in a hand
export function getCatCombos(hand: Card[]): { type: CardType; count: number }[] {
  const catCounts = new Map<CardType, number>()

  hand.forEach((card) => {
    if (isCatCard(card.type)) {
      catCounts.set(card.type, (catCounts.get(card.type) || 0) + 1)
    }
  })

  return Array.from(catCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([type, count]) => ({ type, count }))
}

// Check if game is over
export function checkGameOver(players: Player[]): { isOver: boolean; winner?: Player } {
  const alivePlayers = players.filter((p) => p.isAlive)

  if (alivePlayers.length === 1) {
    return { isOver: true, winner: alivePlayers[0] }
  }

  return { isOver: false }
}

// Get next player index
export function getNextPlayerIndex(players: Player[], currentIndex: number, direction: 1 | -1 = 1): number {
  const playerCount = players.length
  let nextIndex = (currentIndex + direction + playerCount) % playerCount

  // Skip dead players
  let attempts = 0
  while (!players[nextIndex].isAlive && attempts < playerCount) {
    nextIndex = (nextIndex + direction + playerCount) % playerCount
    attempts++
  }

  return nextIndex
}

// Card display names
export const CARD_DISPLAY_NAMES: Record<CardType, string> = {
  "exploding-kitten": "Exploding Kitten",
  defuse: "Defuse",
  nope: "Nope",
  attack: "Attack",
  skip: "Skip",
  favor: "Favor",
  shuffle: "Shuffle",
  "see-the-future": "See the Future",
  "cat-taco": "Taco Cat",
  "cat-rainbow": "Rainbow Cat",
  "cat-beard": "Beard Cat",
  "cat-melon": "Melon Cat",
  "cat-potato": "Potato Cat",
  reverse: "Reverse",
  "draw-from-bottom": "Draw from Bottom",
  "alter-the-future": "Alter the Future",
  bury: "Bury",
}

// Card descriptions
export const CARD_DESCRIPTIONS: Record<CardType, string> = {
  "exploding-kitten": "You explode! Play a Defuse or lose.",
  defuse: "Save yourself from an Exploding Kitten.",
  nope: "Stop any action card (except Exploding Kitten or Defuse).",
  attack: "End your turn without drawing. Next player takes 2 turns.",
  skip: "End your turn without drawing a card.",
  favor: "Force another player to give you a card of their choice.",
  shuffle: "Shuffle the draw pile.",
  "see-the-future": "Peek at the top 3 cards of the draw pile.",
  "cat-taco": "Play 2 matching cats to steal a random card.",
  "cat-rainbow": "Play 2 matching cats to steal a random card.",
  "cat-beard": "Play 2 matching cats to steal a random card.",
  "cat-melon": "Play 2 matching cats to steal a random card.",
  "cat-potato": "Play 2 matching cats to steal a random card.",
  reverse: "Reverse the turn order direction.",
  "draw-from-bottom": "Draw from the bottom of the deck instead of top.",
  "alter-the-future": "View and rearrange the top 3 cards.",
  bury: "Bury a card from your hand anywhere in the draw pile.",
}

// Draw a card from the deck
export function drawCard(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState }
  const player = newState.players.find((p) => p.id === playerId)

  if (!player || !player.isAlive) {
    throw new Error("Invalid player")
  }

  if (newState.drawPile.length === 0) {
    throw new Error("Draw pile is empty")
  }

  const drawnCard = newState.drawPile.shift()!

  if (drawnCard.type === "exploding-kitten") {
    // Player drew Exploding Kitten
    newState.turnPhase = "exploded"
    player.hand.push(drawnCard)
  } else {
    // Normal card
    player.hand.push(drawnCard)

    // Decrease turns remaining and check if turn should end
    player.turnsRemaining--

    if (player.turnsRemaining <= 0) {
      // End turn
      endTurn(newState)
    }
  }

  return newState
}

// Play a card
export function playCard(gameState: GameState, playerId: string, cardId: string, targetId?: string): GameState {
  const newState = { ...gameState }
  const player = newState.players.find((p) => p.id === playerId)

  if (!player || !player.isAlive) {
    throw new Error("Invalid player")
  }

  const cardIndex = player.hand.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) {
    throw new Error("Card not in hand")
  }

  const card = player.hand[cardIndex]

  // Validate card play based on turn phase
  if (newState.turnPhase === "drawing" && card.type !== "nope") {
    throw new Error("Can only play Nope during drawing phase")
  }

  if (newState.turnPhase === "exploded" && card.type !== "defuse") {
    throw new Error("Must play Defuse after drawing Exploding Kitten")
  }

  // Remove card from hand
  player.hand.splice(cardIndex, 1)

  // Handle card effect
  switch (card.type) {
    case "defuse":
      return handleDefuse(newState, playerId, card)
    case "nope":
      return handleNope(newState, playerId, card)
    case "attack":
      return handleAttack(newState, playerId, card)
    case "skip":
      return handleSkip(newState, playerId, card)
    case "favor":
      return handleFavor(newState, playerId, card, targetId)
    case "shuffle":
      return handleShuffle(newState, playerId, card)
    case "see-the-future":
      return handleSeeTheFuture(newState, playerId, card)
    case "reverse":
      return handleReverse(newState, playerId, card)
    case "draw-from-bottom":
      return handleDrawFromBottom(newState, playerId, card)
    case "alter-the-future":
      return handleAlterTheFuture(newState, playerId, card)
    case "bury":
      return handleBury(newState, playerId, card)
    default:
      // Cat cards - just discard for now (combos handled separately)
      newState.discardPile.push(card)
      return newState
  }
}

// Play cat card combo (2 or 3 matching cats)
export function playCatCombo(
  gameState: GameState,
  playerId: string,
  cardIds: string[],
  targetId: string,
  targetCardType?: CardType,
): GameState {
  const newState = { ...gameState }
  const player = newState.players.find((p) => p.id === playerId)
  const target = newState.players.find((p) => p.id === targetId)

  if (!player || !player.isAlive || !target || !target.isAlive) {
    throw new Error("Invalid player or target")
  }

  if (target.hand.length === 0) {
    throw new Error("Target has no cards")
  }

  if (cardIds.length !== 2 && cardIds.length !== 3) {
    throw new Error("Must play 2 or 3 cards")
  }

  // Validate all cards are in hand and are matching cats
  const cards = cardIds.map((id) => player.hand.find((c) => c.id === id))
  
  if (cards.some((c) => !c)) {
    throw new Error("Cards not in hand")
  }

  if (!cards.every((c) => c && isCatCard(c.type))) {
    throw new Error("All cards must be cat cards")
  }

  const firstType = cards[0]!.type
  if (!cards.every((c) => c!.type === firstType)) {
    throw new Error("All cat cards must match")
  }

  // Remove cards from player hand
  player.hand = player.hand.filter((c) => !cardIds.includes(c.id))

  // Discard the cat cards
  newState.discardPile.push(...cards as Card[])

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    targetId,
    cardType: firstType, // Use the cat card type
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "cat-combo",
      playerId,
      targetId,
      cardIds,
      targetCardType,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle Defuse card
function handleDefuse(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }
  const player = newState.players.find((p) => p.id === playerId)!

  // Find Exploding Kitten in hand
  const kittenIndex = player.hand.findIndex((c) => c.type === "exploding-kitten")
  if (kittenIndex === -1) {
    throw new Error("No Exploding Kitten to defuse")
  }

  const kitten = player.hand.splice(kittenIndex, 1)[0]

  // Discard Defuse card
  newState.discardPile.push(card)

  // Player must now insert the Exploding Kitten back into the deck
  newState.turnPhase = "inserting-kitten"
  // Store the kitten in pendingAction for later insertion
  // Using "favor-request" type as a container (will be filtered by turnPhase in UI)
  newState.pendingAction = {
    type: "favor-request",
    initiatorId: playerId,
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + 30000, // 30 seconds to insert
    cardPlayed: kitten,
  }

  return newState
}

// Insert Exploding Kitten back into deck
export function insertExplodingKitten(gameState: GameState, playerId: string, position: number): GameState {
  const newState = { ...gameState }

  if (newState.turnPhase !== "inserting-kitten") {
    throw new Error("Not in kitten insertion phase")
  }

  if (!newState.pendingAction?.cardPlayed) {
    throw new Error("No kitten to insert")
  }

  const kitten = newState.pendingAction.cardPlayed

  // Validate position
  if (position < 0 || position > newState.drawPile.length) {
    throw new Error("Invalid position")
  }

  // Insert kitten at specified position
  newState.drawPile.splice(position, 0, kitten)

  // Clear pending action
  newState.pendingAction = undefined

  // Decrease turns and potentially end turn
  const player = newState.players.find((p) => p.id === playerId)!
  player.turnsRemaining--

  if (player.turnsRemaining <= 0) {
    endTurn(newState)
  } else {
    newState.turnPhase = "playing-cards"
  }

  return newState
}

// Handle Nope card
function handleNope(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  if (!newState.pendingAction) {
    throw new Error("No action to nope")
  }

  // Check if nope window has expired
  if (newState.pendingAction.expiresAt < Date.now()) {
    throw new Error("Nope window has expired")
  }

  // Add to nope chain
  newState.pendingAction.nopeChain.push(playerId)

  // Discard nope card
  newState.discardPile.push(card)

  return newState
}

// Resolve nope chain
export function resolveNopeChain(gameState: GameState): { cancelled: boolean; gameState: GameState } {
  let newState = { ...gameState }

  if (!newState.pendingAction) {
    return { cancelled: false, gameState: newState }
  }

  const nopeCount = newState.pendingAction.nopeChain.length

  // Odd number of nopes = action is cancelled
  const cancelled = nopeCount % 2 === 1

  // Get deferred action before clearing
  const deferredAction = newState.pendingAction.deferredAction
  const pendingActionType = newState.pendingAction.type
  const targetId = newState.pendingAction.targetId

  // If not cancelled, execute the deferred action
  if (!cancelled && deferredAction) {
    switch (deferredAction.type) {
      case "attack": {
        // Execute attack effect
        const player = newState.players.find((p) => p.id === deferredAction.playerId)!
        player.turnsRemaining = 0
        const nextPlayerIndex = getNextPlayerIndex(newState.players, newState.currentPlayerIndex, newState.turnDirection)
        const nextPlayer = newState.players[nextPlayerIndex]
        nextPlayer.turnsRemaining += 2
        endTurn(newState)
        break
      }
      case "skip": {
        // Execute skip effect
        const player = newState.players.find((p) => p.id === deferredAction.playerId)!
        player.turnsRemaining--
        if (player.turnsRemaining <= 0) {
          endTurn(newState)
        }
        break
      }
      case "shuffle": {
        // Execute shuffle effect
        newState.drawPile = shuffleDeck(newState.drawPile)
        break
      }
      case "see-future": {
        // Keep pendingAction for see-future display, just change type
        newState.pendingAction = {
          type: "see-future",
          initiatorId: deferredAction.playerId,
          nopeChain: [],
          timestamp: Date.now(),
          expiresAt: Date.now() + 10000, // 10 seconds to view
        }
        newState.turnPhase = "playing-cards"
        return { cancelled: false, gameState: newState }
      }
      case "favor": {
        // Keep pendingAction for favor request, just change phase
        newState.pendingAction = {
          ...newState.pendingAction,
          type: "favor-request",
        }
        delete newState.pendingAction.deferredAction
        newState.turnPhase = "playing-cards"
        return { cancelled: false, gameState: newState }
      }
      case "cat-combo": {
        // Execute cat combo effect
        const player = newState.players.find((p) => p.id === deferredAction.playerId)!
        const target = newState.players.find((p) => p.id === deferredAction.targetId)!
        
        if (deferredAction.cardIds && deferredAction.cardIds.length === 2) {
          // 2 cards: Steal random card
          const randomIndex = Math.floor(Math.random() * target.hand.length)
          const stolenCard = target.hand.splice(randomIndex, 1)[0]
          player.hand.push(stolenCard)
        } else if (deferredAction.cardIds && deferredAction.cardIds.length === 3 && deferredAction.targetCardType) {
          // 3 cards: Steal specific card
          const targetCardIndex = target.hand.findIndex((c) => c.type === deferredAction.targetCardType)
          if (targetCardIndex !== -1) {
            const stolenCard = target.hand.splice(targetCardIndex, 1)[0]
            player.hand.push(stolenCard)
          }
        }
        break
      }
      case "reverse": {
        // Reverse turn order
        newState.turnDirection = newState.turnDirection === 1 ? -1 : 1
        console.log(`[v0] Reverse card played - turn order now ${newState.turnDirection === 1 ? 'clockwise' : 'counterclockwise'}`)
        break
      }
      case "draw-from-bottom": {
        // Draw from bottom instead of top
        const player = newState.players.find((p) => p.id === deferredAction.playerId)!
        if (newState.drawPile.length > 0) {
          const bottomCard = newState.drawPile.pop()!
          if (bottomCard.type === "exploding-kitten") {
            newState.turnPhase = "exploded"
            player.hand.push(bottomCard)
            newState.pendingAction = undefined
            // Return early to prevent phase from being reset
            return { cancelled: false, gameState: newState }
          } else {
            player.hand.push(bottomCard)
            player.turnsRemaining--
            if (player.turnsRemaining <= 0) {
              endTurn(newState)
            }
          }
        }
        break
      }
      case "alter-the-future": {
        // Show alter-the-future UI to allow rearranging top 3 cards
        newState.pendingAction = {
          type: "alter-future",
          initiatorId: deferredAction.playerId,
          nopeChain: [],
          timestamp: Date.now(),
          expiresAt: Date.now() + 30000, // 30 seconds to rearrange
        }
        newState.turnPhase = "playing-cards"
        return { cancelled: false, gameState: newState }
      }
      case "bury": {
        // Show bury UI to select card and position
        newState.pendingAction = {
          type: "bury",
          initiatorId: deferredAction.playerId,
          nopeChain: [],
          timestamp: Date.now(),
          expiresAt: Date.now() + 30000, // 30 seconds to bury
        }
        newState.turnPhase = "playing-cards"
        return { cancelled: false, gameState: newState }
      }
    }
  }

  // Clear pending action
  newState.pendingAction = undefined
  newState.turnPhase = "playing-cards"

  return { cancelled, gameState: newState }
}

// Handle Attack card
function handleAttack(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "attack",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "attack",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle Skip card
function handleSkip(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "skip",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "skip",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle Favor card
function handleFavor(gameState: GameState, playerId: string, card: Card, targetId?: string): GameState {
  const newState = { ...gameState }

  if (!targetId) {
    throw new Error("Target required for Favor")
  }

  const target = newState.players.find((p) => p.id === targetId)
  if (!target || !target.isAlive) {
    throw new Error("Invalid target")
  }

  if (target.hand.length === 0) {
    throw new Error("Target has no cards")
  }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "favor-request",
    initiatorId: playerId,
    targetId,
    cardType: "favor",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "favor",
      playerId,
      targetId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Respond to Favor request
export function respondToFavor(gameState: GameState, targetId: string, cardId: string): GameState {
  const newState = { ...gameState }

  if (!newState.pendingAction || newState.pendingAction.type !== "favor-request") {
    throw new Error("No favor request pending")
  }

  const target = newState.players.find((p) => p.id === targetId)
  const initiator = newState.players.find((p) => p.id === newState.pendingAction!.initiatorId)

  if (!target || !initiator) {
    throw new Error("Invalid players")
  }

  // Find and transfer card
  const cardIndex = target.hand.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) {
    throw new Error("Card not in hand")
  }

  const card = target.hand.splice(cardIndex, 1)[0]
  initiator.hand.push(card)

  // Clear pending action
  newState.pendingAction = undefined
  newState.turnPhase = "playing-cards"

  return newState
}

// Handle Shuffle card
function handleShuffle(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "shuffle",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "shuffle",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle See the Future card
function handleSeeTheFuture(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "see-future",
    initiatorId: playerId,
    cardType: "see-the-future",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "see-future",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Get top cards for See the Future
export function getTopCards(gameState: GameState, count = 3): Card[] {
  return gameState.drawPile.slice(0, Math.min(count, gameState.drawPile.length))
}

// Rearrange top cards (Alter the Future)
export function rearrangeTopCards(gameState: GameState, playerId: string, cardOrder: string[]): GameState {
  const newState = { ...gameState }

  if (!newState.pendingAction || newState.pendingAction.type !== "alter-future") {
    throw new Error("No alter-future action pending")
  }

  if (newState.pendingAction.initiatorId !== playerId) {
    throw new Error("Only the initiator can rearrange cards")
  }

  // Validate card order matches top cards
  const topCards = newState.drawPile.slice(0, 3)
  if (cardOrder.length !== topCards.length) {
    throw new Error("Invalid card order length")
  }

  // Check all cards in order exist in top cards
  const topCardIds = new Set(topCards.map(c => c.id))
  if (!cardOrder.every(id => topCardIds.has(id))) {
    throw new Error("Invalid card IDs in order")
  }

  // Rearrange the top cards
  const reorderedCards = cardOrder.map(id => topCards.find(c => c.id === id)!)
  const restOfDeck = newState.drawPile.slice(topCards.length)
  newState.drawPile = [...reorderedCards, ...restOfDeck]

  // Clear pending action
  newState.pendingAction = undefined

  return newState
}

// Bury a card in the deck
export function buryCard(gameState: GameState, playerId: string, cardId: string, position: number): GameState {
  const newState = { ...gameState }

  if (!newState.pendingAction || newState.pendingAction.type !== "bury") {
    throw new Error("No bury action pending")
  }

  if (newState.pendingAction.initiatorId !== playerId) {
    throw new Error("Only the initiator can bury a card")
  }

  const player = newState.players.find((p) => p.id === playerId)
  if (!player) {
    throw new Error("Player not found")
  }

  // Find and remove card from player's hand
  const cardIndex = player.hand.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) {
    throw new Error("Card not in hand")
  }

  const card = player.hand.splice(cardIndex, 1)[0]

  // Validate position
  if (position < 0 || position > newState.drawPile.length) {
    throw new Error("Invalid position")
  }

  // Insert card at specified position
  newState.drawPile.splice(position, 0, card)

  // Clear pending action
  newState.pendingAction = undefined

  return newState
}

// End current turn and move to next player
function endTurn(gameState: GameState): void {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  currentPlayer.isCurrentTurn = false
  currentPlayer.turnsRemaining = 0

  // Move to next player
  gameState.currentPlayerIndex = getNextPlayerIndex(gameState.players, gameState.currentPlayerIndex, gameState.turnDirection)
  const nextPlayer = gameState.players[gameState.currentPlayerIndex]
  nextPlayer.isCurrentTurn = true

  // Set turns remaining if not already set (from Attack)
  if (nextPlayer.turnsRemaining === 0) {
    nextPlayer.turnsRemaining = 1
  }

  gameState.turnPhase = "playing-cards"
}

// Eliminate player
export function eliminatePlayer(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState }
  const player = newState.players.find((p) => p.id === playerId)

  if (!player) {
    throw new Error("Player not found")
  }

  player.isAlive = false
  player.hand = [] // Remove all cards

  // Check if game is over
  const gameOver = checkGameOver(newState.players)
  if (gameOver.isOver) {
    newState.gameStatus = "finished"
    newState.winner = gameOver.winner?.id
  } else {
    // If it was this player's turn, move to next player
    if (player.isCurrentTurn) {
      endTurn(newState)
    }
  }

  return newState
}

// Handle Reverse card
function handleReverse(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "reverse",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "reverse",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle Draw from Bottom card
function handleDrawFromBottom(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "draw-from-bottom",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "draw-from-bottom",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle Alter the Future card
function handleAlterTheFuture(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "alter-the-future",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "alter-the-future",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Handle Bury card
function handleBury(gameState: GameState, playerId: string, card: Card): GameState {
  const newState = { ...gameState }

  // Discard card
  newState.discardPile.push(card)

  // Create nope window with deferred action (Note: Bury requires additional UI interaction)
  newState.pendingAction = {
    type: "nope-chain",
    initiatorId: playerId,
    cardType: "bury",
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + GAME_CONFIG.NOPE_WINDOW_MS,
    deferredAction: {
      type: "bury",
      playerId,
    },
  }

  newState.turnPhase = "nope-window"

  return newState
}

// Validate if a card can be played
export function canPlayCard(gameState: GameState, playerId: string, cardType: CardType): boolean {
  const player = gameState.players.find((p) => p.id === playerId)

  if (!player || !player.isAlive || !player.isCurrentTurn) {
    return false
  }

  // Check turn phase restrictions
  if (gameState.turnPhase === "drawing") {
    return cardType === "nope"
  }

  if (gameState.turnPhase === "exploded") {
    return cardType === "defuse"
  }

  if (gameState.turnPhase === "inserting-kitten") {
    return false
  }

  if (gameState.turnPhase === "nope-window") {
    return cardType === "nope"
  }

  // Playing cards phase - most cards allowed (exclude special cards that can't be played)
  return cardType !== "exploding-kitten" && cardType !== "defuse"
}

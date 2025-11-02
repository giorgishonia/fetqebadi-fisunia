"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card as UICard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GameCard } from "@/components/game-card"
import { PlayerHand } from "@/components/player-hand"
import { OtherPlayers } from "@/components/other-players"
import { GameActions } from "@/components/game-actions"
import { NopeWindow } from "@/components/nope-window"
import { SeeFutureDisplay } from "@/components/see-future-display"
import { FavorRequestDialog } from "@/components/favor-request-dialog"
import { InsertKittenDialog } from "@/components/insert-kitten-dialog"
import { AlterFutureDialog } from "@/components/alter-future-dialog"
import { BuryDialog } from "@/components/bury-dialog"
import { CardEffect } from "@/components/card-effects"
import { ArrowLeft, Wifi, WifiOff, AlertCircle, Users } from "lucide-react"
import { useWebSocket } from "@/lib/use-websocket"
import { getTopCards } from "@/lib/game-logic"
import { useCardEffects } from "@/lib/use-card-effects"
import type { CardType } from "@/lib/types"
import Image from "next/image"

// Map card types to image filenames
const CARD_IMAGES: Record<string, string> = {
  "exploding-kitten": "/cat/exploding-kitten.png",
  defuse: "/cat/defuse.png",
  nope: "/cat/nope.png",
  attack: "/cat/attack.png",
  skip: "/cat/skip.png",
  favor: "/cat/favor.png",
  shuffle: "/cat/shuffle.png",
  "see-the-future": "/cat/see-the-future.png",
  "cat-taco": "/cat/tacocat.png",
  "cat-rainbow": "/cat/rainbow-ralphing-cat.png",
  "cat-beard": "/cat/beart-cat.png",
  "cat-melon": "/cat/cattermelon.png",
  "cat-potato": "/cat/hairy-potato-cat.png",
  reverse: "/cat/reverse.png",
  "draw-from-bottom": "/cat/draw-from-bottom.png",
  "alter-the-future": "/cat/alter-the-future.png",
  bury: "/cat/bury.png",
}

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  const { connected, gameState, error, joinRoom, playCard, drawCard, playCatCombo, insertKitten, favorResponse, playNope, rearrangeTopCards, buryCard } =
    useWebSocket(roomId)

  const [currentPlayerId, setCurrentPlayerId] = useState<string>("")
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [hasJoined, setHasJoined] = useState(false)
  const { currentEffect, triggerEffect, clearEffect } = useCardEffects()
  const [lastExplodedPlayer, setLastExplodedPlayer] = useState<string | null>(null)
  const [hasShownDefuse, setHasShownDefuse] = useState(false)
  const [lastNopeWindowAction, setLastNopeWindowAction] = useState<{
    cardType: CardType
    playerName: string
    targetName?: string
    timestamp: number
    nopeCount: number
  } | null>(null)
  const [previousPhase, setPreviousPhase] = useState<string | null>(null)

  useEffect(() => {
    const playerName = localStorage.getItem("playerName")

    if (!playerName) {
      console.log("[v0] No playerName found, redirecting to lobby")
      router.push("/lobby")
      return
    }

    if (connected && !hasJoined) {
      console.log("[v0] Game page joining room to get game state, playerName:", playerName, "roomId:", roomId)
      joinRoom(playerName)
      setHasJoined(true)
    }
  }, [connected, hasJoined, joinRoom, roomId, router])

  useEffect(() => {
    if (gameState && gameState.players.length > 0) {
      const playerName = localStorage.getItem("playerName")
      const player = gameState.players.find((p) => p.name === playerName)
      if (player) {
        setCurrentPlayerId(player.id)
      }
    }
  }, [gameState])

  // Watch for nope window phase changes and trigger animations AFTER resolution
  useEffect(() => {
    if (!gameState) return

    const currentPhase = gameState.turnPhase

    // Store action info when entering nope window
    if (currentPhase === "nope-window" && previousPhase !== "nope-window" && gameState.pendingAction) {
      const initiator = gameState.players.find((p) => p.id === gameState.pendingAction?.initiatorId)
      const target = gameState.pendingAction.targetId 
        ? gameState.players.find((p) => p.id === gameState.pendingAction?.targetId)
        : undefined

      if (initiator && gameState.pendingAction.cardType) {
        setLastNopeWindowAction({
          cardType: gameState.pendingAction.cardType,
          playerName: initiator.name,
          targetName: target?.name,
          timestamp: Date.now(),
          nopeCount: 0, // Initial nope count
        })
      }
    }

    // Update nope count while in nope window
    if (currentPhase === "nope-window" && gameState.pendingAction && lastNopeWindowAction) {
      const currentNopeCount = gameState.pendingAction.nopeChain.length
      if (currentNopeCount !== lastNopeWindowAction.nopeCount) {
        setLastNopeWindowAction({
          ...lastNopeWindowAction,
          nopeCount: currentNopeCount,
        })
      }
    }

    // Trigger animation when LEAVING nope window (action resolved)
    if (previousPhase === "nope-window" && currentPhase !== "nope-window" && lastNopeWindowAction) {
      // Odd number of nopes = action cancelled
      const wasCancelled = lastNopeWindowAction.nopeCount % 2 === 1

      // Only trigger animation if not cancelled
      if (!wasCancelled) {
        triggerEffect({
          cardType: lastNopeWindowAction.cardType,
          playerName: lastNopeWindowAction.playerName,
          targetName: lastNopeWindowAction.targetName,
        })
      }

      setLastNopeWindowAction(null)
    }

    setPreviousPhase(currentPhase)
  }, [gameState, previousPhase, lastNopeWindowAction, triggerEffect])

  // Safety check: Detect stuck nope windows
  useEffect(() => {
    if (!gameState) return

    // If we're in nope window and time has expired, log warning
    if (gameState.turnPhase === "nope-window" && gameState.pendingAction) {
      const timeRemaining = gameState.pendingAction.expiresAt - Date.now()
      
      if (timeRemaining < -1000) { // More than 1 second overdue
        console.warn('[v0] Nope window appears stuck, waiting for server to resolve...')
      }
    }
  }, [gameState])

  useEffect(() => {
    if (!gameState) return

    const explodedPlayer = gameState.players.find((p) => !p.isAlive && p.hand.length === 0)
    if (explodedPlayer && explodedPlayer.id !== lastExplodedPlayer) {
      setLastExplodedPlayer(explodedPlayer.id)
      triggerEffect({
        cardType: "exploding-kitten",
        playerName: explodedPlayer.name,
      })
    }
  }, [gameState, lastExplodedPlayer, triggerEffect])

  useEffect(() => {
    if (!gameState) return

    if (gameState.turnPhase === "inserting-kitten" && !hasShownDefuse) {
      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex]
      if (currentTurnPlayer) {
        setHasShownDefuse(true)
        triggerEffect({
          cardType: "defuse",
          playerName: currentTurnPlayer.name,
        })
      }
    } else if (gameState.turnPhase !== "inserting-kitten" && hasShownDefuse) {
      setHasShownDefuse(false)
    }
  }, [gameState, hasShownDefuse, triggerEffect])

  const handleCardClick = (cardId: string) => {
    if (!gameState) return

    const player = gameState.players.find((p) => p.id === currentPlayerId)
    if (!player?.isCurrentTurn) return

    // If clicking an already selected card, deselect it
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId))
      return
    }

    // Get the card being clicked
    const clickedCard = player.hand.find((c) => c.id === cardId)
    if (!clickedCard) return

    // Define unique action cards that can only be played solo
    const uniqueActionCards = ["nope", "defuse", "shuffle", "skip", "favor", "attack", "see-the-future", "reverse", "draw-from-bottom", "alter-the-future", "bury"]
    const isUniqueAction = uniqueActionCards.includes(clickedCard.type)

    // Define cat cards that can be played in combos
    const catCards = ["cat-taco", "cat-rainbow", "cat-beard", "cat-melon", "cat-potato"]
    const isCatCard = catCards.includes(clickedCard.type)

    // If selecting a unique action card
    if (isUniqueAction) {
      // Clear any previous selections and only select this card
      setSelectedCards([cardId])
      return
    }

    // If selecting a cat card
    if (isCatCard) {
      // If no cards selected yet, or all selected are the same cat type
      if (selectedCards.length === 0) {
        setSelectedCards([cardId])
        return
      }

      // Check if all currently selected cards are the same type of cat
      const selectedCardObjects = selectedCards
        .map((id) => player.hand.find((c) => c.id === id))
        .filter(Boolean)

      const allSameCatType = selectedCardObjects.every((c) => c && c.type === clickedCard.type)

      if (allSameCatType && selectedCards.length < 3) {
        setSelectedCards([...selectedCards, cardId])
      } else if (!allSameCatType) {
        // Different cat type - start new selection
        setSelectedCards([cardId])
      }
      // If already have 3 cards selected, don't add more (handled by length check)
      return
    }

    // For any other card type, don't allow selection
  }

  const handlePlayCard = (cardId: string, targetId?: string) => {
    try {
      playCard(currentPlayerId, cardId, targetId)
      setSelectedCards([])
    } catch (error) {
      console.error("[v0] Error playing card:", error)
    }
  }

  const handleDrawCard = () => {
    try {
      drawCard(currentPlayerId)
    } catch (error) {
      console.error("[v0] Error drawing card:", error)
    }
  }

  const handlePlayCatCombo = (targetId: string, targetCardType?: CardType) => {
    if (selectedCards.length !== 2 && selectedCards.length !== 3) return

    try {
      playCatCombo(currentPlayerId, selectedCards, targetId, targetCardType)
      setSelectedCards([])
    } catch (error) {
      console.error("[v0] Error playing cat combo:", error)
    }
  }

  const handleInsertKitten = (position: number) => {
    try {
      insertKitten(currentPlayerId, position)
    } catch (error) {
      console.error("[v0] Error inserting kitten:", error)
    }
  }

  const handleFavorResponse = (cardId: string) => {
    try {
      favorResponse(currentPlayerId, cardId)
    } catch (error) {
      console.error("[v0] Error responding to favor:", error)
    }
  }

  const handlePlayNope = (cardId: string) => {
    try {
      playNope(currentPlayerId, cardId)
    } catch (error) {
      console.error("[v0] Error playing nope:", error)
    }
  }

  const handleRearrangeTopCards = (cardOrder: string[]) => {
    try {
      rearrangeTopCards(currentPlayerId, cardOrder)
    } catch (error) {
      console.error("[v0] Error rearranging top cards:", error)
    }
  }

  const handleBuryCard = (cardId: string, position: number) => {
    try {
      buryCard(currentPlayerId, cardId, position)
    } catch (error) {
      console.error("[v0] Error burying card:", error)
    }
  }

  if (!connected) {
    return (
      <main className="fixed inset-0 flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover blur-md">
          <source src="/cat/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center space-y-6 bg-black/40 backdrop-blur-md p-12 rounded-3xl border-4 border-red-500/50">
          <Image
            src="/cat/connection-error.png"
            alt="Connection Error"
            width={300}
            height={300}
            className="mx-auto animate-pulse"
          />
          <p className="text-3xl font-bold text-white">Connection Issues...</p>
          {error && (
            <div className="flex items-center gap-3 text-red-400 justify-center">
              <AlertCircle className="w-6 h-6" />
              <p className="text-lg">{error}</p>
            </div>
          )}
          <p className="text-sm text-white/70">Trying to connect to the server...</p>
        </div>
      </main>
    )
  }

  if (!gameState) {
    return (
      <main className="fixed inset-0 flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover blur-md">
          <source src="/cat/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center space-y-6 bg-black/40 backdrop-blur-md p-12 rounded-3xl border-4 border-purple-500/50">
          <Image
            src="/cat/loading.png"
            alt="Loading"
            width={250}
            height={250}
            className="mx-auto animate-pulse"
          />
          <p className="text-3xl font-bold text-white">Loading Game...</p>
          <div className="w-48 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{width: '60%'}} />
          </div>
          <p className="text-sm text-white/70">Waiting for game to start...</p>
        </div>
      </main>
    )
  }

  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId)
  const isMyTurn = currentPlayer?.isCurrentTurn || false
  const turnPlayer = gameState.players[gameState.currentPlayerIndex]

  if (gameState.gameStatus === "finished") {
    const winner = gameState.players.find((p) => p.id === gameState.winner)
    const isWinner = winner?.id === currentPlayerId
    
    return (
      <main className="fixed inset-0 flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover blur-md">
          <source src="/cat/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        
        {isWinner ? (
          <UICard className="relative z-10 p-12 max-w-2xl w-full text-center space-y-8 bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-red-900/90 backdrop-blur-md border-8 border-yellow-400 shadow-2xl">
            <Image
              src="/cat/victory.png"
              alt="Victory!"
              width={350}
              height={350}
              className="mx-auto"
            />
            <div className="space-y-4">
              <h1 className="text-7xl font-black text-yellow-400 animate-bounce">VICTORY!</h1>
              <p className="text-4xl font-bold text-white">🎉 You Won! 🎉</p>
              <p className="text-2xl text-yellow-200">You survived the exploding kittens!</p>
            </div>
            <Button size="lg" className="w-full h-16 text-2xl font-bold bg-yellow-500 hover:bg-yellow-600" onClick={() => router.push("/lobby")}>
              Back to Lobby
            </Button>
          </UICard>
        ) : (
          <UICard className="relative z-10 p-12 max-w-2xl w-full text-center space-y-8 bg-gradient-to-br from-gray-900/90 via-purple-900/90 to-blue-900/90 backdrop-blur-md border-8 border-purple-500 shadow-2xl">
            <Image
              src="/cat/lose.png"
              alt="Defeat"
              width={350}
              height={350}
              className="mx-auto"
            />
            <div className="space-y-4">
              <h1 className="text-7xl font-black text-purple-400">GAME OVER</h1>
              <p className="text-4xl font-bold text-white">{winner?.name} won!</p>
              <p className="text-2xl text-purple-200">Better luck next time!</p>
            </div>
            <Button size="lg" className="w-full h-16 text-2xl font-bold" onClick={() => router.push("/lobby")}>
              Back to Lobby
            </Button>
          </UICard>
        )}
      </main>
    )
  }

  const topCards =
    ((gameState.pendingAction?.type === "see-future" || gameState.pendingAction?.type === "alter-future") &&
      gameState.pendingAction.initiatorId === currentPlayerId)
      ? getTopCards(gameState)
      : null

  return (
    <main className={`fixed inset-0 overflow-hidden ${gameState.turnPhase === "exploded" && currentPlayer?.id === currentPlayerId ? "animate-explosion-shake" : ""}`}>
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover blur-sm">
        <source src="/cat/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      
      {/* Danger Effect when player draws exploding kitten */}
      {gameState.turnPhase === "exploded" && currentPlayer?.id === currentPlayerId && (
        <>
          {/* Pulsing red border overlay */}
          <div className="absolute inset-0 pointer-events-none z-[100] animate-pulse">
            <div className="absolute inset-0 border-[16px] border-red-600 rounded-none shadow-[inset_0_0_100px_rgba(220,38,38,0.8)]" />
          </div>
          {/* Danger stripes in corners */}
          <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none z-[100]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 via-yellow-500/50 to-transparent animate-pulse" 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none z-[100]">
            <div className="absolute inset-0 bg-gradient-to-bl from-red-600/80 via-yellow-500/50 to-transparent animate-pulse" 
                 style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
          </div>
          <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none z-[100]">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/80 via-yellow-500/50 to-transparent animate-pulse" 
                 style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
          </div>
          <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none z-[100]">
            <div className="absolute inset-0 bg-gradient-to-tl from-red-600/80 via-yellow-500/50 to-transparent animate-pulse" 
                 style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />
          </div>
          {/* Warning text */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-[101] animate-bounce">
            <div className="bg-red-600 text-white px-8 py-3 rounded-lg text-2xl font-black border-4 border-yellow-400 shadow-2xl">
              ⚠️ EXPLODING KITTEN! ⚠️
            </div>
          </div>
        </>
      )}


      {/* Card effects overlay */}
      {currentEffect && (
        <CardEffect
          cardType={currentEffect.cardType}
          playerName={currentEffect.playerName}
          targetName={currentEffect.targetName}
          onComplete={clearEffect}
        />
      )}

      {/* Main Game Container - Fixed Layout */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar - Fixed */}
        <div className="flex-shrink-0 bg-black/50 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-[2000px] mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/lobby")}
                className="bg-white/10 hover:bg-white/20 border border-white/30 w-8 h-8 sm:w-10 sm:h-10"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </Button>
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 hidden sm:block" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap justify-end">
              <Badge variant={isMyTurn ? "default" : "outline"} className="text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-5 py-1 sm:py-2 font-bold">
                {isMyTurn ? "YOUR TURN" : `${turnPlayer.name}`}
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-5 py-1 sm:py-2 font-bold">
                {gameState.drawPile.length}
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-5 py-1 sm:py-2 font-bold hidden sm:flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                {gameState.players.filter((p) => p.isAlive).length}
              </Badge>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 mx-3 sm:mx-4 lg:mx-6 mt-2 sm:mt-3 lg:mt-4 p-3 sm:p-4 bg-red-900/90 backdrop-blur-md rounded-xl border border-red-500">
            <div className="flex items-center gap-2 sm:gap-3 text-red-100">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <p className="font-bold text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Game Area - Flex */}
        <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-4 lg:p-6 gap-3 sm:gap-6 lg:gap-8 max-w-[2000px] mx-auto w-full">
          {/* Top: Other Players - Fixed Height */}
          <div className="flex-shrink-0">
            <OtherPlayers
              players={gameState.players.filter((p) => p.id !== currentPlayerId)}
              currentPlayerId={currentPlayerId}
              turnPlayerId={turnPlayer.id}
            />
          </div>

          {/* Middle: Game Board - Fixed Height with enhanced styling */}
          <div className="flex-shrink-0 flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 py-2 sm:py-4 lg:py-6">
            {/* Draw Pile - Enhanced & Mobile Responsive */}
            <button
              onClick={handleDrawCard}
              disabled={!isMyTurn || gameState.turnPhase !== "playing-cards"}
              className="relative group"
            >
              {/* Glow effect when it's your turn */}
              {isMyTurn && gameState.turnPhase === "playing-cards" && (
                <div className="absolute inset-0 -m-2 sm:-m-3 bg-gradient-to-t from-green-500/30 via-blue-500/30 to-purple-500/30 blur-xl sm:blur-2xl animate-pulse rounded-xl sm:rounded-2xl" />
              )}
              
              <div className="relative w-24 h-32 sm:w-32 sm:h-44 lg:w-40 lg:h-56 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:rotate-1 sm:hover:rotate-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-3 lg:border-4 border-white/30">
                <Image
                  src="/cat/backside.png"
                  alt="Card back"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
                {/* Enhanced overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent rounded-lg backdrop-blur-[2px]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl sm:text-4xl lg:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mb-1 sm:mb-2">
                      {gameState.drawPile.length}
                    </p>
                    <p className="text-[8px] sm:text-xs lg:text-sm font-black text-white/90 tracking-wider bg-black/40 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 rounded-full">
                      DRAW
                    </p>
                  </div>
                </div>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 group-hover:via-white/20 transition-all duration-500 rounded-lg" />
              </div>
              
              {/* Animated indicator when it's your turn */}
              {isMyTurn && gameState.turnPhase === "playing-cards" && (
                <div className="absolute -top-2 sm:-top-3 lg:-top-4 -right-2 sm:-right-3 lg:-right-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce shadow-xl sm:shadow-2xl border-2 border-white flex items-center justify-center text-base sm:text-xl lg:text-2xl">
                  👆
                </div>
              )}
            </button>

            {/* Portal overlays - these don't affect layout */}
            {gameState.turnPhase === "inserting-kitten" && isMyTurn && (
              <InsertKittenDialog
                drawPileSize={gameState.drawPile.length}
                onInsert={handleInsertKitten}
              />
            )}
            {gameState.turnPhase === "nope-window" && gameState.pendingAction && (
              <NopeWindow
                pendingAction={gameState.pendingAction}
                players={gameState.players}
                currentPlayerId={currentPlayerId}
                onPlayNope={handlePlayNope}
              />
            )}

            {topCards && gameState.pendingAction?.type === "see-future" && <SeeFutureDisplay cards={topCards} />}

            {gameState.pendingAction?.type === "favor-request" && 
             gameState.turnPhase !== "nope-window" && 
             gameState.turnPhase !== "inserting-kitten" && (
              <FavorRequestDialog
                initiator={gameState.players.find((p) => p.id === gameState.pendingAction?.initiatorId)}
                targetPlayer={gameState.players.find((p) => p.id === gameState.pendingAction?.targetId)}
                currentPlayerId={currentPlayerId}
                onSelectCard={handleFavorResponse}
              />
            )}

            {gameState.pendingAction?.type === "alter-future" &&
             gameState.pendingAction.initiatorId === currentPlayerId &&
             topCards && 
             gameState.turnPhase !== "nope-window" && (
              <AlterFutureDialog
                cards={topCards}
                onConfirm={handleRearrangeTopCards}
              />
            )}

            {gameState.pendingAction?.type === "bury" &&
             gameState.pendingAction.initiatorId === currentPlayerId &&
             gameState.turnPhase !== "nope-window" &&
             currentPlayer && (
              <BuryDialog
                hand={currentPlayer.hand}
                deckSize={gameState.drawPile.length}
                onConfirm={handleBuryCard}
                onCancel={() => {
                  // If user cancels, we might need to handle this differently
                  // For now, we can just let them choose
                }}
              />
            )}

            {selectedCards.length > 0 && (isMyTurn || gameState.turnPhase === "exploded") && (
              <GameActions
                selectedCards={selectedCards}
                gameState={gameState}
                currentPlayerId={currentPlayerId}
                onPlayCard={handlePlayCard}
                onPlayCatCombo={handlePlayCatCombo}
                onCancel={() => setSelectedCards([])}
              />
            )}

            {/* Discard Pile - Enhanced & Mobile Responsive */}
            <div className="relative w-24 h-32 sm:w-32 sm:h-44 lg:w-40 lg:h-56 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 sm:border-3 lg:border-4 border-white/30 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md flex items-center justify-center shadow-xl sm:shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300">
              {gameState.discardPile.length > 0 ? (
                <>
                  {/* Glow effect for active discard */}
                  <div className="absolute inset-0 -m-2 sm:-m-3 bg-gradient-to-t from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-lg sm:blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-full h-full relative">
                    <Image
                      src={CARD_IMAGES[gameState.discardPile[gameState.discardPile.length - 1].type] || "/cat/backside.png"}
                      alt={gameState.discardPile[gameState.discardPile.length - 1].type}
                      fill
                      className="object-cover rounded-lg"
                      priority
                    />
                  </div>
                  
                  {/* Card count badge */}
                  <div className="absolute -bottom-1 sm:-bottom-1.5 lg:-bottom-2 -right-1 sm:-right-1.5 lg:-right-2 bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black text-[10px] sm:text-xs lg:text-sm px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-0.5 lg:py-1 rounded-full shadow-lg border border-white/50 sm:border-2">
                    {gameState.discardPile.length}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-5xl opacity-20 mb-1 sm:mb-2">🗑️</div>
                  <p className="text-[8px] sm:text-xs lg:text-sm text-white/60 font-black tracking-wider">DISCARD</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Player Hand - Fixed Height */}
          <div className="flex-shrink-0">
            {currentPlayer && (
              <PlayerHand
                cards={currentPlayer.hand}
                selectedCards={selectedCards}
                onCardClick={handleCardClick}
                onPlayCard={handlePlayCard}
                isMyTurn={isMyTurn}
                turnPhase={gameState.turnPhase}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
